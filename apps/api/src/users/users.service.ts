import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async isUsernameAvailable(username: string): Promise<boolean> {
    const profile = await this.prisma.profile.findUnique({
      where: { username: username.toLowerCase() },
    });

    return !profile;
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

    if (data.displayName) updateData.displayName = data.displayName;
    if (data.username !== undefined) {
      // Check if username is available (if changing)
      if (data.username) {
        const existing = await this.prisma.profile.findUnique({
          where: { username: data.username.toLowerCase() },
        });
        if (existing && existing.userId !== userId) {
          throw new ConflictException('Bu kullanıcı adı zaten kullanılıyor');
        }
        updateData.username = data.username.toLowerCase();
      } else {
        updateData.username = null;
      }
    }
    if (data.heightCm) updateData.heightCm = data.heightCm;
    if (data.weightKg) updateData.weightKg = data.weightKg;
    if (data.timezone) updateData.timezone = data.timezone;
    if (data.profilePictureUrl !== undefined) updateData.profilePictureUrl = data.profilePictureUrl;
    if (data.preferencesJson) updateData.preferencesJson = data.preferencesJson;

    // Handle birth date - support both old format (birthDate) and new format (birthDay/birthMonth/birthYear)
    if (data.birthDate) {
      const date = new Date(data.birthDate);
      updateData.birthDate = date;
      updateData.birthDay = date.getDate();
      updateData.birthMonth = date.getMonth() + 1;
      updateData.birthYear = date.getFullYear();
    } else if (data.birthDay !== undefined || data.birthMonth !== undefined || data.birthYear !== undefined) {
      if (data.birthDay !== undefined) updateData.birthDay = data.birthDay;
      if (data.birthMonth !== undefined) updateData.birthMonth = data.birthMonth;
      if (data.birthYear !== undefined) updateData.birthYear = data.birthYear;

      // Also update birthDate for backward compatibility if all fields are provided
      if (data.birthDay && data.birthMonth && data.birthYear) {
        updateData.birthDate = new Date(data.birthYear, data.birthMonth - 1, data.birthDay);
      }
    }

    const profile = await this.prisma.profile.update({
      where: { userId },
      data: updateData,
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
