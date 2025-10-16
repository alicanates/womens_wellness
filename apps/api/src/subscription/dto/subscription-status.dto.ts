import { SubscriptionStatus, SubscriptionTier, PaymentProvider } from '@prisma/client';

export class SubscriptionStatusDto {
    id: string;
    userId: string;
    status: SubscriptionStatus;
    tier?: SubscriptionTier | null;
    startDate?: Date | null;
    endDate?: Date | null;
    cancelledAt?: Date | null;
    trialEndDate?: Date | null;
    provider?: PaymentProvider | null;
    aiMessagesUsed: number;
    aiMessagesLimit: number;
    quotaResetDate: Date;
    isInGracePeriod: boolean;
    gracePeriodEndDate?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
