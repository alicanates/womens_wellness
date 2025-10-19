import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InsightService {
    constructor(private prisma: PrismaService) { }

    // Generate personalized insights
    async generateInsights(userId: string) {
        const insights: any[] = [];

        // Get user data
        const gamification = await this.prisma.userGamification.findUnique({
            where: { userId },
        });

        if (!gamification) return [];

        // Streak insights
        if (gamification.currentStreak > 0) {
            if (gamification.currentStreak === gamification.longestStreak && gamification.currentStreak >= 7) {
                insights.push({
                    userId,
                    titleTr: 'Rekor Kırıyorsun! 🎉',
                    titleEn: 'Breaking Records! 🎉',
                    messageTr: `${gamification.currentStreak} günlük streak'in en uzun streak'in! Harikasın!`,
                    messageEn: `Your ${gamification.currentStreak}-day streak is your longest ever! Amazing!`,
                    type: 'achievement',
                    category: 'streak',
                    dataJson: { streak: gamification.currentStreak },
                });
            }
        }

        // Get recent daily logs
        const recentLogs = await this.prisma.dailyLog.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 30,
        });

        // Symptom insights
        const symptomsCount = recentLogs.reduce((acc, log) => acc + log.symptoms.length, 0);
        const previousMonthLogs = await this.prisma.dailyLog.findMany({
            where: {
                userId,
                date: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 60)),
                    lt: new Date(new Date().setDate(new Date().getDate() - 30)),
                },
            },
        });
        const previousSymptomsCount = previousMonthLogs.reduce((acc, log) => acc + log.symptoms.length, 0);

        if (symptomsCount < previousSymptomsCount && previousSymptomsCount > 0) {
            const reduction = Math.round(((previousSymptomsCount - symptomsCount) / previousSymptomsCount) * 100);
            insights.push({
                userId,
                titleTr: 'Harika Gelişme! 💚',
                titleEn: 'Great Progress! 💚',
                messageTr: `Geçen aya göre %${reduction} daha az semptom yaşadın!`,
                messageEn: `You experienced ${reduction}% fewer symptoms compared to last month!`,
                type: 'positive',
                category: 'symptoms',
                dataJson: { reduction, current: symptomsCount, previous: previousSymptomsCount },
            });
        }

        // Mood insights
        const moodLogs = recentLogs.filter(log => log.mood.length > 0);
        if (moodLogs.length >= 7) {
            const positiveMoods = ['happy', 'energetic', 'calm', 'confident'];
            const positiveCount = moodLogs.filter(log =>
                log.mood.some(m => positiveMoods.includes(m.toLowerCase()))
            ).length;
            const positivePercentage = Math.round((positiveCount / moodLogs.length) * 100);

            if (positivePercentage >= 70) {
                insights.push({
                    userId,
                    titleTr: 'Ruh Halin Harika! ✨',
                    titleEn: 'Your Mood is Great! ✨',
                    messageTr: `Son ${moodLogs.length} günün %${positivePercentage}'inde pozitif hissettin!`,
                    messageEn: `You felt positive ${positivePercentage}% of the last ${moodLogs.length} days!`,
                    type: 'positive',
                    category: 'mood',
                    dataJson: { percentage: positivePercentage, days: moodLogs.length },
                });
            }
        }

        // Water intake insights
        const waterLogs = await this.prisma.waterLog.findMany({
            where: {
                userId,
                loggedAt: {
                    gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                },
            },
        });

        if (waterLogs.length >= 5) {
            const avgWater = Math.round(waterLogs.reduce((acc, log) => acc + log.amountMl, 0) / waterLogs.length);
            if (avgWater >= 2000) {
                insights.push({
                    userId,
                    titleTr: 'Su İçme Şampiyonu! 💧',
                    titleEn: 'Hydration Champion! 💧',
                    messageTr: `Bu hafta günde ortalama ${Math.round(avgWater / 1000)} litre su içtin!`,
                    messageEn: `You drank an average of ${Math.round(avgWater / 1000)}L of water per day this week!`,
                    type: 'positive',
                    category: 'wellness',
                    dataJson: { avgWater },
                });
            }
        }

        // Save insights to database
        for (const insight of insights) {
            // Check if similar insight already exists
            const existing = await this.prisma.userInsight.findFirst({
                where: {
                    userId,
                    category: insight.category,
                    isRead: false,
                    createdAt: {
                        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                    },
                },
            });

            if (!existing) {
                await this.prisma.userInsight.create({
                    data: {
                        ...insight,
                        expiresAt: new Date(new Date().setDate(new Date().getDate() + 7)),
                    },
                });
            }
        }

        return insights;
    }

    // Get user insights
    async getUserInsights(userId: string, includeRead = false) {
        const where: any = {
            userId,
            expiresAt: {
                gte: new Date(),
            },
        };

        if (!includeRead) {
            where.isRead = false;
        }

        return this.prisma.userInsight.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    // Mark insight as read
    async markAsRead(insightId: string, userId: string) {
        return this.prisma.userInsight.updateMany({
            where: {
                id: insightId,
                userId,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }
}
