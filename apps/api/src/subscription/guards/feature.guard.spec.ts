import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FeatureGuard } from './feature.guard';
import { SubscriptionService } from '../subscription.service';
import { SubscriptionStatus } from '@prisma/client';

describe('FeatureGuard', () => {
    let guard: FeatureGuard;
    let subscriptionService: jest.Mocked<SubscriptionService>;
    let reflector: jest.Mocked<Reflector>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FeatureGuard,
                {
                    provide: SubscriptionService,
                    useValue: {
                        getSubscription: jest.fn(),
                    },
                },
                {
                    provide: Reflector,
                    useValue: {
                        getAllAndOverride: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<FeatureGuard>(FeatureGuard);
        subscriptionService = module.get(SubscriptionService);
        reflector = module.get(Reflector);
    });

    const createMockExecutionContext = (user?: any): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({ user }),
            }),
            getHandler: jest.fn(),
            getClass: jest.fn(),
        } as any;
    };

    describe('canActivate', () => {
        it('should allow access when no feature is required', async () => {
            reflector.getAllAndOverride.mockReturnValue(undefined);
            const context = createMockExecutionContext({ id: 'user-1' });

            const result = await guard.canActivate(context);

            expect(result).toBe(true);
            expect(subscriptionService.getSubscription).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when user is not authenticated', async () => {
            reflector.getAllAndOverride.mockReturnValue('insights');
            const context = createMockExecutionContext();

            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
        });

        it('should allow access to free features for free users', async () => {
            reflector.getAllAndOverride.mockReturnValue('basic_chat');
            const context = createMockExecutionContext({ id: 'user-1' });

            subscriptionService.getSubscription.mockResolvedValue({
                id: 'sub-1',
                userId: 'user-1',
                status: SubscriptionStatus.FREE,
                tier: null,
                aiMessagesUsed: 10,
                aiMessagesLimit: 100,
            } as any);

            const result = await guard.canActivate(context);

            expect(result).toBe(true);
            expect(subscriptionService.getSubscription).toHaveBeenCalledWith('user-1');
        });

        it('should allow access to premium features for active premium users', async () => {
            reflector.getAllAndOverride.mockReturnValue('insights');
            const context = createMockExecutionContext({ id: 'user-1' });

            subscriptionService.getSubscription.mockResolvedValue({
                id: 'sub-1',
                userId: 'user-1',
                status: SubscriptionStatus.ACTIVE,
                tier: 'MONTHLY',
                aiMessagesUsed: 50,
                aiMessagesLimit: 1000,
            } as any);

            const result = await guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should allow access to premium features for trial users', async () => {
            reflector.getAllAndOverride.mockReturnValue('advanced_analytics');
            const context = createMockExecutionContext({ id: 'user-1' });

            subscriptionService.getSubscription.mockResolvedValue({
                id: 'sub-1',
                userId: 'user-1',
                status: SubscriptionStatus.TRIAL,
                tier: 'MONTHLY',
                aiMessagesUsed: 20,
                aiMessagesLimit: 1000,
            } as any);

            const result = await guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should allow access to premium features for grace period users', async () => {
            reflector.getAllAndOverride.mockReturnValue('customization');
            const context = createMockExecutionContext({ id: 'user-1' });

            subscriptionService.getSubscription.mockResolvedValue({
                id: 'sub-1',
                userId: 'user-1',
                status: SubscriptionStatus.GRACE_PERIOD,
                tier: 'YEARLY',
                aiMessagesUsed: 100,
                aiMessagesLimit: 1000,
                isInGracePeriod: true,
            } as any);

            const result = await guard.canActivate(context);

            expect(result).toBe(true);
        });

        it('should deny access to premium features for free users', async () => {
            reflector.getAllAndOverride.mockReturnValue('insights');
            const context = createMockExecutionContext({ id: 'user-1' });

            subscriptionService.getSubscription.mockResolvedValue({
                id: 'sub-1',
                userId: 'user-1',
                status: SubscriptionStatus.FREE,
                tier: null,
                aiMessagesUsed: 50,
                aiMessagesLimit: 100,
            } as any);

            await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
            await expect(guard.canActivate(context)).rejects.toMatchObject({
                response: expect.objectContaining({
                    code: 'FEATURE_LOCKED',
                    feature: 'insights',
                }),
            });
        });

        it('should deny access to premium features for expired users', async () => {
            reflector.getAllAndOverride.mockReturnValue('advanced_analytics');
            const context = createMockExecutionContext({ id: 'user-1' });

            subscriptionService.getSubscription.mockResolvedValue({
                id: 'sub-1',
                userId: 'user-1',
                status: SubscriptionStatus.EXPIRED,
                tier: 'MONTHLY',
                aiMessagesUsed: 50,
                aiMessagesLimit: 100,
            } as any);

            await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
        });

        it('should deny access to premium features for cancelled users', async () => {
            reflector.getAllAndOverride.mockReturnValue('customization');
            const context = createMockExecutionContext({ id: 'user-1' });

            subscriptionService.getSubscription.mockResolvedValue({
                id: 'sub-1',
                userId: 'user-1',
                status: SubscriptionStatus.CANCELLED,
                tier: 'YEARLY',
                aiMessagesUsed: 50,
                aiMessagesLimit: 100,
            } as any);

            await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
        });

        it('should attach subscription to request on successful access', async () => {
            reflector.getAllAndOverride.mockReturnValue('insights');
            const mockRequest = { user: { id: 'user-1' } };
            const context = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
                getHandler: jest.fn(),
                getClass: jest.fn(),
            } as any;

            const mockSubscription = {
                id: 'sub-1',
                userId: 'user-1',
                status: SubscriptionStatus.ACTIVE,
                tier: 'MONTHLY',
            };

            subscriptionService.getSubscription.mockResolvedValue(mockSubscription as any);

            await guard.canActivate(context);

            expect(mockRequest).toHaveProperty('subscription', mockSubscription);
        });
    });
});
