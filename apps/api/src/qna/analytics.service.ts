import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuestionCategory } from '@prisma/client';

export interface QnaMetrics {
    totalQuestions: number;
    questionsToday: number;
    questionsThisWeek: number;
    averageAnswersPerQuestion: number;
    unansweredQuestions: number;
    totalAnswers: number;
    answersToday: number;
    averageTimeToFirstAnswer: number;
    bestAnswerRate: number;
    totalVotes: number;
    totalComments: number;
    totalFavorites: number;
    totalFollows: number;
    activeUsers: number;
}

export interface CategoryMetrics {
    category: QuestionCategory;
    count: number;
    percentage: number;
}

export interface TopContributor {
    userId: string;
    username: string;
    reputation: number;
    answersGiven: number;
    bestAnswers: number;
}

export interface EngagementMetrics {
    totalVotes: number;
    totalComments: number;
    totalFavorites: number;
    totalFollows: number;
    averageVotesPerAnswer: number;
    averageCommentsPerQuestion: number;
}

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getOverview(): Promise<QnaMetrics> {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Total questions
        const totalQuestions = await this.prisma.question.count();

        // Questions today
        const questionsToday = await this.prisma.question.count({
            where: {
                createdAt: {
                    gte: today,
                },
            },
        });

        // Questions this week
        const questionsThisWeek = await this.prisma.question.count({
            where: {
                createdAt: {
                    gte: weekAgo,
                },
            },
        });

        // Total answers
        const totalAnswers = await this.prisma.answer.count();

        // Answers today
        const answersToday = await this.prisma.answer.count({
            where: {
                createdAt: {
                    gte: today,
                },
            },
        });

        // Average answers per question
        const averageAnswersPerQuestion = totalQuestions > 0
            ? totalAnswers / totalQuestions
            : 0;

        // Unanswered questions
        const unansweredQuestions = await this.prisma.question.count({
            where: {
                answers: {
                    none: {},
                },
            },
        });

        // Average time to first answer (in minutes)
        const questionsWithAnswers = await this.prisma.question.findMany({
            where: {
                answers: {
                    some: {},
                },
            },
            include: {
                answers: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                    take: 1,
                },
            },
        });

        let totalTimeToFirstAnswer = 0;
        let questionsWithFirstAnswer = 0;

        for (const question of questionsWithAnswers) {
            if (question.answers.length > 0) {
                const timeDiff = question.answers[0].createdAt.getTime() - question.createdAt.getTime();
                totalTimeToFirstAnswer += timeDiff / (1000 * 60); // Convert to minutes
                questionsWithFirstAnswer++;
            }
        }

        const averageTimeToFirstAnswer = questionsWithFirstAnswer > 0
            ? totalTimeToFirstAnswer / questionsWithFirstAnswer
            : 0;

        // Best answer rate
        const questionsWithBestAnswer = await this.prisma.question.count({
            where: {
                answers: {
                    some: {
                        isBestAnswer: true,
                    },
                },
            },
        });

        const bestAnswerRate = totalQuestions > 0
            ? (questionsWithBestAnswer / totalQuestions) * 100
            : 0;

        // Total votes
        const totalVotes = await this.prisma.answerVote.count();

        // Total comments
        const totalQuestionComments = await this.prisma.questionComment.count();
        const totalAnswerComments = await this.prisma.answerComment.count();
        const totalComments = totalQuestionComments + totalAnswerComments;

        // Total favorites
        const totalFavorites = await this.prisma.questionFavorite.count();

        // Total follows
        const totalQuestionFollows = await this.prisma.questionFollower.count();
        const totalUserFollows = await this.prisma.userFollower.count();
        const totalFollows = totalQuestionFollows + totalUserFollows;

        // Active users (last 7 days)
        const activeUsers = await this.prisma.user.count({
            where: {
                OR: [
                    {
                        questions: {
                            some: {
                                createdAt: {
                                    gte: weekAgo,
                                },
                            },
                        },
                    },
                    {
                        answers: {
                            some: {
                                createdAt: {
                                    gte: weekAgo,
                                },
                            },
                        },
                    },
                ],
            },
        });

        return {
            totalQuestions,
            questionsToday,
            questionsThisWeek,
            averageAnswersPerQuestion: Math.round(averageAnswersPerQuestion * 100) / 100,
            unansweredQuestions,
            totalAnswers,
            answersToday,
            averageTimeToFirstAnswer: Math.round(averageTimeToFirstAnswer * 100) / 100,
            bestAnswerRate: Math.round(bestAnswerRate * 100) / 100,
            totalVotes,
            totalComments,
            totalFavorites,
            totalFollows,
            activeUsers,
        };
    }

    async getCategoryBreakdown(): Promise<CategoryMetrics[]> {
        const totalQuestions = await this.prisma.question.count();

        const categories = Object.values(QuestionCategory);
        const breakdown: CategoryMetrics[] = [];

        for (const category of categories) {
            const count = await this.prisma.question.count({
                where: {
                    category,
                },
            });

            const percentage = totalQuestions > 0
                ? (count / totalQuestions) * 100
                : 0;

            breakdown.push({
                category,
                count,
                percentage: Math.round(percentage * 100) / 100,
            });
        }

        return breakdown.sort((a, b) => b.count - a.count);
    }

    async getTopContributors(limit: number = 10): Promise<TopContributor[]> {
        const topUsers = await this.prisma.userReputation.findMany({
            orderBy: {
                totalPoints: 'desc',
            },
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        return topUsers.map(user => ({
            userId: user.user.id,
            username: user.user.username || 'Anonymous',
            reputation: user.totalPoints,
            answersGiven: user.answersGiven,
            bestAnswers: user.bestAnswers,
        }));
    }

    async getEngagementMetrics(): Promise<EngagementMetrics> {
        const totalVotes = await this.prisma.answerVote.count();
        const totalQuestionComments = await this.prisma.questionComment.count();
        const totalAnswerComments = await this.prisma.answerComment.count();
        const totalComments = totalQuestionComments + totalAnswerComments;
        const totalFavorites = await this.prisma.questionFavorite.count();
        const totalQuestionFollows = await this.prisma.questionFollower.count();
        const totalUserFollows = await this.prisma.userFollower.count();
        const totalFollows = totalQuestionFollows + totalUserFollows;

        const totalAnswers = await this.prisma.answer.count();
        const totalQuestions = await this.prisma.question.count();

        const averageVotesPerAnswer = totalAnswers > 0
            ? totalVotes / totalAnswers
            : 0;

        const averageCommentsPerQuestion = totalQuestions > 0
            ? totalQuestionComments / totalQuestions
            : 0;

        return {
            totalVotes,
            totalComments,
            totalFavorites,
            totalFollows,
            averageVotesPerAnswer: Math.round(averageVotesPerAnswer * 100) / 100,
            averageCommentsPerQuestion: Math.round(averageCommentsPerQuestion * 100) / 100,
        };
    }
}
