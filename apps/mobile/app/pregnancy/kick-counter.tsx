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
import { router } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';

export default function KickCounterScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [isTracking, setIsTracking] = useState(false);
  const [kickCount, setKickCount] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const goal = 10; // Default goal

  // Fetch recent kick sessions
  const { data: kickHistory } = useQuery({
    queryKey: ['kicks'],
    queryFn: () => pregnancyService.getKicks(10),
  });

  const saveKickMutation = useMutation({
    mutationFn: (data: any) => pregnancyService.logKick(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kicks'] });
      const mins = Math.floor(elapsedSeconds / 60);
      const secs = elapsedSeconds % 60;
      const timeStr = mins > 0
        ? `${mins} dakika ${secs} saniye`
        : `${secs} saniye`;
      Alert.alert(
        'Kaydedildi',
        `${kickCount} tekme ${timeStr}de kaydedildi`,
        [
          {
            text: 'Tamam',
            onPress: () => {
              setKickCount(0);
              setElapsedSeconds(0);
            },
          },
        ]
      );
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Kaydedilemedi');
    },
  });

  const deleteKickMutation = useMutation({
    mutationFn: (id: string) => pregnancyService.deleteKick(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kicks'] });
      Alert.alert('Başarılı', 'Seans silindi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Silinemedi');
    },
  });

  const handleDeleteKick = (sessionId: string) => {
    Alert.alert(
      'Seansı Sil',
      'Bu seansı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deleteKickMutation.mutate(sessionId),
        },
      ]
    );
  };

  const handleDeleteAll = () => {
    Alert.alert(
      'Tüm Seansları Sil',
      'Tüm geçmiş seansları silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Tümünü Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete all sessions one by one
              if (kickHistory && kickHistory.length > 0) {
                for (const session of kickHistory) {
                  await pregnancyService.deleteKick(session.id);
                }
                queryClient.invalidateQueries({ queryKey: ['kicks'] });
                Alert.alert('Başarılı', 'Tüm seanslar silindi');
              }
            } catch (error: any) {
              Alert.alert('Hata', error.message || 'Silinemedi');
            }
          },
        },
      ]
    );
  };

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
    setKickCount(0);
    setElapsedSeconds(0);
  };

  const handleKick = () => {
    if (!isTracking) return;

    const newCount = kickCount + 1;
    setKickCount(newCount);

    // Auto-stop at goal
    if (newCount >= goal) {
      handleStop(newCount);
    }
  };

  const handleStop = (finalCount?: number) => {
    const count = finalCount !== undefined ? finalCount : kickCount;

    if (count === 0) {
      Alert.alert('Uyarı', 'Hiç tekme kaydedilmedi');
      setIsTracking(false);
      return;
    }

    setIsTracking(false);

    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    const timeStr = mins > 0
      ? `${mins} dakika ${secs} saniye`
      : `${secs} saniye`;

    Alert.alert(
      'Seans Tamamlandı',
      `${count} tekme ${timeStr}de sayıldı. Kaydetmek istiyor musunuz?`,
      [
        {
          text: 'İptal',
          style: 'cancel',
          onPress: () => {
            setKickCount(0);
            setElapsedSeconds(0);
          },
        },
        {
          text: 'Kaydet',
          onPress: () => {
            if (startTime) {
              // Store duration in minutes, but keep precision with decimals
              const durationMin = elapsedSeconds / 60;
              saveKickMutation.mutate({
                sessionDate: startTime.toISOString(),
                kickCount: count,
                durationMin: Math.max(1, Math.ceil(durationMin)), // At least 1 minute for DB
              });
            }
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      padding: theme.spacing.lg,
    },
    counterCard: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: theme.card.padding,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      shadowColor: theme.card.shadowColor,
      shadowOffset: theme.card.shadowOffset,
      shadowOpacity: theme.card.shadowOpacity,
      shadowRadius: theme.card.shadowRadius,
      elevation: theme.card.elevation,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    counterLabel: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
      fontWeight: '600',
    },
    counterValue: {
      fontSize: 96,
      fontWeight: '900',
      color: theme.colors.primary,
      lineHeight: 100,
    },
    goalText: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.sm,
      fontWeight: '500',
    },
    timerText: {
      fontSize: 36,
      fontWeight: '700',
      color: theme.colors.text,
      marginTop: theme.spacing.md,
      letterSpacing: 2,
    },
    kickButton: {
      backgroundColor: theme.colors.primary,
      width: 200,
      height: 200,
      borderRadius: 100,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: theme.spacing.xl,
      shadowColor: theme.button.shadowColor,
      shadowOffset: theme.button.shadowOffset,
      shadowOpacity: theme.button.shadowOpacity,
      shadowRadius: theme.button.shadowRadius,
      elevation: theme.button.elevation,
    },
    kickButtonDisabled: {
      backgroundColor: theme.colors.backgroundCard,
      opacity: 0.5,
    },
    kickButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: theme.spacing.sm,
    },
    controlButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    controlButton: {
      flex: 1,
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.button.borderRadius,
      padding: theme.button.padding,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.primary,
      shadowColor: theme.button.shadowColor,
      shadowOffset: theme.button.shadowOffset,
      shadowOpacity: theme.button.shadowOpacity,
      shadowRadius: theme.button.shadowRadius,
      elevation: theme.button.elevation,
    },
    controlButtonText: {
      color: theme.colors.primary,
      fontSize: 17,
      fontWeight: '700',
    },
    stopButton: {
      backgroundColor: theme.colors.error,
      borderColor: theme.colors.error,
    },
    stopButtonText: {
      color: theme.colors.textOnPrimary,
    },
    historySection: {
      marginTop: theme.spacing.lg,
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    historyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
    },
    deleteAllButton: {
      backgroundColor: theme.colors.overlay,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.button.borderRadius,
      borderWidth: 1,
      borderColor: theme.colors.error,
    },
    deleteAllButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.error,
    },
    historyItem: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: theme.card.padding,
      marginBottom: theme.spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: theme.card.shadowColor,
      shadowOffset: theme.card.shadowOffset,
      shadowOpacity: theme.card.shadowOpacity,
      shadowRadius: theme.card.shadowRadius,
      elevation: theme.card.elevation,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    historyDate: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      marginTop: theme.spacing.xs,
    },
    historyData: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.colors.text,
    },
    emptyHistory: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.xl,
      fontWeight: '500',
    },
    deleteButton: {
      padding: theme.spacing.sm,
      marginLeft: theme.spacing.sm,
      backgroundColor: theme.colors.overlay,
      borderRadius: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.error,
    },
    deleteButtonText: {
      fontSize: 18,
    },
  });

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
        <Text style={styles.headerTitle}>Tekme Sayacı</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Counter Card */}
        <View style={styles.counterCard}>
          <Text style={styles.counterLabel}>Tekme Sayısı</Text>
          <Text style={styles.counterValue}>{kickCount}</Text>
          <Text style={styles.goalText}>
            Hedef: {goal} tekme
          </Text>
          {isTracking && (
            <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
          )}
        </View>

        {/* Kick Button */}
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.kickButton, !isTracking && styles.kickButtonDisabled]}
            onPress={handleKick}
            disabled={!isTracking}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 64 }}>👣</Text>
            <Text style={styles.kickButtonText}>TEKME!</Text>
          </TouchableOpacity>
        </View>

        {/* Control Buttons */}
        <View style={styles.controlButtons}>
          {!isTracking ? (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleStart}
            >
              <Text style={styles.controlButtonText}>Başla</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={() => handleStop()}
            >
              <Text style={[styles.controlButtonText, styles.stopButtonText]}>
                Durdur & Kaydet
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* History */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Geçmiş Seanslar</Text>
            {kickHistory && kickHistory.length > 0 && (
              <TouchableOpacity
                style={styles.deleteAllButton}
                onPress={handleDeleteAll}
              >
                <Text style={styles.deleteAllButtonText}>Tümünü Sil</Text>
              </TouchableOpacity>
            )}
          </View>
          {kickHistory && kickHistory.length > 0 ? (
            kickHistory.map((session: any) => (
              <View key={session.id} style={styles.historyItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyData}>
                    {session.kickCount} tekme
                  </Text>
                  <Text style={styles.historyDate}>
                    {new Date(session.sessionDate).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Text style={styles.historyData}>
                  {session.durationMin} dk
                </Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteKick(session.id)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.emptyHistory}>
              Henüz kayıtlı seans yok
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
