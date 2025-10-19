import { Module, forwardRef } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { GamificationController, PublicGamificationController } from './gamification.controller';
import { AchievementService } from './achievement.service';
import { InsightService } from './insight.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [GamificationController, PublicGamificationController],
    providers: [GamificationService, AchievementService, InsightService],
    exports: [GamificationService, AchievementService, InsightService],
})
export class GamificationModule { }
