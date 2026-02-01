import { Test, TestingModule } from '@nestjs/testing';
import { CyclesService } from './cycles.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CyclesService', () => {
    let service: CyclesService;
    let prisma: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CyclesService,
                {
                    provide: PrismaService,
                    useValue: {
                        periodCycle: {
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                            deleteMany: jest.fn(),
                        },
                        dailyLog: {
                            findUnique: jest.fn(),
                            findMany: jest.fn(),
                            upsert: jest.fn(),
                            delete: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<CyclesService>(CyclesService);
        prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getCycles', () => {
        it('should return user cycles', async () => {
            const userId = 'user-1';
            const mockCycles = [
                {
                    id: 'cycle-1',
                    userId,
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-01-05'),
                    symptomsJson: {},
                    notes: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            prisma.periodCycle.findMany.mockResolvedValue(mockCycles as any);

            const result = await service.getCycles(userId);

            expect(result).toEqual(mockCycles);
            expect(prisma.periodCycle.findMany).toHaveBeenCalledWith({
                where: { userId },
                orderBy: { startDate: 'desc' },
            });
        });

        it('should limit results when limit is provided', async () => {
            const userId = 'user-1';
            const limit = 5;

            prisma.periodCycle.findMany.mockResolvedValue([]);

            await service.getCycles(userId, limit);

            expect(prisma.periodCycle.findMany).toHaveBeenCalledWith({
                where: { userId },
                orderBy: { startDate: 'desc' },
                take: limit,
            });
        });
    });

    describe('createCycle', () => {
        it('should create a new cycle', async () => {
            const userId = 'user-1';
            const data = {
                startDate: '2024-01-01',
                endDate: '2024-01-05',
                symptoms: {
                    flow: 'moderate' as const,
                    cramps: 3,
                    mood: ['happy'],
                    physical: ['bloating'],
                },
            };

            const mockCycle = {
                id: 'cycle-1',
                userId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                symptomsJson: data.symptoms,
                notes: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            prisma.periodCycle.create.mockResolvedValue(mockCycle as any);

            const result = await service.createCycle(userId, data);

            expect(result).toEqual(mockCycle);
            expect(prisma.periodCycle.create).toHaveBeenCalled();
        });

        it('should throw BadRequestException if endDate is before startDate', async () => {
            const userId = 'user-1';
            const data = {
                startDate: '2024-01-05',
                endDate: '2024-01-01',
            };

            await expect(service.createCycle(userId, data)).rejects.toThrow(BadRequestException);
        });
    });

    describe('updateCycle', () => {
        it('should update existing cycle', async () => {
            const userId = 'user-1';
            const cycleId = 'cycle-1';
            const data = {
                endDate: '2024-01-06',
            };

            const mockCycle = {
                id: cycleId,
                userId,
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-01-05'),
            };

            const updatedCycle = {
                ...mockCycle,
                endDate: new Date(data.endDate),
            };

            prisma.periodCycle.findUnique.mockResolvedValue(mockCycle as any);
            prisma.periodCycle.update.mockResolvedValue(updatedCycle as any);

            const result = await service.updateCycle(userId, cycleId, data);

            expect(result).toEqual(updatedCycle);
            expect(prisma.periodCycle.update).toHaveBeenCalled();
        });

        it('should throw NotFoundException if cycle not found', async () => {
            const userId = 'user-1';
            const cycleId = 'nonexistent';

            prisma.periodCycle.findUnique.mockResolvedValue(null);

            await expect(service.updateCycle(userId, cycleId, {})).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if user does not own cycle', async () => {
            const userId = 'user-1';
            const cycleId = 'cycle-1';
            const mockCycle = {
                id: cycleId,
                userId: 'other-user',
            };

            prisma.periodCycle.findUnique.mockResolvedValue(mockCycle as any);

            await expect(service.updateCycle(userId, cycleId, {})).rejects.toThrow(BadRequestException);
        });
    });

    describe('deleteCycle', () => {
        it('should delete cycle', async () => {
            const userId = 'user-1';
            const cycleId = 'cycle-1';
            const mockCycle = {
                id: cycleId,
                userId,
            };

            prisma.periodCycle.findUnique.mockResolvedValue(mockCycle as any);
            prisma.periodCycle.delete.mockResolvedValue(mockCycle as any);

            const result = await service.deleteCycle(userId, cycleId);

            expect(result).toEqual({ success: true });
            expect(prisma.periodCycle.delete).toHaveBeenCalledWith({
                where: { id: cycleId },
            });
        });
    });

    describe('getPrediction', () => {
        it('should return period prediction based on cycle history', async () => {
            const userId = 'user-1';
            const mockCycles = [
                {
                    id: 'cycle-1',
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-01-05'),
                },
                {
                    id: 'cycle-2',
                    startDate: new Date('2023-12-04'),
                    endDate: new Date('2023-12-08'),
                },
            ];

            prisma.periodCycle.findMany.mockResolvedValue(mockCycles as any);

            const result = await service.getPrediction(userId);

            expect(result).toHaveProperty('nextPeriodStart');
            expect(result).toHaveProperty('avgCycleLength');
            expect(result).toHaveProperty('confidence');
        });

        it('should return null if not enough cycle data', async () => {
            const userId = 'user-1';

            prisma.periodCycle.findMany.mockResolvedValue([]);

            const result = await service.getPrediction(userId);

            expect(result).toBeNull();
        });
    });

    describe('getCalendar', () => {
        it('should return calendar data for specified month', async () => {
            const userId = 'user-1';
            const year = 2024;
            const month = 1;

            prisma.periodCycle.findMany.mockResolvedValue([]);
            prisma.dailyLog.findMany.mockResolvedValue([]);

            const result = await service.getCalendar(userId, year, month);

            expect(result).toHaveProperty('year', year);
            expect(result).toHaveProperty('month', month);
            expect(result).toHaveProperty('days');
            expect(Array.isArray(result.days)).toBe(true);
        });
    });

    describe('getStats', () => {
        it('should return cycle statistics', async () => {
            const userId = 'user-1';
            const mockCycles = [
                {
                    id: 'cycle-1',
                    startDate: new Date('2024-01-01'),
                    endDate: new Date('2024-01-05'),
                },
                {
                    id: 'cycle-2',
                    startDate: new Date('2023-12-04'),
                    endDate: new Date('2023-12-08'),
                },
            ];

            prisma.periodCycle.findMany.mockResolvedValue(mockCycles as any);

            const result = await service.getStats(userId);

            expect(result).toHaveProperty('totalCycles');
            expect(result).toHaveProperty('avgCycleLength');
            expect(result).toHaveProperty('avgPeriodLength');
            expect(result.totalCycles).toBe(2);
        });
    });
});
