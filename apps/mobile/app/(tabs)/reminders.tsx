import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  TextInput,
  Modal,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { remindersService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useNotifications } from '@/hooks/useNotifications';
import { theme } from '@/utils/theme';

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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

export default function RemindersScreen() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const {
    expoPushToken,
    permissionStatus,
    requestPermissions,
    scheduleLocalNotification
  } = useNotifications();

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

  const handleTestNotification = async () => {
    // First check if we have permissions
    if (permissionStatus !== 'granted') {
      Alert.alert(
        'Bildirim İzni Gerekli',
        'Test bildirimi göndermek için bildirim izni vermeniz gerekiyor.',
        [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'İzin Ver',
            onPress: async () => {
              const granted = await requestPermissions();
              if (granted) {
                sendTestNotification();
              }
            },
          },
        ]
      );
      return;
    }

    sendTestNotification();
  };

  const sendTestNotification = async () => {
    // Send a local notification for immediate feedback
    await scheduleLocalNotification(
      '🔔 Test Bildirimi',
      'Bu bir yerel test bildirimidir. Bildirimler çalışıyor!',
      { screen: 'reminders', test: true }
    );

    // Also try to send via server if we have a push token
    if (expoPushToken) {
      Alert.alert(
        'Bildirim Türü',
        'Hangi türde test bildirimi göndermek istersiniz?',
        [
          {
            text: 'Sadece Yerel',
            onPress: () => {
              Alert.alert('Başarılı', 'Yerel bildirim gönderildi!');
            },
          },
          {
            text: 'Sunucu Üzerinden',
            onPress: () => testPushMutation.mutate(),
          },
          { text: 'İptal', style: 'cancel' },
        ]
      );
    } else {
      Alert.alert(
        'Yerel Bildirim Gönderildi',
        'Push token bulunamadı, sadece yerel bildirim gönderildi. Sunucu bildirimleri için token kaydı gerekiyor.',
        [{ text: 'Tamam' }]
      );
    }
  };

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Hatırlatıcılar</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.addButton, { marginRight: 8 }]}
              onPress={handleTestNotification}
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

        {/* Push Token Status Indicator */}
        {permissionStatus === 'granted' && (
          <View style={styles.statusBar}>
            <Text style={styles.statusText}>
              {expoPushToken
                ? `✅ Bildirimler aktif • Token: ${expoPushToken.substring(0, 20)}...`
                : '⚠️ Push token bekleniyor...'}
            </Text>
          </View>
        )}
        {permissionStatus === 'denied' && (
          <View style={[styles.statusBar, styles.statusBarError]}>
            <Text style={styles.statusTextError}>
              ❌ Bildirim izni reddedildi. Ayarlardan izin verin.
            </Text>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
                      trackColor={{ false: '#ccc', true: theme.colors.primary }}
                      thumbColor={reminder.active ? '#fff' : '#f4f3f4'}
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
        </ScrollView>
      </View>

      {showCreateForm && (
        <CreateReminderModal
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
          }}
        />
      )}
    </SafeAreaView>
  );
}

interface CreateReminderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

// Modern Time Picker Component
function TimePickerWheel({ value, onChange }: { value: string; onChange: (time: string) => void }) {
  const [showPicker, setShowPicker] = useState(false);
  const [hour, minute] = value.split(':').map(Number);
  const [selectedHour, setSelectedHour] = useState(hour);
  const [selectedMinute, setSelectedMinute] = useState(minute);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    if (showPicker) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [showPicker]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setShowPicker(false));
  };

  const handleConfirm = () => {
    const formattedTime = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
    onChange(formattedTime);
    handleClose();
  };

  return (
    <>
      <TouchableOpacity style={styles.timePickerButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.timePickerButtonText}>{value}</Text>
        <Text style={styles.timePickerIcon}>🕐</Text>
      </TouchableOpacity>

      <Modal visible={showPicker} transparent animationType="fade">
        <View style={styles.pickerModalOverlay}>
          <TouchableOpacity style={styles.pickerBackdrop} activeOpacity={1} onPress={handleClose} />
          <Animated.View
            style={[
              styles.pickerContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.pickerHeader}>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.pickerCancelText}>İptal</Text>
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Saat Seçin</Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={styles.pickerConfirmText}>Tamam</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.wheelContainer}>
              <ScrollPicker
                items={hours}
                selectedValue={selectedHour}
                onValueChange={setSelectedHour}
                formatter={(val) => String(val).padStart(2, '0')}
              />
              <Text style={styles.wheelSeparator}>:</Text>
              <ScrollPicker
                items={minutes}
                selectedValue={selectedMinute}
                onValueChange={setSelectedMinute}
                formatter={(val) => String(val).padStart(2, '0')}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

// Reusable Scroll Picker Component
function ScrollPicker({
  items,
  selectedValue,
  onValueChange,
  formatter = (val) => String(val),
}: {
  items: number[];
  selectedValue: number;
  onValueChange: (value: number) => void;
  formatter?: (value: number) => string;
}) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: selectedValue * ITEM_HEIGHT,
          animated: false,
        });
        setInitialized(true);
      }, 100);
    }
  }, [initialized, selectedValue]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < items.length && items[index] !== selectedValue) {
      onValueChange(items[index]);
    }
  };

  return (
    <View style={styles.scrollPickerContainer}>
      <View style={styles.scrollPickerHighlight} />
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 2,
        }}
      >
        {items.map((item) => (
          <View key={item} style={styles.scrollPickerItem}>
            <Text
              style={[
                styles.scrollPickerItemText,
                item === selectedValue && styles.scrollPickerItemTextSelected,
              ]}
            >
              {formatter(item)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// Modern Day Selector Component
function DaySelector({
  type,
  selectedDays,
  onChange,
}: {
  type: 'WEEKLY' | 'MONTHLY';
  selectedDays: number[];
  onChange: (days: number[]) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const weekDays = [
    { value: 0, label: 'Pazar' },
    { value: 1, label: 'Pazartesi' },
    { value: 2, label: 'Salı' },
    { value: 3, label: 'Çarşamba' },
    { value: 4, label: 'Perşembe' },
    { value: 5, label: 'Cuma' },
    { value: 6, label: 'Cumartesi' },
  ];

  const monthDays = Array.from({ length: 31 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}. Gün`,
  }));

  const options = type === 'WEEKLY' ? weekDays : monthDays;

  useEffect(() => {
    if (showPicker) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    }
  }, [showPicker]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setShowPicker(false));
  };

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day].sort((a, b) => a - b));
    }
  };

  const getDisplayText = () => {
    if (selectedDays.length === 0) {
      return type === 'WEEKLY' ? 'Gün seçin' : 'Tarih seçin';
    }
    if (type === 'WEEKLY') {
      const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
      return selectedDays.map((d) => dayNames[d]).join(', ');
    }
    return selectedDays.join(', ');
  };

  return (
    <>
      <TouchableOpacity style={styles.daySelectorButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.daySelectorButtonText}>{getDisplayText()}</Text>
        <Text style={styles.daySelectorIcon}>▼</Text>
      </TouchableOpacity>

      <Modal visible={showPicker} transparent animationType="fade">
        <View style={styles.pickerModalOverlay}>
          <TouchableOpacity style={styles.pickerBackdrop} activeOpacity={1} onPress={handleClose} />
          <Animated.View
            style={[
              styles.daySelectorContainer,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.pickerHeader}>
              <View style={{ width: 60 }} />
              <Text style={styles.pickerTitle}>
                {type === 'WEEKLY' ? 'Günler' : 'Ayın Günleri'}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.pickerConfirmText}>Tamam</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.daySelectorList} showsVerticalScrollIndicator={false}>
              {options.map((option) => {
                const isSelected = selectedDays.includes(option.value);
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.daySelectorOption,
                      isSelected && styles.daySelectorOptionSelected,
                    ]}
                    onPress={() => toggleDay(option.value)}
                  >
                    <Text
                      style={[
                        styles.daySelectorOptionText,
                        isSelected && styles.daySelectorOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

function CreateReminderModal({ onClose, onSuccess }: CreateReminderModalProps) {
  const [type, setType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [time, setTime] = useState('09:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

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

    if (type !== 'DAILY' && selectedDays.length === 0) {
      Alert.alert('Hata', 'Lütfen en az bir gün seçin');
      return;
    }

    createMutation.mutate({
      type,
      title: title.trim(),
      message: message.trim(),
      time,
      days: type === 'DAILY' ? undefined : selectedDays,
      active: true,
    });
  };

  const isSubmitting = createMutation.isPending;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.modal}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
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
                  onPress={() => {
                    setType(option);
                    setSelectedDays([]);
                  }}
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

            {type !== 'DAILY' && (
              <>
                <Text style={styles.label}>
                  {type === 'WEEKLY' ? 'Hangi günler?' : 'Ayın hangi günleri?'}
                </Text>
                <DaySelector
                  type={type}
                  selectedDays={selectedDays}
                  onChange={setSelectedDays}
                />
              </>
            )}

            <Text style={styles.label}>Saat</Text>
            <TimePickerWheel value={time} onChange={setTime} />

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
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingBottom: 12,
    backgroundColor: theme.colors.background,
  },
  statusBar: {
    backgroundColor: theme.colors.info,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  statusBarError: {
    backgroundColor: theme.colors.error,
    borderBottomColor: theme.colors.border,
  },
  statusText: {
    fontSize: 12,
    color: theme.colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  statusTextError: {
    fontSize: 12,
    color: theme.colors.textOnPrimary,
    textAlign: 'center',
    fontWeight: '600',
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.button.borderRadius,
    shadowColor: theme.button.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonText: {
    color: theme.colors.textOnPrimary,
    fontWeight: '700',
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: theme.colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  remindersList: {
    padding: theme.spacing.md,
  },
  reminderCard: {
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.card.borderRadius,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: theme.card.shadowColor,
    shadowOffset: theme.card.shadowOffset,
    shadowOpacity: theme.card.shadowOpacity,
    shadowRadius: theme.card.shadowRadius,
    elevation: theme.card.elevation,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    fontWeight: '700',
    marginBottom: 4,
    color: theme.colors.text,
  },
  reminderType: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
    fontWeight: '500',
  },
  reminderDays: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  reminderMessage: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  reminderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
  },
  nextRunText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  deleteText: {
    fontSize: 14,
    color: theme.colors.error,
    fontWeight: '700',
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: 20,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    color: theme.colors.text,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    gap: 8,
  },
  typeChip: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  typeChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  typeChipText: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  typeChipTextActive: {
    color: theme.colors.textOnPrimary,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalButtonPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  modalButtonPrimaryText: {
    color: theme.colors.textOnPrimary,
    fontWeight: '700',
  },
  // Time Picker Styles
  timePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
  },
  timePickerButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  timePickerIcon: {
    fontSize: 20,
  },
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerCancelText: {
    fontSize: 16,
    color: '#666',
  },
  pickerConfirmText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  wheelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    paddingVertical: 20,
  },
  wheelSeparator: {
    fontSize: 32,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  scrollPickerContainer: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    width: 80,
    position: 'relative',
  },
  scrollPickerHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  scrollPickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollPickerItemText: {
    fontSize: 24,
    color: '#999',
  },
  scrollPickerItemTextSelected: {
    fontSize: 28,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  // Day Selector Styles
  daySelectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
  },
  daySelectorButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  daySelectorIcon: {
    fontSize: 12,
    color: '#999',
  },
  daySelectorContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.7,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  daySelectorList: {
    padding: 16,
  },
  daySelectorOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
  },
  daySelectorOptionSelected: {
    backgroundColor: theme.colors.primary,
  },
  daySelectorOptionText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
  },
  daySelectorOptionTextSelected: {
    color: theme.colors.textOnPrimary,
    fontWeight: '700',
  },
  checkmark: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
});
