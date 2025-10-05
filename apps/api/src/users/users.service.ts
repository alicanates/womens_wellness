import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        ...(data.displayName && { displayName: data.displayName }),
        ...(data.birthYear && { birthYear: data.birthYear }),
        ...(data.heightCm && { heightCm: data.heightCm }),
        ...(data.weightKg && { weightKg: data.weightKg }),
        ...(data.timezone && { timezone: data.timezone }),
        ...(data.profilePictureUrl !== undefined && { profilePictureUrl: data.profilePictureUrl }),
        ...(data.preferencesJson && { preferencesJson: data.preferencesJson }),
      },
    });

    return this.getUserWithProfile(userId);
  }
}
