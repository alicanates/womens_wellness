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
    variant?: 'horizontal' | 'vertical' | 'grid';
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
    const imageSource = article.thumbnailUrl || article.imageUrl;

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

    // Grid variant - Pinterest/Instagram style
    if (variant === 'grid') {
        return (
            <TouchableOpacity
                style={styles.gridContainer}
                onPress={onPress}
                activeOpacity={0.9}
            >
                {imageSource && !imageError && (
                    <View style={styles.gridImageContainer}>
                        {!imageLoaded && (
                            <View style={[styles.gridImage, styles.imagePlaceholder]} />
                        )}
                        <Image
                            source={{ uri: imageSource }}
                            style={[styles.gridImage, !imageLoaded && styles.imageHidden]}
                            resizeMode="cover"
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                            fadeDuration={150}
                            progressiveRenderingEnabled={true}
                        />
                        <TouchableOpacity
                            style={styles.gridSaveButton}
                            onPress={(e) => {
                                e.stopPropagation();
                                onSave();
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons
                                name={article.isSaved ? 'heart' : 'heart-outline'}
                                size={18}
                                color={article.isSaved ? theme.colors.error : '#fff'}
                            />
                        </TouchableOpacity>
                    </View>
                )}
                <View style={styles.gridContent}>
                    <CategoryBadge category={article.category} size="small" />
                    <Text style={styles.gridTitle} numberOfLines={2}>
                        {article.title}
                    </Text>
                    <Text style={styles.gridReadTime}>{article.readTimeMin} dk okuma</Text>
                </View>
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

const createStyles = (theme: ReturnType<typeof useTheme>, variant: 'horizontal' | 'vertical' | 'grid') =>
    StyleSheet.create({
        // Grid variant styles - Pinterest/Instagram style
        gridContainer: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: theme.spacing.sm,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
        },
        gridImageContainer: {
            position: 'relative',
            width: '100%',
            aspectRatio: 0.75, // Portrait ratio like Pinterest
        },
        gridImage: {
            width: '100%',
            height: '100%',
            backgroundColor: theme.colors.border,
        },
        gridSaveButton: {
            position: 'absolute',
            top: theme.spacing.sm,
            right: theme.spacing.sm,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            backdropFilter: 'blur(10px)',
        },
        gridContent: {
            padding: theme.spacing.sm,
        },
        gridTitle: {
            fontSize: 14,
            fontWeight: '700',
            color: theme.colors.text,
            marginTop: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
            lineHeight: 20,
        },
        gridReadTime: {
            fontSize: 11,
            color: theme.colors.textLight,
            fontWeight: '500',
        },

        // Vertical variant styles
        verticalContainer: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 24,
            overflow: 'hidden',
            width: 300,
            marginRight: theme.spacing.md,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 8,
        },
        verticalImage: {
            width: '100%',
            height: 200,
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
            fontSize: 18,
            fontWeight: '800',
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
            lineHeight: 26,
        },
        verticalExcerpt: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            lineHeight: 21,
        },

        // Horizontal variant styles
        horizontalContainer: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 20,
            overflow: 'hidden',
            flexDirection: 'row',
            marginBottom: theme.spacing.lg,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
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
            paddingRight: 48,
            justifyContent: 'space-between',
        },
        horizontalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.sm,
        },
        horizontalTitle: {
            fontSize: 17,
            fontWeight: '800',
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
            lineHeight: 24,
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
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
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
