import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';
import { SubscriptionNotificationService } from './subscription-notification.service';

/**
 * Subscription Scheduler Service
 * Handles scheduled jobs for subscription management
 * Requirements: 6.7, 4.6, 12.6, 16.6, 12.4
 */
@Injectable()
export class SubscriptionSchedulerService {
    private readonly logger = new Logger(SubscriptionSchedulerService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationService: SubscriptionNotificationService,
    ) { }

    /**
     * Quota Reset Job
     * Runs at 00:00 on the 1st day of every month
     * Resets AI message quota for all users
     * Requirements: 6.7
     */
    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
    async handleQuotaReset() {
        this.logger.log('Starting monthly quota reset job');

        try {
            // Get all subscriptions that need quota reset
            const now = new Date();
            const subscriptions = await this.prisma.subscription.findMany({
                where: {
                    quotaResetDate: {
                        lte: now,
                    },
                },
            });

            this.logger.log(`Found ${subscriptions.length} subscriptions to reset`);

            let resetCount = 0;
            let errorCount = 0;

            // Reset quota for each subscription
            for (const subscription of subscriptions) {
                try {
                    // Determine new limit based on subscription status
                    let newLimit = 100; // Free tier default
                    if (
                        subscription.status === SubscriptionStatus.ACTIVE ||
                        subscription.status === SubscriptionStatus.TRIAL
                    ) {
                        newLimit = 1000; // Premium tier
                    }

                    // Calculate next reset date (1st of next month)
                    const nextResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

                    // Reset quota
                    await this.prisma.subscription.update({
                        where: { id: subscription.id },
                        data: {
                            aiMessagesUsed: 0,
                            aiMessagesLimit: newLimit,
                            quotaResetDate: nextResetDate,
                        },
                    });

                    resetCount++;
                    this.logger.debug(
                        `Reset quota for subscription ${subscription.id} (user: ${subscription.userId})`,
                    );
                } catch (error) {
                    errorCount++;
                    this.logger.error(
                        `Failed to reset quota for subscription ${subscription.id}: ${error.message}`,
                    );
                }
            }

            this.logger.log(
                `Quota reset job completed: ${resetCount} successful, ${errorCount} failed`,
            );
        } catch (error) {
            this.logger.error(`Quota reset job failed: ${error.message}`, error.stack);
        }
    }

    /**
     * Expiration Check Job
     * Runs daily at 00:00
     * Checks for expired subscriptions and downgrades them to free tier
     * Requirements: 4.6, 12.6
     */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleExpirationCheck() {
        this.logger.log('Starting daily expiration check job');

        try {
            const now = new Date();

            // Find all active or cancelled subscriptions that have expired
            const expiredSubscriptions = await this.prisma.subscription.findMany({
                where: {
                    OR: [
                        { status: SubscriptionStatus.ACTIVE },
                        { status: SubscriptionStatus.CANCELLED },
                    ],
                    endDate: {
                        lte: now,
                    },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            profile: {
                                select: {
                                    displayName: true,
                                },
                            },
                        },
                    },
                },
            });

            this.logger.log(`Found ${expiredSubscriptions.length} expired subscriptions`);

            let expiredCount = 0;
            let errorCount = 0;

            // Process each expired subscription
            for (const subscription of expiredSubscriptions) {
                try {
                    // Update subscription to expired status
                    await this.prisma.subscription.update({
                        where: { id: subscription.id },
                        data: {
                            status: SubscriptionStatus.EXPIRED,
                            aiMessagesLimit: 100, // Reset to free tier limit
                            isInGracePeriod: false,
                            gracePeriodEndDate: null,
                        },
                    });

                    expiredCount++;
                    this.logger.debug(
                        `Expired subscription ${subscription.id} for user ${subscription.userId}`,
                    );

                    // Send expiration notification
                    await this.notificationService.sendSubscriptionExpired(subscription.userId);
                } catch (error) {
                    errorCount++;
                    this.logger.error(
                        `Failed to expire subscription ${subscription.id}: ${error.message}`,
                    );
                }
            }

            this.logger.log(
                `Expiration check job completed: ${expiredCount} expired, ${errorCount} failed`,
            );
        } catch (error) {
            this.logger.error(`Expiration check job failed: ${error.message}`, error.stack);
        }
    }

    /**
     * Grace Period Check Job
     * Runs daily at 01:00 (1 hour after expiration check)
     * Checks for grace periods that have ended and downgrades to free tier
     * Requirements: 16.6
     */
    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async handleGracePeriodCheck() {
        this.logger.log('Starting daily grace period check job');

        try {
            const now = new Date();

            // Find all subscriptions in grace period that have ended
            const endedGracePeriods = await this.prisma.subscription.findMany({
                where: {
                    status: SubscriptionStatus.GRACE_PERIOD,
                    gracePeriodEndDate: {
                        lte: now,
                    },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            profile: {
                                select: {
                                    displayName: true,
                                },
                            },
                        },
                    },
                },
            });

            this.logger.log(
                `Found ${endedGracePeriods.length} grace periods that have ended`,
            );

            let downgradedCount = 0;
            let errorCount = 0;

            // Process each ended grace period
            for (const subscription of endedGracePeriods) {
                try {
                    // Downgrade to free tier
                    await this.prisma.subscription.update({
                        where: { id: subscription.id },
                        data: {
                            status: SubscriptionStatus.EXPIRED,
                            aiMessagesLimit: 100, // Reset to free tier limit
                            isInGracePeriod: false,
                            gracePeriodEndDate: null,
                        },
                    });

                    downgradedCount++;
                    this.logger.debug(
                        `Downgraded subscription ${subscription.id} after grace period for user ${subscription.userId}`,
                    );

                    // Send expiration notification (grace period ended)
                    await this.notificationService.sendSubscriptionExpired(subscription.userId);
                } catch (error) {
                    errorCount++;
                    this.logger.error(
                        `Failed to downgrade subscription ${subscription.id} after grace period: ${error.message}`,
                    );
                }
            }

            this.logger.log(
                `Grace period check job completed: ${downgradedCount} downgraded, ${errorCount} failed`,
            );
        } catch (error) {
            this.logger.error(
                `Grace period check job failed: ${error.message}`,
                error.stack,
            );
        }
    }

    /**
     * Expiring Soon Check Job
     * Runs daily at 10:00
     * Sends notification to users whose subscription expires in 3 days
     * Requirements: 12.4
     */
    @Cron(CronExpression.EVERY_DAY_AT_10AM)
    async handleExpiringSoonCheck() {
        this.logger.log('Starting daily expiring soon check job');

        try {
            const now = new Date();
            const threeDaysFromNow = new Date(now);
            threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

            // Set time range for 3 days from now (with 1 hour buffer)
            const startOfDay = new Date(threeDaysFromNow);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(threeDaysFromNow);
            endOfDay.setHours(23, 59, 59, 999);

            // Find all active subscriptions expiring in 3 days
            const expiringSoonSubscriptions = await this.prisma.subscription.findMany({
                where: {
                    status: SubscriptionStatus.ACTIVE,
                    endDate: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            profile: {
                                select: {
                                    displayName: true,
                                },
                            },
                        },
                    },
                },
            });

            this.logger.log(
                `Found ${expiringSoonSubscriptions.length} subscriptions expiring in 3 days`,
            );

            let notifiedCount = 0;
            let errorCount = 0;

            // Send notification to each user
            for (const subscription of expiringSoonSubscriptions) {
                try {
                    if (subscription.endDate) {
                        await this.notificationService.sendSubscriptionExpiringSoon(
                            subscription.userId,
                            subscription.endDate,
                        );

                        notifiedCount++;
                        this.logger.debug(
                            `Sent expiring soon notification for subscription ${subscription.id} (user: ${subscription.userId})`,
                        );
                    }
                } catch (error) {
                    errorCount++;
                    this.logger.error(
                        `Failed to send expiring soon notification for subscription ${subscription.id}: ${error.message}`,
                    );
                }
            }

            this.logger.log(
                `Expiring soon check job completed: ${notifiedCount} notified, ${errorCount} failed`,
            );
        } catch (error) {
            this.logger.error(
                `Expiring soon check job failed: ${error.message}`,
                error.stack,
            );
        }
    }

    /**
     * Manual trigger for quota reset (for testing/admin purposes)
     */
    async triggerQuotaReset() {
        this.logger.log('Manually triggering quota reset');
        await this.handleQuotaReset();
    }

    /**
     * Manual trigger for expiration check (for testing/admin purposes)
     */
    async triggerExpirationCheck() {
        this.logger.log('Manually triggering expiration check');
        await this.handleExpirationCheck();
    }

    /**
     * Manual trigger for grace period check (for testing/admin purposes)
     */
    async triggerGracePeriodCheck() {
        this.logger.log('Manually triggering grace period check');
        await this.handleGracePeriodCheck();
    }

    /**
     * Manual trigger for expiring soon check (for testing/admin purposes)
     */
    async triggerExpiringSoonCheck() {
        this.logger.log('Manually triggering expiring soon check');
        await this.handleExpiringSoonCheck();
    }
}
