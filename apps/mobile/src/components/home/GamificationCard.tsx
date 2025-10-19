import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import { gamificationService } from '@/services/gamification';
import type { GamificationStats } from '@/types/gamification';

export function GamificationCard() {
    const router = useRouter();
    const theme = useTheme();

    const { data: stats, isLoading } = useQuery<GamificationStats>({
        queryKey: ['gamification-stats'],
        queryFn: () => gamificationService.getStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    if (isLoading || !stats) {
        return null;
    }

    const styles = createStyles(theme);

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/gamification' as any)}
        >
            <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.row}>
                    <View style={styles.left}>
                        <View style={styles.titleRow}>
                            <Text style={styles.icon}>🎮</Text>
                            <Text style={styles.title}>Başarılarım</Text>
                        </View>
                        <View style={styles.stats}>
                            <Text style={styles.statText}>Seviye {stats.level}</Text>
                            <Text style={styles.dot}>•</Text>
                            <Text style={styles.statText}>🔥 {stats.currentStreak}</Text>
                            <Text style={styles.dot}>•</Text>
                            <Text style={styles.statText}>🏆 {stats.achievements}</Text>
                        </View>
                    </View>
                    <Text style={styles.arrow}>›</Text>
                </View>

                <View style={styles.xpBar}>
                    <View style={[styles.xpProgress, { width: `${Math.min(stats.levelProgress, 100)}%` }]} />
                </View>
                <Text style={styles.xpText}>
                    {stats.xpProgress} / {stats.xpTotal} XP
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            borderRadius: 16,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.md,
        },
        row: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.sm,
        },
        left: {
            flex: 1,
        },
        titleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
        },
        icon: {
            fontSize: 18,
            marginRight: 6,
        },
        title: {
            fontSize: 16,
            fontWeight: '700',
            color: '#FFFFFF',
        },
        stats: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        statText: {
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.9)',
            fontWeight: '500',
        },
        dot: {
            fontSize: 13,
            color: 'rgba(255, 255, 255, 0.5)',
            marginHorizontal: 6,
        },
        arrow: {
            fontSize: 20,
            color: '#FFFFFF',
            opacity: 0.7,
        },
        xpBar: {
            height: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            borderRadius: 2,
            overflow: 'hidden',
            marginBottom: 4,
        },
        xpProgress: {
            height: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: 2,
        },
        xpText: {
            fontSize: 10,
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'right',
        },
    });
