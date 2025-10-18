import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useMyQuestions, useReputation } from '@/hooks/useQna';
import {
    QuestionCard,
    QuestionListSkeleton,
    ErrorState,
    EmptyState,
    OfflineBanner,
} from '@/components/qna';
import { ReputationCard } from '@/components/qna/ReputationCard';
import { BadgeCard } from '@/components/qna/BadgeCard';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export default function MyQuestionsScreen() {
    const theme = useTheme();
    const styles = createStyles(theme);
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const { isConnected } = useNetworkStatus();

    const { data: questionsData, isLoading, error, refetch } = useMyQuestions(1, 20);
    const { data: reputationData } = useReputation();

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handleQuestionPress = (questionId: string) => {
        router.push(`/community/${questionId}`);
    };

    const handleAskQuestion = () => {
        router.push('/community/ask');
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

    const questions = questionsData?.questions || [];

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <OfflineBanner />
            <FlatList
                data={questions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <QuestionCard
                        question={item}
                        onPress={() => handleQuestionPress(item.id)}
                    />
                )}
                ListHeaderComponent={
                    <>
                        <View style={styles.header}>
                            <Text style={styles.title}>Sorularım</Text>
                        </View>

                        {reputationData?.reputation && (
                            <ReputationCard reputation={reputationData.reputation} />
                        )}

                        {reputationData?.badges && reputationData.badges.length > 0 && (
                            <BadgeCard badges={reputationData.badges} />
                        )}

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>
                                Sorularım ({questions.length})
                            </Text>
                        </View>
                    </>
                }
                ListEmptyComponent={
                    isLoading ? (
                        <QuestionListSkeleton count={3} />
                    ) : (
                        <EmptyState
                            type="questions"
                            title="Henüz Soru Sormadınız"
                            message="Topluluğa ilk sorunuzu sorun ve cevaplar almaya başlayın"
                            actionLabel="Soru Sor"
                            onAction={handleAskQuestion}
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
