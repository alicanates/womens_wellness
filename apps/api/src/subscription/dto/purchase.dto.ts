import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentProvider } from '@prisma/client';

export class PurchaseDto {
    @IsString()
    @IsNotEmpty()
    receipt: string;

    @IsEnum(PaymentProvider)
    @IsNotEmpty()
    provider: PaymentProvider;

    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsString()
    @IsNotEmpty()
    transactionId: string;
}
