import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';

interface AnimatedSplashProps {
    onAnimationEnd?: () => void;
}

export function AnimatedSplash({ onAnimationEnd }: AnimatedSplashProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Fade in and scale animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto hide after 2.5 seconds
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                onAnimationEnd?.();
            });
        }, 2500);

        return () => clearTimeout(timer);
    }, [fadeAnim, scaleAnim, onAnimationEnd]);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                },
            ]}
        >
            <Animated.Image
                source={require('../../assets/images/mascots/scbaby.gif')}
                style={[
                    styles.gif,
                    {
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
                resizeMode="cover"
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#ffffff',
    },
    gif: {
        width: '100%',
        height: '100%',
    },
});
