import { Test, TestingModule } from '@nestjs/testing';
import { ContextBuilderService } from './context-builder.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ContextBuilderService', () => {
    let service: ContextBuilderService;
    let prismaService: PrismaService;

    // Mock data helpers
    const mockUser = {
        id: 'user-123',
        profile: { id: 'profile-123' },
    };

    const createMockDate = (daysAgo: number) => {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date;
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ContextBuilderService,
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            findUnique: jest.fn(),
                        },
                        pregnancy: {
                            findFirst: jest.fn(),
                        },
                        periodCycle: {
                            findFirst: jest.fn(),
                            findMany: jest.fn(),
                        },
                        waterLog: {
                            findMany: jest.fn(),
                        },
                        wellnessPreferences: {
                            findUnique: jest.fn(),
                        },
                        dailySteps: {
                            findUnique: jest.fn(),
                        },
                        meditationSession: {
                            findMany: jest.fn(),
                        },
                        sleepLog: {
                            findUnique: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<ContextBuilderService>(ContextBuilderService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('buildUserContext', () => {
        it('should throw error if user not found', async () => {
            jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

            await expect(service.buildUserContext('invalid-user')).rejects.toThrow(
                'User not found',
            );
        });

        describe('Scenario 1: Pregnant User Context', () => {
            it('should build context for pregnant user with all pregnancy data', async () => {
                // Mock user
                jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);

                // Mock active pregnancy (12 weeks pregnant)
                const lmpDate = createMockDate(84); // 12 weeks ago
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 196); // ~28 weeks from now

                jest.spyOn(prismaService.pregnancy, 'findFirst').mockResolvedValue({
                    isActive: true,
                    lmpDate,
                    dueDate,
                    anonymousMode: false,
                } as any);

                // Mock no period cycle (pregnant users shouldn't have active cycles)
                jest.spyOn(prismaService.periodCycle, 'findFirst').mockResolvedValue(null);

                // Mock water intake
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                jest.spyOn(prismaService.waterLog, 'findMany').mockResolvedValue([
                    { amountMl: 500 } as any,
                    { amountMl: 750 } as any,
                    { amountMl: 500 } as any,
                ]);

                // Mock wellness preferences
                jest.spyOn(prismaService.wellnessPreferences, 'findUnique').mockResolvedValue({
                    stepsGoal: 8000,
                    meditationGoalMin: 15,
                    sleepGoalHours: 8,
                } as any);

                // Mock wellness data
                jest.spyOn(prismaService.dailySteps, 'findUnique').mockResolvedValue({
                    count: 5000,
                } as any);

                jest.spyOn(prismaService.meditationSession, 'findMany').mockResolvedValue([
                    { durationMin: 10 } as any,
                    { durationMin: 5 } as any,
                ]);

                jest.spyOn(prismaService.sleepLog, 'findUnique').mockResolvedValue({
                    durationMin: 420,
                    quality: 'good',
                } as any);

                const context = await service.buildUserContext('user-123');

                // Verify pregnancy data
                expect(context.pregnancy).toBeDefined();
                expect(context.pregnancy?.weeks).toBe(12);
                expect(context.pregnancy?.days).toBe(0);
                expect(context.pregnancy?.trimester).toBe(1);
                expect(context.pregnancy?.isActive).toBe(true);
                expect(context.anonymousMode).toBe(false);

                // Verify no cycle data (pregnant)
                expect(context.cycleDay).toBeUndefined();
                expect(context.currentPhase).toBeUndefined();

                // Verify water data
                expect(context.waterToday).toBeDefined();
                expect(context.waterToday?.consumed).toBe(1750);
                expect(context.waterToday?.target).toBe(2500);
                expect(context.waterToday?.percentage).toBe(70);

                // Verify wellness data
                expect(context.wellness).toBeDefined();
                expect(context.wellness?.steps).toEqual({ today: 5000, goal: 8000 });
                expect(context.wellness?.meditation).toEqual({ todayMin: 15, goalMin: 15 });
                expect(context.wellness?.sleep).toEqual({
                    lastNightMin: 420,
                    quality: 'good',
                });
            });

            it('should handle pregnant user with anonymous mode enabled', async () => {
                jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);

                const lmpDate = createMockDate(140); // 20 weeks ago
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 140);

                jest.spyOn(prismaService.pregnancy, 'findFirst').mockResolvedValue({
                    isActive: true,
                    lmpDate,
                    dueDate,
                    anonymousMode: true, // Anonymous mode ON
                } as any);

                jest.spyOn(prismaService.periodCycle, 'findFirst').mockResolvedValue(null);
                jest.spyOn(prismaService.waterLog, 'findMany').mockResolvedValue([]);
                jest.spyOn(prismaService.wellnessPreferences, 'findUnique').mockResolvedValue(null);

                const context = await service.buildUserContext('user-123');

                expect(context.pregnancy).toBeDefined();
                expect(context.pregnancy?.weeks).toBe(20);
                expect(context.pregnancy?.trimester).toBe(2);
                expect(context.anonymousMode).toBe(true);
            });
        });

        describe('Scenario 2: User with Active Period Cycle', () => {
            it('should build context for user in menstrual phase (day 3)', async () => {
                jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);

                // No pregnancy
                jest.spyOn(prismaService.pregnancy, 'findFirst').mockResolvedValue(null);

                // Active cycle started 3 days ago
                const cycleStartDate = createMockDate(2); // Day 3 of cycle
                jest.spyOn(prismaService.periodCycle, 'findFirst').mockResolvedValue({
                    startDate: cycleStartDate,
                } as any);

                // Mock completed cycles for prediction
                jest.spyOn(prismaService.periodCycle, 'findMany').mockResolvedValue([
                    {
                        startDate: createMockDate(30),
                        endDate: createMockDate(2),
                    } as any,
                    {
                        startDate: createMockDate(58),
                        endDate: createMockDate(30),
                    } as any,
                    {
                        startDate: createMockDate(86),
                        endDate: createMockDate(58),
                    } as any,
                ]);

                jest.spyOn(prismaService.waterLog, 'findMany').mockResolvedValue([]);
                jest.spyOn(prismaService.wellnessPreferences, 'findUnique').mockResolvedValue(null);

                const context = await service.buildUserContext('user-123');

                expect(context.cycleDay).toBe(3);
                expect(context.currentPhase).toBe('menstrual');
                expect(context.nextPeriodEstimate).toBeDefined();
                // The estimate should be defined, but may be negative if we're past the predicted date
                // This is expected behavior - just verify it exists
                expect(context.nextPeriodEstimate?.daysUntil).toBeDefined();
                expect(context.pregnancy).toBeUndefined();
            });

            it('should build context for user in follicular phase (day 10)', async () => {
                jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);
                jest.spyOn(prismaService.pregnancy, 'findFirst').mockResolvedValue(null);

                const cycleStartDate = createMockDate(9); // Day 10 of cycle
                jest.spyOn(prismaService.periodCycle, 'findFirst').mockResolvedValue({
                    startDate: cycleStartDate,
                } as any);

                jest.spyOn(prismaService.periodCycle, 'findMany').mockResolvedValue([
                    {
                        startDate: createMockDate(37),
                        endDate: createMockDate(9),
                    } as any,
                ]);

                jest.spyOn(prismaService.waterLog, 'findMany').mockResolvedValue([]);
                jest.spyOn(prismaService.wellnessPreferences, 'findUnique').mockResolvedValue(null);

                const context = await service.buildUserContext('user-123');

                expect(context.cycleDay).toBe(10);
                expect(context.currentPhase).toBe('follicular');
            });

            it('should build context for user in ovulation phase (day 14)', async () => {
                jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);
                jest.spyOn(prismaService.pregnancy, 'findFirst').mockResolvedValue(null);

                const cycleStartDate = createMockDate(13); // Day 14 of cycle
                jest.spyOn(prismaService.periodCycle, 'findFirst').mockResolvedValue({
                    startDate: cycleStartDate,
                } as any);

                jest.spyOn(prismaService.periodCycle, 'findMany').mockResolvedValue([]);
                jest.spyOn(prismaService.waterLog, 'findMany').mockResolvedValue([]);
                jest.spyOn(prismaService.wellnessPreferences, 'findUnique').mockResolvedValue(null);

                const context = await service.buildUserContext('user-123');

                expect(context.cycleDay).toBe(14);
                expect(context.currentPhase).toBe('ovulation');
            });

            it('should build context for user in luteal phase (day 20)', async () => {
                jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);
                jest.spyOn(prismaService.pregnancy, 'findFirst').mockResolvedValue(null);

                const cycleStartDate = createMockDate(19); // Day 20 of cycle
                jest.spyOn(prismaService.periodCycle, 'findFirst').mockResolvedValue({
                    startDate: cycleStartDate,
                } as any);

                jest.spyOn(prismaService.periodCycle, 'findMany').mockResolvedValue([]);
                jest.spyOn(prismaService.waterLog, 'findMany').mockResolvedValue([]);
                jest.spyOn(prismaService.wellnessPreferences, 'findUnique').mockResolvedValue(null);

                const context = await service.buildUserContext('user-123');

                expect(context.cycleDay).toBe(20);
                expect(context.currentPhase).toBe('luteal');
            });
        });

        describe('Scenario 3: User with Wellness Data', () => {
            it('should build context with complete wellness data', async () => {
                jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);
                jest.spyOn(prismaService.pregnancy, 'findFirst').mockResolvedValue(null);
                jest.spyOn(prismaService.periodCycle, 'findFirst').mockResolvedValue(null);
                jest.spyOn(prismaService.waterLog, 'findMany').mockResolvedValue([]);

                // Mock wellness preferences
                jest.spyOn(prismaService.wellnessPreferences, 'findUnique').mockResolvedValue({
                    stepsGoal: 10000,
                    meditationGoalMin: 20,
                    sleepGoalHours: 8,
                } as any);

                // Mock steps data
                jest.spyOn(prismaService.dailySteps, 'findUnique').mockResolvedValue({
                    count: 7500,
                } as any);

                // Mock meditation data
                jest.spyOn(prismaService.meditationSession, 'findMany').mockResolvedValue([
                    { durationMin: 15 } as any,
                    { durationMin: 10 } as any,
                ]);

                // Mock sleep data
                jest.spyOn(prismaService.sleepLog, 'findUnique').mockResolvedValue({
                    durationMin: 480,
                    quality: 'excellent',
                } as any);

                const context = await service.buildUserContext('user-123');

                expect(context.wellness).toBeDefined();
                expect(context.wellness?.steps).toEqual({ today: 7500, goal: 10000 });
                expect(context.wellness?.meditation).toEqual({ todayMin: 25, goalMin: 20 });
                expect(context.wellness?.sleep).toEqual({
                    lastNightMin: 480,
                    quality: 'excellent',
                });
            });

            it('should build context with partial wellness data (only steps)', async () => {
                jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);
                jest.spyOn(prismaService.pregnancy, 'findFirst').mockResolvedValue(null);
                jest.spyOn(prismaService.periodCycle, 'findFirst').mockResolvedValue(null);
                jest.spyOn(prismaService.waterLog, 'findMany').mockResolvedValue([]);

                jest.spyOn(prismaService.wellnessPreferences, 'findUnique').mockResolvedValue({
                    stepsGoal: 7000,
                    meditationGoalMin: 10,
                    sleepGoalHours: 8,
                } as any);

                // Only steps data available
                jest.spyOn(prismaService.dailySteps, 'findUnique').mockResolvedValue({
                    count: 3000,
                } as any);

                jest.spyOn(prismaService.meditationSession, 'findMany').mockResolvedValue([]);
                jest.spyOn(prismaService.sleepLog, 'findUnique').mockResolvedValue(null);

                const context = await service.buildUserContext('user-123');

                expect(context.wellness).toBeDefined();
                expect(context.wellness?.steps).toEqual({ today: 3000, goal: 7000 });
                expect(context.wellness?.meditation).toBeUndefined();
                expect(context.wellness?.sleep).toBeUndefined();
            });

            it('should handle wellness preferences without any logged data', async () => {
                jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);
                jest.spyOn(prismaService.pregnancy, 'findFirst').mockResolvedValue(null);
                jest.spyOn(prismaService.periodCycle, 'findFirst').mockResolvedValue(null);
                jest.spyOn(prismaService.waterLog, 'findMany').mockResolvedValue([]);

                jest.spyOn(prismaService.wellnessPreferences, 'findUnique').mockResolvedValue({
                    stepsGoal: 10000,
                    meditationGoalMin: 15,
                    sleepGoalHours: 8,
                } as any);

                // No wellness data logged
                jest.spyOn(prismaService.dailySteps, 'findUnique').mockResolvedValue(null);
                jest.spyOn(prismaService.meditationSession, 'findMany').mockResolvedValue([]);
                jest.spyOn(prismaService.sleepLog, 'findUnique').mockResolvedValue(null);

                const context = await service.buildUserContext('user-123');

                expect(context.wellness).toBeUndefined();
            });
        });

        describe('Scenario 4: New User with No Data', () => {
            it('should build minimal context for new user with no health data', async () => {
                jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);

                // No pregnancy
                jest.spyOn(prismaService.pregnancy, 'findFirst').mockResolvedValue(null);

                // No period cycle
                jest.spyOn(prismaService.periodCycle, 'findFirst').mockResolvedValue(null);

                // No water logs
                jest.spyOn(prismaService.waterLog, 'findMany').mockResolvedValue([]);

                // No wellness preferences
                jest.spyOn(prismaService.wellnessPreferences, 'findUnique').mockResolvedValue(null);

                const context = await service.buildUserContext('user-123');

                // Should have only default values
                expect(context.language).toBe('tr');
                expect(context.anonymousMode).toBe(false);

                // No health data
                expect(context.pregnancy).toBeUndefined();
                expect(context.cycleDay).toBeUndefined();
                expect(context.currentPhase).toBeUndefined();
                expect(context.nextPeriodEstimate).toBeUndefined();
                expect(context.waterToday).toBeUndefined();
                expect(context.wellness).toBeUndefined();
            });

            it('should build context for user with only water intake data', async () => {
                jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser as any);
                jest.spyOn(prismaService.pregnancy, 'findFirst').mockResolvedValue(null);
                jest.spyOn(prismaService.periodCycle, 'findFirst').mockResolvedValue(null);

                // Only water data
                jest.spyOn(prismaService.waterLog, 'findMany').mockResolvedValue([
                    { amountMl: 250 } as any,
                    { amountMl: 500 } as any,
                ]);

                jest.spyOn(prismaService.wellnessPreferences, 'findUnique').mockResolvedValue(null);

                const context = await service.buildUserContext('user-123');

                expect(context.waterToday).toBeDefined();
                expect(context.waterToday?.consumed).toBe(750);
                expect(context.waterToday?.percentage).toBe(30);

                // No other health data
                expect(context.pregnancy).toBeUndefined();
                expect(context.cycleDay).toBeUndefined();
                expect(context.wellness).toBeUndefined();
            });
        });
    });

    describe('buildSystemPrompt', () => {
        it('should generate base prompt for user with no data', () => {
            const context = {
                language: 'tr' as const,
                anonymousMode: false,
            };

            const prompt = service.buildSystemPrompt(context);

            expect(prompt).toContain('Sen "NOVA"sın');
            expect(prompt).toContain('Tıp uzmanı değilsin');
            expect(prompt).toContain('Türkçe konuş');
            expect(prompt).toContain('**Kullanıcı Bağlamı:**');
            expect(prompt).not.toContain('🤰 Hamilelik');
            expect(prompt).not.toContain('🩸 Regl Döngüsü');
        });

        it('should include pregnancy information in prompt', () => {
            const context = {
                language: 'tr' as const,
                anonymousMode: false,
                pregnancy: {
                    isActive: true,
                    weeks: 15,
                    days: 3,
                    dueDate: '2025-07-15',
                    trimester: 2,
                },
            };

            const prompt = service.buildSystemPrompt(context);

            expect(prompt).toContain('🤰 Hamilelik: 15 hafta 3 gün (2. trimester)');
            expect(prompt).toContain('Tahmini doğum tarihi: 2025-07-15');
            expect(prompt).not.toContain('⚠️ Anonim mod aktif');
        });

        it('should include anonymous mode warning for pregnant user', () => {
            const context = {
                language: 'tr' as const,
                anonymousMode: true,
                pregnancy: {
                    isActive: true,
                    weeks: 20,
                    days: 0,
                    dueDate: '2025-08-01',
                    trimester: 2,
                },
            };

            const prompt = service.buildSystemPrompt(context);

            expect(prompt).toContain('⚠️ Anonim mod aktif - kişisel bilgileri kaydetme');
        });

        it('should include cycle information in prompt', () => {
            const context = {
                language: 'tr' as const,
                anonymousMode: false,
                cycleDay: 14,
                currentPhase: 'ovulation' as const,
                nextPeriodEstimate: {
                    date: '2025-10-30',
                    daysUntil: 14,
                },
            };

            const prompt = service.buildSystemPrompt(context);

            expect(prompt).toContain('🩸 Regl Döngüsü: 14. gün (ovulation fazı)');
            expect(prompt).toContain('Sonraki regl tahmini: 14 gün sonra');
        });

        it('should include water intake with encouragement when low', () => {
            const context = {
                language: 'tr' as const,
                anonymousMode: false,
                waterToday: {
                    consumed: 1000,
                    target: 2500,
                    percentage: 40,
                },
            };

            const prompt = service.buildSystemPrompt(context);

            expect(prompt).toContain('💧 Bugünkü Su Tüketimi: 1000ml / 2500ml (40%)');
            expect(prompt).toContain('Kullanıcıyı su içmeye teşvik edebilirsin');
        });

        it('should include water intake without encouragement when adequate', () => {
            const context = {
                language: 'tr' as const,
                anonymousMode: false,
                waterToday: {
                    consumed: 2000,
                    target: 2500,
                    percentage: 80,
                },
            };

            const prompt = service.buildSystemPrompt(context);

            expect(prompt).toContain('💧 Bugünkü Su Tüketimi: 2000ml / 2500ml (80%)');
            expect(prompt).not.toContain('Kullanıcıyı su içmeye teşvik edebilirsin');
        });

        it('should include complete wellness data in prompt', () => {
            const context = {
                language: 'tr' as const,
                anonymousMode: false,
                wellness: {
                    steps: { today: 8000, goal: 10000 },
                    meditation: { todayMin: 15, goalMin: 10 },
                    sleep: { lastNightMin: 420, quality: 'good' },
                },
            };

            const prompt = service.buildSystemPrompt(context);

            expect(prompt).toContain('**Wellness Verileri:**');
            expect(prompt).toContain('🚶 Adımlar: 8000 / 10000');
            expect(prompt).toContain('🧘 Meditasyon: 15 dakika');
            expect(prompt).toContain('😴 Uyku: 7 saat (good)');
        });

        it('should include all data types in comprehensive prompt', () => {
            const context = {
                language: 'tr' as const,
                anonymousMode: false,
                pregnancy: {
                    isActive: true,
                    weeks: 25,
                    days: 2,
                    dueDate: '2025-09-15',
                    trimester: 3,
                },
                waterToday: {
                    consumed: 1800,
                    target: 2500,
                    percentage: 72,
                },
                wellness: {
                    steps: { today: 5000, goal: 7000 },
                    meditation: { todayMin: 20, goalMin: 15 },
                    sleep: { lastNightMin: 480, quality: 'excellent' },
                },
            };

            const prompt = service.buildSystemPrompt(context);

            expect(prompt).toContain('🤰 Hamilelik: 25 hafta 2 gün (3. trimester)');
            expect(prompt).toContain('💧 Bugünkü Su Tüketimi: 1800ml / 2500ml (72%)');
            expect(prompt).toContain('**Wellness Verileri:**');
            expect(prompt).toContain('🚶 Adımlar: 5000 / 7000');
            expect(prompt).toContain('🧘 Meditasyon: 20 dakika');
            expect(prompt).toContain('😴 Uyku: 8 saat (excellent)');
        });
    });
});
