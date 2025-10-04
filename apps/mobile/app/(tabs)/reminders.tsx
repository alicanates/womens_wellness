import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
} from 'react-native';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { remindersService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

interface Reminder {
  id: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  payloadJson: {
    title: string;
    message: string;
    time: string;
    days?: number[];
  };
  active: boolean;
  nextRunAt: string;
}

export default function RemindersScreen() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: reminders, isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => remindersService.getReminders(),
    enabled: isAuthenticated,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      remindersService.toggleReminder(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remindersService.deleteReminder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      Alert.alert('Başarılı', 'Hatırlatıcı silindi');
    },
  });

  const testPushMutation = useMutation({
    mutationFn: () => remindersService.testPush(),
    onSuccess: () => {
      Alert.alert('Başarılı', 'Test bildirimi gönderildi!');
    },
    onError: () => {
      Alert.alert('Hata', 'Bildirim gönderilemedi. Push token kaydedilmiş mi?');
    },
  });

  const handleToggle = (id: string, currentActive: boolean) => {
    toggleMutation.mutate({ id, active: !currentActive });
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Hatırlatıcıyı Sil',
      `"${title}" hatırlatıcısını silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => deleteMutation.mutate(id) },
      ]
    );
  };

  const formatNextRun = (date: string) => {
    const d = new Date(date);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'DAILY':
        return 'Günlük';
      case 'WEEKLY':
        return 'Haftalık';
      case 'MONTHLY':
        return 'Aylık';
      case 'CUSTOM':
        return 'Özel';
      default:
        return type;
    }
  };

  const getDaysLabel = (type: string, days?: number[]) => {
    if (!days || days.length === 0) return '';

    if (type === 'WEEKLY') {
      const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
      return days.map((d) => dayNames[d]).join(', ');
    }

    if (type === 'MONTHLY') {
      return `Her ayın ${days.join(', ')}. günü`;
    }

    return '';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hatırlatıcılar</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.addButton, { marginRight: 8 }]}
            onPress={() => testPushMutation.mutate()}
            disabled={testPushMutation.isPending}
          >
            <Text style={styles.addButtonText}>🔔 Test</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateForm(true)}
          >
            <Text style={styles.addButtonText}>+ Yeni Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      ) : (reminders as any)?.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Henüz hatırlatıcı eklemediniz</Text>
          <Text style={styles.emptySubtext}>
            Düzenli hatırlatmalar almak için yeni bir hatırlatıcı ekleyin
          </Text>
        </View>
      ) : (
        <View style={styles.remindersList}>
          {((reminders as any) || []).map((reminder: Reminder) => (
            <View key={reminder.id} style={styles.reminderCard}>
              <View style={styles.reminderHeader}>
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderTitle}>
                    {(reminder.payloadJson as any).title}
                  </Text>
                  <Text style={styles.reminderType}>
                    {getTypeLabel(reminder.type)} • {(reminder.payloadJson as any).time}
                  </Text>
                  {(reminder.payloadJson as any).days && (
                    <Text style={styles.reminderDays}>
                      {getDaysLabel(reminder.type, (reminder.payloadJson as any).days)}
                    </Text>
                  )}
                </View>
                <Switch
                  value={reminder.active}
                  onValueChange={() => handleToggle(reminder.id, reminder.active)}
                  trackColor={{ false: '#ccc', true: '#007AFF' }}
                />
              </View>

              <Text style={styles.reminderMessage}>
                {(reminder.payloadJson as any).message}
              </Text>

              <View style={styles.reminderFooter}>
                <Text style={styles.nextRunText}>
                  Sonraki: {formatNextRun(reminder.nextRunAt)}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    handleDelete(reminder.id, (reminder.payloadJson as any).title)
                  }
                >
                  <Text style={styles.deleteText}>Sil</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {showCreateForm && (
        <CreateReminderModal
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
          }}
        />
      )}
    </ScrollView>
  );
}

interface CreateReminderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function CreateReminderModal({ onClose, onSuccess }: CreateReminderModalProps) {
  const [type, setType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [time, setTime] = useState('09:00');
  const [daysInput, setDaysInput] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => remindersService.createReminder(data),
    onSuccess: () => {
      Alert.alert('Başarılı', 'Hatırlatıcı oluşturuldu');
      onSuccess();
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Hatırlatıcı oluşturulamadı');
    },
  });

  const handleCreate = () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timePattern.test(time)) {
      Alert.alert('Hata', 'Saat HH:MM formatında olmalıdır (örn. 09:00)');
      return;
    }

    let parsedDays: number[] | undefined;
    if (type !== 'DAILY' && daysInput.trim()) {
      parsedDays = daysInput
        .split(',')
        .map((part) => parseInt(part.trim(), 10))
        .filter((value) => !Number.isNaN(value));

      if (parsedDays.length === 0) {
        Alert.alert('Hata', 'Gün listesini doğru formatta girin');
        return;
      }

      const isInvalid = parsedDays.some((value) =>
        type === 'WEEKLY' ? value < 0 || value > 6 : value < 1 || value > 31,
      );

      if (isInvalid) {
        Alert.alert(
          'Hata',
          type === 'WEEKLY'
            ? 'Haftalık günler 0 (Paz) - 6 (Cmt) arasında olmalıdır'
            : 'Aylık günler 1 - 31 arasında olmalıdır',
        );
        return;
      }
    }

    createMutation.mutate({
      type,
      title: title.trim(),
      message: message.trim(),
      time,
      days: parsedDays,
      active: true,
    });
  };

  const isSubmitting = createMutation.isPending;

  // Simplified modal - in production, use a proper modal library
  return (
    <View style={styles.modal}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Yeni Hatırlatıcı</Text>

        <Text style={styles.label}>Sıklık</Text>
        <View style={styles.typeSelector}>
          {(['DAILY', 'WEEKLY', 'MONTHLY'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.typeChip,
                type === option && styles.typeChipActive,
              ]}
              onPress={() => setType(option)}
              disabled={isSubmitting}
            >
              <Text
                style={[
                  styles.typeChipText,
                  type === option && styles.typeChipTextActive,
                ]}
              >
                {option === 'DAILY'
                  ? 'Günlük'
                  : option === 'WEEKLY'
                  ? 'Haftalık'
                  : 'Aylık'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Başlık</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Örn. Su içmeyi unutma"
          value={title}
          onChangeText={setTitle}
          editable={!isSubmitting}
        />

        <Text style={styles.label}>Mesaj</Text>
        <TextInput
          style={[styles.textInput, styles.multilineInput]}
          placeholder="Örn. Bugünkü su hedefini tamamla"
          value={message}
          onChangeText={setMessage}
          editable={!isSubmitting}
          multiline
        />

        <Text style={styles.label}>Saat (HH:MM)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="09:00"
          value={time}
          onChangeText={setTime}
          editable={!isSubmitting}
          keyboardType="numbers-and-punctuation"
        />

        {type !== 'DAILY' && (
          <>
            <Text style={styles.label}>
              {type === 'WEEKLY'
                ? 'Günler (0=Paz, 6=Cmt)'
                : 'Günler (1-31)'}
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder={type === 'WEEKLY' ? '1,3,5' : '1,15'}
              value={daysInput}
              onChangeText={setDaysInput}
              editable={!isSubmitting}
            />
            <Text style={styles.helperText}>
              Virgülle ayrılmış değerler girin
            </Text>
          </>
        )}

        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={onClose}
            disabled={isSubmitting}
          >
            <Text>İptal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.modalButtonPrimary]}
            onPress={handleCreate}
            disabled={isSubmitting}
          >
            <Text style={styles.modalButtonPrimaryText}>
              {isSubmitting ? 'Kaydediliyor…' : 'Oluştur'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  remindersList: {
    padding: 16,
  },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  reminderType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  reminderDays: {
    fontSize: 12,
    color: '#007AFF',
  },
  reminderMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  reminderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  nextRunText: {
    fontSize: 12,
    color: '#666',
  },
  deleteText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  typeChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeChipText: {
    color: '#555',
    fontWeight: '500',
  },
  typeChipTextActive: {
    color: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtonPrimary: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  modalButtonPrimaryText: {
    color: '#fff',
    fontWeight: '600',
  },
});
