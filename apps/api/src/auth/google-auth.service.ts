import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleAuthService {
  private client = new OAuth2Client();
  private audiences = (process.env.GOOGLE_OAUTH_AUDIENCES ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async verifyIdToken(idToken: string): Promise<TokenPayload> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.audiences,
      });

      const payload = ticket.getPayload();

      if (!payload?.email || !payload?.sub) {
        throw new UnauthorizedException('Invalid Google token');
      }

      if (payload.email_verified === false) {
        throw new UnauthorizedException('Email not verified');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedException('Google token verification failed');
    }
  }

  async exchangeIdToken(idToken: string) {
    const googlePayload = await this.verifyIdToken(idToken);

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email: googlePayload.email! },
      include: { profile: true },
    });

    if (!user) {
      // Create new user
      user = await this.prisma.user.create({
        data: {
          email: googlePayload.email!,
          profile: {
            create: {
              displayName: googlePayload.name || googlePayload.email!.split('@')[0],
              timezone: 'Europe/Istanbul',
            },
          },
          subscription: {
            create: {
              plan: 'free',
              status: 'active',
            },
          },
          usageQuota: {
            create: {
              monthKey: new Date().toISOString().slice(0, 7),
              aiRequests: 0,
              limit: 100,
              resetsAt: new Date(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                1,
              ),
            },
          },
        },
        include: { profile: true },
      });
    }

    // Create or update OAuth account
    await this.prisma.oAuthAccount.upsert({
      where: {
        provider_providerUserId: {
          provider: 'google',
          providerUserId: googlePayload.sub!,
        },
      },
      update: {
        email: googlePayload.email!,
        rawJson: googlePayload as any,
      },
      create: {
        userId: user.id,
        provider: 'google',
        providerUserId: googlePayload.sub!,
        email: googlePayload.email!,
        rawJson: googlePayload as any,
      },
    });

    return this.authService.login(user);
  }
}
