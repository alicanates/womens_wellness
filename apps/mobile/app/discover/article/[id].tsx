import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Share,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '@/hooks/useTheme';
import { discoverService } from '@/services/api';
import { CategoryBadge } from '@/components/discover/CategoryBadge';
import { ArticleCard } from '@/components/discover/ArticleCard';

export default function ArticleDetailScreen() {
    const theme = useTheme();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [readStartTime] = useState(Date.now());
    const [imageLoaded, setImageLoaded] = useState(false);

    const styles = createStyles(theme);

    // Fetch article detail
    const {
        data: article,
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ['article', id],
        queryFn: () => discoverService.getArticle(id!, 'tr'),
        enabled: !!id,
        retry: 2,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    // Toggle save mutation
    const toggleSaveMutation = useMutation({
        mutationFn: () => discoverService.toggleSave(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['article', id] });
            queryClient.invalidateQueries({ queryKey: ['articles'] });
            queryClient.invalidateQueries({ queryKey: ['savedArticles'] });
            queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });
        },
    });

    // Track view on mount and read time on unmount
    useEffect(() => {
        if (id) {
            discoverService.trackView(id);
        }

        return () => {
            if (id) {
                const readTime = Date.now() - readStartTime;
                discoverService.trackView(id, readTime);
            }
        };
    }, [id, readStartTime]);

    const handleShare = useCallback(async () => {
        try {
            await Share.share({
                message: `${article?.title}\n\nWellness Companion uygulamasından paylaşıldı.`,
            });
            if (id) {
                discoverService.trackShare(id);
            }
        } catch (error) {
            Alert.alert('Hata', 'Paylaşım başarısız oldu');
        }
    }, [article?.title, id]);

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>Makale yükleniyor...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (isError || !article) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Text style={styles.backIcon}>←</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorIcon}>⚠️</Text>
                        <Text style={styles.errorText}>
                            {!article ? 'Makale bulunamadı' : 'Makale yüklenirken bir hata oluştu'}
                        </Text>
                        <Text style={styles.errorSubtext}>
                            {error instanceof Error ? error.message : 'Lütfen tekrar deneyin'}
                        </Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => refetch()}
                        >
                            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.backToListButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.backToListButtonText}>Listeye Dön</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            onPress={() => toggleSaveMutation.mutate()}
                            style={styles.actionButton}
                        >
                            <Text style={styles.actionIcon}>{article.isSaved ? '❤️' : '🤍'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
                            <Text style={styles.actionIcon}>📤</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Hero Image */}
                    {article.imageUrl && (
                        <View style={styles.heroImageContainer}>
                            {!imageLoaded && (
                                <View style={[styles.heroImage, styles.imagePlaceholder]}>
                                    <ActivityIndicator size="large" color={theme.colors.primary} />
                                </View>
                            )}
                            <Image
                                source={{ uri: article.imageUrl }}
                                style={[styles.heroImage, !imageLoaded && styles.imageHidden]}
                                onLoad={() => setImageLoaded(true)}
                                resizeMode="cover"
                                // Performance optimizations
                                fadeDuration={300}
                                progressiveRenderingEnabled={true}
                            />
                        </View>
                    )}

                    {/* Article Header */}
                    <View style={styles.articleHeader}>
                        <View style={styles.metaRow}>
                            <CategoryBadge category={article.category} size="medium" />
                            <Text style={styles.readTime}>{article.readTimeMin} dk okuma</Text>
                        </View>

                        <Text style={styles.title}>{article.title}</Text>

                        {article.author && (
                            <View style={styles.authorRow}>
                                <Text style={styles.author}>{article.author}</Text>
                                <Text style={styles.date}>
                                    {new Date(article.publishedAt).toLocaleDateString('tr-TR', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Content */}
                    <View style={styles.contentContainer}>
                        <Markdown style={markdownStyles(theme)}>
                            {article.content}
                        </Markdown>
                    </View>

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                        <View style={styles.tagsContainer}>
                            <Text style={styles.tagsTitle}>Etiketler</Text>
                            <View style={styles.tags}>
                                {article.tags.map((tag) => (
                                    <View key={tag} style={styles.tag}>
                                        <Text style={styles.tagText}>#{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Related Articles */}
                    {article.relatedArticles && article.relatedArticles.length > 0 && (
                        <View style={styles.relatedSection}>
                            <Text style={styles.relatedTitle}>İlgini Çekebilir</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.relatedArticles}
                            >
                                {article.relatedArticles.map((relatedArticle) => (
                                    <View key={relatedArticle.id} style={styles.relatedArticleWrapper}>
                                        <ArticleCard
                                            article={relatedArticle}
                                            onPress={() => router.push(`/discover/article/${relatedArticle.id}`)}
                                            onSave={() => toggleSaveMutation.mutate()}
                                            variant="horizontal"
                                        />
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const markdownStyles = (theme: ReturnType<typeof useTheme>) => ({
    body: {
        fontSize: 16,
        lineHeight: 24,
        color: theme.colors.text,
    },
    heading1: {
        fontSize: 24,
        fontWeight: '700' as const,
        color: theme.colors.text,
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    heading2: {
        fontSize: 20,
        fontWeight: '700' as const,
        color: theme.colors.text,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    heading3: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: theme.colors.text,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.sm,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 24,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    strong: {
        fontWeight: '700' as const,
    },
    em: {
        fontStyle: 'italic' as const,
    },
    link: {
        color: theme.colors.primary,
        textDecorationLine: 'underline' as const,
    },
    bullet_list: {
        marginBottom: theme.spacing.md,
    },
    ordered_list: {
        marginBottom: theme.spacing.md,
    },
    list_item: {
        fontSize: 16,
        lineHeight: 24,
        color: theme.colors.text,
        marginBottom: theme.spacing.xs,
    },
    blockquote: {
        backgroundColor: theme.colors.backgroundCard,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    code_inline: {
        backgroundColor: theme.colors.backgroundCard,
        color: theme.colors.primary,
        paddingHorizontal: theme.spacing.xs,
        paddingVertical: 2,
        borderRadius: 4,
        fontFamily: 'monospace' as const,
    },
    code_block: {
        backgroundColor: theme.colors.backgroundCard,
        padding: theme.spacing.md,
        borderRadius: 8,
        marginBottom: theme.spacing.md,
        fontFamily: 'monospace' as const,
    },
    fence: {
        backgroundColor: theme.colors.backgroundCard,
        padding: theme.spacing.md,
        borderRadius: 8,
        marginBottom: theme.spacing.md,
        fontFamily: 'monospace' as const,
    },
});

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        container: {
            flex: 1,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        loadingText: {
            marginTop: theme.spacing.md,
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.xl,
        },
        errorIcon: {
            fontSize: 64,
            marginBottom: theme.spacing.lg,
        },
        errorText: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text,
            textAlign: 'center',
            marginBottom: theme.spacing.sm,
        },
        errorSubtext: {
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
            marginBottom: theme.spacing.md,
        },
        retryButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.textOnPrimary,
        },
        backToListButton: {
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.sm,
        },
        backToListButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.primary,
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
        headerActions: {
            flexDirection: 'row',
            gap: theme.spacing.sm,
        },
        actionButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
        },
        actionIcon: {
            fontSize: 24,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: theme.spacing.xl * 2,
        },
        heroImageContainer: {
            position: 'relative',
            width: '100%',
            height: 240,
        },
        heroImage: {
            width: '100%',
            height: 240,
        },
        imagePlaceholder: {
            backgroundColor: theme.colors.border,
            justifyContent: 'center',
            alignItems: 'center',
        },
        imageHidden: {
            opacity: 0,
            position: 'absolute',
        },
        articleHeader: {
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
        },
        metaRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.md,
        },
        readTime: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            fontWeight: '500',
        },
        title: {
            fontSize: 24,
            fontWeight: '700',
            color: theme.colors.text,
            lineHeight: 32,
            marginBottom: theme.spacing.md,
        },
        authorRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        author: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
        },
        date: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        contentContainer: {
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
        },
        tagsContainer: {
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.xl,
        },
        tagsTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
        },
        tags: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.sm,
        },
        tag: {
            backgroundColor: theme.colors.backgroundCard,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.xs,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        tagText: {
            fontSize: 12,
            fontWeight: '600',
            color: theme.colors.primary,
        },
        relatedSection: {
            paddingTop: theme.spacing.xl,
        },
        relatedTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.text,
            paddingHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.md,
        },
        relatedArticles: {
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.md,
        },
        relatedArticleWrapper: {
            width: 280,
        },
    });
