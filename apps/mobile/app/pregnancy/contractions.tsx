import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pregnancyService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';
import { useThemeStore } from '@/store/themeStore';
import { router } from 'expo-router';

interface Contraction {
  id: string;
  startTime: string;
  endTime: string;
  durationSec: number;
  intensity?: number;
  notes?: string;
}

interface ContractionSummary {
  count: number;
  frequency: number | null;
  avgDuration: number | null;
  isRegular: boolean | null;
}

export default function ContractionsScreen() {
  const theme = useTheme();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const queryClient = useQueryClient();

  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [intensity, setIntensity] = useState(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch recent contractions
  const { data: contractions } = useQuery({
    queryKey: ['contractions'],
    queryFn: async () => {
      const data = await pregnancyService.getContractions(24);
      return data as Contraction[];
    },
  });

  // Fetch summary
  const { data: summary } = useQuery({
    queryKey: ['contractions', 'summary'],
    queryFn: async () => {
      const data = await pregnancyService.getContractionsSummary();
      return data as ContractionSummary;
    },
  });

  const saveContractionMutation = useMutation({
    mutationFn: (data: any) => pregnancyService.logContraction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractions'] });
      const mins = Math.floor(elapsedSeconds / 60);
      const secs = elapsedSeconds % 60;
      const timeStr = mins > 0
        ? `${mins} dakika ${secs} saniye`
        : `${secs} saniye`;
      Alert.alert(
        'Kaydedildi',
        `${timeStr} süren kasılma kaydedildi`,
        [
          {
            text: 'Tamam',
            onPress: () => {
              setElapsedSeconds(0);
              setIntensity(5);
            },
          },
        ]
      );
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Kaydedilemedi');
    },
  });

  const deleteContractionMutation = useMutation({
    mutationFn: (id: string) => pregnancyService.deleteContraction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractions'] });
      Alert.alert('Başarılı', 'Kasılma silindi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Silinemedi');
    },
  });

  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTracking]);

  const handleStart = () => {
    setIsTracking(true);
    setStartTime(new Date());
    setElapsedSeconds(0);
    setIntensity(5);
  };

  const handleStop = () => {
    if (elapsedSeconds < 5) {
      Alert.alert('Uyarı', 'Kasılma çok kısa. En az 5 saniye olmalı.');
      setIsTracking(false);
      setElapsedSeconds(0);
      return;
    }

    setIsTracking(false);

    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    const timeStr = mins > 0
      ? `${mins} dakika ${secs} saniye`
      : `${secs} saniye`;

    Alert.alert(
      'Kasılma Tamamlandı',
      `${timeStr} süren kasılmayı kaydetmek istiyor musunuz?`,
      [
        {
          text: 'İptal',
          style: 'cancel',
          onPress: () => {
            setElapsedSeconds(0);
            setIntensity(5);
          },
        },
        {
          text: 'Kaydet',
          onPress: () => {
            if (startTime) {
              const endTime = new Date(startTime.getTime() + elapsedSeconds * 1000);
              saveContractionMutation.mutate({
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                durationSec: elapsedSeconds,
                intensity,
              });
            }
          },
        },
      ]
    );
  };

  const handleDeleteContraction = (contractionId: string) => {
    Alert.alert(
      'Kasılmayı Sil',
      'Bu kasılmayı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deleteContractionMutation.mutate(contractionId),
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}dk ${secs}sn`;
    }
    return `${secs}sn`;
  };

  const getTimeBetween = (current: Date, previous: Date) => {
    const diffMs = current.getTime() - previous.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) {
      return `${diffMins} dk`;
    }
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}s ${mins}dk`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundCard,
    },
    backButton: {
      marginRight: theme.spacing.md,
      padding: theme.spacing.xs,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    summaryCard: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: 16,
      marginBottom: theme.spacing.md,
      shadowColor: theme.card.shadowColor,
      shadowOffset: theme.card.shadowOffset,
      shadowOpacity: theme.card.shadowOpacity,
      shadowRadius: theme.card.shadowRadius,
      elevation: theme.card.elevation,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    summaryTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
      flex: 1,
    },
    summaryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    summaryItem: {
      flex: 1,
      minWidth: 90,
      backgroundColor: theme.colors.overlay,
      padding: 12,
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    summaryItemValue: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    summaryItemLabel: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      textAlign: 'center',
    },
    countBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8,
    },
    countBadgeText: {
      fontSize: 14,
      fontWeight: '900',
      color: theme.colors.textOnPrimary,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    summaryLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
    },
    warningCard: {
      backgroundColor: isDarkMode ? '#3D2F00' : '#FFF3CD',
      borderRadius: 12,
      padding: 16,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: isDarkMode ? '#FFC107' : '#FFC107',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    warningText: {
      flex: 1,
      fontSize: 14,
      color: isDarkMode ? '#FFD54F' : '#856404',
      fontWeight: '600',
      lineHeight: 20,
    },
    timerCard: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: theme.card.padding,
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      shadowColor: theme.card.shadowColor,
      shadowOffset: theme.card.shadowOffset,
      shadowOpacity: theme.card.shadowOpacity,
      shadowRadius: theme.card.shadowRadius,
      elevation: theme.card.elevation,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    timerLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      fontWeight: '600',
    },
    timerValue: {
      fontSize: 64,
      fontWeight: '900',
      color: theme.colors.primary,
      letterSpacing: 2,
    },
    intensitySection: {
      width: '100%',
      marginTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.sm,
    },
    intensityLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
      fontWeight: '600',
      textAlign: 'center',
    },
    intensitySliderContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.sm,
    },
    intensityButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 8,
    },
    intensityButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    intensityButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      transform: [{ scale: 1.1 }],
    },
    intensityButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    intensityButtonTextActive: {
      color: theme.colors.textOnPrimary,
      fontSize: 14,
    },
    intensityDisplay: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      marginBottom: theme.spacing.md,
    },
    intensityDisplayText: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.textOnPrimary,
    },
    controlButtons: {
      marginBottom: theme.spacing.lg,
    },
    controlButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.button.borderRadius,
      paddingVertical: 16,
      paddingHorizontal: 32,
      alignItems: 'center',
      shadowColor: theme.button.shadowColor,
      shadowOffset: theme.button.shadowOffset,
      shadowOpacity: theme.button.shadowOpacity,
      shadowRadius: theme.button.shadowRadius,
      elevation: theme.button.elevation,
    },
    controlButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 18,
      fontWeight: '700',
    },
    stopButton: {
      backgroundColor: theme.colors.error,
    },
    historySection: {
      marginTop: theme.spacing.md,
      marginBottom: 20,
    },
    historyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    historyItem: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: theme.card.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    historyTime: {
      fontSize: 15,
      color: theme.colors.text,
      fontWeight: '700',
      marginRight: 10,
    },
    historyDuration: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.colors.text,
      marginTop: theme.spacing.xs,
    },
    historyInterval: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    durationBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    durationBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textOnPrimary,
    },
    intensityBadge: {
      backgroundColor: theme.colors.overlay,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      alignItems: 'center',
      marginRight: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minWidth: 50,
    },
    intensityBadgeText: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.colors.primary,
    },
    intensityBadgeLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    deleteButton: {
      padding: 8,
      backgroundColor: theme.colors.overlay,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.error,
    },
    deleteButtonText: {
      fontSize: 18,
    },
    emptyHistoryContainer: {
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    emptyHistory: {
      fontSize: 16,
      color: theme.colors.text,
      textAlign: 'center',
      fontWeight: '600',
      marginBottom: 8,
    },
    emptyHistorySubtext: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
    },
  });

  // Check if contractions are regular and frequent (warning sign)
  const shouldShowWarning = summary && summary.count >= 4 &&
    summary.frequency && summary.frequency < 10 &&
    summary.isRegular;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={{ fontSize: 24, color: theme.colors.text }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kasılma Sayacı</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Warning Card */}
        {shouldShowWarning && (
          <View style={styles.warningCard}>
            <Text style={{ fontSize: 24 }}>⚠️</Text>
            <Text style={styles.warningText}>
              Kasılmalar düzenli ve sık! Doktorunuza danışmanız önerilir.
            </Text>
          </View>
        )}

        {/* Summary Card */}
        {summary && summary.count > 0 && (
          <View style={styles.summaryCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.summaryTitle}>Son 2 Saat Özeti</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{summary.count}</Text>
              </View>
            </View>
            <View style={styles.summaryGrid}>
              {summary.frequency && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryItemValue}>
                    {Math.round(summary.frequency)} dk
                  </Text>
                  <Text style={styles.summaryItemLabel}>Ortalama Aralık</Text>
                </View>
              )}
              {summary.avgDuration && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryItemValue}>
                    {Math.round(summary.avgDuration)} sn
                  </Text>
                  <Text style={styles.summaryItemLabel}>Ortalama Süre</Text>
                </View>
              )}
              {summary.isRegular !== undefined && (
                <View style={styles.summaryItem}>
                  <Text style={[
                    styles.summaryItemValue,
                    { fontSize: 16 }
                  ]}>
                    {summary.isRegular ? '✓ Düzenli' : '○ Düzensiz'}
                  </Text>
                  <Text style={styles.summaryItemLabel}>Düzenlilik</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Timer Card */}
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Kasılma Süresi</Text>
          <Text style={styles.timerValue}>{formatTime(elapsedSeconds)}</Text>

          {isTracking && (
            <View style={styles.intensityDisplay}>
              <Text style={styles.intensityDisplayText}>
                Şiddet: {intensity}/10
              </Text>
            </View>
          )}
        </View>

        {/* Intensity Selector */}
        {isTracking && (
          <View style={styles.summaryCard}>
            <Text style={styles.intensityLabel}>
              Kasılma Şiddetini Seçin
            </Text>
            <View style={styles.intensityButtons}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.intensityButton,
                    intensity === level && styles.intensityButtonActive,
                  ]}
                  onPress={() => setIntensity(level)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.intensityButtonText,
                      intensity === level && styles.intensityButtonTextActive,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Control Buttons */}
        <View style={styles.controlButtons}>
          {!isTracking ? (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleStart}
              activeOpacity={0.8}
            >
              <Text style={styles.controlButtonText}>▶️ Kasılma Başladı</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleStop}
              activeOpacity={0.8}
            >
              <Text style={styles.controlButtonText}>
                ⏹️ Kasılma Bitti
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* History */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Son 24 Saat</Text>
          {contractions && contractions.length > 0 ? (
            contractions.map((contraction: any, index: number) => (
              <View key={contraction.id} style={styles.historyItem}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={styles.historyTime}>
                      {new Date(contraction.startTime).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationBadgeText}>
                        {formatDuration(contraction.durationSec)}
                      </Text>
                    </View>
                  </View>
                  {index < contractions.length - 1 && (
                    <Text style={styles.historyInterval}>
                      ↓ {getTimeBetween(
                        new Date(contraction.startTime),
                        new Date(contractions[index + 1].startTime)
                      )} sonra
                    </Text>
                  )}
                </View>
                <View style={styles.intensityBadge}>
                  <Text style={styles.intensityBadgeText}>
                    {contraction.intensity || 5}
                  </Text>
                  <Text style={styles.intensityBadgeLabel}>şiddet</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteContraction(contraction.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyHistoryContainer}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>⏱️</Text>
              <Text style={styles.emptyHistory}>
                Henüz kayıtlı kasılma yok
              </Text>
              <Text style={styles.emptyHistorySubtext}>
                Kasılma başladığında yukarıdaki butona basarak kayıt başlatabilirsiniz
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
