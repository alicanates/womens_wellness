import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionStatus, SubscriptionTier, TransactionType } from '@prisma/client';

/**
 * Subscription Analytics Service
 * Provides metrics and insights for subscription business
 * Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6
 */
@Injectable()
export class SubscriptionAnalyticsService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Log subscription event for analytics
     * Tracks all subscription lifecycle events
     */
    async logSubscriptionEvent(
        userId: string,
        eventType: string,
        metadata?: Record<string, any>,
    ): Promise<void> {
        await this.prisma.auditLog.create({
            data: {
                userId,
                action: eventType,
                entity: 'subscription',
                entityId: userId,
                metadataJson: metadata || {},
            },
        });
    }

    /**
     * Track conversion event
     * Records when a free user converts to premium
     */
    async trackConversion(
        userId: string,
        tier: SubscriptionTier,
        amount: number,
        source?: string,
    ): Promise<void> {
        await this.logSubscriptionEvent(userId, 'subscription_conversion', {
            tier,
            amount,
            source: source || 'direct',
            convertedAt: new Date().toISOString(),
        });
    }

    /**
     * Track churn event
     * Records when a premium user cancels or expires
     */
    async trackChurn(
        userId: string,
        reason: 'cancelled' | 'expired' | 'payment_failed',
        metadata?: Record<string, any>,
    ): Promise<void> {
        await this.logSubscriptionEvent(userId, 'subscription_churn', {
            reason,
            churnedAt: new Date().toISOString(),
            ...metadata,
        });
    }

    /**
     * Calculate Monthly Recurring Revenue (MRR)
     * Returns current MRR based on active subscriptions
     */
    async calculateMRR(): Promise<{
        totalMRR: number;
        monthlyMRR: number;
        yearlyMRR: number;
        activeSubscriptions: number;
    }> {
        // Get all active subscriptions
        const activeSubscriptions = await this.prisma.subscription.findMany({
            where: {
                status: {
                    in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL, SubscriptionStatus.GRACE_PERIOD],
                },
            },
            select: {
                tier: true,
            },
        });

        // Calculate MRR
        let monthlyMRR = 0;
        let yearlyMRR = 0;

        for (const sub of activeSubscriptions) {
            if (sub.tier === SubscriptionTier.MONTHLY) {
                monthlyMRR += 99; // ₺99/month
            } else if (sub.tier === SubscriptionTier.YEARLY) {
                yearlyMRR += 999 / 12; // ₺999/year = ₺83.25/month
            }
        }

        const totalMRR = monthlyMRR + yearlyMRR;

        return {
            totalMRR: Math.round(totalMRR * 100) / 100,
            monthlyMRR: Math.round(monthlyMRR * 100) / 100,
            yearlyMRR: Math.round(yearlyMRR * 100) / 100,
            activeSubscriptions: activeSubscriptions.length,
        };
    }

    /**
     * Calculate Average Revenue Per User (ARPU)
     * Returns ARPU for all users and paying users
     */
    async calculateARPU(): Promise<{
        overallARPU: number;
        payingARPU: number;
        totalUsers: number;
        payingUsers: number;
    }> {
        // Get total users
        const totalUsers = await this.prisma.user.count();

        // Get MRR
        const { totalMRR, activeSubscriptions } = await this.calculateMRR();

        // Calculate ARPU
        const overallARPU = totalUsers > 0 ? totalMRR / totalUsers : 0;
        const payingARPU = activeSubscriptions > 0 ? totalMRR / activeSubscriptions : 0;

        return {
            overallARPU: Math.round(overallARPU * 100) / 100,
            payingARPU: Math.round(payingARPU * 100) / 100,
            totalUsers,
            payingUsers: activeSubscriptions,
        };
    }

    /**
     * Calculate churn rate
     * Returns churn rate for the specified period
     */
    async calculateChurnRate(
        startDate: Date,
        endDate: Date,
    ): Promise<{
        churnRate: number;
        churnedUsers: number;
        activeUsersAtStart: number;
        churnReasons: Record<string, number>;
    }> {
        // Get active users at start of period
        const activeUsersAtStart = await this.prisma.subscription.count({
            where: {
                status: {
                    in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL],
                },
                startDate: {
                    lt: startDate,
                },
            },
        });

        // Get churned users during period
        const churnEvents = await this.prisma.auditLog.findMany({
            where: {
                action: 'subscription_churn',
                entity: 'subscription',
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        // Count churn reasons
        const churnReasons: Record<string, number> = {};
        for (const event of churnEvents) {
            const reason = (event.metadataJson as any)?.reason || 'unknown';
            churnReasons[reason] = (churnReasons[reason] || 0) + 1;
        }

        const churnedUsers = churnEvents.length;
        const churnRate = activeUsersAtStart > 0
            ? (churnedUsers / activeUsersAtStart) * 100
            : 0;

        return {
            churnRate: Math.round(churnRate * 100) / 100,
            churnedUsers,
            activeUsersAtStart,
            churnReasons,
        };
    }

    /**
     * Get conversion metrics
     * Returns conversion funnel data
     */
    async getConversionMetrics(
        startDate: Date,
        endDate: Date,
    ): Promise<{
        totalUsers: number;
        trialStarts: number;
        conversions: number;
        conversionRate: number;
        averageTimeToConvert: number;
    }> {
        // Get total users in period
        const totalUsers = await this.prisma.user.count({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        // Get trial starts
        const trialStarts = await this.prisma.subscription.count({
            where: {
                status: SubscriptionStatus.TRIAL,
                startDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        // Get conversions
        const conversionEvents = await this.prisma.auditLog.findMany({
            where: {
                action: 'subscription_conversion',
                entity: 'subscription',
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        const conversions = conversionEvents.length;
        const conversionRate = totalUsers > 0 ? (conversions / totalUsers) * 100 : 0;

        // Calculate average time to convert
        let totalTimeToConvert = 0;
        let validConversions = 0;

        for (const event of conversionEvents) {
            if (event.userId) {
                const user = await this.prisma.user.findUnique({
                    where: { id: event.userId },
                    select: { createdAt: true },
                });

                if (user) {
                    const timeToConvert = event.createdAt.getTime() - user.createdAt.getTime();
                    totalTimeToConvert += timeToConvert;
                    validConversions++;
                }
            }
        }

        const averageTimeToConvert = validConversions > 0
            ? totalTimeToConvert / validConversions / (1000 * 60 * 60 * 24) // Convert to days
            : 0;

        return {
            totalUsers,
            trialStarts,
            conversions,
            conversionRate: Math.round(conversionRate * 100) / 100,
            averageTimeToConvert: Math.round(averageTimeToConvert * 100) / 100,
        };
    }

    /**
     * Get revenue metrics
     * Returns detailed revenue breakdown
     */
    async getRevenueMetrics(
        startDate: Date,
        endDate: Date,
    ): Promise<{
        totalRevenue: number;
        newRevenue: number;
        renewalRevenue: number;
        refundedRevenue: number;
        transactionCount: number;
        averageTransactionValue: number;
    }> {
        // Get all completed transactions in period
        const transactions = await this.prisma.subscriptionTransaction.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
                status: {
                    in: ['COMPLETED', 'REFUNDED'],
                },
            },
        });

        let totalRevenue = 0;
        let newRevenue = 0;
        let renewalRevenue = 0;
        let refundedRevenue = 0;

        for (const transaction of transactions) {
            if (transaction.status === 'REFUNDED') {
                refundedRevenue += transaction.amount;
            } else {
                totalRevenue += transaction.amount;

                if (transaction.type === TransactionType.INITIAL_PURCHASE) {
                    newRevenue += transaction.amount;
                } else if (transaction.type === TransactionType.RENEWAL) {
                    renewalRevenue += transaction.amount;
                }
            }
        }

        const transactionCount = transactions.filter(t => t.status === 'COMPLETED').length;
        const averageTransactionValue = transactionCount > 0
            ? totalRevenue / transactionCount
            : 0;

        return {
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            newRevenue: Math.round(newRevenue * 100) / 100,
            renewalRevenue: Math.round(renewalRevenue * 100) / 100,
            refundedRevenue: Math.round(refundedRevenue * 100) / 100,
            transactionCount,
            averageTransactionValue: Math.round(averageTransactionValue * 100) / 100,
        };
    }

    /**
     * Get subscription distribution
     * Returns breakdown of subscriptions by tier and status
     */
    async getSubscriptionDistribution(): Promise<{
        byTier: Record<string, number>;
        byStatus: Record<string, number>;
        byProvider: Record<string, number>;
    }> {
        const subscriptions = await this.prisma.subscription.findMany({
            select: {
                tier: true,
                status: true,
                provider: true,
            },
        });

        const byTier: Record<string, number> = {};
        const byStatus: Record<string, number> = {};
        const byProvider: Record<string, number> = {};

        for (const sub of subscriptions) {
            // Count by tier
            const tier = sub.tier || 'FREE';
            byTier[tier] = (byTier[tier] || 0) + 1;

            // Count by status
            byStatus[sub.status] = (byStatus[sub.status] || 0) + 1;

            // Count by provider
            if (sub.provider) {
                byProvider[sub.provider] = (byProvider[sub.provider] || 0) + 1;
            }
        }

        return {
            byTier,
            byStatus,
            byProvider,
        };
    }

    /**
     * Get comprehensive analytics dashboard
     * Returns all key metrics in one call
     */
    async getDashboardMetrics(
        startDate?: Date,
        endDate?: Date,
    ): Promise<{
        mrr: Awaited<ReturnType<typeof this.calculateMRR>>;
        arpu: Awaited<ReturnType<typeof this.calculateARPU>>;
        churn: Awaited<ReturnType<typeof this.calculateChurnRate>>;
        conversion: Awaited<ReturnType<typeof this.getConversionMetrics>>;
        revenue: Awaited<ReturnType<typeof this.getRevenueMetrics>>;
        distribution: Awaited<ReturnType<typeof this.getSubscriptionDistribution>>;
    }> {
        // Default to last 30 days if not specified
        const end = endDate || new Date();
        const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [mrr, arpu, churn, conversion, revenue, distribution] = await Promise.all([
            this.calculateMRR(),
            this.calculateARPU(),
            this.calculateChurnRate(start, end),
            this.getConversionMetrics(start, end),
            this.getRevenueMetrics(start, end),
            this.getSubscriptionDistribution(),
        ]);

        return {
            mrr,
            arpu,
            churn,
            conversion,
            revenue,
            distribution,
        };
    }

    /**
     * Get user lifetime value (LTV)
     * Calculates average LTV based on historical data
     */
    async calculateLTV(): Promise<{
        averageLTV: number;
        averageLifetimeMonths: number;
        totalRevenue: number;
        totalChurnedUsers: number;
    }> {
        // Get all churned subscriptions
        const churnedSubscriptions = await this.prisma.subscription.findMany({
            where: {
                status: {
                    in: [SubscriptionStatus.EXPIRED, SubscriptionStatus.CANCELLED],
                },
                startDate: { not: null },
                endDate: { not: null },
            },
            include: {
                transactions: {
                    where: {
                        status: 'COMPLETED',
                    },
                },
            },
        });

        let totalRevenue = 0;
        let totalLifetimeMonths = 0;

        for (const sub of churnedSubscriptions) {
            // Calculate revenue from this subscription
            const subRevenue = sub.transactions.reduce((sum, t) => sum + t.amount, 0);
            totalRevenue += subRevenue;

            // Calculate lifetime in months
            if (sub.startDate && sub.endDate) {
                const lifetimeMs = sub.endDate.getTime() - sub.startDate.getTime();
                const lifetimeMonths = lifetimeMs / (1000 * 60 * 60 * 24 * 30);
                totalLifetimeMonths += lifetimeMonths;
            }
        }

        const totalChurnedUsers = churnedSubscriptions.length;
        const averageLTV = totalChurnedUsers > 0 ? totalRevenue / totalChurnedUsers : 0;
        const averageLifetimeMonths = totalChurnedUsers > 0
            ? totalLifetimeMonths / totalChurnedUsers
            : 0;

        return {
            averageLTV: Math.round(averageLTV * 100) / 100,
            averageLifetimeMonths: Math.round(averageLifetimeMonths * 100) / 100,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            totalChurnedUsers,
        };
    }
}
