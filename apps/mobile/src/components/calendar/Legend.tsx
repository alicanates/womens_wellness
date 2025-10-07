import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface LegendItem {
  id: string;
  label: string;
  color: string;
  icon: string;
  explanation: string;
}

const legendItems: LegendItem[] = [
  {
    id: 'period',
    label: 'Regl',
    color: '#FF1493',
    icon: '●',
    explanation:
      'Regl günleri. Adet akışının olduğu günleri gösterir. Akış yoğunluğunu ve semptomları günlük kayıtlardan ekleyebilirsiniz.',
  },
  {
    id: 'fertile',
    label: 'Verimli',
    color: '#9C27B0',
    icon: '○',
    explanation:
      'Tahmini verimli pencere. Geçmiş döngülerinize göre hesaplanır ve hamile kalma olasılığının yüksek olduğu günleri gösterir. Bu bir tahmindir ve garanti değildir.',
  },
  {
    id: 'ovulation',
    label: 'Yumurtlama',
    color: '#FFD700',
    icon: '⭐',
    explanation:
      'Tahmini yumurtlama günü. Genellikle döngünün ortasında gerçekleşir. Daha kesin bilgi için bazal vücut ısısı ve serviks mukusu takibi önerilir.',
  },
  {
    id: 'sex',
    label: 'Cinsel İlişki',
    color: '#FF69B4',
    icon: '♥',
    explanation:
      'Cinsel ilişki kaydedildi. Korunma yöntemi ve notlarınızı günlük kayıtlardan ekleyebilirsiniz.',
  },
  {
    id: 'symptom',
    label: 'Semptom',
    color: '#FFA500',
    icon: '😐',
    explanation:
      'Semptom veya ruh hali kaydedildi. Kramp, ağrı, enerji seviyesi ve diğer fiziksel veya duygusal değişiklikleri takip edebilirsiniz.',
  },
  {
    id: 'medication',
    label: 'İlaç',
    color: '#00CED1',
    icon: '💊',
    explanation:
      'İlaç veya takviye kaydedildi. Ağrı kesici, vitamin veya diğer ilaçları not edebilirsiniz.',
  },
  {
    id: 'appointment',
    label: 'Randevu',
    color: '#4CAF50',
    icon: '📅',
    explanation: 'Doktor randevusu veya önemli tarih.',
  },
];

export function Legend() {
  const theme = useTheme();
  const [selectedItem, setSelectedItem] = useState<LegendItem | null>(null);

  const styles = createStyles(theme);

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {legendItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            onPress={() => setSelectedItem(item)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, { color: item.color }]}>{item.icon}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={selectedItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedItem(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedItem(null)}
        >
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalIcon, { color: selectedItem.color }]}>
                    {selectedItem.icon}
                  </Text>
                  <Text style={styles.modalTitle}>{selectedItem.label}</Text>
                </View>
                <Text style={styles.modalExplanation}>{selectedItem.explanation}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedItem(null)}
                >
                  <Text style={styles.closeButtonText}>Anladım</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.backgroundCard,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    contentContainer: {
      padding: 12,
      gap: 8,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    icon: {
      fontSize: 14,
      marginRight: 4,
    },
    label: {
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: '500',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 16,
      padding: 20,
      width: '100%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    modalIcon: {
      fontSize: 24,
      marginRight: 8,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    modalExplanation: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    closeButton: {
      backgroundColor: theme.colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    closeButtonText: {
      color: theme.colors.textOnPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
  });
