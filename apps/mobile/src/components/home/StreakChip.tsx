import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface StreakChipProps {
  current: number;
  longest: number;
  onPress?: () => void;
}

export function StreakChip({ current, longest, onPress }: StreakChipProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.icon}>🔥</Text>
      <View style={styles.textContainer}>
        <Text style={styles.value}>{current}</Text>
        <Text style={styles.label}>gün seri</Text>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundCard,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    icon: {
      fontSize: 18,
      marginRight: 6,
    },
    textContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    },
    value: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
    },
    label: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
  });
