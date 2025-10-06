import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useOnboardingStore } from '@/store/onboardingStore';
import { StepContainer } from '@/components/onboarding/StepContainer';
import { StepButtons } from '@/components/onboarding/StepButtons';

const TOTAL_STEPS = 6;

const FEATURES = {
  free: [
    { icon: '💬', text: 'Ayda 100 AI mesajı' },
    { icon: '📊', text: 'Temel sağlık takibi' },
    { icon: '📅', text: 'Adet takvimi ve tahmin' },
    { icon: '💧', text: 'Su takibi' },
    { icon: '⏰', text: 'Temel hatırlatmalar' },
  ],
  premium: [
    { icon: '🤖', text: 'Güçlü AI - Gelişmiş hafıza' },
    { icon: '⚡', text: 'Öncelikli ve hızlı yanıtlar' },
    { icon: '💬', text: 'Ayda 1000 AI mesajı' },
    { icon: '✨', text: 'Özel özellikler ve öneriler' },
    { icon: '🎯', text: 'Kişiselleştirilmiş içgörüler' },
    { icon: '📈', text: 'Gelişmiş analizler' },
  ],
};

export default function PremiumStep() {
  const router = useRouter();
  const theme = useTheme();
  const { data, updateData, completeStep, setCurrentStep } = useOnboardingStore();

  useEffect(() => {
    setCurrentStep(5);
  }, []);

  const handleSelectFree = async () => {
    await updateData({ selectedPlan: 'free' });
    completeStep(5);
    router.push('/(auth)/onboarding/tour');
  };

  const handleSelectPremium = async () => {
    await updateData({ selectedPlan: 'premium' });
    completeStep(5);
    // For now, just redirect to tour (purchase flow would be separate)
    router.push('/(auth)/onboarding/tour');
  };

  const handleBack = () => {
    router.back();
  };

  const styles = createStyles(theme);

  return (
    <StepContainer
      currentStep={5}
      totalSteps={TOTAL_STEPS}
      title="Plan Seç ✨"
      subtitle="Size en uygun planı seçin"
    >
      <View style={styles.content}>
        <View style={styles.highlightCard}>
          <Text style={styles.highlightEmoji}>🎯</Text>
          <Text style={styles.highlightTitle}>Premium'un Farkı: Güçlü AI</Text>
          <Text style={styles.highlightText}>
            Premium planla AI asistanınız sizi daha iyi hatırlıyor, daha hızlı yanıt veriyor ve size özel öneriler sunuyor.
          </Text>
        </View>

        <View style={styles.plansContainer}>
          {/* Free Plan */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Ücretsiz</Text>
              <Text style={styles.planPrice}>₺0</Text>
            </View>
            <View style={styles.featuresList}>
              {FEATURES.free.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Premium Plan */}
          <View style={[styles.planCard, styles.premiumCard]}>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>ÖNER İLEN</Text>
            </View>
            <View style={styles.planHeader}>
              <Text style={[styles.planName, styles.premiumText]}>Premium</Text>
              <View>
                <Text style={[styles.planPrice, styles.premiumText]}>₺99</Text>
                <Text style={styles.planPeriod}>/ ay</Text>
              </View>
            </View>
            <View style={styles.featuresList}>
              {FEATURES.premium.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteText}>
            💡 İstediğiniz zaman plan değiştirebilirsiniz
          </Text>
        </View>
      </View>

      <StepButtons
        onNext={handleSelectFree}
        onBack={handleBack}
        nextLabel="Ücretsiz ile Devam Et"
      />

      {/* Alternative Premium button */}
      <View style={styles.premiumButtonContainer}>
        <Text style={styles.orText}>veya</Text>
        <StepButtons
          onNext={handleSelectPremium}
          nextLabel="Premium ile Başla →"
        />
      </View>
    </StepContainer>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    content: {
      flex: 1,
    },
    highlightCard: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      alignItems: 'center',
    },
    highlightEmoji: {
      fontSize: 40,
      marginBottom: theme.spacing.sm,
    },
    highlightTitle: {
      ...theme.typography.subtitle,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    highlightText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    plansContainer: {
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    planCard: {
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.lg,
      position: 'relative',
    },
    premiumCard: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    premiumBadge: {
      position: 'absolute',
      top: -10,
      right: 20,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: 12,
    },
    premiumBadgeText: {
      color: theme.colors.textOnPrimary,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    planHeader: {
      marginBottom: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    planName: {
      ...theme.typography.subtitle,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    planPrice: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.text,
    },
    planPeriod: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    premiumText: {
      color: theme.colors.primary,
    },
    featuresList: {
      gap: theme.spacing.md,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    featureIcon: {
      fontSize: 20,
      marginRight: theme.spacing.sm,
      width: 28,
    },
    featureText: {
      ...theme.typography.body,
      color: theme.colors.text,
      flex: 1,
    },
    note: {
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    noteText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    premiumButtonContainer: {
      marginTop: theme.spacing.md,
    },
    orText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
  });
