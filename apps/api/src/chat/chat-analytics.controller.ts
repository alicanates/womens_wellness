import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ChatAnalyticsService } from './chat-analytics.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('chat/analytics')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ChatAnalyticsController {
    constructor(private readonly analyticsService: ChatAnalyticsService) { }

    @Get('stats')
    async getStats(@Query('days') days?: string): Promise<any> {
        const daysNum = days ? parseInt(days, 10) : 30;
        return this.analyticsService.getChatStats(daysNum);
    }

    @Get('top-questions')
    async getTopQuestions(@Query('limit') limit?: string, @Query('days') days?: string): Promise<any[]> {
        const limitNum = limit ? parseInt(limit, 10) : 10;
        const daysNum = days ? parseInt(days, 10) : 30;
        return this.analyticsService.getTopQuestions(limitNum, daysNum);
    }

    @Get('popular-topics')
    async getPopularTopics(@Query('days') days?: string): Promise<any[]> {
        const daysNum = days ? parseInt(days, 10) : 30;
        return this.analyticsService.getPopularTopics(daysNum);
    }

    @Get('trends')
    async getTrends(@Query('days') days?: string): Promise<any[]> {
        const daysNum = days ? parseInt(days, 10) : 30;
        return this.analyticsService.getChatTrends(daysNum);
    }

    @Get('engagement')
    async getEngagement(@Query('days') days?: string): Promise<any> {
        const daysNum = days ? parseInt(days, 10) : 30;
        return this.analyticsService.getUserEngagement(daysNum);
    }
}
