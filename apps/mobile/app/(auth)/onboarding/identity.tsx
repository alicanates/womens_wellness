import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/hooks/useTheme';
import { useOnboardingStore } from '@/store/onboardingStore';
import { IdentitySchema, type IdentityInput, calculatePasswordStrength } from '@/schemas/onboarding';
import { StepContainer } from '@/components/onboarding/StepContainer';
import { StepButtons } from '@/components/onboarding/StepButtons';
import { api } from '@/services/api';

const TOTAL_STEPS = 6;

export default function IdentityStep() {
  const router = useRouter();
  const theme = useTheme();
  const { data, updateData, completeStep, setCurrentStep } = useOnboardingStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempBirthDate, setTempBirthDate] = useState<Date | null>(null);
  const [birthDateSaved, setBirthDateSaved] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<IdentityInput>({
    resolver: zodResolver(IdentitySchema),
    mode: 'onChange',
    defaultValues: {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      username: data.username || '',
      email: data.email || '',
      birthDate: data.birthDate,
      password: data.password || '',
    },
  });

  const password = watch('password');
  const username = watch('username');
  const email = watch('email');
  const birthDate = watch('birthDate');
  const passwordStrength = password ? calculatePasswordStrength(password) : null;

  // Initialize birth date saved state
  useEffect(() => {
    if (birthDate) {
      setBirthDateSaved(true);
    }
  }, []);

  // Check username availability
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const response = await api.get<{ available: boolean }>(
          `/auth/check-username?username=${encodeURIComponent(username)}`,
          false
        );
        setUsernameAvailable(response.available);
      } catch (error) {
        console.error('Username check failed:', error);
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  // Check email availability
  useEffect(() => {
    if (!email || !email.includes('@')) {
      setEmailAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const response = await api.get<{ available: boolean }>(
          `/auth/check-email?email=${encodeURIComponent(email)}`,
          false
        );
        setEmailAvailable(response.available);
      } catch (error) {
        console.error('Email check failed:', error);
        setEmailAvailable(null);
      } finally {
        setCheckingEmail(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  useEffect(() => {
    setCurrentStep(1);
  }, []);

  const onSubmit = async (formData: IdentityInput) => {
    if (usernameAvailable === false) {
      Alert.alert('Hata', 'Bu kullanıcı adı zaten kullanılıyor');
      return;
    }

    if (emailAvailable === false) {
      Alert.alert('Hata', 'Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin.');
      return;
    }

    await updateData({
      firstName: formData.firstName,
      lastName: formData.lastName,
      username: formData.username,
      email: formData.email,
      birthDate: formData.birthDate,
      password: formData.password,
    });

    completeStep(1);
    router.push('/(auth)/onboarding/period');
  };

  const styles = createStyles(theme);

  return (
    <StepContainer
      currentStep={1}
      totalSteps={TOTAL_STEPS}
      title="Hoş Geldin! 🌸"
      subtitle="Sağlıklı yaşam yolculuğuna başlamak için bilgilerini gir"
    >
      <View style={styles.form}>
        {/* First Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ad</Text>
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                placeholder="Adın"
                placeholderTextColor={theme.colors.textLight}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.firstName && (
            <Text style={styles.errorText}>{errors.firstName.message}</Text>
          )}
        </View>

        {/* Last Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Soyad</Text>
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                placeholder="Soyadın"
                placeholderTextColor={theme.colors.textLight}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
          {errors.lastName && (
            <Text style={styles.errorText}>{errors.lastName.message}</Text>
          )}
        </View>

        {/* Username */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kullanıcı Adı</Text>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  style={[styles.input, errors.username && styles.inputError]}
                  placeholder="kullaniciadi"
                  placeholderTextColor={theme.colors.textLight}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                />
                {checkingUsername && (
                  <Text style={styles.helperText}>Kontrol ediliyor...</Text>
                )}
                {!checkingUsername && usernameAvailable === true && (
                  <Text style={styles.successText}>✓ Kullanılabilir</Text>
                )}
                {!checkingUsername && usernameAvailable === false && (
                  <Text style={styles.errorText}>✗ Bu kullanıcı adı alınmış</Text>
                )}
              </View>
            )}
          />
          {errors.username && (
            <Text style={styles.errorText}>{errors.username.message}</Text>
          )}
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-posta</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  placeholder="ornek@email.com"
                  placeholderTextColor={theme.colors.textLight}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {checkingEmail && (
                  <Text style={styles.helperText}>Kontrol ediliyor...</Text>
                )}
                {!checkingEmail && emailAvailable === true && (
                  <Text style={styles.successText}>✓ Kullanılabilir</Text>
                )}
                {!checkingEmail && emailAvailable === false && (
                  <Text style={styles.errorText}>✗ Bu e-posta zaten kayıtlı</Text>
                )}
              </View>
            )}
          />
          {errors.email && (
            <Text style={styles.errorText}>{errors.email.message}</Text>
          )}
        </View>

        {/* Birth Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Doğum Tarihi</Text>
          <Controller
            control={control}
            name="birthDate"
            render={({ field: { onChange, value } }) => (
              <>
                {!birthDateSaved ? (
                  <>
                    <TouchableOpacity
                      style={[styles.input, styles.dateInput, errors.birthDate && styles.inputError]}
                      onPress={() => {
                        setShowDatePicker(true);
                        setTempBirthDate(value || new Date());
                      }}
                    >
                      <Text style={value ? styles.dateText : styles.datePlaceholder}>
                        {value
                          ? value.toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Doğum tarihini seç'}
                      </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <View style={styles.datePickerContainer}>
                        <DateTimePicker
                          value={tempBirthDate || value || new Date()}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={(event, selectedDate) => {
                            if (Platform.OS === 'android') {
                              setShowDatePicker(false);
                              if (selectedDate) {
                                onChange(selectedDate);
                                setBirthDateSaved(true);
                              }
                            } else {
                              if (selectedDate) {
                                setTempBirthDate(selectedDate);
                              }
                            }
                          }}
                          maximumDate={new Date()}
                        />
                        {Platform.OS === 'ios' && (
                          <View style={styles.datePickerButtons}>
                            <TouchableOpacity
                              style={[styles.datePickerButton, styles.datePickerButtonCancel]}
                              onPress={() => {
                                setShowDatePicker(false);
                                setTempBirthDate(null);
                              }}
                            >
                              <Text style={styles.datePickerButtonTextCancel}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.datePickerButton, styles.datePickerButtonSave]}
                              onPress={() => {
                                if (tempBirthDate) {
                                  onChange(tempBirthDate);
                                  setBirthDateSaved(true);
                                }
                                setShowDatePicker(false);
                              }}
                            >
                              <Text style={styles.datePickerButtonTextSave}>Kaydet</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    )}
                  </>
                ) : (
                  <View style={styles.savedDateContainer}>
                    <View style={styles.savedDate}>
                      <Text style={styles.savedDateText}>
                        {value
                          ? value.toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : ''}
                      </Text>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => {
                          setBirthDateSaved(false);
                          setShowDatePicker(true);
                          setTempBirthDate(value || new Date());
                        }}
                      >
                        <Text style={styles.editButtonText}>Düzenle</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}
          />
          {errors.birthDate && (
            <Text style={styles.errorText}>{errors.birthDate.message}</Text>
          )}
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Şifre</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      errors.password && styles.inputError,
                    ]}
                    placeholder="En az 8 karakter"
                    placeholderTextColor={theme.colors.textLight}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>
                {passwordStrength && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBar}>
                      <View
                        style={[
                          styles.strengthFill,
                          {
                            width: `${(passwordStrength.score / 6) * 100}%`,
                            backgroundColor: passwordStrength.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                      {passwordStrength.label}
                    </Text>
                  </View>
                )}
              </View>
            )}
          />
          {errors.password && (
            <Text style={styles.errorText}>{errors.password.message}</Text>
          )}
        </View>
      </View>

      <StepButtons
        onNext={handleSubmit(onSubmit)}
        nextDisabled={!isValid || usernameAvailable === false || emailAvailable === false}
      />
    </StepContainer>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    form: {
      flex: 1,
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
    inputError: {
      borderColor: theme.colors.error,
    },
    passwordContainer: {
      position: 'relative',
    },
    passwordInput: {
      paddingRight: 50,
    },
    eyeButton: {
      position: 'absolute',
      right: theme.spacing.md,
      top: theme.spacing.md,
    },
    eyeText: {
      fontSize: 20,
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
    errorText: {
      ...theme.typography.caption,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    helperText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    successText: {
      ...theme.typography.caption,
      color: theme.colors.success,
      marginTop: theme.spacing.xs,
    },
    strengthContainer: {
      marginTop: theme.spacing.sm,
    },
    strengthBar: {
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      overflow: 'hidden',
      marginBottom: theme.spacing.xs,
    },
    strengthFill: {
      height: '100%',
      borderRadius: 2,
    },
    strengthLabel: {
      ...theme.typography.caption,
      fontWeight: '600',
    },
    datePickerContainer: {
      marginTop: theme.spacing.md,
    },
    datePickerButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    datePickerButton: {
      flex: 1,
      padding: theme.spacing.md,
      borderRadius: theme.button.borderRadius,
      alignItems: 'center',
    },
    datePickerButtonCancel: {
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    datePickerButtonSave: {
      backgroundColor: theme.colors.primary,
    },
    datePickerButtonTextCancel: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    datePickerButtonTextSave: {
      color: theme.colors.textOnPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    savedDateContainer: {
      marginTop: theme.spacing.xs,
    },
    savedDate: {
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderRadius: theme.button.borderRadius,
      padding: theme.spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    savedDateText: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: '600',
    },
    editButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
    },
    editButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
  });
