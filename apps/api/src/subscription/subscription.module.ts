import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SubscriptionService } from './subscription.service';
import { ReceiptValidatorService } from './receipt-validator.service';
import { WebhookHandlerService } from './webhook-handler.service';
import { SubscriptionSchedulerService } from './subscription-scheduler.service';
import { SubscriptionNotificationService } from './subscription-notification.service';
import { SubscriptionAnalyticsService } from './subscription-analytics.service';
import { SubscriptionController } from './subscription.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RemindersModule } from '../reminders/reminders.module';
import { PremiumGuard } from './guards/premium.guard';
import { FeatureGuard } from './guards/feature.guard';

@Module({
    imports: [PrismaModule, ConfigModule, RemindersModule],
    controllers: [SubscriptionController],
    providers: [
        SubscriptionService,
        ReceiptValidatorService,
        WebhookHandlerService,
        SubscriptionSchedulerService,
        SubscriptionNotificationService,
        SubscriptionAnalyticsService,
        PremiumGuard,
        FeatureGuard,
    ],
    exports: [
        SubscriptionService,
        ReceiptValidatorService,
        WebhookHandlerService,
        SubscriptionSchedulerService,
        SubscriptionNotificationService,
        SubscriptionAnalyticsService,
        PremiumGuard,
        FeatureGuard,
    ],
})
export class SubscriptionModule { }
