import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class UpdateAnswerDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3, { message: 'Cevap içeriği en az 3 karakter olmalıdır' })
    @MaxLength(5000, { message: 'Cevap içeriği en fazla 5000 karakter olabilir' })
    content: string;
}
