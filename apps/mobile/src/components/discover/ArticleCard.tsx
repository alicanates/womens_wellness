import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { CategoryBadge } from './CategoryBadge';
import { memo, useState } from 'react';

interface ArticleCardProps {
    article: {
        id: string;
        title: string;
        excerpt: string;
        category: string;
        imageUrl?: string;
        thumbnailUrl?: string;
        readTimeMin: number;
        isSaved: boolean;
    };
    onPress: () => void;
    onSave: () => void;
    variant?: 'horizontal' | 'vertical';
}

export const ArticleCard = memo(function ArticleCard({
    article,
    onPress,
    onSave,
    variant = 'vertical'
}: ArticleCardProps) {
    const theme = useTheme();
    const styles = createStyles(theme, variant);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Prefer thumbnail for list views, full image for detail
    const imageSource = variant === 'vertical'
        ? (article.thumbnailUrl || article.imageUrl)
        : article.thumbnailUrl || article.imageUrl;

    if (variant === 'horizontal') {
        return (
            <TouchableOpacity
                style={styles.horizontalContainer}
                onPress={onPress}
                activeOpacity={0.7}
            >
                {imageSource && !imageError && (
                    <View style={styles.imageContainer}>
                        {!imageLoaded && (
                            <View style={[styles.horizontalImage, styles.imagePlaceholder]} />
                        )}
                        <Image
                            source={{ uri: imageSource }}
                            style={[styles.horizontalImage, !imageLoaded && styles.imageHidden]}
                            resizeMode="cover"
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                            // Performance optimizations
                            fadeDuration={200}
                            progressiveRenderingEnabled={true}
                            defaultSource={undefined}
                        />
                    </View>
                )}
                <View style={styles.horizontalContent}>
                    <View style={styles.horizontalHeader}>
                        <CategoryBadge category={article.category} size="small" />
                        <Text style={styles.readTime}>{article.readTimeMin} dk</Text>
                    </View>
                    <Text style={styles.horizontalTitle} numberOfLines={2}>
                        {article.title}
                    </Text>
                    <Text style={styles.horizontalExcerpt} numberOfLines={2}>
                        {article.excerpt}
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={(e) => {
                        e.stopPropagation();
                        onSave();
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons
                        name={article.isSaved ? 'heart' : 'heart-outline'}
                        size={20}
                        color={article.isSaved ? theme.colors.error : theme.colors.textSecondary}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    }

    // Vertical variant
    return (
        <TouchableOpacity
            style={styles.verticalContainer}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {imageSource && !imageError && (
                <View style={styles.imageContainer}>
                    {!imageLoaded && (
                        <View style={[styles.verticalImage, styles.imagePlaceholder]} />
                    )}
                    <Image
                        source={{ uri: imageSource }}
                        style={[styles.verticalImage, !imageLoaded && styles.imageHidden]}
                        resizeMode="cover"
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                        // Performance optimizations
                        fadeDuration={200}
                        progressiveRenderingEnabled={true}
                        defaultSource={undefined}
                    />
                </View>
            )}
            <View style={styles.verticalContent}>
                <View style={styles.verticalHeader}>
                    <CategoryBadge category={article.category} />
                    <View style={styles.metaRow}>
                        <Text style={styles.readTime}>{article.readTimeMin} dk</Text>
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                onSave();
                            }}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons
                                name={article.isSaved ? 'heart' : 'heart-outline'}
                                size={20}
                                color={article.isSaved ? theme.colors.error : theme.colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.verticalTitle} numberOfLines={2}>
                    {article.title}
                </Text>
                <Text style={styles.verticalExcerpt} numberOfLines={2}>
                    {article.excerpt}
                </Text>
            </View>
        </TouchableOpacity>
    );
});

const createStyles = (theme: ReturnType<typeof useTheme>, variant: 'horizontal' | 'vertical') =>
    StyleSheet.create({
        // Vertical variant styles
        verticalContainer: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 20,
            overflow: 'hidden',
            width: 300,
            marginRight: theme.spacing.md,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
            borderWidth: 0,
        },
        verticalImage: {
            width: '100%',
            height: 180,
            backgroundColor: theme.colors.border,
        },
        verticalContent: {
            padding: theme.spacing.lg,
        },
        verticalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        metaRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
        },
        verticalTitle: {
            fontSize: 17,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
            lineHeight: 24,
        },
        verticalExcerpt: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            lineHeight: 20,
        },

        // Horizontal variant styles
        horizontalContainer: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 20,
            overflow: 'hidden',
            flexDirection: 'row',
            marginBottom: theme.spacing.md,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.08,
            shadowRadius: 10,
            elevation: 4,
            borderWidth: 0,
            position: 'relative',
            minHeight: 140,
        },
        horizontalImage: {
            width: 140,
            height: 140,
            backgroundColor: theme.colors.border,
        },
        horizontalContent: {
            flex: 1,
            padding: theme.spacing.lg,
            paddingRight: 48, // Space for save button
            justifyContent: 'space-between',
        },
        horizontalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.sm,
        },
        horizontalTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
            lineHeight: 22,
        },
        horizontalExcerpt: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            lineHeight: 20,
        },
        saveButton: {
            position: 'absolute',
            top: theme.spacing.lg,
            right: theme.spacing.lg,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 3,
        },

        // Common styles
        readTime: {
            fontSize: 12,
            color: theme.colors.textLight,
            fontWeight: '500',
        },

        // Image loading states
        imageContainer: {
            position: 'relative',
        },
        imagePlaceholder: {
            backgroundColor: theme.colors.border,
        },
        imageHidden: {
            opacity: 0,
        },
    });
