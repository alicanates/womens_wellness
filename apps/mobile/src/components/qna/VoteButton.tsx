import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { VoteType } from '@/types/qna';
import { memo } from 'react';

interface VoteButtonProps {
    answerId: string;
    currentVote: VoteType | null;
    voteCount: number;
    onVote: (type: VoteType) => void;
    disabled?: boolean;
}

export const VoteButton = memo(function VoteButton({
    answerId,
    currentVote,
    voteCount,
    onVote,
    disabled = false,
}: VoteButtonProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    const isUpvoted = currentVote === VoteType.UPVOTE;
    const isDownvoted = currentVote === VoteType.DOWNVOTE;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[styles.voteButton, isUpvoted && styles.upvotedButton]}
                onPress={() => onVote(VoteType.UPVOTE)}
                disabled={disabled}
            >
                <Text style={styles.emoji}>{isUpvoted ? '👍' : '👍🏻'}</Text>
            </TouchableOpacity>

            <Text style={[
                styles.voteCount,
                voteCount > 0 && styles.positiveCount,
                voteCount < 0 && styles.negativeCount,
            ]}>
                {voteCount > 0 ? `+${voteCount}` : voteCount}
            </Text>

            <TouchableOpacity
                style={[styles.voteButton, isDownvoted && styles.downvotedButton]}
                onPress={() => onVote(VoteType.DOWNVOTE)}
                disabled={disabled}
            >
                <Text style={styles.emoji}>{isDownvoted ? '👎' : '👎🏻'}</Text>
            </TouchableOpacity>
        </View>
    );
});

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: theme.colors.background,
            borderRadius: 12,
            padding: 4,
        },
        voteButton: {
            width: 36,
            height: 36,
            borderRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
        },
        upvotedButton: {
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
        },
        downvotedButton: {
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
        },
        emoji: {
            fontSize: 20,
        },
        voteCount: {
            fontSize: 15,
            fontWeight: '700',
            color: theme.colors.text,
            minWidth: 32,
            textAlign: 'center',
        },
        positiveCount: {
            color: theme.colors.success,
        },
        negativeCount: {
            color: theme.colors.error,
        },
    });
