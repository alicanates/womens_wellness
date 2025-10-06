import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/hooks/useTheme';
import { useOnboardingStore } from '@/store/onboardingStore';
import { PeriodSchema, type PeriodInput } from '@/schemas/onboarding';
import { StepContainer } from '@/components/onboarding/StepContainer';
import { StepButtons } from '@/components/onboarding/StepButtons';

const TOTAL_STEPS = 6;

export default function PeriodStep() {
  const router = useRouter();
  const theme = useTheme();
  const { data, updateData, completeStep, setCurrentStep } = useOnboardingStore();

  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
  } = useForm<PeriodInput>({
    resolver: zodResolver(PeriodSchema),
    defaultValues: {
      lastPeriodDate: data.lastPeriodDate,
    },
  });

  const lastPeriodDate = watch('lastPeriodDate');

  useEffect(() => {
    setCurrentStep(2);
  }, []);

  const onSubmit = async (formData: PeriodInput) => {
    await updateData({
      lastPeriodDate: formData.lastPeriodDate,
    });

    completeStep(2);
    router.push('/(auth)/onboarding/privacy');
  };

  const handleSkip = async () => {
    await updateData({ lastPeriodDate: undefined });
    completeStep(2);
    router.push('/(auth)/onboarding/privacy');
  };

  const handleBack = () => {
    router.back();
  };

  const styles = createStyles(theme);

  return (
    <StepContainer
      currentStep={2}
      totalSteps={TOTAL_STEPS}
      title="Adet Takibi 📅"
      subtitle="Son adet döngünü kaydet (isteğe bağlı). Bu bilgi takviminde tahmin yapmamıza yardımcı olur."
    >
      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoEmoji}>💡</Text>
          <Text style={styles.infoText}>
            Bu bilgi tamamen isteğe bağlıdır. İstersenin daha sonra ekleyebilir veya tamamen atlamayı seçebilirsiniz.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Son Adet Başlangıç Tarihi</Text>
          <Controller
            control={control}
            name="lastPeriodDate"
            render={({ field: { onChange, value } }) => (
              <>
                <TouchableOpacity
                  style={[styles.input, styles.dateInput]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={value ? styles.dateText : styles.datePlaceholder}>
                    {value
                      ? value.toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Tarih seç'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={value || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        onChange(selectedDate);
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )}
              </>
            )}
          />
          {lastPeriodDate && (
            <Text style={styles.helperText}>
              Takvimde tahmin görebilmek için kaydet
            </Text>
          )}
        </View>
      </View>

      <StepButtons
        onNext={handleSubmit(onSubmit)}
        onSkip={handleSkip}
        onBack={handleBack}
        nextLabel={lastPeriodDate ? 'Kaydet ve İleri' : 'İleri'}
      />
    </StepContainer>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    content: {
      flex: 1,
    },
    infoCard: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    infoEmoji: {
      fontSize: 24,
      marginRight: theme.spacing.md,
    },
    infoText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      flex: 1,
      lineHeight: 22,
    },
    inputGroup: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      ...theme.typography.body,
      color: theme.colors.text,
      fontWeight: '600',
      marginBottom: theme.spacing.sm,
    },
    input: {
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: theme.button.borderRadius,
      padding: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.text,
    },
    dateInput: {
      justifyContent: 'center',
    },
    dateText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    datePlaceholder: {
      fontSize: 16,
      color: theme.colors.textLight,
    },
    helperText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
  });
