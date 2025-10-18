import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useInfiniteQuestions, useQuestions } from '@/hooks/useQna';
import { useQnaStore } from '@/store/qnaStore';
import { QuestionCard, QuestionListSkeleton, ErrorState, EmptyState, OfflineBanner } from '@/components/qna';
import { QuestionCategory, QuestionStatus, Question } from '@/types/qna';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const SORT_OPTIONS = [
    { value: 'recent', label: 'En Yeni', icon: 'time-outline' },
    { value: 'popular', label: 'Popüler', icon: 'flame-outline' },
    { value: 'unanswered', label: 'Cevaplanmamış', icon: 'help-circle-outline' },
] as const;

const CATEGORIES = [
    { value: undefined, label: 'Tümü', icon: '📋' },
    { value: QuestionCategory.MENSTRUAL_HEALTH, label: 'Adet', icon: '🩸' },
    { value: QuestionCategory.PREGNANCY, label: 'Hamilelik', icon: '🤰' },
    { value: QuestionCategory.FERTILITY, label: 'Doğurganlık', icon: '🌸' },
    { value: QuestionCategory.NUTRITION, label: 'Beslenme', icon: '🥗' },
    { value: QuestionCategory.EXERCISE, label: 'Egzersiz', icon: '💪' },
    { value: QuestionCategory.MENTAL_HEALTH, label: 'Ruh Sağlığı', icon: '🧠' },
    { value: QuestionCategory.GENERAL, label: 'Genel', icon: '💬' },
];

const STATUS_FILTERS = [
    { value: undefined, label: 'Tümü' },
    { value: QuestionStatus.OPEN, label: 'Açık' },
    { value: QuestionStatus.ANSWERED, label: 'Cevaplanmış' },
];

export default function CommunityIndexScreen() {
    const theme = useTheme();
    const router = useRouter();
    const styles = createStyles(theme);
    const { isConnected } = useNetworkStatus();

    // Store state
    const {
        filters,
        setFilters,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        selectedCategory,
        setSelectedCategory,
        getActiveFiltersCount,
    } = useQnaStore();

    // Local UI state
    const [showFilters, setShowFilters] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<QuestionStatus | undefined>(filters.status);

    // Build query filters
    const queryFilters = useMemo(() => ({
        category: selectedCategory,
        status: selectedStatus,
        sort: sortBy,
        search: searchQuery,
        limit: 10,
    }), [selectedCategory, selectedStatus, sortBy, searchQuery]);

    // Fetch questions with infinite scroll
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        refetch,
        isRefetching,
    } = useInfiniteQuestions(queryFilters);

    // Flatten paginated data
    const questions = useMemo(() => {
        return data?.pages.flatMap((page) => page.questions) || [];
    }, [data]);

    // Popular questions widget - always fetch to maintain hooks order
    const shouldShowWidget = !searchQuery && !selectedCategory && !selectedStatus;

    // Always call the hook to maintain hooks order
    const popularQuestionsQuery = useQuestions(
        {
            sort: 'popular',
            limit: 5,
        },
        {
            staleTime: 10 * 60 * 1000, // 10 minutes
            enabled: shouldShowWidget, // Only fetch when needed
        }
    );

    // Handle load more
    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Handle refresh
    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    // Handle question press
    const handleQuestionPress = useCallback((question: Question) => {
        router.push({
            pathname: '/(tabs)/community/[id]' as any,
            params: { id: question.id },
        });
    }, [router]);

    // Handle ask question
    const handleAskQuestion = useCallback(() => {
        router.push('/(tabs)/community/ask' as any);
    }, [router]);

    // Handle sort change
    const handleSortChange = useCallback((sort: typeof sortBy) => {
        setSortBy(sort);
    }, [setSortBy]);

    // Handle category change
    const handleCategoryChange = useCallback((category?: QuestionCategory) => {
        setSelectedCategory(category);
    }, [setSelectedCategory]);

    // Handle status change
    const handleStatusChange = useCallback((status?: QuestionStatus) => {
        setSelectedStatus(status);
        setFilters({ status });
    }, [setFilters]);

    // Handle notification settings
    const handleNotificationSettings = useCallback(() => {
        router.push('/(tabs)/community/notification-preferences' as any);
    }, [router]);

    // Render header
    const renderHeader = useCallback(() => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Topluluk</Text>
                    <Text style={styles.headerSubtitle}>
                        {questions.length} soru
                    </Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={handleNotificationSettings}
                        activeOpacity={0.7}
                    >
                        <Text style={{ fontSize: 22 }}>🔔</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.askButton}
                        onPress={handleAskQuestion}
                        activeOpacity={0.8}
                    >
                        <Text style={{ fontSize: 20, color: '#fff' }}>➕</Text>
                        <Text style={styles.askButtonText}>Soru Sor</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            <TouchableOpacity
                style={styles.searchContainer}
                onPress={() => router.push('/(tabs)/community/search' as any)}
                activeOpacity={0.7}
            >
                <Text style={{ fontSize: 18 }}>🔍</Text>
                <Text style={styles.searchPlaceholder}>Soru ara...</Text>
            </TouchableOpacity>

            {/* Sort Options */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.sortContainer}
                contentContainerStyle={styles.sortContent}
            >
                {SORT_OPTIONS.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        style={[
                            styles.sortChip,
                            sortBy === option.value && styles.sortChipActive,
                        ]}
                        onPress={() => handleSortChange(option.value)}
                        activeOpacity={0.7}
                    >
                        <Text style={{ fontSize: 16 }}>
                            {option.value === 'recent' ? '🕐' : option.value === 'popular' ? '🔥' : '❓'}
                        </Text>
                        <Text
                            style={[
                                styles.sortChipText,
                                sortBy === option.value && styles.sortChipTextActive,
                            ]}
                        >
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity
                    style={[
                        styles.filterButton,
                        getActiveFiltersCount() > 0 && styles.filterButtonActive,
                    ]}
                    onPress={() => setShowFilters(!showFilters)}
                    activeOpacity={0.7}
                >
                    <Text style={{ fontSize: 16 }}>🔽</Text>
                    <Text
                        style={[
                            styles.filterButtonText,
                            getActiveFiltersCount() > 0 && styles.filterButtonTextActive,
                        ]}
                    >
                        Filtrele
                    </Text>
                    {getActiveFiltersCount() > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </ScrollView>

            {/* Filters Panel */}
            {showFilters && (
                <View style={styles.filtersPanel}>
                    {/* Categories */}
                    <View style={styles.filterSection}>
                        <Text style={styles.filterSectionTitle}>Kategori</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filterChipsContainer}
                        >
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity
                                    key={cat.label}
                                    style={[
                                        styles.categoryFilterChip,
                                        selectedCategory === cat.value && styles.categoryFilterChipActive,
                                    ]}
                                    onPress={() => handleCategoryChange(cat.value)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                                    <Text
                                        style={[
                                            styles.categoryFilterText,
                                            selectedCategory === cat.value && styles.categoryFilterTextActive,
                                        ]}
                                    >
                                        {cat.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Status */}
                    <View style={styles.filterSection}>
                        <Text style={styles.filterSectionTitle}>Durum</Text>
                        <View style={styles.statusFilters}>
                            {STATUS_FILTERS.map((status) => (
                                <TouchableOpacity
                                    key={status.label}
                                    style={[
                                        styles.statusChip,
                                        selectedStatus === status.value && styles.statusChipActive,
                                    ]}
                                    onPress={() => handleStatusChange(status.value)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.statusChipText,
                                            selectedStatus === status.value && styles.statusChipTextActive,
                                        ]}
                                    >
                                        {status.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            )}

            {/* Popular Questions Widget */}
            {shouldShowWidget && popularQuestionsQuery.data?.questions.length > 0 && (
                <View style={styles.widgetContainer}>
                    <View style={styles.popularContainer}>
                        <View style={styles.popularHeader}>
                            <Text style={styles.popularTitle}>Popüler Sorular</Text>
                            <TouchableOpacity onPress={() => router.push({
                                pathname: '/(tabs)/community/search' as any,
                                params: { sort: 'popular' },
                            })}>
                                <Text style={styles.seeAllText}>Tümünü Gör</Text>
                            </TouchableOpacity>
                        </View>
                        {popularQuestionsQuery.data.questions.slice(0, 5).map((question, index) => (
                            <TouchableOpacity
                                key={question.id}
                                style={[
                                    styles.popularQuestionItem,
                                    index !== popularQuestionsQuery.data.questions.slice(0, 5).length - 1 && styles.popularQuestionBorder,
                                ]}
                                onPress={() => router.push({
                                    pathname: '/(tabs)/community/[id]' as any,
                                    params: { id: question.id },
                                })}
                            >
                                <View style={styles.popularQuestionContent}>
                                    <Text style={styles.popularQuestionTitle} numberOfLines={2}>
                                        {question.title}
                                    </Text>
                                    <View style={styles.popularQuestionMeta}>
                                        <View style={styles.popularMetaItem}>
                                            <Text style={{ fontSize: 14 }}>💬</Text>
                                            <Text style={styles.popularMetaText}>{question._count?.answers || 0}</Text>
                                        </View>
                                        <View style={styles.popularMetaItem}>
                                            <Text style={{ fontSize: 14 }}>👁️</Text>
                                            <Text style={styles.popularMetaText}>{question.viewCount}</Text>
                                        </View>
                                    </View>
                                </View>
                                <Text style={{ fontSize: 20 }}>➡️</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </View>
    ), [styles, questions.length, theme.colors, router, sortBy, getActiveFiltersCount, showFilters, selectedCategory, selectedStatus, searchQuery, handleNotificationSettings, handleAskQuestion, handleSortChange, handleCategoryChange, handleStatusChange, shouldShowWidget, popularQuestionsQuery.data]);

    // Render empty state
    const renderEmpty = useCallback(() => {
        if (isLoading) return <QuestionListSkeleton count={5} />;

        return (
            <EmptyState
                type="questions"
                actionLabel="Soru Sor"
                onAction={handleAskQuestion}
            />
        );
    }, [isLoading, handleAskQuestion]);

    // Render footer
    const renderFooter = useCallback(() => {
        if (!isFetchingNextPage) return null;

        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    }, [isFetchingNextPage, styles.footer, theme.colors.primary]);

    // Memoized render item - MUST be before early return
    const renderItem = useCallback(({ item }: { item: Question }) => (
        <QuestionCard
            question={item}
            onPress={() => handleQuestionPress(item)}
        />
    ), [handleQuestionPress]);

    // Memoized key extractor - MUST be before early return
    const keyExtractor = useCallback((item: Question) => item.id, []);

    // Render error state - AFTER all hooks
    if (isError) {
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

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <OfflineBanner />
            <FlatList
                data={questions}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.listContent}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefetching}
                        onRefresh={handleRefresh}
                        tintColor={theme.colors.primary}
                    />
                }
                showsVerticalScrollIndicator={false}
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
        listContainer: {
            flex: 1,
        },
        listContent: {
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: 100,
        },
        header: {
            marginBottom: theme.spacing.lg,
        },
        headerTop: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
        },
        headerTitleContainer: {
            flex: 1,
        },
        headerTitle: {
            fontSize: 28,
            fontWeight: '800',
            color: theme.colors.text,
        },
        headerSubtitle: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginTop: 4,
        },
        headerActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
        },
        notificationButton: {
            width: 44,
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        askButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: 12,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
        askButtonText: {
            fontSize: 14,
            fontWeight: '700',
            color: '#fff',
        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.backgroundCard,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
            marginBottom: theme.spacing.md,
            gap: theme.spacing.sm,
        },
        searchPlaceholder: {
            flex: 1,
            fontSize: 16,
            color: theme.colors.textSecondary,
            paddingVertical: 8,
        },
        sortContainer: {
            maxHeight: 50,
            marginBottom: theme.spacing.md,
        },
        sortContent: {
            gap: theme.spacing.sm,
        },
        sortChip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: 20,
            backgroundColor: theme.colors.backgroundCard,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        sortChipActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        sortChipText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.textSecondary,
        },
        sortChipTextActive: {
            color: '#fff',
        },
        filterButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: 20,
            backgroundColor: theme.colors.backgroundCard,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        filterButtonActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        filterButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.textSecondary,
        },
        filterButtonTextActive: {
            color: '#fff',
        },
        filterBadge: {
            backgroundColor: '#fff',
            borderRadius: 10,
            width: 20,
            height: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 4,
        },
        filterBadgeText: {
            fontSize: 11,
            fontWeight: '700',
            color: theme.colors.primary,
        },
        filtersPanel: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 16,
            padding: theme.spacing.lg,
            marginTop: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        filterSection: {
            marginBottom: theme.spacing.lg,
        },
        filterSectionTitle: {
            fontSize: 14,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
        },
        filterChipsContainer: {
            gap: theme.spacing.sm,
        },
        categoryFilterChip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: 20,
            backgroundColor: theme.colors.background,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        categoryFilterChipActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        categoryIcon: {
            fontSize: 16,
        },
        categoryFilterText: {
            fontSize: 13,
            fontWeight: '600',
            color: theme.colors.text,
        },
        categoryFilterTextActive: {
            color: '#fff',
        },
        statusFilters: {
            flexDirection: 'row',
            gap: theme.spacing.sm,
        },
        statusChip: {
            flex: 1,
            paddingVertical: theme.spacing.sm,
            borderRadius: 12,
            backgroundColor: theme.colors.background,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: 'center',
        },
        statusChipActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        statusChipText: {
            fontSize: 13,
            fontWeight: '600',
            color: theme.colors.text,
        },
        statusChipTextActive: {
            color: '#fff',
        },
        emptyState: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.spacing.xl * 3,
        },
        emptyTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.text,
            marginTop: theme.spacing.lg,
            marginBottom: theme.spacing.sm,
        },
        emptyText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            paddingHorizontal: theme.spacing.xl,
        },
        footer: {
            paddingVertical: theme.spacing.lg,
            alignItems: 'center',
        },
        errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.xl,
        },
        errorTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.text,
            marginTop: theme.spacing.lg,
            marginBottom: theme.spacing.sm,
        },
        errorText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginBottom: theme.spacing.xl,
        },
        retryButton: {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.md,
            borderRadius: 12,
        },
        retryButtonText: {
            fontSize: 16,
            fontWeight: '700',
            color: '#fff',
        },
        loadingOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        widgetContainer: {
            marginTop: theme.spacing.md,
        },
        popularContainer: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 12,
            padding: 16,
        },
        popularHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        popularTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text,
        },
        seeAllText: {
            fontSize: 14,
            color: theme.colors.primary,
            fontWeight: '600',
        },
        popularQuestionItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
        },
        popularQuestionBorder: {
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        popularQuestionContent: {
            flex: 1,
            marginRight: 12,
        },
        popularQuestionTitle: {
            fontSize: 15,
            fontWeight: '500',
            color: theme.colors.text,
            marginBottom: 8,
        },
        popularQuestionMeta: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        popularMetaItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        popularMetaText: {
            fontSize: 12,
            color: theme.colors.textSecondary,
        },
    });
