import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cyclesService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export default function CalendarScreen() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
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
      const data = await cyclesService.getCalendar(selectedYear, selectedMonth);
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
    enabled: isAuthenticated,
  });

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

  const getDayStyle = (day: any): StyleProp<ViewStyle>[] => {
    const styles: StyleProp<ViewStyle>[] = [calendarStyles.day];

    if (day.isPeriod) {
      styles.push(calendarStyles.periodDay);
    } else if (day.isFertile) {
      styles.push(calendarStyles.fertileDay);
    } else if (day.isPredicted) {
      styles.push(calendarStyles.predictedDay);
    }

    // Ensure date is a Date object
    const dayDate = day.date instanceof Date ? day.date : new Date(day.date);

    const isToday =
      dayDate.getDate() === today.getDate() &&
      dayDate.getMonth() === today.getMonth() &&
      dayDate.getFullYear() === today.getFullYear();

    if (isToday) {
      styles.push(calendarStyles.today);
    }

    return styles;
  };

  const handleDayPress = (day: any) => {
    // Ensure date is a Date object
    const dayDate = day.date instanceof Date ? day.date : new Date(day.date);

    let message = `${dayDate.getDate()} ${monthNames[dayDate.getMonth()]}\n\n`;

    if (day.isPeriod) {
      message += `🩸 Regl günü${day.cycleDay ? ` (${day.cycleDay}. gün)` : ''}\n`;
    }
    if (day.isFertile) {
      message += '🌸 Verimli gün\n';
    }
    if (day.isPredicted) {
      message += '📅 Tahmini regl başlangıcı\n';
    }

    const buttons: any[] = [
      { text: 'Kapat', style: 'cancel' },
    ];

    // Allow logging period for any day
    buttons.unshift({
      text: 'Regl Olarak İşaretle',
      onPress: () => logPeriodForDate(dayDate),
    });

    Alert.alert('Gün Detayı', message, buttons);
  };

  const logPeriodForDate = async (date: Date) => {
    Alert.alert(
      'Regl Kaydet',
      `${date.getDate()} ${monthNames[date.getMonth()]} tarihini regl başlangıcı olarak kaydetmek istiyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaydet',
          onPress: async () => {
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
          },
        },
      ]
    );
  };

  const handleLogPeriod = () => {
    Alert.alert(
      'Regl Kaydet',
      'Bugün regl başlangıcı olarak kaydedilsin mi?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaydet',
          onPress: async () => {
            try {
              await cyclesService.createCycle({
                startDate: new Date().toISOString(),
              });
              queryClient.invalidateQueries({ queryKey: ['calendar'] });
              queryClient.invalidateQueries({ queryKey: ['prediction'] });
              Alert.alert('Başarılı', 'Regl kaydedildi');
            } catch (error: any) {
              Alert.alert('Hata', error.message || 'Kaydedilemedi');
            }
          },
        },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Takvimi Sıfırla',
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
              Alert.alert('Başarılı', 'Takvim sıfırlandı');
            } catch (error: any) {
              Alert.alert('Hata', error.message || 'Sıfırlanamadı');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
      {/* Header with navigation */}
      <View style={styles.header}>
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

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF6B6B' }]} />
          <Text style={styles.legendText}>Regl</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFD93D' }]} />
          <Text style={styles.legendText}>Verimli</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#A8DADC' }]} />
          <Text style={styles.legendText}>Tahmin</Text>
        </View>
      </View>

      {/* Prediction summary */}
      {predictionData && (predictionData as any).prediction && (
        <View style={styles.predictionCard}>
          <Text style={styles.predictionTitle}>Sonraki Regl Tahmini</Text>
          <Text style={styles.predictionDate}>
            {new Date(
              (predictionData as any).prediction.nextStart
            ).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <Text style={styles.predictionMeta}>
            Ortalama döngü: {(predictionData as any).prediction.averageCycleLength} gün
          </Text>
          <Text style={styles.predictionMeta}>
            Güven: {(predictionData as any).prediction.confidence === 'high' ? 'Yüksek' : (predictionData as any).prediction.confidence === 'medium' ? 'Orta' : 'Düşük'}
          </Text>
        </View>
      )}

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
              return (
                <TouchableOpacity
                  key={index}
                  style={getDayStyle({ ...day, date: dayDate })}
                  onPress={() => handleDayPress({ ...day, date: dayDate })}
                >
                  <Text
                    style={[
                      calendarStyles.dayText,
                      (day.isPeriod || day.isFertile || day.isPredicted) &&
                        calendarStyles.dayTextHighlight,
                    ]}
                  >
                    {dayDate.getDate()}
                  </Text>
                  {day.cycleDay && (
                    <Text style={calendarStyles.cycleDayText}>
                      {day.cycleDay}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}
      </View>

      {/* Log period button */}
      <TouchableOpacity style={styles.logButton} onPress={handleLogPeriod}>
        <Text style={styles.logButtonText}>📝 Regl Kaydet</Text>
      </TouchableOpacity>

      {/* Reset button */}
      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetButtonText}>🔄 Takvimi Sıfırla</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100, // Extra padding for bottom tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    fontSize: 24,
    color: '#007AFF',
  },
  headerCenter: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
  },
  todayButton: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  predictionCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  predictionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  predictionDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  predictionMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  calendar: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  logButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

const calendarStyles = StyleSheet.create({
  day: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    marginVertical: 2,
  },
  periodDay: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
  },
  fertileDay: {
    backgroundColor: '#FFD93D',
    borderRadius: 8,
  },
  predictedDay: {
    backgroundColor: '#A8DADC',
    borderRadius: 8,
  },
  today: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dayTextHighlight: {
    color: '#fff',
    fontWeight: '600',
  },
  cycleDayText: {
    fontSize: 9,
    color: '#fff',
    marginTop: 2,
  },
});
