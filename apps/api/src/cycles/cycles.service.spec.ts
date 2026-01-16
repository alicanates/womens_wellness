import { Test, TestingModule } from '@nestjs/testing';
import { CyclesService } from './cycles.service';
import { PrismaService } from '../prisma/prisma.service';
import { PredictionService } from './prediction.service';
import { BadRequestException } from '@nestjs/common';

describe('CyclesService', () => {
    let service: CyclesService;
    let prisma: jest.Mocked<PrismaService>;
    let predictionService: jest.Mocked<PredictionService>;

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
                        },
                        dailyLog: {
                            findMany: jest.fn(),
                            upsert: jest.fn(),
                        },
                    },
                },
                {
                    provide: PredictionService,
                    useValue: {
                        predictNextPeriod: jest.fn(),
                        predictOvulation: jest.fn(),
                        calculateFertileWindow: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<CyclesService>(CyclesService);
        prisma = module.get(PrismaService);
        predictionService = module.get(PredictionService);
    });

    describe('getCycles', () => {
        it('should return user cycles', async () => {
            const mockCycles = [
                {
                    id: 'cycle-1',
                    userId: 'user-1',
                    startDate: new Date('2026-01-01'),
                    endDate: new Date('2026-01-05'),
                },
            ];

            prisma.periodCycle.findMany.mockResolvedValue(mockCycles as any);

            const result = await service.getCycles('user-1');

            expect(result).toEqual(mockCycles);
            expect(prisma.periodCycle.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { userId: 'user-1' },
                }),
            );
        });
    });

    describe('startCycle', () => {
        it('should create new cycle', async () => {
            const startDate = new Date('2026-01-01');
            const mockCycle = {
                id: 'cycle-1',
                userId: 'user-1',
                startDate,
                endDate: null,
            };

            prisma.periodCycle.create.mockResolvedValue(mockCycle as any);

            const result = await service.startCycle('user-1', startDate);

            expect(result).toEqual(mockCycle);
            expect(prisma.periodCycle.create).toHaveBeenCalled();
        });

        it('should throw error if cycle already active', async () => {
            prisma.periodCycle.findMany.mockResolvedValue([
                {
                    id: 'cycle-1',
                    endDate: null,
                },
            ] as any);

            await expect(service.startCycle('user-1', new Date())).rejects.toThrow(BadRequestException);
        });
    });

    describe('endCycle', () => {
        it('should end active cycle', async () => {
            const mockCycle = {
                id: 'cycle-1',
                userId: 'user-1',
                startDate: new Date('2026-01-01'),
                endDate: null,
            };

            prisma.periodCycle.findUnique.mockResolvedValue(mockCycle as any);
            prisma.periodCycle.update.mockResolvedValue({
                ...mockCycle,
                endDate: new Date('2026-01-05'),
            } as any);

            const result = await service.endCycle('cycle-1', new Date('2026-01-05'));

            expect(result.endDate).toBeTruthy();
            expect(prisma.periodCycle.update).toHaveBeenCalled();
        });

        it('should throw error if cycle not found', async () => {
            prisma.periodCycle.findUnique.mockResolvedValue(null);

            await expect(service.endCycle('cycle-1', new Date())).rejects.toThrow(BadRequestException);
        });
    });

    describe('logSymptoms', () => {
        it('should log daily symptoms', async () => {
            const symptoms = {
                mood: 'happy',
                flow: 'medium',
                symptoms: ['cramps'],
            };

            prisma.dailyLog.upsert.mockResolvedValue({
                id: 'log-1',
                userId: 'user-1',
                date: new Date(),
                ...symptoms,
            } as any);

            const result = await service.logSymptoms('user-1', new Date(), symptoms);

            expect(result).toBeTruthy();
            expect(prisma.dailyLog.upsert).toHaveBeenCalled();
        });
    });

    describe('getPredictions', () => {
        it('should return cycle predictions', async () => {
            const mockCycles = [
                {
                    startDate: new Date('2025-12-01'),
                    endDate: new Date('2025-12-05'),
                    cycleLength: 28,
                },
            ];

            prisma.periodCycle.findMany.mockResolvedValue(mockCycles as any);

            predictionService.predictNextPeriod.mockReturnValue({
                startDate: new Date('2026-01-29'),
                confidence: 0.85,
            });

            predictionService.predictOvulation.mockReturnValue({
                date: new Date('2026-01-15'),
                confidence: 0.80,
            });

            predictionService.calculateFertileWindow.mockReturnValue({
                start: new Date('2026-01-13'),
                end: new Date('2026-01-17'),
            });

            const result = await service.getPredictions('user-1');

            expect(result).toHaveProperty('nextPeriod');
            expect(result).toHaveProperty('ovulation');
            expect(result).toHaveProperty('fertileWindow');
        });
    });
});
