/**
 * Grace Period Banner Component
 * 
 * Displays a warning banner when user's subscription is in grace period
 * due to payment failure.
 * 
 * Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7
 */

import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { Subscription } from '@/types/subscription';

interface GracePeriodBannerProps {
    subscription: Subscription;
    onDismiss?: () => void;
}

export function GracePeriodBanner({ subscription, onDismiss }: GracePeriodBannerProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    // Only show if in grace period
    if (!subscription.isInGracePeriod || !subscription.gracePeriodEndDate) {
        return null;
    }

    // Calculate days remaining
    const endDate = new Date(subscription.gracePeriodEndDate);
    const now = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const handleUpdatePayment = () => {
        // Open platform subscription management
        const url = Platform.OS === 'ios'
            ? 'https://apps.apple.com/account/subscriptions'
            : 'https://play.google.com/store/account/subscriptions';

        Linking.openURL(url);
    };

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>⚠️</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Ödeme Başarısız</Text>
                <Text style={styles.message}>
                    Aboneliğiniz için ödeme alınamadı. Premium erişiminiz {daysRemaining} gün içinde sona erecek.
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleUpdatePayment}
                    activeOpacity={0.7}
                >
                    <Text style={styles.buttonText}>Ödeme Yöntemini Güncelle</Text>
                </TouchableOpacity>

                <Text style={styles.note}>
                    Ödeme yönteminizi güncelleyerek premium erişiminizi koruyabilirsiniz.
                </Text>
            </View>

            {onDismiss && (
                <TouchableOpacity
                    style={styles.dismissButton}
                    onPress={onDismiss}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Text style={styles.dismissText}>✕</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        container: {
            backgroundColor: '#FEF3C7', // Amber-100
            borderRadius: theme.card.borderRadius,
            padding: theme.spacing.lg,
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: theme.spacing.md,
            borderWidth: 1,
            borderColor: '#F59E0B', // Amber-500
        },
        iconContainer: {
            width: 32,
            height: 32,
            justifyContent: 'center',
            alignItems: 'center',
        },
        icon: {
            fontSize: 24,
        },
        content: {
            flex: 1,
        },
        title: {
            ...theme.typography.subtitle,
            color: '#92400E', // Amber-900
            marginBottom: theme.spacing.xs,
        },
        message: {
            ...theme.typography.body,
            color: '#78350F', // Amber-950
            lineHeight: 20,
            marginBottom: theme.spacing.md,
        },
        button: {
            backgroundColor: '#F59E0B', // Amber-500
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            borderRadius: theme.card.borderRadius,
            alignItems: 'center',
            marginBottom: theme.spacing.sm,
        },
        buttonText: {
            ...theme.typography.body,
            color: '#FFFFFF',
            fontWeight: '600',
        },
        note: {
            ...theme.typography.caption,
            color: '#92400E', // Amber-900
            lineHeight: 14,
        },
        dismissButton: {
            width: 24,
            height: 24,
            justifyContent: 'center',
            alignItems: 'center',
        },
        dismissText: {
            fontSize: 18,
            color: '#92400E', // Amber-900
            fontWeight: '600',
        },
    });
