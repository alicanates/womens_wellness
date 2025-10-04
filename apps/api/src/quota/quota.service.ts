import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuotaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get current month key (YYYY-MM format)
   */
  private getCurrentMonthKey(): string {
    return new Date().toISOString().slice(0, 7);
  }

  /**
   * Get or create quota record for user in current month
   */
  async getOrCreateQuota(userId: string) {
    const monthKey = this.getCurrentMonthKey();

    // Try to find existing quota
    let quota = await this.prisma.usageQuota.findUnique({
      where: {
        userId_monthKey: {
          userId,
          monthKey,
        },
      },
    });

    // If not found, create it
    if (!quota) {
      // Get user's subscription to determine limit
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });

      const plan = user?.subscription?.plan || 'free';
      const limit = plan === 'premium' ? 1000 : 100;

      quota = await this.prisma.usageQuota.create({
        data: {
          userId,
          monthKey,
          aiRequests: 0,
          limit,
          resetsAt: this.getNextMonthStart(),
        },
      });
    }

    return quota;
  }

  /**
   * Get next month start date
   */
  private getNextMonthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  /**
   * Check if user has quota available
   */
  async hasQuota(userId: string): Promise<boolean> {
    const quota = await this.getOrCreateQuota(userId);
    return quota.aiRequests < quota.limit;
  }

  /**
   * Check quota and throw if exceeded
   */
  async checkQuota(userId: string) {
    const hasQuota = await this.hasQuota(userId);
    if (!hasQuota) {
      throw new ForbiddenException({
        code: 'QUOTA_EXCEEDED',
        message: 'Aylık mesaj limitinize ulaştınız.',
        messageEn: 'Monthly message quota exceeded.',
      });
    }
  }

  /**
   * Increment AI request counter
   */
  async increment(userId: string) {
    const monthKey = this.getCurrentMonthKey();

    await this.prisma.usageQuota.update({
      where: {
        userId_monthKey: {
          userId,
          monthKey,
        },
      },
      data: {
        aiRequests: {
          increment: 1,
        },
      },
    });
  }

  /**
   * Get current quota status for user
   */
  async getStatus(userId: string) {
    const quota = await this.getOrCreateQuota(userId);

    return {
      used: quota.aiRequests,
      limit: quota.limit,
      remaining: Math.max(0, quota.limit - quota.aiRequests),
      resetsAt: quota.resetsAt,
      monthKey: quota.monthKey,
      percentage: Math.round((quota.aiRequests / quota.limit) * 100),
    };
  }

  /**
   * Reset quota for a user (admin function)
   */
  async reset(userId: string) {
    const monthKey = this.getCurrentMonthKey();

    return this.prisma.usageQuota.update({
      where: {
        userId_monthKey: {
          userId,
          monthKey,
        },
      },
      data: {
        aiRequests: 0,
      },
    });
  }

  /**
   * Reset all quotas for new month (scheduled job)
   */
  async resetAll() {
    const currentMonthKey = this.getCurrentMonthKey();

    // Delete old quota records (keep only current month)
    await this.prisma.usageQuota.deleteMany({
      where: {
        monthKey: {
          not: currentMonthKey,
        },
      },
    });

    return { status: 'ok', message: 'All quotas reset for new month' };
  }

  /**
   * Update user's quota limit (when plan changes)
   */
  async updateLimit(userId: string, newLimit: number) {
    const monthKey = this.getCurrentMonthKey();

    return this.prisma.usageQuota.update({
      where: {
        userId_monthKey: {
          userId,
          monthKey,
        },
      },
      data: {
        limit: newLimit,
      },
    });
  }

  /**
   * List all quotas (admin function)
   */
  async findAll(params?: { page?: number; limit?: number }) {
    const { page = 1, limit = 50 } = params || {};
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.usageQuota.findMany({
        skip,
        take: limit,
        orderBy: { resetsAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.usageQuota.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
