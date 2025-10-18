import { IsEnum, IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionCategory, QuestionStatus } from '@prisma/client';

export enum SortType {
    RECENT = 'recent',
    POPULAR = 'popular',
    UNANSWERED = 'unanswered',
}

export class QuestionFiltersDto {
    @IsEnum(QuestionCategory)
    @IsOptional()
    category?: QuestionCategory;

    @IsString()
    @IsOptional()
    tags?: string; // Comma-separated tags

    @IsEnum(QuestionStatus)
    @IsOptional()
    status?: QuestionStatus;

    @IsEnum(SortType)
    @IsOptional()
    sort?: SortType;

    @IsString()
    @IsOptional()
    search?: string;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    @IsOptional()
    limit?: number = 20;
}
