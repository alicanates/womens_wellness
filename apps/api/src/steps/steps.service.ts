import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StepsService {
    constructor(private readonly prisma: PrismaService) { }

    async getStepsLogs(
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

        return this.prisma.stepsLog.findMany({
            where,
            orderBy: { loggedAt: 'desc' },
        });
    }

    async logSteps(
        userId: string,
        data: { steps: number; loggedAt: Date; source: 'manual' | 'pedometer' },
    ) {
        return this.prisma.stepsLog.create({
            data: {
                userId,
                steps: data.steps,
                loggedAt: data.loggedAt,
                source: data.source,
            },
        });
    }

    async getTodayTotal(userId: string) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const logs = await this.prisma.stepsLog.findMany({
            where: {
                userId,
                loggedAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        const total = logs.reduce((sum, log) => sum + log.steps, 0);

        return {
            date: startOfDay.toISOString().split('T')[0],
            totalSteps: total,
            logs,
        };
    }

    async getStats(userId: string, days: number = 7) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const logs = await this.prisma.stepsLog.findMany({
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
            dailyTotals[date] = (dailyTotals[date] || 0) + log.steps;
        });

        const totalSteps = logs.reduce((sum, log) => sum + log.steps, 0);
        const avgSteps = Math.round(totalSteps / days);

        return {
            days,
            totalSteps,
            avgSteps,
            dailyTotals,
            logCount: logs.length,
        };
    }
}
