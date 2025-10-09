import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CyclesService } from '../cycles/cycles.service';
import { WaterService } from '../water/water.service';
import { PregnancyService } from '../pregnancy/pregnancy.service';
import { WellnessService, WellnessSummary } from '../wellness/wellness.service';

export interface HomeSnapshot {
  user: {
    displayName: string;
    profilePictureUrl?: string;
  };
  streak: {
    current: number;
    longest: number;
    startDate?: Date;
  };
  todaySnapshot: {
    cycleDay?: number;
    nextPeriodEstimate?: {
      date: Date;
      confidence: 'low' | 'medium' | 'high';
    };
    fertilityWindow?: {
      start: number;
      end: number;
    };
    ovulationEstimate?: Date;
    pregnancy?: {
      weeks: number;
      days: number;
      dueDate: Date;
    };
    waterProgress: {
      current: number; // mL
      target: number; // mL
      logs: number;
    };
    remindersToday: number;
  };
  wellnessTiles?: WellnessSummary;
  priorityCards: PriorityCard[];
  educationalArticles: EducationalArticleDto[];
}

export interface PriorityCard {
  id: string;
  type: 'hydration' | 'cycle_insight' | 'symptom_log' | 'medication' | 'reminder' | 'nova_prompt';
  priority: number;
  data: any;
  isDismissed: boolean;
  isPinned: boolean;
}

export interface EducationalArticleDto {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  publishedAt: Date;
}

@Injectable()
export class HomeService {
  constructor(
    private prisma: PrismaService,
    private cyclesService: CyclesService,
    private waterService: WaterService,
    private pregnancyService: PregnancyService,
    private wellnessService: WellnessService,
  ) {}

  async getHomeSnapshot(userId: string, locale: string = 'tr'): Promise<HomeSnapshot> {
    // Get user profile
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, homePreferences: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get or create home preferences
    let preferences = user.homePreferences;
    if (!preferences) {
      preferences = await this.prisma.userHomePreferences.create({
        data: { userId },
      });
    }

    // Calculate water streak
    const streak = await this.calculateWaterStreak(userId, preferences);

    // Get today's snapshot data
    const todaySnapshot = await this.getTodaySnapshot(userId);

    // Get priority cards
    const priorityCards = await this.getPriorityCards(userId, preferences);

    // Get educational articles
    const educationalArticles = await this.getEducationalArticles(locale);

    // Get wellness tiles summary
    const wellnessTiles = await this.wellnessService.getWellnessSummary(userId);

    return {
      user: {
        displayName: user.profile?.displayName || user.email.split('@')[0],
        profilePictureUrl: user.profile?.profilePictureUrl || undefined,
      },
      streak,
      todaySnapshot,
      wellnessTiles,
      priorityCards,
      educationalArticles,
    };
  }

  private async calculateWaterStreak(userId: string, preferences: any): Promise<{
    current: number;
    longest: number;
    startDate?: Date;
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    // Check if user has logged in today
    const lastLoginDate = preferences.updatedAt ? new Date(preferences.updatedAt) : null;
    const lastLoginDateOnly = lastLoginDate
      ? new Date(lastLoginDate.getFullYear(), lastLoginDate.getMonth(), lastLoginDate.getDate(), 0, 0, 0, 0)
      : null;
    const todayDateOnly = today;

    let currentStreak = preferences.streakCount || 0;
    let longestStreak = preferences.longestStreak || 0;
    let streakStartDate = preferences.streakStartDate || null;

    // For users with no streak (brand new or existing with streak=0), initialize streak
    if (currentStreak === 0) {
      currentStreak = 1;
      longestStreak = 1;
      streakStartDate = today;

      await this.prisma.userHomePreferences.update({
        where: { userId },
        data: {
          streakCount: currentStreak,
          longestStreak,
          streakStartDate,
          updatedAt: new Date(),
        },
      });
    }
    // If this is a new day (first visit of the day)
    else if (lastLoginDateOnly && lastLoginDateOnly < todayDateOnly) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDateOnly = yesterday;

      // Check if the user logged in yesterday (streak continues)
      if (lastLoginDateOnly.getTime() === yesterdayDateOnly.getTime()) {
        // Continue streak
        currentStreak++;
      }
      // Streak broken - start new streak
      else if (lastLoginDateOnly < yesterdayDateOnly) {
        currentStreak = 1;
        streakStartDate = today;
      }

      // Update longest streak if needed
      longestStreak = Math.max(currentStreak, longestStreak);

      // Update preferences with new streak info
      await this.prisma.userHomePreferences.update({
        where: { userId },
        data: {
          streakCount: currentStreak,
          longestStreak,
          streakStartDate,
          updatedAt: new Date(), // This marks the login
        },
      });
    }

    return {
      current: currentStreak,
      longest: longestStreak,
      startDate: streakStartDate || undefined,
    };
  }

  private async getTodaySnapshot(userId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get cycle data
    const cycles = await this.cyclesService.getCycles(userId);
    let cycleDay: number | undefined;
    let nextPeriodEstimate;

    if (cycles && cycles.length > 0) {
      const latestCycle = cycles[0];
      const cycleStart = new Date(latestCycle.startDate);
      cycleDay = Math.floor((today.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Simple prediction based on average cycle length
      if (cycles.length >= 3) {
        const completedCycles = cycles.filter(c => c.endDate);
        if (completedCycles.length >= 2) {
          const avgCycleLength = completedCycles.reduce((sum, c) => {
            const start = new Date(c.startDate);
            const end = new Date(c.endDate!);
            return sum + Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          }, 0) / completedCycles.length;

          const variance = completedCycles.reduce((sum, c) => {
            const start = new Date(c.startDate);
            const end = new Date(c.endDate!);
            const cycleLength = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            return sum + Math.abs(cycleLength - avgCycleLength);
          }, 0) / completedCycles.length;

          const estimatedNextPeriod = new Date(cycleStart);
          estimatedNextPeriod.setDate(estimatedNextPeriod.getDate() + Math.round(avgCycleLength));

          let confidence: 'low' | 'medium' | 'high' = 'low';
          if (variance < 2) confidence = 'high';
          else if (variance < 4) confidence = 'medium';

          nextPeriodEstimate = {
            date: estimatedNextPeriod,
            confidence,
          };
        }
      }
    }

    // Get pregnancy data
    let pregnancy;
    const pregnancyRecord = await this.pregnancyService.getPregnancy(userId);
    if (pregnancyRecord && pregnancyRecord.isActive) {
      const lmpDate = new Date(pregnancyRecord.lmpDate || pregnancyRecord.dueDate!);
      lmpDate.setDate(lmpDate.getDate() - 280); // Calculate LMP from due date if needed

      const daysSinceLMP = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
      const weeks = Math.floor(daysSinceLMP / 7);
      const days = daysSinceLMP % 7;

      pregnancy = {
        weeks,
        days,
        dueDate: pregnancyRecord.dueDate || new Date(),
      };
    }

    // Get water progress
    const waterToday = await this.waterService.getTodayTotal(userId);

    // Get user profile for water target
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    const waterTarget = profile?.weightKg ? Math.round(profile.weightKg * 30) : 2000; // 30ml per kg or default 2L

    // Get reminders count for today
    const remindersToday = await this.prisma.reminder.count({
      where: {
        userId,
        active: true,
        nextRunAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    return {
      cycleDay,
      nextPeriodEstimate,
      pregnancy,
      waterProgress: {
        current: waterToday.totalMl,
        target: waterTarget,
        logs: waterToday.logs.length,
      },
      remindersToday,
    };
  }

  private async getPriorityCards(userId: string, preferences: any): Promise<PriorityCard[]> {
    const cards: PriorityCard[] = [];
    const dismissedCards = (preferences.dismissedCards as any) || {};
    const pinnedCards = preferences.pinnedCards || [];
    const now = new Date();

    // Get start of today for daily reset logic
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Check which cards are dismissed (and not expired)
    const isDismissed = (cardId: string) => {
      const dismissedUntil = dismissedCards[cardId];
      if (!dismissedUntil) return false;
      const dismissedDate = new Date(dismissedUntil);

      // Check if dismissal has expired
      return dismissedDate > now;
    };

    // Get today snapshot for card data
    const snapshot = await this.getTodaySnapshot(userId);

    // Cycle insight card
    if (snapshot.nextPeriodEstimate) {
      const daysUntilPeriod = Math.floor(
        (snapshot.nextPeriodEstimate.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (Math.abs(daysUntilPeriod) <= 5) {
        cards.push({
          id: 'cycle_insight',
          type: 'cycle_insight',
          priority: 90,
          data: {
            estimate: snapshot.nextPeriodEstimate,
            daysUntil: daysUntilPeriod,
            cycleDay: snapshot.cycleDay,
          },
          isDismissed: isDismissed('cycle_insight'),
          isPinned: pinnedCards.includes('cycle_insight'),
        });
      }
    }

    // Symptom log card - show only if user hasn't logged mood today
    const todayLog = await this.prisma.dailyLog.findFirst({
      where: {
        userId,
        date: startOfToday,
      },
    });

    // Only show symptom log if:
    // 1. User hasn't logged mood today (no dailyLog or empty mood array)
    // 2. OR user hasn't dismissed it manually via X button
    const hasMoodToday = todayLog && todayLog.mood && todayLog.mood.length > 0;
    if (!hasMoodToday) {
      cards.push({
        id: 'symptom_log',
        type: 'symptom_log',
        priority: 60,
        data: {},
        isDismissed: isDismissed('symptom_log'),
        isPinned: pinnedCards.includes('symptom_log'),
      });
    }

    // Reminders card
    if (snapshot.remindersToday > 0) {
      const nextReminder = await this.prisma.reminder.findFirst({
        where: {
          userId,
          active: true,
          nextRunAt: { gte: now },
        },
        orderBy: { nextRunAt: 'asc' },
      });

      if (nextReminder) {
        const hoursUntil = (nextReminder.nextRunAt.getTime() - now.getTime()) / (1000 * 60 * 60);

        cards.push({
          id: 'reminder',
          type: 'reminder',
          priority: hoursUntil < 3 ? 95 : 70,
          data: {
            count: snapshot.remindersToday,
            next: nextReminder,
          },
          isDismissed: isDismissed('reminder'),
          isPinned: pinnedCards.includes('reminder'),
        });
      }
    }

    // NOVA smart prompt (low priority, once per day)
    const lastNovaPrompt = dismissedCards['nova_prompt'];
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    if (!lastNovaPrompt || new Date(lastNovaPrompt) < oneDayAgo) {
      cards.push({
        id: 'nova_prompt',
        type: 'nova_prompt',
        priority: 50,
        data: {
          prompt: this.getNovaPrompt(snapshot),
        },
        isDismissed: false,
        isPinned: pinnedCards.includes('nova_prompt'),
      });
    }

    // Sort cards: pinned first, then by priority, filter dismissed
    return cards
      .filter(card => !card.isDismissed)
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.priority - a.priority;
      });
  }

  private getNovaPrompt(snapshot: any): string {
    // Generate contextual prompts based on user data
    const prompts = [
      'Bugün nasıl hissediyorsun? Enerji durumunu kaydetmek ister misin?',
      'Su içmeyi unutma! Hedefine ulaşmak için biraz daha içmelisin.',
      'Döngünü takip etmek sağlığın için önemli. Son durumunu kaydedelim mi?',
    ];

    if (snapshot.waterProgress.current < snapshot.waterProgress.target * 0.5) {
      return 'Su tüketimin hedefinin yarısının altında. Biraz su içmek için zamanı geldi! 💧';
    }

    if (snapshot.nextPeriodEstimate) {
      const daysUntil = Math.floor(
        (snapshot.nextPeriodEstimate.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntil <= 2) {
        return 'Regl döneminiz yaklaşıyor. Kendine iyi bak! 💕';
      }
    }

    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  private async getEducationalArticles(locale: string): Promise<EducationalArticleDto[]> {
    const articles = await this.prisma.educationalArticle.findMany({
      where: {
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
      },
      orderBy: [
        { priority: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: 5,
    });

    return articles.map(article => ({
      id: article.id,
      title: locale === 'en' && article.titleEn ? article.titleEn : article.titleTr,
      content: locale === 'en' && article.contentEn ? article.contentEn : article.contentTr,
      category: article.category,
      tags: article.tags,
      imageUrl: article.imageUrl || undefined,
      publishedAt: article.publishedAt,
    }));
  }

  async dismissCard(userId: string, cardId: string, days: number = 7): Promise<void> {
    const preferences = await this.prisma.userHomePreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      await this.prisma.userHomePreferences.create({
        data: { userId },
      });
    }

    const dismissedCards = (preferences?.dismissedCards as any) || {};
    const dismissUntil = new Date();

    // Dismiss cards until end of today - they will reappear tomorrow
    dismissUntil.setHours(23, 59, 59, 999);

    dismissedCards[cardId] = dismissUntil.toISOString();

    await this.prisma.userHomePreferences.update({
      where: { userId },
      data: { dismissedCards },
    });
  }

  async pinCard(userId: string, cardId: string): Promise<void> {
    const preferences = await this.prisma.userHomePreferences.findUnique({
      where: { userId },
    });

    const pinnedCards = preferences?.pinnedCards || [];
    if (!pinnedCards.includes(cardId)) {
      pinnedCards.push(cardId);

      await this.prisma.userHomePreferences.upsert({
        where: { userId },
        create: {
          userId,
          pinnedCards,
        },
        update: {
          pinnedCards,
        },
      });
    }
  }

  async unpinCard(userId: string, cardId: string): Promise<void> {
    const preferences = await this.prisma.userHomePreferences.findUnique({
      where: { userId },
    });

    if (preferences) {
      const pinnedCards = preferences.pinnedCards.filter(id => id !== cardId);

      await this.prisma.userHomePreferences.update({
        where: { userId },
        data: { pinnedCards },
      });
    }
  }

  async setVisiblePills(userId: string, pillIds: string[]): Promise<void> {
    await this.prisma.userHomePreferences.upsert({
      where: { userId },
      create: {
        userId,
        visiblePills: pillIds,
      },
      update: {
        visiblePills: pillIds,
      },
    });
  }
}
