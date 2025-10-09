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
const BAR_WIDTH = (width - 80) / 7; // 7 bars with spacing

export default function StepsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [stepsInput, setStepsInput] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeFilter, setTimeFilter] = useState<'week' | 'month'>('week');

  const styles = createStyles(theme);

  // Fetch last 30 days - use stable date-only strings for query keys
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

  const { data: stepsData, isLoading, refetch, error: stepsError } = useQuery({
    queryKey: ['steps', dateRange.fromDateStr, dateRange.toDateStr],
    queryFn: () => wellnessService.getSteps(dateRange.fromISO, dateRange.toISO),
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
    if ((stepsError || prefsError) && !isLoading) {
      const errorMsg = (stepsError as any)?.message || (prefsError as any)?.message || 'Bilinmeyen hata';
      console.error('Steps screen error:', { stepsError, prefsError });

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
              onPress: () => {
                refetch();
              },
            },
          ]
        );
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [stepsError, prefsError, isLoading]);

  const logStepsMutation = useMutation({
    mutationFn: (data: { date: string; count: number }) =>
      wellnessService.logSteps({
        date: data.date,
        count: data.count,
        isManual: true,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['steps'] });
      await queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });
      await refetch();
      setModalVisible(false);
      setStepsInput('');
      setSelectedDate(new Date());
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Adım kaydedilemedi');
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: (goal: number) =>
      wellnessService.updatePreferences({ stepsGoal: goal }),
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

  const handleManualAdd = () => {
    const count = parseInt(stepsInput, 10);
    if (isNaN(count) || count <= 0 || count > 100000) {
      Alert.alert('Hata', 'Lütfen geçerli bir adım sayısı girin (1-100000)');
      return;
    }
    logStepsMutation.mutate({ date: selectedDate.toISOString(), count });
  };

  const handleGoalSave = (preset?: number) => {
    const goal = preset || parseInt(goalInput, 10);
    if (isNaN(goal) || goal <= 0 || goal > 100000) {
      Alert.alert('Hata', 'Lütfen geçerli bir hedef girin (1-100000)');
      return;
    }
    updateGoalMutation.mutate(goal);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  // Default values if data hasn't loaded yet
  const safeStepsData = stepsData || [];
  const safePreferences = preferences || { stepsGoal: 7000, meditationGoalMin: 10, sleepGoalHours: 7 };

  // Calculate statistics
  const calculateStats = () => {
    if (!safeStepsData || safeStepsData.length === 0) {
      return { today: 0, weeklyAvg: 0, bestDay: 0, streak: 1 };
    }

    const today = new Date();
    const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

    const todayRecord = safeStepsData.find((s: any) => {
      const d = new Date(s.date);
      const dUTC = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
      return dUTC === todayUTC;
    });

    // Last 7 days
    const last7Days = safeStepsData.filter((s: any) => {
      const date = new Date(s.date);
      const dateUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
      const diff = todayUTC - dateUTC;
      return diff >= 0 && diff < 7 * 24 * 60 * 60 * 1000;
    });

    const weeklyAvg = last7Days.length > 0
      ? Math.round(last7Days.reduce((sum: number, s: any) => sum + s.count, 0) / last7Days.length)
      : 0;

    const bestDay = Math.max(...safeStepsData.map((s: any) => s.count), 0);

    // Calculate streak (consecutive days with goal reached)
    const goal = safePreferences?.stepsGoal || 7000;
    let streak = 0;
    const sorted = [...safeStepsData].sort((a: any, b: any) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Count consecutive days from today backwards
    let checkDate = new Date();
    for (let i = 0; i < 365; i++) { // Check up to a year back
      const checkDateUTC = Date.UTC(checkDate.getUTCFullYear(), checkDate.getUTCMonth(), checkDate.getUTCDate());
      const record = sorted.find((s: any) => {
        const d = new Date(s.date);
        const dUTC = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
        return dUTC === checkDateUTC;
      });

      if (record && record.count >= goal) {
        streak++;
        checkDate.setUTCDate(checkDate.getUTCDate() - 1);
      } else {
        break;
      }
    }

    // If no streak from data but user just started, show 1
    if (streak === 0 && safeStepsData.length > 0) {
      streak = 1;
    }

    return {
      today: todayRecord?.count || 0,
      weeklyAvg,
      bestDay,
      streak,
    };
  };

  const stats = calculateStats();
  const goal = safePreferences?.stepsGoal || 7000;
  const percentage = Math.round((stats.today / goal) * 100);

  // Get last 7 days for chart
  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() - i);
      const dateUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

      const record = safeStepsData?.find((s: any) => {
        const d = new Date(s.date);
        const dUTC = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
        return dUTC === dateUTC;
      });

      days.push({
        date,
        count: record?.count || 0,
        dayName: date.toLocaleDateString('tr-TR', { weekday: 'short' }),
      });
    }
    return days;
  };

  const last7Days = getLast7Days();
  const maxCount = Math.max(...last7Days.map(d => d.count), goal);

  if (isLoading && !stepsData && !preferences) {
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
          <Text style={styles.headerTitle}>Adım</Text>
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
            <View style={styles.statusChips}>
              {stats.today >= goal && (
                <View style={[styles.chip, styles.chipSuccess]}>
                  <Text style={styles.chipText}>✓ Hedefe ulaştın!</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.metricContainer}>
            <Text style={styles.metricValue}>{formatNumber(stats.today)}</Text>
            <Text style={styles.metricUnit}>adım</Text>
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
              {percentage}% · Hedef {formatNumber(goal)}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonPrimary]}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.actionButtonTextPrimary}>Manuel Ekle</Text>
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
            {last7Days.map((day, index) => {
              const barHeight = maxCount > 0 ? (day.count / maxCount) * 120 : 0;
              const isGoalReached = day.count >= goal;

              return (
                <View key={index} style={styles.barContainer}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: isGoalReached
                            ? theme.colors.primary
                            : theme.colors.textSecondary + '40',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{day.dayName}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>İstatistikler</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatNumber(stats.weeklyAvg)}</Text>
              <Text style={styles.statLabel}>Haftalık Ortalama</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatNumber(stats.bestDay)}</Text>
              <Text style={styles.statLabel}>En İyi Gün</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.streak}</Text>
              <Text style={styles.statLabel}>Seri (gün)</Text>
            </View>
          </View>
        </View>

        {/* Tips */}
        <View style={[styles.card, styles.tipsCard]}>
          <Text style={styles.tipsIcon}>💡</Text>
          <Text style={styles.tipsTitle}>İpucu</Text>
          <Text style={styles.tipsText}>
            Günlük 7.000-10.000 adım atmak, kardiyovasküler sağlığı destekler ve enerji seviyenizi artırır.
            Küçük yürüyüşlerle başlayın ve kademeli olarak artırın.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Manual Entry Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adım Ekle</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Tarih</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => {
                  // TODO: Add date picker
                  Alert.alert('Bilgi', 'Tarih seçici yakında eklenecek');
                }}
              >
                <Text style={styles.dateButtonText}>
                  {selectedDate.toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Adım Sayısı</Text>
              <TextInput
                style={styles.input}
                value={stepsInput}
                onChangeText={setStepsInput}
                placeholder="ör: 5000"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="number-pad"
                autoFocus
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setStepsInput('');
                  setSelectedDate(new Date());
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleManualAdd}
                disabled={logStepsMutation.isPending}
              >
                <Text style={styles.saveButtonText}>
                  {logStepsMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
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
                onPress={() => handleGoalSave(5000)}
              >
                <Text style={styles.presetButtonText}>5.000</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => handleGoalSave(7000)}
              >
                <Text style={styles.presetButtonText}>7.000</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.presetButton}
                onPress={() => handleGoalSave(10000)}
              >
                <Text style={styles.presetButtonText}>10.000</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>veya özel bir hedef girin</Text>
              <TextInput
                style={styles.input}
                value={goalInput}
                onChangeText={setGoalInput}
                placeholder={`Mevcut: ${formatNumber(goal)}`}
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="number-pad"
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
    statusChips: {
      flexDirection: 'row',
      gap: 8,
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
      marginBottom: theme.spacing.md,
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
      marginBottom: 8,
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
      marginBottom: theme.spacing.lg,
    },
    inputContainer: {
      marginBottom: theme.spacing.md,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
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
    dateButton: {
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      padding: theme.spacing.md,
    },
    dateButtonText: {
      fontSize: 16,
      color: theme.colors.text,
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
