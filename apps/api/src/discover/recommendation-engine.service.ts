import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CyclesService } from '../cycles/cycles.service';
import { PregnancyService } from '../pregnancy/pregnancy.service';

@Injectable()
export class RecommendationEngine {
    constructor(
        private prisma: PrismaService,
        private cyclesService: CyclesService,
        private pregnancyService: PregnancyService,
    ) { }

    /**
     * Calculate personalized scores for articles
     * Scoring factors:
     * 1. User cycle phase relevance (30%)
     * 2. Pregnancy week relevance (40% if pregnant)
     * 3. Category preferences (20%)
     * 4. Reading history similarity (10%)
     * 5. Seasonal relevance (5%)
     * 6. Recency boost (5%)
     */
    async calculateScores(
        userId: string,
        articles: any[],
    ): Promise<Map<string, number>> {
        const scores = new Map<string, number>();

        // Get user context
        const [userPreferences, cycles, pregnancy] = await Promise.all([
            this.getUserPreferences(userId),
            this.cyclesService.getCycles(userId),
            this.pregnancyService.getPregnancy(userId),
        ]);

        // Calculate cycle day if available
        let cycleDay: number | null = null;
        if (cycles && cycles.length > 0) {
            const latestCycle = cycles[0];
            const cycleStart = new Date(latestCycle.startDate);
            const today = new Date();
            cycleDay =
                Math.floor(
                    (today.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24),
                ) + 1;
        }

        // Calculate pregnancy week if available
        let pregnancyWeek: number | null = null;
        if (pregnancy && pregnancy.isActive && pregnancy.lmpDate) {
            const lmpDate = new Date(pregnancy.lmpDate);
            const today = new Date();
            const daysSinceLMP = Math.floor(
                (today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24),
            );
            pregnancyWeek = Math.floor(daysSinceLMP / 7);
        }

        // Get current month for seasonal boost
        const currentMonth = new Date().getMonth() + 1; // 1-12

        // Calculate score for each article
        for (const article of articles) {
            let score = 0;

            // 1. Cycle phase relevance (30%)
            if (cycleDay !== null && userPreferences.showCycleContent) {
                const cycleRelevance = this.calculateCycleRelevance(
                    cycleDay,
                    article.category,
                    article.tags,
                );
                score += cycleRelevance * 0.3;
            }

            // 2. Pregnancy relevance (40% if pregnant, otherwise redistribute)
            if (pregnancyWeek !== null && userPreferences.showPregnancyContent) {
                const pregnancyRelevance = this.calculatePregnancyRelevance(
                    pregnancyWeek,
                    article.category,
                    article.tags,
                );
                score += pregnancyRelevance * 0.4;
            } else {
                // Redistribute pregnancy weight to cycle and category
                if (cycleDay !== null && userPreferences.showCycleContent) {
                    const cycleRelevance = this.calculateCycleRelevance(
                        cycleDay,
                        article.category,
                        article.tags,
                    );
                    score += cycleRelevance * 0.2;
                }
                // Add to category weight
                const categoryWeight = this.calculateCategoryWeight(
                    article.category,
                    userPreferences.categoryWeights,
                );
                score += categoryWeight * 0.2;
            }

            // 3. Category preferences (20%)
            const categoryWeight = this.calculateCategoryWeight(
                article.category,
                userPreferences.categoryWeights,
            );
            score += categoryWeight * 0.2;

            // 4. Reading history similarity (10%)
            const historyScore = this.calculateHistoryScore(
                article.category,
                userPreferences.favoriteCategories,
            );
            score += historyScore * 0.1;

            // 5. Seasonal relevance (5%)
            const seasonalBoost = this.getSeasonalBoost(article.tags, currentMonth);
            score += seasonalBoost * 0.05;

            // 6. Recency boost (5%)
            const recencyBoost = this.calculateRecencyBoost(article.publishedAt);
            score += recencyBoost * 0.05;

            // Add base priority from article
            score += (article.priority / 100) * 0.1;

            scores.set(article.id, score);
        }

        return scores;
    }

    /**
     * Calculate cycle phase relevance
     * Returns a score between 0 and 1
     */
    private calculateCycleRelevance(
        cycleDay: number,
        category: string,
        tags: string[],
    ): number {
        const relevantCategories = this.getCycleRelevantCategories(cycleDay);
        const relevantTags = this.getCycleRelevantTags(cycleDay);

        let score = 0;

        // Check category match
        if (relevantCategories.includes(category)) {
            score += 0.6;
        }

        // Check tag matches
        const matchingTags = tags.filter((tag) => relevantTags.includes(tag));
        score += (matchingTags.length / Math.max(relevantTags.length, 1)) * 0.4;

        return Math.min(score, 1.0);
    }

    /**
     * Get cycle-relevant categories based on cycle day
     */
    private getCycleRelevantCategories(cycleDay: number): string[] {
        // Days 1-5: Menstrual phase
        if (cycleDay >= 1 && cycleDay <= 5) {
            return ['menstrual_health', 'pain_management', 'nutrition', 'rest'];
        }
        // Days 6-13: Follicular phase
        else if (cycleDay >= 6 && cycleDay <= 13) {
            return ['nutrition', 'exercise', 'energy', 'mental_health'];
        }
        // Days 14-16: Ovulation
        else if (cycleDay >= 14 && cycleDay <= 16) {
            return ['fertility', 'ovulation', 'sexual_health'];
        }
        // Days 17-28: Luteal phase
        else if (cycleDay >= 17 && cycleDay <= 28) {
            return ['pms', 'mood_management', 'sleep', 'nutrition'];
        }

        return [];
    }

    /**
     * Get cycle-relevant tags based on cycle day
     */
    private getCycleRelevantTags(cycleDay: number): string[] {
        if (cycleDay >= 1 && cycleDay <= 5) {
            return ['cramps', 'pain', 'iron', 'rest', 'hydration'];
        } else if (cycleDay >= 6 && cycleDay <= 13) {
            return ['energy', 'workout', 'protein', 'vitamins'];
        } else if (cycleDay >= 14 && cycleDay <= 16) {
            return ['fertility', 'ovulation', 'conception'];
        } else if (cycleDay >= 17 && cycleDay <= 28) {
            return ['pms', 'mood', 'bloating', 'sleep', 'magnesium'];
        }

        return [];
    }

    /**
     * Calculate pregnancy relevance
     * Returns a score between 0 and 1
     */
    private calculatePregnancyRelevance(
        week: number,
        category: string,
        tags: string[],
    ): number {
        const relevantCategories = this.getPregnancyRelevantCategories(week);
        const relevantTags = this.getPregnancyRelevantTags(week);

        let score = 0;

        // Check category match
        if (relevantCategories.includes(category)) {
            score += 0.6;
        }

        // Check tag matches
        const matchingTags = tags.filter((tag) => relevantTags.includes(tag));
        score += (matchingTags.length / Math.max(relevantTags.length, 1)) * 0.4;

        return Math.min(score, 1.0);
    }

    /**
     * Get pregnancy-relevant categories based on week
     */
    private getPregnancyRelevantCategories(week: number): string[] {
        // First trimester (1-13 weeks)
        if (week >= 1 && week <= 13) {
            return [
                'pregnancy',
                'nutrition',
                'prenatal_care',
                'morning_sickness',
                'early_pregnancy',
            ];
        }
        // Second trimester (14-27 weeks)
        else if (week >= 14 && week <= 27) {
            return [
                'pregnancy',
                'exercise',
                'nutrition',
                'fetal_development',
                'prenatal_care',
            ];
        }
        // Third trimester (28-40 weeks)
        else if (week >= 28 && week <= 40) {
            return [
                'pregnancy',
                'birth_preparation',
                'labor',
                'postpartum',
                'baby_care',
            ];
        }

        return ['pregnancy'];
    }

    /**
     * Get pregnancy-relevant tags based on week
     */
    private getPregnancyRelevantTags(week: number): string[] {
        if (week >= 1 && week <= 13) {
            return [
                'nausea',
                'fatigue',
                'folic_acid',
                'prenatal_vitamins',
                'first_trimester',
            ];
        } else if (week >= 14 && week <= 27) {
            return [
                'baby_movement',
                'weight_gain',
                'exercise',
                'second_trimester',
                'ultrasound',
            ];
        } else if (week >= 28 && week <= 40) {
            return [
                'contractions',
                'birth_plan',
                'hospital_bag',
                'third_trimester',
                'labor_signs',
            ];
        }

        return ['pregnancy'];
    }

    /**
     * Calculate category weight based on user preferences
     */
    private calculateCategoryWeight(
        category: string,
        categoryWeights: Record<string, number>,
    ): number {
        return categoryWeights[category] || 0.5; // Default to 0.5 if no preference
    }

    /**
     * Calculate history score based on favorite categories
     */
    private calculateHistoryScore(
        category: string,
        favoriteCategories: string[],
    ): number {
        if (favoriteCategories.includes(category)) {
            const index = favoriteCategories.indexOf(category);
            // First favorite gets 1.0, second gets 0.8, third gets 0.6
            return 1.0 - index * 0.2;
        }
        return 0.3; // Base score for non-favorites
    }

    /**
     * Get seasonal boost based on tags and current month
     */
    private getSeasonalBoost(tags: string[], currentMonth: number): number {
        const seasonalTags = this.getSeasonalTags(currentMonth);

        const matchingTags = tags.filter((tag) => seasonalTags.includes(tag));

        if (matchingTags.length > 0) {
            return 1.0;
        }

        return 0.5; // Base score
    }

    /**
     * Get seasonal tags based on month
     */
    private getSeasonalTags(month: number): string[] {
        // Spring (March-May): 3-5
        if (month >= 3 && month <= 5) {
            return ['allergies', 'outdoor_exercise', 'spring_cleaning', 'energy'];
        }
        // Summer (June-August): 6-8
        else if (month >= 6 && month <= 8) {
            return [
                'hydration',
                'sun_protection',
                'heat',
                'swimming',
                'vacation',
            ];
        }
        // Fall (September-November): 9-11
        else if (month >= 9 && month <= 11) {
            return ['immunity', 'flu_prevention', 'back_to_routine', 'vitamins'];
        }
        // Winter (December-February): 12, 1-2
        else {
            return [
                'immunity',
                'vitamin_d',
                'cold_weather',
                'indoor_exercise',
                'holidays',
            ];
        }
    }

    /**
     * Calculate recency boost
     * Newer articles get a slight boost
     */
    private calculateRecencyBoost(publishedAt: Date): number {
        const now = new Date();
        const daysSincePublished = Math.floor(
            (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60 * 24),
        );

        // Articles published in last 7 days get full boost
        if (daysSincePublished <= 7) {
            return 1.0;
        }
        // Articles published in last 30 days get partial boost
        else if (daysSincePublished <= 30) {
            return 0.7;
        }
        // Older articles get base score
        else {
            return 0.5;
        }
    }

    /**
     * Get user preferences or create defaults
     */
    private async getUserPreferences(userId: string): Promise<{
        categoryWeights: Record<string, number>;
        favoriteCategories: string[];
        showPregnancyContent: boolean;
        showCycleContent: boolean;
    }> {
        const preferences = await this.prisma.userContentPreferences.findUnique({
            where: { userId },
        });

        if (!preferences) {
            return {
                categoryWeights: {},
                favoriteCategories: [],
                showPregnancyContent: false,
                showCycleContent: true,
            };
        }

        return {
            categoryWeights: preferences.categoryWeights as Record<string, number>,
            favoriteCategories: preferences.favoriteCategories,
            showPregnancyContent: preferences.showPregnancyContent,
            showCycleContent: preferences.showCycleContent,
        };
    }
}
