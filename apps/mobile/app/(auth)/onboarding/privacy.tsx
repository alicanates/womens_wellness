import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '@/hooks/useTheme';
import { useOnboardingStore } from '@/store/onboardingStore';
import { ConsentSchema, type ConsentInput } from '@/schemas/onboarding';
import { StepContainer } from '@/components/onboarding/StepContainer';
import { StepButtons } from '@/components/onboarding/StepButtons';

const TOTAL_STEPS = 6;

export default function PrivacyStep() {
  const router = useRouter();
  const theme = useTheme();
  const { data, updateData, completeStep, setCurrentStep } = useOnboardingStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ConsentInput>({
    resolver: zodResolver(ConsentSchema),
    mode: 'onChange',
    defaultValues: {
      acceptPrivacy: data.acceptPrivacy || false,
      aiMemoryOptIn: data.aiMemoryOptIn || false,
    },
  });

  useEffect(() => {
    setCurrentStep(3);
  }, []);

  const onSubmit = async (formData: ConsentInput) => {
    await updateData({
      acceptPrivacy: formData.acceptPrivacy,
      aiMemoryOptIn: formData.aiMemoryOptIn,
    });

    completeStep(3);
    router.push('/(auth)/onboarding/notifications');
  };

  const handleBack = () => {
    router.back();
  };

  const openPrivacyPolicy = () => {
    router.push('/settings/privacy-policy' as any);
  };

  const styles = createStyles(theme);

  return (
    <StepContainer
      currentStep={3}
      totalSteps={TOTAL_STEPS}
      title="Gizlilik ve İzinler 🔒"
      subtitle="Verileriniz güvende. İzinlerinizi yönetin."
    >
      <View style={styles.content}>
        {/* Privacy Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KVKK ve Gizlilik Politikası</Text>
          <Text style={styles.sectionText}>
            Kişisel verileriniz KVKK kapsamında güvenle saklanır. Verileriniz yalnızca size daha iyi hizmet sunmak için kullanılır.
          </Text>
          <TouchableOpacity onPress={openPrivacyPolicy} style={styles.link}>
            <Text style={styles.linkText}>Gizlilik politikasını oku →</Text>
          </TouchableOpacity>
        </View>

        {/* Consent Checkboxes */}
        <View style={styles.consentsContainer}>
          {/* Required: Privacy Policy */}
          <Controller
            control={control}
            name="acceptPrivacy"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => onChange(!value)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                  {value && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.checkboxTextContainer}>
                  <Text style={styles.checkboxLabel}>
                    Gizlilik politikasını ve kullanım koşullarını kabul ediyorum
                    <Text style={styles.required}> *</Text>
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
          {errors.acceptPrivacy && (
            <Text style={styles.errorText}>{errors.acceptPrivacy.message}</Text>
          )}

          {/* Optional: AI Memory */}
          <View style={styles.divider} />

          <Controller
            control={control}
            name="aiMemoryOptIn"
            render={({ field: { onChange, value } }) => (
              <View>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => onChange(!value)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                    {value && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.checkboxTextContainer}>
                    <Text style={styles.checkboxLabel}>
                      AI asistanın beni hatırlamasına izin ver
                    </Text>
                    <Text style={styles.checkboxSubtext}>
                      İsteğe bağlı: AI asistanınız, size daha kişisel öneriler sunmak için önceki sohbetlerinizi ve tercihleri hatırlayabilir. Bu izni istediğiniz zaman değiştirebilirsiniz.
                    </Text>
                  </View>
                </TouchableOpacity>
                {value && (
                  <View style={styles.infoCard}>
                    <Text style={styles.infoEmoji}>💡</Text>
                    <Text style={styles.infoText}>
                      AI hafızası sayesinde asistanınız sizi daha iyi tanıyacak ve önerilerini kişiselleştirecek. Dilediğiniz zaman "Herşeyi unut" özelliğiyle tüm hafızayı silebilirsiniz.
                    </Text>
                  </View>
                )}
              </View>
            )}
          />
        </View>
      </View>

      <StepButtons
        onNext={handleSubmit(onSubmit)}
        onBack={handleBack}
        nextDisabled={!isValid}
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
      marginBottom: theme.spacing.sm,
    },
    sectionText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      lineHeight: 22,
      marginBottom: theme.spacing.md,
    },
    link: {
      paddingVertical: theme.spacing.xs,
    },
    linkText: {
      ...theme.typography.body,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    consentsContainer: {
      marginTop: theme.spacing.lg,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.lg,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
      marginTop: 2,
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    checkmark: {
      color: theme.colors.textOnPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    checkboxTextContainer: {
      flex: 1,
    },
    checkboxLabel: {
      ...theme.typography.body,
      color: theme.colors.text,
      lineHeight: 22,
    },
    required: {
      color: theme.colors.error,
    },
    checkboxSubtext: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
      lineHeight: 18,
    },
    errorText: {
      ...theme.typography.caption,
      color: theme.colors.error,
      marginTop: -theme.spacing.md,
      marginBottom: theme.spacing.md,
      marginLeft: 40,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.lg,
    },
    infoCard: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.md,
      marginTop: theme.spacing.md,
      marginLeft: 40,
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
  });
