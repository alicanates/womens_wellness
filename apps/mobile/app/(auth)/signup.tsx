import { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useOnboardingStore } from '@/store/onboardingStore';

export default function SignUpScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { loadDraft } = useOnboardingStore();

  useEffect(() => {
    // Load any saved draft when screen mounts
    loadDraft();
  }, []);

  const handleStartOnboarding = () => {
    router.push('/(auth)/onboarding/identity');
  };

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/mascot/5.png')}
            style={styles.mascot}
          />
          <Text style={styles.title}>Sana Hoş Geldin!</Text>
          <Text style={styles.subtitle}>
            Sağlıklı yaşam yolculuğuna başlamak için hesap oluştur
          </Text>
        </View>

        {/* Welcome Cards */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>📅</Text>
            <Text style={styles.featureText}>Adet döngüsü takibi</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>💬</Text>
            <Text style={styles.featureText}>AI asistan desteği</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>⏰</Text>
            <Text style={styles.featureText}>Akıllı hatırlatmalar</Text>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleStartOnboarding}
          >
            <Text style={styles.buttonText}>Başla 🚀</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>
              Zaten hesabın var mı?{' '}
              <Text style={styles.linkTextBold}>Giriş yap</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      justifyContent: 'space-between',
    },
    header: {
      alignItems: 'center',
      marginTop: theme.spacing.xxl,
    },
    mascot: {
      width: 140,
      height: 140,
      marginBottom: theme.spacing.lg,
      resizeMode: 'contain',
    },
    title: {
      ...theme.typography.title,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
      fontSize: 32,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: theme.spacing.lg,
      lineHeight: 24,
    },
    featuresContainer: {
      gap: theme.spacing.md,
    },
    featureCard: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: theme.card.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    featureEmoji: {
      fontSize: 32,
      marginRight: theme.spacing.md,
    },
    featureText: {
      ...theme.typography.body,
      color: theme.colors.text,
      fontWeight: '600',
      fontSize: 16,
    },
    ctaContainer: {
      marginBottom: theme.spacing.lg,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.button.borderRadius,
      padding: theme.button.padding,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      shadowColor: theme.button.shadowColor,
      shadowOffset: theme.button.shadowOffset,
      shadowOpacity: theme.button.shadowOpacity,
      shadowRadius: theme.button.shadowRadius,
      elevation: theme.button.elevation,
    },
    buttonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    linkContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
    },
    linkText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    linkTextBold: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
  });
