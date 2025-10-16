import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { ReceiptValidatorService } from './receipt-validator.service';

describe('ReceiptValidatorService', () => {
    let service: ReceiptValidatorService;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReceiptValidatorService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            if (key === 'APPLE_SHARED_SECRET') return 'test-secret';
                            if (key === 'GOOGLE_SERVICE_ACCOUNT_KEY') return JSON.stringify({
                                client_email: 'test@test.com',
                                private_key: 'test-key',
                            });
                            return null;
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<ReceiptValidatorService>(ReceiptValidatorService);
        configService = module.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateAppleReceipt', () => {
        it('should throw error if shared secret is not configured', async () => {
            jest.spyOn(configService, 'get').mockReturnValue(null);

            await expect(service.validateAppleReceipt('test-receipt')).rejects.toThrow(
                BadRequestException,
            );
        });
    });

    describe('validateGoogleReceipt', () => {
        it('should throw error if service account key is not configured', async () => {
            jest.spyOn(configService, 'get').mockReturnValue(null);

            await expect(
                service.validateGoogleReceipt('com.test.app', 'product-id', 'token'),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('isReceiptActive', () => {
        it('should return false if receipt is not active', () => {
            const receipt = {
                transactionId: 'test',
                originalTransactionId: 'test',
                productId: 'test',
                purchaseDate: new Date(),
                expiresDate: new Date(),
                isTrialPeriod: false,
                isActive: false,
                environment: 'Production' as const,
            };

            expect(service.isReceiptActive(receipt)).toBe(false);
        });

        it('should return false if expiration date is in the past', () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);

            const receipt = {
                transactionId: 'test',
                originalTransactionId: 'test',
                productId: 'test',
                purchaseDate: new Date(),
                expiresDate: pastDate,
                isTrialPeriod: false,
                isActive: true,
                environment: 'Production' as const,
            };

            expect(service.isReceiptActive(receipt)).toBe(false);
        });

        it('should return true if receipt is active and not expired', () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);

            const receipt = {
                transactionId: 'test',
                originalTransactionId: 'test',
                productId: 'test',
                purchaseDate: new Date(),
                expiresDate: futureDate,
                isTrialPeriod: false,
                isActive: true,
                environment: 'Production' as const,
            };

            expect(service.isReceiptActive(receipt)).toBe(true);
        });
    });
});
