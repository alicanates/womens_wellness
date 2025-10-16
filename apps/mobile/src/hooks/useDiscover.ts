import { useQuery, useMutation, useQueryClient, UseQueryOptions, useInfiniteQuery } from '@tanstack/react-query';
import { discoverService, ArticleCardDto, PaginatedArticlesDto } from '@/services/api';

// Query keys
export const discoverKeys = {
    all: ['discover'] as const,
    articles: (filters?: ArticleFilters) => ['discover', 'articles', filters] as const,
    savedArticles: () => ['discover', 'saved'] as const,
    article: (id: string) => ['discover', 'article', id] as const,
    preferences: () => ['discover', 'preferences'] as const,
};

export interface ArticleFilters {
    category?: string;
    search?: string;
    locale?: string;
    page?: number;
    limit?: number;
}

/**
 * Hook to fetch articles with filters
 * Supports pagination, category filtering, and search
 */
export function useArticles(
    filters: ArticleFilters = {},
    options?: Omit<UseQueryOptions<PaginatedArticlesDto>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: discoverKeys.articles(filters),
        queryFn: () => discoverService.getArticles(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
}

/**
 * Hook to fetch articles with infinite scroll
 * Optimized for large lists with pagination
 */
export function useInfiniteArticles(
    filters: Omit<ArticleFilters, 'page'> = {},
    options?: any
) {
    return useInfiniteQuery<PaginatedArticlesDto>({
        queryKey: discoverKeys.articles(filters),
        queryFn: ({ pageParam = 1 }) =>
            discoverService.getArticles({ ...filters, page: pageParam as number }),
        getNextPageParam: (lastPage: PaginatedArticlesDto) => {
            if (lastPage.hasMore) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
        ...options,
    });
}

/**
 * Hook to fetch saved articles
 */
export function useSavedArticles(
    locale: string = 'tr',
    options?: Omit<UseQueryOptions<ArticleCardDto[]>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: discoverKeys.savedArticles(),
        queryFn: () => discoverService.getSavedArticles(locale),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
}

/**
 * Hook to fetch a single article detail
 */
export function useArticle(
    id: string,
    locale: string = 'tr',
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: discoverKeys.article(id),
        queryFn: () => discoverService.getArticle(id, locale),
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    });
}

/**
 * Hook to toggle save/unsave article
 * Automatically invalidates relevant queries
 */
export function useToggleSave() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (articleId: string) => discoverService.toggleSave(articleId),
        onMutate: async (articleId) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: discoverKeys.all });

            // Snapshot previous values
            const previousArticles = queryClient.getQueriesData({ queryKey: discoverKeys.all });

            // Optimistically update all article queries
            queryClient.setQueriesData<PaginatedArticlesDto>(
                { queryKey: ['discover', 'articles'] },
                (old) => {
                    if (!old) return old;
                    return {
                        ...old,
                        articles: old.articles.map((article) =>
                            article.id === articleId
                                ? { ...article, isSaved: !article.isSaved }
                                : article
                        ),
                    };
                }
            );

            // Optimistically update saved articles
            queryClient.setQueriesData<ArticleCardDto[]>(
                { queryKey: discoverKeys.savedArticles() },
                (old) => {
                    if (!old) return old;
                    const article = old.find((a) => a.id === articleId);
                    if (article) {
                        // Remove from saved
                        return old.filter((a) => a.id !== articleId);
                    }
                    return old;
                }
            );

            return { previousArticles };
        },
        onError: (_err, _articleId, context) => {
            // Rollback on error
            if (context?.previousArticles) {
                context.previousArticles.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: () => {
            // Refetch to ensure consistency
            queryClient.invalidateQueries({ queryKey: discoverKeys.all });
            queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });
        },
    });
}

/**
 * Hook to track article view
 */
export function useTrackView() {
    return useMutation({
        mutationFn: ({ articleId, readTimeMs }: { articleId: string; readTimeMs?: number }) =>
            discoverService.trackView(articleId, readTimeMs),
    });
}

/**
 * Hook to track article share
 */
export function useTrackShare() {
    return useMutation({
        mutationFn: (articleId: string) => discoverService.trackShare(articleId),
    });
}

/**
 * Hook to fetch user content preferences
 */
export function useContentPreferences(
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: discoverKeys.preferences(),
        queryFn: () => discoverService.getPreferences(),
        staleTime: 10 * 60 * 1000, // 10 minutes
        ...options,
    });
}

/**
 * Hook to update user content preferences
 */
export function useUpdatePreferences() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: any) => discoverService.updatePreferences(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: discoverKeys.preferences() });
            queryClient.invalidateQueries({ queryKey: discoverKeys.articles() });
        },
    });
}
