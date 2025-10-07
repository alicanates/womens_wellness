import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PredictionService } from './prediction.service';

interface PeriodSymptoms {
  flow: 'light' | 'moderate' | 'heavy';
  cramps: 0 | 1 | 2 | 3 | 4 | 5;
  mood: string[];
  physical: string[];
  notes?: string;
}

interface DailyLogInput {
  date: string;
  flow?: 'light' | 'moderate' | 'heavy';
  cramps?: number;
  symptoms?: string[];
  mood?: string[];
  hadSex?: boolean;
  contraception?: string[];
  sexNotes?: string;
  medications?: string[];
  healthNotes?: string;
  attachments?: string[];
}

@Injectable()
export class CyclesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly predictionService: PredictionService,
  ) {}

  /**
   * Create a new period cycle
   */
  async createCycle(
    userId: string,
    data: {
      startDate: string;
      endDate?: string;
      symptoms?: PeriodSymptoms;
      notes?: string;
    },
  ) {
    return this.prisma.periodCycle.create({
      data: {
        userId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        symptomsJson: (data.symptoms || {}) as any,
        notes: data.notes,
      },
    });
  }

  /**
   * Update existing cycle
   */
  async updateCycle(
    userId: string,
    cycleId: string,
    data: {
      startDate?: string;
      endDate?: string;
      symptoms?: PeriodSymptoms;
      notes?: string;
    },
  ) {
    return this.prisma.periodCycle.update({
      where: {
        id: cycleId,
        userId, // Ensure user owns this cycle
      },
      data: {
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.symptoms && { symptomsJson: data.symptoms as any }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });
  }

  /**
   * Get user's cycle history
   */
  async getCycles(userId: string, limit = 12) {
    return this.prisma.periodCycle.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
      take: limit,
    });
  }

  /**
   * Get specific cycle
   */
  async getCycle(userId: string, cycleId: string) {
    return this.prisma.periodCycle.findFirst({
      where: {
        id: cycleId,
        userId,
      },
    });
  }

  /**
   * Delete cycle
   */
  async deleteCycle(userId: string, cycleId: string) {
    return this.prisma.periodCycle.delete({
      where: {
        id: cycleId,
        userId,
      },
    });
  }

  /**
   * Delete all cycles for a user (reset calendar)
   */
  async deleteAllCycles(userId: string) {
    const result = await this.prisma.periodCycle.deleteMany({
      where: { userId },
    });
    console.log(`🗑️ Deleted ${result.count} cycles for user ${userId}`);
    return { deleted: result.count, message: 'Tüm regl kayıtları silindi' };
  }

  /**
   * Get prediction for next period
   */
  async getPrediction(userId: string) {
    const cycles = await this.getCycles(userId, 6);

    if (cycles.length === 0) {
      return {
        prediction: null,
        message: 'Tahmin için en az 1 regl kaydı gerekli',
      };
    }

    const prediction = this.predictionService.predict(
      cycles.map((c) => ({
        startDate: c.startDate.toISOString(),
        endDate: c.endDate?.toISOString(),
      }))
    );

    return {
      prediction,
      cyclesUsed: cycles.length,
      message:
        cycles.length < 3
          ? 'Daha kesin tahmin için daha fazla veri gerekli'
          : null,
    };
  }

  /**
   * Get cycle calendar data for a month
   */
  async getCalendarMonth(userId: string, year: number, month: number) {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    // Get cycles that overlap with this month
    const cycles = await this.prisma.periodCycle.findMany({
      where: {
        userId,
        OR: [
          {
            startDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
          {
            AND: [
              { startDate: { lte: endOfMonth } },
              {
                OR: [
                  { endDate: { gte: startOfMonth } },
                  { endDate: null }, // Ongoing cycle
                ],
              },
            ],
          },
        ],
      },
      orderBy: { startDate: 'desc' },
    });

    // Get daily logs for this month
    const dailyLogs = await this.prisma.dailyLog.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Create a map for quick lookup
    const dailyLogMap = new Map(
      dailyLogs.map((log) => [log.date.toISOString().split('T')[0], log])
    );

    // Debug: log cycles for this month
    console.log(`📊 Cycles for ${year}-${month}:`, cycles.map(c => ({
      start: c.startDate.toISOString().split('T')[0],
      end: c.endDate ? c.endDate.toISOString().split('T')[0] : 'no end',
    })));

    // Get prediction
    const { prediction } = await this.getPrediction(userId);

    // Debug: log prediction details
    if (prediction) {
      console.log('📅 Calendar Prediction Debug:', {
        nextStart: prediction.nextStart.toISOString().split('T')[0],
        fertileWindow: {
          start: prediction.fertile.start.toISOString().split('T')[0],
          end: prediction.fertile.end.toISOString().split('T')[0],
        },
        avgCycleLength: prediction.averageCycleLength,
        confidence: prediction.confidence,
      });
    }

    // Build calendar data
    const days: Array<{
      date: Date;
      isPeriod: boolean;
      isFertile: boolean;
      isPredicted: boolean;
      isOvulation: boolean;
      cycleDay?: number;
      markers: string[];
      dailyLog?: any;
    }> = [];

    for (let day = 1; day <= endOfMonth.getDate(); day++) {
      const date = new Date(year, month - 1, day);
      const dateKey = date.toISOString().split('T')[0];
      let isPeriod = false;
      let cycleDay: number | undefined;
      const markers: string[] = [];

      // Check if this day is within any cycle's period days
      // Assume typical period lasts 3-7 days (default: 5 days if no end date)
      for (const cycle of cycles) {
        const start = new Date(cycle.startDate);
        start.setHours(0, 0, 0, 0);

        let end: Date;
        if (cycle.endDate) {
          end = new Date(cycle.endDate);
          end.setHours(0, 0, 0, 0);
        } else {
          // If no end date, assume 5-day period
          end = new Date(start);
          end.setDate(end.getDate() + 4); // 5 days total (start + 4)
        }

        const dateNormalized = new Date(date);
        dateNormalized.setHours(0, 0, 0, 0);

        if (dateNormalized >= start && dateNormalized <= end) {
          isPeriod = true;
          markers.push('period');
          cycleDay = this.predictionService.getCycleDay(dateNormalized, start);
          console.log(`  🩸 Day ${day}: PERIOD (cycle ${cycle.id.slice(0,8)}, days ${start.toISOString().split('T')[0]} to ${end.toISOString().split('T')[0]})`);
          break;
        }
      }

      // Check fertile window (should NOT overlap with period days)
      let isFertile = false;
      if (prediction && !isPeriod) {
        isFertile = this.predictionService.isFertileDay(date, prediction);
        if (isFertile) {
          markers.push('fertile');
          console.log(`  🌸 Day ${day}: FERTILE`);
        }
      }

      // Check if ovulation day
      let isOvulation = false;
      if (prediction && !isPeriod) {
        isOvulation = this.isSameDay(date, prediction.ovulation);
        if (isOvulation) {
          markers.push('ovulation');
          console.log(`  ⭐ Day ${day}: OVULATION`);
        }
      }

      // Check if predicted period start (should NOT overlap with current period)
      let isPredicted = false;
      if (prediction && !isPeriod) {
        isPredicted = this.isSameDay(date, prediction.nextStart);
        if (isPredicted) {
          console.log(`  📅 Day ${day}: PREDICTED START`);
        }
      }

      // Get daily log if exists
      const dailyLog = dailyLogMap.get(dateKey);
      if (dailyLog) {
        if (dailyLog.hadSex) markers.push('sex');
        if (dailyLog.symptoms.length > 0) markers.push('symptom');
        if (dailyLog.medications.length > 0) markers.push('medication');
      }

      days.push({
        date,
        isPeriod,
        isFertile,
        isPredicted,
        isOvulation,
        cycleDay,
        markers,
        dailyLog: dailyLog || undefined,
      });
    }

    return {
      year,
      month,
      days,
      cycles,
      prediction,
    };
  }

  /**
   * Helper to check if two dates are the same day (ignoring time)
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Get cycle statistics
   */
  async getStats(userId: string) {
    const cycles = await this.getCycles(userId, 12);

    if (cycles.length === 0) {
      return {
        totalCycles: 0,
        averageCycleLength: null,
        averagePeriodLength: null,
        cycleVariance: null,
      };
    }

    // Calculate average cycle length
    const cycleLengths: number[] = [];
    for (let i = 0; i < cycles.length - 1; i++) {
      const current = cycles[i].startDate;
      const next = cycles[i + 1].startDate;
      const length = Math.round(
        (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24)
      );
      cycleLengths.push(length);
    }

    const avgCycleLength =
      cycleLengths.length > 0
        ? Math.round(
            cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length
          )
        : null;

    // Calculate cycle variance (standard deviation)
    let cycleVariance: number | null = null;
    if (cycleLengths.length > 1 && avgCycleLength !== null) {
      const squaredDiffs = cycleLengths.map((len) =>
        Math.pow(len - avgCycleLength, 2)
      );
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / cycleLengths.length;
      cycleVariance = Math.round(Math.sqrt(variance) * 10) / 10; // Round to 1 decimal
    }

    // Calculate average period length
    const periodLengths = cycles
      .filter((c) => c.endDate)
      .map((c) => {
        const start = c.startDate.getTime();
        const end = c.endDate!.getTime();
        return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
      });

    const avgPeriodLength =
      periodLengths.length > 0
        ? Math.round(
            periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length
          )
        : null;

    return {
      totalCycles: cycles.length,
      averageCycleLength: avgCycleLength,
      averagePeriodLength: avgPeriodLength,
      cycleVariance,
      cycleLengths,
      periodLengths,
      last3Cycles: cycleLengths.slice(0, 3),
    };
  }

  /**
   * Create or update daily log for a specific date
   */
  async upsertDailyLog(userId: string, data: DailyLogInput) {
    const date = new Date(data.date);
    date.setHours(0, 0, 0, 0); // Normalize to start of day

    // Find if date falls within any cycle
    const cycle = await this.prisma.periodCycle.findFirst({
      where: {
        userId,
        startDate: { lte: date },
        OR: [
          { endDate: { gte: date } },
          { endDate: null },
        ],
      },
    });

    return this.prisma.dailyLog.upsert({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      update: {
        flow: data.flow,
        cramps: data.cramps,
        symptoms: data.symptoms || [],
        mood: data.mood || [],
        hadSex: data.hadSex ?? false,
        contraception: data.contraception || [],
        sexNotes: data.sexNotes,
        medications: data.medications || [],
        healthNotes: data.healthNotes,
        attachments: data.attachments || [],
      },
      create: {
        userId,
        cycleId: cycle?.id,
        date,
        flow: data.flow,
        cramps: data.cramps,
        symptoms: data.symptoms || [],
        mood: data.mood || [],
        hadSex: data.hadSex ?? false,
        contraception: data.contraception || [],
        sexNotes: data.sexNotes,
        medications: data.medications || [],
        healthNotes: data.healthNotes,
        attachments: data.attachments || [],
      },
    });
  }

  /**
   * Get daily log for a specific date
   */
  async getDailyLog(userId: string, date: string) {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    return this.prisma.dailyLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: dateObj,
        },
      },
    });
  }

  /**
   * Get daily logs for a date range
   */
  async getDailyLogs(userId: string, startDate: string, endDate: string) {
    return this.prisma.dailyLog.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  /**
   * Delete daily log
   */
  async deleteDailyLog(userId: string, date: string) {
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    return this.prisma.dailyLog.delete({
      where: {
        userId_date: {
          userId,
          date: dateObj,
        },
      },
    });
  }
}
