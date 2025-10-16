import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PremiumGuard } from './premium.guard';
import { SubscriptionService } from '../subscription.service';
import { SubscriptionStatus } from '@prisma/client';

describe('PremiumGuard', () => {
    let guard: PremiumGuard;
    let subscriptionService: jest.Mocked<SubscriptionService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PremiumGuard,
                {
                    provide: SubscriptionService,
                    useValue: {
                        getSubscription: jest.fn(),
                    },
                },
                {
                    provide: Reflector,
                    useValue: {},
                },
            ],
        }).compile();

        guard = module.get<PremiumGuard>(PremiumGuard);
        subscriptionService = module.get(SubscriptionService);
    });

    const createMockExecutionContext = (user?: any): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({ user }),
            }),
        } as any;
    };

    describe('canActivate', () => {
        it('should throw UnauthorizedException when user is not authenticated', async () => {
            const context = createMockExecutionContext();

            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
        });

        it('should allow access for active premium users', async () => {
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
            expect(subscriptionService.getSubscription).toHaveBeenCalledWith('user-1');
        });

        it('should allow access for trial users', async () => {
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

        it('should allow access for grace period users', async () => {
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

        it('should deny access for free users', async () => {
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
                    code: 'PREMIUM_REQUIRED',
                }),
            });
        });

        it('should deny access for expired users', async () => {
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

        it('should deny access for cancelled users', async () => {
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
            const mockRequest = { user: { id: 'user-1' } };
            const context = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
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

        it('should include subscription info in error response', async () => {
            const context = createMockExecutionContext({ id: 'user-1' });

            subscriptionService.getSubscription.mockResolvedValue({
                id: 'sub-1',
                userId: 'user-1',
                status: SubscriptionStatus.FREE,
                tier: null,
            } as any);

            try {
                await guard.canActivate(context);
                fail('Should have thrown ForbiddenException');
            } catch (error) {
                expect(error).toBeInstanceOf(ForbiddenException);
                expect(error.response).toMatchObject({
                    code: 'PREMIUM_REQUIRED',
                    subscription: {
                        status: SubscriptionStatus.FREE,
                        tier: null,
                    },
                });
            }
        });
    });
});
