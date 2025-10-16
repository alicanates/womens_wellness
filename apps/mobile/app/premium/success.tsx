import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { PremiumBadge } from '@/components/premium/PremiumBadge';
import { useEffect, useRef } from 'react';

export default function PremiumSuccessScreen() {
    const router = useRouter();
    const theme = useTheme();
    const styles = createStyles(theme);

    // Animation values
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        // Success icon animation
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
        }).start();

        // Content fade in
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            delay: 300,
            useNativeDriver: true,
        }).start();

        // Features slide up
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 600,
            delay: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleContinue = () => {
        router.replace('/(tabs)/home');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Success Animation/Icon */}
                <Animated.View
                    style={[
                        styles.iconContainer,
                        {
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <Text style={styles.successIcon}>🎉</Text>
                </Animated.View>

                {/* Title */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <Text style={styles.title}>Tebrikler!</Text>
                    <Text style={styles.subtitle}>Premium üyeliğiniz başarıyla aktif edildi</Text>

                    {/* Premium Badge */}
                    <View style={styles.badgeContainer}>
                        <PremiumBadge size="large" variant="full" />
                    </View>
                </Animated.View>

                {/* Features List */}
                <Animated.View
                    style={[
                        styles.featuresContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <Text style={styles.featuresTitle}>Artık bunlara erişebilirsiniz:</Text>

                    <View style={styles.featuresList}>
                        <FeatureItem icon="🤖" text="Gelişmiş AI modeli" />
                        <FeatureItem icon="💬" text="Ayda 1000 mesaj" />
                        <FeatureItem icon="⚡" text="Öncelikli yanıt hızı" />
                        <FeatureItem icon="🎯" text="Kişiselleştirilmiş içgörüler" />
                        <FeatureItem icon="📈" text="Gelişmiş analizler" />
                        <FeatureItem icon="✨" text="Özel özellikler" />
                    </View>
                </Animated.View>

                {/* CTA Button */}
                <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
                    <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                        <Text style={styles.continueButtonText}>Başla</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

interface FeatureItemProps {
    icon: string;
    text: string;
}

function FeatureItem({ icon, text }: FeatureItemProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>{icon}</Text>
            <Text style={styles.featureText}>{text}</Text>
            <Text style={styles.checkmark}>✓</Text>
        </View>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        content: {
            flex: 1,
            padding: theme.spacing.xl,
            justifyContent: 'center',
            alignItems: 'center',
        },
        iconContainer: {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: theme.colors.backgroundSecondary,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: theme.spacing.xl,
        },
        successIcon: {
            fontSize: 64,
        },
        title: {
            ...theme.typography.title,
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
            textAlign: 'center',
        },
        subtitle: {
            ...theme.typography.body,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginBottom: theme.spacing.lg,
        },
        badgeContainer: {
            marginBottom: theme.spacing.xl,
        },
        featuresContainer: {
            width: '100%',
            marginBottom: theme.spacing.xl,
        },
        featuresTitle: {
            ...theme.typography.subtitle,
            color: theme.colors.text,
            marginBottom: theme.spacing.md,
        },
        featuresList: {
            gap: theme.spacing.sm,
        },
        featureItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.backgroundCard,
            padding: theme.spacing.md,
            borderRadius: theme.card.borderRadius,
        },
        featureIcon: {
            fontSize: 20,
            marginRight: theme.spacing.sm,
        },
        featureText: {
            ...theme.typography.body,
            color: theme.colors.text,
            flex: 1,
        },
        checkmark: {
            fontSize: 20,
            color: theme.colors.success,
            fontWeight: '700',
        },
        continueButton: {
            backgroundColor: theme.colors.primary,
            paddingVertical: theme.spacing.lg,
            paddingHorizontal: theme.spacing.xl * 2,
            borderRadius: theme.card.borderRadius,
            width: '100%',
            alignItems: 'center',
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
        continueButtonText: {
            ...theme.typography.subtitle,
            color: theme.colors.textOnPrimary,
            fontWeight: '700',
            fontSize: 18,
        },
    });
