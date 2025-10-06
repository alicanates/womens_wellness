import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface StepButtonsProps {
  onNext: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  skipLabel?: string;
  backLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}

export function StepButtons({
  onNext,
  onSkip,
  onBack,
  nextLabel = 'İleri',
  skipLabel = 'Atla',
  backLabel = 'Geri',
  nextDisabled = false,
  loading = false,
}: StepButtonsProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {onSkip && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={onSkip}
          disabled={loading}
        >
          <Text style={styles.skipText}>{skipLabel}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.mainButtons}>
        {onBack && (
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={onBack}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>{backLabel}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            styles.nextButton,
            (nextDisabled || loading) && styles.buttonDisabled,
            !onBack && styles.fullWidth,
          ]}
          onPress={onNext}
          disabled={nextDisabled || loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.textOnPrimary} />
          ) : (
            <Text style={styles.nextButtonText}>{nextLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      marginTop: 'auto',
      paddingTop: theme.spacing.lg,
    },
    skipButton: {
      alignSelf: 'center',
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    skipText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textDecorationLine: 'underline',
    },
    mainButtons: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    button: {
      flex: 1,
      borderRadius: theme.button.borderRadius,
      padding: theme.button.padding,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 50,
    },
    fullWidth: {
      flex: 1,
    },
    nextButton: {
      backgroundColor: theme.colors.primary,
      shadowColor: theme.button.shadowColor,
      shadowOffset: theme.button.shadowOffset,
      shadowOpacity: theme.button.shadowOpacity,
      shadowRadius: theme.button.shadowRadius,
      elevation: theme.button.elevation,
    },
    backButton: {
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    nextButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    backButtonText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
  });
