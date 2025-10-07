import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pregnancyService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function MedicationsScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMedication, setEditingMedication] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [safetyRating, setSafetyRating] = useState('');
  const [notes, setNotes] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Fetch medications
  const { data: medications, isLoading } = useQuery({
    queryKey: ['medications'],
    queryFn: () => pregnancyService.getMedications(),
  });

  const addMedicationMutation = useMutation({
    mutationFn: (data: any) => pregnancyService.addMedication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      closeModal();
      Alert.alert('Başarılı', 'İlaç kaydedildi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Kaydedilemedi');
    },
  });

  const updateMedicationMutation = useMutation({
    mutationFn: ({ id, data }: any) => pregnancyService.updateMedication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      closeModal();
      Alert.alert('Başarılı', 'İlaç güncellendi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Güncellenemedi');
    },
  });

  const deleteMedicationMutation = useMutation({
    mutationFn: (id: string) => pregnancyService.deleteMedication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      Alert.alert('Başarılı', 'İlaç silindi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Silinemedi');
    },
  });

  const openCreateModal = () => {
    setEditingMedication(null);
    setName('');
    setDosage('');
    setFrequency('');
    setSafetyRating('');
    setNotes('');
    setStartDate(null);
    setEndDate(null);
    setModalVisible(true);
  };

  const openEditModal = (medication: any) => {
    setEditingMedication(medication);
    setName(medication.name || '');
    setDosage(medication.dosage || '');
    setFrequency(medication.frequency || '');
    setSafetyRating(medication.safetyRating || '');
    setNotes(medication.notes || '');
    setStartDate(medication.startDate ? new Date(medication.startDate) : null);
    setEndDate(medication.endDate ? new Date(medication.endDate) : null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingMedication(null);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Uyarı', 'Lütfen ilaç adını giriniz');
      return;
    }

    const data: any = {
      name: name.trim(),
      dosage: dosage.trim() || undefined,
      frequency: frequency.trim() || undefined,
      safetyRating: safetyRating.trim() || undefined,
      notes: notes.trim() || undefined,
      startDate: startDate?.toISOString() || undefined,
      endDate: endDate?.toISOString() || undefined,
    };

    if (editingMedication) {
      updateMedicationMutation.mutate({ id: editingMedication.id, data });
    } else {
      addMedicationMutation.mutate(data);
    }
  };

  const handleDelete = (medication: any) => {
    Alert.alert(
      'İlacı Sil',
      'Bu ilacı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deleteMedicationMutation.mutate(medication.id),
        },
      ]
    );
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const getSafetyColor = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'güvenli':
      case 'safe':
        return '#4CAF50';
      case 'dikkat':
      case 'caution':
        return '#FF9800';
      case 'kaçının':
      case 'avoid':
        return '#F44336';
      default:
        return theme.colors.textSecondary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundCard,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
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
    addButton: {
      padding: theme.spacing.sm,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
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
    medicationCard: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: theme.card.padding,
      marginBottom: theme.spacing.md,
      shadowColor: theme.card.shadowColor,
      shadowOffset: theme.card.shadowOffset,
      shadowOpacity: theme.card.shadowOpacity,
      shadowRadius: theme.card.shadowRadius,
      elevation: theme.card.elevation,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    medicationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    medicationName: {
      flex: 1,
      fontSize: 17,
      fontWeight: '700',
      color: theme.colors.text,
    },
    medicationActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    medicationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    medicationLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginRight: theme.spacing.xs,
    },
    medicationValue: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    safetyBadge: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: 12,
      marginTop: theme.spacing.sm,
      alignSelf: 'flex-start',
    },
    safetyText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#fff',
    },
    medicationNotes: {
      fontSize: 14,
      color: theme.colors.text,
      marginTop: theme.spacing.sm,
      fontStyle: 'italic',
    },
    medicationDates: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    dateInfo: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: theme.spacing.xl * 2,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: theme.spacing.md,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: theme.spacing.lg,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    input: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: theme.spacing.sm,
    },
    dateButtonText: {
      fontSize: 16,
      color: theme.colors.text,
    },
    clearDateButton: {
      marginLeft: theme.spacing.sm,
      padding: theme.spacing.xs,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.button.borderRadius,
      padding: theme.button.padding,
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      shadowColor: theme.button.shadowColor,
      shadowOffset: theme.button.shadowOffset,
      shadowOpacity: theme.button.shadowOpacity,
      shadowRadius: theme.button.shadowRadius,
      elevation: theme.button.elevation,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 17,
      fontWeight: '700',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={{ fontSize: 24, color: theme.colors.text }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>İlaçlar</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Text style={{ fontSize: 28, color: theme.colors.primary }}>➕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            ⚠️ Bu bilgiler sadece kişisel kayıt amaçlıdır. Herhangi bir ilaç kullanmadan önce
            mutlaka doktorunuza danışın.
          </Text>
        </View>

        {/* Medications List */}
        {medications && (medications as any[]).length > 0 ? (
          medications.map((medication: any) => (
            <View key={medication.id} style={styles.medicationCard}>
              <View style={styles.medicationHeader}>
                <Text style={styles.medicationName}>{medication.name}</Text>
                <View style={styles.medicationActions}>
                  <TouchableOpacity onPress={() => openEditModal(medication)}>
                    <Text style={{ fontSize: 20, color: theme.colors.primary }}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(medication)}>
                    <Text style={{ fontSize: 20 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {medication.dosage && (
                <View style={styles.medicationRow}>
                  <Text style={styles.medicationLabel}>Doz:</Text>
                  <Text style={styles.medicationValue}>{medication.dosage}</Text>
                </View>
              )}

              {medication.frequency && (
                <View style={styles.medicationRow}>
                  <Text style={styles.medicationLabel}>Sıklık:</Text>
                  <Text style={styles.medicationValue}>{medication.frequency}</Text>
                </View>
              )}

              {medication.safetyRating && (
                <View
                  style={[
                    styles.safetyBadge,
                    { backgroundColor: getSafetyColor(medication.safetyRating) },
                  ]}
                >
                  <Text style={styles.safetyText}>
                    {medication.safetyRating.toUpperCase()}
                  </Text>
                </View>
              )}

              {medication.notes && (
                <Text style={styles.medicationNotes}>{medication.notes}</Text>
              )}

              {(medication.startDate || medication.endDate) && (
                <View style={styles.medicationDates}>
                  {medication.startDate && (
                    <Text style={styles.dateInfo}>
                      Başlangıç: {new Date(medication.startDate).toLocaleDateString('tr-TR')}
                    </Text>
                  )}
                  {medication.endDate && (
                    <Text style={styles.dateInfo}>
                      Bitiş: {new Date(medication.endDate).toLocaleDateString('tr-TR')}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💊</Text>
            <Text style={styles.emptyTitle}>Henüz İlaç Yok</Text>
            <Text style={styles.emptyText}>
              İlk ilacınızı ekleyin
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingMedication ? 'İlacı Düzenle' : 'Yeni İlaç'}
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={{ fontSize: 28, color: theme.colors.text }}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>İlaç Adı *</Text>
              <TextInput
                style={styles.input}
                placeholder="İlaç adını giriniz"
                placeholderTextColor={theme.colors.textSecondary}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Doz</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: 500mg, 1 tablet"
                placeholderTextColor={theme.colors.textSecondary}
                value={dosage}
                onChangeText={setDosage}
              />

              <Text style={styles.label}>Kullanım Sıklığı</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Günde 2 kez, Sabah-Akşam"
                placeholderTextColor={theme.colors.textSecondary}
                value={frequency}
                onChangeText={setFrequency}
              />

              <Text style={styles.label}>Güvenlik Durumu</Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: Güvenli, Dikkat, Kaçının"
                placeholderTextColor={theme.colors.textSecondary}
                value={safetyRating}
                onChangeText={setSafetyRating}
              />

              <Text style={styles.label}>Başlangıç Tarihi</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  style={[styles.dateButton, { flex: 1 }]}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {startDate
                      ? startDate.toLocaleDateString('tr-TR')
                      : 'Tarih seçiniz'}
                  </Text>
                  <Text style={{ fontSize: 20 }}>📅</Text>
                </TouchableOpacity>
                {startDate && (
                  <TouchableOpacity
                    style={styles.clearDateButton}
                    onPress={() => setStartDate(null)}
                  >
                    <Text style={{ fontSize: 20 }}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onStartDateChange}
                />
              )}

              <Text style={styles.label}>Bitiş Tarihi</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  style={[styles.dateButton, { flex: 1 }]}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {endDate
                      ? endDate.toLocaleDateString('tr-TR')
                      : 'Tarih seçiniz'}
                  </Text>
                  <Text style={{ fontSize: 20 }}>📅</Text>
                </TouchableOpacity>
                {endDate && (
                  <TouchableOpacity
                    style={styles.clearDateButton}
                    onPress={() => setEndDate(null)}
                  >
                    <Text style={{ fontSize: 20 }}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onEndDateChange}
                  minimumDate={startDate || undefined}
                />
              )}

              <Text style={styles.label}>Notlar</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="İlaç hakkında ek notlar"
                placeholderTextColor={theme.colors.textSecondary}
                value={notes}
                onChangeText={setNotes}
                multiline
              />

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!name.trim() ||
                    addMedicationMutation.isPending ||
                    updateMedicationMutation.isPending) &&
                    styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={
                  !name.trim() ||
                  addMedicationMutation.isPending ||
                  updateMedicationMutation.isPending
                }
              >
                <Text style={styles.saveButtonText}>
                  {addMedicationMutation.isPending || updateMedicationMutation.isPending
                    ? 'Kaydediliyor...'
                    : 'Kaydet'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
