import { Test, TestingModule } from '@nestjs/testing';
import { QuotaService } from './quota.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('QuotaService', () => {
    let service: QuotaService;
    let prisma: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuotaService,
                {
                    provide: PrismaService,
                    useValue: {
                        usageQuota: {
                            findUnique: jest.fn(),
                            upsert: jest.fn(),
                            update: jest.fn(),
                        },
                        subscription: {
                            findUnique: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<QuotaService>(QuotaService);
        prisma = module.get(PrismaService);
    });

    describe('checkQuota', () => {
        it('should return quota status with remaining quota', async () => {
            const mockQuota = {
                userId: 'user-1',
                monthKey: '2026-01',
                aiRequests: 50,
                limit: 100,
                resetsAt: new Date('2026-02-01'),
            };

            prisma.usageQuota.findUnique.mockResolvedValue(mockQuota as any);

            const result = await service.checkQuota('user-1');

            expect(result).toEqual({
                hasQuota: true,
                used: 50,
                limit: 100,
                remaining: 50,
                resetDate: mockQuota.resetsAt,
                percentage: 50,
            });
        });

        it('should return no quota when limit reached', async () => {
            const mockQuota = {
                userId: 'user-1',
                monthKey: '2026-01',
                aiRequests: 100,
                limit: 100,
                resetsAt: new Date('2026-02-01'),
            };

            prisma.usageQuota.findUnique.mockResolvedValue(mockQuota as any);

            const result = await service.checkQuota('user-1');

            expect(result.hasQuota).toBe(false);
            expect(result.remaining).toBe(0);
        });

        it('should create quota if not exists', async () => {
            prisma.usageQuota.findUnique.mockResolvedValue(null);
            prisma.usageQuota.upsert.mockResolvedValue({
                userId: 'user-1',
                aiRequests: 0,
                limit: 100,
                resetsAt: new Date('2026-02-01'),
            } as any);

            const result = await service.checkQuota('user-1');

            expect(prisma.usageQuota.upsert).toHaveBeenCalled();
            expect(result.used).toBe(0);
        });
    });

    describe('incrementUsage', () => {
        it('should increment usage successfully', async () => {
            const mockQuota = {
                userId: 'user-1',
                aiRequests: 50,
                limit: 100,
            };

            prisma.usageQuota.findUnique.mockResolvedValue(mockQuota as any);
            prisma.usageQuota.update.mockResolvedValue({} as any);

            await service.incrementUsage('user-1');

            expect(prisma.usageQuota.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        aiRequests: expect.objectContaining({ increment: 1 }),
                    }),
                }),
            );
        });

        it('should throw error when quota exceeded', async () => {
            const mockQuota = {
                userId: 'user-1',
                aiRequests: 100,
                limit: 100,
            };

            prisma.usageQuota.findUnique.mockResolvedValue(mockQuota as any);

            await expect(service.incrementUsage('user-1')).rejects.toThrow(BadRequestException);
        });
    });

    describe('resetQuota', () => {
        it('should reset quota for new month', async () => {
            prisma.subscription.findUnique.mockResolvedValue({
                status: 'ACTIVE',
            } as any);

            prisma.usageQuota.upsert.mockResolvedValue({} as any);

            await service.resetQuota('user-1');

            expect(prisma.usageQuota.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    update: expect.objectContaining({
                        aiRequests: 0,
                    }),
                }),
            );
        });
    });
});
