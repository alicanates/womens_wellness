import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { subscriptionService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

export default function UsageStatsScreen() {
    const router = useRouter();
    const { colors } = useTheme();

    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['usage-stats'],
        queryFn: () => subscriptionService.getUsageStats(),
    });

    const { data: subscription } = useQuery({
        queryKey: ['subscription'],
        queryFn: () => subscriptionService.getStatus(),
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) {
            return `${minutes} dakika`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours} saat ${mins} dakika` : `${hours} saat`;
    };

    const getMembershipDuration = () => {
        if (!stats?.memberSince) return '0 gün';

        const start = new Date(stats.memberSince);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 30) {
            return `${diffDays} gün`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} ay`;
        } else {
            const years = Math.floor(diffDays / 365);
            const months = Math.floor((diffDays % 365) / 30);
            return months > 0 ? `${years} yıl ${months} ay` : `${years} yıl`;
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !stats) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        Kullanım İstatistikleri
                    </Text>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
                    <Text style={[styles.errorText, { color: colors.textSecondary }]}>
                        İstatistikler yüklenemedi
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Kullanım İstatistikleri
                </Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Premium Badge */}
                {subscription?.status === 'ACTIVE' && (
                    <View style={[styles.premiumBanner, { backgroundColor: colors.primary + '15' }]}>
                        <View style={styles.premiumBadge}>
                            <Text style={styles.premiumBadgeText}>✨ PREMIUM</Text>
                        </View>
                        <Text style={[styles.premiumText, { color: colors.text }]}>
                            Premium üyeliğinizden en iyi şekilde yararlanıyorsunuz!
                        </Text>
                    </View>
                )}

                {/* Main Stats Grid */}
                <View style={styles.statsGrid}>
                    {/* Total Messages */}
                    <View style={[styles.statCard, { backgroundColor: colors.backgroundCard }]}>
                        <View style={[styles.statIcon, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name="chatbubbles" size={28} color={colors.primary} />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                            {stats.totalMessages.toLocaleString('tr-TR')}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                            Toplam Mesaj
                        </Text>
                    </View>

                    {/* Time Saved */}
                    <View style={[styles.statCard, { backgroundColor: colors.backgroundCard }]}>
                        <View style={[styles.statIcon, { backgroundColor: '#10B981' + '20' }]}>
                            <Ionicons name="time" size={28} color="#10B981" />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                            {formatDuration(stats.timeSaved)}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                            Tasarruf Edilen Süre
                        </Text>
                    </View>

                    {/* Insights Generated */}
                    <View style={[styles.statCard, { backgroundColor: colors.backgroundCard }]}>
                        <View style={[styles.statIcon, { backgroundColor: '#F59E0B' + '20' }]}>
                            <Ionicons name="bulb" size={28} color="#F59E0B" />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                            {stats.insightsGenerated}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                            Oluşturulan İçgörü
                        </Text>
                    </View>

                    {/* Current Streak */}
                    <View style={[styles.statCard, { backgroundColor: colors.backgroundCard }]}>
                        <View style={[styles.statIcon, { backgroundColor: '#EF4444' + '20' }]}>
                            <Ionicons name="flame" size={28} color="#EF4444" />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text }]}>
                            {stats.currentStreak}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                            Günlük Seri
                        </Text>
                    </View>
                </View>

                {/* Membership Duration */}
                <View style={[styles.membershipCard, { backgroundColor: colors.backgroundCard }]}>
                    <View style={styles.membershipHeader}>
                        <Ionicons name="calendar" size={24} color={colors.primary} />
                        <Text style={[styles.membershipTitle, { color: colors.text }]}>
                            Üyelik Süresi
                        </Text>
                    </View>
                    <Text style={[styles.membershipDuration, { color: colors.primary }]}>
                        {getMembershipDuration()}
                    </Text>
                    <Text style={[styles.membershipDate, { color: colors.textSecondary }]}>
                        {formatDate(stats.memberSince)} tarihinden beri
                    </Text>
                </View>

                {/* Premium Features Used */}
                {stats.premiumFeaturesUsed.length > 0 && (
                    <View style={[styles.featuresCard, { backgroundColor: colors.backgroundCard }]}>
                        <Text style={[styles.featuresTitle, { color: colors.text }]}>
                            Kullanılan Premium Özellikler
                        </Text>
                        <View style={styles.featuresList}>
                            {stats.premiumFeaturesUsed.map((feature, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.featureItem,
                                        { borderBottomColor: colors.border },
                                        index === stats.premiumFeaturesUsed.length - 1 && styles.featureItemLast,
                                    ]}
                                >
                                    <View style={styles.featureInfo}>
                                        <Text style={[styles.featureName, { color: colors.text }]}>
                                            {getFeatureDisplayName(feature.feature)}
                                        </Text>
                                        <Text style={[styles.featureCount, { color: colors.textSecondary }]}>
                                            {feature.count} kez kullanıldı
                                        </Text>
                                    </View>
                                    <View style={[styles.featureBadge, { backgroundColor: colors.primary + '20' }]}>
                                        <Text style={[styles.featureBadgeText, { color: colors.primary }]}>
                                            {feature.count}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Benefits Summary */}
                <View style={[styles.benefitsCard, { backgroundColor: colors.backgroundCard }]}>
                    <Text style={[styles.benefitsTitle, { color: colors.text }]}>
                        Premium Avantajlarınız
                    </Text>
                    <View style={styles.benefitsList}>
                        <BenefitItem
                            icon="checkmark-circle"
                            text="Gelişmiş AI modeli ile daha akıllı yanıtlar"
                            colors={colors}
                        />
                        <BenefitItem
                            icon="checkmark-circle"
                            text="Öncelikli yanıt hızı"
                            colors={colors}
                        />
                        <BenefitItem
                            icon="checkmark-circle"
                            text="Kişiselleştirilmiş içgörüler"
                            colors={colors}
                        />
                        <BenefitItem
                            icon="checkmark-circle"
                            text="Gelişmiş analizler ve raporlar"
                            colors={colors}
                        />
                        <BenefitItem
                            icon="checkmark-circle"
                            text="Sınırsız mesaj kotası"
                            colors={colors}
                        />
                    </View>
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
}

function BenefitItem({
    icon,
    text,
    colors,
}: {
    icon: string;
    text: string;
    colors: any;
}) {
    return (
        <View style={styles.benefitItem}>
            <Ionicons name={icon as any} size={20} color={colors.primary} />
            <Text style={[styles.benefitText, { color: colors.text }]}>{text}</Text>
        </View>
    );
}

function getFeatureDisplayName(feature: string): string {
    const displayNames: Record<string, string> = {
        advanced_ai: 'Gelişmiş AI',
        priority_response: 'Öncelikli Yanıt',
        insights: 'Kişisel İçgörüler',
        advanced_analytics: 'Gelişmiş Analizler',
        customization: 'Özelleştirme',
    };

    return displayNames[feature] || feature;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    errorText: {
        fontSize: 16,
        marginTop: 16,
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    premiumBanner: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        alignItems: 'center',
    },
    premiumBadge: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 12,
    },
    premiumBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    premiumText: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
        marginBottom: 16,
    },
    statCard: {
        width: '50%',
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        marginHorizontal: 6,
    },
    statIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        lineHeight: 18,
    },
    membershipCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    membershipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    membershipTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    membershipDuration: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 4,
    },
    membershipDate: {
        fontSize: 14,
    },
    featuresCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    featuresTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    featuresList: {
        gap: 0,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    featureItemLast: {
        borderBottomWidth: 0,
    },
    featureInfo: {
        flex: 1,
    },
    featureName: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 4,
    },
    featureCount: {
        fontSize: 13,
    },
    featureBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    featureBadgeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    benefitsCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    benefitsTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    benefitsList: {
        gap: 12,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    benefitText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    bottomSpacing: {
        height: 32,
    },
});
