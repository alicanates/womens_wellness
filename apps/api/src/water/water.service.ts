import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WaterService {
  constructor(private readonly prisma: PrismaService) {}

  async getWaterLogs(
    userId: string,
    options?: { startDate?: string; endDate?: string },
  ) {
    const where: any = { userId };

    if (options?.startDate || options?.endDate) {
      where.loggedAt = {};
      if (options.startDate) {
        where.loggedAt.gte = new Date(options.startDate);
      }
      if (options.endDate) {
        where.loggedAt.lte = new Date(options.endDate);
      }
    }

    return this.prisma.waterLog.findMany({
      where,
      orderBy: { loggedAt: 'desc' },
    });
  }

  async logWater(
    userId: string,
    data: { amountMl: number; loggedAt: Date },
  ) {
    return this.prisma.waterLog.create({
      data: {
        userId,
        amountMl: data.amountMl,
        loggedAt: data.loggedAt,
      },
    });
  }

  async getTodayTotal(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await this.prisma.waterLog.findMany({
      where: {
        userId,
        loggedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const total = logs.reduce((sum, log) => sum + log.amountMl, 0);

    return {
      date: startOfDay.toISOString().split('T')[0],
      totalMl: total,
      totalL: Math.round(total / 100) / 10,
      logs,
    };
  }

  async getStats(userId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const logs = await this.prisma.waterLog.findMany({
      where: {
        userId,
        loggedAt: {
          gte: startDate,
        },
      },
      orderBy: { loggedAt: 'asc' },
    });

    // Group by date
    const dailyTotals: Record<string, number> = {};
    logs.forEach((log) => {
      const date = log.loggedAt.toISOString().split('T')[0];
      dailyTotals[date] = (dailyTotals[date] || 0) + log.amountMl;
    });

    const totalMl = logs.reduce((sum, log) => sum + log.amountMl, 0);
    const avgMl = Math.round(totalMl / days);

    return {
      days,
      totalMl,
      avgMl,
      avgL: Math.round(avgMl / 100) / 10,
      dailyTotals,
      logCount: logs.length,
    };
  }
}
