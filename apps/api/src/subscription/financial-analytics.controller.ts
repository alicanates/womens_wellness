import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FinancialAnalyticsService } from './financial-analytics.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('subscription/financial-analytics')
@UseGuards(JwtAuthGuard, AdminGuard)
export class FinancialAnalyticsController {
    constructor(private readonly analyticsService: FinancialAnalyticsService) { }

    @Get('mrr')
    async getMRR(): Promise<any> {
        return this.analyticsService.calculateMRR();
    }

    @Get('churn-rate')
    async getChurnRate(@Query('days') days?: string): Promise<any> {
        const daysNum = days ? parseInt(days, 10) : 30;
        return this.analyticsService.calculateChurnRate(daysNum);
    }

    @Get('revenue-over-time')
    async getRevenueOverTime(@Query('days') days?: string): Promise<any[]> {
        const daysNum = days ? parseInt(days, 10) : 30;
        return this.analyticsService.getRevenueOverTime(daysNum);
    }

    @Get('metrics')
    async getMetrics(@Query('days') days?: string): Promise<any> {
        const daysNum = days ? parseInt(days, 10) : 30;
        return this.analyticsService.getSubscriptionMetrics(daysNum);
    }

    @Get('payment-providers')
    async getPaymentProviders(@Query('days') days?: string): Promise<any[]> {
        const daysNum = days ? parseInt(days, 10) : 30;
        return this.analyticsService.getPaymentProviderBreakdown(daysNum);
    }

    @Get('tier-breakdown')
    async getTierBreakdown(): Promise<any[]> {
        return this.analyticsService.getSubscriptionTierBreakdown();
    }

    @Get('forecast')
    async getForecast(): Promise<any> {
        return this.analyticsService.forecastRevenue();
    }
}
