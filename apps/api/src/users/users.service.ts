import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async isUsernameAvailable(username: string): Promise<boolean> {
    const normalizedUsername = username.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { username: normalizedUsername },
    });
    return !user;
  }

  async getUserWithProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        subscription: true,
        usageQuota: true,
      },
    });

    if (!user) {
      return null;
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  async updateProfile(userId: string, data: any) {
    const updateData: any = {};

    // Update name fields and regenerate displayName
    if (data.firstName || data.lastName) {
      const currentProfile = await this.prisma.profile.findUnique({
        where: { userId },
      });

      if (!currentProfile) {
        throw new BadRequestException('Profile not found');
      }

      const firstName = data.firstName || currentProfile.firstName;
      const lastName = data.lastName || currentProfile.lastName;

      updateData.firstName = firstName;
      updateData.lastName = lastName;
      updateData.displayName = `${firstName} ${lastName}`;
    }

    // Physical attributes
    if (data.heightCm) updateData.heightCm = data.heightCm;
    if (data.weightKg) updateData.weightKg = data.weightKg;

    // Location and preferences
    if (data.timezone) updateData.timezone = data.timezone;
    if (data.country) updateData.country = data.country;
    if (data.profilePictureUrl !== undefined) updateData.profilePictureUrl = data.profilePictureUrl;
    if (data.preferencesJson) updateData.preferencesJson = data.preferencesJson;

    // Handle date of birth
    if (data.dateOfBirth) {
      updateData.dateOfBirth = new Date(data.dateOfBirth);
    }

    // Update profile
    await this.prisma.profile.update({
      where: { userId },
      data: updateData,
    });

    return this.getUserWithProfile(userId);
  }

  async updateUsername(userId: string, newUsername: string) {
    const normalizedUsername = newUsername.toLowerCase();

    // Validate format
    if (!/^[a-z0-9._]+$/.test(normalizedUsername)) {
      throw new BadRequestException(
        'Username can only contain lowercase letters, numbers, dots, and underscores',
      );
    }

    if (normalizedUsername.length < 3 || normalizedUsername.length > 24) {
      throw new BadRequestException('Username must be between 3 and 24 characters');
    }

    // Check availability
    const existing = await this.prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (existing && existing.id !== userId) {
      throw new ConflictException('Username already taken');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { username: normalizedUsername },
    });

    return this.getUserWithProfile(userId);
  }

  // Admin methods
  async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: {
          profile: true,
          subscription: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count(),
    ]);

    // Remove passwords from response
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    return {
      data: usersWithoutPasswords,
      total,
      page,
      limit,
    };
  }

  async getUserById(userId: string) {
    return this.getUserWithProfile(userId);
  }

  async updateUser(userId: string, data: any) {
    const updateData: any = {};

    // Check for email uniqueness if email is being updated
    if (data.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Bu e-posta adresi zaten kullanılıyor');
      }

      updateData.email = data.email;
    }

    if (data.status) updateData.status = data.status;
    if (data.password) {
      const bcrypt = require('bcrypt');
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return this.getUserWithProfile(userId);
  }

  async deleteUser(userId: string) {
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { success: true };
  }

  async exportUserData(userId: string) {
    // Gather all user data for export (KVKK Article 11 compliance)
    const [
      user,
      healthMetrics,
      waterLogs,
      cycles,
      pregnancy,
      reminders,
      conversations,
      messages,
      memories,
      usageQuota,
    ] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          subscription: true,
        },
      }),
      this.prisma.healthMetric.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.waterLog.findMany({
        where: { userId },
        orderBy: { loggedAt: 'desc' },
      }),
      this.prisma.periodCycle.findMany({
        where: { userId },
        orderBy: { startDate: 'desc' },
      }),
      this.prisma.pregnancy.findMany({
        where: { userId },
        orderBy: { dueDate: 'desc' },
      }),
      this.prisma.reminder.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.conversation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.message.findMany({
        where: { conversation: { userId } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.memory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.usageQuota.findUnique({
        where: { userId },
      }),
    ]);

    if (!user) {
      throw new BadRequestException('Kullanıcı bulunamadı');
    }

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;

    return {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      user: userWithoutPassword,
      healthMetrics,
      waterLogs,
      cycles,
      pregnancy,
      reminders,
      conversations,
      messages,
      memories,
      usageQuota,
    };
  }
}
