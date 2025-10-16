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

/**
 * Guard to check if user has premium access
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
@Injectable()
export class PremiumGuard implements CanActivate {
    constructor(
        private readonly subscriptionService: SubscriptionService,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.id) {
            throw new UnauthorizedException('Kimlik doğrulama gerekli');
        }

        // Get user's subscription
        const subscription = await this.subscriptionService.getSubscription(user.id);

        // Check if user has premium access
        const isPremium =
            subscription.status === SubscriptionStatus.ACTIVE ||
            subscription.status === SubscriptionStatus.TRIAL ||
            subscription.status === SubscriptionStatus.GRACE_PERIOD;

        if (!isPremium) {
            throw new ForbiddenException({
                code: 'PREMIUM_REQUIRED',
                message: 'Bu özellik premium kullanıcılar içindir. Premium\'a geçerek erişim sağlayabilirsiniz.',
                messageEn: 'This feature requires premium subscription. Upgrade to premium to access.',
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
}
