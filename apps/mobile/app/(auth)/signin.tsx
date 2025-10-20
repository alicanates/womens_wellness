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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';

export default function SignInScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { setAuth } = useAuthStore();
  const [identifier, setIdentifier] = useState(''); // Can be email or username
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!identifier || !password) {
      Alert.alert('Hata', 'Lütfen e-posta/kullanıcı adı ve şifrenizi girin');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({ identifier, password });
      await setAuth(response.user, {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Giriş Hatası', error.message || 'Bir hata oluştu');
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
              <Image
                source={require('../../assets/images/mascot/6.png')}
                style={styles.mascot}
              />
              <Text style={styles.title}>Tekrar Hoş Geldin!</Text>
              <Text style={styles.subtitle}>
                Sağlık yolculuğuna devam etmek için giriş yap
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="E-posta veya kullanıcı adı"
                placeholderTextColor={theme.colors.textLight}
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                editable={!loading}
              />

              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Şifre"
                  placeholderTextColor={theme.colors.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
                disabled={loading}
                style={styles.forgotPasswordContainer}
              >
                <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignIn}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.textOnPrimary} />
                ) : (
                  <Text style={styles.buttonText}>Giriş Yap</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(auth)/signup')}
                disabled={loading}
                style={styles.linkContainer}
              >
                <Text style={styles.linkText}>
                  Hesabın yok mu?{' '}
                  <Text style={styles.linkTextBold}>Hemen kayıt ol</Text>
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
    mascot: {
      width: 180,
      height: 180,
      marginBottom: theme.spacing.md,
      resizeMode: 'contain',
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
    passwordContainer: {
      position: 'relative',
      marginBottom: theme.spacing.md,
    },
    passwordInput: {
      paddingRight: 50,
      marginBottom: 0,
    },
    eyeButton: {
      position: 'absolute',
      right: theme.spacing.md,
      top: theme.spacing.md,
      padding: theme.spacing.xs,
    },
    eyeText: {
      fontSize: 20,
    },
    forgotPasswordContainer: {
      alignSelf: 'flex-end',
      marginBottom: theme.spacing.lg,
      marginTop: -theme.spacing.xs,
    },
    forgotPasswordText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '600',
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
  });
