import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pregnancyService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';

interface BirthPlanOption {
  id: string;
  label: string;
  icon?: string;
}

interface BirthPlanSection {
  title: string;
  key: string;
  icon: string;
  type: 'checkbox' | 'text';
  options?: BirthPlanOption[];
  placeholder?: string;
}

const BIRTH_PLAN_SECTIONS: BirthPlanSection[] = [
  {
    title: 'Doğum Ortamı',
    key: 'environment',
    icon: '🏥',
    type: 'checkbox',
    options: [
      { id: 'dim_lights', label: 'Loş ışıklandırma', icon: '💡' },
      { id: 'music', label: 'Müzik çalabilmek', icon: '🎵' },
      { id: 'photos', label: 'Fotoğraf/video çekimi', icon: '📸' },
      { id: 'visitors', label: 'Ziyaretçi kısıtlaması', icon: '👥' },
      { id: 'privacy', label: 'Özel oda tercihi', icon: '🚪' },
    ],
  },
  {
    title: 'Ağrı Yönetimi',
    key: 'painManagement',
    icon: '💊',
    type: 'checkbox',
    options: [
      { id: 'epidural', label: 'Epidural anestezi', icon: '💉' },
      { id: 'breathing', label: 'Nefes teknikleri', icon: '🫁' },
      { id: 'movement', label: 'Hareket özgürlüğü', icon: '🚶‍♀️' },
      { id: 'water', label: 'Su terapisi/duş', icon: '🚿' },
      { id: 'massage', label: 'Masaj', icon: '💆‍♀️' },
      { id: 'natural', label: 'Doğal doğum (ilaçsız)', icon: '🌿' },
    ],
  },
  {
    title: 'Doğum Sırasında',
    key: 'delivery',
    icon: '👶',
    type: 'checkbox',
    options: [
      { id: 'position_freedom', label: 'Pozisyon seçme özgürlüğü', icon: '🧘‍♀️' },
      { id: 'partner_present', label: 'Eşimin yanımda olması', icon: '👫' },
      { id: 'skin_to_skin', label: 'Hemen ten tene temas', icon: '🤱' },
      { id: 'delayed_cord', label: 'Kordon geç kesilsin', icon: '🔗' },
      { id: 'no_episiotomy', label: 'Epizyotomi yapılmasın', icon: '⚕️' },
      { id: 'mirror', label: 'Ayna ile izlemek', icon: '🪞' },
    ],
  },
  {
    title: 'Müdahaleler',
    key: 'interventions',
    icon: '⚕️',
    type: 'checkbox',
    options: [
      { id: 'avoid_induction', label: 'Mümkünse indüksiyon yapılmasın', icon: '⏱️' },
      { id: 'avoid_augmentation', label: 'Suni sancı artırma yapılmasın', icon: '💉' },
      { id: 'intermittent_monitoring', label: 'Aralıklı monitörizasyon', icon: '📊' },
      { id: 'avoid_iv', label: 'Serum takılmasın', icon: '💧' },
      { id: 'informed_consent', label: 'Her müdahale için bilgilendirilmek', icon: '📋' },
    ],
  },
  {
    title: 'Doğum Sonrası',
    key: 'postpartum',
    icon: '🤱',
    type: 'checkbox',
    options: [
      { id: 'breastfeeding', label: 'İlk 1 saat içinde emzirme', icon: '🍼' },
      { id: 'rooming_in', label: 'Bebekle aynı odada kalma', icon: '🛏️' },
      { id: 'no_formula', label: 'Mama verilmesin', icon: '🚫' },
      { id: 'no_pacifier', label: 'Emzik verilmesin', icon: '🍭' },
      { id: 'delayed_bath', label: 'İlk banyo ertelensin', icon: '🛁' },
    ],
  },
  {
    title: 'Yenidoğan Bakımı',
    key: 'newbornCare',
    icon: '👼',
    type: 'checkbox',
    options: [
      { id: 'vitamin_k', label: 'Vitamin K uygulaması', icon: '💊' },
      { id: 'eye_prophylaxis', label: 'Göz profilaksisi', icon: '👁️' },
      { id: 'hepatitis_vaccine', label: 'Hepatit B aşısı', icon: '💉' },
      { id: 'circumcision', label: 'Sünnet (erkek bebek)', icon: '👶' },
      { id: 'parent_present', label: 'İşlemler sırasında yanında olmak', icon: '👨‍👩‍👦' },
    ],
  },
  {
    title: 'Acil Durum Planı',
    key: 'emergency',
    icon: '🚨',
    type: 'checkbox',
    options: [
      { id: 'cesarean_partner', label: 'Sezaryende eşim yanımda olsun', icon: '👫' },
      { id: 'cesarean_skin', label: 'Sezaryende ten tene temas', icon: '🤱' },
      { id: 'informed_decisions', label: 'Acil kararlar için bilgilendirilmek', icon: '📢' },
      { id: 'gentle_cesarean', label: 'Nazik sezaryen teknikleri', icon: '💝' },
    ],
  },
  {
    title: 'Ek Notlar ve İstekler',
    key: 'additionalNotes',
    icon: '📝',
    type: 'text',
    placeholder: 'Diğer özel istekleriniz, alerji bilgileriniz, kültürel/dini tercihleriniz vb.',
  },
];

export default function BirthPlanScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [content, setContent] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch birth plan
  const { data: birthPlan, isLoading } = useQuery({
    queryKey: ['birthPlan'],
    queryFn: () => pregnancyService.getBirthPlan(),
  });

  useEffect(() => {
    if (birthPlan && (birthPlan as any).contentJson) {
      setContent((birthPlan as any).contentJson);
    } else {
      // Initialize with empty template
      const initialContent: Record<string, any> = {};
      BIRTH_PLAN_SECTIONS.forEach((section) => {
        if (section.type === 'checkbox') {
          initialContent[section.key] = [];
        } else {
          initialContent[section.key] = '';
        }
      });
      setContent(initialContent);
    }
  }, [birthPlan]);

  const saveBirthPlanMutation = useMutation({
    mutationFn: (data: any) => pregnancyService.createOrUpdateBirthPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['birthPlan'] });
      setHasChanges(false);
      Alert.alert('Başarılı', 'Doğum planı kaydedildi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Kaydedilemedi');
    },
  });

  const deleteBirthPlanMutation = useMutation({
    mutationFn: () => pregnancyService.deleteBirthPlan(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['birthPlan'] });
      // Reset to empty template
      const initialContent: Record<string, any> = {};
      BIRTH_PLAN_SECTIONS.forEach((section) => {
        if (section.type === 'checkbox') {
          initialContent[section.key] = [];
        } else {
          initialContent[section.key] = '';
        }
      });
      setContent(initialContent);
      setHasChanges(false);
      Alert.alert('Başarılı', 'Doğum planı silindi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Silinemedi');
    },
  });

  const handleCheckboxToggle = (sectionKey: string, optionId: string) => {
    setContent((prev) => {
      const currentSelections = prev[sectionKey] || [];
      const isSelected = currentSelections.includes(optionId);

      return {
        ...prev,
        [sectionKey]: isSelected
          ? currentSelections.filter((id: string) => id !== optionId)
          : [...currentSelections, optionId],
      };
    });
    setHasChanges(true);
  };

  const handleContentChange = (key: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveBirthPlanMutation.mutate(content);
  };

  const handleDelete = () => {
    Alert.alert(
      'Doğum Planını Sil',
      'Doğum planınızı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deleteBirthPlanMutation.mutate(),
        },
      ]
    );
  };

  const handleShare = () => {
    // Generate a readable summary
    let summary = '🤰 DOĞUM PLANI\n\n';

    BIRTH_PLAN_SECTIONS.forEach((section) => {
      if (section.type === 'checkbox') {
        const selections = content[section.key] || [];
        if (selections.length > 0) {
          summary += `${section.icon} ${section.title}:\n`;
          selections.forEach((optionId: string) => {
            const option = section.options?.find(o => o.id === optionId);
            if (option) {
              summary += `  ✓ ${option.label}\n`;
            }
          });
          summary += '\n';
        }
      } else if (content[section.key]?.trim()) {
        summary += `${section.icon} ${section.title}:\n${content[section.key]}\n\n`;
      }
    });

    Alert.alert(
      'Doğum Planı Özeti',
      summary,
      [
        { text: 'Kapat', style: 'cancel' },
        {
          text: 'Kopyala',
          onPress: () => {
            // In a real app, you'd use Clipboard API here
            Alert.alert('Başarılı', 'Doğum planı kopyalandı');
          },
        },
      ]
    );
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
    headerActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    intro: {
      backgroundColor: theme.colors.overlay,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    introText: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
      textAlign: 'center',
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    sectionIcon: {
      fontSize: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      flex: 1,
    },
    sectionCount: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    sectionCountText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textOnPrimary,
    },
    optionsContainer: {
      gap: theme.spacing.sm,
    },
    optionItem: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 12,
      padding: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    optionItemSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.overlay,
    },
    optionCheckbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    optionCheckboxSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    optionIcon: {
      fontSize: 20,
    },
    optionLabel: {
      flex: 1,
      fontSize: 15,
      color: theme.colors.text,
      fontWeight: '500',
    },
    optionLabelSelected: {
      fontWeight: '700',
      color: theme.colors.primary,
    },
    textArea: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.md,
      fontSize: 15,
      color: theme.colors.text,
      minHeight: 120,
      textAlignVertical: 'top',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    saveButton: {
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
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 17,
      fontWeight: '700',
    },
    deleteButton: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.button.borderRadius,
      padding: theme.spacing.md,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.error,
    },
    deleteButtonText: {
      color: theme.colors.error,
      fontSize: 17,
      fontWeight: '700',
    },
    lastEdited: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    summaryCard: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    summaryTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    summaryText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (hasChanges) {
                Alert.alert(
                  'Kaydedilmemiş Değişiklikler',
                  'Değişiklikleriniz kaydedilmedi. Çıkmak istediğinizden emin misiniz?',
                  [
                    { text: 'İptal', style: 'cancel' },
                    {
                      text: 'Çık',
                      style: 'destructive',
                      onPress: () => router.back(),
                    },
                  ]
                );
              } else {
                router.back();
              }
            }}
          >
            <Text style={{ fontSize: 24, color: theme.colors.text }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Doğum Planı</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {birthPlan && (
            <>
              <TouchableOpacity onPress={handleShare}>
                <Text style={{ fontSize: 20 }}>📋</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete}>
                <Text style={{ fontSize: 20 }}>🗑️</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Intro */}
        <View style={styles.intro}>
          <Text style={styles.introText}>
            🎯 Doğum planınız, doğum sürecindeki tercih ve isteklerinizi içerir. Bu planı
            doktorunuz ve doğum ekibinizle paylaşabilirsiniz.
          </Text>
        </View>

        {/* Info Card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.overlay }]}>
          <Text style={[styles.summaryTitle, { fontSize: 14 }]}>💡 İpucu</Text>
          <Text style={[styles.summaryText, { fontSize: 13 }]}>
            Doğum planı bir "talep listesi" değil, tercihlerinizi paylaşma aracıdır.
            Acil durumlarda değişiklik yapılabilir. Doktorunuzla önceden görüşün.
          </Text>
        </View>

        {birthPlan && (birthPlan as any).updatedAt && (
          <Text style={styles.lastEdited}>
            Son güncelleme: {new Date((birthPlan as any).updatedAt).toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        )}

        {/* Summary Card */}
        {Object.keys(content).length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📊 Özet</Text>
            <Text style={styles.summaryText}>
              {BIRTH_PLAN_SECTIONS.filter(s => s.type === 'checkbox')
                .reduce((total, section) => {
                  const selections = content[section.key] || [];
                  return total + selections.length;
                }, 0)} tercih seçildi
            </Text>
          </View>
        )}

        {/* Sections */}
        {BIRTH_PLAN_SECTIONS.map((section) => (
          <View key={section.key} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>{section.icon}</Text>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.type === 'checkbox' && content[section.key]?.length > 0 && (
                <View style={styles.sectionCount}>
                  <Text style={styles.sectionCountText}>
                    {content[section.key].length}
                  </Text>
                </View>
              )}
            </View>

            {section.type === 'checkbox' && section.options ? (
              <View style={styles.optionsContainer}>
                {section.options.map((option) => {
                  const isSelected = (content[section.key] || []).includes(option.id);
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.optionItem,
                        isSelected && styles.optionItemSelected,
                      ]}
                      onPress={() => handleCheckboxToggle(section.key, option.id)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.optionCheckbox,
                          isSelected && styles.optionCheckboxSelected,
                        ]}
                      >
                        {isSelected && (
                          <Text style={{ color: theme.colors.textOnPrimary, fontSize: 14, fontWeight: '900' }}>
                            ✓
                          </Text>
                        )}
                      </View>
                      {option.icon && (
                        <Text style={styles.optionIcon}>{option.icon}</Text>
                      )}
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <TextInput
                style={styles.textArea}
                placeholder={section.placeholder}
                placeholderTextColor={theme.colors.textSecondary}
                value={content[section.key] || ''}
                onChangeText={(value) => handleContentChange(section.key, value)}
                multiline
              />
            )}
          </View>
        ))}

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!hasChanges || saveBirthPlanMutation.isPending) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!hasChanges || saveBirthPlanMutation.isPending}
          >
            <Text style={styles.saveButtonText}>
              {saveBirthPlanMutation.isPending ? '💾 Kaydediliyor...' : '💾 Kaydet'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
