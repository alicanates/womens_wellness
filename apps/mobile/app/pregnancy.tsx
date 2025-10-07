import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pregnancyService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';
// Temporarily comment out icons until font is loaded
// import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function PregnancyScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Fetch pregnancy data
  const { data: pregnancy, isLoading, error } = useQuery({
    queryKey: ['pregnancy'],
    queryFn: () => pregnancyService.get(),
    enabled: isAuthenticated,
  });

  // Fetch summary with gestational age
  const { data: summary } = useQuery({
    queryKey: ['pregnancy', 'summary'],
    queryFn: () => pregnancyService.getSummary(),
    enabled: isAuthenticated && !!pregnancy,
  });

  // Fetch weekly content
  const { data: weeklyContent } = useQuery({
    queryKey: ['pregnancy', 'weekly'],
    queryFn: () => pregnancyService.getWeeklyContent(),
    enabled: isAuthenticated && !!pregnancy,
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      padding: 16,
    },
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundCard,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      flex: 1,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 12,
    },
    headerActionButton: {
      padding: 8,
    },
    summaryHeader: {
      alignItems: 'center',
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 17,
      color: theme.colors.text,
      fontWeight: '600',
      opacity: 0.8,
    },
    summaryCard: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: theme.card.padding,
      marginBottom: 24,
      shadowColor: theme.card.shadowColor,
      shadowOffset: theme.card.shadowOffset,
      shadowOpacity: theme.card.shadowOpacity,
      shadowRadius: theme.card.shadowRadius,
      elevation: theme.card.elevation,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    summaryLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    summaryValue: {
      fontSize: 28,
      fontWeight: '800',
      color: theme.colors.primary,
    },
    trimesterBadge: {
      backgroundColor: theme.colors.primary,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 8,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    trimesterText: {
      color: theme.colors.textOnPrimary,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    tipCard: {
      backgroundColor: theme.colors.overlay,
      borderRadius: 16,
      padding: 20,
      marginTop: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tipLabel: {
      fontSize: 13,
      color: theme.colors.primary,
      fontWeight: '700',
      marginBottom: 10,
      letterSpacing: 1,
    },
    tipText: {
      fontSize: 15,
      color: theme.colors.text,
      lineHeight: 22,
      fontWeight: '400',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 16,
    },
    toolsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    toolCard: {
      width: (width - 48) / 2,
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: 20,
      marginBottom: 16,
      alignItems: 'center',
      shadowColor: theme.card.shadowColor,
      shadowOffset: theme.card.shadowOffset,
      shadowOpacity: theme.card.shadowOpacity,
      shadowRadius: theme.card.shadowRadius,
      elevation: theme.card.elevation,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    toolIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.overlay,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    toolTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      letterSpacing: 0.3,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
    },
    setupButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.button.borderRadius,
      paddingVertical: theme.button.padding,
      paddingHorizontal: 32,
      shadowColor: theme.button.shadowColor,
      shadowOffset: theme.button.shadowOffset,
      shadowOpacity: theme.button.shadowOpacity,
      shadowRadius: theme.button.shadowRadius,
      elevation: theme.button.elevation,
    },
    setupButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  const tools = [
    {
      id: 'kicks',
      title: 'Tekme Sayacı',
      icon: 'footsteps-outline',
      route: '/pregnancy/kick-counter',
      implemented: true,
    },
    {
      id: 'contractions',
      title: 'Kasılma Sayacı',
      icon: 'timer-outline',
      route: '/pregnancy/contractions',
      implemented: false,
    },
    {
      id: 'appointments',
      title: 'Randevular',
      icon: 'calendar-outline',
      route: '/pregnancy/appointments',
      implemented: false,
    },
    {
      id: 'medications',
      title: 'İlaçlar',
      icon: 'medical-outline',
      route: '/pregnancy/medications',
      implemented: false,
    },
    {
      id: 'birthplan',
      title: 'Doğum Planı',
      icon: 'document-text-outline',
      route: '/pregnancy/birth-plan',
      implemented: false,
    },
    {
      id: 'hospitalbag',
      title: 'Hastane Çantası',
      icon: 'bag-outline',
      route: '/pregnancy/hospital-bag',
      implemented: false,
    },
    {
      id: 'notes',
      title: 'Notlar',
      icon: 'create-outline',
      route: '/pregnancy/notes',
      implemented: true,
    },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!pregnancy) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyIcon, { fontSize: 64 }]}>💝</Text>
          <Text style={styles.emptyTitle}>Hamilelik Takibine Başlayın</Text>
          <Text style={styles.emptyText}>
            Hamilelik yolculuğunuzu takip etmek ve önemli bilgileri kaydetmek için hamilelik
            kaydı oluşturun.
          </Text>
          <TouchableOpacity
            style={styles.setupButton}
            onPress={() => router.push('/pregnancy/setup')}
          >
            <Text style={styles.setupButtonText}>Kurulum Yap</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleEditPregnancy = () => {
    router.push('/pregnancy/setup');
  };

  const handleDeletePregnancy = () => {
    Alert.alert(
      'Hamilelik Kaydını Sil',
      'Hamilelik kaydınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await pregnancyService.delete();
              queryClient.invalidateQueries({ queryKey: ['pregnancy'] });
              router.back();
              Alert.alert('Başarılı', 'Hamilelik kaydı silindi');
            } catch (error: any) {
              Alert.alert('Hata', error.message || 'Silinemedi');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={{ fontSize: 24, color: theme.colors.text }}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hamilelik Takibi</Text>
        {pregnancy && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={handleEditPregnancy}
            >
              <Text style={{ fontSize: 20, color: theme.colors.primary }}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerActionButton}
              onPress={handleDeletePregnancy}
            >
              <Text style={{ fontSize: 20 }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Summary subtitle */}
        {summary && (
          <View style={styles.summaryHeader}>
            <Text style={styles.subtitle}>
              {(summary as any).gestationalAge.weeks} hafta {(summary as any).gestationalAge.days} gün
            </Text>
          </View>
        )}

        {/* Summary Card */}
        {summary && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryLabel}>Gebelik Yaşı</Text>
                <Text style={styles.summaryValue}>
                  {(summary as any).gestationalAge.weeks}+{(summary as any).gestationalAge.days}
                </Text>
              </View>
              <View style={styles.trimesterBadge}>
                <Text style={styles.trimesterText}>
                  {(summary as any).trimester}. Trimester
                </Text>
              </View>
            </View>

            {(summary as any).dueDate && (
              <View style={[styles.summaryRow, { marginBottom: 0 }]}>
                <Text style={styles.summaryLabel}>Tahmini Doğum Tarihi</Text>
                <Text style={[styles.summaryValue, { fontSize: 16 }]}>
                  {new Date((summary as any).dueDate).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            )}

            {(summary as any).weeklyTip && (
              <View style={styles.tipCard}>
                <Text style={styles.tipLabel}>BUGÜNÜN İPUCU</Text>
                <Text style={styles.tipText}>{(summary as any).weeklyTip}</Text>
              </View>
            )}
          </View>
        )}

        {/* Tools Grid */}
        <Text style={styles.sectionTitle}>Araçlar</Text>
        <View style={styles.toolsGrid}>
          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCard}
              onPress={() => {
                if (tool.implemented) {
                  router.push(tool.route as any);
                } else {
                  alert(`${tool.title} yakında gelecek!`);
                }
              }}
            >
              <View style={styles.toolIcon}>
                <Text style={{ fontSize: 24 }}>
                  {tool.id === 'kicks' && '👣'}
                  {tool.id === 'contractions' && '⏱️'}
                  {tool.id === 'appointments' && '📅'}
                  {tool.id === 'medications' && '💊'}
                  {tool.id === 'birthplan' && '📝'}
                  {tool.id === 'hospitalbag' && '🎒'}
                  {tool.id === 'notes' && '✍️'}
                </Text>
              </View>
              <Text style={styles.toolTitle}>{tool.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Weekly Content */}
        {weeklyContent && (
          <View style={{ marginTop: 24, marginBottom: 32 }}>
            <Text style={styles.sectionTitle}>
              {(weeklyContent as any).week}. Hafta
            </Text>
            <View style={styles.summaryCard}>
              <Text style={[styles.tipText, { marginBottom: 12 }]}>
                {(weeklyContent as any).content}
              </Text>
              {(weeklyContent as any).developmentSummary && (
                <Text style={[styles.summaryLabel, { marginTop: 8 }]}>
                  {(weeklyContent as any).developmentSummary}
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
