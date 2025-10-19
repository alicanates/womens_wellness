import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from './gamification.service';

@Injectable()
export class AchievementService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => GamificationService))
        private gamificationService: GamificationService,
    ) { }

    // Check and award achievements
    async checkAchievements(userId: string) {
        const gamification = await this.gamificationService.getUserGamification(userId);
        const newAchievements: any[] = [];

        // Get all active achievements
        const achievements = await this.prisma.achievement.findMany({
            where: { isActive: true },
        });

        for (const achievement of achievements) {
            const requirement = achievement.requirementJson as any;
            let isEligible = false;
            let progress = 0;

            // Check different achievement types - use REAL user data
            switch (requirement.type) {
                case 'streak':
                    progress = gamification.currentStreak;
                    isEligible = gamification.currentStreak >= requirement.days;
                    break;

                case 'data_entry':
                    progress = gamification.totalDataEntries;
                    isEligible = gamification.totalDataEntries >= requirement.count;
                    break;

                case 'level':
                    progress = gamification.level;
                    isEligible = gamification.level >= requirement.level;
                    break;

                case 'wellness':
                    progress = gamification.totalWellnessLogs;
                    isEligible = gamification.totalWellnessLogs >= requirement.count;
                    break;

                case 'symptoms':
                    progress = gamification.totalSymptoms;
                    isEligible = gamification.totalSymptoms >= requirement.count;
                    break;
            }

            // Check if user already has this achievement
            const existing = await this.prisma.userAchievement.findUnique({
                where: {
                    userId_achievementId: {
                        userId,
                        achievementId: achievement.id,
                    },
                },
            });

            if (!existing) {
                // Create new achievement record with REAL progress
                await this.prisma.userAchievement.create({
                    data: {
                        userId,
                        achievementId: achievement.id,
                        progress,
                        isCompleted: isEligible,
                        completedAt: isEligible ? new Date() : null,
                    },
                });

                if (isEligible) {
                    newAchievements.push(achievement);
                    // Award XP
                    await this.gamificationService.addXp(userId, achievement.points);
                }
            } else {
                // Always update progress with REAL data
                const shouldUpdate = existing.progress !== progress || (!existing.isCompleted && isEligible);

                if (shouldUpdate) {
                    await this.prisma.userAchievement.update({
                        where: { id: existing.id },
                        data: {
                            progress,
                            isCompleted: isEligible ? true : existing.isCompleted,
                            completedAt: isEligible && !existing.isCompleted ? new Date() : existing.completedAt,
                        },
                    });

                    if (isEligible && !existing.isCompleted) {
                        newAchievements.push(achievement);
                        // Award XP
                        await this.gamificationService.addXp(userId, achievement.points);
                    }
                }
            }
        }

        return newAchievements;
    }

    // Get user achievements - returns ALL achievements with progress
    async getUserAchievements(userId: string) {
        // Get all active achievements
        const allAchievements = await this.prisma.achievement.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
        });

        // Get user's achievement records
        const userAchievements = await this.prisma.userAchievement.findMany({
            where: { userId },
        });

        // Get current gamification stats for progress calculation
        const gamification = await this.gamificationService.getUserGamification(userId);

        // Create a map of user achievements for quick lookup
        const userAchievementMap = new Map(
            userAchievements.map(ua => [ua.achievementId, ua])
        );

        // Combine all achievements with user progress
        const result = allAchievements.map(achievement => {
            const userAchievement = userAchievementMap.get(achievement.id);

            // Calculate current progress based on requirement type
            const requirement = achievement.requirementJson as any;
            let currentProgress = 0;

            switch (requirement.type) {
                case 'streak':
                    currentProgress = gamification.currentStreak;
                    break;
                case 'data_entry':
                    currentProgress = gamification.totalDataEntries;
                    break;
                case 'level':
                    currentProgress = gamification.level;
                    break;
                case 'wellness':
                    currentProgress = gamification.totalWellnessLogs;
                    break;
                case 'symptoms':
                    currentProgress = gamification.totalSymptoms;
                    break;
            }

            if (userAchievement) {
                // Return existing user achievement with updated progress
                return {
                    ...userAchievement,
                    achievement,
                    progress: currentProgress, // Use real-time progress
                };
            } else {
                // Return achievement with initial progress
                return {
                    id: `temp-${achievement.id}`,
                    userId,
                    achievementId: achievement.id,
                    progress: currentProgress,
                    isCompleted: false,
                    completedAt: null,
                    notificationSent: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    achievement,
                };
            }
        });

        // Sort: completed first, then by progress percentage
        return result.sort((a, b) => {
            if (a.isCompleted !== b.isCompleted) {
                return a.isCompleted ? -1 : 1;
            }

            // Calculate progress percentage for sorting
            const reqA = a.achievement.requirementJson as any;
            const reqB = b.achievement.requirementJson as any;

            const targetA = reqA.count || reqA.days || reqA.level || 1;
            const targetB = reqB.count || reqB.days || reqB.level || 1;

            const progressA = (a.progress / targetA) * 100;
            const progressB = (b.progress / targetB) * 100;

            return progressB - progressA;
        });
    }

    // Get achievement progress
    async getAchievementProgress(userId: string, achievementId: string) {
        const userAchievement = await this.prisma.userAchievement.findUnique({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId,
                },
            },
            include: { achievement: true },
        });

        if (!userAchievement) {
            return null;
        }

        const requirement = userAchievement.achievement.requirementJson as any;
        let target = 0;

        switch (requirement.type) {
            case 'streak':
                target = requirement.days;
                break;
            case 'data_entry':
            case 'wellness':
            case 'symptoms':
                target = requirement.count;
                break;
            case 'level':
                target = requirement.level;
                break;
        }

        return {
            ...userAchievement,
            progressPercentage: target > 0 ? (userAchievement.progress / target) * 100 : 0,
            target,
        };
    }

    // Seed initial achievements
    async seedAchievements() {
        const achievements: any[] = [
            // Streak achievements
            {
                key: 'first_week',
                nameTr: 'İlk Hafta',
                nameEn: 'First Week',
                descriptionTr: '7 gün üst üste veri girişi yap',
                descriptionEn: 'Log data for 7 consecutive days',
                iconEmoji: '🔥',
                category: 'STREAK',
                rarity: 'COMMON',
                requirementJson: { type: 'streak', days: 7 },
                points: 50,
            },
            {
                key: 'loyal_tracker',
                nameTr: 'Sadık Takipçi',
                nameEn: 'Loyal Tracker',
                descriptionTr: '30 gün üst üste veri girişi yap',
                descriptionEn: 'Log data for 30 consecutive days',
                iconEmoji: '⭐',
                category: 'STREAK',
                rarity: 'RARE',
                requirementJson: { type: 'streak', days: 30 },
                points: 200,
            },
            {
                key: 'legend_100',
                nameTr: 'Efsane',
                nameEn: 'Legend',
                descriptionTr: '100 gün üst üste veri girişi yap',
                descriptionEn: 'Log data for 100 consecutive days',
                iconEmoji: '💎',
                category: 'STREAK',
                rarity: 'EPIC',
                requirementJson: { type: 'streak', days: 100 },
                points: 1000,
            },
            // Data entry achievements
            {
                key: 'data_hunter',
                nameTr: 'Veri Avcısı',
                nameEn: 'Data Hunter',
                descriptionTr: '50 kez veri girişi yap',
                descriptionEn: 'Log data 50 times',
                iconEmoji: '📊',
                category: 'DATA_ENTRY',
                rarity: 'COMMON',
                requirementJson: { type: 'data_entry', count: 50 },
                points: 100,
            },
            {
                key: 'consistent_tracker',
                nameTr: 'Düzenli Takipçi',
                nameEn: 'Consistent Tracker',
                descriptionTr: '100 kez veri girişi yap',
                descriptionEn: 'Log data 100 times',
                iconEmoji: '🎯',
                category: 'DATA_ENTRY',
                rarity: 'RARE',
                requirementJson: { type: 'data_entry', count: 100 },
                points: 250,
            },
            {
                key: 'year_champion',
                nameTr: 'Yıl Şampiyonu',
                nameEn: 'Year Champion',
                descriptionTr: '365 kez veri girişi yap',
                descriptionEn: 'Log data 365 times',
                iconEmoji: '🏆',
                category: 'DATA_ENTRY',
                rarity: 'LEGENDARY',
                requirementJson: { type: 'data_entry', count: 365 },
                points: 2000,
            },
            // Wellness achievements
            {
                key: 'wellness_warrior',
                nameTr: 'Sağlık Savaşçısı',
                nameEn: 'Wellness Warrior',
                descriptionTr: '30 wellness kaydı oluştur',
                descriptionEn: 'Create 30 wellness logs',
                iconEmoji: '💪',
                category: 'WELLNESS',
                rarity: 'RARE',
                requirementJson: { type: 'wellness', count: 30 },
                points: 150,
            },
            // Symptom tracking
            {
                key: 'symptom_detective',
                nameTr: 'Semptom Dedektifi',
                nameEn: 'Symptom Detective',
                descriptionTr: '50 farklı semptom kaydet',
                descriptionEn: 'Log 50 different symptoms',
                iconEmoji: '🔍',
                category: 'DATA_ENTRY',
                rarity: 'RARE',
                requirementJson: { type: 'symptoms', count: 50 },
                points: 200,
            },
            // Level achievements
            {
                key: 'level_5',
                nameTr: 'Seviye 5',
                nameEn: 'Level 5',
                descriptionTr: '5. seviyeye ulaş',
                descriptionEn: 'Reach level 5',
                iconEmoji: '🌟',
                category: 'MILESTONE',
                rarity: 'COMMON',
                requirementJson: { type: 'level', level: 5 },
                points: 100,
            },
            {
                key: 'level_10',
                nameTr: 'Seviye 10',
                nameEn: 'Level 10',
                descriptionTr: '10. seviyeye ulaş',
                descriptionEn: 'Reach level 10',
                iconEmoji: '✨',
                category: 'MILESTONE',
                rarity: 'RARE',
                requirementJson: { type: 'level', level: 10 },
                points: 300,
            },
        ];

        for (const achievement of achievements) {
            await this.prisma.achievement.upsert({
                where: { key: achievement.key },
                update: achievement,
                create: achievement,
            });
        }

        return achievements;
    }
}
