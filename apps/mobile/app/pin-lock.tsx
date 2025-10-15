import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '@/hooks/useTheme';
import { userService } from '@/services/api';

export default function PinLockScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = createStyles(theme);

  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const pinInputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Auto-focus input
    setTimeout(() => pinInputRef.current?.focus(), 100);
  }, []);

  const handlePinChange = (text: string) => {
    if (isVerifying) return; // Prevent input during verification

    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 6) {
      setPin(numericText);

      // Don't auto-verify - wait for user to finish
      // User can press a button or we can add a small delay
    }
  };

  const verifyPin = async (pinCode: string) => {
    if (isVerifying) return;
    if (pinCode.length < 4) return;

    try {
      setIsVerifying(true);
      await userService.verifyPin(pinCode);

      // Success! Navigate to the app
      await SecureStore.setItemAsync('pinVerified', 'true');
      router.replace('/(tabs)/home');
    } catch (error: any) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 5) {
        // Too many attempts - logout
        Alert.alert(
          'Çok Fazla Hatalı Deneme',
          'Güvenlik nedeniyle oturumunuz kapatılacak.',
          [
            {
              text: 'Tamam',
              onPress: async () => {
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
                await SecureStore.deleteItemAsync('user');
                await SecureStore.deleteItemAsync('pinEnabled');
                await SecureStore.deleteItemAsync('pinVerified');
                router.replace('/(auth)/signin');
              },
            },
          ]
        );
      } else {
        Alert.alert('Hata', `Yanlış PIN. ${5 - newAttempts} deneme hakkınız kaldı.`, [
          {
            text: 'Tamam',
            onPress: () => {
              setPin('');
              setTimeout(() => pinInputRef.current?.focus(), 100);
            },
          },
        ]);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Add useEffect to auto-verify when PIN reaches expected length
  useEffect(() => {
    if (pin.length === 6 && !isVerifying) {
      verifyPin(pin);
    }
  }, [pin]);

  const handleForgotPin = () => {
    Alert.alert(
      'PIN Unuttum',
      'PIN kodunuzu unuttuysanız, yeniden giriş yapmanız gerekmektedir.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            await SecureStore.deleteItemAsync('user');
            await SecureStore.deleteItemAsync('pinEnabled');
            await SecureStore.deleteItemAsync('pinVerified');
            router.replace('/(auth)/signin');
          },
        },
      ]
    );
  };

  const renderPinDots = () => {
    return (
      <View style={styles.pinDotsContainer}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              index < pin.length && styles.pinDotFilled,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logo}>🔒</Text>
          <Text style={styles.title}>Wellness Companion</Text>
          <Text style={styles.subtitle}>PIN kodunuzu girin</Text>
        </View>

        <View style={styles.pinContainer}>
          <TextInput
            ref={pinInputRef}
            style={styles.hiddenInput}
            value={pin}
            onChangeText={handlePinChange}
            keyboardType="number-pad"
            maxLength={6}
            secureTextEntry
            autoFocus
            editable={!isVerifying}
          />
          {renderPinDots()}

          {isVerifying && (
            <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loader} />
          )}
        </View>

        <TouchableOpacity
          onPress={handleForgotPin}
          style={styles.forgotButton}
          disabled={isVerifying}
        >
          <Text style={styles.forgotText}>PIN'imi Unuttum</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    header: {
      alignItems: 'center',
      marginBottom: 60,
    },
    logo: {
      fontSize: 64,
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    pinContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    hiddenInput: {
      position: 'absolute',
      opacity: 0,
      height: 0,
      width: 0,
    },
    pinDotsContainer: {
      flexDirection: 'row',
      gap: 16,
    },
    pinDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: 'transparent',
    },
    pinDotFilled: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    loader: {
      marginTop: 20,
    },
    forgotButton: {
      padding: 12,
    },
    forgotText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '600',
    },
  });
