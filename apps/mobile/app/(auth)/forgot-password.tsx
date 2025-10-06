import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { authService } from '@/services/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Hata', 'Lütfen e-posta adresinizi girin');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi girin');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setEmailSent(true);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(theme);

  if (emailSent) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.container}>
          <View style={styles.successContainer}>
            <Text style={styles.successEmoji}>✉️</Text>
            <Text style={styles.successTitle}>E-posta Gönderildi!</Text>
            <Text style={styles.successMessage}>
              Eğer {email} adresine kayıtlı bir hesap varsa, şifre sıfırlama bağlantısını içeren bir e-posta gönderilecektir.
            </Text>
            <Text style={styles.successHint}>
              E-postayı göremiyorsanız spam klasörünüzü kontrol edin.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Giriş Sayfasına Dön</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setEmailSent(false);
                setEmail('');
              }}
              style={styles.linkContainer}
            >
              <Text style={styles.linkText}>
                E-postayı almadınız mı?{' '}
                <Text style={styles.linkTextBold}>Tekrar gönder</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.emoji}>🔐</Text>
              <Text style={styles.title}>Şifreni mi Unuttun?</Text>
              <Text style={styles.subtitle}>
                Endişelenme! E-posta adresini gir, sana şifre sıfırlama bağlantısı gönderelim.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="E-posta"
                placeholderTextColor={theme.colors.textLight}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
                autoFocus
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleForgotPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.textOnPrimary} />
                ) : (
                  <Text style={styles.buttonText}>Sıfırlama Bağlantısı Gönder</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.back()}
                disabled={loading}
                style={styles.linkContainer}
              >
                <Text style={styles.linkText}>
                  Şifreni hatırladın mı?{' '}
                  <Text style={styles.linkTextBold}>Giriş yap</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing.xxl,
    },
    emoji: {
      fontSize: 64,
      marginBottom: theme.spacing.md,
    },
    title: {
      ...theme.typography.title,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: theme.spacing.lg,
      lineHeight: 24,
    },
    form: {
      width: '100%',
    },
    input: {
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderRadius: theme.button.borderRadius,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      fontSize: 16,
      color: theme.colors.text,
      shadowColor: theme.card.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
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
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 16,
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
    successContainer: {
      alignItems: 'center',
    },
    successEmoji: {
      fontSize: 80,
      marginBottom: theme.spacing.lg,
    },
    successTitle: {
      ...theme.typography.title,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    successMessage: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: theme.spacing.md,
      lineHeight: 24,
      marginBottom: theme.spacing.lg,
    },
    successHint: {
      fontSize: 14,
      color: theme.colors.textLight,
      textAlign: 'center',
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xxl,
      fontStyle: 'italic',
    },
  });
