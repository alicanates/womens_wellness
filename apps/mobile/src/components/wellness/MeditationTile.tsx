import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { WellnessTile } from './WellnessTile';
import { useTheme } from '@/hooks/useTheme';
import { wellnessService } from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

interface MeditationTileProps {
  data: {
    todayMin: number;
    goalMin: number;
    percentage: number;
    sessions: number;
  } | null;
}

export const MeditationTile: React.FC<MeditationTileProps> = ({ data }) => {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);

  const logMeditationMutation = useMutation({
    mutationFn: (durationMin: number) =>
      wellnessService.logMeditation({
        date: new Date().toISOString(),
        durationMin,
        type: durationMin === 1 ? 'breath' : 'guided',
        isManual: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });
      queryClient.invalidateQueries({ queryKey: ['meditation'] });
      setModalVisible(false);
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Meditasyon kaydedilemedi');
    },
  });

  const handleQuickLog = (minutes: number) => {
    logMeditationMutation.mutate(minutes);
  };

  if (!data) {
    return (
      <WellnessTile
        icon="🧘"
        title="Meditasyon"
        subtitle="Nefes"
        value="-"
        isEmpty
        emptyState="1 dk nefes ile başla"
        onPress={() => router.push('/wellness/meditation')}
        actions={
          <View style={styles(theme).actionsRow}>
            <TouchableOpacity
              style={styles(theme).quickButton}
              onPress={(e) => {
                e.stopPropagation();
                handleQuickLog(1);
              }}
            >
              <Text style={styles(theme).quickButtonText}>1 dk</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles(theme).quickButton}
              onPress={(e) => {
                e.stopPropagation();
                handleQuickLog(5);
              }}
            >
              <Text style={styles(theme).quickButtonText}>5 dk</Text>
            </TouchableOpacity>
          </View>
        }
      />
    );
  }

  const isGoalReached = data.percentage >= 100;

  return (
    <>
      <WellnessTile
        icon="🧘"
        title="Meditasyon"
        subtitle={isGoalReached ? '✓ Tebrikler!' : `${data.sessions} seans`}
        value={`${data.todayMin} dk`}
        target={`Hedef ${data.goalMin} dk`}
        percentage={data.percentage}
        onPress={() => router.push('/wellness/meditation')}
        actions={
          <View style={styles(theme).actionsRow}>
            <TouchableOpacity
              style={styles(theme).quickButton}
              onPress={(e) => {
                e.stopPropagation();
                handleQuickLog(1);
              }}
              disabled={logMeditationMutation.isPending}
            >
              <Text style={styles(theme).quickButtonText}>+1 dk</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles(theme).quickButton}
              onPress={(e) => {
                e.stopPropagation();
                handleQuickLog(5);
              }}
              disabled={logMeditationMutation.isPending}
            >
              <Text style={styles(theme).quickButtonText}>+5 dk</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Detail Modal (future: show session history) */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles(theme).modalOverlay}>
          <View style={styles(theme).modalContent}>
            <Text style={styles(theme).modalTitle}>Meditasyon</Text>

            <View style={styles(theme).statsContainer}>
              <Text style={styles(theme).statsLabel}>Bugün</Text>
              <Text style={styles(theme).statsValue}>{data.todayMin} dakika</Text>
              <Text style={styles(theme).statsLabel}>{data.sessions} seans</Text>
            </View>

            <Text style={styles(theme).helperText}>
              Hızlı eklemek için ana ekrandan +1 dk veya +5 dk butonlarını kullanın
            </Text>

            <TouchableOpacity
              style={styles(theme).closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles(theme).closeButtonText}>Kapat</Text>
            </TouchableOpacity>
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
      backgroundColor: theme.colors.primary + '20',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.primary + '40',
    },
    quickButtonText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.primary,
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
    statsContainer: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 12,
      padding: theme.spacing.md,
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    statsLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    statsValue: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    helperText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      lineHeight: 18,
    },
    closeButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    closeButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textOnPrimary,
    },
  });
