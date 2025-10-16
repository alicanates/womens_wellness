import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface PremiumBadgeProps {
    size?: 'small' | 'medium' | 'large';
    variant?: 'icon' | 'text' | 'full';
}

export function PremiumBadge({ size = 'medium', variant = 'full' }: PremiumBadgeProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    const sizeStyles = {
        small: styles.badgeSmall,
        medium: styles.badgeMedium,
        large: styles.badgeLarge,
    };

    const iconSizeStyles = {
        small: styles.iconSmall,
        medium: styles.iconMedium,
        large: styles.iconLarge,
    };

    const textSizeStyles = {
        small: styles.textSmall,
        medium: styles.textMedium,
        large: styles.textLarge,
    };

    // Icon only variant
    if (variant === 'icon') {
        return (
            <View style={[styles.badge, styles.iconOnlyBadge, sizeStyles[size]]}>
                <Text style={[styles.icon, iconSizeStyles[size]]}>✨</Text>
            </View>
        );
    }

    // Text only variant
    if (variant === 'text') {
        return (
            <View style={[styles.badge, styles.textOnlyBadge, sizeStyles[size]]}>
                <Text style={[styles.text, textSizeStyles[size]]}>PREMIUM</Text>
            </View>
        );
    }

    // Full variant (icon + text)
    return (
        <View style={[styles.badge, styles.fullBadge, sizeStyles[size]]}>
            <Text style={[styles.icon, iconSizeStyles[size]]}>✨</Text>
            <Text style={[styles.text, textSizeStyles[size]]}>Premium</Text>
        </View>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        badge: {
            alignSelf: 'flex-start',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 12,
        },
        // Variant styles
        iconOnlyBadge: {
            backgroundColor: theme.colors.primary,
            aspectRatio: 1,
        },
        textOnlyBadge: {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 10,
        },
        fullBadge: {
            backgroundColor: theme.colors.primary,
            flexDirection: 'row',
            paddingHorizontal: 10,
            gap: 4,
        },
        // Size styles
        badgeSmall: {
            paddingVertical: 3,
            borderRadius: 8,
        },
        badgeMedium: {
            paddingVertical: 5,
            borderRadius: 10,
        },
        badgeLarge: {
            paddingVertical: 7,
            borderRadius: 12,
        },
        // Icon styles
        icon: {
            lineHeight: undefined,
        },
        iconSmall: {
            fontSize: 10,
        },
        iconMedium: {
            fontSize: 14,
        },
        iconLarge: {
            fontSize: 18,
        },
        // Text styles
        text: {
            color: theme.colors.textOnPrimary,
            fontWeight: '700',
            letterSpacing: 0.5,
            lineHeight: undefined,
        },
        textSmall: {
            fontSize: 9,
        },
        textMedium: {
            fontSize: 11,
        },
        textLarge: {
            fontSize: 13,
        },
    });
