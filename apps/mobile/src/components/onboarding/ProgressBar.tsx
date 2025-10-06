import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const theme = useTheme();
  const progress = (currentStep / totalSteps) * 100;

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Adım {currentStep}/{totalSteps}
      </Text>
      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.lg,
    },
    text: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    barContainer: {
      height: 6,
      backgroundColor: theme.colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    barFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 3,
    },
  });
