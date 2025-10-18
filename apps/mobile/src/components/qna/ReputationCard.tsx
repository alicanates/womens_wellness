import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { UserReputation } from '@/types/qna';
import { memo } from 'react';

interface ReputationCardProps {
    reputation: UserReputation;
}

export const ReputationCard = memo(function ReputationCard({ reputation }: ReputationCardProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="trophy" size={24} color={theme.colors.primary} />
                <Text style={styles.title}>İtibar Puanı</Text>
            </View>

            <View style={styles.mainScore}>
                <Text style={styles.scoreValue}>{reputation.totalPoints}</Text>
                <Text style={styles.scoreLabel}>Toplam Puan</Text>
            </View>

            <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{reputation.questionsAsked}</Text>
                    <Text style={styles.statLabel}>Soru</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{reputation.answersGiven}</Text>
                    <Text style={styles.statLabel}>Cevap</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{reputation.bestAnswers}</Text>
                    <Text style={styles.statLabel}>En İyi</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{reputation.upvotesReceived}</Text>
                    <Text style={styles.statLabel}>Beğeni</Text>
                </View>
            </View>
        </View>
    );
});

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
            alignItems: 'center',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.lg,
        },
        title: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.text,
        },
        mainScore: {
            alignItems: 'center',
            paddingVertical: theme.spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            marginBottom: theme.spacing.lg,
        },
        scoreValue: {
            fontSize: 48,
            fontWeight: '800',
            color: theme.colors.primary,
            marginBottom: theme.spacing.xs,
        },
        scoreLabel: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            fontWeight: '500',
        },
        statsGrid: {
            flexDirection: 'row',
            justifyContent: 'space-around',
        },
        statItem: {
            alignItems: 'center',
        },
        statValue: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: 4,
        },
        statLabel: {
            fontSize: 12,
            color: theme.colors.textSecondary,
        },
    });
