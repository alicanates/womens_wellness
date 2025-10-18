import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    FlatList,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuestions } from '@/hooks/useQna';
import { QuestionCard } from '@/components/qna/QuestionCard';
import { CategoryPill } from '@/components/qna/CategoryPill';
import { QuestionCategory, QuestionFilters, Question } from '@/types/qna';
import { useAdvancedDebounce } from '@/hooks/useDebounce';

const POPULAR_TAGS = [
    'adet-ağrısı',
    'hamilelik',
    'ovulasyon',
    'doğum-kontrolü',
    'pms',
    'menopoz',
    'beslenme',
    'egzersiz',
    'uyku',
];

const CATEGORIES = [
    { key: QuestionCategory.MENSTRUAL_HEALTH, label: 'Adet Sağlığı', icon: 'water' },
    { key: QuestionCategory.PREGNANCY, label: 'Hamilelik', icon: 'heart' },
    { key: QuestionCategory.FERTILITY, label: 'Doğurganlık', icon: 'flower' },
    { key: QuestionCategory.NUTRITION, label: 'Beslenme', icon: 'nutrition' },
    { key: QuestionCategory.EXERCISE, label: 'Egzersiz', icon: 'fitness' },
    { key: QuestionCategory.MENTAL_HEALTH, label: 'Ruh Sağlığı', icon: 'happy' },
    { key: QuestionCategory.SLEEP, label: 'Uyku', icon: 'moon' },
    { key: QuestionCategory.CONTRACEPTION, label: 'Doğum Kontrolü', icon: 'shield' },
    { key: QuestionCategory.PMS, label: 'PMS', icon: 'sad' },
    { key: QuestionCategory.MENOPAUSE, label: 'Menopoz', icon: 'thermometer' },
    { key: QuestionCategory.SEXUAL_HEALTH, label: 'Cinsel Sağlık', icon: 'rose' },
    { key: QuestionCategory.GENERAL, label: 'Genel', icon: 'help-circle' },
];

export default function SearchScreen() {
    const params = useLocalSearchParams<{ q?: string; category?: string }>();
    const [searchQuery, setSearchQuery] = useState(params.q || '');
    const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | undefined>(
        params.category as QuestionCategory | undefined
    );
    const [selectedSort, setSelectedSort] = useState<'recent' | 'popular' | 'unanswered'>('recent');

    const { debouncedValue: debouncedSearch, isDebouncing } = useAdvancedDebounce(searchQuery, 500);

    // CRITICAL FIX: Stabilize enabled flag to prevent hook count changes
    const hasSearchCriteria = useMemo(() => {
        return (debouncedSearch && debouncedSearch.length > 0) || !!selectedCategory;
    }, [debouncedSearch, selectedCategory]);

    const filters: QuestionFilters = useMemo(() => {
        const f: QuestionFilters = {
            sort: selectedSort,
            limit: 20,
        };
        if (debouncedSearch) f.search = debouncedSearch;
        if (selectedCategory) f.category = selectedCategory;
        return f;
    }, [debouncedSearch, selectedCategory, selectedSort]);

    const {
        data,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
    } = useInfiniteQuestions(filters, {
        enabled: hasSearchCriteria,
    });

    const questions = useMemo(() => {
        return data?.pages.flatMap((page) => page.questions) || [];
    }, [data]);

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const handleCategorySelect = (category: QuestionCategory) => {
        if (selectedCategory === category) {
            setSelectedCategory(undefined);
        } else {
            setSelectedCategory(category);
        }
    };

    const handleTagPress = (tag: string) => {
        setSearchQuery(tag);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSelectedCategory(undefined);
    };

    const renderSearchSuggestions = () => {
        if (searchQuery.length > 0 || selectedCategory) return null;

        return (
            <View style={styles.suggestionsContainer}>
                <Text style={styles.sectionTitle}>Popüler Etiketler</Text>
                <View style={styles.tagsContainer}>
                    {POPULAR_TAGS.map((tag) => (
                        <TouchableOpacity
                            key={tag}
                            style={styles.tagChip}
                            onPress={() => handleTagPress(tag)}
                        >
                            <Ionicons name="pricetag" size={14} color="#8B5CF6" />
                            <Text style={styles.tagText}>{tag}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

    const renderCategoryBrowser = () => {
        if (searchQuery.length > 0) return null;

        return (
            <View style={styles.categoryBrowserContainer}>
                <Text style={styles.sectionTitle}>Kategorilere Göz At</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesScroll}
                >
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.key}
                            style={[
                                styles.categoryCard,
                                selectedCategory === cat.key && styles.categoryCardSelected,
                            ]}
                            onPress={() => handleCategorySelect(cat.key)}
                        >
                            <Ionicons
                                name={cat.icon as any}
                                size={24}
                                color={selectedCategory === cat.key ? '#8B5CF6' : '#6B7280'}
                            />
                            <Text
                                style={[
                                    styles.categoryLabel,
                                    selectedCategory === cat.key && styles.categoryLabelSelected,
                                ]}
                            >
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderSortOptions = () => {
        if (!debouncedSearch && !selectedCategory) return null;

        return (
            <View style={styles.sortContainer}>
                <TouchableOpacity
                    style={[styles.sortButton, selectedSort === 'recent' && styles.sortButtonActive]}
                    onPress={() => setSelectedSort('recent')}
                >
                    <Text
                        style={[styles.sortText, selectedSort === 'recent' && styles.sortTextActive]}
                    >
                        En Yeni
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.sortButton, selectedSort === 'popular' && styles.sortButtonActive]}
                    onPress={() => setSelectedSort('popular')}
                >
                    <Text
                        style={[styles.sortText, selectedSort === 'popular' && styles.sortTextActive]}
                    >
                        Popüler
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.sortButton,
                        selectedSort === 'unanswered' && styles.sortButtonActive,
                    ]}
                    onPress={() => setSelectedSort('unanswered')}
                >
                    <Text
                        style={[styles.sortText, selectedSort === 'unanswered' && styles.sortTextActive]}
                    >
                        Cevaplanmamış
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderEmptyState = () => {
        if (isLoading) return null;

        if (!debouncedSearch && !selectedCategory) {
            return null; // Show suggestions instead
        }

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>Sonuç Bulunamadı</Text>
                <Text style={styles.emptyText}>
                    {debouncedSearch
                        ? `"${debouncedSearch}" için sonuç bulunamadı`
                        : 'Bu kategoride soru bulunamadı'}
                </Text>
                <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
                    <Text style={styles.clearButtonText}>Aramayı Temizle</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderFooter = () => {
        if (!isFetchingNextPage) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#8B5CF6" />
            </View>
        );
    };

    // Memoized render item
    const renderItem = useCallback(({ item }: { item: Question }) => (
        <QuestionCard
            question={item}
            onPress={() => router.push(`/(tabs)/community/${item.id}` as any)}
        />
    ), []);

    // Memoized key extractor
    const keyExtractor = useCallback((item: Question) => item.id, []);

    return (
        <View style={styles.container}>
            {/* Search Header */}
            <View style={styles.searchHeader}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Soru ara..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                        returnKeyType="search"
                    />
                    {(searchQuery.length > 0 || isDebouncing) && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
                            {isDebouncing ? (
                                <ActivityIndicator size="small" color="#9CA3AF" />
                            ) : (
                                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Content */}
            <FlatList
                data={questions}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                ListHeaderComponent={
                    <>
                        {renderSearchSuggestions()}
                        {renderCategoryBrowser()}
                        {renderSortOptions()}
                    </>
                }
                ListEmptyComponent={renderEmptyState()}
                ListFooterComponent={renderFooter()}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshing={isLoading}
                onRefresh={refetch}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    listContainer: {
        flex: 1,
    },
    searchHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        marginRight: 12,
    },
    searchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
    },
    clearIcon: {
        marginLeft: 8,
    },
    listContent: {
        flexGrow: 1,
    },
    suggestionsContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        gap: 4,
    },
    tagText: {
        fontSize: 14,
        color: '#4B5563',
    },
    categoryBrowserContainer: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        marginBottom: 8,
    },
    categoriesScroll: {
        gap: 12,
    },
    categoryCard: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        padding: 16,
        width: 100,
        height: 100,
    },
    categoryCardSelected: {
        backgroundColor: '#F3E8FF',
        borderColor: '#8B5CF6',
    },
    categoryLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
    },
    categoryLabelSelected: {
        color: '#8B5CF6',
        fontWeight: '600',
    },
    sortContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        gap: 8,
        marginBottom: 8,
    },
    sortButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
    },
    sortButtonActive: {
        backgroundColor: '#8B5CF6',
    },
    sortText: {
        fontSize: 14,
        color: '#6B7280',
    },
    sortTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    clearButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#8B5CF6',
        borderRadius: 8,
    },
    clearButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});
