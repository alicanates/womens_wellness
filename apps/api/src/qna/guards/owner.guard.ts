import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Guard to check if user is the owner of a resource
 * Supports: Question, Answer, QuestionComment, AnswerComment
 */
@Injectable()
export class OwnerGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;
        const resourceId = request.params.id || request.params.questionId || request.params.answerId;
        const resourceType = this.getResourceType(request);

        if (!userId) {
            throw new ForbiddenException('Kimlik doğrulaması gerekli');
        }

        if (!resourceId) {
            throw new ForbiddenException('Kaynak ID bulunamadı');
        }

        const isOwner = await this.checkOwnership(userId, resourceId, resourceType);

        if (!isOwner) {
            throw new ForbiddenException('Bu işlem için yetkiniz yok');
        }

        return true;
    }

    private getResourceType(request: any): string {
        const path = request.route?.path || request.url;

        if (path.includes('/questions/') && path.includes('/answers')) {
            return 'answer';
        } else if (path.includes('/questions/')) {
            return 'question';
        } else if (path.includes('/answers/')) {
            return 'answer';
        } else if (path.includes('/comments/question/')) {
            return 'questionComment';
        } else if (path.includes('/comments/answer/')) {
            return 'answerComment';
        }

        return 'unknown';
    }

    private async checkOwnership(
        userId: string,
        resourceId: string,
        resourceType: string,
    ): Promise<boolean> {
        try {
            switch (resourceType) {
                case 'question':
                    const question = await this.prisma.question.findUnique({
                        where: { id: resourceId },
                        select: { userId: true },
                    });
                    if (!question) throw new NotFoundException('Soru bulunamadı');
                    return question.userId === userId;

                case 'answer':
                    const answer = await this.prisma.answer.findUnique({
                        where: { id: resourceId },
                        select: { userId: true },
                    });
                    if (!answer) throw new NotFoundException('Cevap bulunamadı');
                    return answer.userId === userId;

                case 'questionComment':
                    const qComment = await this.prisma.questionComment.findUnique({
                        where: { id: resourceId },
                        select: { userId: true },
                    });
                    if (!qComment) throw new NotFoundException('Yorum bulunamadı');
                    return qComment.userId === userId;

                case 'answerComment':
                    const aComment = await this.prisma.answerComment.findUnique({
                        where: { id: resourceId },
                        select: { userId: true },
                    });
                    if (!aComment) throw new NotFoundException('Yorum bulunamadı');
                    return aComment.userId === userId;

                default:
                    return false;
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            return false;
        }
    }
}
