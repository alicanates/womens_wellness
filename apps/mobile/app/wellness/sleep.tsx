import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import { wellnessService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const BAR_WIDTH = (width - 80) / 7;

export default function SleepScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [hoursInput, setHoursInput] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [selectedQuality, setSelectedQuality] = useState<'good' | 'medium' | 'poor' | undefined>();
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  });

  const styles = createStyles(theme);

  // Fetch sleep data - use stable date-only strings for query keys
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

  const { data: sleepData, isLoading, refetch, error: sleepError } = useQuery({
    queryKey: ['sleep', dateRange.fromDateStr, dateRange.toDateStr],
    queryFn: () => wellnessService.getSleep(dateRange.fromISO, dateRange.toISO),
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
    if ((sleepError || prefsError) && !isLoading) {
      const errorMsg = (sleepError as any)?.message || (prefsError as any)?.message || 'Bilinmeyen hata';
      console.error('Sleep screen error:', { sleepError, prefsError });

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
  }, [sleepError, prefsError, isLoading]);

  const logSleepMutation = useMutation({
    mutationFn: (data: { sleepDate: string; durationMin: number; quality?: 'good' | 'medium' | 'poor'; notes?: string }) =>
      wellnessService.logSleep({
        sleepDate: data.sleepDate,
        durationMin: data.durationMin,
        quality: data.quality,
        notes: data.notes,
        isManual: true,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['sleep'] });
      await queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });
      await refetch();
      setModalVisible(false);
      setHoursInput('');
      setSelectedQuality(undefined);
      setNotes('');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      setSelectedDate(yesterday);
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Uyku kaydedilemedi');
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: (goalHours: number) =>
      wellnessService.updatePreferences({ sleepGoalHours: goalHours }),
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleQuickLog = (hours: number, quality?: 'good' | 'medium' | 'poor') => {
    // Normalize to UTC midnight to match backend logic
    const date = new Date(selectedDate);
    const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    logSleepMutation.mutate({
      sleepDate: utcDate.toISOString(),
      durationMin: hours * 60,
      quality,
    });
  };

  const handleManualSave = () => {
    const hours = parseFloat(hoursInput.replace(',', '.'));
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      Alert.alert('Hata', 'Lütfen geçerli bir uyku süresi girin (0-24 saat)');
      return;
    }

    // Normalize to UTC midnight to match backend logic
    const date = new Date(selectedDate);
    const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));

    logSleepMutation.mutate({
      sleepDate: utcDate.toISOString(),
      durationMin: Math.round(hours * 60),
      quality: selectedQuality,
      notes: notes || undefined,
    });
  };

  const handleGoalSave = (preset?: number) => {
    const goal = preset || parseFloat(goalInput.replace(',', '.'));
    if (isNaN(goal) || goal <= 0 || goal > 24) {
      Alert.alert('Hata', 'Lütfen geçerli bir hedef girin (1-24 saat)');
      return;
    }
    updateGoalMutation.mutate(goal);
  };

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours} s`;
    return `${hours} s ${mins} dk`;
  };

  const getQualityLabel = (quality?: string) => {
    if (!quality) return '';
    const labels = { good: 'İyi', medium: 'Orta', poor: 'Zayıf' };
    return labels[quality as keyof typeof labels] || '';
  };

  const getQualityEmoji = (quality?: string) => {
    if (!quality) return '';
    const emojis = { good: '😊', medium: '😐', poor: '😴' };
    return emojis[quality as keyof typeof emojis] || '';
  };

  // Default values if data hasn't loaded yet
  const safeSleepData = sleepData || [];
  const safePreferences = preferences || { stepsGoal: 7000, meditationGoalMin: 10, sleepGoalHours: 7 };

  // Calculate statistics
  const calculateStats = () => {
    if (!safeSleepData || safeSleepData.length === 0) {
      return { lastNight: null, weeklyAvg: 0, bestNight: 0, poorNights: 0 };
    }

    const today = new Date();
    const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayUTC = Date.UTC(yesterday.getUTCFullYear(), yesterday.getUTCMonth(), yesterday.getUTCDate());

    const lastNight = safeSleepData.find((s: any) => {
      const d = new Date(s.sleepDate);
      const dUTC = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      return dUTC === yesterdayUTC;
    });

    // Last 7 nights
    const last7Nights = safeSleepData.filter((s: any) => {
      const date = new Date(s.sleepDate);
      const dateUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      const diff = todayUTC - dateUTC;
      return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    });

    const weeklyAvg = last7Nights.length > 0
      ? Math.round(last7Nights.reduce((sum: number, s: any) => sum + s.durationMin, 0) / last7Nights.length / 60 * 10) / 10
      : 0;

    const bestNight = Math.max(...safeSleepData.map((s: any) => s.durationMin), 0);

    const poorNights = safeSleepData.filter((s: any) => s.quality === 'poor').length;

    return {
      lastNight,
      weeklyAvg,
      bestNight,
      poorNights,
    };
  };

  const stats = calculateStats();
  const goal = safePreferences?.sleepGoalHours || 7;
  const goalMin = goal * 60;
  const percentage = stats.lastNight
    ? Math.round((stats.lastNight.durationMin / goalMin) * 100)
    : 0;

  // Get last 7 nights for chart
  const getLast7Nights = () => {
    const nights = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() - i);
      const dateUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

      const record = safeSleepData?.find((s: any) => {
        const d = new Date(s.sleepDate);
        const dUTC = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
        return dUTC === dateUTC;
      });

      nights.push({
        date,
        durationMin: record?.durationMin || 0,
        quality: record?.quality,
        dayName: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
      });
    }

    return nights.reverse();
  };

  const last7Nights = getLast7Nights();
  const maxHours = Math.max(...last7Nights.map(n => n.durationMin / 60), goal);

  if (isLoading && !sleepData && !preferences) {
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
          <Text style={styles.headerTitle}>Uyku</Text>
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
        {/* Last Night Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Dün Gece</Text>
            {stats.lastNight && (
              <View style={styles.qualityChip}>
                <Text style={styles.qualityText}>
                  {getQualityEmoji(stats.lastNight.quality)} {getQualityLabel(stats.lastNight.quality)}
                </Text>
              </View>
            )}
          </View>

          {stats.lastNight ? (
            <>
              <View style={styles.metricContainer}>
                <Text style={styles.metricValue}>{formatHours(stats.lastNight.durationMin)}</Text>
              </View>

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
                  {percentage}% · Hedef {goal} saat
                </Text>
              </View>

              {stats.lastNight.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Not:</Text>
                  <Text style={styles.notesText}>{stats.lastNight.notes}</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>😴</Text>
              <Text style={styles.emptyText}>Dün gece kaydı yok</Text>
              <Text style={styles.emptySubtext}>Hemen eklemek için butona tıklayın</Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.actionButtonTextPrimary}>
                {stats.lastNight ? 'Düzenle' : 'Uyku Ekle'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setGoalModalVisible(true)}
            >
              <Text style={styles.actionButtonText}>Hedefi Düzenle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Son 7 Gün</Text>

          <View style={styles.chartContainer}>
            {last7Nights.map((night, index) => {
              const barHeight = maxHours > 0 ? (night.durationMin / 60 / maxHours) * 120 : 0;
              const isGoalReached = night.durationMin >= goalMin;
              const qualityColor =
                night.quality === 'good'
                  ? theme.colors.primary
                  : night.quality === 'medium'
                  ? theme.colors.textSecondary + '60'
                  : theme.colors.textSecondary + '40';

              return (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight || 4,
                          backgroundColor: night.durationMin > 0 ? qualityColor : theme.colors.backgroundSecondary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{night.dayName}</Text>
                  {night.quality && (
                    <Text style={styles.barQuality}>{getQualityEmoji(night.quality)}</Text>
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.goalLine}>
            <View style={styles.goalLineDashed} />
            <Text style={styles.goalLineText}>Hedef: {goal} s</Text>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>İstatistikler</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.weeklyAvg}</Text>
              <Text style={styles.statLabel}>Haftalık Ort. (s)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatHours(stats.bestNight)}</Text>
              <Text style={styles.statLabel}>En İyi Gece</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.poorNights}</Text>
              <Text style={styles.statLabel}>Zayıf Kalite</Text>
            </View>
          </View>
        </View>

        {/* Tips */}
        <View style={[styles.card, styles.tipsCard]}>
          <Text style={styles.tipsIcon}>💡</Text>
          <Text style={styles.tipsTitle}>İpucu</Text>
          <Text style={styles.tipsText}>
            Yetişkinler için günde 7-9 saat uyku önerilir. Düzenli uyku saatleri, karanlık ve serin bir oda,
            ve yatmadan önce ekran kullanımından kaçınmak uyku kalitenizi artırabilir.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sleep Entry Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Uyku Ekle</Text>
            <Text style={styles.modalSubtitle}>
              {selectedDate.toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })} gecesi
            </Text>

            {/* Quick Presets */}
            <Text style={styles.presetsLabel}>Hızlı Seçim</Text>
            <View style={styles.presetsContainer}>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => handleQuickLog(5)}
              >
                <Text style={styles.presetButtonText}>5 s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => handleQuickLog(6)}
              >
                <Text style={styles.presetButtonText}>6 s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => handleQuickLog(7)}
              >
                <Text style={styles.presetButtonText}>7 s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => handleQuickLog(8)}
              >
                <Text style={styles.presetButtonText}>8 s</Text>
              </TouchableOpacity>
            </View>

            {/* Manual Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>veya manuel girin (saat)</Text>
              <TextInput
                style={styles.input}
                value={hoursInput}
                onChangeText={setHoursInput}
                placeholder="ör: 7.5"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Quality Selection */}
            <View style={styles.qualityContainer}>
              <Text style={styles.inputLabel}>Kalite (opsiyonel)</Text>
              <View style={styles.qualityButtons}>
                <TouchableOpacity
                  style={[
                    styles.qualityButton,
                    selectedQuality === 'good' && styles.qualityButtonSelected,
                  ]}
                  onPress={() => setSelectedQuality(selectedQuality === 'good' ? undefined : 'good')}
                >
                  <Text style={styles.qualityButtonText}>😊 İyi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.qualityButton,
                    selectedQuality === 'medium' && styles.qualityButtonSelected,
                  ]}
                  onPress={() => setSelectedQuality(selectedQuality === 'medium' ? undefined : 'medium')}
                >
                  <Text style={styles.qualityButtonText}>😐 Orta</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.qualityButton,
                    selectedQuality === 'poor' && styles.qualityButtonSelected,
                  ]}
                  onPress={() => setSelectedQuality(selectedQuality === 'poor' ? undefined : 'poor')}
                >
                  <Text style={styles.qualityButtonText}>😴 Zayıf</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notes */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notlar (opsiyonel)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Örn: Birkaç kez uyandım"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setHoursInput('');
                  setSelectedQuality(undefined);
                  setNotes('');
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  setSelectedDate(yesterday);
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleManualSave}
                disabled={logSleepMutation.isPending || !hoursInput}
              >
                <Text style={styles.saveButtonText}>
                  {logSleepMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </Text>
              </TouchableOpacity>
            </View>
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
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => handleGoalSave(7)}
              >
                <Text style={styles.presetButtonText}>7 s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => handleGoalSave(8)}
              >
                <Text style={styles.presetButtonText}>8 s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => handleGoalSave(9)}
              >
                <Text style={styles.presetButtonText}>9 s</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>veya özel bir hedef girin (saat)</Text>
              <TextInput
                style={styles.input}
                value={goalInput}
                onChangeText={setGoalInput}
                placeholder={`Mevcut: ${goal} saat`}
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="decimal-pad"
              />
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

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => handleGoalSave()}
                disabled={updateGoalMutation.isPending || !goalInput}
              >
                <Text style={styles.saveButtonText}>
                  {updateGoalMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </Text>
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
    qualityChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: theme.colors.primary + '20',
    },
    qualityText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    metricContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    metricValue: {
      fontSize: 48,
      fontWeight: '700',
      color: theme.colors.text,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: theme.spacing.md,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.colors.textSecondary,
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
    notesContainer: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: 8,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    notesLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    notesText: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
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
    chartContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'flex-end',
      height: 160,
      paddingVertical: theme.spacing.md,
    },
    barContainer: {
      alignItems: 'center',
      flex: 1,
    },
    barWrapper: {
      height: 120,
      justifyContent: 'flex-end',
      marginBottom: 4,
    },
    bar: {
      width: BAR_WIDTH - 8,
      borderRadius: 4,
      minHeight: 4,
    },
    barLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 2,
    },
    barQuality: {
      fontSize: 10,
    },
    goalLine: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    goalLineDashed: {
      flex: 1,
      height: 2,
      borderTopWidth: 2,
      borderTopColor: theme.colors.primary,
      borderStyle: 'dashed',
      marginRight: theme.spacing.sm,
    },
    goalLineText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.primary,
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
      fontSize: 20,
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
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    qualityContainer: {
      marginBottom: theme.spacing.md,
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
      marginTop: theme.spacing.md,
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
