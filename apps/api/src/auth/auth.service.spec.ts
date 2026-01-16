import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
    let service: AuthService;
    let prisma: jest.Mocked<PrismaService>;
    let jwtService: jest.Mocked<JwtService>;
    let configService: jest.Mocked<ConfigService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            findUnique: jest.fn(),
                            create: jest.fn(),
                        },
                        passwordResetToken: {
                            findUnique: jest.fn(),
                            create: jest.fn(),
                            deleteMany: jest.fn(),
                            update: jest.fn(),
                        },
                        $transaction: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(),
                        verify: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prisma = module.get(PrismaService);
        jwtService = module.get(JwtService);
        configService = module.get(ConfigService);
    });

    describe('isEmailAvailable', () => {
        it('should return true if email is available', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const result = await service.isEmailAvailable('test@example.com');

            expect(result).toBe(true);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
        });

        it('should return false if email is taken', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 'user-1' } as any);

            const result = await service.isEmailAvailable('test@example.com');

            expect(result).toBe(false);
        });
    });

    describe('isUsernameAvailable', () => {
        it('should return true if username is available', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const result = await service.isUsernameAvailable('testuser');

            expect(result).toBe(true);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { username: 'testuser' },
            });
        });

        it('should return false if username is taken', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 'user-1' } as any);

            const result = await service.isUsernameAvailable('testuser');

            expect(result).toBe(false);
        });
    });

    describe('validateUser', () => {
        it('should validate user with email', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                profile: {},
            };

            prisma.user.findUnique.mockResolvedValue(mockUser as any);

            const result = await service.validateUser('test@example.com', 'password123');

            expect(result).toEqual(mockUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
                include: { profile: true },
            });
        });

        it('should validate user with username', async () => {
            const mockUser = {
                id: 'user-1',
                username: 'testuser',
                password: await bcrypt.hash('password123', 10),
                profile: {},
            };

            prisma.user.findUnique.mockResolvedValue(mockUser as any);

            const result = await service.validateUser('testuser', 'password123');

            expect(result).toEqual(mockUser);
            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { username: 'testuser' },
                include: { profile: true },
            });
        });

        it('should return null for invalid password', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
            };

            prisma.user.findUnique.mockResolvedValue(mockUser as any);

            const result = await service.validateUser('test@example.com', 'wrongpassword');

            expect(result).toBeNull();
        });

        it('should return null for non-existent user', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const result = await service.validateUser('test@example.com', 'password123');

            expect(result).toBeNull();
        });
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            prisma.user.findUnique.mockResolvedValue(null);
            prisma.user.create.mockResolvedValue({
                id: 'user-1',
                email: 'test@example.com',
                username: 'testuser',
                profile: { firstName: 'Test', lastName: 'User' },
            } as any);

            jwtService.sign.mockReturnValue('mock-token');
            configService.get.mockReturnValue('secret');

            const result = await service.register(
                'test@example.com',
                'password123',
                'testuser',
                'Test',
                'User',
            );

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result).toHaveProperty('user');
        });

        it('should throw error for invalid username format', async () => {
            await expect(
                service.register('test@example.com', 'password123', 'Test User!', 'Test', 'User'),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw error for short username', async () => {
            await expect(
                service.register('test@example.com', 'password123', 'ab', 'Test', 'User'),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw error for existing email', async () => {
            prisma.user.findUnique.mockResolvedValueOnce({ id: 'user-1' } as any);

            await expect(
                service.register('test@example.com', 'password123', 'testuser', 'Test', 'User'),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw error for existing username', async () => {
            prisma.user.findUnique
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ id: 'user-1' } as any);

            await expect(
                service.register('test@example.com', 'password123', 'testuser', 'Test', 'User'),
            ).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('login', () => {
        it('should generate access and refresh tokens', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'test@example.com',
                profile: {},
            };

            jwtService.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');
            configService.get.mockReturnValue('secret');

            const result = await service.login(mockUser);

            expect(result).toEqual({
                accessToken: 'access-token',
                refreshToken: 'refresh-token',
                user: {
                    id: 'user-1',
                    email: 'test@example.com',
                    profile: {},
                },
            });
        });
    });

    describe('refreshToken', () => {
        it('should refresh tokens successfully', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'test@example.com',
                profile: {},
            };

            jwtService.verify.mockReturnValue({ sub: 'user-1' });
            prisma.user.findUnique.mockResolvedValue(mockUser as any);
            jwtService.sign.mockReturnValueOnce('new-access-token').mockReturnValueOnce('new-refresh-token');
            configService.get.mockReturnValue('secret');

            const result = await service.refreshToken('old-refresh-token');

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
        });

        it('should throw error for invalid token', async () => {
            jwtService.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await expect(service.refreshToken('invalid-token')).rejects.toThrow(UnauthorizedException);
        });

        it('should throw error for non-existent user', async () => {
            jwtService.verify.mockReturnValue({ sub: 'user-1' });
            prisma.user.findUnique.mockResolvedValue(null);

            await expect(service.refreshToken('valid-token')).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('requestPasswordReset', () => {
        it('should create reset token for existing user', async () => {
            prisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'test@example.com' } as any);
            prisma.passwordResetToken.deleteMany.mockResolvedValue({ count: 0 });
            prisma.passwordResetToken.create.mockResolvedValue({ token: 'reset-token' } as any);

            const result = await service.requestPasswordReset('test@example.com');

            expect(result).toBeTruthy();
            expect(prisma.passwordResetToken.create).toHaveBeenCalled();
        });

        it('should return success for non-existent user (security)', async () => {
            prisma.user.findUnique.mockResolvedValue(null);

            const result = await service.requestPasswordReset('nonexistent@example.com');

            expect(result).toBe('success');
            expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
        });
    });

    describe('resetPassword', () => {
        it('should reset password successfully', async () => {
            const mockToken = {
                id: 'token-1',
                email: 'test@example.com',
                token: 'valid-token',
                used: false,
                expiresAt: new Date(Date.now() + 3600000),
            };

            const mockUser = { id: 'user-1', email: 'test@example.com' };

            prisma.passwordResetToken.findUnique.mockResolvedValue(mockToken as any);
            prisma.user.findUnique.mockResolvedValue(mockUser as any);
            (prisma.$transaction as jest.Mock).mockResolvedValue([{}, {}]);

            await service.resetPassword('valid-token', 'newpassword123');

            expect(prisma.$transaction).toHaveBeenCalled();
        });

        it('should throw error for invalid token', async () => {
            prisma.passwordResetToken.findUnique.mockResolvedValue(null);

            await expect(service.resetPassword('invalid-token', 'newpassword123')).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw error for used token', async () => {
            const mockToken = {
                id: 'token-1',
                token: 'used-token',
                used: true,
                expiresAt: new Date(Date.now() + 3600000),
            };

            prisma.passwordResetToken.findUnique.mockResolvedValue(mockToken as any);

            await expect(service.resetPassword('used-token', 'newpassword123')).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw error for expired token', async () => {
            const mockToken = {
                id: 'token-1',
                token: 'expired-token',
                used: false,
                expiresAt: new Date(Date.now() - 3600000),
            };

            prisma.passwordResetToken.findUnique.mockResolvedValue(mockToken as any);

            await expect(service.resetPassword('expired-token', 'newpassword123')).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('verifyResetToken', () => {
        it('should return true for valid token', async () => {
            const mockToken = {
                token: 'valid-token',
                used: false,
                expiresAt: new Date(Date.now() + 3600000),
            };

            prisma.passwordResetToken.findUnique.mockResolvedValue(mockToken as any);

            const result = await service.verifyResetToken('valid-token');

            expect(result).toBe(true);
        });

        it('should return false for invalid token', async () => {
            prisma.passwordResetToken.findUnique.mockResolvedValue(null);

            const result = await service.verifyResetToken('invalid-token');

            expect(result).toBe(false);
        });

        it('should return false for used token', async () => {
            const mockToken = {
                token: 'used-token',
                used: true,
                expiresAt: new Date(Date.now() + 3600000),
            };

            prisma.passwordResetToken.findUnique.mockResolvedValue(mockToken as any);

            const result = await service.verifyResetToken('used-token');

            expect(result).toBe(false);
        });

        it('should return false for expired token', async () => {
            const mockToken = {
                token: 'expired-token',
                used: false,
                expiresAt: new Date(Date.now() - 3600000),
            };

            prisma.passwordResetToken.findUnique.mockResolvedValue(mockToken as any);

            const result = await service.verifyResetToken('expired-token');

            expect(result).toBe(false);
        });
    });
});
