import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
    let service: AuthService;
    let prisma: PrismaService;
    let jwtService: JwtService;

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
                            update: jest.fn(),
                        },
                        profile: {
                            create: jest.fn(),
                        },
                        subscription: {
                            create: jest.fn(),
                        },
                        usageQuota: {
                            create: jest.fn(),
                        },
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
                        get: jest.fn((key: string) => {
                            if (key === 'JWT_SECRET') return 'test-secret';
                            if (key === 'JWT_REFRESH_SECRET') return 'test-refresh-secret';
                            return null;
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prisma = module.get<PrismaService>(PrismaService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('should return user if credentials are valid', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'test@example.com',
                passwordHash: 'hashedPassword',
                status: 'ACTIVE',
            };

            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
            jest.spyOn(service as any, 'comparePasswords').mockResolvedValue(true);

            const result = await service.validateUser('test@example.com', 'password123');

            expect(result).toBeDefined();
            expect(result?.id).toBe('user-1');
        });

        it('should return null if user not found', async () => {
            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

            const result = await service.validateUser('nonexistent@example.com', 'password123');

            expect(result).toBeNull();
        });

        it('should return null if password is invalid', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'test@example.com',
                passwordHash: 'hashedPassword',
                status: 'ACTIVE',
            };

            jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
            jest.spyOn(service as any, 'comparePasswords').mockResolvedValue(false);

            const result = await service.validateUser('test@example.com', 'wrongpassword');

            expect(result).toBeNull();
        });
    });

    describe('login', () => {
        it('should return tokens for valid credentials', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'test@example.com',
                username: 'testuser',
                status: 'ACTIVE',
                profile: {
                    firstName: 'Test',
                    lastName: 'User',
                },
            };

            jest.spyOn(service, 'validateUser').mockResolvedValue(mockUser as any);
            jest.spyOn(jwtService, 'sign')
                .mockReturnValueOnce('accessToken')
                .mockReturnValueOnce('refreshToken');

            const result = await service.login('test@example.com', 'password123');

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result.user.email).toBe('test@example.com');
        });

        it('should throw UnauthorizedException for invalid credentials', async () => {
            jest.spyOn(service, 'validateUser').mockResolvedValue(null);

            await expect(service.login('test@example.com', 'wrongpassword'))
                .rejects.toThrow(UnauthorizedException);
        });
    });
});
