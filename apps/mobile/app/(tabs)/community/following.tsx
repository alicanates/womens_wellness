import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useFollowingQuestions } from '@/hooks/useQna';
import {
    QuestionCard,
    QuestionListSkeleton,
    ErrorState,
    EmptyState,
    OfflineBanner,
} from '@/components/qna';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export default function FollowingScreen() {
    const theme = useTheme();
    const styles = createStyles(theme);
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const { isConnected } = useNetworkStatus();

    const { data: questionsData, isLoading, error, refetch } = useFollowingQuestions(1, 20);

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

    const handleQuestionPress = (questionId: string) => {
        router.push(`/community/${questionId}`);
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
                    <View style={styles.header}>
                        <View style={styles.titleRow}>
                            <Ionicons name="notifications" size={28} color={theme.colors.primary} />
                            <Text style={styles.title}>Takip Ettiklerim</Text>
                        </View>
                        <Text style={styles.subtitle}>
                            Takip ettiğiniz sorular ve güncellemeler
                        </Text>
                        {questions.length > 0 && (
                            <View style={styles.countBadge}>
                                <Text style={styles.countText}>{questions.length} soru</Text>
                            </View>
                        )}
                    </View>
                }
                ListEmptyComponent={
                    isLoading ? (
                        <QuestionListSkeleton count={3} />
                    ) : (
                        <EmptyState
                            type="following"
                            message="İlginizi çeken soruları takip ederek yeni cevaplardan haberdar olabilirsiniz"
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
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.xs,
        },
        title: {
            fontSize: 28,
            fontWeight: '800',
            color: theme.colors.text,
        },
        subtitle: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.md,
        },
        countBadge: {
            alignSelf: 'flex-start',
            backgroundColor: theme.colors.primary + '20',
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.xs,
            borderRadius: 20,
        },
        countText: {
            fontSize: 13,
            fontWeight: '600',
            color: theme.colors.primary,
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
