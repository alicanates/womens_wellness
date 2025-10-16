/**
 * Example usage of UpgradePrompt component
 * 
 * This file demonstrates how to use the UpgradePrompt modal
 * to prompt users to upgrade when accessing premium features.
 */

import { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { UpgradePrompt } from './UpgradePrompt';
import { usePremium } from '@/hooks/usePremium';

/**
 * Example 1: Basic usage with feature gate
 */
export function BasicUpgradePromptExample() {
    const [showPrompt, setShowPrompt] = useState(false);
    const { canUseFeature } = usePremium();

    const handleAccessPremiumFeature = () => {
        if (!canUseFeature('insights')) {
            setShowPrompt(true);
            return;
        }

        // Access the premium feature
        console.log('Accessing insights feature...');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={handleAccessPremiumFeature}
            >
                <Text style={styles.buttonText}>View Insights</Text>
            </TouchableOpacity>

            <UpgradePrompt
                visible={showPrompt}
                onClose={() => setShowPrompt(false)}
                feature="Kişisel İçgörüler"
                description="Sağlık verilerinize dayalı kişiselleştirilmiş içgörüler ve öneriler alın."
            />
        </View>
    );
}

/**
 * Example 2: Usage with advanced analytics
 */
export function AdvancedAnalyticsPromptExample() {
    const [showPrompt, setShowPrompt] = useState(false);
    const { canUseFeature } = usePremium();

    const handleViewAnalytics = () => {
        if (!canUseFeature('advanced_analytics')) {
            setShowPrompt(true);
            return;
        }

        // Navigate to analytics
        console.log('Opening advanced analytics...');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={handleViewAnalytics}
            >
                <Text style={styles.buttonText}>Advanced Analytics</Text>
            </TouchableOpacity>

            <UpgradePrompt
                visible={showPrompt}
                onClose={() => setShowPrompt(false)}
                feature="Gelişmiş Analizler"
                description="Detaylı grafikler ve trendlerle sağlık verilerinizi daha iyi anlayın."
            />
        </View>
    );
}

/**
 * Example 3: Usage with custom theme
 */
export function CustomThemePromptExample() {
    const [showPrompt, setShowPrompt] = useState(false);
    const { canUseFeature } = usePremium();

    const handleCustomizeTheme = () => {
        if (!canUseFeature('custom_themes')) {
            setShowPrompt(true);
            return;
        }

        // Open theme customization
        console.log('Opening theme customization...');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={handleCustomizeTheme}
            >
                <Text style={styles.buttonText}>Customize Theme</Text>
            </TouchableOpacity>

            <UpgradePrompt
                visible={showPrompt}
                onClose={() => setShowPrompt(false)}
                feature="Özel Temalar"
                description="Uygulamanızı kişiselleştirin ve kendi renk temanızı oluşturun."
            />
        </View>
    );
}

/**
 * Example 4: Usage with AI chat quota exceeded
 */
export function QuotaExceededPromptExample() {
    const [showPrompt, setShowPrompt] = useState(false);
    const { checkQuota } = usePremium();

    const handleSendMessage = async () => {
        const hasQuota = await checkQuota();

        if (!hasQuota) {
            setShowPrompt(true);
            return;
        }

        // Send message
        console.log('Sending AI message...');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.button}
                onPress={handleSendMessage}
            >
                <Text style={styles.buttonText}>Send AI Message</Text>
            </TouchableOpacity>

            <UpgradePrompt
                visible={showPrompt}
                onClose={() => setShowPrompt(false)}
                feature="Sınırsız AI Mesajları"
                description="Aylık mesaj limitiniz doldu. Premium ile 1000 mesaj/ay kullanın."
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
