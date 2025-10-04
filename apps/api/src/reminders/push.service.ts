import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ExpoPushMessage {
  to: string;
  sound?: 'default';
  title: string;
  body: string;
  data?: any;
  badge?: number;
}

export interface PushReceipt {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: any;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly expoEndpoint = 'https://exp.host/--/api/v2/push/send';
  private readonly accessToken = process.env.EXPO_ACCESS_TOKEN;

  constructor(private prisma: PrismaService) {}

  /**
   * Send push notification via Expo Push API
   */
  async sendPush(
    userId: string,
    message: ExpoPushMessage,
  ): Promise<PushReceipt> {
    // Get user's push token
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user?.profile) {
      this.logger.warn(`No profile found for user ${userId}`);
      return { status: 'error', message: 'User profile not found' };
    }

    const pushToken = (user.profile.preferencesJson as any)?.pushToken;

    if (!pushToken) {
      this.logger.warn(`No push token for user ${userId}`);
      return { status: 'error', message: 'No push token registered' };
    }

    // Check quiet hours
    const quietHours = (user.profile.preferencesJson as any)?.quietHours;
    const timezone = user.profile.timezone || 'Europe/Istanbul';

    if (
      quietHours?.enabled &&
      !this.shouldSendNow(quietHours, timezone)
    ) {
      this.logger.debug(`Skipping push for user ${userId} - quiet hours`);
      return { status: 'error', message: 'Quiet hours active' };
    }

    try {
      const response = await fetch(this.expoEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          ...(this.accessToken && {
            Authorization: `Bearer ${this.accessToken}`,
          }),
        },
        body: JSON.stringify({
          to: pushToken,
          sound: message.sound || 'default',
          title: message.title,
          body: message.body,
          data: message.data,
          badge: message.badge,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        this.logger.error(`Expo push failed: ${JSON.stringify(result)}`);
        return {
          status: 'error',
          message: result.errors?.[0]?.message || 'Push failed',
          details: result,
        };
      }

      const receipt = result.data?.[0];

      if (receipt?.status === 'ok') {
        this.logger.log(`Push sent to user ${userId}: ${receipt.id}`);
        return { status: 'ok', id: receipt.id };
      } else {
        this.logger.error(
          `Push error for user ${userId}: ${receipt?.message}`,
        );
        return {
          status: 'error',
          message: receipt?.message || 'Unknown error',
          details: receipt?.details,
        };
      }
    } catch (error: any) {
      this.logger.error(`Failed to send push: ${error.message}`);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Send push with retry logic
   */
  async sendPushWithRetry(
    userId: string,
    message: ExpoPushMessage,
    maxRetries = 3,
  ): Promise<PushReceipt> {
    let lastError: PushReceipt | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await this.sendPush(userId, message);

      if (result.status === 'ok') {
        return result;
      }

      lastError = result;

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return lastError || { status: 'error', message: 'All retries failed' };
  }

  /**
   * Batch send pushes
   */
  async sendBatchPushes(
    pushes: Array<{ userId: string; message: ExpoPushMessage }>,
  ): Promise<PushReceipt[]> {
    const results = await Promise.all(
      pushes.map((p) => this.sendPush(p.userId, p.message)),
    );

    return results;
  }

  /**
   * Register push token for user
   */
  async registerPushToken(userId: string, pushToken: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    const preferencesJson = {
      ...(profile.preferencesJson as any),
      pushToken,
      pushTokenUpdatedAt: new Date().toISOString(),
    };

    await this.prisma.profile.update({
      where: { userId },
      data: { preferencesJson: preferencesJson as any },
    });

    return { success: true };
  }

  /**
   * Check if push should be sent based on quiet hours
   */
  private shouldSendNow(
    quietHours: { enabled: boolean; startHour: number; endHour: number },
    timezone: string,
  ): boolean {
    const now = new Date();
    const hour = Number(
      new Intl.DateTimeFormat('tr-TR', {
        hour: 'numeric',
        hour12: false,
        timeZone: timezone,
      }).format(now),
    );

    // Overnight window (e.g., 22:00 - 08:00)
    if (quietHours.startHour > quietHours.endHour) {
      return !(hour >= quietHours.startHour || hour < quietHours.endHour);
    }

    // Regular window
    return !(hour >= quietHours.startHour && hour < quietHours.endHour);
  }
}
