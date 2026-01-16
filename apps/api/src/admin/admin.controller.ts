import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserStatus, SubscriptionStatus } from '@prisma/client';
import { AdminGuard } from '../common/guards/admin.guard';
import { AdminService } from './admin.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class BulkUpdateDto {
    userIds!: string[];
    data!: {
        status?: UserStatus;
        pinEnabled?: boolean;
    };
}

class BulkDeleteDto {
    userIds!: string[];
}

class BulkNotificationDto {
    userIds!: string[];
    notification!: {
        title: string;
        body: string;
    };
}

class SearchUsersDto {
    search?: string;
    status?: UserStatus;
    subscriptionStatus?: SubscriptionStatus;
    createdAfter?: string;
    createdBefore?: string;
    hasSubscription?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminGuard)
@ApiBearerAuth()
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    /**
     * Dashboard Statistics
     */
    @Get('dashboard/stats')
    @ApiOperation({ summary: 'Get dashboard statistics' })
    async getDashboardStats(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.adminService.getDashboardStats(start, end);
    }

    /**
     * Chart Data Endpoints
     */
    @Get('charts/user-growth')
    @ApiOperation({ summary: 'Get user growth chart data' })
    async getUserGrowthChart(@Query('days') days?: string) {
        const daysNum = days ? parseInt(days, 10) : 30;
        return this.adminService.getUserGrowthChart(daysNum);
    }

    @Get('charts/revenue')
    @ApiOperation({ summary: 'Get revenue chart data' })
    async getRevenueChart(@Query('days') days?: string) {
        const daysNum = days ? parseInt(days, 10) : 30;
        return this.adminService.getRevenueChart(daysNum);
    }

    /**
     * Bulk Operations
     */
    @Post('bulk/update-users')
    @ApiOperation({ summary: 'Bulk update users' })
    async bulkUpdateUsers(@Body() dto: BulkUpdateDto) {
        return this.adminService.bulkUpdateUsers(dto.userIds, dto.data);
    }

    @Post('bulk/delete-users')
    @ApiOperation({ summary: 'Bulk delete users' })
    async bulkDeleteUsers(@Body() dto: BulkDeleteDto) {
        return this.adminService.bulkDeleteUsers(dto.userIds);
    }

    @Post('bulk/send-notifications')
    @ApiOperation({ summary: 'Bulk send notifications' })
    async bulkSendNotifications(@Body() dto: BulkNotificationDto) {
        return this.adminService.bulkSendNotifications(
            dto.userIds,
            dto.notification,
        );
    }

    /**
     * Advanced User Search & Filtering
     */
    @Get('users/search')
    @ApiOperation({ summary: 'Advanced user search with filters' })
    async searchUsers(@Query() filters: SearchUsersDto) {
        const parsedFilters = {
            ...filters,
            createdAfter: filters.createdAfter ? new Date(filters.createdAfter) : undefined,
            createdBefore: filters.createdBefore ? new Date(filters.createdBefore) : undefined,
            hasSubscription: filters.hasSubscription === true || filters.hasSubscription === 'true' as any,
            page: filters.page ? parseInt(filters.page.toString(), 10) : 1,
            limit: filters.limit ? parseInt(filters.limit.toString(), 10) : 20,
        };
        return this.adminService.searchUsers(parsedFilters);
    }

    /**
     * User Impersonation
     */
    @Post('impersonate/:userId')
    @ApiOperation({ summary: 'Impersonate a user' })
    async impersonateUser(
        @CurrentUser() admin: any,
        @Param('userId') userId: string,
    ) {
        return this.adminService.impersonateUser(admin.id, userId);
    }

    /**
     * System Health
     */
    @Get('system/health')
    @ApiOperation({ summary: 'Get system health metrics' })
    async getSystemHealth() {
        return this.adminService.getSystemHealth();
    }
}
