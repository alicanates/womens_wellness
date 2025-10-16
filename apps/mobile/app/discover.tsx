import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState, useCallback, useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { ArticleCard } from '@/components/discover/ArticleCard';
import { SearchBar } from '@/components/discover/SearchBar';
import { useInfiniteArticles, useSavedArticles, useToggleSave } from '@/hooks/useDiscover';

const CATEGORIES = [
    { id: 'all', label: 'Tümü' },
    { id: 'menstrual_health', label: 'Regl Sağlığı' },
    { id: 'pregnancy', label: 'Hamilelik' },
    { id: 'fertility', label: 'Doğurganlık' },
    { id: 'nutrition', label: 'Beslenme' },
    { id: 'exercise', label: 'Egzersiz' },
    { id: 'mental_health', label: 'Mental Sağlık' },
    { id: 'sleep', label: 'Uyku' },
    { id: 'hydration', label: 'Hidrasyon' },
];

export default function DiscoverScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const styles = createStyles(theme);

    // Fetch all articles with infinite scroll
    const {
        data: articlesData,
        isLoading: isLoadingArticles,
        isError: isErrorArticles,
        error: errorArticles,
        refetch: refetchArticles,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteArticles(
        {
            category: selectedCategory === 'all' ? undefined : selectedCategory,
            search: searchQuery || undefined,
            locale: 'tr',
            limit: 20,
        },
        {
            enabled: activeTab === 'all',
            retry: 2, // Retry failed requests twice
            retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
        }
    );

    // Flatten paginated data
    const allArticles = useMemo(() => {
        return articlesData?.pages.flatMap((page: any) => page.articles) || [];
    }, [articlesData]);

    // Fetch saved articles
    const {
        data: savedArticles,
        isLoading: isLoadingSaved,
        isError: isErrorSaved,
        error: errorSaved,
        refetch: refetchSaved,
    } = useSavedArticles('tr', {
        enabled: activeTab === 'saved',
        retry: 2,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    // Toggle save mutation
    const toggleSaveMutation = useToggleSave();

    const articles = activeTab === 'all' ? allArticles : savedArticles;
    const isLoading = activeTab === 'all' ? isLoadingArticles : isLoadingSaved;
    const isError = activeTab === 'all' ? isErrorArticles : isErrorSaved;
    const error = activeTab === 'all' ? errorArticles : errorSaved;

    // Handlers
    const handleCategoryChange = useCallback((category: string) => {
        setSelectedCategory(category);
    }, []);

    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const handleTabChange = useCallback((tab: 'all' | 'saved') => {
        setActiveTab(tab);
    }, []);

    // Load more articles (infinite scroll)
    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage && activeTab === 'all') {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, activeTab, fetchNextPage]);

    // Pull to refresh
    const handleRefresh = useCallback(() => {
        if (activeTab === 'all') {
            refetchArticles();
        } else {
            refetchSaved();
        }
    }, [activeTab, refetchArticles, refetchSaved]);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Keşfet</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <SearchBar value={searchQuery} onChange={handleSearchChange} />
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'all' && styles.tabActive]}
                        onPress={() => handleTabChange('all')}
                    >
                        <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
                            Tümü
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
                        onPress={() => handleTabChange('saved')}
                    >
                        <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
                            Kaydedilenler
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Category Filter (only for "all" tab) */}
                {activeTab === 'all' && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesContainer}
                    >
                        {CATEGORIES.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.categoryChip,
                                    selectedCategory === category.id && styles.categoryChipActive,
                                ]}
                                onPress={() => handleCategoryChange(category.id)}
                            >
                                <Text
                                    style={[
                                        styles.categoryChipText,
                                        selectedCategory === category.id && styles.categoryChipTextActive,
                                    ]}
                                >
                                    {category.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* Articles List */}
                {isError ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorIcon}>⚠️</Text>
                        <Text style={styles.errorText}>
                            Makaleler yüklenirken bir hata oluştu
                        </Text>
                        <Text style={styles.errorSubtext}>
                            {error instanceof Error ? error.message : 'Lütfen tekrar deneyin'}
                        </Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => activeTab === 'all' ? refetchArticles() : refetchSaved()}
                        >
                            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={articles || []}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.articleWrapper}>
                                <ArticleCard
                                    article={item}
                                    onPress={() => router.push(`/discover/article/${item.id}`)}
                                    onSave={() => toggleSaveMutation.mutate(item.id)}
                                    variant="vertical"
                                />
                            </View>
                        )}
                        contentContainerStyle={styles.articlesContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={isLoading}
                                onRefresh={handleRefresh}
                                tintColor={theme.colors.primary}
                                colors={[theme.colors.primary]}
                            />
                        }
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        ListEmptyComponent={
                            isLoading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={theme.colors.primary} />
                                    <Text style={styles.loadingText}>Makaleler yükleniyor...</Text>
                                </View>
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyIcon}>📚</Text>
                                    <Text style={styles.emptyText}>
                                        {activeTab === 'saved'
                                            ? 'Henüz kaydedilmiş makale yok'
                                            : searchQuery
                                                ? 'Arama sonucu bulunamadı'
                                                : 'Makale bulunamadı'}
                                    </Text>
                                    {searchQuery && (
                                        <Text style={styles.emptySubtext}>
                                            Farklı bir arama terimi deneyin
                                        </Text>
                                    )}
                                </View>
                            )
                        }
                        ListFooterComponent={
                            isFetchingNextPage && articles && articles.length > 0 ? (
                                <View style={styles.footerLoader}>
                                    <ActivityIndicator size="small" color={theme.colors.primary} />
                                    <Text style={styles.footerLoaderText}>Daha fazla yükleniyor...</Text>
                                </View>
                            ) : null
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        container: {
            flex: 1,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
        },
        backButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
        },
        backIcon: {
            fontSize: 24,
            color: theme.colors.text,
        },
        title: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.text,
        },
        headerSpacer: {
            width: 40,
        },
        searchContainer: {
            paddingHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.md,
        },
        tabs: {
            flexDirection: 'row',
            paddingHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.md,
            gap: theme.spacing.sm,
        },
        tab: {
            flex: 1,
            paddingVertical: theme.spacing.sm,
            alignItems: 'center',
            borderRadius: 8,
            backgroundColor: theme.colors.backgroundCard,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        tabActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        tabText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.textSecondary,
        },
        tabTextActive: {
            color: theme.colors.textOnPrimary,
        },
        categoriesContainer: {
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: theme.spacing.md,
            gap: theme.spacing.sm,
        },
        categoryChip: {
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: 20,
            backgroundColor: theme.colors.backgroundCard,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        categoryChipActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        categoryChipText: {
            fontSize: 13,
            fontWeight: '600',
            color: theme.colors.textSecondary,
        },
        categoryChipTextActive: {
            color: theme.colors.textOnPrimary,
        },
        articlesScroll: {
            flex: 1,
        },
        articlesContent: {
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: theme.spacing.xl,
        },
        articleWrapper: {
            marginBottom: theme.spacing.md,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: theme.spacing.xl * 2,
        },
        loadingText: {
            marginTop: theme.spacing.md,
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: theme.spacing.xl * 2,
            paddingHorizontal: theme.spacing.xl,
        },
        emptyIcon: {
            fontSize: 48,
            marginBottom: theme.spacing.md,
        },
        emptyText: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            textAlign: 'center',
            marginBottom: theme.spacing.xs,
        },
        emptySubtext: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
        errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: theme.spacing.xl * 2,
            paddingHorizontal: theme.spacing.xl,
        },
        errorIcon: {
            fontSize: 48,
            marginBottom: theme.spacing.md,
        },
        errorText: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            textAlign: 'center',
            marginBottom: theme.spacing.xs,
        },
        errorSubtext: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginBottom: theme.spacing.lg,
        },
        retryButton: {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            borderRadius: 12,
        },
        retryButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.textOnPrimary,
        },
        footerLoader: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: theme.spacing.lg,
            gap: theme.spacing.sm,
        },
        footerLoaderText: {
            fontSize: 13,
            color: theme.colors.textSecondary,
        },
    });
