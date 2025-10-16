export class ProductDto {
    productId: string;
    tier: 'MONTHLY' | 'YEARLY';
    price: number;
    currency: string;
    description: string;
    features: string[];
    trialDays?: number;
}
