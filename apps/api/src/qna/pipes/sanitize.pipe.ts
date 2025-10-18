import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import {
    sanitizeHtml,
    sanitizeContent,
    sanitizeQuestionTitle,
    sanitizeComment,
    sanitizeTags,
} from '../utils/sanitize.util';

/**
 * Pipe to sanitize input data and prevent XSS attacks
 */
@Injectable()
export class SanitizePipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value || typeof value !== 'object') {
            return value;
        }

        try {
            // Sanitize based on DTO type
            if (metadata.metatype?.name === 'CreateQuestionDto') {
                return this.sanitizeQuestionDto(value);
            } else if (metadata.metatype?.name === 'UpdateQuestionDto') {
                return this.sanitizeQuestionDto(value);
            } else if (metadata.metatype?.name === 'CreateAnswerDto') {
                return this.sanitizeAnswerDto(value);
            } else if (metadata.metatype?.name === 'UpdateAnswerDto') {
                return this.sanitizeAnswerDto(value);
            } else if (metadata.metatype?.name === 'CreateCommentDto') {
                return this.sanitizeCommentDto(value);
            }

            return value;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    private sanitizeQuestionDto(dto: any) {
        const sanitized: any = { ...dto };

        if (dto.title) {
            sanitized.title = sanitizeQuestionTitle(dto.title);
        }

        if (dto.content) {
            sanitized.content = sanitizeContent(dto.content);
        }

        if (dto.tags) {
            sanitized.tags = sanitizeTags(dto.tags);
        }

        return sanitized;
    }

    private sanitizeAnswerDto(dto: any) {
        const sanitized: any = { ...dto };

        if (dto.content) {
            sanitized.content = sanitizeContent(dto.content);
        }

        return sanitized;
    }

    private sanitizeCommentDto(dto: any) {
        const sanitized: any = { ...dto };

        if (dto.content) {
            sanitized.content = sanitizeComment(dto.content);
        }

        return sanitized;
    }
}
