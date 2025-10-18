import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { memo } from 'react';

interface TagChipProps {
    tag: string;
    onPress?: () => void;
    selected?: boolean;
    size?: 'small' | 'medium';
}

export const TagChip = memo(function TagChip({
    tag,
    onPress,
    selected = false,
    size = 'medium',
}: TagChipProps) {
    const theme = useTheme();
    const styles = createStyles(theme, size, selected);

    if (onPress) {
        return (
            <TouchableOpacity
                style={styles.container}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <Text style={styles.text}>#{tag}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>#{tag}</Text>
        </View>
    );
});

const createStyles = (
    theme: ReturnType<typeof useTheme>,
    size: 'small' | 'medium',
    selected: boolean
) => {
    const isSmall = size === 'small';

    return StyleSheet.create({
        container: {
            paddingHorizontal: isSmall ? 8 : 10,
            paddingVertical: isSmall ? 4 : 6,
            borderRadius: isSmall ? 10 : 12,
            backgroundColor: selected
                ? theme.colors.primary
                : theme.colors.background,
            borderWidth: 1,
            borderColor: selected
                ? theme.colors.primary
                : theme.colors.border,
        },
        text: {
            fontSize: isSmall ? 11 : 12,
            fontWeight: '600',
            color: selected
                ? '#fff'
                : theme.colors.textSecondary,
        },
    });
};
