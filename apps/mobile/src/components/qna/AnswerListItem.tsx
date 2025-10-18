import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Answer } from '@/types/qna';
import { memo } from 'react';
import { useRouter } from 'expo-router';

interface AnswerListItemProps {
    answer: Answer & { question?: { id: string; title: string } };
}

export const AnswerListItem = memo(function AnswerListItem({ answer }: AnswerListItemProps) {
    const theme = useTheme();
    const styles = createStyles(theme);
    const router = useRouter();

    const handlePress = () => {
        if (answer.question?.id) {
            router.push(`/community/${answer.question.id}` as any);
        }
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            {/* Question Title */}
            {answer.question && (
                <Text style={styles.questionTitle} numberOfLines={2}>
                    {answer.question.title}
                </Text>
            )}

            {/* Answer Content */}
            <Text style={styles.content} numberOfLines={3}>
                {answer.content}
            </Text>

            {/* Footer */}
            <View style={styles.footer}>
                <View style={styles.stats}>
                    {answer.isBestAnswer && (
                        <View style={styles.bestBadge}>
                            <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                            <Text style={styles.bestText}>En İyi Cevap</Text>
                        </View>
                    )}
                    <View style={styles.stat}>
                        <Ionicons
                            name={answer.voteCount >= 0 ? 'arrow-up' : 'arrow-down'}
                            size={16}
                            color={answer.voteCount >= 0 ? theme.colors.success : theme.colors.error}
                        />
                        <Text style={styles.statText}>{answer.voteCount}</Text>
                    </View>
                    {answer._count?.comments !== undefined && answer._count.comments > 0 && (
                        <View style={styles.stat}>
                            <Ionicons name="chatbubble-outline" size={14} color={theme.colors.textSecondary} />
                            <Text style={styles.statText}>{answer._count.comments}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.timestamp}>
                    {formatTimestamp(answer.createdAt)}
                </Text>
            </View>
        </TouchableOpacity>
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
        questionTitle: {
            fontSize: 15,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
            lineHeight: 20,
        },
        content: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            lineHeight: 20,
            marginBottom: theme.spacing.md,
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
            alignItems: 'center',
        },
        bestBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
        },
        bestText: {
            fontSize: 12,
            fontWeight: '600',
            color: theme.colors.success,
        },
        stat: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        statText: {
            fontSize: 13,
            color: theme.colors.textSecondary,
            fontWeight: '500',
        },
        timestamp: {
            fontSize: 12,
            color: theme.colors.textLight,
        },
    });
