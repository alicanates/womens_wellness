export class QuotaDto {
    used: number;
    limit: number;
    remaining: number;
    resetDate: Date;
    percentage: number;
    hasQuota: boolean;
}
