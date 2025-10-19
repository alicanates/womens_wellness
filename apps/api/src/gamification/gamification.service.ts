import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
    constructor(private prisma: PrismaService) { }

    // Get or create user gamification profile
    async getUserGamification(userId: string) {
        let gamification = await this.prisma.userGamification.findUnique({
            where: { userId },
        });

        if (!gamification) {
            gamification = await this.prisma.userGamification.create({
                data: { userId },
            });
        }

        return gamification;
    }

    // Update streak
    async updateStreak(userId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const gamification = await this.getUserGamification(userId);
        const lastActivity = gamification.lastActivityDate
            ? new Date(gamification.lastActivityDate)
            : null;

        if (lastActivity) {
            lastActivity.setHours(0, 0, 0, 0);
        }

        let newStreak = gamification.currentStreak;
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Check if last activity was yesterday (continue streak)
        if (lastActivity && lastActivity.getTime() === yesterday.getTime()) {
            newStreak += 1;
        }
        // Check if last activity was today (already logged today)
        else if (lastActivity && lastActivity.getTime() === today.getTime()) {
            return gamification; // No change needed
        }
        // Streak broken
        else if (lastActivity && lastActivity.getTime() < yesterday.getTime()) {
            newStreak = 1;
        }
        // First time or new streak
        else {
            newStreak = 1;
        }

        const longestStreak = Math.max(newStreak, gamification.longestStreak);

        return this.prisma.userGamification.update({
            where: { userId },
            data: {
                currentStreak: newStreak,
                longestStreak,
                lastActivityDate: today,
            },
        });
    }

    // Add XP and check for level up
    async addXp(userId: string, xpAmount: number) {
        const gamification = await this.getUserGamification(userId);
        const newTotalXp = gamification.totalXp + xpAmount;
        const newLevel = this.calculateLevel(newTotalXp);
        const xpForCurrentLevel = this.getXpForLevel(newLevel);
        const xpForNextLevel = this.getXpForLevel(newLevel + 1);
        const currentXp = newTotalXp - xpForCurrentLevel;

        const updated = await this.prisma.userGamification.update({
            where: { userId },
            data: {
                totalXp: newTotalXp,
                currentXp,
                level: newLevel,
            },
        });

        // Check if leveled up
        const leveledUp = newLevel > gamification.level;

        return {
            ...updated,
            leveledUp,
            xpGained: xpAmount,
            xpForNextLevel: xpForNextLevel - xpForCurrentLevel,
        };
    }

    // Calculate level from total XP
    private calculateLevel(totalXp: number): number {
        // Level formula: Level = floor(sqrt(totalXp / 100))
        // Level 1: 0-99 XP
        // Level 2: 100-399 XP
        // Level 3: 400-899 XP
        // etc.
        return Math.floor(Math.sqrt(totalXp / 100)) + 1;
    }

    // Get XP required for a specific level
    private getXpForLevel(level: number): number {
        return Math.pow(level - 1, 2) * 100;
    }

    // Increment data entry count
    async incrementDataEntry(userId: string) {
        await this.prisma.userGamification.update({
            where: { userId },
            data: {
                totalDataEntries: { increment: 1 },
            },
        });

        // Update streak
        await this.updateStreak(userId);

        // Add XP
        return this.addXp(userId, 5); // 5 XP per data entry
    }

    // Get user stats
    async getUserStats(userId: string) {
        const gamification = await this.getUserGamification(userId);
        const achievements = await this.prisma.userAchievement.findMany({
            where: { userId, isCompleted: true },
            include: { achievement: true },
            orderBy: { completedAt: 'desc' },
        });

        const xpForNextLevel = this.getXpForLevel(gamification.level + 1);
        const xpForCurrentLevel = this.getXpForLevel(gamification.level);
        const xpNeeded = xpForNextLevel - gamification.totalXp;
        const xpProgress = gamification.totalXp - xpForCurrentLevel;
        const xpTotal = xpForNextLevel - xpForCurrentLevel;

        return {
            ...gamification,
            achievements: achievements.length,
            xpNeeded,
            xpProgress,
            xpTotal,
            levelProgress: (xpProgress / xpTotal) * 100,
        };
    }

    // Reset user gamification data
    async resetUserGamification(userId: string) {
        // Delete all user achievements
        await this.prisma.userAchievement.deleteMany({
            where: { userId },
        });

        // Delete all user insights
        await this.prisma.userInsight.deleteMany({
            where: { userId },
        });

        // Reset gamification stats
        const gamification = await this.prisma.userGamification.findUnique({
            where: { userId },
        });

        if (gamification) {
            await this.prisma.userGamification.update({
                where: { userId },
                data: {
                    level: 1,
                    totalXp: 0,
                    currentXp: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    lastActivityDate: null,
                    totalDataEntries: 0,
                    totalSymptoms: 0,
                    totalWellnessLogs: 0,
                    dailyChallengeDate: null,
                    dailyChallengeJson: { set: null },
                },
            });
        }

        return { message: 'Gamification data reset successfully' };
    }
}
