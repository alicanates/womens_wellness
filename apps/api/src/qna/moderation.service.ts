import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContentType, ReportStatus } from '@prisma/client';

// DTOs
export interface CreateReportDto {
    contentId: string;
    contentType: ContentType;
    reason: string;
    description?: string;
}

export interface ReportFilters {
    status?: ReportStatus;
    contentType?: ContentType;
    page?: number;
    limit?: number;
}

export enum ModerationAction {
    HIDE = 'HIDE',
    DELETE = 'DELETE',
    DISMISS = 'DISMISS',
}

// Spam keywords (basit keyword-based detection)
const SPAM_KEYWORDS = [
    'viagra',
    'cialis',
    'casino',
    'lottery',
    'winner',
    'click here',
    'buy now',
    'limited offer',
    'act now',
    'free money',
    'make money fast',
    'work from home',
    'weight loss',
    'miracle cure',
];

@Injectable()
export class ModerationService {
    constructor(private prisma: PrismaService) { }

    /**
     * İçerik raporlama
     */
    async reportContent(
        reporterId: string,
        dto: CreateReportDto,
    ): Promise<any> {
        // İçeriğin var olduğunu kontrol et
        await this.validateContentExists(dto.contentId, dto.contentType);

        // Kullanıcı daha önce bu içeriği raporlamış mı?
        const existingReport = await this.prisma.contentReport.findFirst({
            where: {
                contentId: dto.contentId,
                contentType: dto.contentType,
                reporterId,
            },
        });

        if (existingReport) {
            throw new BadRequestException('Bu içeriği zaten raporladınız');
        }

        // Rapor oluştur
        const report = await this.prisma.contentReport.create({
            data: {
                contentId: dto.contentId,
                contentType: dto.contentType,
                reporterId,
                reason: dto.reason,
                description: dto.description,
            },
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true,
                        profile: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });

        // Otomatik gizleme kontrolü (3+ rapor)
        await this.checkAutoHide(dto.contentId, dto.contentType);

        return report;
    }

    /**
     * Raporları listele (admin)
     */
    async getReports(filters: ReportFilters): Promise<any> {
        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.contentType) {
            where.contentType = filters.contentType;
        }

        const [reports, total] = await Promise.all([
            this.prisma.contentReport.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    reporter: {
                        select: {
                            id: true,
                            username: true,
                            profile: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                    reviewer: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },
                },
            }),
            this.prisma.contentReport.count({ where }),
        ]);

        return {
            reports,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Raporu incele ve aksiyon al (admin)
     */
    async reviewReport(
        reportId: string,
        action: ModerationAction,
        moderatorId: string,
        moderatorNote?: string,
    ): Promise<any> {
        const report = await this.prisma.contentReport.findUnique({
            where: { id: reportId },
        });

        if (!report) {
            throw new NotFoundException('Rapor bulunamadı');
        }

        // Aksiyonu uygula
        switch (action) {
            case ModerationAction.HIDE:
                await this.hideContent(report.contentId, report.contentType);
                break;
            case ModerationAction.DELETE:
                await this.deleteContent(report.contentId, report.contentType);
                break;
            case ModerationAction.DISMISS:
                // Sadece raporu dismiss et
                break;
        }

        // Raporu güncelle
        const updatedReport = await this.prisma.contentReport.update({
            where: { id: reportId },
            data: {
                status: action === ModerationAction.DISMISS ? ReportStatus.DISMISSED : ReportStatus.RESOLVED,
                reviewedBy: moderatorId,
                reviewedAt: new Date(),
                moderatorNote: moderatorNote || null,
            },
            include: {
                reporter: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                reviewer: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        return updatedReport;
    }

    /**
     * İçeriği gizle (soft delete)
     */
    async hideContent(contentId: string, contentType: ContentType): Promise<void> {
        switch (contentType) {
            case ContentType.QUESTION:
                await this.prisma.question.update({
                    where: { id: contentId },
                    data: { status: 'CLOSED' as any },
                });
                break;
            case ContentType.ANSWER:
                // Answer için soft delete yok, siliyoruz
                await this.deleteContent(contentId, contentType);
                break;
            case ContentType.COMMENT:
                // Comment için soft delete yok, siliyoruz
                await this.deleteContent(contentId, contentType);
                break;
        }
    }

    /**
     * İçeriği sil (hard delete)
     */
    async deleteContent(contentId: string, contentType: ContentType): Promise<void> {
        try {
            switch (contentType) {
                case ContentType.QUESTION:
                    await this.prisma.question.delete({
                        where: { id: contentId },
                    });
                    break;
                case ContentType.ANSWER:
                    await this.prisma.answer.delete({
                        where: { id: contentId },
                    });
                    break;
                case ContentType.COMMENT:
                    // Comment için hem QuestionComment hem AnswerComment olabilir
                    const questionComment = await this.prisma.questionComment.findUnique({
                        where: { id: contentId },
                    });
                    if (questionComment) {
                        await this.prisma.questionComment.delete({
                            where: { id: contentId },
                        });
                    } else {
                        await this.prisma.answerComment.delete({
                            where: { id: contentId },
                        });
                    }
                    break;
            }
        } catch (error) {
            // İçerik zaten silinmiş olabilir
            console.error('Error deleting content:', error);
        }
    }

    /**
     * Spam kontrolü (basit keyword-based)
     */
    checkSpam(content: string): boolean {
        const lowerContent = content.toLowerCase();
        return SPAM_KEYWORDS.some(keyword => lowerContent.includes(keyword));
    }

    /**
     * İçeriğin var olduğunu kontrol et
     */
    private async validateContentExists(
        contentId: string,
        contentType: ContentType,
    ): Promise<void> {
        let exists = false;

        switch (contentType) {
            case ContentType.QUESTION:
                exists = !!(await this.prisma.question.findUnique({
                    where: { id: contentId },
                }));
                break;
            case ContentType.ANSWER:
                exists = !!(await this.prisma.answer.findUnique({
                    where: { id: contentId },
                }));
                break;
            case ContentType.COMMENT:
                const questionComment = await this.prisma.questionComment.findUnique({
                    where: { id: contentId },
                });
                const answerComment = await this.prisma.answerComment.findUnique({
                    where: { id: contentId },
                });
                exists = !!(questionComment || answerComment);
                break;
        }

        if (!exists) {
            throw new NotFoundException('İçerik bulunamadı');
        }
    }

    /**
     * Otomatik gizleme kontrolü (3+ rapor)
     */
    private async checkAutoHide(
        contentId: string,
        contentType: ContentType,
    ): Promise<void> {
        const reportCount = await this.prisma.contentReport.count({
            where: {
                contentId,
                contentType,
                status: ReportStatus.PENDING,
            },
        });

        // 3 veya daha fazla rapor varsa otomatik gizle
        if (reportCount >= 3) {
            await this.hideContent(contentId, contentType);

            // Tüm raporları REVIEWED olarak işaretle
            await this.prisma.contentReport.updateMany({
                where: {
                    contentId,
                    contentType,
                    status: ReportStatus.PENDING,
                },
                data: {
                    status: ReportStatus.REVIEWED,
                    reviewedAt: new Date(),
                },
            });
        }
    }

    /**
     * Kullanıcının raporlarını getir
     */
    async getUserReports(userId: string): Promise<any> {
        return this.prisma.contentReport.findMany({
            where: {
                reporterId: userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });
    }

    /**
     * İçeriğin rapor sayısını getir
     */
    async getContentReportCount(
        contentId: string,
        contentType: ContentType,
    ): Promise<number> {
        return this.prisma.contentReport.count({
            where: {
                contentId,
                contentType,
            },
        });
    }

    /**
     * Rapor detayını getir (admin)
     */
    async getReportById(reportId: string): Promise<any> {
        const report = await this.prisma.contentReport.findUnique({
            where: { id: reportId },
            include: {
                reporter: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        profile: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                reviewer: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                    },
                },
            },
        });

        if (!report) {
            throw new NotFoundException('Rapor bulunamadı');
        }

        return report;
    }

    /**
     * Rapor durumunu güncelle (admin)
     */
    async updateReportStatus(reportId: string, status: string): Promise<any> {
        const report = await this.prisma.contentReport.findUnique({
            where: { id: reportId },
        });

        if (!report) {
            throw new NotFoundException('Rapor bulunamadı');
        }

        // Validate status
        const validStatuses = ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'];
        if (!validStatuses.includes(status)) {
            throw new BadRequestException('Geçersiz durum');
        }

        const updatedReport = await this.prisma.contentReport.update({
            where: { id: reportId },
            data: {
                status: status as ReportStatus,
            },
            include: {
                reporter: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                    },
                },
                reviewer: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                    },
                },
            },
        });

        return updatedReport;
    }
}
