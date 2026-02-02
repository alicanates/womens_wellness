import { Controller, Get, Query, UseGuards, Post, Body } from '@nestjs/common';
import { UserSegmentationService, SegmentFilters } from './user-segmentation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { SubscriptionStatus } from '@prisma/client';

@Controller('users/segmentation')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UserSegmentationController {
    constructor(private readonly segmentationService: UserSegmentationService) { }

    @Get('predefined')
    async getPredefinedSegments() {
        return this.segmentationService.getPredefinedSegments();
    }

    @Post('query')
    async querySegment(
        @Body() body: {
            filters: SegmentFilters;
            limit?: number;
            offset?: number;
        },
    ) {
        const { filters, limit = 100, offset = 0 } = body;

        const [users, stats] = await Promise.all([
            this.segmentationService.getUsersBySegment(filters, limit, offset),
            this.segmentationService.getSegmentStats(filters),
        ]);

        return {
            users,
            stats,
            pagination: {
                limit,
                offset,
                total: stats.totalUsers,
            },
        };
    }

    @Get('stats')
    async getSegmentStats(@Query() query: any) {
        const filters: SegmentFilters = {};

        if (query.subscriptionStatus) {
            filters.subscriptionStatus = Array.isArray(query.subscriptionStatus)
                ? query.subscriptionStatus
                : [query.subscriptionStatus];
        }

        if (query.isPregnant !== undefined) {
            filters.isPregnant = query.isPregnant === 'true';
        }

        if (query.hasActiveCycle !== undefined) {
            filters.hasActiveCycle = query.hasActiveCycle === 'true';
        }

        if (query.isActive !== undefined) {
            filters.isActive = query.isActive === 'true';
        }

        if (query.createdAfter) {
            filters.createdAfter = new Date(query.createdAfter);
        }

        if (query.createdBefore) {
            filters.createdBefore = new Date(query.createdBefore);
        }

        return this.segmentationService.getSegmentStats(filters);
    }
}
