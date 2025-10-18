import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useMyAnswers, useReputation } from '@/hooks/useQna';
import {
    AnswerListItem,
    AnswerListSkeleton,
    ErrorState,
    EmptyState,
    OfflineBanner,
} from '@/components/qna';
import { ReputationCard } from '@/components/qna/ReputationCard';
import { BadgeCard } from '@/components/qna/BadgeCard';
import { useState } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export default function MyAnswersScreen() {
    const theme = useTheme();
    const styles = createStyles(theme);
    const [refreshing, setRefreshing] = useState(false);
    const { isConnected } = useNetworkStatus();

    const { data: answers, isLoading, error, refetch } = useMyAnswers(1, 20);
    const { data: reputationData } = useReputation();

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    if (error) {
        const errorType = !isConnected ? 'network' : 'server';
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <OfflineBanner />
                <ErrorState
                    type={errorType}
                    onRetry={() => refetch()}
                />
            </SafeAreaView>
        );
    }

    const answersList = answers || [];
    const bestAnswersCount = answersList.filter(a => a.isBestAnswer).length;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <OfflineBanner />
            <FlatList
                data={answersList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <AnswerListItem answer={item} />}
                ListHeaderComponent={
                    <>
                        <View style={styles.header}>
                            <Text style={styles.title}>Cevaplarım</Text>
                        </View>

                        {reputationData?.reputation && (
                            <ReputationCard reputation={reputationData.reputation} />
                        )}

                        {reputationData?.badges && reputationData.badges.length > 0 && (
                            <BadgeCard badges={reputationData.badges} />
                        )}

                        <View style={styles.statsRow}>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{answersList.length}</Text>
                                <Text style={styles.statLabel}>Toplam Cevap</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={[styles.statValue, styles.statValueSuccess]}>
                                    {bestAnswersCount}
                                </Text>
                                <Text style={styles.statLabel}>En İyi Cevap</Text>
                            </View>
                        </View>

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                Tüm Cevaplarım ({answersList.length})
                            </Text>
                        </View>
                    </>
                }
                ListEmptyComponent={
                    isLoading ? (
                        <AnswerListSkeleton count={3} />
                    ) : (
                        <EmptyState
                            type="answers"
                            title="Henüz Cevap Vermediniz"
                            message="Topluluktaki sorulara cevap vererek bilginizi paylaşın"
                        />
                    )
                }
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={theme.colors.primary}
                    />
                }
            />
        </SafeAreaView>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors.background,
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
            padding: theme.spacing.xl,
        },
        errorText: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text,
            marginTop: theme.spacing.md,
            marginBottom: theme.spacing.xs,
        },
        errorSubtext: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
        listContent: {
            padding: theme.spacing.lg,
        },
        header: {
            marginBottom: theme.spacing.lg,
        },
        title: {
            fontSize: 28,
            fontWeight: '800',
            color: theme.colors.text,
        },
        statsRow: {
            flexDirection: 'row',
            gap: theme.spacing.md,
            marginBottom: theme.spacing.lg,
        },
        statCard: {
            flex: 1,
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 16,
            padding: theme.spacing.lg,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
        },
        statValue: {
            fontSize: 32,
            fontWeight: '800',
            color: theme.colors.primary,
            marginBottom: theme.spacing.xs,
        },
        statValueSuccess: {
            color: theme.colors.success,
        },
        statLabel: {
            fontSize: 13,
            color: theme.colors.textSecondary,
            fontWeight: '500',
        },
        sectionHeader: {
            marginBottom: theme.spacing.md,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.text,
        },
        emptyState: {
            alignItems: 'center',
            paddingVertical: theme.spacing.xxl,
        },
        emptyText: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.lg,
            marginBottom: theme.spacing.xs,
        },
        emptySubtext: {
            fontSize: 14,
            color: theme.colors.textLight,
            textAlign: 'center',
            paddingHorizontal: theme.spacing.xl,
        },
    });
