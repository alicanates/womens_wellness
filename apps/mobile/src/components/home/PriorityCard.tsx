import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';

interface PriorityCardProps {
  card: {
    id: string;
    type: string;
    data: any;
  };
  onDismiss?: () => void;
  onPin?: () => void;
}

export function PriorityCard({ card, onDismiss, onPin }: PriorityCardProps) {
  const theme = useTheme();
  const router = useRouter();
  const styles = createStyles(theme);

  const renderCardContent = () => {
    switch (card.type) {
      case 'hydration':
        const progress = (card.data.current / card.data.target) * 100;
        return (
          <View>
            <View style={styles.header}>
              <Text style={styles.icon}>💧</Text>
              <Text style={styles.title}>Hidrasyon</Text>
            </View>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {(card.data.current / 1000).toFixed(1)} L / {(card.data.target / 1000).toFixed(1)} L
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
              </View>
            </View>
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.quickButton, styles.quickButtonFirst]}
                onPress={() => {
                  // Quick add water logic will be added
                  router.push('/water');
                }}
              >
                <Text style={styles.quickButtonText}>+250 ml</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => {
                  router.push('/water');
                }}
              >
                <Text style={styles.quickButtonText}>+500 ml</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'cycle_insight':
        return (
          <View>
            <View style={styles.header}>
              <Text style={styles.icon}>🌸</Text>
              <Text style={styles.title}>Döngü Tahmini</Text>
            </View>
            <Text style={styles.cardText}>
              Döngü Günü: {card.data.cycleDay}
            </Text>
            <Text style={styles.cardText}>
              Sonraki regl: {card.data.daysUntil > 0 ? `${card.data.daysUntil} gün sonra` : 'Yakında'}
            </Text>
            <Text style={styles.confidenceText}>
              Güven: {card.data.estimate.confidence === 'high' ? 'Yüksek' : card.data.estimate.confidence === 'medium' ? 'Orta' : 'Düşük'}
            </Text>
          </View>
        );

      case 'symptom_log':
        return (
          <View>
            <View style={styles.header}>
              <Text style={styles.icon}>📝</Text>
              <Text style={styles.title}>Hızlı Semptom Kaydı</Text>
            </View>
            <Text style={styles.cardSubtitle}>Bugün nasıl hissediyorsun?</Text>
            <View style={styles.moodButtons}>
              <TouchableOpacity style={styles.moodButton}>
                <Text style={styles.moodIcon}>😊</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.moodButton}>
                <Text style={styles.moodIcon}>😐</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.moodButton}>
                <Text style={styles.moodIcon}>😔</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'reminder':
        return (
          <View>
            <View style={styles.header}>
              <Text style={styles.icon}>⏰</Text>
              <Text style={styles.title}>Hatırlatıcılar</Text>
            </View>
            <Text style={styles.cardText}>
              Bugün {card.data.count} hatırlatıcı var
            </Text>
            {card.data.next && (
              <Text style={styles.cardSubtitle}>
                Sonraki: {new Date(card.data.next.nextRunAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/reminders')}
            >
              <Text style={styles.actionButtonText}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
        );

      case 'nova_prompt':
        return (
          <View>
            <View style={styles.header}>
              <Text style={styles.icon}>✨</Text>
              <Text style={styles.title}>NOVA Öneri</Text>
            </View>
            <Text style={styles.cardText}>{card.data.prompt}</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/chat')}
            >
              <Text style={styles.actionButtonText}>Sohbet Et</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {renderCardContent()}
      {onDismiss && (
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.backgroundCard,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    icon: {
      fontSize: 20,
      marginRight: 8,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      flex: 1,
    },
    cardText: {
      fontSize: 14,
      color: theme.colors.text,
      marginBottom: 6,
    },
    cardSubtitle: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: 12,
    },
    confidenceText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    progressContainer: {
      marginBottom: 12,
    },
    progressText: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.primary,
      marginBottom: 8,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
    },
    quickActions: {
      flexDirection: 'row',
    },
    quickButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
      marginLeft: 8,
    },
    quickButtonFirst: {
      marginLeft: 0,
    },
    quickButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    moodButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 8,
    },
    moodButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    moodIcon: {
      fontSize: 32,
    },
    actionButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 12,
    },
    actionButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    dismissButton: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dismissText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
  });
