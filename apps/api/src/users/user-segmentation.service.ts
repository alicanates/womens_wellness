import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionStatus } from '@prisma/client';

export interface UserSegment {
    id: string;
    email: string;
    username: string | null;
    displayName: string;
    status: string;
    subscriptionStatus: SubscriptionStatus;
    createdAt: Date;
    lastActive?: Date;
}

export interface SegmentFilters {
    subscriptionStatus?: SubscriptionStatus[];
    isPregnant?: boolean;
    hasActiveCycle?: boolean;
    isActive?: boolean; // Active in last 7 days
    createdAfter?: Date;
    createdBefore?: Date;
}

@Injectable()
export class UserSegmentationService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get users by segment filters
     */
    async getUsersBySegment(filters: SegmentFilters, limit = 100, offset = 0): Promise<UserSegment[]> {
        const where: any = {
            status: 'ACTIVE',
        };

        // Subscription status filter
        if (filters.subscriptionStatus && filters.subscriptionStatus.length > 0) {
            where.subscription = {
                status: {
                    in: filters.subscriptionStatus,
                },
            };
        }

        // Pregnancy filter
        if (filters.isPregnant !== undefined) {
            if (filters.isPregnant) {
                where.pregnancy = {
                    isActive: true,
                };
            } else {
                where.pregnancy = null;
            }
        }

        // Active cycle filter
        if (filters.hasActiveCycle !== undefined) {
            if (filters.hasActiveCycle) {
                where.periodCycles = {
                    some: {
                        endDate: null, // Active cycle
                    },
                };
            }
        }

        // Date range filters
        if (filters.createdAfter) {
            where.createdAt = { ...where.createdAt, gte: filters.createdAfter };
        }
        if (filters.createdBefore) {
            where.createdAt = { ...where.createdAt, lte: filters.createdBefore };
        }

        // Activity filter (last message in last 7 days)
        if (filters.isActive !== undefined) {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            if (filters.isActive) {
                where.conversations = {
                    some: {
                        messages: {
                            some: {
                                createdAt: { gte: sevenDaysAgo },
                            },
                        },
                    },
                };
            }
        }

        const users = await this.prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                username: true,
                status: true,
                createdAt: true,
                profile: {
                    select: {
                        displayName: true,
                    },
                },
                subscription: {
                    select: {
                        status: true,
                    },
                },
                conversations: {
                    select: {
                        messages: {
                            take: 1,
                            orderBy: { createdAt: 'desc' },
                            select: {
                                createdAt: true,
                            },
                        },
                    },
                    take: 1,
                    orderBy: { updatedAt: 'desc' },
                },
            },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
        });

        return users.map((user) => ({
            id: user.id,
            email: user.email,
            username: user.username,
            displayName: user.profile?.displayName || 'Anonim',
            status: user.status,
            subscriptionStatus: user.subscription?.status || SubscriptionStatus.FREE,
            createdAt: user.createdAt,
            lastActive: user.conversations[0]?.messages[0]?.createdAt,
        }));
    }

    /**
     * Get segment statistics
     */
    async getSegmentStats(filters: SegmentFilters) {
        const where: any = {
            status: 'ACTIVE',
        };

        // Apply same filters as getUsersBySegment
        if (filters.subscriptionStatus && filters.subscriptionStatus.length > 0) {
            where.subscription = {
                status: {
                    in: filters.subscriptionStatus,
                },
            };
        }

        if (filters.isPregnant !== undefined) {
            if (filters.isPregnant) {
                where.pregnancy = {
                    isActive: true,
                };
            } else {
                where.pregnancy = null;
            }
        }

        if (filters.hasActiveCycle !== undefined) {
            if (filters.hasActiveCycle) {
                where.periodCycles = {
                    some: {
                        endDate: null,
                    },
                };
            }
        }

        if (filters.createdAfter) {
            where.createdAt = { ...where.createdAt, gte: filters.createdAfter };
        }
        if (filters.createdBefore) {
            where.createdAt = { ...where.createdAt, lte: filters.createdBefore };
        }

        if (filters.isActive !== undefined) {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            if (filters.isActive) {
                where.conversations = {
                    some: {
                        messages: {
                            some: {
                                createdAt: { gte: sevenDaysAgo },
                            },
                        },
                    },
                };
            }
        }

        const totalUsers = await this.prisma.user.count({ where });

        return {
            totalUsers,
            filters,
        };
    }

    /**
     * Get predefined segments
     */
    async getPredefinedSegments() {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            premiumUsers,
            freeUsers,
            activeUsers,
            inactiveUsers,
            pregnantUsers,
            cycleTrackingUsers,
            newUsers,
        ] = await Promise.all([
            // Total active users
            this.prisma.user.count({
                where: { status: 'ACTIVE' },
            }),
            // Premium users
            this.prisma.user.count({
                where: {
                    status: 'ACTIVE',
                    subscription: {
                        status: 'ACTIVE',
                    },
                },
            }),
            // Free users
            this.prisma.user.count({
                where: {
                    status: 'ACTIVE',
                    subscription: {
                        status: 'FREE',
                    },
                },
            }),
            // Active users (last 7 days)
            this.prisma.user.count({
                where: {
                    status: 'ACTIVE',
                    conversations: {
                        some: {
                            messages: {
                                some: {
                                    createdAt: { gte: sevenDaysAgo },
                                },
                            },
                        },
                    },
                },
            }),
            // Inactive users (no activity in 30 days)
            this.prisma.user.count({
                where: {
                    status: 'ACTIVE',
                    conversations: {
                        every: {
                            messages: {
                                every: {
                                    createdAt: { lt: thirtyDaysAgo },
                                },
                            },
                        },
                    },
                },
            }),
            // Pregnant users
            this.prisma.user.count({
                where: {
                    status: 'ACTIVE',
                    pregnancy: {
                        isActive: true,
                    },
                },
            }),
            // Cycle tracking users
            this.prisma.user.count({
                where: {
                    status: 'ACTIVE',
                    periodCycles: {
                        some: {
                            endDate: null,
                        },
                    },
                },
            }),
            // New users (last 7 days)
            this.prisma.user.count({
                where: {
                    status: 'ACTIVE',
                    createdAt: { gte: sevenDaysAgo },
                },
            }),
        ]);

        return {
            totalUsers,
            premiumUsers,
            freeUsers,
            activeUsers,
            inactiveUsers,
            pregnantUsers,
            cycleTrackingUsers,
            newUsers,
        };
    }
}
