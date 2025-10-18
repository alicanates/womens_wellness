import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(1, { message: 'Yorum boş olamaz' })
    @MaxLength(300, { message: 'Yorum en fazla 300 karakter olabilir' })
    content: string;
}
