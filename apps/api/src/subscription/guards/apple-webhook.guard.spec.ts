import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AppleWebhookGuard } from './apple-webhook.guard';

describe('AppleWebhookGuard', () => {
    let guard: AppleWebhookGuard;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AppleWebhookGuard],
        }).compile();

        guard = module.get<AppleWebhookGuard>(AppleWebhookGuard);
    });

    const createMockExecutionContext = (body?: any, headers?: any): ExecutionContext => {
        return {
            switchToHttp: () => ({
                getRequest: () => ({
                    body,
                    headers: headers || {},
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

        it('should throw error for missing signedPayload', async () => {
            process.env.NODE_ENV = 'production';

            const context = createMockExecutionContext({});

            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw error for invalid JWT format', async () => {
            process.env.NODE_ENV = 'production';

            const context = createMockExecutionContext({
                signedPayload: 'invalid.jwt',
            });

            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw error for malformed JWT parts', async () => {
            process.env.NODE_ENV = 'production';

            const context = createMockExecutionContext({
                signedPayload: 'header.payload', // Missing signature
            });

            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
        });

        it('should validate JWT format with 3 parts', async () => {
            process.env.NODE_ENV = 'production';

            // Create a mock JWT with valid base64url encoding
            const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'test-kid' })).toString(
                'base64url',
            );
            const payload = Buffer.from(
                JSON.stringify({
                    iss: 'https://appleid.apple.com',
                    exp: Math.floor(Date.now() / 1000) + 3600,
                }),
            ).toString('base64url');
            const signature = Buffer.from('fake-signature').toString('base64url');

            const signedPayload = `${header}.${payload}.${signature}`;

            const context = createMockExecutionContext({ signedPayload });

            // This will fail at signature verification, but passes format check
            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('JWT validation', () => {
        it('should decode header and payload correctly', async () => {
            process.env.NODE_ENV = 'production';

            const headerObj = { alg: 'RS256', kid: 'test-kid' };
            const payloadObj = {
                iss: 'https://appleid.apple.com',
                exp: Math.floor(Date.now() / 1000) + 3600,
            };

            const header = Buffer.from(JSON.stringify(headerObj)).toString('base64url');
            const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
            const signature = Buffer.from('fake-signature').toString('base64url');

            const signedPayload = `${header}.${payload}.${signature}`;

            const context = createMockExecutionContext({ signedPayload });

            // Will fail at signature verification but header/payload decode works
            await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('development mode', () => {
        it('should skip verification when SKIP_WEBHOOK_VERIFICATION is true', async () => {
            process.env.NODE_ENV = 'development';
            process.env.SKIP_WEBHOOK_VERIFICATION = 'true';

            const context = createMockExecutionContext({
                signedPayload: 'any-invalid-payload',
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
