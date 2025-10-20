import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MetricsModule } from './metrics/metrics.module';
import { WaterModule } from './water/water.module';
import { ChatModule } from './chat/chat.module';
import { MemoryModule } from './memory/memory.module';
import { QuotaModule } from './quota/quota.module';
import { CyclesModule } from './cycles/cycles.module';
import { PregnancyModule } from './pregnancy/pregnancy.module';
import { RemindersModule } from './reminders/reminders.module';
import { ModelPolicyModule } from './model-policy/model-policy.module';
import { FeatureFlagModule } from './feature-flag/feature-flag.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { HomeModule } from './home/home.module';
import { WellnessModule } from './wellness/wellness.module';
import { DiscoverModule } from './discover/discover.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { QnaModule } from './qna/qna.module';
import { PagesModule } from './pages/pages.module';
import { GamificationModule } from './gamification/gamification.module';
import { AstrologyModule } from './astrology/astrology.module';
import { AIProviderModule } from './ai-provider/ai-provider.module';
import aiConfig from './config/ai.config';

@Module({
  imports: [
    // Environment configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [aiConfig],
    }),
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 60,
      },
    ]),
    // BullMQ for job queues
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    // Scheduled jobs
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    MetricsModule,
    WaterModule,
    ChatModule,
    MemoryModule,
    QuotaModule,
    CyclesModule,
    PregnancyModule,
    RemindersModule,
    ModelPolicyModule,
    FeatureFlagModule,
    AuditLogModule,
    HomeModule,
    WellnessModule,
    DiscoverModule,
    SubscriptionModule,
    QnaModule,
    PagesModule,
    GamificationModule,
    AstrologyModule,
    AIProviderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
