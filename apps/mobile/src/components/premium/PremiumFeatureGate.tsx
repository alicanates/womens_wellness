import { ReactNode, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { usePremium } from '@/hooks/usePremium';
import { UpgradePrompt } from './UpgradePrompt';
import type { Feature } from '@/types/subscription';
import { isPremiumFeature, getFeatureDisplayName } from '@/types/subscription';

interface PremiumFeatureGateProps {
    feature: Feature;
    children: ReactNode;
    fallback?: ReactNode;
    showPromptOnPress?: boolean;
    featureDescription?: string;
}

/**
 * PremiumFeatureGate Component
 * 
 * Wraps content that requires premium access.
 * Shows upgrade prompt when non-premium users try to access.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 17.1, 17.2, 17.3, 17.4, 17.5
 */
export function PremiumFeatureGate({
    feature,
    children,
    fallback,
    showPromptOnPress = true,
    featureDescription,
}: PremiumFeatureGateProps) {
    const { canUseFeature } = usePremium();
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

    const hasAccess = canUseFeature(feature);

    // If user has access, render children normally
    if (hasAccess) {
        return <>{children}</>;
    }

    // If no access and showPromptOnPress is true, wrap in touchable
    if (showPromptOnPress) {
        return (
            <>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setShowUpgradePrompt(true)}
                    style={styles.gatedContent}
                >
                    {fallback || children}
                </TouchableOpacity>

                <UpgradePrompt
                    visible={showUpgradePrompt}
                    onClose={() => setShowUpgradePrompt(false)}
                    feature={getFeatureDisplayName(feature)}
                    description={
                        featureDescription ||
                        `Bu özellik premium kullanıcılara özeldir. Premium'a geçerek ${getFeatureDisplayName(feature)} özelliğinden yararlanın.`
                    }
                />
            </>
        );
    }

    // If no access and showPromptOnPress is false, just show fallback
    return <>{fallback || null}</>;
}

const styles = StyleSheet.create({
    gatedContent: {
        position: 'relative',
    },
});

/**
 * Hook to check feature access and show upgrade prompt
 */
export function useFeatureGate(feature: Feature) {
    const { canUseFeature } = usePremium();
    const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

    const checkAccess = () => {
        const hasAccess = canUseFeature(feature);
        if (!hasAccess) {
            setShowUpgradePrompt(true);
        }
        return hasAccess;
    };

    return {
        hasAccess: canUseFeature(feature),
        checkAccess,
        showUpgradePrompt,
        setShowUpgradePrompt,
    };
}
