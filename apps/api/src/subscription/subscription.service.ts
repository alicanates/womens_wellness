import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionStatus, Subscription, PaymentProvider, SubscriptionTier, TransactionStatus, TransactionType } from '@prisma/client';
import { ReceiptValidatorService } from './receipt-validator.service';
import { SubscriptionNotificationService } from './subscription-notification.service';
import { SubscriptionAnalyticsService } from './subscription-analytics.service';
import { PurchaseDto, RestoreDto } from './dto';

@Injectable()
export class SubscriptionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly receiptValidator: ReceiptValidatorService,
        private readonly notificationService: SubscriptionNotificationService,
        private readonly analyticsService: SubscriptionAnalyticsService,
    ) { }

    /**
     * Get user subscription with status check
     * Automatically updates expired subscriptions
     * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
     */
    async getSubscription(userId: string): Promise<Subscription> {
        let subscription = await this.prisma.subscription.findUnique({
            where: { userId },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        // Create subscription if it doesn't exist
        if (!subscription) {
            subscription = await this.prisma.subscription.create({
                data: {
                    userId,
                    status: SubscriptionStatus.FREE,
                    aiMessagesLimit: 100,
                    aiMessagesUsed: 0,
                    quotaResetDate: this.getNextMonthStart(),
                },
                include: {
                    transactions: true,
                },
            });
            return subscription;
        }

        // Check if subscription has expired
        if (
            subscription.status === SubscriptionStatus.ACTIVE &&
            subscription.endDate &&
            new Date() > subscription.endDate
        ) {
            // Handle expiration
            await this.handleExpiration(subscription.id);
            // Refetch updated subscription
            const updatedSubscription = await this.prisma.subscription.findUnique({
                where: { userId },
                include: {
                    transactions: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                },
            });
            if (!updatedSubscription) {
                throw new NotFoundException('Abonelik bulunamadı');
            }
            return updatedSubscription;
        }

        // Check if grace period has ended
        if (
            subscription.status === SubscriptionStatus.GRACE_PERIOD &&
            subscription.gracePeriodEndDate &&
            new Date() > subscription.gracePeriodEndDate
        ) {
            // Grace period ended, downgrade to free
            await this.handleExpiration(subscription.id);
            // Refetch updated subscription
            const updatedSubscription = await this.prisma.subscription.findUnique({
                where: { userId },
                include: {
                    transactions: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                },
            });
            if (!updatedSubscription) {
                throw new NotFoundException('Abonelik bulunamadı');
            }
            return updatedSubscription;
        }

        return subscription;
    }

    /**
     * Check AI message quota
     * Returns quota status with usage information
     * Requirements: 6.1, 6.2, 6.3, 6.4
     */
    async checkQuota(userId: string): Promise<{
        hasQuota: boolean;
        used: number;
        limit: number;
        remaining: number;
        resetDate: Date;
        percentage: number;
    }> {
        const subscription = await this.getSubscription(userId);

        // Check if quota needs to be reset
        if (new Date() >= subscription.quotaResetDate) {
            await this.resetQuota(userId);
            // Refetch after reset
            const updatedSubscription = await this.getSubscription(userId);
            return this.calculateQuotaStatus(updatedSubscription);
        }

        return this.calculateQuotaStatus(subscription);
    }

    /**
     * Increment AI message usage
     * Throws error if quota exceeded
     * Requirements: 6.2, 6.3, 6.4, 6.5
     */
    async incrementMessageUsage(userId: string): Promise<void> {
        const subscription = await this.getSubscription(userId);

        // Check if user has quota
        if (subscription.aiMessagesUsed >= subscription.aiMessagesLimit) {
            throw new BadRequestException('AI mesaj kotanız doldu. Premium\'a geçerek sınırsız mesaj gönderin.');
        }

        // Increment usage
        await this.prisma.subscription.update({
            where: { userId },
            data: {
                aiMessagesUsed: {
                    increment: 1,
                },
            },
        });

        // Check if user is approaching limit (20% remaining)
        const newUsage = subscription.aiMessagesUsed + 1;
        const percentage = (newUsage / subscription.aiMessagesLimit) * 100;

        if (percentage >= 80 && percentage < 85) {
            // Send warning notification when 80% quota used
            await this.notificationService.sendQuotaWarning(
                userId,
                newUsage,
                subscription.aiMessagesLimit,
                subscription.quotaResetDate,
            );
        }
    }

    /**
     * Reset monthly quota
     * Called automatically when quota reset date is reached
     * Requirements: 6.7
     */
    async resetQuota(userId: string): Promise<void> {
        const subscription = await this.getSubscription(userId);

        // Determine new limit based on subscription status
        let newLimit = 100; // Free tier default
        if (
            subscription.status === SubscriptionStatus.ACTIVE ||
            subscription.status === SubscriptionStatus.TRIAL
        ) {
            newLimit = 1000; // Premium tier
        }

        await this.prisma.subscription.update({
            where: { userId },
            data: {
                aiMessagesUsed: 0,
                aiMessagesLimit: newLimit,
                quotaResetDate: this.getNextMonthStart(),
            },
        });
    }

    /**
     * Handle subscription expiration
     * Downgrades to free tier and sends notification
     * Requirements: 16.1, 16.2, 16.3, 16.4
     */
    async handleExpiration(subscriptionId: string): Promise<void> {
        const subscription = await this.prisma.subscription.findUnique({
            where: { id: subscriptionId },
        });

        if (!subscription) {
            throw new NotFoundException('Abonelik bulunamadı');
        }

        // Update subscription to expired status
        await this.prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                status: SubscriptionStatus.EXPIRED,
                aiMessagesLimit: 100, // Reset to free tier limit
                isInGracePeriod: false,
                gracePeriodEndDate: null,
            },
        });

        // Send expiration notification
        await this.notificationService.sendSubscriptionExpired(subscription.userId);

        // Track churn event
        await this.analyticsService.trackChurn(
            subscription.userId,
            'expired',
            {
                tier: subscription.tier,
                endDate: subscription.endDate?.toISOString(),
            },
        );

        // Log subscription event
        await this.analyticsService.logSubscriptionEvent(
            subscription.userId,
            'subscription_expired',
            {
                tier: subscription.tier,
                endDate: subscription.endDate?.toISOString(),
            },
        );
    }

    /**
     * Handle subscription renewal
     * Extends subscription and creates transaction record
     * Requirements: 16.1, 16.2, 16.3
     */
    async handleRenewal(
        subscriptionId: string,
        transactionId: string,
        receiptData: string,
    ): Promise<void> {
        const subscription = await this.prisma.subscription.findUnique({
            where: { id: subscriptionId },
        });

        if (!subscription) {
            throw new NotFoundException('Abonelik bulunamadı');
        }

        // Calculate new end date based on tier
        const currentEndDate = subscription.endDate || new Date();
        let newEndDate: Date;

        if (subscription.tier === 'MONTHLY') {
            newEndDate = new Date(currentEndDate);
            newEndDate.setMonth(newEndDate.getMonth() + 1);
        } else if (subscription.tier === 'YEARLY') {
            newEndDate = new Date(currentEndDate);
            newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        } else {
            throw new BadRequestException('Geçersiz abonelik seviyesi');
        }

        // Update subscription
        await this.prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                status: SubscriptionStatus.ACTIVE,
                endDate: newEndDate,
                isInGracePeriod: false,
                gracePeriodEndDate: null,
                latestReceiptData: receiptData,
            },
        });

        // Send renewal confirmation notification
        if (subscription.tier) {
            await this.notificationService.sendSubscriptionRenewed(
                subscription.userId,
                subscription.tier,
                newEndDate,
            );
        }

        // Log renewal event
        await this.analyticsService.logSubscriptionEvent(
            subscription.userId,
            'subscription_renewed',
            {
                tier: subscription.tier,
                transactionId,
                newEndDate: newEndDate.toISOString(),
            },
        );
    }

    /**
     * Handle grace period for failed payments
     * Gives user 7 days to fix payment issues
     * Requirements: 16.5, 16.6, 16.7
     */
    async handleGracePeriod(subscriptionId: string): Promise<void> {
        const subscription = await this.prisma.subscription.findUnique({
            where: { id: subscriptionId },
        });

        if (!subscription) {
            throw new NotFoundException('Abonelik bulunamadı');
        }

        // Set grace period (7 days from now)
        const gracePeriodEndDate = new Date();
        gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + 7);

        await this.prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                status: SubscriptionStatus.GRACE_PERIOD,
                isInGracePeriod: true,
                gracePeriodEndDate,
            },
        });

        // Send payment failure notification
        await this.notificationService.sendPaymentFailed(
            subscription.userId,
            gracePeriodEndDate,
        );

        // Track churn event (payment failed)
        await this.analyticsService.trackChurn(
            subscription.userId,
            'payment_failed',
            {
                tier: subscription.tier,
                gracePeriodEndDate: gracePeriodEndDate.toISOString(),
            },
        );

        // Log grace period event
        await this.analyticsService.logSubscriptionEvent(
            subscription.userId,
            'subscription_grace_period',
            {
                tier: subscription.tier,
                gracePeriodEndDate: gracePeriodEndDate.toISOString(),
            },
        );
    }

    // Helper methods

    /**
     * Calculate quota status from subscription
     */
    private calculateQuotaStatus(subscription: Subscription) {
        const used = subscription.aiMessagesUsed;
        const limit = subscription.aiMessagesLimit;
        const remaining = Math.max(0, limit - used);
        const percentage = (used / limit) * 100;

        return {
            hasQuota: remaining > 0,
            used,
            limit,
            remaining,
            resetDate: subscription.quotaResetDate,
            percentage: Math.round(percentage),
        };
    }

    /**
     * Get the start of next month
     */
    private getNextMonthStart(): Date {
        const now = new Date();
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return nextMonth;
    }

    /**
     * Process new purchase
     * Validates receipt and creates/updates subscription
     * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8
     */
    async processPurchase(userId: string, purchaseDto: PurchaseDto): Promise<Subscription> {
        const { receipt, provider, productId, transactionId } = purchaseDto;

        // Validate receipt with provider
        let validatedData: any;
        try {
            if (provider === PaymentProvider.APPLE) {
                validatedData = await this.receiptValidator.validateAppleReceipt(receipt);
            } else if (provider === PaymentProvider.GOOGLE) {
                // For Google, productId is the subscription ID and transactionId is the purchase token
                validatedData = await this.receiptValidator.validateGoogleReceipt(
                    'com.wellness.companion', // TODO: Get from config
                    productId,
                    transactionId,
                );
            } else {
                throw new BadRequestException('Geçersiz ödeme sağlayıcısı');
            }
        } catch (error) {
            throw new BadRequestException('Makbuz doğrulaması başarısız: ' + error.message);
        }

        // Determine tier from product ID
        const tier = productId.includes('yearly') ? SubscriptionTier.YEARLY : SubscriptionTier.MONTHLY;

        // Calculate dates
        const startDate = new Date();
        const endDate = new Date();
        if (tier === SubscriptionTier.MONTHLY) {
            endDate.setMonth(endDate.getMonth() + 1);
        } else {
            endDate.setFullYear(endDate.getFullYear() + 1);
        }

        // Check if user has existing subscription
        const existingSubscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });

        let subscription: Subscription;

        if (existingSubscription) {
            // Update existing subscription
            subscription = await this.prisma.subscription.update({
                where: { userId },
                data: {
                    status: SubscriptionStatus.ACTIVE,
                    tier,
                    startDate,
                    endDate,
                    provider,
                    originalTransactionId: transactionId,
                    latestReceiptData: receipt,
                    aiMessagesLimit: 1000, // Premium limit
                    isInGracePeriod: false,
                    gracePeriodEndDate: null,
                },
            });
        } else {
            // Create new subscription
            subscription = await this.prisma.subscription.create({
                data: {
                    userId,
                    status: SubscriptionStatus.ACTIVE,
                    tier,
                    startDate,
                    endDate,
                    provider,
                    originalTransactionId: transactionId,
                    latestReceiptData: receipt,
                    aiMessagesLimit: 1000, // Premium limit
                    aiMessagesUsed: 0,
                    quotaResetDate: this.getNextMonthStart(),
                },
            });
        }

        // Create transaction record
        await this.prisma.subscriptionTransaction.create({
            data: {
                subscriptionId: subscription.id,
                transactionId,
                originalTransactionId: transactionId,
                productId,
                amount: tier === SubscriptionTier.YEARLY ? 999 : 99, // TODO: Get from config
                currency: 'TRY',
                status: TransactionStatus.COMPLETED,
                type: TransactionType.INITIAL_PURCHASE,
                provider,
                receiptData: receipt,
                validatedAt: new Date(),
            },
        });

        // Send subscription started notification
        await this.notificationService.sendSubscriptionStarted(
            userId,
            tier,
            endDate,
        );

        // Track conversion event
        await this.analyticsService.trackConversion(
            userId,
            tier,
            tier === SubscriptionTier.YEARLY ? 999 : 99,
            'mobile_app',
        );

        // Log subscription event
        await this.analyticsService.logSubscriptionEvent(
            userId,
            'subscription_started',
            {
                tier,
                provider,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            },
        );

        return subscription;
    }

    /**
     * Restore purchases
     * Validates receipts and restores subscription
     * Requirements: 2.5, 2.6, 14.1, 14.2, 14.3, 14.4, 14.5
     */
    async restorePurchases(userId: string, restoreDto: RestoreDto): Promise<Subscription> {
        const { receipts, provider } = restoreDto;

        if (!receipts || receipts.length === 0) {
            throw new BadRequestException('En az bir makbuz gerekli');
        }

        // Validate all receipts and find the most recent active one
        let mostRecentReceipt: any = null;
        let mostRecentDate: Date | null = null;

        for (const receipt of receipts) {
            try {
                let validatedData: any;
                if (provider === PaymentProvider.APPLE) {
                    validatedData = await this.receiptValidator.validateAppleReceipt(receipt);
                } else {
                    // For Google, we need to parse the receipt to get productId and token
                    // This is a simplified version - in production, you'd parse the receipt properly
                    continue;
                }

                // Check if this receipt is more recent
                const receiptDate = new Date(validatedData.expiresDate || validatedData.purchaseDate);
                if (!mostRecentDate || receiptDate > mostRecentDate) {
                    mostRecentDate = receiptDate;
                    mostRecentReceipt = { receipt, validatedData };
                }
            } catch (error) {
                // Skip invalid receipts
                console.log(`Skipping invalid receipt: ${error.message}`);
            }
        }

        if (!mostRecentReceipt) {
            throw new BadRequestException('Geçerli bir abonelik bulunamadı');
        }

        // Restore subscription using the most recent receipt
        const { receipt, validatedData } = mostRecentReceipt;
        const productId = validatedData.productId;
        const transactionId = validatedData.transactionId;

        // Use processPurchase to restore
        return this.processPurchase(userId, {
            receipt,
            provider,
            productId,
            transactionId,
        });
    }

    /**
     * Cancel subscription
     * Marks subscription as cancelled but maintains access until end date
     * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
     */
    async cancelSubscription(userId: string): Promise<void> {
        const subscription = await this.getSubscription(userId);

        if (subscription.status !== SubscriptionStatus.ACTIVE) {
            throw new BadRequestException('Sadece aktif abonelikler iptal edilebilir');
        }

        // Mark as cancelled but keep access until end date
        await this.prisma.subscription.update({
            where: { userId },
            data: {
                status: SubscriptionStatus.CANCELLED,
                cancelledAt: new Date(),
            },
        });

        // Send cancellation confirmation notification
        if (subscription.endDate) {
            await this.notificationService.sendSubscriptionCancelled(
                userId,
                subscription.endDate,
            );
        }

        // Track churn event
        await this.analyticsService.trackChurn(
            userId,
            'cancelled',
            {
                tier: subscription.tier,
                cancelledAt: new Date().toISOString(),
                endDate: subscription.endDate?.toISOString(),
            },
        );

        // Log subscription event
        await this.analyticsService.logSubscriptionEvent(
            userId,
            'subscription_cancelled',
            {
                tier: subscription.tier,
                cancelledAt: new Date().toISOString(),
            },
        );
    }

    /**
     * Get transaction history
     * Returns all transactions for user's subscription
     * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6
     */
    async getTransactions(userId: string) {
        const subscription = await this.getSubscription(userId);

        return this.prisma.subscriptionTransaction.findMany({
            where: { subscriptionId: subscription.id },
            orderBy: { createdAt: 'desc' },
            take: 12, // Last 12 transactions (1 year for monthly)
        });
    }

    /**
     * Get usage statistics
     * Returns feature usage and benefits
     * Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6
     */
    async getUsageStats(userId: string) {
        const subscription = await this.getSubscription(userId);

        // Get premium feature usage
        const featureUsage = await this.prisma.premiumFeatureUsage.findMany({
            where: { userId },
            orderBy: { usageCount: 'desc' },
        });

        // Calculate time saved (estimate: 2 minutes per AI message)
        const timeSaved = subscription.aiMessagesUsed * 2;

        // Count insights generated (from premium feature usage)
        const insightsFeature = featureUsage.find(f => f.feature === 'insights');
        const insightsGenerated = insightsFeature?.usageCount || 0;

        // Get user's streak from home service (if available)
        // For now, return 0 as streak calculation is in home service
        const currentStreak = 0;

        // Member since date
        const memberSince = subscription.startDate?.toISOString() || subscription.createdAt.toISOString();

        return {
            totalMessages: subscription.aiMessagesUsed,
            premiumFeaturesUsed: featureUsage.map(f => ({
                feature: f.feature,
                count: f.usageCount,
            })),
            timeSaved,
            insightsGenerated,
            memberSince,
            currentStreak,
        };
    }
}
