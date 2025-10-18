import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { VoteType } from '@/types/qna';
import { memo, useState, useRef } from 'react';
import { haptics } from '@/utils/haptics';
import { accessibility } from '@/utils/accessibility';

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
    const [isVoting, setIsVoting] = useState(false);
    const upvoteScale = useRef(new Animated.Value(1)).current;
    const downvoteScale = useRef(new Animated.Value(1)).current;
    const countScale = useRef(new Animated.Value(1)).current;

    const isUpvoted = currentVote === VoteType.UPVOTE;
    const isDownvoted = currentVote === VoteType.DOWNVOTE;

    const animateButton = (animValue: Animated.Value) => {
        Animated.sequence([
            Animated.spring(animValue, {
                toValue: 1.2,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.spring(animValue, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const animateCount = () => {
        Animated.sequence([
            Animated.timing(countScale, {
                toValue: 1.3,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(countScale, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleUpvote = async () => {
        if (disabled || isVoting) return;

        setIsVoting(true);
        animateButton(upvoteScale);
        animateCount();

        // Haptic feedback
        if (isUpvoted) {
            haptics.light();
        } else {
            haptics.success();
        }

        try {
            onVote(VoteType.UPVOTE);
            accessibility.announce(isUpvoted ? 'Oy geri çekildi' : 'Yukarı oy verildi');
        } catch (error: any) {
            haptics.error();
            Alert.alert('Hata', error.message || 'Oy verilemedi');
        } finally {
            setIsVoting(false);
        }
    };

    const handleDownvote = async () => {
        if (disabled || isVoting) return;

        setIsVoting(true);
        animateButton(downvoteScale);
        animateCount();

        // Haptic feedback
        if (isDownvoted) {
            haptics.light();
        } else {
            haptics.warning();
        }

        try {
            onVote(VoteType.DOWNVOTE);
            accessibility.announce(isDownvoted ? 'Oy geri çekildi' : 'Aşağı oy verildi');
        } catch (error: any) {
            haptics.error();
            Alert.alert('Hata', error.message || 'Oy verilemedi');
        } finally {
            setIsVoting(false);
        }
    };

    const voteLabel = accessibility.getVoteCountLabel(voteCount);
    const accessibilityLabel = `Oy sayısı: ${voteLabel}`;

    return (
        <View
            style={styles.container}
            accessible={true}
            accessibilityLabel={accessibilityLabel}
        >
            <Animated.View style={{ transform: [{ scale: upvoteScale }] }}>
                <TouchableOpacity
                    style={[
                        styles.voteButton,
                        isUpvoted && styles.upvotedButton,
                        (disabled || isVoting) && styles.disabledButton,
                    ]}
                    onPress={handleUpvote}
                    activeOpacity={0.7}
                    disabled={disabled || isVoting}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={isUpvoted ? 'Yukarı oyunu geri çek' : 'Yukarı oy ver'}
                    accessibilityHint={accessibility.getButtonHint(isUpvoted ? 'Oyunuzu geri çekin' : 'Yukarı oy verin')}
                >
                    <Ionicons
                        name={isUpvoted ? 'arrow-up' : 'arrow-up-outline'}
                        size={20}
                        color={isUpvoted ? theme.colors.success : theme.colors.textSecondary}
                    />
                </TouchableOpacity>
            </Animated.View>

            <Animated.Text
                style={[
                    styles.voteCount,
                    voteCount > 0 && styles.positiveCount,
                    voteCount < 0 && styles.negativeCount,
                    { transform: [{ scale: countScale }] },
                ]}
            >
                {voteCount > 0 ? `+${voteCount}` : voteCount}
            </Animated.Text>

            <Animated.View style={{ transform: [{ scale: downvoteScale }] }}>
                <TouchableOpacity
                    style={[
                        styles.voteButton,
                        isDownvoted && styles.downvotedButton,
                        (disabled || isVoting) && styles.disabledButton,
                    ]}
                    onPress={handleDownvote}
                    activeOpacity={0.7}
                    disabled={disabled || isVoting}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={isDownvoted ? 'Aşağı oyunu geri çek' : 'Aşağı oy ver'}
                    accessibilityHint={accessibility.getButtonHint(isDownvoted ? 'Oyunuzu geri çekin' : 'Aşağı oy verin')}
                >
                    <Ionicons
                        name={isDownvoted ? 'arrow-down' : 'arrow-down-outline'}
                        size={20}
                        color={isDownvoted ? theme.colors.error : theme.colors.textSecondary}
                    />
                </TouchableOpacity>
            </Animated.View>
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
            width: 32,
            height: 32,
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
        disabledButton: {
            opacity: 0.5,
        },
    });
