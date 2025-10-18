import { Module } from '@nestjs/common';
import { QnaService } from './qna.service';
import { VoteService } from './vote.service';
import { ReputationService } from './reputation.service';
import { ModerationService } from './moderation.service';
import { QnaNotificationService } from './qna-notification.service';
import { AnalyticsService } from './analytics.service';
import { SharingService } from './sharing.service';
import { QuestionsController } from './questions.controller';
import { AnswersController } from './answers.controller';
import { CommentsController } from './comments.controller';
import { InteractionsController } from './interactions.controller';
import { VoteController } from './vote.controller';
import { ReputationController } from './reputation.controller';
import { ModerationController } from './moderation.controller';
import { NotificationController } from './notification.controller';
import { AnalyticsController } from './analytics.controller';
import { SharingController } from './sharing.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RemindersModule } from '../reminders/reminders.module';
import { OwnerGuard, QuestionOwnerGuard, AdminGuard } from './guards';

@Module({
    imports: [PrismaModule, RemindersModule],
    controllers: [
        QuestionsController,
        AnswersController,
        CommentsController,
        InteractionsController,
        VoteController,
        ReputationController,
        ModerationController,
        NotificationController,
        AnalyticsController,
        SharingController,
    ],
    providers: [
        QnaService,
        VoteService,
        ReputationService,
        ModerationService,
        QnaNotificationService,
        AnalyticsService,
        SharingService,
        // Guards
        OwnerGuard,
        QuestionOwnerGuard,
        AdminGuard,
    ],
    exports: [
        QnaService,
        VoteService,
        ReputationService,
        ModerationService,
        QnaNotificationService,
        AnalyticsService,
        SharingService,
    ],
})
export class QnaModule { }
