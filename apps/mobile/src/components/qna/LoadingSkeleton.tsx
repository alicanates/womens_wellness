import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface LoadingSkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}

export function LoadingSkeleton({
    width = '100%',
    height = 20,
    borderRadius = 8,
    style,
}: LoadingSkeletonProps) {
    const theme = useTheme();
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        animation.start();

        return () => animation.stop();
    }, [animatedValue]);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: theme.colors.border,
                    opacity,
                },
                style,
            ]}
        />
    );
}

export function QuestionCardSkeleton() {
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.card}>
            {/* Author */}
            <View style={styles.authorSection}>
                <LoadingSkeleton width={40} height={40} borderRadius={20} />
                <View style={styles.authorInfo}>
                    <LoadingSkeleton width={120} height={16} />
                    <LoadingSkeleton width={80} height={12} style={{ marginTop: 4 }} />
                </View>
            </View>

            {/* Title */}
            <LoadingSkeleton width="90%" height={24} style={{ marginBottom: 8 }} />
            <LoadingSkeleton width="70%" height={24} style={{ marginBottom: 12 }} />

            {/* Content */}
            <LoadingSkeleton width="100%" height={16} style={{ marginBottom: 4 }} />
            <LoadingSkeleton width="95%" height={16} style={{ marginBottom: 4 }} />
            <LoadingSkeleton width="80%" height={16} style={{ marginBottom: 12 }} />

            {/* Tags */}
            <View style={styles.tagsRow}>
                <LoadingSkeleton width={80} height={28} borderRadius={14} />
                <LoadingSkeleton width={60} height={28} borderRadius={14} />
                <LoadingSkeleton width={70} height={28} borderRadius={14} />
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <LoadingSkeleton width={100} height={16} />
                <LoadingSkeleton width={80} height={16} />
            </View>
        </View>
    );
}

export function AnswerCardSkeleton() {
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.card}>
            {/* Author */}
            <View style={styles.authorSection}>
                <LoadingSkeleton width={36} height={36} borderRadius={18} />
                <View style={styles.authorInfo}>
                    <LoadingSkeleton width={100} height={14} />
                    <LoadingSkeleton width={60} height={12} style={{ marginTop: 4 }} />
                </View>
            </View>

            {/* Content */}
            <LoadingSkeleton width="100%" height={14} style={{ marginBottom: 4 }} />
            <LoadingSkeleton width="95%" height={14} style={{ marginBottom: 4 }} />
            <LoadingSkeleton width="85%" height={14} style={{ marginBottom: 12 }} />

            {/* Actions */}
            <View style={styles.actionsRow}>
                <LoadingSkeleton width={60} height={32} borderRadius={16} />
                <LoadingSkeleton width={70} height={32} borderRadius={16} />
                <LoadingSkeleton width={60} height={32} borderRadius={16} />
            </View>
        </View>
    );
}

export function CommentSkeleton() {
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.commentContainer}>
            <View style={styles.authorSection}>
                <LoadingSkeleton width={28} height={28} borderRadius={14} />
                <View style={styles.authorInfo}>
                    <LoadingSkeleton width={80} height={12} />
                </View>
            </View>
            <LoadingSkeleton width="90%" height={12} style={{ marginTop: 4 }} />
            <LoadingSkeleton width="70%" height={12} style={{ marginTop: 4 }} />
        </View>
    );
}

export function QuestionListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <QuestionCardSkeleton key={index} />
            ))}
        </>
    );
}

export function AnswerListSkeleton({ count = 2 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <AnswerCardSkeleton key={index} />
            ))}
        </>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        card: {
            backgroundColor: theme.colors.backgroundCard,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.md,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        authorSection: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        authorInfo: {
            flex: 1,
            marginLeft: theme.spacing.sm,
        },
        tagsRow: {
            flexDirection: 'row',
            gap: theme.spacing.xs,
            marginBottom: theme.spacing.md,
        },
        statsRow: {
            flexDirection: 'row',
            gap: theme.spacing.lg,
        },
        actionsRow: {
            flexDirection: 'row',
            gap: theme.spacing.sm,
        },
        commentContainer: {
            paddingVertical: theme.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
    });
