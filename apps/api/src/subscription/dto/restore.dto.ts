import { IsArray, IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentProvider } from '@prisma/client';

export class RestoreDto {
    @IsArray()
    @IsNotEmpty()
    receipts: string[];

    @IsEnum(PaymentProvider)
    @IsNotEmpty()
    provider: PaymentProvider;
}
