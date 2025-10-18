import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback utilities for enhanced user experience
 * Provides consistent haptic feedback across the app
 */

export const haptics = {
    /**
     * Light impact - for subtle interactions like button taps
     */
    light: async () => {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            try {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch (error) {
                // Silently fail if haptics not available
            }
        }
    },

    /**
     * Medium impact - for standard interactions like selections
     */
    medium: async () => {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            try {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch (error) {
                // Silently fail if haptics not available
            }
        }
    },

    /**
     * Heavy impact - for important actions like confirmations
     */
    heavy: async () => {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            try {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } catch (error) {
                // Silently fail if haptics not available
            }
        }
    },

    /**
     * Success notification - for successful operations
     */
    success: async () => {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            try {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
                // Silently fail if haptics not available
            }
        }
    },

    /**
     * Warning notification - for warning messages
     */
    warning: async () => {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            try {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            } catch (error) {
                // Silently fail if haptics not available
            }
        }
    },

    /**
     * Error notification - for error messages
     */
    error: async () => {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            try {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } catch (error) {
                // Silently fail if haptics not available
            }
        }
    },

    /**
     * Selection changed - for picker/selector changes
     */
    selection: async () => {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            try {
                await Haptics.selectionAsync();
            } catch (error) {
                // Silently fail if haptics not available
            }
        }
    },
};
