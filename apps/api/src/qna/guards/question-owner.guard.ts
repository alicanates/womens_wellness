import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Guard to check if user is the owner of a question
 * Used for marking best answers (only question owner can do this)
 */
@Injectable()
export class QuestionOwnerGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;
        const questionId = request.params.questionId;

        if (!userId) {
            throw new ForbiddenException('Kimlik doğrulaması gerekli');
        }

        if (!questionId) {
            throw new ForbiddenException('Soru ID bulunamadı');
        }

        const question = await this.prisma.question.findUnique({
            where: { id: questionId },
            select: { userId: true },
        });

        if (!question) {
            throw new NotFoundException('Soru bulunamadı');
        }

        if (question.userId !== userId) {
            throw new ForbiddenException('Sadece soru sahibi en iyi cevabı seçebilir');
        }

        return true;
    }
}
