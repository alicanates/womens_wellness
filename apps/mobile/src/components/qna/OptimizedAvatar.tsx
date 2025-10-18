import React, { useState, memo } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface OptimizedAvatarProps {
    imageUrl?: string | null;
    displayName?: string;
    size?: number;
    isAnonymous?: boolean;
}

/**
 * Optimized Avatar Component with Lazy Loading
 * 
 * Features:
 * - Lazy image loading with loading state
 * - Fallback to initials
 * - Anonymous mode support
 * - Memoized to prevent unnecessary re-renders
 * - Optimized image caching
 */
export const OptimizedAvatar = memo(function OptimizedAvatar({
    imageUrl,
    displayName,
    size = 36,
    isAnonymous = false,
}: OptimizedAvatarProps) {
    const theme = useTheme();
    const [isLoading, setIsLoading] = useState(!!imageUrl);
    const [hasError, setHasError] = useState(false);

    const styles = createStyles(theme, size);

    // Anonymous avatar
    if (isAnonymous) {
        return (
            <View style={[styles.container, styles.anonymousContainer]}>
                <Text style={{ fontSize: size * 0.5 }}>👤</Text>
            </View>
        );
    }

    // Show initials if no image or error
    const showInitials = !imageUrl || hasError;
    const initial = displayName?.charAt(0).toUpperCase() || '?';

    return (
        <View style={styles.container}>
            {showInitials ? (
                <View style={[styles.container, styles.initialsContainer]}>
                    <Text style={styles.initialsText}>{initial}</Text>
                </View>
            ) : (
                <>
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        onLoadStart={() => setIsLoading(true)}
                        onLoadEnd={() => setIsLoading(false)}
                        onError={() => {
                            setIsLoading(false);
                            setHasError(true);
                        }}
                        // Performance optimizations
                        resizeMode="cover"
                        fadeDuration={200}
                    />
                    {isLoading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="small" color={theme.colors.primary} />
                        </View>
                    )}
                </>
            )}
        </View>
    );
});

const createStyles = (theme: ReturnType<typeof useTheme>, size: number) =>
    StyleSheet.create({
        container: {
            width: size,
            height: size,
            borderRadius: size / 2,
            overflow: 'hidden',
        },
        anonymousContainer: {
            backgroundColor: theme.colors.border,
            justifyContent: 'center',
            alignItems: 'center',
        },
        initialsContainer: {
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        initialsText: {
            fontSize: size * 0.4,
            fontWeight: '700',
            color: '#fff',
        },
        image: {
            width: '100%',
            height: '100%',
        },
        loadingOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            justifyContent: 'center',
            alignItems: 'center',
        },
    });
