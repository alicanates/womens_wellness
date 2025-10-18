import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Question } from '@/types/qna';
import { CategoryPill } from './CategoryPill';
import { TagChip } from './TagChip';
import { OptimizedAvatar } from './OptimizedAvatar';
import { memo, useRef, useEffect } from 'react';
import { haptics } from '@/utils/haptics';
import { accessibility } from '@/utils/accessibility';

interface QuestionCardProps {
    question: Question;
    onPress: () => void;
    showActions?: boolean;
}

export const QuestionCard = memo(function QuestionCard({
    question,
    onPress,
    showActions = true,
}: QuestionCardProps) {
    const theme = useTheme();
    const styles = createStyles(theme);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const answerCount = question._count?.answers || 0;
    const hasAcceptedAnswer = question.status === 'ANSWERED';

    // Fade in animation on mount
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
        }).start();
    };

    const handlePress = () => {
        haptics.light();
        onPress();
    };

    // Accessibility label
    const accessibilityLabel = `${question.title}. ${question.isAnonymous ? accessibility.getAnonymousLabel() : `${question.user?.displayName} tarafından soruldu`
        }. ${accessibility.getAnswerCountLabel(answerCount)}. ${accessibility.getViewCountLabel(question.viewCount)}. ${question.isPremium ? accessibility.getPremiumBadgeLabel() : ''
        }`;

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
            }}
        >
            <TouchableOpacity
                style={styles.container}
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
                accessibilityHint={accessibility.getButtonHint('Soru detayını görüntüle')}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.authorInfo}>
                        <OptimizedAvatar
                            imageUrl={question.user?.profilePictureUrl}
                            displayName={question.user?.displayName}
                            size={36}
                            isAnonymous={question.isAnonymous}
                        />
                        <View>
                            <Text style={styles.authorName}>
                                {question.isAnonymous ? 'Anonim Kullanıcı' : question.user?.displayName}
                            </Text>
                            {!question.isAnonymous && question.user?.reputation !== undefined && (
                                <Text style={styles.reputation}>
                                    {question.user.reputation} puan
                                </Text>
                            )}
                        </View>
                    </View>
                    {question.isPremium && (
                        <View style={styles.premiumBadge}>
                            <Text style={{ fontSize: 12 }}>⭐</Text>
                            <Text style={styles.premiumText}>Premium</Text>
                        </View>
                    )}
                </View>

                {/* Title */}
                <Text style={styles.title} numberOfLines={2}>
                    {question.title}
                </Text>

                {/* Content Preview */}
                <Text style={styles.content} numberOfLines={3}>
                    {question.content}
                </Text>

                {/* Category and Tags */}
                <View style={styles.tagsContainer}>
                    <CategoryPill category={question.category} />
                    {question.tags.slice(0, 3).map((tag) => (
                        <TagChip key={tag} tag={tag} />
                    ))}
                    {question.tags.length > 3 && (
                        <Text style={styles.moreTags}>+{question.tags.length - 3}</Text>
                    )}
                </View>

                {/* Footer Stats */}
                {showActions && (
                    <View style={styles.footer}>
                        <View style={styles.stats}>
                            <View style={[styles.stat, hasAcceptedAnswer && styles.statSuccess]}>
                                <Text style={{ fontSize: 14 }}>
                                    {hasAcceptedAnswer ? '✅' : '💬'}
                                </Text>
                                <Text style={[styles.statText, hasAcceptedAnswer && styles.statTextSuccess]}>
                                    {answerCount} cevap
                                </Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={{ fontSize: 14 }}>👁️</Text>
                                <Text style={styles.statText}>{question.viewCount}</Text>
                            </View>
                            {question._count?.favorites !== undefined && question._count.favorites > 0 && (
                                <View style={styles.stat}>
                                    <Text style={{ fontSize: 14 }}>❤️</Text>
                                    <Text style={styles.statText}>{question._count.favorites}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={styles.timestamp}>
                            {formatTimestamp(question.createdAt)}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
});

function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;

    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 16,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.md,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        authorInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
            flex: 1,
        },
        authorName: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
        },
        reputation: {
            fontSize: 11,
            color: theme.colors.textSecondary,
            marginTop: 2,
        },
        premiumBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
        },
        premiumText: {
            fontSize: 11,
            fontWeight: '600',
            color: '#FFD700',
        },
        title: {
            fontSize: 17,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
            lineHeight: 24,
        },
        content: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            lineHeight: 20,
            marginBottom: theme.spacing.md,
        },
        tagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.xs,
            marginBottom: theme.spacing.md,
        },
        moreTags: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            alignSelf: 'center',
            marginLeft: 4,
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: theme.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
        },
        stats: {
            flexDirection: 'row',
            gap: theme.spacing.md,
        },
        stat: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        statSuccess: {
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
        },
        statText: {
            fontSize: 13,
            color: theme.colors.textSecondary,
            fontWeight: '500',
        },
        statTextSuccess: {
            color: theme.colors.success,
        },
        timestamp: {
            fontSize: 12,
            color: theme.colors.textLight,
        },
    });
