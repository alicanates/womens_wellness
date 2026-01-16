import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    Linking,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { usePremium } from '@/hooks/usePremium';
import { PremiumBadge } from '@/components/premium/PremiumBadge';
import { TierSelector } from '@/components/premium/TierSelector';
import { FeaturesComparison } from '@/components/premium/FeaturesComparison';
import { BenefitsSection } from '@/components/premium/BenefitsSection';
import { FAQSection } from '@/components/premium/FAQSection';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { subscriptionService } from '@/services/api';
import { iapManager } from '@/services/iap.wrapper';
import type { SubscriptionTier } from '@/types/subscription';

export default function PremiumScreen() {
    const router = useRouter();
    const theme = useTheme();
    const queryClient = useQueryClient();
    const { subscription, isPremium, isLoading } = usePremium();
    const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('YEARLY');
    const [isPurchasing, setIsPurchasing] = useState(false);

    // Fetch products
    const { data: products } = useQuery({
        queryKey: ['products', Platform.OS],
        queryFn: () => subscriptionService.getProducts(Platform.OS as 'ios' | 'android'),
    });

    const styles = createStyles(theme);

    const handlePurchase = async () => {
        if (isPurchasing) return;

        setIsPurchasing(true);
        try {
            // Initialize IAP if not already initialized
            if (!iapManager.isReady()) {
                console.log('[Premium] Initializing IAP...');
                await iapManager.initialize();
            }

            // Request purchase from IAP
            // Note: The actual purchase result will come through the IAP listener
            // which is handled in the IAP service
            await iapManager.purchase(selectedTier);

            // After successful purchase, the IAP service will validate with backend
            // and we'll invalidate queries to refresh subscription status
            await queryClient.invalidateQueries({ queryKey: ['subscription'] });

            // Navigate to success screen
            router.push('/premium/success');
        } catch (error: any) {
            console.error('Purchase error:', error);

            // Handle IAPServiceError with user-friendly messages
            if (error.name === 'IAPServiceError') {
                const userMessage = error.getUserMessage ? error.getUserMessage() : error.message;

                // User cancelled - don't show error, just log
                if (error.code === 'USER_CANCELLED') {
                    console.log('[Premium] User cancelled purchase');
                    return;
                }

                // Already owned - offer restore
                if (error.code === 'ALREADY_OWNED') {
                    Alert.alert(
                        'Zaten Sahipsiniz',
                        userMessage,
                        [
                            { text: 'İptal', style: 'cancel' },
                            {
                                text: 'Geri Yükle',
                                onPress: handleRestore,
                            },
                        ]
                    );
                    return;
                }

                // Network error - offer retry
                if (error.code === 'NETWORK_ERROR' || error.isRecoverable?.()) {
                    Alert.alert(
                        'Bağlantı Hatası',
                        userMessage,
                        [
                            { text: 'İptal', style: 'cancel' },
                            {
                                text: 'Tekrar Dene',
                                onPress: handlePurchase,
                            },
                        ]
                    );
                    return;
                }

                // Requires user action
                if (error.requiresUserAction?.()) {
                    Alert.alert(
                        'İşlem Gerekli',
                        userMessage,
                        [
                            { text: 'Tamam' },
                            {
                                text: 'Ayarlar',
                                onPress: () => {
                                    // Open device settings
                                    if (Platform.OS === 'ios') {
                                        Linking.openURL('app-settings:');
                                    } else {
                                        Linking.openSettings();
                                    }
                                },
                            },
                        ]
                    );
                    return;
                }

                // Generic error
                Alert.alert(
                    'Satın Alma Başarısız',
                    userMessage,
                    [{ text: 'Tamam' }]
                );
            } else {
                // Non-IAP error
                Alert.alert(
                    'Hata',
                    error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.',
                    [{ text: 'Tamam' }]
                );
            }
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleRestore = async () => {
        setIsPurchasing(true);
        try {
            // Initialize IAP if not already initialized
            if (!iapManager.isReady()) {
                console.log('[Premium] Initializing IAP...');
                await iapManager.initialize();
            }

            console.log('[Premium] Restoring purchases...');
            const restoredPurchases = await iapManager.restorePurchases();

            if (restoredPurchases.length === 0) {
                Alert.alert(
                    'Satın Alım Bulunamadı',
                    'Geri yüklenecek satın alım bulunamadı. Eğer daha önce satın aldıysanız, lütfen aynı Apple ID veya Google hesabıyla giriş yaptığınızdan emin olun.',
                    [{ text: 'Tamam' }]
                );
            } else {
                // Refresh subscription status
                await queryClient.invalidateQueries({ queryKey: ['subscription'] });

                Alert.alert(
                    'Başarılı!',
                    'Satın alımlarınız geri yüklendi.',
                    [
                        {
                            text: 'Tamam',
                            onPress: () => router.push('/(tabs)/home'),
                        },
                    ]
                );
            }
        } catch (error: any) {
            console.error('Restore error:', error);

            // Handle IAPServiceError
            if (error.name === 'IAPServiceError') {
                const userMessage = error.getUserMessage ? error.getUserMessage() : error.message;

                // Network error - offer retry
                if (error.code === 'NETWORK_ERROR' || error.isRecoverable?.()) {
                    Alert.alert(
                        'Bağlantı Hatası',
                        userMessage,
                        [
                            { text: 'İptal', style: 'cancel' },
                            {
                                text: 'Tekrar Dene',
                                onPress: handleRestore,
                            },
                        ]
                    );
                    return;
                }

                Alert.alert(
                    'Geri Yükleme Başarısız',
                    userMessage,
                    [{ text: 'Tamam' }]
                );
            } else {
                Alert.alert(
                    'Hata',
                    error.message || 'Geri yükleme başarısız oldu. Lütfen tekrar deneyin.',
                    [{ text: 'Tamam' }]
                );
            }
        } finally {
            setIsPurchasing(false);
        }
    };



    const handleManageSubscription = () => {
        const url = Platform.OS === 'ios'
            ? 'https://apps.apple.com/account/subscriptions'
            : 'https://play.google.com/store/account/subscriptions';

        Linking.openURL(url);
    };

    const handleTerms = () => {
        router.push('/settings/terms-of-service' as any);
    };

    const handlePrivacy = () => {
        router.push('/settings/privacy-policy' as any);
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Yükleniyor...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Premium'a Geç ✨</Text>
                    <Text style={styles.subtitle}>
                        Gelişmiş AI ve özel özelliklerle deneyiminizi geliştirin
                    </Text>
                </View>

                {/* Current Status Card (if premium) */}
                {isPremium && subscription && (
                    <View style={styles.statusCard}>
                        <View style={styles.statusHeader}>
                            <PremiumBadge size="medium" variant="full" />
                            <Text style={styles.statusTitle}>Premium Üye</Text>
                        </View>
                        <View style={styles.statusDetails}>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Plan:</Text>
                                <Text style={styles.statusValue}>
                                    {subscription.tier === 'YEARLY' ? 'Yıllık' : 'Aylık'}
                                </Text>
                            </View>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>Yenileme:</Text>
                                <Text style={styles.statusValue}>
                                    {subscription.endDate
                                        ? new Date(subscription.endDate).toLocaleDateString('tr-TR')
                                        : '-'}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={styles.manageButton}
                            onPress={handleManageSubscription}
                        >
                            <Text style={styles.manageButtonText}>Aboneliği Yönet</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Tier Selector */}
                {!isPremium && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Plan Seçin</Text>
                        <TierSelector
                            selectedTier={selectedTier}
                            onSelectTier={setSelectedTier}
                            monthlyPrice={products?.find(p => p.productId.includes('monthly'))?.price || '₺99'}
                            yearlyPrice={products?.find(p => p.productId.includes('yearly'))?.price || '₺999'}
                        />
                    </View>
                )}

                {/* Features Comparison */}
                <View style={styles.section}>
                    <FeaturesComparison />
                </View>

                {/* Benefits Section */}
                <View style={styles.section}>
                    <BenefitsSection />
                </View>

                {/* Trial Info */}
                {!isPremium && !subscription?.hasHadTrial && (
                    <View style={styles.trialInfo}>
                        <Text style={styles.trialIcon}>🎁</Text>
                        <Text style={styles.trialText}>
                            7 gün ücretsiz deneyin, istediğiniz zaman iptal edin
                        </Text>
                    </View>
                )}

                {/* CTA Button */}
                {!isPremium && (
                    <View style={styles.ctaContainer}>
                        <TouchableOpacity
                            style={[styles.ctaButton, isPurchasing && styles.ctaButtonDisabled]}
                            onPress={handlePurchase}
                            disabled={isPurchasing}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.ctaButtonText}>
                                {isPurchasing ? 'İşleniyor...' : 'Premium\'a Başla'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.restoreButton}
                            onPress={handleRestore}
                            disabled={isPurchasing}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.restoreButtonText}>
                                Satın Alımları Geri Yükle
                            </Text>
                        </TouchableOpacity>

                        <Text style={styles.ctaNote}>
                            Abonelik otomatik olarak yenilenir. İstediğiniz zaman iptal edebilirsiniz.
                        </Text>
                    </View>
                )}

                {/* FAQ Section */}
                <View style={styles.section}>
                    <FAQSection />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        scrollView: {
            flex: 1,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            ...theme.typography.body,
            color: theme.colors.textSecondary,
        },
        header: {
            padding: theme.spacing.xl,
            paddingTop: theme.spacing.md,
        },
        backButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        backButtonText: {
            fontSize: 28,
            color: theme.colors.text,
        },
        title: {
            ...theme.typography.title,
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
        },
        subtitle: {
            ...theme.typography.body,
            color: theme.colors.textSecondary,
            lineHeight: 22,
        },
        statusCard: {
            backgroundColor: theme.colors.backgroundCard,
            marginHorizontal: theme.spacing.xl,
            marginBottom: theme.spacing.xl,
            padding: theme.spacing.lg,
            borderRadius: theme.card.borderRadius,
            borderWidth: 2,
            borderColor: theme.colors.primary,
        },
        statusHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.md,
        },
        statusTitle: {
            ...theme.typography.subtitle,
            color: theme.colors.text,
        },
        statusDetails: {
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.md,
        },
        statusRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
        statusLabel: {
            ...theme.typography.body,
            color: theme.colors.textSecondary,
        },
        statusValue: {
            ...theme.typography.body,
            color: theme.colors.text,
            fontWeight: '600',
        },
        manageButton: {
            backgroundColor: theme.colors.backgroundSecondary,
            padding: theme.spacing.md,
            borderRadius: theme.card.borderRadius,
            alignItems: 'center',
        },
        manageButtonText: {
            ...theme.typography.body,
            color: theme.colors.primary,
            fontWeight: '600',
        },
        section: {
            paddingHorizontal: theme.spacing.xl,
            marginBottom: theme.spacing.xl,
        },
        sectionTitle: {
            ...theme.typography.subtitle,
            color: theme.colors.text,
            marginBottom: theme.spacing.md,
        },
        trialInfo: {
            backgroundColor: theme.colors.backgroundSecondary,
            marginHorizontal: theme.spacing.xl,
            marginBottom: theme.spacing.lg,
            padding: theme.spacing.lg,
            borderRadius: theme.card.borderRadius,
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.md,
        },
        trialIcon: {
            fontSize: 32,
        },
        trialText: {
            ...theme.typography.body,
            color: theme.colors.text,
            flex: 1,
            lineHeight: 20,
        },
        ctaContainer: {
            paddingHorizontal: theme.spacing.xl,
            marginBottom: theme.spacing.xl,
        },
        ctaButton: {
            backgroundColor: theme.colors.primary,
            padding: theme.spacing.lg,
            borderRadius: theme.card.borderRadius,
            alignItems: 'center',
            marginBottom: theme.spacing.md,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
        ctaButtonDisabled: {
            opacity: 0.6,
        },
        ctaButtonText: {
            ...theme.typography.subtitle,
            color: theme.colors.textOnPrimary,
            fontWeight: '700',
            fontSize: 18,
        },
        restoreButton: {
            padding: theme.spacing.md,
            borderRadius: theme.card.borderRadius,
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        restoreButtonText: {
            ...theme.typography.body,
            color: theme.colors.primary,
            fontWeight: '600',
        },
        ctaNote: {
            ...theme.typography.caption,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            lineHeight: 16,
        },
    });
