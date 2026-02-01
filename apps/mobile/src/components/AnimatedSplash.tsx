import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Animated, ActivityIndicator } from 'react-native';

interface AnimatedSplashProps {
    onAnimationEnd?: () => void;
}

export function AnimatedSplash({ onAnimationEnd }: AnimatedSplashProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const [imageLoaded, setImageLoaded] = useState(false);
    const [forceEnd, setForceEnd] = useState(false);

    // Force end after 5 seconds no matter what
    useEffect(() => {
        const forceTimeout = setTimeout(() => {
            console.log('[Splash] Force ending after 5 seconds');
            setForceEnd(true);
            onAnimationEnd?.();
        }, 5000);

        return () => clearTimeout(forceTimeout);
    }, [onAnimationEnd]);

    // If image doesn't load in 3 seconds, skip splash
    useEffect(() => {
        if (imageLoaded || forceEnd) return;

        const loadTimeout = setTimeout(() => {
            if (!imageLoaded && !forceEnd) {
                console.log('[Splash] Image load timeout, skipping...');
                onAnimationEnd?.();
            }
        }, 3000);

        return () => clearTimeout(loadTimeout);
    }, [imageLoaded, forceEnd, onAnimationEnd]);

    useEffect(() => {
        if (!imageLoaded || forceEnd) return;

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

        // Auto hide after 2 seconds
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                if (!forceEnd) {
                    onAnimationEnd?.();
                }
            });
        }, 2000);

        return () => clearTimeout(timer);
    }, [fadeAnim, scaleAnim, onAnimationEnd, imageLoaded, forceEnd]);

    if (forceEnd) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: imageLoaded ? fadeAnim : 1,
                },
            ]}
        >
            {!imageLoaded && (
                <ActivityIndicator size="large" color="#FF69B4" />
            )}
            <Animated.Image
                source={require('../../assets/images/mascots/scbaby.gif')}
                style={[
                    styles.gif,
                    {
                        transform: [{ scale: scaleAnim }],
                        opacity: imageLoaded ? 1 : 0,
                    },
                ]}
                resizeMode="contain"
                onLoad={() => {
                    console.log('[Splash] Image loaded');
                    setImageLoaded(true);
                }}
                onError={(error) => {
                    console.error('[Splash] Image load error:', error);
                    if (!forceEnd) {
                        onAnimationEnd?.();
                    }
                }}
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    gif: {
        width: '80%',
        height: '80%',
    },
});
