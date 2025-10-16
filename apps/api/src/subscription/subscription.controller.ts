import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionService } from './subscription.service';
import { WebhookHandlerService } from './webhook-handler.service';
import { SubscriptionAnalyticsService } from './subscription-analytics.service';
import {
    SubscriptionStatusDto,
    ProductDto,
    PurchaseDto,
    RestoreDto,
    TransactionDto,
    QuotaDto,
    UsageStatsDto,
} from './dto';

@Controller('subscription')
export class SubscriptionController {
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly webhookHandler: WebhookHandlerService,
        private readonly analyticsService: SubscriptionAnalyticsService,
    ) { }

    /**
     * Get current subscription status
     * Requirements: 3.1
     */
    @Get('status')
    @UseGuards(AuthGuard('jwt'))
    async getStatus(@Request() req): Promise<SubscriptionStatusDto> {
        const userId = req.user.id;
        const subscription = await this.subscriptionService.getSubscription(userId);

        return {
            id: subscription.id,
            userId: subscription.userId,
            status: subscription.status,
            tier: subscription.tier,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            cancelledAt: subscription.cancelledAt,
            trialEndDate: subscription.trialEndDate,
            provider: subscription.provider,
            aiMessagesUsed: subscription.aiMessagesUsed,
            aiMessagesLimit: subscription.aiMessagesLimit,
            quotaResetDate: subscription.quotaResetDate,
            isInGracePeriod: subscription.isInGracePeriod,
            gracePeriodEndDate: subscription.gracePeriodEndDate,
            createdAt: subscription.createdAt,
            updatedAt: subscription.updatedAt,
        };
    }

    /**
     * Get available products
     * Requirements: 3.2
     */
    @Get('products')
    @UseGuards(AuthGuard('jwt'))
    async getProducts(@Query('platform') platform: 'ios' | 'android'): Promise<ProductDto[]> {
        // Product definitions
        // In production, these would come from a database or config
        const products: ProductDto[] = [
            {
                productId: platform === 'ios'
                    ? 'com.wellness.premium.monthly'
                    : 'premium_monthly',
                tier: 'MONTHLY',
                price: 99,
                currency: 'TRY',
                description: 'Aylık Premium Abonelik',
                features: [
                    'Gelişmiş AI modeli',
                    '1000 mesaj/ay',
                    'Öncelikli yanıt',
                    'Kişisel içgörüler',
                    'Gelişmiş analizler',
                ],
                trialDays: 7,
            },
            {
                productId: platform === 'ios'
                    ? 'com.wellness.premium.yearly'
                    : 'premium_yearly',
                tier: 'YEARLY',
                price: 999,
                currency: 'TRY',
                description: 'Yıllık Premium Abonelik',
                features: [
                    'Gelişmiş AI modeli',
                    '1000 mesaj/ay',
                    'Öncelikli yanıt',
                    'Kişisel içgörüler',
                    'Gelişmiş analizler',
                    '%17 tasarruf',
                ],
                trialDays: 7,
            },
        ];

        return products;
    }

    /**
     * Validate and process purchase
     * Requirements: 3.3, 10.1, 10.2, 10.3, 10.4, 10.5
     */
    @Post('purchase')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async processPurchase(
        @Request() req,
        @Body() purchaseDto: PurchaseDto,
    ): Promise<SubscriptionStatusDto> {
        const userId = req.user.id;
        const subscription = await this.subscriptionService.processPurchase(userId, purchaseDto);

        return {
            id: subscription.id,
            userId: subscription.userId,
            status: subscription.status,
            tier: subscription.tier,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            cancelledAt: subscription.cancelledAt,
            trialEndDate: subscription.trialEndDate,
            provider: subscription.provider,
            aiMessagesUsed: subscription.aiMessagesUsed,
            aiMessagesLimit: subscription.aiMessagesLimit,
            quotaResetDate: subscription.quotaResetDate,
            isInGracePeriod: subscription.isInGracePeriod,
            gracePeriodEndDate: subscription.gracePeriodEndDate,
            createdAt: subscription.createdAt,
            updatedAt: subscription.updatedAt,
        };
    }

    /**
     * Restore purchases
     * Requirements: 3.4
     */
    @Post('restore')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async restorePurchases(
        @Request() req,
        @Body() restoreDto: RestoreDto,
    ): Promise<SubscriptionStatusDto> {
        const userId = req.user.id;
        const subscription = await this.subscriptionService.restorePurchases(userId, restoreDto);

        return {
            id: subscription.id,
            userId: subscription.userId,
            status: subscription.status,
            tier: subscription.tier,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            cancelledAt: subscription.cancelledAt,
            trialEndDate: subscription.trialEndDate,
            provider: subscription.provider,
            aiMessagesUsed: subscription.aiMessagesUsed,
            aiMessagesLimit: subscription.aiMessagesLimit,
            quotaResetDate: subscription.quotaResetDate,
            isInGracePeriod: subscription.isInGracePeriod,
            gracePeriodEndDate: subscription.gracePeriodEndDate,
            createdAt: subscription.createdAt,
            updatedAt: subscription.updatedAt,
        };
    }

    /**
     * Cancel subscription
     * Requirements: 3.5
     */
    @Post('cancel')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async cancelSubscription(@Request() req): Promise<{ success: boolean; message: string }> {
        const userId = req.user.id;
        await this.subscriptionService.cancelSubscription(userId);

        return {
            success: true,
            message: 'Aboneliğiniz iptal edildi. Abonelik süreniz sonuna kadar premium özelliklerden yararlanmaya devam edebilirsiniz.',
        };
    }

    /**
     * Get transaction history
     * Requirements: 3.6, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6
     */
    @Get('transactions')
    @UseGuards(AuthGuard('jwt'))
    async getTransactions(@Request() req): Promise<TransactionDto[]> {
        const userId = req.user.id;
        const transactions = await this.subscriptionService.getTransactions(userId);

        return transactions.map(t => ({
            id: t.id,
            transactionId: t.transactionId,
            originalTransactionId: t.originalTransactionId,
            productId: t.productId,
            amount: t.amount,
            currency: t.currency,
            status: t.status,
            type: t.type,
            provider: t.provider,
            validatedAt: t.validatedAt,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
        }));
    }

    /**
     * Check AI message quota
     * Requirements: 3.7, 6.1, 6.2, 6.3, 6.4
     */
    @Get('quota')
    @UseGuards(AuthGuard('jwt'))
    async getQuota(@Request() req): Promise<QuotaDto> {
        const userId = req.user.id;
        const quota = await this.subscriptionService.checkQuota(userId);

        return {
            used: quota.used,
            limit: quota.limit,
            remaining: quota.remaining,
            resetDate: quota.resetDate,
            percentage: quota.percentage,
            hasQuota: quota.hasQuota,
        };
    }

    /**
     * Increment AI message usage
     * Requirements: 6.2, 6.3, 6.4, 6.5
     */
    @Post('quota/increment')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async incrementQuota(@Request() req): Promise<QuotaDto> {
        const userId = req.user.id;
        await this.subscriptionService.incrementMessageUsage(userId);

        // Return updated quota
        const quota = await this.subscriptionService.checkQuota(userId);

        return {
            used: quota.used,
            limit: quota.limit,
            remaining: quota.remaining,
            resetDate: quota.resetDate,
            percentage: quota.percentage,
            hasQuota: quota.hasQuota,
        };
    }

    /**
     * Get usage statistics
     * Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6
     */
    @Get('usage-stats')
    @UseGuards(AuthGuard('jwt'))
    async getUsageStats(@Request() req): Promise<UsageStatsDto> {
        const userId = req.user.id;
        return this.subscriptionService.getUsageStats(userId);
    }

    /**
     * Webhook endpoint for Apple App Store Server Notifications
     * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6
     * 
     * This endpoint receives notifications from Apple about subscription events
     * No authentication required as Apple sends these notifications
     */
    @Post('webhook/apple')
    @HttpCode(HttpStatus.OK)
    async handleAppleWebhook(@Body() body: any): Promise<{ status: string }> {
        await this.webhookHandler.handleAppleNotification(body);
        return { status: 'ok' };
    }

    /**
     * Webhook endpoint for Google Play Real-time Developer Notifications
     * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6
     * 
     * This endpoint receives notifications from Google Play about subscription events
     * No authentication required as Google sends these notifications via Pub/Sub
     */
    @Post('webhook/google')
    @HttpCode(HttpStatus.OK)
    async handleGoogleWebhook(@Body() body: any): Promise<{ status: string }> {
        await this.webhookHandler.handleGoogleNotification(body);
        return { status: 'ok' };
    }

    /**
     * Get analytics dashboard metrics
     * Admin endpoint for subscription analytics
     * Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6
     */
    @Get('analytics/dashboard')
    @UseGuards(AuthGuard('jwt'))
    async getAnalyticsDashboard(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;

        return this.analyticsService.getDashboardMetrics(start, end);
    }

    /**
     * Get MRR (Monthly Recurring Revenue)
     * Requirements: 20.4
     */
    @Get('analytics/mrr')
    @UseGuards(AuthGuard('jwt'))
    async getMRR() {
        return this.analyticsService.calculateMRR();
    }

    /**
     * Get ARPU (Average Revenue Per User)
     * Requirements: 20.4
     */
    @Get('analytics/arpu')
    @UseGuards(AuthGuard('jwt'))
    async getARPU() {
        return this.analyticsService.calculateARPU();
    }

    /**
     * Get churn rate
     * Requirements: 20.3
     */
    @Get('analytics/churn')
    @UseGuards(AuthGuard('jwt'))
    async getChurnRate(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        if (!startDate || !endDate) {
            throw new BadRequestException('startDate ve endDate parametreleri gerekli');
        }

        return this.analyticsService.calculateChurnRate(
            new Date(startDate),
            new Date(endDate),
        );
    }

    /**
     * Get conversion metrics
     * Requirements: 20.2
     */
    @Get('analytics/conversion')
    @UseGuards(AuthGuard('jwt'))
    async getConversionMetrics(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        if (!startDate || !endDate) {
            throw new BadRequestException('startDate ve endDate parametreleri gerekli');
        }

        return this.analyticsService.getConversionMetrics(
            new Date(startDate),
            new Date(endDate),
        );
    }

    /**
     * Get revenue metrics
     * Requirements: 20.4
     */
    @Get('analytics/revenue')
    @UseGuards(AuthGuard('jwt'))
    async getRevenueMetrics(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        if (!startDate || !endDate) {
            throw new BadRequestException('startDate ve endDate parametreleri gerekli');
        }

        return this.analyticsService.getRevenueMetrics(
            new Date(startDate),
            new Date(endDate),
        );
    }

    /**
     * Get subscription distribution
     * Requirements: 20.1
     */
    @Get('analytics/distribution')
    @UseGuards(AuthGuard('jwt'))
    async getSubscriptionDistribution() {
        return this.analyticsService.getSubscriptionDistribution();
    }

    /**
     * Get lifetime value (LTV)
     * Requirements: 20.5
     */
    @Get('analytics/ltv')
    @UseGuards(AuthGuard('jwt'))
    async getLTV() {
        return this.analyticsService.calculateLTV();
    }
}
