import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuthStore } from '@/store/authStore';
import { StepContainer } from '@/components/onboarding/StepContainer';
import { StepButtons } from '@/components/onboarding/StepButtons';
import { authService, cyclesService, userService } from '@/services/api';

const TOTAL_STEPS = 6;

const TOUR_CARDS = [
  {
    emoji: '📅',
    title: 'Adet Takvimi',
    description:
      'Adet döngünüzü takip edin, tahminleri görün ve sağlığınızı daha iyi yönetin.',
  },
  {
    emoji: '⏰',
    title: 'Hatırlatmalar',
    description:
      'Su içme, ilaç alma ve diğer önemli görevler için hatırlatmalar oluşturun.',
  },
  {
    emoji: '💬',
    title: 'AI Asistan',
    description:
      'Sağlık soularınızı sorun, kişiselleştirilmiş öneriler alın ve günlük takibinizi yapın.',
  },
];

export default function TourStep() {
  const router = useRouter();
  const theme = useTheme();
  const { data, updateData, completeStep, setCurrentStep, clearData } = useOnboardingStore();
  const { setAuth } = useAuthStore();

  const [currentCard, setCurrentCard] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCurrentStep(6);
  }, []);

  const handleNext = () => {
    if (currentCard < TOUR_CARDS.length - 1) {
      setCurrentCard(currentCard + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleBack = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
    } else {
      router.back();
    }
  };

  const handleComplete = async () => {
    if (!data.email || !data.password || !data.username || !data.fullName || !data.birthDate) {
      Alert.alert('Hata', 'Lütfen tüm gerekli alanları doldurun');
      router.push('/(auth)/onboarding/identity');
      return;
    }

    setLoading(true);
    try {
      // Register user
      const response = await authService.register({
        email: data.email,
        password: data.password,
        displayName: data.fullName,
        // Additional fields - these would need to be added to the API
        // username: data.username,
        // birthDate: data.birthDate.toISOString(),
        // aiMemoryOptIn: data.aiMemoryOptIn,
        // notificationIntensity: data.notificationIntensity,
      });

      // Save auth tokens
      await setAuth(response.user, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });

      // Update profile with birth date, username and other onboarding data
      try {
        const profileUpdate: any = {};
        if (data.birthDate) {
          profileUpdate.birthDate = data.birthDate.toISOString();
        }
        if (data.username) {
          profileUpdate.username = data.username;
        }

        if (Object.keys(profileUpdate).length > 0) {
          await userService.updateMe(profileUpdate);
        }
      } catch (error) {
        console.error('Failed to update profile:', error);
        // Don't block registration if profile update fails
      }

      // If user provided last period date, create cycle
      if (data.lastPeriodDate) {
        try {
          await cyclesService.createCycle({
            startDate: data.lastPeriodDate.toISOString(),
          });
        } catch (error) {
          console.error('Failed to create initial cycle:', error);
          // Don't block registration if cycle creation fails
        }
      }

      // Complete onboarding
      completeStep(6);

      // Clear onboarding data
      await clearData();

      // Navigate to home
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Kayıt Hatası', error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const card = TOUR_CARDS[currentCard];
  const styles = createStyles(theme);

  return (
    <StepContainer
      currentStep={6}
      totalSteps={TOTAL_STEPS}
      title="Hızlı Tur 🎉"
      subtitle="Uygulamayı keşfet"
    >
      <View style={styles.content}>
        {/* Tour Card */}
        <View style={styles.tourCard}>
          <Text style={styles.cardEmoji}>{card.emoji}</Text>
          <Text style={styles.cardTitle}>{card.title}</Text>
          <Text style={styles.cardDescription}>{card.description}</Text>
        </View>

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {TOUR_CARDS.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentCard && styles.dotActive]}
            />
          ))}
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoEmoji}>🎯</Text>
          <Text style={styles.infoText}>
            {currentCard === TOUR_CARDS.length - 1
              ? 'Hazırsın! Sağlıklı yaşam yolculuğuna başla'
              : 'Bu özellikleri uygulamada keşfedebilirsin'}
          </Text>
        </View>
      </View>

      <StepButtons
        onNext={handleNext}
        onSkip={currentCard < TOUR_CARDS.length - 1 ? handleSkip : undefined}
        onBack={handleBack}
        nextLabel={
          currentCard === TOUR_CARDS.length - 1 ? 'Başla 🚀' : 'İleri'
        }
        skipLabel="Turu Atla"
        loading={loading}
      />
    </StepContainer>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    content: {
      flex: 1,
      justifyContent: 'center',
    },
    tourCard: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.xxl,
      alignItems: 'center',
      shadowColor: theme.card.shadowColor,
      shadowOffset: theme.card.shadowOffset,
      shadowOpacity: theme.card.shadowOpacity,
      shadowRadius: theme.card.shadowRadius,
      elevation: theme.card.elevation,
      marginBottom: theme.spacing.xl,
    },
    cardEmoji: {
      fontSize: 80,
      marginBottom: theme.spacing.lg,
    },
    cardTitle: {
      ...theme.typography.title,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
      fontSize: 28,
    },
    cardDescription: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: theme.spacing.md,
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.border,
    },
    dotActive: {
      backgroundColor: theme.colors.primary,
      width: 24,
    },
    infoCard: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
    },
    infoEmoji: {
      fontSize: 24,
      marginRight: theme.spacing.md,
    },
    infoText: {
      ...theme.typography.body,
      color: theme.colors.text,
      flex: 1,
      lineHeight: 22,
    },
  });
