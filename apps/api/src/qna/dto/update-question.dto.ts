import { IsString, IsEnum, IsArray, IsOptional, MaxLength, MinLength, ArrayMaxSize } from 'class-validator';
import { QuestionCategory } from '@prisma/client';

export class UpdateQuestionDto {
    @IsString()
    @IsOptional()
    @MinLength(10, { message: 'Soru başlığı en az 10 karakter olmalıdır' })
    @MaxLength(200, { message: 'Soru başlığı en fazla 200 karakter olabilir' })
    title?: string;

    @IsString()
    @IsOptional()
    @MinLength(20, { message: 'Soru içeriği en az 20 karakter olmalıdır' })
    @MaxLength(5000, { message: 'Soru içeriği en fazla 5000 karakter olabilir' })
    content?: string;

    @IsEnum(QuestionCategory, { message: 'Geçersiz kategori' })
    @IsOptional()
    category?: QuestionCategory;

    @IsArray()
    @IsString({ each: true })
    @ArrayMaxSize(5, { message: 'En fazla 5 etiket ekleyebilirsiniz' })
    @IsOptional()
    tags?: string[];
}
