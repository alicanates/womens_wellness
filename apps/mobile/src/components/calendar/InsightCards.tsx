import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface InsightCardsProps {
  prediction?: {
    nextStart: Date;
    confidence: 'low' | 'medium' | 'high';
    averageCycleLength: number;
    fertile: {
      start: Date;
      end: Date;
    };
    ovulation: Date;
  };
  stats?: {
    averageCycleLength: number | null;
    averagePeriodLength: number | null;
    cycleVariance: number | null;
    last3Cycles: number[];
  };
}

export function InsightCards({ prediction, stats }: InsightCardsProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const getConfidenceLabel = (confidence: 'low' | 'medium' | 'high'): string => {
    switch (confidence) {
      case 'high':
        return 'Yüksek';
      case 'medium':
        return 'Orta';
      case 'low':
        return 'Düşük';
    }
  };

  const getConfidenceColor = (confidence: 'low' | 'medium' | 'high'): string => {
    switch (confidence) {
      case 'high':
        return '#4CAF50';
      case 'medium':
        return '#FFA500';
      case 'low':
        return '#FF5252';
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
    });
  };

  const getVarianceLabel = (variance: number | null): string => {
    if (!variance) return 'Hesaplanamıyor';
    if (variance < 2) return 'Çok düzenli';
    if (variance < 4) return 'Düzenli';
    if (variance < 7) return 'Orta düzeyde değişken';
    return 'Düzensiz';
  };

  return (
    <View style={styles.container}>
      {/* Next Period Prediction */}
      {prediction && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sonraki Regl Tahmini</Text>
          <Text style={styles.dateText}>{formatDate(prediction.nextStart)}</Text>
          <View style={styles.metaRow}>
            <View style={styles.confidenceBadge}>
              <Text
                style={[
                  styles.confidenceText,
                  { color: getConfidenceColor(prediction.confidence) },
                ]}
              >
                Güven: {getConfidenceLabel(prediction.confidence)}
              </Text>
            </View>
          </View>
          <Text style={styles.explanation}>
            Son {prediction.averageCycleLength} günlük ortalama döngünüze göre hesaplandı.
            {prediction.confidence === 'low' &&
              ' Daha fazla veri daha kesin tahminler için yardımcı olacaktır.'}
          </Text>
        </View>
      )}

      {/* Fertile Window & Ovulation */}
      {prediction && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verimli Pencere & Yumurtlama</Text>
          <View style={styles.windowRow}>
            <View style={styles.windowItem}>
              <Text style={styles.windowLabel}>Verimli Pencere</Text>
              <Text style={styles.windowDate}>
                {formatDate(prediction.fertile.start)} -{' '}
                {formatDate(prediction.fertile.end)}
              </Text>
            </View>
            <View style={[styles.windowItem, styles.windowItemBorder]}>
              <Text style={styles.windowLabel}>Yumurtlama</Text>
              <Text style={styles.windowDate}>{formatDate(prediction.ovulation)}</Text>
            </View>
          </View>
          <Text style={styles.explanation}>
            ⚠️ Bu tahminler ortalama döngü verilerine dayanır ve garanti değildir. Doğum
            kontrolü veya hamilelik planlaması için kesin bir yöntem olarak
            kullanılmamalıdır.
          </Text>
        </View>
      )}

      {/* Cycle Health Snapshot */}
      {stats && stats.averageCycleLength && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Döngü Sağlık Özeti</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.averageCycleLength}</Text>
              <Text style={styles.statLabel}>Ortalama Döngü (gün)</Text>
            </View>
            {stats.averagePeriodLength && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.averagePeriodLength}</Text>
                <Text style={styles.statLabel}>Ortalama Süre (gün)</Text>
              </View>
            )}
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {getVarianceLabel(stats.cycleVariance)}
              </Text>
              <Text style={styles.statLabel}>Düzenlilik</Text>
            </View>
          </View>
          {stats.last3Cycles.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Son 3 Döngü Uzunlukları</Text>
              <View style={styles.cyclesRow}>
                {stats.last3Cycles.map((length, index) => (
                  <View key={index} style={styles.cycleChip}>
                    <Text style={styles.cycleChipText}>{length} gün</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      )}

      {/* Recommendations */}
      {prediction && prediction.confidence !== 'high' && (
        <View style={[styles.card, styles.recommendationCard]}>
          <Text style={styles.cardTitle}>💡 Öneriler</Text>
          <Text style={styles.recommendationText}>
            • Daha kesin tahminler için düzenli regl başlangıçlarını kaydedin
          </Text>
          <Text style={styles.recommendationText}>
            • Semptomlarınızı ve ruh halinizi takip edin
          </Text>
          <Text style={styles.recommendationText}>
            • En az 3 döngü verisi tahmini iyileştirir
          </Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      padding: theme.spacing.md,
      gap: theme.spacing.md,
    },
    card: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: theme.card.padding,
      shadowColor: theme.card.shadowColor,
      shadowOffset: theme.card.shadowOffset,
      shadowOpacity: theme.card.shadowOpacity,
      shadowRadius: theme.card.shadowRadius,
      elevation: theme.card.elevation,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    recommendationCard: {
      backgroundColor: theme.colors.backgroundCard,
      borderColor: theme.colors.primary,
      borderWidth: 1,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subsectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    dateText: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    confidenceBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: theme.colors.background,
      borderRadius: 6,
    },
    confidenceText: {
      fontSize: 12,
      fontWeight: '600',
    },
    explanation: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },
    windowRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    windowItem: {
      flex: 1,
    },
    windowItemBorder: {
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.border,
      paddingLeft: theme.spacing.sm,
    },
    windowLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    windowDate: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    statItem: {
      flex: 1,
      minWidth: '30%',
      alignItems: 'center',
      padding: theme.spacing.sm,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    cyclesRow: {
      flexDirection: 'row',
      gap: 8,
    },
    cycleChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cycleChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text,
    },
    recommendationText: {
      fontSize: 13,
      color: theme.colors.text,
      lineHeight: 20,
      marginBottom: 4,
    },
  });
