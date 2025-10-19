import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { AchievementService } from './achievement.service';
import { InsightService } from './insight.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';

@Controller('gamification')
@UseGuards(JwtAuthGuard)
export class GamificationController {
    constructor(
        private gamificationService: GamificationService,
        private achievementService: AchievementService,
        private insightService: InsightService,
    ) { }

    @Get('stats')
    async getStats(@Req() req: any) {
        return this.gamificationService.getUserStats(req.user.id);
    }

    @Get('achievements')
    async getAchievements(@Req() req: any) {
        return this.achievementService.getUserAchievements(req.user.id);
    }

    @Get('achievements/:id/progress')
    async getAchievementProgress(@Req() req: any, @Param('id') achievementId: string) {
        return this.achievementService.getAchievementProgress(req.user.id, achievementId);
    }

    @Post('check-achievements')
    async checkAchievements(@Req() req: any) {
        return this.achievementService.checkAchievements(req.user.id);
    }

    @Get('insights')
    async getInsights(@Req() req: any) {
        return this.insightService.getUserInsights(req.user.id);
    }

    @Post('insights/:id/read')
    async markInsightAsRead(@Req() req: any, @Param('id') insightId: string) {
        return this.insightService.markAsRead(insightId, req.user.id);
    }

    @Post('generate-insights')
    async generateInsights(@Req() req: any) {
        return this.insightService.generateInsights(req.user.id);
    }

    @Post('reset')
    async resetGamification(@Req() req: any) {
        return this.gamificationService.resetUserGamification(req.user.id);
    }

    // Admin endpoint to seed achievements (temporarily public for setup)
    @Post('seed-achievements')
    async seedAchievements() {
        // Check if achievements already exist
        const existing = await this.achievementService.seedAchievements();
        return { message: 'Achievements seeded successfully', count: existing.length };
    }
}

// Public endpoint for seeding (no auth required)
@Controller('public/gamification')
export class PublicGamificationController {
    constructor(private achievementService: AchievementService) { }

    @Post('seed-achievements')
    async seedAchievements() {
        const achievements = await this.achievementService.seedAchievements();
        return { message: 'Achievements seeded successfully', count: achievements.length };
    }
}
