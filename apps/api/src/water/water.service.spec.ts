import { Test, TestingModule } from '@nestjs/testing';
import { WaterService } from './water.service';
import { PrismaService } from '../prisma/prisma.service';

describe('WaterService', () => {
    let service: WaterService;
    let prisma: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                WaterService,
                {
                    provide: PrismaService,
                    useValue: {
                        waterLog: {
                            findMany: jest.fn(),
                            create: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<WaterService>(WaterService);
        prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('logWater', () => {
        it('should create water log successfully', async () => {
            const userId = 'user-1';
            const data = {
                amountMl: 250,
                loggedAt: new Date(),
            };

            const mockLog = {
                id: 'log-1',
                userId,
                amountMl: data.amountMl,
                loggedAt: data.loggedAt,
                createdAt: new Date(),
            };

            prisma.waterLog.create.mockResolvedValue(mockLog as any);

            const result = await service.logWater(userId, data);

            expect(result).toEqual(mockLog);
            expect(prisma.waterLog.create).toHaveBeenCalledWith({
                data: {
                    userId,
                    amountMl: data.amountMl,
                    loggedAt: data.loggedAt,
                },
            });
        });
    });

    describe('getTodayTotal', () => {
        it('should return today total water intake', async () => {
            const userId = 'user-1';
            const mockLogs = [
                { id: 'log-1', amountMl: 250, loggedAt: new Date() },
                { id: 'log-2', amountMl: 500, loggedAt: new Date() },
                { id: 'log-3', amountMl: 250, loggedAt: new Date() },
            ];

            prisma.waterLog.findMany.mockResolvedValue(mockLogs as any);

            const result = await service.getTodayTotal(userId);

            expect(result.totalMl).toBe(1000);
            expect(result.logs).toHaveLength(3);
            expect(prisma.waterLog.findMany).toHaveBeenCalled();
        });

        it('should return zero if no logs today', async () => {
            const userId = 'user-1';

            prisma.waterLog.findMany.mockResolvedValue([]);

            const result = await service.getTodayTotal(userId);

            expect(result.totalMl).toBe(0);
            expect(result.logs).toHaveLength(0);
        });
    });

    describe('getStats', () => {
        it('should return water stats for specified days', async () => {
            const userId = 'user-1';
            const days = 7;
            const mockLogs = [
                { id: 'log-1', amountMl: 2000, loggedAt: new Date('2024-01-01') },
                { id: 'log-2', amountMl: 2500, loggedAt: new Date('2024-01-02') },
                { id: 'log-3', amountMl: 1800, loggedAt: new Date('2024-01-03') },
            ];

            prisma.waterLog.findMany.mockResolvedValue(mockLogs as any);

            const result = await service.getStats(userId, days);

            expect(result.days).toBe(days);
            expect(result.totalMl).toBe(6300);
            expect(result.avgMl).toBeGreaterThan(0);
            expect(result.dailyTotals).toBeDefined();
        });
    });

    describe('getLogs', () => {
        it('should return water logs with date filters', async () => {
            const userId = 'user-1';
            const startDate = '2024-01-01';
            const endDate = '2024-01-31';
            const mockLogs = [
                { id: 'log-1', amountMl: 250, loggedAt: new Date('2024-01-15') },
                { id: 'log-2', amountMl: 500, loggedAt: new Date('2024-01-20') },
            ];

            prisma.waterLog.findMany.mockResolvedValue(mockLogs as any);

            const result = await service.getLogs(userId, { startDate, endDate });

            expect(result).toEqual(mockLogs);
            expect(prisma.waterLog.findMany).toHaveBeenCalledWith({
                where: {
                    userId,
                    loggedAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                },
                orderBy: { loggedAt: 'desc' },
            });
        });

        it('should return all logs if no date filters provided', async () => {
            const userId = 'user-1';
            const mockLogs = [
                { id: 'log-1', amountMl: 250, loggedAt: new Date() },
            ];

            prisma.waterLog.findMany.mockResolvedValue(mockLogs as any);

            const result = await service.getLogs(userId, {});

            expect(result).toEqual(mockLogs);
            expect(prisma.waterLog.findMany).toHaveBeenCalledWith({
                where: { userId },
                orderBy: { loggedAt: 'desc' },
            });
        });
    });
});
