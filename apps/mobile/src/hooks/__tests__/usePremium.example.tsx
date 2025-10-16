/**
 * Example usage of usePremium hook
 * 
 * This file demonstrates how to use the usePremium hook in components
 * to check premium status, feature access, and manage quota.
 */

import React from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { usePremium, useQuota } from '../usePremium';
import { FEATURES } from '@/types/subscription';

/**
 * Example 1: Basic premium status check
 */
export function PremiumStatusExample() {
    const { isPremium, subscription, isLoading } = usePremium();

    if (isLoading) {
        return <Text>Yükleniyor...</Text>;
    }

    return (
        <View>
            <Text>Premium Durumu: {isPremium ? 'Premium Üye' : 'Ücretsiz Plan'}</Text>
            {subscription && (
                <Text>Abonelik Durumu: {subscription.status}</Text>
            )}
        </View>
    );
}

/**
 * Example 2: Feature gate check
 */
export function FeatureGateExample() {
    const { canUseFeature, isPremium } = usePremium();
    const router = useRouter();

    const handleInsightsClick = () => {
        if (canUseFeature(FEATURES.INSIGHTS)) {
            // User can access insights
            router.push('/insights');
        } else {
            // Show upgrade prompt
            Alert.alert(
                'Premium Özellik',
                'İçgörüler özelliği premium üyeler için mevcuttur.',
                [
                    { text: 'İptal', style: 'cancel' },
                    {
                        text: 'Premium\'a Geç',
                        onPress: () => router.push('/premium')
                    },
                ]
            );
        }
    };

    return (
        <View>
            <Button
                title="İçgörüleri Gör"
                onPress={handleInsightsClick}
            />
            {!isPremium && (
                <Text style={{ fontSize: 12, color: 'gray' }}>
                    Premium özellik
                </Text>
            )}
        </View>
    );
}

/**
 * Example 3: Quota management in chat
 */
export function ChatQuotaExample() {
    const { checkQuota, incrementQuota } = usePremium();
    const { quota, isLow, isDepleted } = useQuota();
    const [message, setMessage] = React.useState('');

    const handleSendMessage = async () => {
        // Check quota before sending
        const hasQuota = await checkQuota();

        if (!hasQuota) {
            Alert.alert(
                'Mesaj Kotası Doldu',
                'Aylık AI mesaj kotanız doldu. Premium\'a geçerek sınırsız mesaj gönderin.',
                [
                    { text: 'Tamam', style: 'cancel' },
                    {
                        text: 'Premium\'a Geç',
                        onPress: () => router.push('/premium')
                    },
                ]
            );
            return;
        }

        // Send message
        await sendMessageToAPI(message);

        // Increment quota after successful send
        await incrementQuota();

        setMessage('');
    };

    return (
        <View>
            {/* Quota display */}
            {quota && (
                <View>
                    <Text>
                        Kalan Mesaj: {quota.remaining} / {quota.limit}
                    </Text>
                    {isLow && (
                        <Text style={{ color: 'orange' }}>
                            ⚠️ Mesaj kotanız azalıyor
                        </Text>
                    )}
                </View>
            )}

            {/* Message input */}
            <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Mesajınızı yazın..."
                editable={!isDepleted}
            />

            <Button
                title="Gönder"
                onPress={handleSendMessage}
                disabled={isDepleted || !message.trim()}
            />

            {isDepleted && (
                <Text style={{ color: 'red' }}>
                    Mesaj kotanız doldu. Premium'a geçin.
                </Text>
            )}
        </View>
    );
}

/**
 * Example 4: Multiple feature checks
 */
export function FeatureListExample() {
    const { canUseFeature, isPremium } = usePremium();

    const features = [
        { id: FEATURES.ADVANCED_AI, name: 'Gelişmiş AI' },
        { id: FEATURES.PRIORITY_RESPONSE, name: 'Öncelikli Yanıt' },
        { id: FEATURES.INSIGHTS, name: 'Kişisel İçgörüler' },
        { id: FEATURES.ADVANCED_ANALYTICS, name: 'Gelişmiş Analizler' },
    ];

    return (
        <View>
            <Text>Özellikler:</Text>
            {features.map((feature) => (
                <View key={feature.id}>
                    <Text>
                        {canUseFeature(feature.id) ? '✅' : '🔒'} {feature.name}
                    </Text>
                </View>
            ))}
        </View>
    );
}

/**
 * Example 5: Subscription details display
 */
export function SubscriptionDetailsExample() {
    const { subscription, isLoading } = usePremium();

    if (isLoading) {
        return <Text>Yükleniyor...</Text>;
    }

    if (!subscription) {
        return <Text>Abonelik bilgisi bulunamadı</Text>;
    }

    return (
        <View>
            <Text>Durum: {subscription.status}</Text>
            {subscription.tier && (
                <Text>Plan: {subscription.tier === 'MONTHLY' ? 'Aylık' : 'Yıllık'}</Text>
            )}
            {subscription.startDate && (
                <Text>Başlangıç: {new Date(subscription.startDate).toLocaleDateString('tr-TR')}</Text>
            )}
            {subscription.endDate && (
                <Text>Bitiş: {new Date(subscription.endDate).toLocaleDateString('tr-TR')}</Text>
            )}
            <Text>
                AI Mesajları: {subscription.aiMessagesUsed} / {subscription.aiMessagesLimit}
            </Text>
            {subscription.isInGracePeriod && (
                <Text style={{ color: 'orange' }}>
                    ⚠️ Ödeme başarısız - Ek süre aktif
                </Text>
            )}
        </View>
    );
}

/**
 * Example 6: Refetch subscription on app focus
 */
export function RefetchOnFocusExample() {
    const { refetch } = usePremium();

    React.useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                // Refetch subscription when app comes to foreground
                refetch();
            }
        });

        return () => {
            subscription.remove();
        };
    }, [refetch]);

    return null;
}

// Helper function (mock)
async function sendMessageToAPI(message: string) {
    // Implementation would call actual API
    console.log('Sending message:', message);
}

// Mock router
const useRouter = () => ({
    push: (path: string) => console.log('Navigate to:', path),
});

