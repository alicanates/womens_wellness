import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { WellnessTile } from './WellnessTile';
import { useTheme } from '@/hooks/useTheme';
import { wellnessService } from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

interface SleepTileProps {
  data: {
    lastNightMin: number;
    goalHours: number;
    percentage: number;
    quality?: string;
  } | null;
}

export const SleepTile: React.FC<SleepTileProps> = ({ data }) => {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [hoursInput, setHoursInput] = useState('');
  const [selectedQuality, setSelectedQuality] = useState<'good' | 'medium' | 'poor' | undefined>();

  const logSleepMutation = useMutation({
    mutationFn: (params: { durationMin: number; quality?: 'good' | 'medium' | 'poor' }) => {
      // Get yesterday's date at midnight in UTC (matching backend logic)
      const now = new Date();
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      const yesterday = new Date(today);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);

      return wellnessService.logSleep({
        sleepDate: yesterday.toISOString(),
        durationMin: params.durationMin,
        quality: params.quality,
        isManual: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });
      queryClient.invalidateQueries({ queryKey: ['sleep'] });
      setModalVisible(false);
      setHoursInput('');
      setSelectedQuality(undefined);
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Uyku kaydedilemedi');
    },
  });

  const handleQuickLog = (hours: number) => {
    logSleepMutation.mutate({ durationMin: hours * 60 });
  };

  const handleManualSave = () => {
    const hours = parseFloat(hoursInput.replace(',', '.'));
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      Alert.alert('Hata', 'Lütfen geçerli bir uyku süresi girin (0-24 saat)');
      return;
    }
    logSleepMutation.mutate({ durationMin: Math.round(hours * 60), quality: selectedQuality });
  };

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} s`;
    return `${hours} s ${mins} dk`;
  };

  const getQualityLabel = (quality?: string) => {
    if (!quality) return '';
    const labels = { good: 'iyi', medium: 'orta', poor: 'zayıf' };
    return labels[quality as keyof typeof labels] || '';
  };

  const getQualityEmoji = (quality?: string) => {
    if (!quality) return '';
    const emojis = { good: '😊', medium: '😐', poor: '😴' };
    return emojis[quality as keyof typeof emojis] || '';
  };

  if (!data) {
    return (
      <WellnessTile
        icon="😴"
        title="Uyku"
        value="-"
        isEmpty
        emptyState="Dün gece kaydı yok"
        onPress={() => router.push('/wellness/sleep')}
        actions={
          <View style={styles(theme).actionsRow}>
            <TouchableOpacity
              style={styles(theme).quickButton}
              onPress={(e) => {
                e.stopPropagation();
                handleQuickLog(7);
              }}
            >
              <Text style={styles(theme).quickButtonText}>7 s</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles(theme).quickButton}
              onPress={(e) => {
                e.stopPropagation();
                handleQuickLog(8);
              }}
            >
              <Text style={styles(theme).quickButtonText}>8 s</Text>
            </TouchableOpacity>
          </View>
        }
      />
    );
  }

  return (
    <>
      <WellnessTile
        icon="😴"
        title="Uyku"
        subtitle={data.quality ? `Kalite: ${getQualityLabel(data.quality)} ${getQualityEmoji(data.quality)}` : undefined}
        value={formatHours(data.lastNightMin)}
        target={`Hedef ${data.goalHours} s`}
        percentage={data.percentage}
        onPress={() => router.push('/wellness/sleep')}
        actions={
          <View style={styles(theme).actionsRow}>
            <TouchableOpacity
              style={styles(theme).smallButton}
              onPress={(e) => {
                e.stopPropagation();
                setModalVisible(true);
              }}
            >
              <Text style={styles(theme).smallButtonText}>Düzenle</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Manual Entry Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles(theme).modalOverlay}>
          <View style={styles(theme).modalContent}>
            <Text style={styles(theme).modalTitle}>Uyku Ekle</Text>
            <Text style={styles(theme).modalSubtitle}>Dün gece</Text>

            {/* Quick Presets */}
            <View style={styles(theme).presetsContainer}>
              <TouchableOpacity
                style={styles(theme).presetButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleQuickLog(5);
                }}
              >
                <Text style={styles(theme).presetButtonText}>5 s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles(theme).presetButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleQuickLog(6);
                }}
              >
                <Text style={styles(theme).presetButtonText}>6 s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles(theme).presetButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleQuickLog(7);
                }}
              >
                <Text style={styles(theme).presetButtonText}>7 s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles(theme).presetButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleQuickLog(8);
                }}
              >
                <Text style={styles(theme).presetButtonText}>8 s</Text>
              </TouchableOpacity>
            </View>

            {/* Manual Input */}
            <View style={styles(theme).inputContainer}>
              <Text style={styles(theme).inputLabel}>veya manuel girin (saat)</Text>
              <TextInput
                style={styles(theme).input}
                value={hoursInput}
                onChangeText={setHoursInput}
                placeholder="ör: 7.5"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Quality Selection */}
            <View style={styles(theme).qualityContainer}>
              <Text style={styles(theme).inputLabel}>Kalite (opsiyonel)</Text>
              <View style={styles(theme).qualityButtons}>
                <TouchableOpacity
                  style={[
                    styles(theme).qualityButton,
                    selectedQuality === 'good' && styles(theme).qualityButtonSelected,
                  ]}
                  onPress={() => setSelectedQuality('good')}
                >
                  <Text style={styles(theme).qualityButtonText}>😊 İyi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles(theme).qualityButton,
                    selectedQuality === 'medium' && styles(theme).qualityButtonSelected,
                  ]}
                  onPress={() => setSelectedQuality('medium')}
                >
                  <Text style={styles(theme).qualityButtonText}>😐 Orta</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles(theme).qualityButton,
                    selectedQuality === 'poor' && styles(theme).qualityButtonSelected,
                  ]}
                  onPress={() => setSelectedQuality('poor')}
                >
                  <Text style={styles(theme).qualityButtonText}>😴 Zayıf</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles(theme).modalButtons}>
              <TouchableOpacity
                style={[styles(theme).modalButton, styles(theme).cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setHoursInput('');
                  setSelectedQuality(undefined);
                }}
              >
                <Text style={styles(theme).cancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles(theme).modalButton, styles(theme).saveButton]}
                onPress={handleManualSave}
                disabled={logSleepMutation.isPending || !hoursInput}
              >
                <Text style={styles(theme).saveButtonText}>
                  {logSleepMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    actionsRow: {
      flexDirection: 'row',
      gap: 6,
    },
    quickButton: {
      backgroundColor: theme.colors.backgroundSecondary,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
    },
    quickButtonText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.text,
    },
    smallButton: {
      backgroundColor: theme.colors.backgroundSecondary,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 6,
    },
    smallButtonText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.text,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: theme.spacing.lg,
      width: '100%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    modalSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    presetsContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: theme.spacing.lg,
    },
    presetButton: {
      flex: 1,
      backgroundColor: theme.colors.backgroundCard,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    presetButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    inputContainer: {
      marginBottom: theme.spacing.md,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    input: {
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.text,
    },
    qualityContainer: {
      marginBottom: theme.spacing.lg,
    },
    qualityButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    qualityButton: {
      flex: 1,
      backgroundColor: theme.colors.backgroundCard,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    qualityButtonSelected: {
      backgroundColor: theme.colors.primary + '20',
      borderColor: theme.colors.primary,
    },
    qualityButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.colors.backgroundSecondary,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textOnPrimary,
    },
  });
