import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleProp,
  ViewStyle,
  Switch,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cyclesService, pregnancyService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { usePregnancyStore } from '@/store/pregnancyStore';
import { useTheme } from '@/hooks/useTheme';
import { router, useLocalSearchParams } from 'expo-router';
import { Legend } from '@/components/calendar/Legend';
import { DayMarkers, MarkerType } from '@/components/calendar/DayMarkers';
import { InsightCards } from '@/components/calendar/InsightCards';
import { DayDetailsSheet } from '@/components/calendar/DayDetailsSheet';

export default function CalendarScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { isPregnancyMode, setPregnancyMode, initializePregnancyMode } = usePregnancyStore();
  const { openToday } = useLocalSearchParams<{ openToday?: string }>();
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Day details sheet state
  const [selectedDay, setSelectedDay] = useState<any | null>(null);
  const [showDayDetails, setShowDayDetails] = useState(false);

  // Initialize pregnancy mode from storage
  useEffect(() => {
    initializePregnancyMode();
  }, []);

  // Fetch pregnancy data
  const { data: pregnancy } = useQuery({
    queryKey: ['pregnancy'],
    queryFn: () => pregnancyService.get(),
    enabled: isAuthenticated && isPregnancyMode,
  });

  // Fetch pregnancy summary
  const { data: pregnancySummary } = useQuery({
    queryKey: ['pregnancy', 'summary'],
    queryFn: () => pregnancyService.getSummary(),
    enabled: isAuthenticated && isPregnancyMode && !!pregnancy,
  });
  const leadingPlaceholders = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    let offset = firstDay.getDay() - 1;
    if (offset < 0) offset = 6; // Sunday

    return Array.from({ length: offset }, (_, index) => index);
  }, [selectedMonth, selectedYear]);

  // Fetch calendar data
  const { data: calendarData, isLoading } = useQuery({
    queryKey: ['calendar', selectedYear, selectedMonth],
    queryFn: async () => {
      const data: any = await cyclesService.getCalendar(selectedYear, selectedMonth);
      console.log('Raw calendar data:', JSON.stringify(data, null, 2));

      // Parse date strings to Date objects
      if (data?.days) {
        data.days = data.days.map((day: any) => {
          console.log('Day before parse:', day);
          const parsed = {
            ...day,
            date: new Date(day.date),
          };
          console.log('Day after parse:', parsed, 'getDate:', parsed.date.getDate);
          return parsed;
        });
      }
      return data;
    },
    enabled: isAuthenticated,
  });

  // Fetch prediction
  const { data: predictionData } = useQuery({
    queryKey: ['prediction'],
    queryFn: () => cyclesService.getPrediction(),
    enabled: isAuthenticated && !isPregnancyMode,
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['stats'],
    queryFn: () => cyclesService.getStats(),
    enabled: isAuthenticated && !isPregnancyMode,
  });

  // Open today's details when navigated from home with openToday param
  useEffect(() => {
    if (openToday === 'true' && calendarData?.days) {
      // Find today in the calendar data
      const todayDay = calendarData.days.find((day: any) => {
        const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date;
        return (
          dayDate.getDate() === today.getDate() &&
          dayDate.getMonth() === today.getMonth() &&
          dayDate.getFullYear() === today.getFullYear()
        );
      });

      if (todayDay) {
        const dayDate = typeof todayDay.date === 'string' ? new Date(todayDay.date) : todayDay.date;
        setSelectedDay({ ...todayDay, date: dayDate });
        setShowDayDetails(true);
      }
    }
  }, [openToday, calendarData]);

  const monthNames = [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ];

  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const goToToday = () => {
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth() + 1);
  };

  const handleDayPress = (day: any) => {
    const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date;

    Alert.alert(
      `${dayDate.getDate()} ${monthNames[dayDate.getMonth()]}`,
      'Ne yapmak istersiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Detayları Görüntüle',
          onPress: () => {
            setSelectedDay(day);
            setShowDayDetails(true);
          },
        },
        {
          text: 'Regl Başlangıcı Olarak Kaydet',
          onPress: () => logPeriodForDate(dayDate),
        },
      ]
    );
  };

  const logPeriodForDate = async (date: Date) => {
    try {
      await cyclesService.createCycle({
        startDate: date.toISOString(),
      });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['prediction'] });
      Alert.alert('Başarılı', 'Regl kaydedildi');
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Kaydedilemedi');
    }
  };


  const handleReset = () => {
    Alert.alert(
      'Döngüyü Sıfırla',
      'Tüm regl kayıtları silinecek. Bu işlem geri alınamaz. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            try {
              await cyclesService.deleteAllCycles();
              queryClient.invalidateQueries({ queryKey: ['calendar'] });
              queryClient.invalidateQueries({ queryKey: ['prediction'] });
              Alert.alert('Başarılı', 'Döngü sıfırlandı');
            } catch (error: any) {
              Alert.alert('Hata', error.message || 'Sıfırlanamadı');
            }
          },
        },
      ]
    );
  };

  const handlePregnancyToggle = async (value: boolean) => {
    if (value && !pregnancy) {
      // Need to set up pregnancy first
      router.push('/pregnancy/setup');
      return;
    }

    // Animate transition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    await setPregnancyMode(value);
  };

  const styles = createStyles(theme);
  const calendarStyles = createCalendarStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Regl Takibi</Text>
        </View>

        {/* Pregnancy Mode Toggle */}
        <View style={styles.pregnancyToggle}>
          <Text style={styles.pregnancyToggleLabel}>
            {isPregnancyMode ? '🤰 Hamileyim' : '📅 Hamile Misin?'}
          </Text>
          <Switch
            value={isPregnancyMode}
            onValueChange={handlePregnancyToggle}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor="#fff"
          />
        </View>

        {/* Legend - Symbol explanations */}
        {!isPregnancyMode && <Legend />}

        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>←</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.monthText}>
              {monthNames[selectedMonth - 1]} {selectedYear}
            </Text>
            <TouchableOpacity onPress={goToToday}>
              <Text style={styles.todayButton}>Bugün</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar grid */}
        <View style={styles.calendar}>
          {/* Day headers */}
          <View style={styles.weekRow}>
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
              <Text key={day} style={styles.dayHeader}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar days */}
          {!isLoading && calendarData ? (
            <View style={styles.daysContainer}>
              {/* Calculate starting offset (Monday = 0) */}
              {leadingPlaceholders.map((index) => (
                <View key={`empty-${index}`} style={calendarStyles.day} />
              ))}

              {((calendarData as any).days || []).map((day: any, index: number) => {
                const dayDate = typeof day.date === 'string' ? new Date(day.date) : day.date;
                const isToday =
                  dayDate.getDate() === today.getDate() &&
                  dayDate.getMonth() === today.getMonth() &&
                  dayDate.getFullYear() === today.getFullYear();

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      calendarStyles.day,
                      isToday && calendarStyles.today,
                    ]}
                    onPress={() => handleDayPress({ ...day, date: dayDate })}
                  >
                    <Text
                      style={[
                        calendarStyles.dayText,
                        isToday && calendarStyles.todayText,
                      ]}
                    >
                      {dayDate.getDate()}
                    </Text>
                    {day.cycleDay && (
                      <Text style={calendarStyles.cycleDayText}>
                        {day.cycleDay}
                      </Text>
                    )}
                    <DayMarkers
                      markers={day.markers || []}
                      isPredicted={day.isPredicted}
                      mood={day.dailyLog?.mood || []}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </View>

        {/* Animated Content */}
        <Animated.View style={{ opacity: fadeAnim }}>
          {isPregnancyMode ? (
            // Pregnancy Mode Content
            pregnancySummary ? (
              <View style={styles.pregnancyCard}>
                <Text style={styles.pregnancyTitle}>Hamilelik Özeti</Text>
                <View style={styles.pregnancyRow}>
                  <Text style={styles.pregnancyLabel}>Gebelik Yaşı</Text>
                  <Text style={styles.pregnancyValue}>
                    {pregnancySummary.gestationalAge.weeks} hafta{' '}
                    {pregnancySummary.gestationalAge.days} gün
                  </Text>
                </View>
                <View style={styles.pregnancyRow}>
                  <Text style={styles.pregnancyLabel}>Trimester</Text>
                  <Text style={styles.pregnancyValue}>
                    {pregnancySummary.trimester}. Trimester
                  </Text>
                </View>
                {pregnancySummary.dueDate && (
                  <View style={[styles.pregnancyRow, { marginBottom: 0 }]}>
                    <Text style={styles.pregnancyLabel}>Tahmini Doğum</Text>
                    <Text style={styles.pregnancyValue}>
                      {new Date(pregnancySummary.dueDate).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.viewDetailsButton}
                  onPress={() => router.push('/pregnancy')}
                >
                  <Text style={styles.viewDetailsText}>Detaylı Görünüm →</Text>
                </TouchableOpacity>
              </View>
            ) : null
          ) : (
            // Period Mode Content
            <>
              {/* Insight Cards */}
              {predictionData && (predictionData as any).prediction && (
                <InsightCards
                  prediction={(predictionData as any).prediction}
                  stats={statsData as any}
                />
              )}

              {/* Reset button */}
              {!isPregnancyMode && (
                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                  <Text style={styles.resetButtonText}>🔄 Döngüyü Sıfırla</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </Animated.View>
      </ScrollView>

      {/* Day Details Sheet */}
      {selectedDay && (
        <DayDetailsSheet
          visible={showDayDetails}
          onClose={() => {
            setShowDayDetails(false);
            setSelectedDay(null);
          }}
          date={selectedDay.date}
          dayData={selectedDay}
          isPeriod={selectedDay.isPeriod}
          isFertile={selectedDay.isFertile}
          isPredicted={selectedDay.isPredicted}
          isOvulation={selectedDay.isOvulation}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  pageHeader: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.card.borderRadius,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  navButton: {
    padding: theme.spacing.sm,
  },
  navButtonText: {
    fontSize: 24,
    color: theme.colors.primary,
  },
  headerCenter: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  todayButton: {
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  calendar: {
    backgroundColor: theme.colors.backgroundCard,
    margin: theme.spacing.md,
    borderRadius: theme.card.borderRadius,
    padding: theme.spacing.md,
    shadowColor: theme.card.shadowColor,
    shadowOffset: theme.card.shadowOffset,
    shadowOpacity: theme.card.shadowOpacity,
    shadowRadius: theme.card.shadowRadius,
    elevation: theme.card.elevation,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  logButton: {
    backgroundColor: theme.colors.primary,
    margin: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    padding: theme.button.padding,
    borderRadius: theme.button.borderRadius,
    alignItems: 'center',
    shadowColor: theme.button.shadowColor,
    shadowOffset: theme.button.shadowOffset,
    shadowOpacity: theme.button.shadowOpacity,
    shadowRadius: theme.button.shadowRadius,
    elevation: theme.button.elevation,
  },
  logButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  resetButton: {
    backgroundColor: theme.colors.error,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.button.padding,
    borderRadius: theme.button.borderRadius,
    alignItems: 'center',
    shadowColor: theme.colors.error,
    shadowOffset: theme.button.shadowOffset,
    shadowOpacity: 0.2,
    shadowRadius: theme.button.shadowRadius,
    elevation: theme.button.elevation,
  },
  resetButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  pregnancyToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  pregnancyToggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  pregnancyCard: {
    backgroundColor: theme.colors.backgroundCard,
    margin: theme.spacing.md,
    padding: theme.card.padding,
    borderRadius: theme.card.borderRadius,
    shadowColor: theme.card.shadowColor,
    shadowOffset: theme.card.shadowOffset,
    shadowOpacity: theme.card.shadowOpacity,
    shadowRadius: theme.card.shadowRadius,
    elevation: theme.card.elevation,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pregnancyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  pregnancyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  pregnancyLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  pregnancyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  viewDetailsButton: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});

const createCalendarStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  day: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    marginVertical: 2,
    borderRadius: 8,
  },
  today: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  todayText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  cycleDayText: {
    fontSize: 8,
    color: theme.colors.textSecondary,
    marginTop: 1,
    fontWeight: '600',
  },
});
