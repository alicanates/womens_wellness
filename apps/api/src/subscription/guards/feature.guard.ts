import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionService } from '../subscription.service';
import { SubscriptionStatus } from '@prisma/client';
import { FEATURE_KEY } from '../decorators/feature.decorator';

/**
 * Guard to check if user can access a specific feature
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 17.1, 17.2, 17.3, 17.4, 17.5
 */
@Injectable()
export class FeatureGuard implements CanActivate {
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Get required feature from decorator
        const requiredFeature = this.reflector.getAllAndOverride<string>(FEATURE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // If no feature is specified, allow access
        if (!requiredFeature) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.id) {
            throw new UnauthorizedException('Kimlik doğrulama gerekli');
        }

        // Get user's subscription
        const subscription = await this.subscriptionService.getSubscription(user.id);

        // Check if user can access the feature
        const canAccess = this.canAccessFeature(requiredFeature, subscription.status);

        if (!canAccess) {
            throw new ForbiddenException({
                code: 'FEATURE_LOCKED',
                message: `"${this.getFeatureName(requiredFeature)}" özelliği premium kullanıcılar içindir. Premium'a geçerek erişim sağlayabilirsiniz.`,
                messageEn: `"${this.getFeatureName(requiredFeature)}" feature requires premium subscription. Upgrade to premium to access.`,
                feature: requiredFeature,
                subscription: {
                    status: subscription.status,
                    tier: subscription.tier,
                },
            });
        }

        // Attach subscription to request for later use
        request.subscription = subscription;

        return true;
    }

    /**
     * Check if user can access a feature based on subscription status
     */
    private canAccessFeature(feature: string, status: SubscriptionStatus): boolean {
        // Define free features
        const freeFeatures = [
            'basic_chat',
            'cycle_tracking',
            'water_tracking',
            'basic_reminders',
            'pregnancy_tracking',
            'wellness_tracking',
        ];

        // If it's a free feature, allow access
        if (freeFeatures.includes(feature)) {
            return true;
        }

        // Premium features require active subscription
        const isPremium =
            status === SubscriptionStatus.ACTIVE ||
            status === SubscriptionStatus.TRIAL ||
            status === SubscriptionStatus.GRACE_PERIOD;

        return isPremium;
    }

    /**
     * Get user-friendly feature name
     */
    private getFeatureName(feature: string): string {
        const featureNames: Record<string, string> = {
            advanced_ai: 'Gelişmiş AI',
            priority_response: 'Öncelikli Yanıt',
            insights: 'Kişisel İçgörüler',
            advanced_analytics: 'Gelişmiş Analizler',
            customization: 'Özelleştirme',
            unlimited_messages: 'Sınırsız Mesaj',
        };

        return featureNames[feature] || feature;
    }
}
