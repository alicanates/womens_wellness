import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pregnancyService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';

export default function ContractionsScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [notes, setNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch contractions (last 2 hours by default)
  const { data: contractions } = useQuery({
    queryKey: ['contractions'],
    queryFn: () => pregnancyService.getContractions(2),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch summary
  const { data: summary } = useQuery({
    queryKey: ['contractions', 'summary'],
    queryFn: () => pregnancyService.getContractionsSummary(),
    refetchInterval: 30000,
  });

  const logContractionMutation = useMutation({
    mutationFn: (data: any) => pregnancyService.logContraction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractions'] });
      Alert.alert('Kaydedildi', 'Kasılma kaydedildi');
      setNotes('');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Kaydedilemedi');
    },
  });

  const deleteContractionMutation = useMutation({
    mutationFn: (id: string) => pregnancyService.deleteContraction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractions'] });
      Alert.alert('Başarılı', 'Kasılma silindi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Silinemedi');
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => pregnancyService.deleteAllContractions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractions'] });
      Alert.alert('Başarılı', 'Tüm kayıtlar silindi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Silinemedi');
    },
  });

  useEffect(() => {
    if (isTracking) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTracking]);

  const handleStart = () => {
    setIsTracking(true);
    setStartTime(new Date());
    setElapsedSeconds(0);
  };

  const handleStop = () => {
    if (!startTime) return;

    setIsTracking(false);
    const endTime = new Date();

    if (elapsedSeconds < 5) {
      Alert.alert('Uyarı', 'Kasılma çok kısa sürdü. En az 5 saniye olmalı.');
      setElapsedSeconds(0);
      return;
    }

    // Ask for notes
    setShowNotesModal(true);
  };

  const handleSave = () => {
    if (!startTime) return;

    const endTime = new Date(startTime.getTime() + elapsedSeconds * 1000);

    logContractionMutation.mutate({
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationSec: elapsedSeconds,
      notes: notes.trim() || undefined,
    });

    setShowNotesModal(false);
    setElapsedSeconds(0);
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Kasılmayı Sil',
      'Bu kaydı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deleteContractionMutation.mutate(id),
        },
      ]
    );
  };

  const handleDeleteAll = () => {
    if (!contractions || (contractions as any[]).length === 0) return;

    Alert.alert(
      'Tüm Kayıtları Sil',
      'Tüm kasılma kayıtlarını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Tümünü Sil',
          style: 'destructive',
          onPress: () => deleteAllMutation.mutate(),
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}d ${secs}s`;
  };

  const calculateInterval = (current: any, previous: any) => {
    const diff = new Date(current.startTime).getTime() - new Date(previous.startTime).getTime();
    return Math.floor(diff / 60000); // Minutes
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundCard,
    },
    backButton: {
      marginRight: theme.spacing.md,
      padding: theme.spacing.xs,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    timerCard: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: theme.card.padding,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      shadowColor: theme.card.shadowColor,
      shadowOffset: theme.card.shadowOffset,
      shadowOpacity: theme.card.shadowOpacity,
      shadowRadius: theme.card.shadowRadius,
      elevation: theme.card.elevation,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    timerLabel: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
      fontWeight: '600',
    },
    timerValue: {
      fontSize: 72,
      fontWeight: '900',
      color: isTracking ? theme.colors.error : theme.colors.primary,
      lineHeight: 80,
      letterSpacing: 4,
    },
    controlButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    controlButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.button.borderRadius,
      padding: theme.button.padding,
      alignItems: 'center',
      shadowColor: theme.button.shadowColor,
      shadowOffset: theme.button.shadowOffset,
      shadowOpacity: theme.button.shadowOpacity,
      shadowRadius: theme.button.shadowRadius,
      elevation: theme.button.elevation,
    },
    controlButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 17,
      fontWeight: '700',
    },
    stopButton: {
      backgroundColor: theme.colors.error,
    },
    summaryCard: {
      backgroundColor: theme.colors.overlay,
      borderRadius: theme.card.borderRadius,
      padding: theme.card.padding,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    summaryTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    summaryLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    disclaimer: {
      backgroundColor: theme.colors.overlay,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    disclaimerText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 18,
      textAlign: 'center',
    },
    historySection: {
      marginTop: theme.spacing.lg,
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    historyTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
    },
    deleteAllButton: {
      backgroundColor: theme.colors.overlay,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.button.borderRadius,
      borderWidth: 1,
      borderColor: theme.colors.error,
    },
    deleteAllButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.error,
    },
    historyItem: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: theme.card.padding,
      marginBottom: theme.spacing.sm,
      shadowColor: theme.card.shadowColor,
      shadowOffset: theme.card.shadowOffset,
      shadowOpacity: theme.card.shadowOpacity,
      shadowRadius: theme.card.shadowRadius,
      elevation: theme.card.elevation,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    historyItemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    historyTime: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
    },
    historyDuration: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    historyInterval: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    historyNotes: {
      fontSize: 13,
      color: theme.colors.text,
      fontStyle: 'italic',
    },
    deleteButton: {
      padding: theme.spacing.sm,
      marginLeft: theme.spacing.sm,
      backgroundColor: theme.colors.overlay,
      borderRadius: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.error,
    },
    emptyHistory: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.xl,
      fontWeight: '500',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.lg,
      width: '85%',
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    input: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    modalButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    modalButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.button.borderRadius,
      padding: theme.spacing.md,
      alignItems: 'center',
    },
    modalButtonSecondary: {
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    modalButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    modalButtonTextSecondary: {
      color: theme.colors.primary,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={{ fontSize: 24, color: theme.colors.text }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kasılma Sayacı</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Timer Card */}
        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>
            {isTracking ? 'Kasılma Süresi' : 'Hazır'}
          </Text>
          <Text style={styles.timerValue}>{formatTime(elapsedSeconds)}</Text>
        </View>

        {/* Control Buttons */}
        <View style={styles.controlButtons}>
          {!isTracking ? (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleStart}
            >
              <Text style={styles.controlButtonText}>Başla</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={handleStop}
            >
              <Text style={styles.controlButtonText}>Durdur & Kaydet</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ Bu araç sadece bilgilendirme amaçlıdır. Düzenli ve sık kasılmalar yaşıyorsanız,
            doktorunuza veya hastanenize başvurun.
          </Text>
        </View>

        {/* Summary (Last 2 hours) */}
        {summary && (summary as any).count > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Son 2 Saat Özeti</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Toplam Kasılma:</Text>
              <Text style={styles.summaryValue}>{(summary as any).count}</Text>
            </View>
            {(summary as any).frequency && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ortalama Aralık:</Text>
                <Text style={styles.summaryValue}>
                  {Math.round((summary as any).frequency)} dakika
                </Text>
              </View>
            )}
            {(summary as any).avgDuration && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Ortalama Süre:</Text>
                <Text style={styles.summaryValue}>
                  {Math.round((summary as any).avgDuration)} saniye
                </Text>
              </View>
            )}
            <View style={[styles.summaryRow, { marginBottom: 0 }]}>
              <Text style={styles.summaryLabel}>Düzenlilik:</Text>
              <Text style={styles.summaryValue}>
                {(summary as any).regular ? '✓ Düzenli' : '✗ Düzensiz'}
              </Text>
            </View>
          </View>
        )}

        {/* History */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Geçmiş Kayıtlar</Text>
            {contractions && contractions.length > 0 && (
              <TouchableOpacity
                style={styles.deleteAllButton}
                onPress={handleDeleteAll}
              >
                <Text style={styles.deleteAllButtonText}>Tümünü Sil</Text>
              </TouchableOpacity>
            )}
          </View>
          {contractions && contractions.length > 0 ? (
            contractions.map((contraction: any, index: number) => (
              <View key={contraction.id} style={styles.historyItem}>
                <View style={styles.historyItemHeader}>
                  <Text style={styles.historyTime}>
                    {new Date(contraction.startTime).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.historyDuration}>
                    {formatDuration(contraction.durationSec)}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(contraction.id)}
                  >
                    <Text>🗑️</Text>
                  </TouchableOpacity>
                </View>
                {index < contractions.length - 1 && (
                  <Text style={styles.historyInterval}>
                    Aralık: {calculateInterval(contraction, contractions[index + 1])} dakika
                  </Text>
                )}
                {contraction.notes && (
                  <Text style={styles.historyNotes}>Not: {contraction.notes}</Text>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.emptyHistory}>
              Henüz kasılma kaydı yok
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Notes Modal */}
      <Modal
        visible={showNotesModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowNotesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Not Ekle (Opsiyonel)</Text>
            <TextInput
              style={styles.input}
              placeholder="Kasılma hakkında notlarınız..."
              placeholderTextColor={theme.colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setShowNotesModal(false);
                  setNotes('');
                  setElapsedSeconds(0);
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>
                  İptal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleSave}
              >
                <Text style={styles.modalButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
