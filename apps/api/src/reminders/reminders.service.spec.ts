import { Test, TestingModule } from '@nestjs/testing';
import { RemindersService } from './reminders.service';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from './push.service';
import { BadRequestException } from '@nestjs/common';

describe('RemindersService', () => {
    let service: RemindersService;
    let prisma: jest.Mocked<PrismaService>;
    let pushService: jest.Mocked<PushService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RemindersService,
                {
                    provide: PrismaService,
                    useValue: {
                        reminder: {
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                        user: {
                            findUnique: jest.fn(),
                        },
                    },
                },
                {
                    provide: PushService,
                    useValue: {
                        sendNotification: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<RemindersService>(RemindersService);
        prisma = module.get(PrismaService);
        pushService = module.get(PushService);
    });

    describe('getReminders', () => {
        it('should return user reminders', async () => {
            const mockReminders = [
                {
                    id: 'reminder-1',
                    userId: 'user-1',
                    title: 'Take medication',
                    time: '09:00',
                    isActive: true,
                },
            ];

            prisma.reminder.findMany.mockResolvedValue(mockReminders as any);

            const result = await service.getReminders('user-1');

            expect(result).toEqual(mockReminders);
        });
    });

    describe('createReminder', () => {
        it('should create new reminder', async () => {
            const reminderData = {
                title: 'Take medication',
                time: '09:00',
                repeatDays: [1, 2, 3, 4, 5],
            };

            prisma.reminder.create.mockResolvedValue({
                id: 'reminder-1',
                userId: 'user-1',
                isActive: true,
                ...reminderData,
            } as any);

            const result = await service.createReminder('user-1', reminderData);

            expect(result).toBeTruthy();
            expect(prisma.reminder.create).toHaveBeenCalled();
        });
    });

    describe('updateReminder', () => {
        it('should update reminder', async () => {
            const mockReminder = {
                id: 'reminder-1',
                userId: 'user-1',
                title: 'Old title',
            };

            prisma.reminder.findUnique.mockResolvedValue(mockReminder as any);
            prisma.reminder.update.mockResolvedValue({
                ...mockReminder,
                title: 'New title',
            } as any);

            const result = await service.updateReminder('user-1', 'reminder-1', {
                title: 'New title',
            });

            expect(result.title).toBe('New title');
        });

        it('should throw error if reminder not found', async () => {
            prisma.reminder.findUnique.mockResolvedValue(null);

            await expect(
                service.updateReminder('user-1', 'reminder-1', { title: 'New' }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw error if user does not own reminder', async () => {
            prisma.reminder.findUnique.mockResolvedValue({
                id: 'reminder-1',
                userId: 'other-user',
            } as any);

            await expect(
                service.updateReminder('user-1', 'reminder-1', { title: 'New' }),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('deleteReminder', () => {
        it('should delete reminder', async () => {
            const mockReminder = {
                id: 'reminder-1',
                userId: 'user-1',
            };

            prisma.reminder.findUnique.mockResolvedValue(mockReminder as any);
            prisma.reminder.delete.mockResolvedValue(mockReminder as any);

            await service.deleteReminder('user-1', 'reminder-1');

            expect(prisma.reminder.delete).toHaveBeenCalledWith({
                where: { id: 'reminder-1' },
            });
        });
    });

    describe('toggleReminder', () => {
        it('should toggle reminder active status', async () => {
            const mockReminder = {
                id: 'reminder-1',
                userId: 'user-1',
                isActive: true,
            };

            prisma.reminder.findUnique.mockResolvedValue(mockReminder as any);
            prisma.reminder.update.mockResolvedValue({
                ...mockReminder,
                isActive: false,
            } as any);

            const result = await service.toggleReminder('user-1', 'reminder-1');

            expect(result.isActive).toBe(false);
        });
    });

    describe('sendReminder', () => {
        it('should send push notification', async () => {
            const mockUser = {
                id: 'user-1',
                pushToken: 'expo-token-123',
            };

            const mockReminder = {
                id: 'reminder-1',
                title: 'Take medication',
                message: 'Time to take your medication',
            };

            prisma.user.findUnique.mockResolvedValue(mockUser as any);
            pushService.sendNotification.mockResolvedValue({ success: true } as any);

            await service.sendReminder('user-1', mockReminder as any);

            expect(pushService.sendNotification).toHaveBeenCalledWith(
                'expo-token-123',
                expect.objectContaining({
                    title: 'Take medication',
                }),
            );
        });

        it('should not send if user has no push token', async () => {
            const mockUser = {
                id: 'user-1',
                pushToken: null,
            };

            prisma.user.findUnique.mockResolvedValue(mockUser as any);

            await service.sendReminder('user-1', {} as any);

            expect(pushService.sendNotification).not.toHaveBeenCalled();
        });
    });
});
