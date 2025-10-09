import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { hash, compare } from 'bcryptjs';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async isEmailAvailable(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return !user;
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const normalizedUsername = username.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { username: normalizedUsername },
    });
    return !user;
  }

  /**
   * Validates user credentials
   * @param identifier - Can be either email or username
   * @param password - User's password
   */
  async validateUser(identifier: string, password: string) {
    // Determine if identifier is email or username
    const isEmail = identifier.includes('@');

    let user;
    if (isEmail) {
      user = await this.prisma.user.findUnique({
        where: { email: identifier.toLowerCase() },
        include: { profile: true },
      });
    } else {
      user = await this.prisma.user.findUnique({
        where: { username: identifier.toLowerCase() },
        include: { profile: true },
      });
    }

    if (!user || !user.password) {
      return null;
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
      return null;
    }

    return user;
  }

  async register(
    email: string,
    password: string,
    username: string,
    firstName: string,
    lastName: string,
    dateOfBirth?: Date,
  ) {
    // Normalize inputs
    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase();

    // Validate username format (alphanumeric, dots, underscores only)
    if (!/^[a-z0-9._]+$/.test(normalizedUsername)) {
      throw new BadRequestException(
        'Username can only contain lowercase letters, numbers, dots, and underscores',
      );
    }

    if (normalizedUsername.length < 3 || normalizedUsername.length > 24) {
      throw new BadRequestException('Username must be between 3 and 24 characters');
    }

    // Check if email already exists
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingEmail) {
      throw new UnauthorizedException('Email already exists');
    }

    // Check if username already exists
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (existingUsername) {
      throw new UnauthorizedException('Username already taken');
    }

    const hashedPassword = await hash(
      password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
    );

    const displayName = `${firstName} ${lastName}`;

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        username: normalizedUsername,
        password: hashedPassword,
        profile: {
          create: {
            firstName,
            lastName,
            displayName,
            dateOfBirth,
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

  async requestPasswordReset(email: string): Promise<string> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    // But only create token if user exists
    if (!user) {
      return 'success';
    }

    // Generate secure random token
    const token = randomBytes(32).toString('hex');

    // Delete any existing unused tokens for this email
    await this.prisma.passwordResetToken.deleteMany({
      where: {
        email,
        used: false,
      },
    });

    // Create new reset token (expires in 1 hour)
    await this.prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    return token;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find the token
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      throw new BadRequestException('Geçersiz veya süresi dolmuş token');
    }

    if (resetToken.used) {
      throw new BadRequestException('Bu token zaten kullanılmış');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new BadRequestException('Token süresi dolmuş');
    }

    // Find the user
    const user = await this.prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      throw new BadRequestException('Kullanıcı bulunamadı');
    }

    // Hash new password
    const hashedPassword = await hash(
      newPassword,
      parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
    );

    // Update password and mark token as used
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);
  }

  async verifyResetToken(token: string): Promise<boolean> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.used || new Date() > resetToken.expiresAt) {
      return false;
    }

    return true;
  }
}
