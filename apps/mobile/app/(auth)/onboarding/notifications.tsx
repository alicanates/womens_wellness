import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Notifications from 'expo-notifications';
import { useTheme } from '@/hooks/useTheme';
import { useOnboardingStore } from '@/store/onboardingStore';
import { NotificationSchema, type NotificationInput } from '@/schemas/onboarding';
import { StepContainer } from '@/components/onboarding/StepContainer';
import { StepButtons } from '@/components/onboarding/StepButtons';

const TOTAL_STEPS = 6;

const INTENSITY_OPTIONS = [
  {
    value: 'light' as const,
    label: 'Hafif',
    emoji: '🔕',
    description: 'Sadece kritik adet hatırlatmaları ve haftalık özet',
  },
  {
    value: 'medium' as const,
    label: 'Orta',
    emoji: '🔔',
    description: 'Günlük hatırlatmalar ve öneriler',
  },
  {
    value: 'high' as const,
    label: 'Yoğun',
    emoji: '🔔🔔',
    description: 'Sık hatırlatmalar, ipuçları ve kişiselleştirilmiş öneriler',
  },
];

export default function NotificationsStep() {
  const router = useRouter();
  const theme = useTheme();
  const { data, updateData, completeStep, setCurrentStep } = useOnboardingStore();

  const [permissionGranted, setPermissionGranted] = useState(false);
  const [showQuietHours, setShowQuietHours] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
  } = useForm<NotificationInput>({
    resolver: zodResolver(NotificationSchema),
    defaultValues: {
      intensity: data.notificationIntensity || 'light',
      quietHoursStart: data.quietHoursStart,
      quietHoursEnd: data.quietHoursEnd,
    },
  });

  const intensity = watch('intensity');

  useEffect(() => {
    setCurrentStep(4);
  }, []);

  const requestNotificationPermission = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus === 'granted') {
      setPermissionGranted(true);
    } else {
      Alert.alert(
        'Bildirimler Kapalı',
        'Bildirimleri daha sonra ayarlardan açabilirsiniz.',
        [{ text: 'Tamam' }]
      );
    }
  };

  const onSubmit = async (formData: NotificationInput) => {
    await updateData({
      notificationIntensity: formData.intensity,
      quietHoursStart: formData.quietHoursStart,
      quietHoursEnd: formData.quietHoursEnd,
    });

    completeStep(4);
    router.push('/(auth)/onboarding/premium');
  };

  const handleBack = () => {
    router.back();
  };

  const styles = createStyles(theme);

  return (
    <StepContainer
      currentStep={4}
      totalSteps={TOTAL_STEPS}
      title="Bildirimler 🔔"
      subtitle="Bildirim tercihlerinizi seçin"
    >
      <View style={styles.content}>
        {/* Intensity Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirim Yoğunluğu</Text>
          <Controller
            control={control}
            name="intensity"
            render={({ field: { onChange, value } }) => (
              <View style={styles.optionsContainer}>
                {INTENSITY_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.option,
                      value === option.value && styles.optionSelected,
                    ]}
                    onPress={() => onChange(option.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionHeader}>
                      <Text style={styles.optionEmoji}>{option.emoji}</Text>
                      <Text
                        style={[
                          styles.optionLabel,
                          value === option.value && styles.optionLabelSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
        </View>

        {/* Quiet Hours */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.quietHoursToggle}
            onPress={() => setShowQuietHours(!showQuietHours)}
          >
            <Text style={styles.sectionTitle}>Sessiz Saatler (İsteğe bağlı)</Text>
            <Text style={styles.toggleIcon}>{showQuietHours ? '−' : '+'}</Text>
          </TouchableOpacity>

          {showQuietHours && (
            <View style={styles.quietHoursContent}>
              <Text style={styles.helperText}>
                Belirttiğiniz saatler arasında bildirim almayacaksınız
              </Text>
              {/* For simplicity, we'll skip time pickers and just show info */}
              <View style={styles.infoCard}>
                <Text style={styles.infoEmoji}>💡</Text>
                <Text style={styles.infoText}>
                  Sessiz saatler özelliğini kayıt sonrası ayarlardan özelleştirebilirsiniz
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Permission Request */}
        {!permissionGranted && (
          <View style={styles.permissionCard}>
            <Text style={styles.permissionTitle}>📱 Bildirim İzni</Text>
            <Text style={styles.permissionText}>
              Hatırlatmalarınızı alabilmek için bildirim iznine ihtiyacımız var
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestNotificationPermission}
            >
              <Text style={styles.permissionButtonText}>İzin Ver</Text>
            </TouchableOpacity>
          </View>
        )}

        {permissionGranted && (
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successText}>Bildirim izni verildi</Text>
          </View>
        )}
      </View>

      <StepButtons
        onNext={handleSubmit(onSubmit)}
        onBack={handleBack}
        nextLabel="İleri"
      />
    </StepContainer>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    content: {
      flex: 1,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      ...theme.typography.subtitle,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    optionsContainer: {
      gap: theme.spacing.md,
    },
    option: {
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.lg,
    },
    optionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    optionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    optionEmoji: {
      fontSize: 24,
      marginRight: theme.spacing.sm,
    },
    optionLabel: {
      ...theme.typography.subtitle,
      color: theme.colors.text,
      fontSize: 18,
    },
    optionLabelSelected: {
      color: theme.colors.primary,
    },
    optionDescription: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    quietHoursToggle: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    toggleIcon: {
      fontSize: 24,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    quietHoursContent: {
      marginTop: theme.spacing.md,
    },
    helperText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    infoCard: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    infoEmoji: {
      fontSize: 18,
      marginRight: theme.spacing.sm,
    },
    infoText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      flex: 1,
      lineHeight: 18,
    },
    permissionCard: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.lg,
      marginTop: theme.spacing.md,
    },
    permissionTitle: {
      ...theme.typography.subtitle,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    permissionText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
      lineHeight: 22,
    },
    permissionButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.button.borderRadius,
      padding: theme.spacing.md,
      alignItems: 'center',
    },
    permissionButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    successCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    successIcon: {
      fontSize: 20,
      marginRight: theme.spacing.sm,
      color: theme.colors.success,
    },
    successText: {
      ...theme.typography.body,
      color: theme.colors.success,
      fontWeight: '600',
    },
  });
