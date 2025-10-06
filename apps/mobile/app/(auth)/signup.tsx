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
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';

export default function SignUpScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi girin');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Hata', 'Şifre en az 8 karakter olmalıdır');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register({
        email,
        password,
        displayName: displayName || undefined,
      });
      await setAuth(response.user, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Kayıt Hatası', error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(theme);

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
              <Text style={styles.emoji}>🌸</Text>
              <Text style={styles.title}>Sana Hoş Geldin!</Text>
              <Text style={styles.subtitle}>
                Sağlıklı yaşam yolculuğuna başlamak için hesap oluştur
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Ad Soyad (İsteğe bağlı)"
                placeholderTextColor={theme.colors.textLight}
                value={displayName}
                onChangeText={setDisplayName}
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="E-posta"
                placeholderTextColor={theme.colors.textLight}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="Şifre (en az 8 karakter)"
                placeholderTextColor={theme.colors.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.textOnPrimary} />
                ) : (
                  <Text style={styles.buttonText}>Hesap Oluştur</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.back()}
                disabled={loading}
                style={styles.linkContainer}
              >
                <Text style={styles.linkText}>
                  Zaten hesabın var mı?{' '}
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
      marginBottom: theme.spacing.md,
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
      marginTop: theme.spacing.md,
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
  });
