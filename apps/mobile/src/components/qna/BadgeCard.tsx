import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { UserBadge } from '@/types/qna';
import { memo } from 'react';

interface BadgeCardProps {
    badges: UserBadge[];
}

export const BadgeCard = memo(function BadgeCard({ badges }: BadgeCardProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    if (badges.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Ionicons name="medal" size={24} color={theme.colors.primary} />
                    <Text style={styles.title}>Rozetler</Text>
                </View>
                <View style={styles.emptyState}>
                    <Ionicons name="medal-outline" size={48} color={theme.colors.textLight} />
                    <Text style={styles.emptyText}>Henüz rozet kazanmadınız</Text>
                    <Text style={styles.emptySubtext}>
                        Sorulara cevap vererek ve toplulukta aktif olarak rozetler kazanabilirsiniz
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="medal" size={24} color={theme.colors.primary} />
                <Text style={styles.title}>Rozetler ({badges.length})</Text>
            </View>

            <FlatList
                data={badges}
                keyExtractor={(item) => item.id}
                numColumns={3}
                scrollEnabled={false}
                renderItem={({ item }) => (
                    <View style={styles.badgeItem}>
                        <View style={styles.badgeIcon}>
                            <Ionicons name="medal" size={32} color="#FFD700" />
                        </View>
                        <Text style={styles.badgeName} numberOfLines={2}>
                            {item.badge.nameTr}
                        </Text>
                    </View>
                )}
                columnWrapperStyle={styles.badgeRow}
            />
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
        emptyState: {
            alignItems: 'center',
            paddingVertical: theme.spacing.xl,
        },
        emptyText: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.md,
            marginBottom: theme.spacing.xs,
        },
        emptySubtext: {
            fontSize: 14,
            color: theme.colors.textLight,
            textAlign: 'center',
            paddingHorizontal: theme.spacing.lg,
        },
        badgeRow: {
            justifyContent: 'flex-start',
            gap: theme.spacing.md,
        },
        badgeItem: {
            flex: 1,
            maxWidth: '30%',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        badgeIcon: {
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: theme.spacing.xs,
        },
        badgeName: {
            fontSize: 11,
            fontWeight: '600',
            color: theme.colors.text,
            textAlign: 'center',
        },
    });
