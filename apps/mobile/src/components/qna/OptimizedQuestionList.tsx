import React, { useCallback, memo } from 'react';
import { View, StyleSheet, RefreshControl, FlatList } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Question } from '@/types/qna';
import { QuestionCard } from './QuestionCard';
import { QuestionListSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';

interface OptimizedQuestionListProps {
    questions: Question[];
    isLoading?: boolean;
    isFetchingNextPage?: boolean;
    hasNextPage?: boolean;
    isRefetching?: boolean;
    onLoadMore?: () => void;
    onRefresh?: () => void;
    onQuestionPress: (question: Question) => void;
    ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
    ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
    emptyStateType?: 'questions' | 'search' | 'favorites';
    onEmptyAction?: () => void;
}

/**
 * Optimized Question List using FlatList for better performance
 * 
 * Features:
 * - List virtualization with FlatList
 * - Memoized components to prevent unnecessary re-renders
 * - Pull-to-refresh support
 * - Infinite scroll support
 */
export const OptimizedQuestionList = memo(function OptimizedQuestionList({
    questions,
    isLoading = false,
    isFetchingNextPage = false,
    hasNextPage = false,
    isRefetching = false,
    onLoadMore,
    onRefresh,
    onQuestionPress,
    ListHeaderComponent,
    ListEmptyComponent,
    emptyStateType = 'questions',
    onEmptyAction,
}: OptimizedQuestionListProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    // Memoized render item
    const renderItem = useCallback(
        ({ item }: { item: Question }) => (
            <QuestionCard
                question={item}
                onPress={() => onQuestionPress(item)}
            />
        ),
        [onQuestionPress]
    );

    // Memoized key extractor
    const keyExtractor = useCallback((item: Question) => item.id, []);

    // Memoized empty component
    const renderEmpty = useCallback(() => {
        if (isLoading) {
            return <QuestionListSkeleton count={5} />;
        }

        if (ListEmptyComponent) {
            return typeof ListEmptyComponent === 'function'
                ? <ListEmptyComponent />
                : ListEmptyComponent;
        }

        return (
            <EmptyState
                type={emptyStateType}
                actionLabel="Soru Sor"
                onAction={onEmptyAction}
            />
        );
    }, [isLoading, ListEmptyComponent, emptyStateType, onEmptyAction]);

    // Memoized footer component
    const renderFooter = useCallback(() => {
        if (!isFetchingNextPage) return null;
        return <QuestionListSkeleton count={2} />;
    }, [isFetchingNextPage]);

    // Handle end reached
    const handleEndReached = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage && onLoadMore) {
            onLoadMore();
        }
    }, [hasNextPage, isFetchingNextPage, onLoadMore]);

    // Refresh control
    const refreshControl = onRefresh ? (
        <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
        />
    ) : undefined;

    return (
        <View style={styles.container}>
            <FlatList
                data={questions}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={ListHeaderComponent}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                refreshControl={refreshControl}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            />
        </View>
    );
});

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        contentContainer: {
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: 100,
        },
    });
