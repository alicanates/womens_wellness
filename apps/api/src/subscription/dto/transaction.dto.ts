import { TransactionStatus, TransactionType, PaymentProvider } from '@prisma/client';

export class TransactionDto {
    id: string;
    transactionId: string;
    originalTransactionId?: string | null;
    productId: string;
    amount: number;
    currency: string;
    status: TransactionStatus;
    type: TransactionType;
    provider: PaymentProvider;
    validatedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
