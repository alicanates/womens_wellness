import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Feature {
    icon: string;
    title: string;
    free: string | boolean;
    premium: string | boolean;
}

const FEATURES: Feature[] = [
    {
        icon: '🤖',
        title: 'AI Modeli',
        free: 'Temel',
        premium: 'Gelişmiş',
    },
    {
        icon: '💬',
        title: 'Aylık Mesaj',
        free: '100',
        premium: '1000',
    },
    {
        icon: '⚡',
        title: 'Yanıt Hızı',
        free: 'Normal',
        premium: 'Öncelikli',
    },
    {
        icon: '🎯',
        title: 'Kişisel İçgörüler',
        free: false,
        premium: true,
    },
    {
        icon: '📈',
        title: 'Gelişmiş Analizler',
        free: false,
        premium: true,
    },
    {
        icon: '🧠',
        title: 'Gelişmiş Hafıza',
        free: false,
        premium: true,
    },
];

export function FeaturesComparison() {
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Özellikler</Text>

            {/* Header Row */}
            <View style={styles.headerRow}>
                <View style={styles.featureColumn} />
                <View style={styles.planColumn}>
                    <Text style={styles.planHeader}>Ücretsiz</Text>
                </View>
                <View style={styles.planColumn}>
                    <Text style={[styles.planHeader, styles.premiumHeader]}>Premium</Text>
                </View>
            </View>

            {/* Feature Rows */}
            {FEATURES.map((feature, index) => (
                <FeatureRow key={index} feature={feature} />
            ))}
        </View>
    );
}

interface FeatureRowProps {
    feature: Feature;
}

function FeatureRow({ feature }: FeatureRowProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    const renderValue = (value: string | boolean) => {
        if (typeof value === 'boolean') {
            return (
                <Text style={styles.checkmark}>
                    {value ? '✓' : '—'}
                </Text>
            );
        }
        return <Text style={styles.valueText}>{value}</Text>;
    };

    return (
        <View style={styles.featureRow}>
            <View style={styles.featureColumn}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureTitle}>{feature.title}</Text>
            </View>
            <View style={styles.planColumn}>
                {renderValue(feature.free)}
            </View>
            <View style={[styles.planColumn, styles.premiumColumn]}>
                {renderValue(feature.premium)}
            </View>
        </View>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: theme.card.borderRadius,
            padding: theme.spacing.lg,
        },
        title: {
            ...theme.typography.subtitle,
            color: theme.colors.text,
            marginBottom: theme.spacing.lg,
        },
        headerRow: {
            flexDirection: 'row',
            marginBottom: theme.spacing.md,
            paddingBottom: theme.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        featureRow: {
            flexDirection: 'row',
            paddingVertical: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        featureColumn: {
            flex: 2,
            flexDirection: 'row',
            alignItems: 'center',
        },
        planColumn: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        premiumColumn: {
            backgroundColor: theme.colors.backgroundSecondary,
            marginLeft: theme.spacing.xs,
            borderRadius: 8,
        },
        planHeader: {
            ...theme.typography.caption,
            color: theme.colors.textSecondary,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        premiumHeader: {
            color: theme.colors.primary,
        },
        featureIcon: {
            fontSize: 20,
            marginRight: theme.spacing.sm,
        },
        featureTitle: {
            ...theme.typography.body,
            color: theme.colors.text,
            flex: 1,
        },
        valueText: {
            ...theme.typography.body,
            color: theme.colors.text,
            fontWeight: '600',
        },
        checkmark: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.success,
        },
    });
