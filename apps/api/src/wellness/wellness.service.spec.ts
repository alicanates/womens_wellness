import { Test, TestingModule } from '@nestjs/testing';
import { WellnessService } from './wellness.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WellnessService', () => {
    let service: WellnessService;
    let prisma: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WellnessService,
                {
                    provide: PrismaService,
                    useValue: {
                        wellnessActivity: {
                            findMany: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                        wellnessGoal: {
                            findMany: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<WellnessService>(WellnessService);
        prisma = module.get(PrismaService);
    });

    describe('getActivities', () => {
        it('should return user activities', async () => {
            const mockActivities = [
                {
                    id: 'activity-1',
                    userId: 'user-1',
                    type: 'meditation',
                    duration: 600,
                },
            ];

            prisma.wellnessActivity.findMany.mockResolvedValue(mockActivities as any);

            const result = await service.getActivities('user-1');

            expect(result).toEqual(mockActivities);
        });
    });

    describe('logActivity', () => {
        it('should log new activity', async () => {
            const activityData = {
                type: 'meditation',
                duration: 600,
                completedAt: new Date(),
            };

            prisma.wellnessActivity.create.mockResolvedValue({
                id: 'activity-1',
                userId: 'user-1',
                ...activityData,
            } as any);

            const result = await service.logActivity('user-1', activityData);

            expect(result).toBeTruthy();
            expect(prisma.wellnessActivity.create).toHaveBeenCalled();
        });
    });

    describe('getGoals', () => {
        it('should return user goals', async () => {
            const mockGoals = [
                {
                    id: 'goal-1',
                    userId: 'user-1',
                    type: 'meditation',
                    target: 7,
                    current: 3,
                },
            ];

            prisma.wellnessGoal.findMany.mockResolvedValue(mockGoals as any);

            const result = await service.getGoals('user-1');

            expect(result).toEqual(mockGoals);
        });
    });

    describe('createGoal', () => {
        it('should create new goal', async () => {
            const goalData = {
                type: 'meditation',
                target: 7,
                period: 'weekly',
            };

            prisma.wellnessGoal.create.mockResolvedValue({
                id: 'goal-1',
                userId: 'user-1',
                current: 0,
                ...goalData,
            } as any);

            const result = await service.createGoal('user-1', goalData);

            expect(result).toBeTruthy();
        });
    });

    describe('updateGoalProgress', () => {
        it('should update goal progress', async () => {
            prisma.wellnessGoal.update.mockResolvedValue({
                id: 'goal-1',
                current: 4,
            } as any);

            const result = await service.updateGoalProgress('goal-1', 4);

            expect(result.current).toBe(4);
        });
    });
});
