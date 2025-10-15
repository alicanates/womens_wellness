import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { cyclesService } from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface DayDetailsSheetProps {
  visible: boolean;
  onClose: () => void;
  date: Date;
  dayData?: any;
  isPeriod?: boolean;
  isFertile?: boolean;
  isPredicted?: boolean;
  isOvulation?: boolean;
}

const commonSymptoms = [
  'Kramp',
  'Baş ağrısı',
  'Sırt ağrısı',
  'Şişkinlik',
  'Yorgunluk',
  'Meme hassasiyeti',
  'Akıntı',
];

const commonMoods = [
  'Mutlu',
  'Üzgün',
  'Sinirli',
  'Anksiyetli',
  'Enerjik',
  'Sakin',
  'Huzursuz',
];

const contraceptionTypes = [
  'Kondom',
  'Doğum kontrol hapı',
  'Rahim içi araç',
  'Diğer',
];

export function DayDetailsSheet({
  visible,
  onClose,
  date,
  dayData,
  isPeriod,
  isFertile,
  isPredicted,
  isOvulation,
}: DayDetailsSheetProps) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const styles = createStyles(theme);

  // Form state
  const [flow, setFlow] = useState<'light' | 'moderate' | 'heavy' | undefined>();
  const [cramps, setCramps] = useState<number>(0);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState<string[]>([]);
  const [hadSex, setHadSex] = useState(false);
  const [contraception, setContraception] = useState<string[]>([]);
  const [sexNotes, setSexNotes] = useState('');
  const [medications, setMedications] = useState<string[]>([]);
  const [healthNotes, setHealthNotes] = useState('');

  // Load existing data
  useEffect(() => {
    if (visible && dayData?.dailyLog) {
      const log = dayData.dailyLog;
      setFlow(log.flow);
      setCramps(log.cramps || 0);
      setSymptoms(log.symptoms || []);
      setMood(log.mood || []);
      setHadSex(log.hadSex || false);
      setContraception(log.contraception || []);
      setSexNotes(log.sexNotes || '');
      setMedications(log.medications || []);
      setHealthNotes(log.healthNotes || '');
    } else if (visible) {
      // Reset form for new entry
      setFlow(isPeriod ? 'moderate' : undefined);
      setCramps(0);
      setSymptoms([]);
      setMood([]);
      setHadSex(false);
      setContraception([]);
      setSexNotes('');
      setMedications([]);
      setHealthNotes('');
    }
  }, [visible, dayData]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => cyclesService.upsertDailyLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      Alert.alert('Başarılı', 'Günlük kayıt güncellendi');
      onClose();
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Kayıt güncellenemedi');
    },
  });

  const handleSave = () => {
    // Format date as YYYY-MM-DD in local timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const data = {
      date: dateString,
      flow,
      cramps: cramps > 0 ? cramps : undefined,
      symptoms,
      mood,
      hadSex,
      contraception,
      sexNotes: sexNotes.trim() || undefined,
      medications,
      healthNotes: healthNotes.trim() || undefined,
    };

    console.log('Saving daily log:', data);
    saveMutation.mutate(data);
  };

  const toggleArrayItem = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter((i) => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const formatDate = (d: Date): string => {
    return d.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>İptal</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{formatDate(date)}</Text>
          <TouchableOpacity onPress={handleSave} disabled={saveMutation.isPending}>
            <Text style={[styles.saveButton, saveMutation.isPending && styles.saveButtonDisabled]}>
              Kaydet
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status Chips */}
          <View style={styles.statusChips}>
            {isPeriod && (
              <View style={[styles.chip, { backgroundColor: '#FFE8F0' }]}>
                <Text style={[styles.chipText, { color: '#FF1493' }]}>🩸 Regl Günü</Text>
              </View>
            )}
            {isFertile && (
              <View style={[styles.chip, { backgroundColor: '#F3E5F5' }]}>
                <Text style={[styles.chipText, { color: '#9C27B0' }]}>🌸 Verimli Gün</Text>
              </View>
            )}
            {isOvulation && (
              <View style={[styles.chip, { backgroundColor: '#FFF9C4' }]}>
                <Text style={[styles.chipText, { color: '#F57F17' }]}>⭐ Yumurtlama</Text>
              </View>
            )}
            {isPredicted && (
              <View style={[styles.chip, { backgroundColor: '#FFE8F0' }]}>
                <Text style={[styles.chipText, { color: '#FF69B4' }]}>📅 Tahmin</Text>
              </View>
            )}
          </View>

          {/* Period Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Regl Detayları</Text>

            <Text style={styles.label}>Akış Yoğunluğu</Text>
            <View style={styles.flowButtons}>
              {['light', 'moderate', 'heavy'].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.flowButton,
                    flow === level && styles.flowButtonActive,
                  ]}
                  onPress={() => setFlow(level as any)}
                >
                  <Text
                    style={[
                      styles.flowButtonText,
                      flow === level && styles.flowButtonTextActive,
                    ]}
                  >
                    {level === 'light' ? 'Hafif' : level === 'moderate' ? 'Orta' : 'Yoğun'}
                  </Text>
                </TouchableOpacity>
              ))}
              {flow && (
                <TouchableOpacity
                  style={styles.flowButton}
                  onPress={() => setFlow(undefined)}
                >
                  <Text style={styles.flowButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.label}>Kramp Şiddeti (0-5)</Text>
            <View style={styles.crampsSlider}>
              {[0, 1, 2, 3, 4, 5].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.crampsButton,
                    cramps === level && styles.crampsButtonActive,
                  ]}
                  onPress={() => setCramps(level)}
                >
                  <Text
                    style={[
                      styles.crampsButtonText,
                      cramps === level && styles.crampsButtonTextActive,
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Symptoms & Mood */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Semptomlar</Text>
            <View style={styles.chipGroup}>
              {commonSymptoms.map((symptom) => (
                <TouchableOpacity
                  key={symptom}
                  style={[
                    styles.selectableChip,
                    symptoms.includes(symptom) && styles.selectableChipActive,
                  ]}
                  onPress={() => toggleArrayItem(symptoms, symptom, setSymptoms)}
                >
                  <Text
                    style={[
                      styles.selectableChipText,
                      symptoms.includes(symptom) && styles.selectableChipTextActive,
                    ]}
                  >
                    {symptom}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ruh Hali & Enerji</Text>
            <View style={styles.chipGroup}>
              {commonMoods.map((moodItem) => (
                <TouchableOpacity
                  key={moodItem}
                  style={[
                    styles.selectableChip,
                    mood.includes(moodItem) && styles.selectableChipActive,
                  ]}
                  onPress={() => toggleArrayItem(mood, moodItem, setMood)}
                >
                  <Text
                    style={[
                      styles.selectableChipText,
                      mood.includes(moodItem) && styles.selectableChipTextActive,
                    ]}
                  >
                    {moodItem}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sex & Protection */}
          <View style={styles.section}>
            <View style={styles.switchRow}>
              <Text style={styles.sectionTitle}>Cinsel İlişki</Text>
              <Switch
                value={hadSex}
                onValueChange={setHadSex}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>

            {hadSex && (
              <>
                <Text style={styles.label}>Korunma Yöntemi</Text>
                <View style={styles.chipGroup}>
                  {contraceptionTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.selectableChip,
                        contraception.includes(type) && styles.selectableChipActive,
                      ]}
                      onPress={() => toggleArrayItem(contraception, type, setContraception)}
                    >
                      <Text
                        style={[
                          styles.selectableChipText,
                          contraception.includes(type) && styles.selectableChipTextActive,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Notlar</Text>
                <TextInput
                  style={styles.textInput}
                  value={sexNotes}
                  onChangeText={setSexNotes}
                  placeholder="İsteğe bağlı notlar..."
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={2}
                />
              </>
            )}
          </View>

          {/* Medications & Health */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İlaçlar & Sağlık</Text>
            <Text style={styles.label}>Aldığınız İlaçlar (virgülle ayırın)</Text>
            <TextInput
              style={styles.textInput}
              value={medications.join(', ')}
              onChangeText={(text) => setMedications(text.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="Örn: Ağrı kesici, Vitamin D"
              placeholderTextColor={theme.colors.textSecondary}
            />

            <Text style={styles.label}>Sağlık Notları</Text>
            <TextInput
              style={[styles.textInput, styles.textInputMultiline]}
              value={healthNotes}
              onChangeText={setHealthNotes}
              placeholder="Genel sağlık durumu, bulgular vb."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Spacer for bottom */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundCard,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
    },
    cancelButton: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    saveButton: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    content: {
      flex: 1,
    },
    statusChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 16,
      gap: 8,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
    },
    section: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
      marginTop: 8,
    },
    flowButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    flowButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    flowButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    flowButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    flowButtonTextActive: {
      color: theme.colors.textOnPrimary,
    },
    crampsSlider: {
      flexDirection: 'row',
      gap: 6,
    },
    crampsButton: {
      flex: 1,
      paddingVertical: 10,
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    crampsButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    crampsButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    crampsButtonTextActive: {
      color: theme.colors.textOnPrimary,
    },
    chipGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    selectableChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    selectableChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    selectableChipText: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.text,
    },
    selectableChipTextActive: {
      color: theme.colors.textOnPrimary,
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    textInput: {
      backgroundColor: theme.colors.backgroundCard,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: theme.colors.text,
      marginBottom: 8,
    },
    textInputMultiline: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
  });
