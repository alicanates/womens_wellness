/**
 * Quota Exceeded Modal Component
 * 
 * Displays a modal when user has exceeded their AI message quota.
 * Offers upgrade to premium or shows when quota will reset.
 * 
 * Requirements: 6.4, 6.5
 */

import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import type { Quota } from '@/types/subscription';

interface QuotaExceededModalProps {
    visible: boolean;
    onClose: () => void;
    quota?: Quota;
    isPremium: boolean;
}

export function QuotaExceededModal({
    visible,
    onClose,
    quota,
    isPremium,
}: QuotaExceededModalProps) {
    const theme = useTheme();
    const router = useRouter();
    const styles = createStyles(theme);
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }).start();
        } else {
            scaleAnim.setValue(0);
        }
    }, [visible]);

    const handleUpgrade = () => {
        onClose();
        router.push('/premium' as any);
    };

    // Format reset date
    const getResetDateText = () => {
        if (!quota?.resetDate) return 'yakında';

        const resetDate = new Date(quota.resetDate);
        const now = new Date();
        const diffMs = resetDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'bugün';
        if (diffDays === 1) return 'yarın';
        return `${diffDays} gün sonra`;
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.container,
                        {
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <Text style={styles.icon}>📊</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Mesaj Kotanız Doldu</Text>

                    {/* Message */}
                    <Text style={styles.message}>
                        {isPremium
                            ? `Premium mesaj kotanızı kullandınız. Kotanız ${getResetDateText()} sıfırlanacak.`
                            : `Ücretsiz mesaj kotanızı kullandınız. Premium'a geçerek sınırsız mesaj gönderin.`}
                    </Text>

                    {/* Quota Info */}
                    {quota && (
                        <View style={styles.quotaInfo}>
                            <View style={styles.quotaRow}>
                                <Text style={styles.quotaLabel}>Kullanılan:</Text>
                                <Text style={styles.quotaValue}>
                                    {quota.used} / {quota.limit}
                                </Text>
                            </View>
                            <View style={styles.quotaRow}>
                                <Text style={styles.quotaLabel}>Sıfırlanma:</Text>
                                <Text style={styles.quotaValue}>{getResetDateText()}</Text>
                            </View>
                        </View>
                    )}

                    {/* Actions */}
                    <View style={styles.actions}>
                        {!isPremium && (
                            <TouchableOpacity
                                style={styles.upgradeButton}
                                onPress={handleUpgrade}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.upgradeButtonText}>
                                    ✨ Premium'a Geç
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.closeButton,
                                isPremium && styles.closeButtonPrimary,
                            ]}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.closeButtonText,
                                    isPremium && styles.closeButtonTextPrimary,
                                ]}
                            >
                                {isPremium ? 'Tamam' : 'Belki Sonra'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Benefits (for free users) */}
                    {!isPremium && (
                        <View style={styles.benefits}>
                            <Text style={styles.benefitsTitle}>Premium ile:</Text>
                            <View style={styles.benefitItem}>
                                <Text style={styles.benefitIcon}>💬</Text>
                                <Text style={styles.benefitText}>
                                    1000 mesaj/ay (10x daha fazla)
                                </Text>
                            </View>
                            <View style={styles.benefitItem}>
                                <Text style={styles.benefitIcon}>🤖</Text>
                                <Text style={styles.benefitText}>Gelişmiş AI modeli</Text>
                            </View>
                            <View style={styles.benefitItem}>
                                <Text style={styles.benefitIcon}>⚡</Text>
                                <Text style={styles.benefitText}>Öncelikli yanıt</Text>
                            </View>
                        </View>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
        container: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: theme.card.borderRadius * 2,
            padding: theme.spacing.xl,
            width: '100%',
            maxWidth: 400,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
        },
        iconContainer: {
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: theme.colors.backgroundSecondary,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            marginBottom: theme.spacing.lg,
        },
        icon: {
            fontSize: 32,
        },
        title: {
            ...theme.typography.title,
            fontSize: 22,
            color: theme.colors.text,
            textAlign: 'center',
            marginBottom: theme.spacing.md,
        },
        message: {
            ...theme.typography.body,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: theme.spacing.lg,
        },
        quotaInfo: {
            backgroundColor: theme.colors.backgroundSecondary,
            borderRadius: theme.card.borderRadius,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.lg,
        },
        quotaRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.xs,
        },
        quotaLabel: {
            ...theme.typography.body,
            color: theme.colors.textSecondary,
        },
        quotaValue: {
            ...theme.typography.body,
            color: theme.colors.text,
            fontWeight: '600',
        },
        actions: {
            gap: theme.spacing.sm,
        },
        upgradeButton: {
            backgroundColor: theme.colors.primary,
            paddingVertical: theme.spacing.md,
            borderRadius: theme.card.borderRadius,
            alignItems: 'center',
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 3,
        },
        upgradeButtonText: {
            ...theme.typography.subtitle,
            color: theme.colors.textOnPrimary,
            fontWeight: '700',
        },
        closeButton: {
            paddingVertical: theme.spacing.md,
            borderRadius: theme.card.borderRadius,
            alignItems: 'center',
        },
        closeButtonPrimary: {
            backgroundColor: theme.colors.primary,
        },
        closeButtonText: {
            ...theme.typography.body,
            color: theme.colors.textSecondary,
            fontWeight: '600',
        },
        closeButtonTextPrimary: {
            color: theme.colors.textOnPrimary,
        },
        benefits: {
            marginTop: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
        },
        benefitsTitle: {
            ...theme.typography.body,
            color: theme.colors.text,
            fontWeight: '600',
            marginBottom: theme.spacing.sm,
        },
        benefitItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.xs,
        },
        benefitIcon: {
            fontSize: 16,
        },
        benefitText: {
            ...theme.typography.body,
            color: theme.colors.textSecondary,
            flex: 1,
        },
    });
