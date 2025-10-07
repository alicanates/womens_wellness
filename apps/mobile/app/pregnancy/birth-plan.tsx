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

interface BirthPlanSection {
  title: string;
  key: string;
  placeholder: string;
}

const BIRTH_PLAN_SECTIONS: BirthPlanSection[] = [
  {
    title: 'Tercihler ve Ortam',
    key: 'environment',
    placeholder: 'Işıklandırma, müzik, ziyaretçiler vb.',
  },
  {
    title: 'Doğum ve Ağrı Yönetimi',
    key: 'painManagement',
    placeholder: 'Epidural, solunum teknikleri, hareket özgürlüğü vb.',
  },
  {
    title: 'Müdahaleler',
    key: 'interventions',
    placeholder: 'İndüksiyon, augmentasyon, monitörizasyon vb.',
  },
  {
    title: 'Doğum Tercihleri',
    key: 'deliveryPreferences',
    placeholder: 'Pozisyonlar, kordon kesimi, ten tene temas vb.',
  },
  {
    title: 'Doğum Sonrası Bakım',
    key: 'postpartumCare',
    placeholder: 'Emzirme desteği, bebekle aynı odada kalma vb.',
  },
  {
    title: 'Yenidoğan Bakımı',
    key: 'newbornCare',
    placeholder: 'Vitamin K, göz profilaksisi, aşılar vb.',
  },
  {
    title: 'İletişim ve Tercihler',
    key: 'communication',
    placeholder: 'Destek kişisi, dil, kültürel ihtiyaçlar vb.',
  },
];

export default function BirthPlanScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [content, setContent] = useState<Record<string, string>>({});
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
      const initialContent: Record<string, string> = {};
      BIRTH_PLAN_SECTIONS.forEach((section) => {
        initialContent[section.key] = '';
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
      const initialContent: Record<string, string> = {};
      BIRTH_PLAN_SECTIONS.forEach((section) => {
        initialContent[section.key] = '';
      });
      setContent(initialContent);
      setHasChanges(false);
      Alert.alert('Başarılı', 'Doğum planı silindi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Silinemedi');
    },
  });

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
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
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
        {birthPlan && (
          <TouchableOpacity onPress={handleDelete}>
            <Text style={{ fontSize: 20 }}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Intro */}
        <View style={styles.intro}>
          <Text style={styles.introText}>
            Doğum planınız, doğum sürecindeki tercih ve isteklerinizi içerir. Bu planı
            doktorunuz ve doğum ekibinizle paylaşabilirsiniz.
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

        {/* Sections */}
        {BIRTH_PLAN_SECTIONS.map((section) => (
          <View key={section.key} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <TextInput
              style={styles.textArea}
              placeholder={section.placeholder}
              placeholderTextColor={theme.colors.textSecondary}
              value={content[section.key] || ''}
              onChangeText={(value) => handleContentChange(section.key, value)}
              multiline
            />
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
              {saveBirthPlanMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
