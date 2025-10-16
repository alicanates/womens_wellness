import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FeatureGuard } from '../guards/feature.guard';
import { RequireFeature } from '../decorators/feature.decorator';

/**
 * Example controller showing how to use feature gates
 * This is a reference implementation - not meant to be used in production
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 17.1, 17.2, 17.3, 17.4, 17.5
 */
@Controller('insights')
@UseGuards(AuthGuard('jwt'))
export class InsightsControllerExample {
    /**
     * Example: Premium feature endpoint
     * Only users with 'insights' feature can access this
     */
    @Get()
    @UseGuards(FeatureGuard)
    @RequireFeature('insights')
    async getInsights(@Request() req: any) {
        const userId = req.user.id;
        const subscription = req.subscription; // Attached by FeatureGuard

        return {
            message: 'Kişisel içgörüleriniz',
            userId,
            subscription: {
                status: subscription.status,
                tier: subscription.tier,
            },
            insights: [
                {
                    type: 'health',
                    title: 'Sağlık Trendi',
                    description: 'Son 30 günde sağlık skorunuz %15 arttı',
                    score: 85,
                },
                {
                    type: 'cycle',
                    title: 'Döngü Düzeni',
                    description: 'Döngünüz son 3 ayda düzenli seyrediyor',
                    regularity: 95,
                },
                {
                    type: 'wellness',
                    title: 'Wellness Skoru',
                    description: 'Meditasyon ve uyku kaliteniz mükemmel',
                    score: 92,
                },
            ],
        };
    }

    /**
     * Example: Advanced analytics endpoint
     * Requires 'advanced_analytics' feature
     */
    @Get('analytics')
    @UseGuards(FeatureGuard)
    @RequireFeature('advanced_analytics')
    async getAdvancedAnalytics(@Request() req: any) {
        const userId = req.user.id;

        return {
            message: 'Gelişmiş analizler',
            userId,
            analytics: {
                trends: {
                    mood: [7, 8, 7, 9, 8, 9, 9],
                    energy: [6, 7, 8, 8, 9, 8, 9],
                    sleep: [7, 7, 8, 8, 9, 9, 9],
                },
                predictions: {
                    nextCycle: '2025-11-15',
                    ovulation: '2025-11-01',
                    fertileWindow: ['2025-10-30', '2025-11-04'],
                },
                correlations: [
                    {
                        factor1: 'sleep',
                        factor2: 'mood',
                        correlation: 0.85,
                        insight: 'İyi uyku ruh halinizi olumlu etkiliyor',
                    },
                    {
                        factor1: 'exercise',
                        factor2: 'energy',
                        correlation: 0.78,
                        insight: 'Egzersiz enerji seviyenizi artırıyor',
                    },
                ],
            },
        };
    }

    /**
     * Example: Customization endpoint
     * Requires 'customization' feature
     */
    @Get('customize')
    @UseGuards(FeatureGuard)
    @RequireFeature('customization')
    async getCustomizationOptions(@Request() req: any) {
        const userId = req.user.id;

        return {
            message: 'Özelleştirme seçenekleri',
            userId,
            options: {
                themes: ['light', 'dark', 'auto', 'custom'],
                colors: ['purple', 'blue', 'pink', 'green', 'orange'],
                layouts: ['compact', 'comfortable', 'spacious'],
                widgets: [
                    { id: 'mood_tracker', enabled: true },
                    { id: 'water_reminder', enabled: true },
                    { id: 'cycle_calendar', enabled: true },
                    { id: 'ai_insights', enabled: true },
                    { id: 'wellness_score', enabled: true },
                ],
            },
        };
    }
}
