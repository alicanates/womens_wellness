import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) { }

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

    // Remove password and pinHash from response
    const { password, pinHash, ...userWithoutSensitive } = user;

    return userWithoutSensitive;
  }

  async updateProfile(userId: string, data: any) {
    const updateData: any = {};
    const userUpdateData: any = {};

    // Get current profile to merge with updates
    const currentProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!currentProfile) {
      throw new BadRequestException('Profile not found');
    }

    // Update name fields and regenerate displayName
    if (data.firstName !== undefined || data.lastName !== undefined) {
      const firstName = data.firstName !== undefined ? data.firstName : currentProfile.firstName;
      const lastName = data.lastName !== undefined ? data.lastName : currentProfile.lastName;

      updateData.firstName = firstName;
      updateData.lastName = lastName;
      updateData.displayName = `${firstName} ${lastName}`.trim();
    }

    // Physical attributes
    if (data.heightCm !== undefined) updateData.heightCm = data.heightCm;
    if (data.weightKg !== undefined) updateData.weightKg = data.weightKg;

    // Location and preferences
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.profilePictureUrl !== undefined) updateData.profilePictureUrl = data.profilePictureUrl;
    if (data.preferencesJson !== undefined) updateData.preferencesJson = data.preferencesJson;

    // Handle date of birth
    if (data.dateOfBirth !== undefined) {
      updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    }

    // Update email in user table if provided
    if (data.email !== undefined) {
      userUpdateData.email = data.email;
    }

    // Update profile
    if (Object.keys(updateData).length > 0) {
      await this.prisma.profile.update({
        where: { userId },
        data: updateData,
      });
    }

    // Update user email if provided
    if (Object.keys(userUpdateData).length > 0) {
      await this.prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      });
    }

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
          _count: {
            select: {
              periodCycles: true,
              dailyLogs: true,
              waterLogs: true,
              reminders: true,
              conversations: true,
              questions: true,
              answers: true,
              articleInteractions: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.user.count(),
    ]);

    // Remove passwords and pinHash from response
    const usersWithoutSensitive = users.map(({ password, pinHash, ...user }) => user);

    return {
      data: usersWithoutSensitive,
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
    const profileData: any = {};

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

    // Check for username uniqueness if username is being updated
    if (data.username !== undefined && data.username !== null && data.username !== '') {
      const normalizedUsername = data.username.toLowerCase();

      // Validate username format
      if (!/^[a-z0-9._]+$/.test(normalizedUsername)) {
        throw new BadRequestException('Kullanıcı adı sadece küçük harf, rakam, nokta ve alt çizgi içerebilir');
      }

      if (normalizedUsername.length < 3 || normalizedUsername.length > 24) {
        throw new BadRequestException('Kullanıcı adı 3-24 karakter arasında olmalıdır');
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { username: normalizedUsername },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Bu kullanıcı adı zaten kullanılıyor');
      }

      updateData.username = normalizedUsername;
    }

    // User fields
    if (data.status) updateData.status = data.status;
    if (data.isAdmin !== undefined) updateData.isAdmin = data.isAdmin;
    if (data.pinEnabled !== undefined) {
      updateData.pinEnabled = data.pinEnabled;
      // If disabling PIN, also clear the PIN hash
      if (data.pinEnabled === false) {
        updateData.pinHash = null;
      }
    }

    // Handle password change (admin can set new password)
    if (data.newPassword) {
      // Validate password
      if (data.newPassword.length < 6) {
        throw new BadRequestException('Şifre en az 6 karakter olmalıdır');
      }

      // Check if passwords match (if confirmPassword is provided)
      if (data.confirmPassword && data.newPassword !== data.confirmPassword) {
        throw new BadRequestException('Şifreler eşleşmiyor');
      }

      const bcrypt = require('bcrypt');
      updateData.password = await bcrypt.hash(data.newPassword, 10);
    }

    // Profile fields
    if (data.profile) {
      if (data.profile.firstName !== undefined) profileData.firstName = data.profile.firstName;
      if (data.profile.lastName !== undefined) profileData.lastName = data.profile.lastName;
      if (data.profile.displayName !== undefined) profileData.displayName = data.profile.displayName;
      if (data.profile.dateOfBirth !== undefined) profileData.dateOfBirth = data.profile.dateOfBirth ? new Date(data.profile.dateOfBirth) : null;
      if (data.profile.heightCm !== undefined) profileData.heightCm = data.profile.heightCm;
      if (data.profile.weightKg !== undefined) profileData.weightKg = data.profile.weightKg;
      if (data.profile.country !== undefined) profileData.country = data.profile.country;
      if (data.profile.timezone !== undefined) profileData.timezone = data.profile.timezone;
    }

    // Update user and profile in a transaction
    await this.prisma.$transaction(async (tx) => {
      // Update user fields
      if (Object.keys(updateData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: updateData,
        });
      }

      // Update or create profile
      if (Object.keys(profileData).length > 0) {
        await tx.profile.upsert({
          where: { userId },
          update: profileData,
          create: {
            userId,
            ...profileData,
          },
        });
      }
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
    const { password, pinHash, ...userWithoutSensitive } = user;

    return {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      user: userWithoutSensitive,
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

  // PIN Management
  async setupPin(userId: string, pin: string) {
    // Validate PIN (4-6 digits)
    if (!/^\d{4,6}$/.test(pin)) {
      throw new BadRequestException('PIN must be 4-6 digits');
    }

    const bcrypt = require('bcrypt');
    const pinHash = await bcrypt.hash(pin, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        pinHash,
        pinEnabled: true,
      },
    });

    return { success: true, message: 'PIN başarıyla oluşturuldu' };
  }

  async verifyPin(userId: string, pin: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pinHash: true, pinEnabled: true },
    });

    if (!user || !user.pinEnabled || !user.pinHash) {
      throw new BadRequestException('PIN ayarlanmamış');
    }

    const bcrypt = require('bcrypt');
    const isValid = await bcrypt.compare(pin, user.pinHash);

    if (!isValid) {
      throw new BadRequestException('Yanlış PIN');
    }

    return { success: true, message: 'PIN doğrulandı' };
  }

  async disablePin(userId: string, pin: string) {
    // Verify PIN before disabling
    await this.verifyPin(userId, pin);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        pinHash: null,
        pinEnabled: false,
      },
    });

    return { success: true, message: 'PIN devre dışı bırakıldı' };
  }

  async changePin(userId: string, oldPin: string, newPin: string) {
    // Verify old PIN
    await this.verifyPin(userId, oldPin);

    // Validate new PIN
    if (!/^\d{4,6}$/.test(newPin)) {
      throw new BadRequestException('Yeni PIN 4-6 rakam olmalıdır');
    }

    const bcrypt = require('bcrypt');
    const pinHash = await bcrypt.hash(newPin, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { pinHash },
    });

    return { success: true, message: 'PIN başarıyla değiştirildi' };
  }

  async getPinStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pinEnabled: true },
    });

    return { pinEnabled: user?.pinEnabled || false };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const bcrypt = require('bcrypt');

    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Mevcut şifre yanlış');
    }

    // Validate new password
    if (newPassword.length < 6) {
      throw new BadRequestException('Yeni şifre en az 6 karakter olmalıdır');
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('Yeni şifre mevcut şifre ile aynı olamaz');
    }

    // Hash new password
    const password = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password },
    });

    return { success: true, message: 'Şifre başarıyla değiştirildi' };
  }
}
