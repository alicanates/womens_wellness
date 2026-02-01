import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';

interface AnimatedSplashProps {
    onAnimationEnd?: () => void;
}

export function AnimatedSplash({ onAnimationEnd }: AnimatedSplashProps) {
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const hasEnded = useRef(false);

    // Single function to end animation
    const endAnimation = () => {
        if (hasEnded.current) return;
        hasEnded.current = true;
        console.log('[Splash] Animation ending');

        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            if (onAnimationEnd) {
                onAnimationEnd();
            }
        });
    };

    // Absolute maximum timeout - 2 seconds
    useEffect(() => {
        const maxTimeout = setTimeout(() => {
            console.log('[Splash] Max timeout reached');
            endAnimation();
        }, 2000);

        return () => clearTimeout(maxTimeout);
    }, []);

    return (
        <Animated.View
            style={[
                styles.container,
                { opacity: fadeAnim },
            ]}
        >
            <Image
                source={require('../../assets/images/mascots/scbaby.gif')}
                style={styles.gif}
                resizeMode="contain"
                onError={() => {
                    console.log('[Splash] Image error');
                    endAnimation();
                }}
                onLoad={() => {
                    console.log('[Splash] Image loaded');
                    // End after 1 second of showing
                    setTimeout(endAnimation, 1000);
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
