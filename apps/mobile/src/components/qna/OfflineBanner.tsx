import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useTheme } from '@/hooks/useTheme';

export function OfflineBanner() {
    const theme = useTheme();
    const styles = createStyles(theme);
    const { isConnected } = useNetworkStatus();
    const slideAnim = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (!isConnected) {
            // Slide down
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }).start();
        } else {
            // Slide up
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isConnected, slideAnim]);

    return (
        <Animated.View
            style={[
                styles.banner,
                {
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <Ionicons name="cloud-offline" size={20} color="#fff" />
            <Text style={styles.text}>İnternet bağlantısı yok</Text>
        </Animated.View>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        banner: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: '#EF4444',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 12,
            paddingHorizontal: theme.spacing.lg,
            zIndex: 1000,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
        },
        text: {
            fontSize: 14,
            fontWeight: '600',
            color: '#fff',
        },
    });
