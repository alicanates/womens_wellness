import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { QuestionCategory } from '@/types/qna';
import { memo } from 'react';

interface CategoryPillProps {
    category: QuestionCategory;
    size?: 'small' | 'medium';
}

export const CategoryPill = memo(function CategoryPill({
    category,
    size = 'medium',
}: CategoryPillProps) {
    const theme = useTheme();
    const styles = createStyles(theme, size);
    const config = getCategoryConfig(category);

    return (
        <View style={[styles.container, { backgroundColor: config.backgroundColor }]}>
            <Text style={styles.icon}>{config.icon}</Text>
            <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
        </View>
    );
});

interface CategoryConfig {
    label: string;
    icon: string;
    color: string;
    backgroundColor: string;
}

function getCategoryConfig(category: QuestionCategory): CategoryConfig {
    const configs: Record<QuestionCategory, CategoryConfig> = {
        [QuestionCategory.MENSTRUAL_HEALTH]: {
            label: 'Adet Sağlığı',
            icon: '🩸',
            color: '#DC2626',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
        },
        [QuestionCategory.PREGNANCY]: {
            label: 'Hamilelik',
            icon: '🤰',
            color: '#EC4899',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
        },
        [QuestionCategory.FERTILITY]: {
            label: 'Doğurganlık',
            icon: '🌸',
            color: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
        },
        [QuestionCategory.NUTRITION]: {
            label: 'Beslenme',
            icon: '🥗',
            color: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
        },
        [QuestionCategory.EXERCISE]: {
            label: 'Egzersiz',
            icon: '💪',
            color: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
        },
        [QuestionCategory.MENTAL_HEALTH]: {
            label: 'Ruh Sağlığı',
            icon: '🧠',
            color: '#8B5CF6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
        },
        [QuestionCategory.SLEEP]: {
            label: 'Uyku',
            icon: '😴',
            color: '#6366F1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
        },
        [QuestionCategory.CONTRACEPTION]: {
            label: 'Doğum Kontrolü',
            icon: '💊',
            color: '#06B6D4',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
        },
        [QuestionCategory.PMS]: {
            label: 'PMS',
            icon: '😣',
            color: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
        },
        [QuestionCategory.MENOPAUSE]: {
            label: 'Menopoz',
            icon: '🌡️',
            color: '#F97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
        },
        [QuestionCategory.SEXUAL_HEALTH]: {
            label: 'Cinsel Sağlık',
            icon: '❤️',
            color: '#E11D48',
            backgroundColor: 'rgba(225, 29, 72, 0.1)',
        },
        [QuestionCategory.GENERAL]: {
            label: 'Genel',
            icon: '💬',
            color: '#64748B',
            backgroundColor: 'rgba(100, 116, 139, 0.1)',
        },
    };

    return configs[category] || configs[QuestionCategory.GENERAL];
}

const createStyles = (theme: ReturnType<typeof useTheme>, size: 'small' | 'medium') => {
    const isSmall = size === 'small';

    return StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: isSmall ? 4 : 6,
            paddingHorizontal: isSmall ? 8 : 10,
            paddingVertical: isSmall ? 4 : 6,
            borderRadius: isSmall ? 10 : 12,
        },
        icon: {
            fontSize: isSmall ? 12 : 14,
        },
        text: {
            fontSize: isSmall ? 11 : 12,
            fontWeight: '600',
        },
    });
};
