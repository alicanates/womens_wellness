import { Test, TestingModule } from '@nestjs/testing';
import { PregnancyService } from './pregnancy.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('PregnancyService', () => {
    let service: PregnancyService;
    let prisma: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PregnancyService,
                {
                    provide: PrismaService,
                    useValue: {
                        pregnancy: {
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            findFirst: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                        pregnancyLog: {
                            findMany: jest.fn(),
                            create: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<PregnancyService>(PregnancyService);
        prisma = module.get(PrismaService);
    });

    describe('getActivePregnancy', () => {
        it('should return active pregnancy', async () => {
            const mockPregnancy = {
                id: 'preg-1',
                userId: 'user-1',
                dueDate: new Date('2026-10-01'),
                isActive: true,
            };

            prisma.pregnancy.findFirst.mockResolvedValue(mockPregnancy as any);

            const result = await service.getActivePregnancy('user-1');

            expect(result).toEqual(mockPregnancy);
        });

        it('should return null if no active pregnancy', async () => {
            prisma.pregnancy.findFirst.mockResolvedValue(null);

            const result = await service.getActivePregnancy('user-1');

            expect(result).toBeNull();
        });
    });

    describe('createPregnancy', () => {
        it('should create new pregnancy', async () => {
            const dueDate = new Date('2026-10-01');
            const mockPregnancy = {
                id: 'preg-1',
                userId: 'user-1',
                dueDate,
                isActive: true,
            };

            prisma.pregnancy.findFirst.mockResolvedValue(null);
            prisma.pregnancy.create.mockResolvedValue(mockPregnancy as any);

            const result = await service.createPregnancy('user-1', { dueDate });

            expect(result).toEqual(mockPregnancy);
        });

        it('should throw error if active pregnancy exists', async () => {
            prisma.pregnancy.findFirst.mockResolvedValue({
                id: 'preg-1',
                isActive: true,
            } as any);

            await expect(
                service.createPregnancy('user-1', { dueDate: new Date() }),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('calculateWeek', () => {
        it('should calculate current pregnancy week', async () => {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 200); // ~28 weeks from now

            const mockPregnancy = {
                id: 'preg-1',
                dueDate,
                isActive: true,
            };

            prisma.pregnancy.findUnique.mockResolvedValue(mockPregnancy as any);

            const result = await service.calculateWeek('preg-1');

            expect(result).toHaveProperty('week');
            expect(result).toHaveProperty('day');
            expect(result.week).toBeGreaterThan(0);
            expect(result.week).toBeLessThanOrEqual(42);
        });
    });

    describe('logPregnancyData', () => {
        it('should log pregnancy symptoms', async () => {
            const logData = {
                weight: 65.5,
                symptoms: ['nausea', 'fatigue'],
                notes: 'Feeling tired',
            };

            prisma.pregnancyLog.create.mockResolvedValue({
                id: 'log-1',
                pregnancyId: 'preg-1',
                ...logData,
            } as any);

            const result = await service.logPregnancyData('preg-1', logData);

            expect(result).toBeTruthy();
            expect(prisma.pregnancyLog.create).toHaveBeenCalled();
        });
    });

    describe('getPregnancyLogs', () => {
        it('should return pregnancy logs', async () => {
            const mockLogs = [
                {
                    id: 'log-1',
                    pregnancyId: 'preg-1',
                    weight: 65.5,
                    createdAt: new Date(),
                },
            ];

            prisma.pregnancyLog.findMany.mockResolvedValue(mockLogs as any);

            const result = await service.getPregnancyLogs('preg-1');

            expect(result).toEqual(mockLogs);
        });
    });

    describe('endPregnancy', () => {
        it('should end active pregnancy', async () => {
            const mockPregnancy = {
                id: 'preg-1',
                isActive: true,
            };

            prisma.pregnancy.findUnique.mockResolvedValue(mockPregnancy as any);
            prisma.pregnancy.update.mockResolvedValue({
                ...mockPregnancy,
                isActive: false,
            } as any);

            const result = await service.endPregnancy('preg-1');

            expect(result.isActive).toBe(false);
        });
    });
});
