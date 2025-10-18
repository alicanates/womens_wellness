import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    forwardRef,
    Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VoteType } from '@prisma/client';
import { ReputationService } from './reputation.service';
import { QnaNotificationService } from './qna-notification.service';

@Injectable()
export class VoteService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(forwardRef(() => ReputationService))
        private readonly reputationService: ReputationService,
        @Inject(forwardRef(() => QnaNotificationService))
        private readonly notificationService: QnaNotificationService,
    ) { }

    /**
     * Cevaba oy ver (upvote/downvote)
     * Requirements: 5.1, 5.2, 5.3, 5.4
     */
    async voteAnswer(
        answerId: string,
        userId: string,
        voteType: VoteType,
    ): Promise<{ success: boolean; voteCount: number; userVote: VoteType }> {
        // Cevabın var olup olmadığını kontrol et
        const answer = await this.prisma.answer.findUnique({
            where: { id: answerId },
            select: { id: true, userId: true },
        });

        if (!answer) {
            throw new NotFoundException('Cevap bulunamadı');
        }

        // Kullanıcı kendi cevabına oy veremez (Requirement 5.5)
        if (answer.userId === userId) {
            throw new ForbiddenException('Kendi cevabınıza oy veremezsiniz');
        }

        // Mevcut oyunu kontrol et
        const existingVote = await this.prisma.answerVote.findUnique({
            where: {
                answerId_userId: {
                    answerId,
                    userId,
                },
            },
        });

        // Eğer aynı oy varsa, hiçbir şey yapma
        if (existingVote && existingVote.voteType === voteType) {
            const voteCount = await this.getAnswerVoteCount(answerId);
            return {
                success: true,
                voteCount,
                userVote: voteType,
            };
        }

        // Eğer farklı bir oy varsa, güncelle (Requirement 5.3)
        if (existingVote && existingVote.voteType !== voteType) {
            // Önceki oyun etkisini geri al
            const oldReputationReason = existingVote.voteType === VoteType.UPVOTE
                ? 'ANSWER_UPVOTED'
                : 'ANSWER_DOWNVOTED';
            const oldPoints = existingVote.voteType === VoteType.UPVOTE ? -5 : 2;
            await this.reputationService.addReputationPoints(
                answer.userId,
                oldReputationReason as any,
                { answerId, points: oldPoints },
            );

            await this.prisma.answerVote.update({
                where: {
                    answerId_userId: {
                        answerId,
                        userId,
                    },
                },
                data: {
                    voteType,
                },
            });

            // Yeni oyun etkisini ekle
            const newReputationReason = voteType === VoteType.UPVOTE
                ? 'ANSWER_UPVOTED'
                : 'ANSWER_DOWNVOTED';
            await this.reputationService.addReputationPoints(
                answer.userId,
                newReputationReason as any,
                { answerId },
            );
        } else {
            // Yeni oy oluştur
            await this.prisma.answerVote.create({
                data: {
                    answerId,
                    userId,
                    voteType,
                },
            });

            // Reputation puanı ekle
            const reputationReason = voteType === VoteType.UPVOTE
                ? 'ANSWER_UPVOTED'
                : 'ANSWER_DOWNVOTED';
            await this.reputationService.addReputationPoints(
                answer.userId,
                reputationReason as any,
                { answerId },
            );
        }

        // Vote count'u güncelle (Requirement 5.4)
        const voteCount = await this.updateAnswerVoteCount(answerId);

        // Send notification for upvotes (async, don't wait)
        if (voteType === VoteType.UPVOTE) {
            this.notificationService.notifyAnswerVoted(answerId, voteType, userId).catch(() => {
                // Silently fail - notification is not critical
            });
        }

        return {
            success: true,
            voteCount,
            userVote: voteType,
        };
    }

    /**
     * Oyunu geri çek
     * Requirements: 5.3
     */
    async removeVote(
        answerId: string,
        userId: string,
    ): Promise<{ success: boolean; voteCount: number }> {
        // Cevabın var olup olmadığını kontrol et
        const answer = await this.prisma.answer.findUnique({
            where: { id: answerId },
            select: { id: true, userId: true },
        });

        if (!answer) {
            throw new NotFoundException('Cevap bulunamadı');
        }

        // Mevcut oyunu kontrol et
        const existingVote = await this.prisma.answerVote.findUnique({
            where: {
                answerId_userId: {
                    answerId,
                    userId,
                },
            },
        });

        if (!existingVote) {
            throw new BadRequestException('Henüz oy vermemişsiniz');
        }

        // Reputation etkisini geri al
        const reputationReason = existingVote.voteType === VoteType.UPVOTE
            ? 'ANSWER_UPVOTED'
            : 'ANSWER_DOWNVOTED';
        const points = existingVote.voteType === VoteType.UPVOTE ? -5 : 2;
        await this.reputationService.addReputationPoints(
            answer.userId,
            reputationReason as any,
            { answerId, points },
        );

        // Oyunu sil
        await this.prisma.answerVote.delete({
            where: {
                answerId_userId: {
                    answerId,
                    userId,
                },
            },
        });

        // Vote count'u güncelle
        const voteCount = await this.updateAnswerVoteCount(answerId);

        return {
            success: true,
            voteCount,
        };
    }

    /**
     * Kullanıcının oyunu getir
     * Requirements: 5.2
     */
    async getUserVote(
        answerId: string,
        userId: string,
    ): Promise<VoteType | null> {
        const vote = await this.prisma.answerVote.findUnique({
            where: {
                answerId_userId: {
                    answerId,
                    userId,
                },
            },
            select: {
                voteType: true,
            },
        });

        return vote?.voteType || null;
    }

    /**
     * Cevabın toplam oy sayısını hesapla
     * Requirements: 5.4
     */
    async getAnswerVoteCount(answerId: string): Promise<number> {
        const votes = await this.prisma.answerVote.groupBy({
            by: ['voteType'],
            where: { answerId },
            _count: true,
        });

        let upvotes = 0;
        let downvotes = 0;

        votes.forEach((vote) => {
            if (vote.voteType === VoteType.UPVOTE) {
                upvotes = vote._count;
            } else if (vote.voteType === VoteType.DOWNVOTE) {
                downvotes = vote._count;
            }
        });

        return upvotes - downvotes;
    }

    /**
     * Cevabın vote count'unu güncelle
     * Requirements: 5.4
     */
    private async updateAnswerVoteCount(answerId: string): Promise<number> {
        const voteCount = await this.getAnswerVoteCount(answerId);

        await this.prisma.answer.update({
            where: { id: answerId },
            data: { voteCount },
        });

        return voteCount;
    }

    /**
     * En çok oy alan cevapları getir
     * Requirements: 5.4
     */
    async getTopAnswers(questionId: string, limit: number = 10) {
        return this.prisma.answer.findMany({
            where: { questionId },
            orderBy: [
                { isBestAnswer: 'desc' }, // En iyi cevap önce
                { voteCount: 'desc' }, // Sonra oy sayısına göre
                { createdAt: 'asc' }, // Aynı oy sayısında eskiler önce
            ],
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        profile: {
                            select: {
                                firstName: true,
                                lastName: true,
                                profilePictureUrl: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
        });
    }
}
