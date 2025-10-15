import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface PinInputModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  title: string;
  subtitle?: string;
  mode?: 'setup' | 'verify' | 'change';
  requireConfirm?: boolean;
}

export function PinInputModal({
  visible,
  onClose,
  onSuccess,
  title,
  subtitle,
  mode = 'setup',
  requireConfirm = true,
}: PinInputModalProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'pin' | 'confirm'>('pin');
  const pinInputRef = useRef<TextInput>(null);
  const confirmInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setPin('');
      setConfirmPin('');
      setStep('pin');
      setTimeout(() => pinInputRef.current?.focus(), 100);
    }
  }, [visible]);

  const handlePinChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 6) {
      setPin(numericText);
    }
  };

  const handleConfirmPinChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= 6) {
      setConfirmPin(numericText);
    }
  };

  const handleContinue = () => {
    if (pin.length < 4) {
      Alert.alert('Hata', 'PIN en az 4 rakam olmalıdır');
      return;
    }

    if (requireConfirm && step === 'pin') {
      setStep('confirm');
      setTimeout(() => confirmInputRef.current?.focus(), 100);
    } else if (requireConfirm && step === 'confirm') {
      if (pin !== confirmPin) {
        Alert.alert('Hata', 'PIN kodları eşleşmiyor');
        setConfirmPin('');
        return;
      }
      onSuccess(pin);
      handleClose();
    } else {
      onSuccess(pin);
      handleClose();
    }
  };

  const handleClose = () => {
    setPin('');
    setConfirmPin('');
    setStep('pin');
    onClose();
  };

  const renderPinDots = (currentPin: string) => {
    return (
      <View style={styles.pinDotsContainer}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              index < currentPin.length && styles.pinDotFilled,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            {subtitle && <Text style={styles.modalSubtitle}>{subtitle}</Text>}
          </View>

          <View style={styles.modalContent}>
            {step === 'pin' ? (
              <>
                <Text style={styles.inputLabel}>
                  {mode === 'verify' ? 'PIN Kodunuzu Girin' : 'PIN Kodu Oluşturun'}
                </Text>
                <TextInput
                  ref={pinInputRef}
                  style={styles.hiddenInput}
                  value={pin}
                  onChangeText={handlePinChange}
                  keyboardType="number-pad"
                  maxLength={6}
                  secureTextEntry
                  autoFocus
                />
                {renderPinDots(pin)}
                <Text style={styles.helperText}>4-6 rakam giriniz</Text>
              </>
            ) : (
              <>
                <Text style={styles.inputLabel}>PIN Kodunu Onaylayın</Text>
                <TextInput
                  ref={confirmInputRef}
                  style={styles.hiddenInput}
                  value={confirmPin}
                  onChangeText={handleConfirmPinChange}
                  keyboardType="number-pad"
                  maxLength={6}
                  secureTextEntry
                />
                {renderPinDots(confirmPin)}
                <Text style={styles.helperText}>Aynı PIN kodunu tekrar girin</Text>
              </>
            )}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleClose}
            >
              <Text style={styles.secondaryButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleContinue}
              disabled={
                (step === 'pin' && pin.length < 4) ||
                (step === 'confirm' && confirmPin.length < 4)
              }
            >
              <Text style={styles.primaryButtonText}>
                {step === 'confirm' || !requireConfirm ? 'Tamam' : 'Devam'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    modalContainer: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 20,
      padding: 24,
      width: '85%',
      maxWidth: 400,
    },
    modalHeader: {
      marginBottom: 24,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    modalSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    modalContent: {
      alignItems: 'center',
      marginBottom: 24,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 20,
    },
    hiddenInput: {
      position: 'absolute',
      opacity: 0,
      height: 0,
      width: 0,
    },
    pinDotsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    pinDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: 'transparent',
    },
    pinDotFilled: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    helperText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    primaryButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    secondaryButton: {
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    secondaryButtonText: {
      color: theme.colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
  });
