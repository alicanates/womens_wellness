import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for feature requirement
 */
export const FEATURE_KEY = 'feature';

/**
 * Decorator to mark an endpoint as requiring a specific feature
 * Usage: @RequireFeature('advanced_ai')
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 17.1, 17.2, 17.3, 17.4, 17.5
 */
export const RequireFeature = (feature: string) => SetMetadata(FEATURE_KEY, feature);
