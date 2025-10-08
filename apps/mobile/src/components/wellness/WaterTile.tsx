import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { WellnessTile } from './WellnessTile';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { waterService } from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface WaterTileProps {
  data: {
    current: number;
    target: number;
    logs: number;
  };
}

export const WaterTile: React.FC<WaterTileProps> = ({ data }) => {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  const logWaterMutation = useMutation({
    mutationFn: (amountMl: number) => waterService.logWater({ amountMl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Su kaydedilemedi');
    },
  });

  const handleQuickAdd = (amountMl: number) => {
    logWaterMutation.mutate(amountMl);
  };

  const formatWater = (ml: number) => {
    if (ml >= 1000) {
      return `${(ml / 1000).toFixed(1)} L`;
    }
    return `${ml} ml`;
  };

  const percentage = Math.round((data.current / data.target) * 100);
  const isEmpty = data.current === 0;

  return (
    <WellnessTile
      icon="💧"
      title="Su"
      value={formatWater(data.current)}
      target={`Hedef ${formatWater(data.target)}`}
      percentage={percentage}
      isEmpty={isEmpty}
      emptyState="Bugün henüz kayıt yok – +250 ml ile başla"
      onPress={() => router.push('/water')}
      actions={
        <View style={styles(theme).actionsRow}>
          <TouchableOpacity
            style={styles(theme).quickButton}
            onPress={() => handleQuickAdd(250)}
            disabled={logWaterMutation.isPending}
          >
            <Text style={styles(theme).quickButtonText}>+250 ml</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles(theme).quickButton}
            onPress={() => handleQuickAdd(500)}
            disabled={logWaterMutation.isPending}
          >
            <Text style={styles(theme).quickButtonText}>+500 ml</Text>
          </TouchableOpacity>
        </View>
      }
    />
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
      paddingHorizontal: 10,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.primary + '40',
    },
    quickButtonText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.primary,
    },
  });
