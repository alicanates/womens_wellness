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
      cycleDay?: number;
    }> = [];

    for (let day = 1; day <= endOfMonth.getDate(); day++) {
      const date = new Date(year, month - 1, day);
      let isPeriod = false;
      let cycleDay: number | undefined;

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
          console.log(`  🌸 Day ${day}: FERTILE`);
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

      days.push({
        date,
        isPeriod,
        isFertile,
        isPredicted,
        cycleDay,
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
      cycleLengths,
      periodLengths,
    };
  }
}
