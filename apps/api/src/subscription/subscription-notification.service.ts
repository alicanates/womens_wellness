import { Injectable, Logger } from '@nestjs/common';
import { PushService } from '../reminders/push.service';
import { SubscriptionTier } from '@prisma/client';

/**
 * Subscription Notification Service
 * Handles all subscription-related push notifications
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 6.3
 */
@Injectable()
export class SubscriptionNotificationService {
    private readonly logger = new Logger(SubscriptionNotificationService.name);

    constructor(private readonly pushService: PushService) { }

    /**
     * Send subscription started notification
     * Requirement: 12.1
     */
    async sendSubscriptionStarted(
        userId: string,
        tier: SubscriptionTier,
        endDate: Date,
    ): Promise<void> {
        try {
            const tierText = tier === SubscriptionTier.YEARLY ? 'Yıllık' : 'Aylık';
            const endDateText = this.formatDate(endDate);

            await this.pushService.sendPush(userId, {
                to: '', // Will be filled by PushService
                title: '🎉 Premium Aboneliğiniz Başladı!',
                body: `${tierText} Premium planınız aktif. ${endDateText} tarihine kadar geçerli.`,
                data: {
                    type: 'subscription_started',
                    tier,
                    endDate: endDate.toISOString(),
                },
            });

            this.logger.log(`Subscription started notification sent to user ${userId}`);
        } catch (error) {
            this.logger.error(
                `Failed to send subscription started notification: ${error.message}`,
            );
        }
    }

    /**
     * Send subscription renewed notification
     * Requirement: 12.2
     */
    async sendSubscriptionRenewed(
        userId: string,
        tier: SubscriptionTier,
        newEndDate: Date,
    ): Promise<void> {
        try {
            const tierText = tier === SubscriptionTier.YEARLY ? 'Yıllık' : 'Aylık';
            const endDateText = this.formatDate(newEndDate);

            await this.pushService.sendPush(userId, {
                to: '',
                title: '✅ Aboneliğiniz Yenilendi',
                body: `${tierText} Premium aboneliğiniz ${endDateText} tarihine kadar uzatıldı.`,
                data: {
                    type: 'subscription_renewed',
                    tier,
                    endDate: newEndDate.toISOString(),
                },
            });

            this.logger.log(`Subscription renewed notification sent to user ${userId}`);
        } catch (error) {
            this.logger.error(
                `Failed to send subscription renewed notification: ${error.message}`,
            );
        }
    }

    /**
     * Send subscription cancelled notification
     * Requirement: 12.3
     */
    async sendSubscriptionCancelled(
        userId: string,
        endDate: Date,
    ): Promise<void> {
        try {
            const endDateText = this.formatDate(endDate);

            await this.pushService.sendPush(userId, {
                to: '',
                title: '❌ Aboneliğiniz İptal Edildi',
                body: `Premium aboneliğiniz iptal edildi. ${endDateText} tarihine kadar premium özelliklerden yararlanabilirsiniz.`,
                data: {
                    type: 'subscription_cancelled',
                    endDate: endDate.toISOString(),
                },
            });

            this.logger.log(`Subscription cancelled notification sent to user ${userId}`);
        } catch (error) {
            this.logger.error(
                `Failed to send subscription cancelled notification: ${error.message}`,
            );
        }
    }

    /**
     * Send subscription expiring soon notification (3 days before)
     * Requirement: 12.4
     */
    async sendSubscriptionExpiringSoon(
        userId: string,
        endDate: Date,
    ): Promise<void> {
        try {
            const endDateText = this.formatDate(endDate);

            await this.pushService.sendPush(userId, {
                to: '',
                title: '⏰ Aboneliğiniz Sona Eriyor',
                body: `Premium aboneliğiniz ${endDateText} tarihinde sona erecek. Yenilemeyi unutmayın!`,
                data: {
                    type: 'subscription_expiring_soon',
                    endDate: endDate.toISOString(),
                    daysRemaining: 3,
                },
            });

            this.logger.log(
                `Subscription expiring soon notification sent to user ${userId}`,
            );
        } catch (error) {
            this.logger.error(
                `Failed to send subscription expiring soon notification: ${error.message}`,
            );
        }
    }

    /**
     * Send payment failed notification
     * Requirement: 12.5
     */
    async sendPaymentFailed(
        userId: string,
        gracePeriodEndDate: Date,
    ): Promise<void> {
        try {
            const gracePeriodText = this.formatDate(gracePeriodEndDate);

            await this.pushService.sendPush(userId, {
                to: '',
                title: '⚠️ Ödeme Başarısız',
                body: `Abonelik ödemesi alınamadı. ${gracePeriodText} tarihine kadar ödeme yönteminizi güncelleyin.`,
                data: {
                    type: 'payment_failed',
                    gracePeriodEndDate: gracePeriodEndDate.toISOString(),
                },
            });

            this.logger.log(`Payment failed notification sent to user ${userId}`);
        } catch (error) {
            this.logger.error(
                `Failed to send payment failed notification: ${error.message}`,
            );
        }
    }

    /**
     * Send subscription expired notification
     * Requirement: 12.6
     */
    async sendSubscriptionExpired(userId: string): Promise<void> {
        try {
            await this.pushService.sendPush(userId, {
                to: '',
                title: '😔 Aboneliğiniz Sona Erdi',
                body: 'Premium aboneliğiniz sona erdi. Ücretsiz plana geçtiniz. Premium\'a geri dönmek için yenileyin.',
                data: {
                    type: 'subscription_expired',
                },
            });

            this.logger.log(`Subscription expired notification sent to user ${userId}`);
        } catch (error) {
            this.logger.error(
                `Failed to send subscription expired notification: ${error.message}`,
            );
        }
    }

    /**
     * Send quota warning notification (when 80% used)
     * Requirement: 6.3
     */
    async sendQuotaWarning(
        userId: string,
        used: number,
        limit: number,
        resetDate: Date,
    ): Promise<void> {
        try {
            const remaining = limit - used;
            const resetDateText = this.formatDate(resetDate);

            await this.pushService.sendPush(userId, {
                to: '',
                title: '📊 AI Mesaj Kotanız Azalıyor',
                body: `${remaining} mesaj hakkınız kaldı. Kota ${resetDateText} tarihinde sıfırlanacak.`,
                data: {
                    type: 'quota_warning',
                    used,
                    limit,
                    remaining,
                    resetDate: resetDate.toISOString(),
                },
            });

            this.logger.log(`Quota warning notification sent to user ${userId}`);
        } catch (error) {
            this.logger.error(
                `Failed to send quota warning notification: ${error.message}`,
            );
        }
    }

    /**
     * Format date to Turkish locale
     */
    private formatDate(date: Date): string {
        return new Intl.DateTimeFormat('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
    }
}
