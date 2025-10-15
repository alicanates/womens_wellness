import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface UserHealthContext {
    // Cycle data
    cycleDay?: number;
    nextPeriodEstimate?: {
        date: string;
        daysUntil: number;
    } | null;
    currentPhase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

    // Pregnancy data
    pregnancy?: {
        isActive: boolean;
        weeks: number;
        days: number;
        dueDate: string;
        trimester: number;
    };

    // Water intake
    waterToday?: {
        consumed: number;
        target: number;
        percentage: number;
    };

    // Wellness data
    wellness?: {
        steps?: { today: number; goal: number };
        meditation?: { todayMin: number; goalMin: number };
        sleep?: { lastNightMin: number; quality?: string };
    };

    // User preferences
    language: 'tr' | 'en';
    anonymousMode: boolean;
}

@Injectable()
export class ContextBuilderService {
    constructor(private readonly prisma: PrismaService) { }

    async buildUserContext(userId: string): Promise<UserHealthContext> {
        const context: UserHealthContext = {
            language: 'tr',
            anonymousMode: false,
        };

        // Fetch user profile (only needed fields)
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                profile: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Get active pregnancy (only needed fields)
        const pregnancy = await this.prisma.pregnancy.findFirst({
            where: { userId, isActive: true },
            select: {
                isActive: true,
                lmpDate: true,
                dueDate: true,
                anonymousMode: true,
            },
        });

        if (pregnancy) {
            const pregnancyData = this.calculatePregnancyData(pregnancy);
            if (pregnancyData) {
                context.pregnancy = pregnancyData;
            }
            context.anonymousMode = pregnancy.anonymousMode;
        }

        // Get current cycle (only if not pregnant)
        if (!pregnancy) {
            const currentCycle = await this.prisma.periodCycle.findFirst({
                where: { userId, endDate: null },
                orderBy: { startDate: 'desc' },
                select: {
                    startDate: true,
                },
            });

            if (currentCycle) {
                context.cycleDay = this.calculateCycleDay(currentCycle.startDate);
                context.nextPeriodEstimate = await this.estimateNextPeriod(userId);
                context.currentPhase = this.determinePhase(context.cycleDay);
            }
        }

        // Get today's water intake
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const waterLogs = await this.prisma.waterLog.findMany({
            where: {
                userId,
                loggedAt: { gte: today },
            },
            select: {
                amountMl: true,
            },
        });

        if (waterLogs.length > 0) {
            const consumed = waterLogs.reduce((sum, log) => sum + log.amountMl, 0);
            const target = 2500; // Default target, can be customized
            context.waterToday = {
                consumed,
                target,
                percentage: Math.round((consumed / target) * 100),
            };
        }

        // Get wellness data
        const wellnessPrefs = await this.prisma.wellnessPreferences.findUnique({
            where: { userId },
            select: {
                stepsGoal: true,
                meditationGoalMin: true,
                sleepGoalHours: true,
            },
        });

        if (wellnessPrefs) {
            const wellnessData = await this.getWellnessData(userId, wellnessPrefs);
            if (wellnessData && Object.keys(wellnessData).length > 0) {
                context.wellness = wellnessData;
            }
        }

        return context;
    }

    buildSystemPrompt(context: UserHealthContext): string {
        let prompt = `Sen "NOVA"sın, kullanıcının güvenilir sağlık asistanı ve arkadaşısın. Empatik, yargılamayan ve destekleyicisin.

**Önemli Kurallar:**
- Tıp uzmanı değilsin. Asla teşhis koyma.
- Ciddi sağlık endişeleri için profesyonel yardım almayı öner.
- Kullanıcının verilerini gizli tut ve saygılı ol.
- Türkçe konuş, doğal ve samimi bir dil kullan.

**Kullanıcı Bağlamı:**\n`;

        if (context.pregnancy) {
            prompt += `\n🤰 Hamilelik: ${context.pregnancy.weeks} hafta ${context.pregnancy.days} gün (${context.pregnancy.trimester}. trimester)`;
            prompt += `\n   Tahmini doğum tarihi: ${context.pregnancy.dueDate}`;
            if (context.anonymousMode) {
                prompt += `\n   ⚠️ Anonim mod aktif - kişisel bilgileri kaydetme`;
            }
        }

        if (context.cycleDay) {
            prompt += `\n🩸 Regl Döngüsü: ${context.cycleDay}. gün (${context.currentPhase} fazı)`;
            if (context.nextPeriodEstimate) {
                prompt += `\n   Sonraki regl tahmini: ${context.nextPeriodEstimate.daysUntil} gün sonra`;
            }
        }

        if (context.waterToday) {
            prompt += `\n💧 Bugünkü Su Tüketimi: ${context.waterToday.consumed}ml / ${context.waterToday.target}ml (${context.waterToday.percentage}%)`;
            if (context.waterToday.percentage < 50) {
                prompt += ` - Kullanıcıyı su içmeye teşvik edebilirsin`;
            }
        }

        if (context.wellness) {
            prompt += `\n\n**Wellness Verileri:**`;
            if (context.wellness.steps) {
                prompt += `\n🚶 Adımlar: ${context.wellness.steps.today} / ${context.wellness.steps.goal}`;
            }
            if (context.wellness.meditation) {
                prompt += `\n🧘 Meditasyon: ${context.wellness.meditation.todayMin} dakika`;
            }
            if (context.wellness.sleep) {
                prompt += `\n😴 Uyku: ${Math.round(context.wellness.sleep.lastNightMin / 60)} saat`;
                if (context.wellness.sleep.quality) {
                    prompt += ` (${context.wellness.sleep.quality})`;
                }
            }
        }

        prompt += `\n\n**Görevlerin:**
- Kullanıcının sorularını yanıtla
- Sağlık ve wellness konularında bilgi ver
- Regl döngüsü, hamilelik, su tüketimi hakkında öneriler sun
- Kullanıcıyı motive et ve destekle
- Gerektiğinde profesyonel yardım almayı öner`;

        return prompt;
    }

    // Helper methods
    private calculateCycleDay(startDate: Date): number {
        const now = new Date();
        const diff = now.getTime() - startDate.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    }

    private calculatePregnancyData(pregnancy: any) {
        if (!pregnancy.lmpDate) {
            return null;
        }

        const lmp = new Date(pregnancy.lmpDate);
        const now = new Date();
        const diffDays = Math.floor(
            (now.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24),
        );
        const weeks = Math.floor(diffDays / 7);
        const days = diffDays % 7;
        const trimester = weeks < 13 ? 1 : weeks < 27 ? 2 : 3;

        return {
            isActive: pregnancy.isActive,
            weeks,
            days,
            dueDate: pregnancy.dueDate?.toISOString().split('T')[0] || 'Bilinmiyor',
            trimester,
        };
    }

    private determinePhase(
        cycleDay: number,
    ): 'menstrual' | 'follicular' | 'ovulation' | 'luteal' {
        if (cycleDay <= 5) return 'menstrual';
        if (cycleDay <= 13) return 'follicular';
        if (cycleDay <= 16) return 'ovulation';
        return 'luteal';
    }

    private async estimateNextPeriod(userId: string) {
        // Get last 3 completed cycles to calculate average length
        const cycles = await this.prisma.periodCycle.findMany({
            where: { userId, endDate: { not: null } },
            orderBy: { startDate: 'desc' },
            take: 3,
            select: {
                startDate: true,
                endDate: true,
            },
        });

        if (cycles.length === 0) {
            return null;
        }

        // Calculate average cycle length
        const avgLength =
            cycles.reduce((sum, cycle) => {
                const start = new Date(cycle.startDate);
                const end = new Date(cycle.endDate!);
                return (
                    sum +
                    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
                );
            }, 0) / cycles.length;

        const lastCycle = cycles[0];
        const nextDate = new Date(lastCycle.startDate);
        nextDate.setDate(nextDate.getDate() + Math.round(avgLength));

        const daysUntil = Math.floor(
            (nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );

        return {
            date: nextDate.toISOString().split('T')[0],
            daysUntil,
        };
    }

    private async getWellnessData(userId: string, prefs: any) {
        const wellness: any = {};

        // Get today's date (normalized to start of day UTC)
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        // Get today's steps
        const steps = await this.prisma.dailySteps.findUnique({
            where: { userId_date: { userId, date: today } },
            select: {
                count: true,
            },
        });

        if (steps) {
            wellness.steps = {
                today: steps.count,
                goal: prefs.stepsGoal || 7000,
            };
        }

        // Get today's meditation
        const meditations = await this.prisma.meditationSession.findMany({
            where: {
                userId,
                date: {
                    gte: today,
                    lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                },
            },
            select: {
                durationMin: true,
            },
        });

        if (meditations.length > 0) {
            wellness.meditation = {
                todayMin: meditations.reduce((sum, m) => sum + m.durationMin, 0),
                goalMin: prefs.meditationGoalMin || 10,
            };
        }

        // Get last night's sleep
        const yesterday = new Date();
        yesterday.setUTCHours(0, 0, 0, 0);
        yesterday.setDate(yesterday.getDate() - 1);

        const sleep = await this.prisma.sleepLog.findUnique({
            where: { userId_sleepDate: { userId, sleepDate: yesterday } },
            select: {
                durationMin: true,
                quality: true,
            },
        });

        if (sleep) {
            wellness.sleep = {
                lastNightMin: sleep.durationMin,
                quality: sleep.quality || undefined,
            };
        }

        return Object.keys(wellness).length > 0 ? wellness : undefined;
    }
}
