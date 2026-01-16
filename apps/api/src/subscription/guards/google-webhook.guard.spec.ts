import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GoogleWebhookGuard } from './google-webhook.guard';

describe('GoogleWebhookGuard', () => {
    let guard: GoogleWebhookGuard;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GoogleWebhookGuard],
        }).compile();

        guard = module.get<GoogleWebhookGuard>(GoogleWebhookGuard);
    });

    const createMockExecutionContext = (
        body?: any,
        headers?: any,
        query?: any,
    ): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({
                    body,
                    headers: headers || {},
                    query: query || {},
                }),
            }),
        } as any;
    };

    describe('canActivate', () => {
        it('should allow requests in development mode with skip flag', async () => {
            process.env.NODE_ENV = 'development';
            process.env.SKIP_WEBHOOK_VERIFICATION = 'true';

            const context = createMockExecutionContext({});

            const result = await guard.canActivate(context);

            expect(result).toBe(true);

            delete process.env.SKIP_WEBHOOK_VERIFICATION;
        });

        it('should throw error for missing message', async () => {
            process.env.NODE_ENV = 'production';

            const context = createMockExecutionContext({});

            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
        });

        it('should verify with push token in query', async () => {
            process.env.NODE_ENV = 'production';
            process.env.GOOGLE_PUBSUB_PUSH_TOKEN = 'test-token-123';

            const messageData = Buffer.from(JSON.stringify({ test: 'data' })).toString('base64');

            const context = createMockExecutionContext(
                {
                    message: {
                        data: messageData,
                    },
                },
                {},
                { token: 'test-token-123' },
            );

            const result = await guard.canActivate(context);

            expect(result).toBe(true);

            delete process.env.GOOGLE_PUBSUB_PUSH_TOKEN;
        });

        it('should throw error for invalid push token', async () => {
            process.env.NODE_ENV = 'production';
            process.env.GOOGLE_PUBSUB_PUSH_TOKEN = 'correct-token';

            const context = createMockExecutionContext(
                {
                    message: {
                        data: 'test',
                    },
                },
                {},
                { token: 'wrong-token' },
            );

            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);

            delete process.env.GOOGLE_PUBSUB_PUSH_TOKEN;
        });

        it('should throw error for missing authorization header and token', async () => {
            process.env.NODE_ENV = 'production';

            const context = createMockExecutionContext({
                message: {
                    data: 'test',
                },
            });

            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
        });

        it('should decode base64 message data', async () => {
            process.env.NODE_ENV = 'production';
            process.env.GOOGLE_PUBSUB_PUSH_TOKEN = 'test-token';

            const testData = { subscriptionNotification: { version: '1.0' } };
            const messageData = Buffer.from(JSON.stringify(testData)).toString('base64');

            const mockRequest = {
                body: {
                    message: {
                        data: messageData,
                    },
                },
                headers: {},
                query: { token: 'test-token' },
            };

            const context = {
                switchToHttp: () => ({
                    getRequest: () => mockRequest,
                }),
            } as any;

            await guard.canActivate(context);

            expect(mockRequest).toHaveProperty('googleWebhookData');
            expect(mockRequest['googleWebhookData']).toEqual(testData);

            delete process.env.GOOGLE_PUBSUB_PUSH_TOKEN;
        });
    });

    describe('JWT validation', () => {
        it('should throw error for invalid JWT format in authorization header', async () => {
            process.env.NODE_ENV = 'production';

            const context = createMockExecutionContext(
                {
                    message: {
                        data: 'test',
                    },
                },
                {
                    authorization: 'Bearer invalid.jwt',
                },
            );

            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
        });

        it('should validate JWT with 3 parts', async () => {
            process.env.NODE_ENV = 'production';

            const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'test-kid' })).toString(
                'base64url',
            );
            const payload = Buffer.from(
                JSON.stringify({
                    iss: 'accounts.google.com',
                    exp: Math.floor(Date.now() / 1000) + 3600,
                    iat: Math.floor(Date.now() / 1000),
                }),
            ).toString('base64url');
            const signature = Buffer.from('fake-signature').toString('base64url');

            const jwt = `${header}.${payload}.${signature}`;

            const context = createMockExecutionContext(
                {
                    message: {
                        data: 'test',
                    },
                },
                {
                    authorization: `Bearer ${jwt}`,
                },
            );

            // Will fail at signature verification but format is valid
            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('development mode', () => {
        it('should skip verification when SKIP_WEBHOOK_VERIFICATION is true', async () => {
            process.env.NODE_ENV = 'development';
            process.env.SKIP_WEBHOOK_VERIFICATION = 'true';

            const context = createMockExecutionContext({
                message: {
                    data: 'any-data',
                },
            });

            const result = await guard.canActivate(context);

            expect(result).toBe(true);

            delete process.env.SKIP_WEBHOOK_VERIFICATION;
        });

        it('should verify in development mode when skip flag is false', async () => {
            process.env.NODE_ENV = 'development';
            process.env.SKIP_WEBHOOK_VERIFICATION = 'false';

            const context = createMockExecutionContext({});

            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
        });
    });
});
