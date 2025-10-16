import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface CategoryBadgeProps {
    category: string;
    size?: 'small' | 'medium' | 'large';
}

export function CategoryBadge({ category, size = 'medium' }: CategoryBadgeProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    const categoryConfig = getCategoryConfig(category);

    const sizeStyles = {
        small: styles.badgeSmall,
        medium: styles.badgeMedium,
        large: styles.badgeLarge,
    };

    const textSizeStyles = {
        small: styles.badgeTextSmall,
        medium: styles.badgeTextMedium,
        large: styles.badgeTextLarge,
    };

    return (
        <View style={[styles.badge, sizeStyles[size], { backgroundColor: categoryConfig.color }]}>
            <Text style={[styles.badgeText, textSizeStyles[size]]}>
                {categoryConfig.label}
            </Text>
        </View>
    );
}

// Category configuration with colors and Turkish labels
function getCategoryConfig(category: string): { label: string; color: string } {
    const configs: Record<string, { label: string; color: string }> = {
        menstrual_health: { label: 'Regl Sağlığı', color: '#FF69B4' },
        pregnancy: { label: 'Hamilelik', color: '#D946EF' },
        fertility: { label: 'Doğurganlık', color: '#EC4899' },
        nutrition: { label: 'Beslenme', color: '#10B981' },
        exercise: { label: 'Egzersiz', color: '#3B82F6' },
        mental_health: { label: 'Mental Sağlık', color: '#8B5CF6' },
        sleep: { label: 'Uyku', color: '#6366F1' },
        hydration: { label: 'Hidrasyon', color: '#06B6D4' },
        contraception: { label: 'Doğum Kontrolü', color: '#F59E0B' },
        pms: { label: 'PMS', color: '#EF4444' },
        menopause: { label: 'Menopoz', color: '#F97316' },
        sexual_health: { label: 'Cinsel Sağlık', color: '#E91E63' },
    };

    return configs[category] || { label: category, color: '#9CA3AF' };
}

// Export category list for use in filters
export const ARTICLE_CATEGORIES = [
    { key: 'menstrual_health', label: 'Regl Sağlığı', color: '#FF69B4' },
    { key: 'pregnancy', label: 'Hamilelik', color: '#D946EF' },
    { key: 'fertility', label: 'Doğurganlık', color: '#EC4899' },
    { key: 'nutrition', label: 'Beslenme', color: '#10B981' },
    { key: 'exercise', label: 'Egzersiz', color: '#3B82F6' },
    { key: 'mental_health', label: 'Mental Sağlık', color: '#8B5CF6' },
    { key: 'sleep', label: 'Uyku', color: '#6366F1' },
    { key: 'hydration', label: 'Hidrasyon', color: '#06B6D4' },
    { key: 'contraception', label: 'Doğum Kontrolü', color: '#F59E0B' },
    { key: 'pms', label: 'PMS', color: '#EF4444' },
    { key: 'menopause', label: 'Menopoz', color: '#F97316' },
    { key: 'sexual_health', label: 'Cinsel Sağlık', color: '#E91E63' },
] as const;

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        badge: {
            borderRadius: 12,
            alignSelf: 'flex-start',
            justifyContent: 'center',
            alignItems: 'center',
        },
        badgeSmall: {
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 10,
        },
        badgeMedium: {
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
        },
        badgeLarge: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 14,
        },
        badgeText: {
            color: '#FFFFFF',
            fontWeight: '600',
            letterSpacing: 0.3,
        },
        badgeTextSmall: {
            fontSize: 10,
        },
        badgeTextMedium: {
            fontSize: 11,
        },
        badgeTextLarge: {
            fontSize: 12,
        },
    });
