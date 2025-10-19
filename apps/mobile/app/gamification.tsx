import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { gamificationService } from '@/services/gamification';
import type { GamificationStats, UserAchievement, UserInsight } from '@/types/gamification';

const { width } = Dimensions.get('window');

export default function GamificationScreen() {
    const router = useRouter();
    const theme = useTheme();
    const queryClient = useQueryClient();
    const [selectedTab, setSelectedTab] = useState<'stats' | 'achievements' | 'insights'>('stats');

    // Fetch gamification data
    const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<GamificationStats>({
        queryKey: ['gamification-stats'],
        queryFn: async () => {
            console.log('Fetching gamification stats...');
            try {
                const result = await gamificationService.getStats();
                console.log('Gamification stats:', result);
                return result;
            } catch (error: any) {
                console.error('Error fetching gamification stats:', error);
                console.error('Error response:', error.response?.data);
                throw error;
            }
        },
        retry: 1,
    });

    const { data: achievements, isLoading: achievementsLoading } = useQuery<UserAchievement[]>({
        queryKey: ['gamification-achievements'],
        queryFn: () => gamificationService.getAchievements(),
    });

    const { data: insights, isLoading: insightsLoading } = useQuery<UserInsight[]>({
        queryKey: ['gamification-insights'],
        queryFn: () => gamificationService.getInsights(),
    });

    const resetMutation = useMutation({
        mutationFn: () => gamificationService.resetGamification(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gamification-stats'] });
            queryClient.invalidateQueries({ queryKey: ['gamification-achievements'] });
            queryClient.invalidateQueries({ queryKey: ['gamification-insights'] });
            Alert.alert('Başarılı', 'Gamification verileri sıfırlandı. Bugünden itibaren yeni veriler toplanacak.');
        },
        onError: (error: any) => {
            Alert.alert('Hata', 'Veriler sıfırlanırken bir hata oluştu.');
            console.error('Reset error:', error);
        },
    });

    const handleReset = () => {
        Alert.alert(
            'Verileri Sıfırla',
            'Tüm gamification verileriniz (seviye, XP, rozetler, streak) sıfırlanacak. Emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sıfırla',
                    style: 'destructive',
                    onPress: () => resetMutation.mutate(),
                },
            ]
        );
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'COMMON':
                return '#94A3B8';
            case 'RARE':
                return '#3B82F6';
            case 'EPIC':
                return '#A855F7';
            case 'LEGENDARY':
                return '#F59E0B';
            default:
                return theme.colors.textSecondary;
        }
    };

    const getRarityGradient = (rarity: string): [string, string] => {
        switch (rarity) {
            case 'COMMON':
                return ['#94A3B8', '#64748B'];
            case 'RARE':
                return ['#3B82F6', '#2563EB'];
            case 'EPIC':
                return ['#A855F7', '#9333EA'];
            case 'LEGENDARY':
                return ['#F59E0B', '#D97706'];
            default:
                return [theme.colors.primary, theme.colors.primaryDark];
        }
    };

    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>‹ Geri</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Başarılarım</Text>
                <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
                    <Text style={styles.resetButtonText}>Sıfırla</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'stats' && styles.tabActive]}
                    onPress={() => setSelectedTab('stats')}
                >
                    <Text style={[styles.tabText, selectedTab === 'stats' && styles.tabTextActive]}>
                        İstatistikler
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'achievements' && styles.tabActive]}
                    onPress={() => setSelectedTab('achievements')}
                >
                    <Text style={[styles.tabText, selectedTab === 'achievements' && styles.tabTextActive]}>
                        Rozetler
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'insights' && styles.tabActive]}
                    onPress={() => setSelectedTab('insights')}
                >
                    <Text style={[styles.tabText, selectedTab === 'insights' && styles.tabTextActive]}>
                        İçgörüler
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                {/* Stats Tab */}
                {selectedTab === 'stats' && (
                    <>
                        {statsLoading ? (
                            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
                        ) : !stats ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyIcon}>📊</Text>
                                <Text style={styles.emptyText}>Henüz veri yok</Text>
                                <Text style={styles.emptySubtext}>
                                    İlk veri girişinizi yaparak başlayın!
                                </Text>
                            </View>
                        ) : (
                            <>
                                {/* Level Card */}
                                <LinearGradient
                                    colors={[theme.colors.primary, theme.colors.primaryDark]}
                                    style={styles.levelCard}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.levelHeader}>
                                        <Text style={styles.levelLabel}>Seviye</Text>
                                        <Text style={styles.levelNumber}>{stats.level}</Text>
                                    </View>
                                    <View style={styles.xpContainer}>
                                        <View style={styles.xpBar}>
                                            <View style={[styles.xpProgress, { width: `${stats.levelProgress}%` }]} />
                                        </View>
                                        <Text style={styles.xpText}>
                                            {stats.xpProgress} / {stats.xpTotal} XP
                                        </Text>
                                    </View>
                                    <Text style={styles.xpNeeded}>
                                        Sonraki seviye için {stats.xpNeeded} XP gerekli
                                    </Text>
                                </LinearGradient>

                                {/* Streak Card */}
                                <View style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.cardIcon}>🔥</Text>
                                        <Text style={styles.cardTitle}>Streak</Text>
                                    </View>
                                    <View style={styles.streakContainer}>
                                        <View style={styles.streakItem}>
                                            <Text style={styles.streakNumber}>{stats.currentStreak}</Text>
                                            <Text style={styles.streakLabel}>Güncel</Text>
                                        </View>
                                        <View style={styles.streakDivider} />
                                        <View style={styles.streakItem}>
                                            <Text style={styles.streakNumber}>{stats.longestStreak}</Text>
                                            <Text style={styles.streakLabel}>En Uzun</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Stats Grid */}
                                <View style={styles.statsGrid}>
                                    <View style={styles.statCard}>
                                        <Text style={styles.statIcon}>📊</Text>
                                        <Text style={styles.statNumber}>{stats.totalDataEntries}</Text>
                                        <Text style={styles.statLabel}>Veri Girişi</Text>
                                    </View>
                                    <View style={styles.statCard}>
                                        <Text style={styles.statIcon}>🏆</Text>
                                        <Text style={styles.statNumber}>{stats.achievements}</Text>
                                        <Text style={styles.statLabel}>Rozet</Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </>
                )}

                {/* Achievements Tab */}
                {selectedTab === 'achievements' && (
                    <>
                        {achievementsLoading ? (
                            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
                        ) : achievements && achievements.length > 0 ? (
                            <>
                                <View style={styles.infoCard}>
                                    <Text style={styles.infoIcon}>💡</Text>
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoTitle}>Rozetler Nasıl Kazanılır?</Text>
                                        <Text style={styles.infoText}>
                                            Takvimde veri girerek, düzenli takip yaparak ve hedeflere ulaşarak rozetler kazanabilirsiniz!
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.achievementsList}>
                                    {achievements.map((item) => (
                                        <View
                                            key={item.id}
                                            style={[
                                                styles.achievementCard,
                                                !item.isCompleted && styles.achievementCardLocked
                                            ]}
                                        >
                                            <LinearGradient
                                                colors={item.isCompleted ? getRarityGradient(item.achievement.rarity) : ['#64748B', '#475569']}
                                                style={[
                                                    styles.achievementIconContainer,
                                                    !item.isCompleted && styles.achievementIconLocked
                                                ]}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 1 }}
                                            >
                                                <Text style={[
                                                    styles.achievementIcon,
                                                    !item.isCompleted && styles.achievementIconTextLocked
                                                ]}>
                                                    {item.isCompleted ? (item.achievement.iconEmoji || '🏆') : '🔒'}
                                                </Text>
                                            </LinearGradient>
                                            <View style={styles.achievementContent}>
                                                <View style={styles.achievementHeader}>
                                                    <Text style={[
                                                        styles.achievementName,
                                                        !item.isCompleted && styles.achievementNameLocked
                                                    ]}>
                                                        {item.achievement.nameTr}
                                                    </Text>
                                                    {item.isCompleted && (
                                                        <Text style={styles.completedBadge}>✓</Text>
                                                    )}
                                                </View>
                                                <Text style={[
                                                    styles.achievementDescription,
                                                    !item.isCompleted && styles.achievementDescriptionLocked
                                                ]}>
                                                    {item.achievement.descriptionTr}
                                                </Text>
                                                {!item.isCompleted && (
                                                    <View style={styles.progressContainer}>
                                                        <View style={styles.progressBar}>
                                                            <View
                                                                style={[
                                                                    styles.progressFill,
                                                                    {
                                                                        width: `${Math.min(
                                                                            (item.progress /
                                                                                ((item.achievement.requirementJson as any).count ||
                                                                                    (item.achievement.requirementJson as any).days ||
                                                                                    (item.achievement.requirementJson as any).level ||
                                                                                    1)) *
                                                                            100,
                                                                            100
                                                                        )}%`,
                                                                        backgroundColor: '#64748B',
                                                                    },
                                                                ]}
                                                            />
                                                        </View>
                                                        <Text style={styles.progressText}>
                                                            {item.progress} /{' '}
                                                            {(item.achievement.requirementJson as any).count ||
                                                                (item.achievement.requirementJson as any).days ||
                                                                (item.achievement.requirementJson as any).level}
                                                        </Text>
                                                    </View>
                                                )}
                                                <View style={styles.achievementFooter}>
                                                    <Text
                                                        style={[
                                                            styles.rarityBadge,
                                                            {
                                                                color: item.isCompleted
                                                                    ? getRarityColor(item.achievement.rarity)
                                                                    : theme.colors.textSecondary
                                                            },
                                                        ]}
                                                    >
                                                        {item.achievement.rarity === 'COMMON' ? 'Yaygın' :
                                                            item.achievement.rarity === 'RARE' ? 'Nadir' :
                                                                item.achievement.rarity === 'EPIC' ? 'Epik' :
                                                                    item.achievement.rarity === 'LEGENDARY' ? 'Efsanevi' :
                                                                        item.achievement.rarity}
                                                    </Text>
                                                    <Text style={[
                                                        styles.pointsBadge,
                                                        !item.isCompleted && styles.pointsBadgeLocked
                                                    ]}>
                                                        +{item.achievement.points} XP
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyIcon}>🏆</Text>
                                <Text style={styles.emptyText}>Henüz rozet kazanmadınız</Text>
                                <Text style={styles.emptySubtext}>
                                    Veri girişi yaparak rozetler kazanmaya başlayın!
                                </Text>
                            </View>
                        )}
                    </>
                )}

                {/* Insights Tab */}
                {selectedTab === 'insights' && (
                    <>
                        {insightsLoading ? (
                            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
                        ) : insights && insights.length > 0 ? (
                            <View style={styles.insightsList}>
                                {insights.map((insight) => (
                                    <View key={insight.id} style={styles.insightCard}>
                                        <Text style={styles.insightTitle}>{insight.titleTr}</Text>
                                        <Text style={styles.insightMessage}>{insight.messageTr}</Text>
                                        <Text style={styles.insightDate}>
                                            {new Date(insight.createdAt).toLocaleDateString('tr-TR', {
                                                day: 'numeric',
                                                month: 'long',
                                            })}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyIcon}>💡</Text>
                                <Text style={styles.emptyText}>Henüz içgörü yok</Text>
                                <Text style={styles.emptySubtext}>
                                    Daha fazla veri girdikçe kişiselleştirilmiş içgörüler göreceksiniz
                                </Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        backButton: {
            padding: theme.spacing.sm,
        },
        backButtonText: {
            fontSize: 28,
            color: theme.colors.primary,
            fontWeight: '300',
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text,
        },
        resetButton: {
            padding: theme.spacing.sm,
        },
        resetButtonText: {
            fontSize: 14,
            color: theme.colors.error,
            fontWeight: '600',
        },
        tabs: {
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.backgroundCard,
        },
        tab: {
            flex: 1,
            paddingVertical: theme.spacing.md,
            alignItems: 'center',
        },
        tabActive: {
            borderBottomWidth: 2,
            borderBottomColor: theme.colors.primary,
        },
        tabText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            fontWeight: '500',
        },
        tabTextActive: {
            color: theme.colors.primary,
            fontWeight: '600',
        },
        container: {
            flex: 1,
        },
        contentContainer: {
            padding: theme.spacing.lg,
        },
        loader: {
            marginTop: theme.spacing.xl * 2,
        },
        levelCard: {
            borderRadius: 20,
            padding: theme.spacing.xl,
            marginBottom: theme.spacing.lg,
        },
        levelHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
        },
        levelLabel: {
            fontSize: 18,
            fontWeight: '600',
            color: '#FFFFFF',
        },
        levelNumber: {
            fontSize: 48,
            fontWeight: '700',
            color: '#FFFFFF',
        },
        xpContainer: {
            marginBottom: theme.spacing.sm,
        },
        xpBar: {
            height: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: theme.spacing.sm,
        },
        xpProgress: {
            height: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: 4,
        },
        xpText: {
            fontSize: 14,
            fontWeight: '600',
            color: '#FFFFFF',
            textAlign: 'center',
        },
        xpNeeded: {
            fontSize: 12,
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center',
        },
        card: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 20,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        cardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        cardIcon: {
            fontSize: 24,
            marginRight: theme.spacing.sm,
        },
        cardTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text,
        },
        streakContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
        },
        streakItem: {
            alignItems: 'center',
        },
        streakNumber: {
            fontSize: 36,
            fontWeight: '700',
            color: theme.colors.primary,
            marginBottom: theme.spacing.xs,
        },
        streakLabel: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        streakDivider: {
            width: 1,
            height: 40,
            backgroundColor: theme.colors.border,
        },
        statsGrid: {
            flexDirection: 'row',
            gap: theme.spacing.md,
        },
        statCard: {
            flex: 1,
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 20,
            padding: theme.spacing.lg,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        statIcon: {
            fontSize: 32,
            marginBottom: theme.spacing.sm,
        },
        statNumber: {
            fontSize: 28,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: theme.spacing.xs,
        },
        statLabel: {
            fontSize: 12,
            color: theme.colors.textSecondary,
        },
        achievementsList: {
            gap: theme.spacing.md,
        },
        achievementCard: {
            flexDirection: 'row',
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 20,
            padding: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        achievementCardLocked: {
            opacity: 0.6,
            backgroundColor: theme.colors.backgroundSecondary,
        },
        achievementIconContainer: {
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.md,
        },
        achievementIcon: {
            fontSize: 32,
        },
        achievementIconLocked: {
            opacity: 0.5,
        },
        achievementIconTextLocked: {
            opacity: 0.7,
        },
        achievementContent: {
            flex: 1,
        },
        achievementHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.xs,
        },
        achievementName: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
        },
        achievementNameLocked: {
            color: theme.colors.textSecondary,
        },
        completedBadge: {
            fontSize: 18,
            color: theme.colors.success,
        },
        achievementDescription: {
            fontSize: 13,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.sm,
        },
        achievementDescriptionLocked: {
            color: theme.colors.textLight,
        },
        progressContainer: {
            marginBottom: theme.spacing.sm,
        },
        progressBar: {
            height: 6,
            backgroundColor: theme.colors.border,
            borderRadius: 3,
            overflow: 'hidden',
            marginBottom: theme.spacing.xs,
        },
        progressFill: {
            height: '100%',
            borderRadius: 3,
        },
        progressText: {
            fontSize: 11,
            color: theme.colors.textSecondary,
        },
        achievementFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        rarityBadge: {
            fontSize: 11,
            fontWeight: '600',
        },
        pointsBadge: {
            fontSize: 11,
            fontWeight: '600',
            color: theme.colors.primary,
        },
        pointsBadgeLocked: {
            color: theme.colors.textSecondary,
        },
        infoCard: {
            backgroundColor: theme.colors.backgroundSecondary,
            borderRadius: 12,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.md,
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        infoIcon: {
            fontSize: 24,
            marginRight: theme.spacing.sm,
        },
        infoContent: {
            flex: 1,
        },
        infoTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 4,
        },
        infoText: {
            fontSize: 13,
            color: theme.colors.textSecondary,
            lineHeight: 18,
        },
        insightsList: {
            gap: theme.spacing.md,
        },
        insightCard: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 20,
            padding: theme.spacing.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        insightTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
        },
        insightMessage: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.sm,
            lineHeight: 20,
        },
        insightDate: {
            fontSize: 12,
            color: theme.colors.textLight,
        },
        emptyContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.spacing.xl * 2,
        },
        emptyIcon: {
            fontSize: 64,
            marginBottom: theme.spacing.lg,
        },
        emptyText: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
        },
        emptySubtext: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            paddingHorizontal: theme.spacing.xl,
        },
    });
