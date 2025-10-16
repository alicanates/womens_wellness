import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for premium requirement
 */
export const PREMIUM_KEY = 'premium';

/**
 * Decorator to mark an endpoint as requiring premium subscription
 * Usage: @RequirePremium()
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
export const RequirePremium = () => SetMetadata(PREMIUM_KEY, true);
