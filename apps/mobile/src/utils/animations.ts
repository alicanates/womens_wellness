import { Animated, Easing } from 'react-native';

/**
 * Animation utilities for consistent animations across the app
 */

export const animations = {
    /**
     * Fade in animation
     */
    fadeIn: (animatedValue: Animated.Value, duration = 300) => {
        return Animated.timing(animatedValue, {
            toValue: 1,
            duration,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        });
    },

    /**
     * Fade out animation
     */
    fadeOut: (animatedValue: Animated.Value, duration = 300) => {
        return Animated.timing(animatedValue, {
            toValue: 0,
            duration,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
        });
    },

    /**
     * Scale in animation (pop effect)
     */
    scaleIn: (animatedValue: Animated.Value, duration = 200) => {
        return Animated.spring(animatedValue, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        });
    },

    /**
     * Scale out animation
     */
    scaleOut: (animatedValue: Animated.Value, duration = 200) => {
        return Animated.spring(animatedValue, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        });
    },

    /**
     * Slide in from bottom
     */
    slideInFromBottom: (animatedValue: Animated.Value, duration = 300) => {
        return Animated.timing(animatedValue, {
            toValue: 0,
            duration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        });
    },

    /**
     * Slide out to bottom
     */
    slideOutToBottom: (animatedValue: Animated.Value, distance: number, duration = 300) => {
        return Animated.timing(animatedValue, {
            toValue: distance,
            duration,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
        });
    },

    /**
     * Bounce animation
     */
    bounce: (animatedValue: Animated.Value) => {
        return Animated.sequence([
            Animated.timing(animatedValue, {
                toValue: 1.1,
                duration: 100,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 100,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }),
        ]);
    },

    /**
     * Shake animation (for errors)
     */
    shake: (animatedValue: Animated.Value) => {
        return Animated.sequence([
            Animated.timing(animatedValue, {
                toValue: 10,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
                toValue: -10,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
                toValue: 10,
                duration: 50,
                useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
                toValue: 0,
                duration: 50,
                useNativeDriver: true,
            }),
        ]);
    },

    /**
     * Pulse animation (for notifications)
     */
    pulse: (animatedValue: Animated.Value) => {
        return Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1.05,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );
    },
};

/**
 * Preset animation configs
 */
export const animationPresets = {
    quick: { duration: 150 },
    normal: { duration: 300 },
    slow: { duration: 500 },
    spring: {
        friction: 8,
        tension: 40,
    },
    bouncy: {
        friction: 5,
        tension: 40,
    },
};
