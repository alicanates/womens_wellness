import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';

@Controller('qna/analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) { }

    @Get('overview')
    async getOverview() {
        return this.analyticsService.getOverview();
    }

    @Get('categories')
    async getCategoryBreakdown() {
        return this.analyticsService.getCategoryBreakdown();
    }

    @Get('top-users')
    async getTopContributors(@Query('limit') limit?: string) {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.analyticsService.getTopContributors(limitNum);
    }

    @Get('engagement')
    async getEngagementMetrics() {
        return this.analyticsService.getEngagementMetrics();
    }
}
