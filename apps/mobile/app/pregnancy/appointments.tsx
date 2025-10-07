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

export default function AppointmentsScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any | null>(null);
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [clinic, setClinic] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [notes, setNotes] = useState('');

  // Vitals
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState('');
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState('');
  const [weight, setWeight] = useState('');
  const [glucose, setGlucose] = useState('');

  // Fetch appointments
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => pregnancyService.getAppointments(),
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (data: any) => pregnancyService.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      closeModal();
      Alert.alert('Başarılı', 'Randevu kaydedildi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Kaydedilemedi');
    },
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, data }: any) => pregnancyService.updateAppointment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      closeModal();
      Alert.alert('Başarılı', 'Randevu güncellendi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Güncellenemedi');
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: (id: string) => pregnancyService.deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      Alert.alert('Başarılı', 'Randevu silindi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Silinemedi');
    },
  });

  const openCreateModal = () => {
    setEditingAppointment(null);
    setAppointmentDate(new Date());
    setClinic('');
    setDoctorName('');
    setNotes('');
    setBloodPressureSystolic('');
    setBloodPressureDiastolic('');
    setWeight('');
    setGlucose('');
    setModalVisible(true);
  };

  const openEditModal = (appointment: any) => {
    setEditingAppointment(appointment);
    setAppointmentDate(new Date(appointment.appointmentAt));
    setClinic(appointment.clinic || '');
    setDoctorName(appointment.doctorName || '');
    setNotes(appointment.notes || '');

    // Load vitals if available
    const vitals = appointment.vitalsJson || {};
    setBloodPressureSystolic(vitals.bloodPressureSystolic?.toString() || '');
    setBloodPressureDiastolic(vitals.bloodPressureDiastolic?.toString() || '');
    setWeight(vitals.weight?.toString() || '');
    setGlucose(vitals.glucose?.toString() || '');

    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingAppointment(null);
  };

  const handleSave = () => {
    if (!clinic.trim()) {
      Alert.alert('Uyarı', 'Lütfen klinik/hastane adı giriniz');
      return;
    }

    const vitals: any = {};
    if (bloodPressureSystolic && bloodPressureDiastolic) {
      vitals.bloodPressureSystolic = parseInt(bloodPressureSystolic);
      vitals.bloodPressureDiastolic = parseInt(bloodPressureDiastolic);
    }
    if (weight) vitals.weight = parseFloat(weight);
    if (glucose) vitals.glucose = parseFloat(glucose);

    const data = {
      appointmentAt: appointmentDate.toISOString(),
      clinic: clinic.trim(),
      doctorName: doctorName.trim() || undefined,
      notes: notes.trim() || undefined,
      vitals: Object.keys(vitals).length > 0 ? vitals : undefined,
    };

    if (editingAppointment) {
      updateAppointmentMutation.mutate({ id: editingAppointment.id, data });
    } else {
      createAppointmentMutation.mutate(data);
    }
  };

  const handleDelete = (appointment: any) => {
    Alert.alert(
      'Randevuyu Sil',
      'Bu randevuyu silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deleteAppointmentMutation.mutate(appointment.id),
        },
      ]
    );
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setAppointmentDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      const newDate = new Date(appointmentDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setAppointmentDate(newDate);
    }
  };

  const upcomingAppointments = (appointments as any[])?.filter((apt: any) =>
    new Date(apt.appointmentAt) >= new Date()
  ) || [];

  const pastAppointments = (appointments as any[])?.filter((apt: any) =>
    new Date(apt.appointmentAt) < new Date()
  ) || [];

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
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.md,
    },
    appointmentCard: {
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
    appointmentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    appointmentClinic: {
      flex: 1,
      fontSize: 17,
      fontWeight: '700',
      color: theme.colors.text,
    },
    appointmentActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    appointmentDate: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    appointmentDoctor: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    appointmentNotes: {
      fontSize: 14,
      color: theme.colors.text,
      marginTop: theme.spacing.sm,
    },
    vitalsSection: {
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    vitalsTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    vitalsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    vitalItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    vitalLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginRight: theme.spacing.xs,
    },
    vitalValue: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text,
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
    vitalsInputRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    vitalsInput: {
      flex: 1,
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
          <Text style={styles.headerTitle}>Randevular</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Text style={{ fontSize: 28, color: theme.colors.primary }}>➕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Yaklaşan Randevular</Text>
            {upcomingAppointments.map((appointment: any) => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <Text style={styles.appointmentClinic}>{appointment.clinic}</Text>
                  <View style={styles.appointmentActions}>
                    <TouchableOpacity onPress={() => openEditModal(appointment)}>
                      <Text style={{ fontSize: 20, color: theme.colors.primary }}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(appointment)}>
                      <Text style={{ fontSize: 20 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.appointmentDate}>
                  📅 {new Date(appointment.appointmentAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                {appointment.doctorName && (
                  <Text style={styles.appointmentDoctor}>👨‍⚕️ {appointment.doctorName}</Text>
                )}
                {appointment.notes && (
                  <Text style={styles.appointmentNotes}>{appointment.notes}</Text>
                )}
                {appointment.vitalsJson && Object.keys(appointment.vitalsJson).length > 0 && (
                  <View style={styles.vitalsSection}>
                    <Text style={styles.vitalsTitle}>VİTAL BULGULAR</Text>
                    <View style={styles.vitalsRow}>
                      {appointment.vitalsJson.bloodPressureSystolic && (
                        <View style={styles.vitalItem}>
                          <Text style={styles.vitalLabel}>Tansiyon:</Text>
                          <Text style={styles.vitalValue}>
                            {appointment.vitalsJson.bloodPressureSystolic}/
                            {appointment.vitalsJson.bloodPressureDiastolic} mmHg
                          </Text>
                        </View>
                      )}
                      {appointment.vitalsJson.weight && (
                        <View style={styles.vitalItem}>
                          <Text style={styles.vitalLabel}>Kilo:</Text>
                          <Text style={styles.vitalValue}>{appointment.vitalsJson.weight} kg</Text>
                        </View>
                      )}
                      {appointment.vitalsJson.glucose && (
                        <View style={styles.vitalItem}>
                          <Text style={styles.vitalLabel}>Glukoz:</Text>
                          <Text style={styles.vitalValue}>{appointment.vitalsJson.glucose} mg/dL</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Geçmiş Randevular</Text>
            {pastAppointments.map((appointment: any) => (
              <View key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentHeader}>
                  <Text style={styles.appointmentClinic}>{appointment.clinic}</Text>
                  <View style={styles.appointmentActions}>
                    <TouchableOpacity onPress={() => openEditModal(appointment)}>
                      <Text style={{ fontSize: 20, color: theme.colors.primary }}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(appointment)}>
                      <Text style={{ fontSize: 20 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.appointmentDate}>
                  📅 {new Date(appointment.appointmentAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                {appointment.doctorName && (
                  <Text style={styles.appointmentDoctor}>👨‍⚕️ {appointment.doctorName}</Text>
                )}
                {appointment.notes && (
                  <Text style={styles.appointmentNotes}>{appointment.notes}</Text>
                )}
                {appointment.vitalsJson && Object.keys(appointment.vitalsJson).length > 0 && (
                  <View style={styles.vitalsSection}>
                    <Text style={styles.vitalsTitle}>VİTAL BULGULAR</Text>
                    <View style={styles.vitalsRow}>
                      {appointment.vitalsJson.bloodPressureSystolic && (
                        <View style={styles.vitalItem}>
                          <Text style={styles.vitalLabel}>Tansiyon:</Text>
                          <Text style={styles.vitalValue}>
                            {appointment.vitalsJson.bloodPressureSystolic}/
                            {appointment.vitalsJson.bloodPressureDiastolic} mmHg
                          </Text>
                        </View>
                      )}
                      {appointment.vitalsJson.weight && (
                        <View style={styles.vitalItem}>
                          <Text style={styles.vitalLabel}>Kilo:</Text>
                          <Text style={styles.vitalValue}>{appointment.vitalsJson.weight} kg</Text>
                        </View>
                      )}
                      {appointment.vitalsJson.glucose && (
                        <View style={styles.vitalItem}>
                          <Text style={styles.vitalLabel}>Glukoz:</Text>
                          <Text style={styles.vitalValue}>{appointment.vitalsJson.glucose} mg/dL</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {/* Empty State */}
        {appointments && (appointments as any[]).length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>Henüz Randevu Yok</Text>
            <Text style={styles.emptyText}>
              İlk randevunuzu ekleyin
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
                  {editingAppointment ? 'Randevuyu Düzenle' : 'Yeni Randevu'}
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                  <Text style={{ fontSize: 28, color: theme.colors.text }}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Tarih ve Saat *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {appointmentDate.toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                <Text style={{ fontSize: 20 }}>📅</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {appointmentDate.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text style={{ fontSize: 20 }}>⏰</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={appointmentDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={appointmentDate}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeChange}
                />
              )}

              <Text style={styles.label}>Klinik/Hastane *</Text>
              <TextInput
                style={styles.input}
                placeholder="Klinik veya hastane adı"
                placeholderTextColor={theme.colors.textSecondary}
                value={clinic}
                onChangeText={setClinic}
              />

              <Text style={styles.label}>Doktor Adı</Text>
              <TextInput
                style={styles.input}
                placeholder="Doktor adı (opsiyonel)"
                placeholderTextColor={theme.colors.textSecondary}
                value={doctorName}
                onChangeText={setDoctorName}
              />

              <Text style={styles.label}>Notlar</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Randevu hakkında notlar"
                placeholderTextColor={theme.colors.textSecondary}
                value={notes}
                onChangeText={setNotes}
                multiline
              />

              <Text style={styles.label}>Vital Bulgular (Opsiyonel)</Text>

              <Text style={[styles.label, { fontSize: 13, marginTop: theme.spacing.xs }]}>
                Tansiyon (mmHg)
              </Text>
              <View style={styles.vitalsInputRow}>
                <TextInput
                  style={[styles.input, styles.vitalsInput]}
                  placeholder="Sistolik (üst)"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={bloodPressureSystolic}
                  onChangeText={setBloodPressureSystolic}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.vitalsInput]}
                  placeholder="Diyastolik (alt)"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={bloodPressureDiastolic}
                  onChangeText={setBloodPressureDiastolic}
                  keyboardType="numeric"
                />
              </View>

              <Text style={[styles.label, { fontSize: 13, marginTop: theme.spacing.xs }]}>
                Kilo (kg)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: 65.5"
                placeholderTextColor={theme.colors.textSecondary}
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />

              <Text style={[styles.label, { fontSize: 13, marginTop: theme.spacing.xs }]}>
                Glukoz (mg/dL)
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Örn: 95"
                placeholderTextColor={theme.colors.textSecondary}
                value={glucose}
                onChangeText={setGlucose}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!clinic.trim() ||
                    createAppointmentMutation.isPending ||
                    updateAppointmentMutation.isPending) &&
                    styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={
                  !clinic.trim() ||
                  createAppointmentMutation.isPending ||
                  updateAppointmentMutation.isPending
                }
              >
                <Text style={styles.saveButtonText}>
                  {createAppointmentMutation.isPending || updateAppointmentMutation.isPending
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
