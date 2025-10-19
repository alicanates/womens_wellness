import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { FunNotification } from '@/types/funNotifications';
import { useTranslation } from '@/hooks/useTranslation';

interface FunNotificationCardProps {
    notification: FunNotification;
    onDismiss?: () => void;
    onPress?: () => void;
}

export function FunNotificationCard({
    notification,
    onDismiss,
    onPress
}: FunNotificationCardProps) {
    const theme = useTheme();
    const { language } = useTranslation();
    const styles = createStyles(theme);

    const title = language === 'tr' ? notification.titleTr : notification.titleEn;
    const message = language === 'tr' ? notification.messageTr : notification.messageEn;

    // Bildirim tipine göre gradient renkleri
    const getGradientColors = () => {
        if (notification.type === 'streak') {
            return ['#FF6B35', '#FF8C42'] as const;
        }
        if (notification.type === 'achievement') {
            return ['#A8E6CF', '#56AB91'] as const;
        }
        if (notification.type === 'period') {
            return ['#FF6B9D', '#C44569'] as const;
        }
        if (notification.type === 'reminder') {
            return ['#FFB84D', '#FFD93D'] as const;
        }
        return ['#6C63FF', '#8B7FFF'] as const; // default
    };

    const gradientColors = getGradientColors();

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Decorative pattern */}
                <View style={styles.decorativePattern}>
                    <Text style={styles.decorativeEmoji}>{notification.emoji}</Text>
                    <Text style={styles.decorativeEmoji}>{notification.emoji}</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.emojiContainer}>
                        <Text style={styles.emoji}>{notification.emoji}</Text>
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>
                    </View>
                    {onDismiss && (
                        <TouchableOpacity
                            style={styles.dismissButton}
                            onPress={onDismiss}
                        >
                            <Text style={styles.dismissText}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        borderRadius: 18,
        marginVertical: 6,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    gradient: {
        borderRadius: 18,
        position: 'relative',
    },
    decorativePattern: {
        position: 'absolute',
        top: -10,
        right: -10,
        flexDirection: 'row',
        opacity: 0.12,
        transform: [{ rotate: '20deg' }],
    },
    decorativeEmoji: {
        fontSize: 50,
        marginLeft: -15,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    emojiContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    emoji: {
        fontSize: 28,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
        letterSpacing: 0.3,
        textShadowColor: 'rgba(0, 0, 0, 0.15)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    message: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.95)',
        lineHeight: 20,
        fontWeight: '500',
    },
    dismissButton: {
        padding: 6,
        marginLeft: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 14,
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    dismissText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '700',
    },
});
