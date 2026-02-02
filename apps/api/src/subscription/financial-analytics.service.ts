import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionStatus, TransactionStatus } from '@prisma/client';

interface RevenueData {
    date: string;
    revenue: number;
    transactions: number;
}

interface MRRData {
    currentMRR: number;
    previousMRR: number;
    growth: number;
    growthPercentage: number;
}

@Injectable()
export class FinancialAnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Calculate Monthly Recurring Revenue (MRR)
     */
    async calculateMRR(): Promise<MRRData> {
        const now = new Date();
        const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        // Get active subscriptions
        const activeSubscriptions = await this.prisma.subscription.findMany({
            where: {
                status: SubscriptionStatus.ACTIVE,
            },
            select: {
                tier: true,
            },
        });

        // Calculate current MRR (assuming prices)
        const prices = {
            MONTHLY: 49.99, // TRY
            YEARLY: 399.99 / 12, // TRY per month
        };

        let currentMRR = 0;
        for (const sub of activeSubscriptions) {
            if (sub.tier === 'MONTHLY') {
                currentMRR += prices.MONTHLY;
            } else if (sub.tier === 'YEARLY') {
                currentMRR += prices.YEARLY;
            }
        }

        // Get previous month's active subscriptions count
        const previousMonthSubs = await this.prisma.subscription.count({
            where: {
                status: SubscriptionStatus.ACTIVE,
                startDate: {
                    lt: currentMonth,
                },
            },
        });

        // Estimate previous MRR (simplified)
        const avgRevenuePerSub = activeSubscriptions.length > 0 ? currentMRR / activeSubscriptions.length : 0;
        const previousMRR = previousMonthSubs * avgRevenuePerSub;

        const growth = currentMRR - previousMRR;
        const growthPercentage = previousMRR > 0 ? (growth / previousMRR) * 100 : 0;

        return {
            currentMRR: Math.round(currentMRR * 100) / 100,
            previousMRR: Math.round(previousMRR * 100) / 100,
            growth: Math.round(growth * 100) / 100,
            growthPercentage: Math.round(growthPercentage * 100) / 100,
        };
    }

    /**
     * Calculate churn rate
     */
    async calculateChurnRate(days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const [totalSubscriptionsStart, cancelledSubscriptions] = await Promise.all([
            // Total active subscriptions at start of period
            this.prisma.subscription.count({
                where: {
                    startDate: {
                        lt: since,
                    },
                    OR: [
                        { status: SubscriptionStatus.ACTIVE },
                        { status: SubscriptionStatus.CANCELLED },
                        { status: SubscriptionStatus.EXPIRED },
                    ],
                },
            }),
            // Cancelled subscriptions in period
            this.prisma.subscription.count({
                where: {
                    status: {
                        in: [SubscriptionStatus.CANCELLED, SubscriptionStatus.EXPIRED],
                    },
                    cancelledAt: {
                        gte: since,
                    },
                },
            }),
        ]);

        const churnRate = totalSubscriptionsStart > 0 ? (cancelledSubscriptions / totalSubscriptionsStart) * 100 : 0;

        return {
            totalSubscriptionsStart,
            cancelledSubscriptions,
            churnRate: Math.round(churnRate * 100) / 100,
            period: days,
        };
    }

    /**
     * Get revenue over time
     */
    async getRevenueOverTime(days = 30): Promise<RevenueData[]> {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const transactions = await this.prisma.subscriptionTransaction.findMany({
            where: {
                status: TransactionStatus.COMPLETED,
                createdAt: {
                    gte: since,
                },
            },
            select: {
                amount: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });

        // Group by date
        const revenueMap = new Map<string, { revenue: number; count: number }>();

        for (const tx of transactions) {
            const dateKey = tx.createdAt.toISOString().split('T')[0];
            if (!revenueMap.has(dateKey)) {
                revenueMap.set(dateKey, { revenue: 0, count: 0 });
            }
            const entry = revenueMap.get(dateKey)!;
            entry.revenue += tx.amount;
            entry.count++;
        }

        return Array.from(revenueMap.entries())
            .map(([date, data]) => ({
                date,
                revenue: Math.round(data.revenue * 100) / 100,
                transactions: data.count,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    /**
     * Get subscription metrics
     */
    async getSubscriptionMetrics(days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const [
            totalRevenue,
            totalTransactions,
            newSubscriptions,
            activeSubscriptions,
            trialSubscriptions,
            cancelledSubscriptions,
            avgRevenuePerUser,
        ] = await Promise.all([
            // Total revenue
            this.prisma.subscriptionTransaction.aggregate({
                where: {
                    status: TransactionStatus.COMPLETED,
                    createdAt: { gte: since },
                },
                _sum: {
                    amount: true,
                },
            }),
            // Total transactions
            this.prisma.subscriptionTransaction.count({
                where: {
                    status: TransactionStatus.COMPLETED,
                    createdAt: { gte: since },
                },
            }),
            // New subscriptions
            this.prisma.subscription.count({
                where: {
                    startDate: { gte: since },
                    status: {
                        in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL],
                    },
                },
            }),
            // Active subscriptions
            this.prisma.subscription.count({
                where: {
                    status: SubscriptionStatus.ACTIVE,
                },
            }),
            // Trial subscriptions
            this.prisma.subscription.count({
                where: {
                    status: SubscriptionStatus.TRIAL,
                },
            }),
            // Cancelled subscriptions
            this.prisma.subscription.count({
                where: {
                    status: {
                        in: [SubscriptionStatus.CANCELLED, SubscriptionStatus.EXPIRED],
                    },
                    cancelledAt: { gte: since },
                },
            }),
            // Average revenue per user
            this.prisma.subscriptionTransaction.aggregate({
                where: {
                    status: TransactionStatus.COMPLETED,
                    createdAt: { gte: since },
                },
                _avg: {
                    amount: true,
                },
            }),
        ]);

        return {
            totalRevenue: Math.round((totalRevenue._sum.amount || 0) * 100) / 100,
            totalTransactions,
            newSubscriptions,
            activeSubscriptions,
            trialSubscriptions,
            cancelledSubscriptions,
            avgRevenuePerUser: Math.round((avgRevenuePerUser._avg.amount || 0) * 100) / 100,
            conversionRate:
                newSubscriptions > 0
                    ? Math.round((activeSubscriptions / (newSubscriptions + activeSubscriptions)) * 10000) / 100
                    : 0,
        };
    }

    /**
     * Get payment provider breakdown
     */
    async getPaymentProviderBreakdown(days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const transactions = await this.prisma.subscriptionTransaction.groupBy({
            by: ['provider'],
            where: {
                status: TransactionStatus.COMPLETED,
                createdAt: { gte: since },
            },
            _sum: {
                amount: true,
            },
            _count: {
                id: true,
            },
        });

        return transactions.map((tx) => ({
            provider: tx.provider,
            revenue: Math.round((tx._sum.amount || 0) * 100) / 100,
            transactions: tx._count.id,
        }));
    }

    /**
     * Get subscription tier breakdown
     */
    async getSubscriptionTierBreakdown() {
        const subscriptions = await this.prisma.subscription.groupBy({
            by: ['tier', 'status'],
            where: {
                status: {
                    in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL],
                },
            },
            _count: {
                id: true,
            },
        });

        return subscriptions.map((sub) => ({
            tier: sub.tier || 'FREE',
            status: sub.status,
            count: sub._count.id,
        }));
    }

    /**
     * Forecast next month revenue (simple linear projection)
     */
    async forecastRevenue() {
        const mrr = await this.calculateMRR();
        const churn = await this.calculateChurnRate(30);

        // Simple forecast: current MRR * (1 - churn rate / 100) + expected growth
        const expectedChurnLoss = mrr.currentMRR * (churn.churnRate / 100);
        const expectedGrowth = mrr.growth > 0 ? mrr.growth : 0;
        const forecastedMRR = mrr.currentMRR - expectedChurnLoss + expectedGrowth;

        return {
            currentMRR: mrr.currentMRR,
            forecastedMRR: Math.round(forecastedMRR * 100) / 100,
            expectedChurnLoss: Math.round(expectedChurnLoss * 100) / 100,
            expectedGrowth: Math.round(expectedGrowth * 100) / 100,
            confidence: 'low', // Simple model, low confidence
        };
    }
}
