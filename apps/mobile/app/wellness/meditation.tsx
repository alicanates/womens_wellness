import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import { wellnessService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';

export default function MeditationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [refreshing, setRefreshing] = useState(false);
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  // Timer states
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(60); // 1 minute default
  const [sessionType, setSessionType] = useState<'breath' | 'guided' | 'custom'>('breath');
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const styles = createStyles(theme);

  // Fetch meditation data - use stable date-only strings for query keys
  const dateRange = React.useMemo(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);

    // Format as date-only strings for stable query keys
    const toDateStr = to.toISOString().split('T')[0];
    const fromDateStr = from.toISOString().split('T')[0];

    return {
      fromDateStr,
      toDateStr,
      fromISO: from.toISOString(),
      toISO: to.toISOString(),
    };
  }, []);

  const { data: sessions, isLoading, refetch, error: sessionsError } = useQuery({
    queryKey: ['meditation', dateRange.fromDateStr, dateRange.toDateStr],
    queryFn: () => wellnessService.getMeditation(dateRange.fromISO, dateRange.toISO),
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: preferences, error: prefsError } = useQuery({
    queryKey: ['wellnessPreferences'],
    queryFn: () => wellnessService.getPreferences(),
    enabled: isAuthenticated,
    retry: false,
  });

  // Show error state (only for actual errors, not loading states)
  useEffect(() => {
    if ((sessionsError || prefsError) && !isLoading) {
      const errorMsg = (sessionsError as any)?.message || (prefsError as any)?.message || 'Bilinmeyen hata';
      console.error('Meditation screen error:', { sessionsError, prefsError });

      // Don't show alert immediately, wait a bit to see if it resolves
      const timer = setTimeout(() => {
        Alert.alert(
          'Veri Yüklenemedi',
          `Bir sorun oluştu: ${errorMsg}\n\nLütfen internet bağlantınızı kontrol edin.`,
          [
            {
              text: 'Geri Dön',
              onPress: () => router.back(),
            },
            {
              text: 'Tekrar Dene',
              onPress: () => refetch(),
            },
          ]
        );
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [sessionsError, prefsError, isLoading]);

  const logMeditationMutation = useMutation({
    mutationFn: (data: { durationMin: number; type: 'breath' | 'guided' | 'custom' }) =>
      wellnessService.logMeditation({
        date: new Date().toISOString(),
        durationMin: data.durationMin,
        type: data.type,
        isManual: true,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['meditation'] });
      await queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });
      await refetch();
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Meditasyon kaydedilemedi');
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: (goalMin: number) =>
      wellnessService.updatePreferences({ meditationGoalMin: goalMin }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellnessPreferences'] });
      queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });
      setGoalModalVisible(false);
      setGoalInput('');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Hedef güncellenemedi');
    },
  });

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timerSeconds < selectedDuration) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev + 1 >= selectedDuration) {
            handleTimerComplete();
            return selectedDuration;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning, timerSeconds, selectedDuration]);

  const handleTimerComplete = () => {
    setIsTimerRunning(false);
    Vibration.vibrate([0, 200, 100, 200]); // Haptic feedback

    const durationMin = Math.ceil(selectedDuration / 60);
    logMeditationMutation.mutate({ durationMin, type: sessionType });

    Alert.alert(
      'Harika! 🎉',
      `${durationMin} dakikalık meditasyon tamamlandı!`,
      [
        {
          text: 'Tamam',
          onPress: () => {
            setTimerModalVisible(false);
            resetTimer();
          },
        },
      ]
    );
  };

  const startTimer = (duration: number, type: 'breath' | 'guided' | 'custom') => {
    setSelectedDuration(duration);
    setSessionType(type);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setTimerModalVisible(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resumeTimer = () => {
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    setTimerModalVisible(false);
    resetTimer();
  };

  const resetTimer = () => {
    setTimerSeconds(0);
    setSelectedDuration(60);
    setSessionType('breath');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleGoalSave = (preset?: number) => {
    const goal = preset || parseInt(goalInput, 10);
    if (isNaN(goal) || goal <= 0 || goal > 1440) {
      Alert.alert('Hata', 'Lütfen geçerli bir hedef girin (1-1440 dakika)');
      return;
    }
    updateGoalMutation.mutate(goal);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Default values if data hasn't loaded yet
  const safeSessions = sessions || [];
  const safePreferences = preferences || { stepsGoal: 7000, meditationGoalMin: 10, sleepGoalHours: 7 };

  // Calculate statistics
  const calculateStats = () => {
    if (!safeSessions || safeSessions.length === 0) {
      return { today: 0, todaySessions: 0, weeklyAvg: 0, totalSessions: 0, streak: 1 };
    }

    const today = new Date();
    const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

    const todaySessions = safeSessions.filter((s: any) => {
      const d = new Date(s.date);
      const dUTC = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      return dUTC === todayUTC;
    });

    const todayMin = todaySessions.reduce((sum: number, s: any) => sum + s.durationMin, 0);

    // Last 7 days
    const last7Days = safeSessions.filter((s: any) => {
      const date = new Date(s.date);
      const dateUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      const diff = todayUTC - dateUTC;
      return diff >= 0 && diff < 7 * 24 * 60 * 60 * 1000;
    });

    const weeklyAvg = last7Days.length > 0
      ? Math.round(last7Days.reduce((sum: number, s: any) => sum + s.durationMin, 0) / 7)
      : 0;

    // Calculate streak - count consecutive days from today backwards
    const goal = safePreferences?.meditationGoalMin || 10;
    let streak = 0;

    // Group by date and sum
    const byDate = new Map<number, number>();
    safeSessions.forEach((s: any) => {
      const d = new Date(s.date);
      const dateUTC = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      byDate.set(dateUTC, (byDate.get(dateUTC) || 0) + s.durationMin);
    });

    // Check consecutive days from today backwards
    let checkDate = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDateUTC = Date.UTC(checkDate.getUTCFullYear(), checkDate.getUTCMonth(), checkDate.getUTCDate());
      const totalMin = byDate.get(checkDateUTC) || 0;

      if (totalMin >= goal) {
        streak++;
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      } else {
        break;
      }
    }

    // If no streak from data but user just started, show 1
    if (streak === 0 && safeSessions.length > 0) {
      streak = 1;
    }

    return {
      today: todayMin,
      todaySessions: todaySessions.length,
      weeklyAvg,
      totalSessions: safeSessions.length,
      streak,
    };
  };

  const stats = calculateStats();
  const goal = safePreferences?.meditationGoalMin || 10;
  const percentage = Math.round((stats.today / goal) * 100);

  // Get recent sessions
  const recentSessions = safeSessions?.slice(0, 10) || [];

  const getTypeLabel = (type: string) => {
    const labels = { breath: 'Nefes', guided: 'Rehberli', custom: 'Özel' };
    return labels[type as keyof typeof labels] || type;
  };

  if (isLoading && !sessions && !preferences) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Geri</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Meditasyon</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* Today Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Bugün</Text>
            {stats.today >= goal && (
              <View style={[styles.chip, styles.chipSuccess]}>
                <Text style={styles.chipText}>✓ Tebrikler!</Text>
              </View>
            )}
          </View>

          <View style={styles.metricContainer}>
            <Text style={styles.metricValue}>{stats.today}</Text>
            <Text style={styles.metricUnit}>dakika</Text>
          </View>

          <Text style={styles.sessionsText}>{stats.todaySessions} seans</Text>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(percentage, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {percentage}% · Hedef {goal} dk
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={() => setGoalModalVisible(true)}
            >
              <Text style={styles.actionButtonTextPrimary}>Hedefi Düzenle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Start */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hızlı Başlat</Text>

          <View style={styles.quickStartGrid}>
            <TouchableOpacity
              style={styles.quickStartButton}
              onPress={() => startTimer(60, 'breath')}
            >
              <Text style={styles.quickStartIcon}>🧘‍♀️</Text>
              <Text style={styles.quickStartLabel}>1 dk</Text>
              <Text style={styles.quickStartSublabel}>Nefes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickStartButton}
              onPress={() => startTimer(300, 'guided')}
            >
              <Text style={styles.quickStartIcon}>🎧</Text>
              <Text style={styles.quickStartLabel}>5 dk</Text>
              <Text style={styles.quickStartSublabel}>Rehberli</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickStartButton}
              onPress={() => startTimer(600, 'guided')}
            >
              <Text style={styles.quickStartIcon}>🌙</Text>
              <Text style={styles.quickStartLabel}>10 dk</Text>
              <Text style={styles.quickStartSublabel}>Meditasyon</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickStartButton}
              onPress={() => startTimer(1200, 'custom')}
            >
              <Text style={styles.quickStartIcon}>⏱️</Text>
              <Text style={styles.quickStartLabel}>20 dk</Text>
              <Text style={styles.quickStartSublabel}>Derin</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>İstatistikler</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.weeklyAvg}</Text>
              <Text style={styles.statLabel}>Haftalık Ort. (dk)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalSessions}</Text>
              <Text style={styles.statLabel}>Toplam Seans</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.streak}</Text>
              <Text style={styles.statLabel}>Seri (gün)</Text>
            </View>
          </View>
        </View>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Son Seanslar</Text>

            {recentSessions.map((session: any, index: number) => (
              <View key={session.id || index} style={styles.sessionItem}>
                <View style={styles.sessionLeft}>
                  <Text style={styles.sessionType}>{getTypeLabel(session.type)}</Text>
                  <Text style={styles.sessionDate}>
                    {new Date(session.date).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Text style={styles.sessionDuration}>{session.durationMin} dk</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tips */}
        <View style={[styles.card, styles.tipsCard]}>
          <Text style={styles.tipsIcon}>💡</Text>
          <Text style={styles.tipsTitle}>İpucu</Text>
          <Text style={styles.tipsText}>
            Düzenli meditasyon, stresi azaltır, odaklanmayı artırır ve genel ruh sağlığını destekler.
            Her gün aynı saatte yaparak bir rutin oluşturun.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Timer Modal */}
      <Modal
        visible={timerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={stopTimer}
      >
        <View style={styles.timerModalOverlay}>
          <View style={styles.timerModalContent}>
            <Text style={styles.timerTitle}>{getTypeLabel(sessionType)}</Text>

            <View style={styles.timerCircle}>
              <Text style={styles.timerTime}>{formatTime(timerSeconds)}</Text>
              <Text style={styles.timerGoal}>/ {formatTime(selectedDuration)}</Text>
            </View>

            <View style={styles.timerProgress}>
              <View style={styles.timerProgressBackground}>
                <View
                  style={[
                    styles.timerProgressFill,
                    { width: `${(timerSeconds / selectedDuration) * 100}%` },
                  ]}
                />
              </View>
            </View>

            <View style={styles.timerControls}>
              {!isTimerRunning && timerSeconds === 0 && (
                <TouchableOpacity style={styles.timerButton} onPress={resumeTimer}>
                  <Ionicons name="play-sharp" size={32} color={theme.colors.textOnPrimary} />
                </TouchableOpacity>
              )}

              {isTimerRunning && (
                <TouchableOpacity style={styles.timerButton} onPress={pauseTimer}>
                  <Ionicons name="pause-sharp" size={32} color={theme.colors.textOnPrimary} />
                </TouchableOpacity>
              )}

              {!isTimerRunning && timerSeconds > 0 && (
                <>
                  <TouchableOpacity style={styles.timerButton} onPress={resumeTimer}>
                    <Ionicons name="play-sharp" size={32} color={theme.colors.textOnPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.timerButton, styles.timerButtonSecondary]} onPress={stopTimer}>
                    <Ionicons name="stop-sharp" size={32} color={theme.colors.text} />
                  </TouchableOpacity>
                </>
              )}
            </View>

            {!isTimerRunning && timerSeconds === 0 && (
              <TouchableOpacity style={styles.cancelTimerButton} onPress={stopTimer}>
                <Text style={styles.cancelTimerText}>İptal</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Goal Setting Modal */}
      <Modal
        visible={goalModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Günlük Hedef</Text>

            <Text style={styles.presetsLabel}>Hızlı Seçim</Text>
            <View style={styles.presetsContainer}>
              <TouchableOpacity style={styles.presetButton} onPress={() => handleGoalSave(5)}>
                <Text style={styles.presetButtonText}>5 dk</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.presetButton} onPress={() => handleGoalSave(10)}>
                <Text style={styles.presetButtonText}>10 dk</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.presetButton} onPress={() => handleGoalSave(20)}>
                <Text style={styles.presetButtonText}>20 dk</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setGoalModalVisible(false);
                  setGoalInput('');
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      padding: 8,
      marginLeft: -8,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    headerRight: {
      width: 40,
    },
    container: {
      flex: 1,
    },
    content: {
      padding: theme.spacing.lg,
      paddingBottom: 100,
    },
    card: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: theme.card.padding,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    chipSuccess: {
      backgroundColor: theme.colors.primary + '20',
    },
    chipText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    metricContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      marginBottom: 4,
    },
    metricValue: {
      fontSize: 48,
      fontWeight: '700',
      color: theme.colors.text,
    },
    metricUnit: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginLeft: 8,
    },
    sessionsText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    progressBarContainer: {
      marginBottom: theme.spacing.lg,
    },
    progressBarBackground: {
      height: 8,
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressBarFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 4,
    },
    progressText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundSecondary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    actionButtonPrimary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    actionButtonTextPrimary: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textOnPrimary,
    },
    quickStartGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    quickStartButton: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 12,
      padding: theme.spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    quickStartIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    quickStartLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 2,
    },
    quickStartSublabel: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    statItem: {
      flex: 1,
      minWidth: '30%',
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 12,
      padding: theme.spacing.md,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    sessionItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sessionLeft: {
      flex: 1,
    },
    sessionType: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    sessionDate: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    sessionDuration: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    tipsCard: {
      backgroundColor: theme.colors.primary + '10',
      borderColor: theme.colors.primary + '30',
    },
    tipsIcon: {
      fontSize: 24,
      marginBottom: 8,
    },
    tipsTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 8,
    },
    tipsText: {
      fontSize: 13,
      lineHeight: 20,
      color: theme.colors.textSecondary,
    },
    bottomSpacer: {
      height: 40,
    },
    timerModalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    timerModalContent: {
      width: '100%',
      alignItems: 'center',
    },
    timerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.xl,
    },
    timerCircle: {
      width: 280,
      height: 280,
      borderRadius: 140,
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 8,
      borderColor: theme.colors.primary + '30',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    timerTime: {
      fontSize: 64,
      fontWeight: '700',
      color: theme.colors.text,
    },
    timerGoal: {
      fontSize: 18,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      marginTop: 8,
    },
    timerProgress: {
      width: '100%',
      marginBottom: theme.spacing.xl,
    },
    timerProgressBackground: {
      height: 8,
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 4,
      overflow: 'hidden',
    },
    timerProgressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 4,
    },
    timerControls: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: theme.spacing.lg,
    },
    timerButton: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    timerButtonSecondary: {
      backgroundColor: theme.colors.backgroundSecondary,
    },
    cancelTimerButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    cancelTimerText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textSecondary,
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
      marginBottom: theme.spacing.lg,
    },
    presetsLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
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
  });
