import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { SubscriptionTier } from '@/types/subscription';

interface TierOption {
    tier: SubscriptionTier;
    price: string;
    period: string;
    savings?: string;
    badge?: string;
}

interface TierSelectorProps {
    selectedTier: SubscriptionTier;
    onSelectTier: (tier: SubscriptionTier) => void;
    monthlyPrice?: string;
    yearlyPrice?: string;
}

export function TierSelector({
    selectedTier,
    onSelectTier,
    monthlyPrice = '₺99',
    yearlyPrice = '₺999',
}: TierSelectorProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    const tiers: TierOption[] = [
        {
            tier: 'MONTHLY',
            price: monthlyPrice,
            period: 'ay',
        },
        {
            tier: 'YEARLY',
            price: yearlyPrice,
            period: 'yıl',
            savings: '17% tasarruf',
            badge: 'En Popüler',
        },
    ];

    return (
        <View style={styles.container}>
            {tiers.map((option) => (
                <TierOption
                    key={option.tier}
                    option={option}
                    selected={selectedTier === option.tier}
                    onSelect={() => onSelectTier(option.tier)}
                />
            ))}
        </View>
    );
}

interface TierOptionProps {
    option: TierOption;
    selected: boolean;
    onSelect: () => void;
}

function TierOption({ option, selected, onSelect }: TierOptionProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <TouchableOpacity
            style={[
                styles.optionCard,
                selected && styles.optionCardSelected,
            ]}
            onPress={onSelect}
            activeOpacity={0.7}
        >
            {/* Badge */}
            {option.badge && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{option.badge}</Text>
                </View>
            )}

            {/* Radio Button */}
            <View style={styles.radioContainer}>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected && <View style={styles.radioInner} />}
                </View>
            </View>

            {/* Content */}
            <View style={styles.optionContent}>
                <View style={styles.priceRow}>
                    <Text style={[styles.price, selected && styles.priceSelected]}>
                        {option.price}
                    </Text>
                    <Text style={[styles.period, selected && styles.periodSelected]}>
                        / {option.period}
                    </Text>
                </View>

                {option.savings && (
                    <View style={styles.savingsContainer}>
                        <Text style={[styles.savings, selected && styles.savingsSelected]}>
                            {option.savings}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        container: {
            gap: theme.spacing.md,
        },
        optionCard: {
            backgroundColor: theme.colors.backgroundCard,
            borderWidth: 2,
            borderColor: theme.colors.border,
            borderRadius: theme.card.borderRadius,
            padding: theme.spacing.lg,
            flexDirection: 'row',
            alignItems: 'center',
            position: 'relative',
        },
        optionCardSelected: {
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.backgroundSecondary,
        },
        badge: {
            position: 'absolute',
            top: -10,
            right: 20,
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.xs,
            borderRadius: 12,
        },
        badgeText: {
            color: theme.colors.textOnPrimary,
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.5,
        },
        radioContainer: {
            marginRight: theme.spacing.md,
        },
        radio: {
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: theme.colors.border,
            justifyContent: 'center',
            alignItems: 'center',
        },
        radioSelected: {
            borderColor: theme.colors.primary,
        },
        radioInner: {
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: theme.colors.primary,
        },
        optionContent: {
            flex: 1,
        },
        priceRow: {
            flexDirection: 'row',
            alignItems: 'baseline',
            marginBottom: theme.spacing.xs,
        },
        price: {
            fontSize: 28,
            fontWeight: '700',
            color: theme.colors.text,
        },
        priceSelected: {
            color: theme.colors.primary,
        },
        period: {
            ...theme.typography.body,
            color: theme.colors.textSecondary,
            marginLeft: theme.spacing.xs,
        },
        periodSelected: {
            color: theme.colors.primary,
        },
        savingsContainer: {
            alignSelf: 'flex-start',
        },
        savings: {
            ...theme.typography.caption,
            color: theme.colors.success,
            fontWeight: '600',
        },
        savingsSelected: {
            color: theme.colors.primary,
        },
    });
