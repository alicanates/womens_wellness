import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { hash, compare } from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user || !user.password) {
      return null;
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
      return null;
    }

    return user;
  }

  async register(email: string, password: string, displayName?: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await hash(
      password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
    );

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        profile: {
          create: {
            displayName: displayName || email.split('@')[0],
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

    return this.login(user);
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: `${this.configService.get<number>('ACCESS_TOKEN_TTL_MIN') || 15}m`,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: `${this.configService.get<number>('REFRESH_TOKEN_TTL_DAYS') || 30}d`,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { profile: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
