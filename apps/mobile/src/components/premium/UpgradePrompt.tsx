import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

interface BenefitItemProps {
    icon: string;
    text: string;
}

function BenefitItem({ icon, text }: BenefitItemProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>{icon}</Text>
            <Text style={styles.benefitText}>{text}</Text>
        </View>
    );
}

interface UpgradePromptProps {
    visible: boolean;
    onClose: () => void;
    feature: string;
    description: string;
}

/**
 * UpgradePrompt Modal Component
 * 
 * Displays a modal prompting users to upgrade to premium
 * when they try to access premium features.
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6
 */
export function UpgradePrompt({
    visible,
    onClose,
    feature,
    description,
}: UpgradePromptProps) {
    const router = useRouter();
    const theme = useTheme();
    const styles = createStyles(theme);

    const handleUpgrade = () => {
        onClose();
        router.push('/premium' as any);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Icon */}
                        <View style={styles.iconContainer}>
                            <Text style={styles.icon}>✨</Text>
                        </View>

                        {/* Title */}
                        <Text style={styles.title}>Premium Özellik</Text>

                        {/* Feature Name */}
                        <Text style={styles.feature}>{feature}</Text>

                        {/* Description */}
                        <Text style={styles.description}>{description}</Text>

                        {/* Benefits */}
                        <View style={styles.benefits}>
                            <BenefitItem icon="🤖" text="Gelişmiş AI Modeli" />
                            <BenefitItem icon="💬" text="1000 mesaj/ay" />
                            <BenefitItem icon="⚡" text="Öncelikli Yanıt" />
                            <BenefitItem icon="🎯" text="Kişisel İçgörüler" />
                        </View>

                        {/* CTA Button */}
                        <TouchableOpacity
                            style={styles.upgradeButton}
                            onPress={handleUpgrade}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.upgradeButtonText}>Premium'a Geç</Text>
                        </TouchableOpacity>

                        {/* Close Button */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            activeOpacity={0.6}
                        >
                            <Text style={styles.closeButtonText}>Belki Sonra</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        container: {
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '85%',
            paddingTop: 8,
        },
        scrollContent: {
            padding: 24,
            paddingTop: 16,
        },
        iconContainer: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: theme.colors.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'center',
            marginBottom: 20,
        },
        icon: {
            fontSize: 40,
        },
        title: {
            fontSize: 24,
            fontWeight: '700',
            color: theme.colors.text,
            textAlign: 'center',
            marginBottom: 8,
        },
        feature: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.primary,
            textAlign: 'center',
            marginBottom: 12,
        },
        description: {
            fontSize: 15,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 24,
        },
        benefits: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            gap: 12,
        },
        benefitItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        benefitIcon: {
            fontSize: 24,
            width: 32,
        },
        benefitText: {
            flex: 1,
            fontSize: 15,
            fontWeight: '500',
            color: theme.colors.text,
        },
        upgradeButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            marginBottom: 12,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
        upgradeButtonText: {
            color: theme.colors.textOnPrimary,
            fontSize: 17,
            fontWeight: '700',
            letterSpacing: 0.5,
        },
        closeButton: {
            paddingVertical: 12,
            alignItems: 'center',
        },
        closeButtonText: {
            color: theme.colors.textSecondary,
            fontSize: 15,
            fontWeight: '600',
        },
    });
