import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
    let service: UsersService;
    let prisma: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            findUnique: jest.fn(),
                            findMany: jest.fn(),
                            count: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                        profile: {
                            findUnique: jest.fn(),
                            update: jest.fn(),
                            upsert: jest.fn(),
                        },
                        $transaction: jest.fn(),
                        healthMetric: { findMany: jest.fn() },
                        waterLog: { findMany: jest.fn() },
                        periodCycle: { findMany: jest.fn() },
                        pregnancy: { findMany: jest.fn() },
                        reminder: { findMany: jest.fn() },
                        conversation: { findMany: jest.fn() },
                        message: { findMany: jest.fn() },
                        memory: { findMany: jest.fn() },
                        usageQuota: { findUnique: jest.fn() },
                    },
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        prisma = module.get(PrismaService);
    });

    describe('isUsernameAvailable', () => {
        it('should return true if username is available', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const result = await service.isUsernameAvailable('testuser');

            expect(result).toBe(true);
        });

        it('should return false if username is taken', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 'user-1' } as any);

            const result = await service.isUsernameAvailable('testuser');

            expect(result).toBe(false);
        });
    });

    describe('getUserWithProfile', () => {
        it('should return user without sensitive data', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'test@example.com',
                password: 'hashed-password',
                pinHash: 'hashed-pin',
                profile: {},
                subscription: {},
                usageQuota: {},
            };

            prisma.user.findUnique.mockResolvedValue(mockUser as any);

            const result = await service.getUserWithProfile('user-1');

            expect(result).not.toHaveProperty('password');
            expect(result).not.toHaveProperty('pinHash');
            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('email');
        });

        it('should return null for non-existent user', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const result = await service.getUserWithProfile('user-1');

            expect(result).toBeNull();
        });
    });

    describe('updateProfile', () => {
        it('should update profile successfully', async () => {
            const mockProfile = {
                userId: 'user-1',
                firstName: 'John',
                lastName: 'Doe',
            };

            prisma.profile.findUnique.mockResolvedValue(mockProfile as any);
            prisma.profile.update.mockResolvedValue({} as any);
            prisma.user.findUnique.mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
                profile: mockProfile,
            } as any);

            const result = await service.updateProfile('user-1', {
                firstName: 'Jane',
            });

            expect(prisma.profile.update).toHaveBeenCalled();
        });

        it('should throw error if profile not found', async () => {
            prisma.profile.findUnique.mockResolvedValue(null);

            await expect(service.updateProfile('user-1', {})).rejects.toThrow(BadRequestException);
        });

        it('should regenerate displayName when names change', async () => {
            const mockProfile = {
                userId: 'user-1',
                firstName: 'John',
                lastName: 'Doe',
            };

            prisma.profile.findUnique.mockResolvedValue(mockProfile as any);
            prisma.profile.update.mockResolvedValue({} as any);
            prisma.user.findUnique.mockResolvedValue({
                id: 'user-1',
                profile: mockProfile,
            } as any);

            await service.updateProfile('user-1', {
                firstName: 'Jane',
                lastName: 'Smith',
            });

            expect(prisma.profile.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        displayName: 'Jane Smith',
                    }),
                }),
            );
        });
    });

    describe('updateUsername', () => {
        it('should update username successfully', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.user.update.mockResolvedValue({} as any);
            prisma.user.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce({
                id: 'user-1',
                username: 'newusername',
            } as any);

            await service.updateUsername('user-1', 'newusername');

            expect(prisma.user.update).toHaveBeenCalled();
        });

        it('should throw error for invalid username format', async () => {
            await expect(service.updateUsername('user-1', 'Invalid User!')).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw error for short username', async () => {
            await expect(service.updateUsername('user-1', 'ab')).rejects.toThrow(BadRequestException);
        });

        it('should throw error for taken username', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 'other-user' } as any);

            await expect(service.updateUsername('user-1', 'takenusername')).rejects.toThrow(
                ConflictException,
            );
        });
    });

    describe('getAllUsers', () => {
        it('should return paginated users', async () => {
            const mockUsers = [
                { id: 'user-1', email: 'test1@example.com', password: 'hash', pinHash: null },
                { id: 'user-2', email: 'test2@example.com', password: 'hash', pinHash: null },
            ];

            prisma.user.findMany.mockResolvedValue(mockUsers as any);
            prisma.user.count.mockResolvedValue(2);

            const result = await service.getAllUsers(1, 10);

            expect(result.data).toHaveLength(2);
            expect(result.total).toBe(2);
            expect(result.data[0]).not.toHaveProperty('password');
            expect(result.data[0]).not.toHaveProperty('pinHash');
        });
    });

    describe('setupPin', () => {
        it('should setup PIN successfully', async () => {
            prisma.user.update.mockResolvedValue({} as any);

            const result = await service.setupPin('user-1', '1234');

            expect(result.success).toBe(true);
            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        pinEnabled: true,
                    }),
                }),
            );
        });

        it('should throw error for invalid PIN format', async () => {
            await expect(service.setupPin('user-1', '12')).rejects.toThrow(BadRequestException);
            await expect(service.setupPin('user-1', 'abcd')).rejects.toThrow(BadRequestException);
        });
    });

    describe('verifyPin', () => {
        it('should verify PIN successfully', async () => {
            const bcrypt = require('bcrypt');
            const pinHash = await bcrypt.hash('1234', 10);

            prisma.user.findUnique.mockResolvedValue({
                pinHash,
                pinEnabled: true,
            } as any);

            const result = await service.verifyPin('user-1', '1234');

            expect(result.success).toBe(true);
        });

        it('should throw error for wrong PIN', async () => {
            const bcrypt = require('bcrypt');
            const pinHash = await bcrypt.hash('1234', 10);

            prisma.user.findUnique.mockResolvedValue({
                pinHash,
                pinEnabled: true,
            } as any);

            await expect(service.verifyPin('user-1', '5678')).rejects.toThrow(BadRequestException);
        });

        it('should throw error if PIN not setup', async () => {
            prisma.user.findUnique.mockResolvedValue({
                pinHash: null,
                pinEnabled: false,
            } as any);

            await expect(service.verifyPin('user-1', '1234')).rejects.toThrow(BadRequestException);
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            const bcrypt = require('bcrypt');
            const currentPasswordHash = await bcrypt.hash('oldpassword', 10);

            prisma.user.findUnique.mockResolvedValue({
                id: 'user-1',
                password: currentPasswordHash,
            } as any);

            prisma.user.update.mockResolvedValue({} as any);

            const result = await service.changePassword('user-1', 'oldpassword', 'newpassword123');

            expect(result.success).toBe(true);
            expect(prisma.user.update).toHaveBeenCalled();
        });

        it('should throw error for wrong current password', async () => {
            const bcrypt = require('bcrypt');
            const currentPasswordHash = await bcrypt.hash('oldpassword', 10);

            prisma.user.findUnique.mockResolvedValue({
                id: 'user-1',
                password: currentPasswordHash,
            } as any);

            await expect(
                service.changePassword('user-1', 'wrongpassword', 'newpassword123'),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw error for short new password', async () => {
            const bcrypt = require('bcrypt');
            const currentPasswordHash = await bcrypt.hash('oldpassword', 10);

            prisma.user.findUnique.mockResolvedValue({
                id: 'user-1',
                password: currentPasswordHash,
            } as any);

            await expect(service.changePassword('user-1', 'oldpassword', '123')).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw error if new password same as current', async () => {
            const bcrypt = require('bcrypt');
            const currentPasswordHash = await bcrypt.hash('samepassword', 10);

            prisma.user.findUnique.mockResolvedValue({
                id: 'user-1',
                password: currentPasswordHash,
            } as any);

            await expect(
                service.changePassword('user-1', 'samepassword', 'samepassword'),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('exportUserData', () => {
        it('should export all user data', async () => {
            prisma.user.findUnique.mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
                password: 'hash',
                pinHash: null,
            } as any);

            prisma.healthMetric.findMany.mockResolvedValue([]);
            prisma.waterLog.findMany.mockResolvedValue([]);
            prisma.periodCycle.findMany.mockResolvedValue([]);
            prisma.pregnancy.findMany.mockResolvedValue([]);
            prisma.reminder.findMany.mockResolvedValue([]);
            prisma.conversation.findMany.mockResolvedValue([]);
            prisma.message.findMany.mockResolvedValue([]);
            prisma.memory.findMany.mockResolvedValue([]);
            prisma.usageQuota.findUnique.mockResolvedValue(null);

            const result = await service.exportUserData('user-1');

            expect(result).toHaveProperty('exportDate');
            expect(result).toHaveProperty('user');
            expect(result.user).not.toHaveProperty('password');
            expect(result.user).not.toHaveProperty('pinHash');
        });

        it('should throw error for non-existent user', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(service.exportUserData('user-1')).rejects.toThrow(BadRequestException);
        });
    });
});
