import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { WellnessTile } from './WellnessTile';
import { useTheme } from '@/hooks/useTheme';
import { wellnessService } from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

interface StepsTileProps {
  data: {
    today: number;
    goal: number;
    percentage: number;
    source: string;
  } | null;
}

export const StepsTile: React.FC<StepsTileProps> = ({ data }) => {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [stepsInput, setStepsInput] = useState('');

  const logStepsMutation = useMutation({
    mutationFn: (count: number) =>
      wellnessService.logSteps({
        date: new Date().toISOString(),
        count,
        isManual: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });
      queryClient.invalidateQueries({ queryKey: ['steps'] });
      setModalVisible(false);
      setStepsInput('');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Adım kaydedilemedi');
    },
  });

  const handleManualAdd = () => {
    const count = parseInt(stepsInput, 10);
    if (isNaN(count) || count <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir adım sayısı girin');
      return;
    }
    logStepsMutation.mutate(count);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  if (!data) {
    return (
      <WellnessTile
        icon="👣"
        title="Adım"
        value="-"
        isEmpty
        emptyState="Bugün veri yok – Manuel Ekle"
        onPress={() => router.push('/wellness/steps')}
        actions={
          <TouchableOpacity
            style={styles(theme).actionButton}
            onPress={(e) => {
              e.stopPropagation();
              setModalVisible(true);
            }}
          >
            <Text style={styles(theme).actionButtonText}>Manuel Ekle</Text>
          </TouchableOpacity>
        }
      />
    );
  }

  const isGoalReached = data.percentage >= 100;

  return (
    <>
      <WellnessTile
        icon="👣"
        title="Adım"
        subtitle={isGoalReached ? '✓ Hedefe ulaştın!' : undefined}
        value={`${formatNumber(data.today)} adım`}
        target={`Hedef ${formatNumber(data.goal)}`}
        percentage={data.percentage}
        onPress={() => router.push('/wellness/steps')}
        actions={
          <View style={styles(theme).actionsRow}>
            <TouchableOpacity
              style={styles(theme).smallActionButton}
              onPress={(e) => {
                e.stopPropagation();
                setModalVisible(true);
              }}
            >
              <Text style={styles(theme).smallActionText}>Manuel Ekle</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Manual Entry Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles(theme).modalOverlay}>
          <View style={styles(theme).modalContent}>
            <Text style={styles(theme).modalTitle}>Adım Ekle</Text>

            <View style={styles(theme).inputContainer}>
              <Text style={styles(theme).inputLabel}>Adım Sayısı</Text>
              <TextInput
                style={styles(theme).input}
                value={stepsInput}
                onChangeText={setStepsInput}
                placeholder="ör: 5000"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="number-pad"
                autoFocus
              />
            </View>

            <View style={styles(theme).modalButtons}>
              <TouchableOpacity
                style={[styles(theme).modalButton, styles(theme).cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setStepsInput('');
                }}
              >
                <Text style={styles(theme).cancelButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles(theme).modalButton, styles(theme).saveButton]}
                onPress={handleManualAdd}
                disabled={logStepsMutation.isPending}
              >
                <Text style={styles(theme).saveButtonText}>
                  {logStepsMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    actionButton: {
      backgroundColor: theme.colors.backgroundSecondary,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    actionButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    smallActionButton: {
      backgroundColor: theme.colors.backgroundSecondary,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 6,
    },
    smallActionText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.text,
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
      marginBottom: theme.spacing.lg,
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
    saveButton: {
      backgroundColor: theme.colors.primary,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textOnPrimary,
    },
  });
