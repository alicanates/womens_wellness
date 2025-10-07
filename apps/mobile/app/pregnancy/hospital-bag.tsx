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
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pregnancyService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';

const DEFAULT_ITEMS = [
  // Anne
  { category: 'Anne', itemName: 'Kimlik, Sağlık Sigortası Kartı' },
  { category: 'Anne', itemName: 'Hastane Kayıt Belgeleri' },
  { category: 'Anne', itemName: 'Rahat Giysiler (2-3 adet)' },
  { category: 'Anne', itemName: 'Sabahlık/Gecelik' },
  { category: 'Anne', itemName: 'Emzirme Sütyeni' },
  { category: 'Anne', itemName: 'Göğüs Pedi' },
  { category: 'Anne', itemName: 'Lohusa Pedi' },
  { category: 'Anne', itemName: 'Terlik' },
  { category: 'Anne', itemName: 'Kişisel Hijyen Malzemeleri' },
  { category: 'Anne', itemName: 'Telefon Şarj Aleti' },
  { category: 'Anne', itemName: 'Atıştırmalıklar' },

  // Bebek
  { category: 'Bebek', itemName: 'Bebek Kıyafetleri (3-4 takım)' },
  { category: 'Bebek', itemName: 'Bebek Battaniyesi' },
  { category: 'Bebek', itemName: 'Bebek Şapkası ve Eldiven' },
  { category: 'Bebek', itemName: 'Bebek Çorapları' },
  { category: 'Bebek', itemName: 'Bebek Bezleri' },
  { category: 'Bebek', itemName: 'Islak Mendil' },
  { category: 'Bebek', itemName: 'Bebek Şampuanı' },
  { category: 'Bebek', itemName: 'Emzik (tercihen)' },

  // Eş/Partner
  { category: 'Eş', itemName: 'Rahat Giysiler' },
  { category: 'Eş', itemName: 'Atıştırmalıklar' },
  { category: 'Eş', itemName: 'Telefon Şarj Aleti' },
  { category: 'Eş', itemName: 'Kişisel Hijyen Malzemeleri' },
];

export default function HospitalBagScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Anne');
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch hospital bag items
  const { data: items, isLoading } = useQuery({
    queryKey: ['hospitalBag'],
    queryFn: () => pregnancyService.getHospitalBagItems(),
  });

  // Initialize with default items if empty
  useEffect(() => {
    if (items && (items as any[]).length === 0 && !isInitialized) {
      // Add default items
      DEFAULT_ITEMS.forEach((item, index) => {
        addItemMutation.mutate({
          ...item,
          sortOrder: index,
        });
      });
      setIsInitialized(true);
    }
  }, [items, isInitialized]);

  const addItemMutation = useMutation({
    mutationFn: (data: any) => pregnancyService.addHospitalBagItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitalBag'] });
    },
    onError: (error: any) => {
      console.error('Add item error:', error);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: any) => pregnancyService.updateHospitalBagItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitalBag'] });
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Güncellenemedi');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => pregnancyService.deleteHospitalBagItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitalBag'] });
      Alert.alert('Başarılı', 'Öğe silindi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Silinemedi');
    },
  });

  const handleTogglePacked = (item: any) => {
    updateItemMutation.mutate({
      id: item.id,
      data: { isPacked: !item.isPacked },
    });
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('Uyarı', 'Lütfen öğe adı giriniz');
      return;
    }

    const maxSortOrder = items?.reduce(
      (max: number, item: any) => Math.max(max, item.sortOrder || 0),
      0
    ) || 0;

    addItemMutation.mutate({
      category: newItemCategory,
      itemName: newItemName.trim(),
      sortOrder: maxSortOrder + 1,
    });

    setNewItemName('');
    setModalVisible(false);
    Alert.alert('Başarılı', 'Öğe eklendi');
  };

  const handleDeleteItem = (item: any) => {
    Alert.alert(
      'Öğeyi Sil',
      'Bu öğeyi silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deleteItemMutation.mutate(item.id),
        },
      ]
    );
  };

  // Group items by category
  const groupedItems = (items as any[])?.reduce((groups: any, item: any) => {
    const category = item.category || 'Diğer';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {}) || {};

  const categories = Object.keys(groupedItems).sort();

  // Calculate progress
  const totalItems = (items as any[])?.length || 0;
  const packedItems = (items as any[])?.filter((item: any) => item.isPacked).length || 0;
  const progress = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;

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
    progressCard: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: theme.card.padding,
      marginBottom: theme.spacing.lg,
      shadowColor: theme.card.shadowColor,
      shadowOffset: theme.card.shadowOffset,
      shadowOpacity: theme.card.shadowOpacity,
      shadowRadius: theme.card.shadowRadius,
      elevation: theme.card.elevation,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    progressLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    progressPercentage: {
      fontSize: 24,
      fontWeight: '900',
      color: theme.colors.primary,
    },
    progressBar: {
      height: 10,
      backgroundColor: theme.colors.overlay,
      borderRadius: 5,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
    },
    progressText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },
    categorySection: {
      marginBottom: theme.spacing.xl,
    },
    categoryTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    itemCard: {
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: theme.card.padding,
      marginBottom: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: theme.card.shadowColor,
      shadowOffset: theme.card.shadowOffset,
      shadowOpacity: theme.card.shadowOpacity,
      shadowRadius: theme.card.shadowRadius,
      elevation: theme.card.elevation,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    checkbox: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: theme.spacing.md,
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
    },
    itemText: {
      flex: 1,
      fontSize: 15,
      color: theme.colors.text,
    },
    itemTextPacked: {
      textDecorationLine: 'line-through',
      color: theme.colors.textSecondary,
    },
    deleteButton: {
      padding: theme.spacing.sm,
      marginLeft: theme.spacing.sm,
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
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
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
    },
    categoryButtons: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    categoryButton: {
      flex: 1,
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.card.borderRadius,
      padding: theme.spacing.md,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    categoryButtonActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.overlay,
    },
    categoryButtonText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    categoryButtonTextActive: {
      color: theme.colors.primary,
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
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={{ fontSize: 24, color: theme.colors.text }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Hastane Çantası</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ fontSize: 28, color: theme.colors.primary }}>➕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Progress Card */}
        {totalItems > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>İlerleme</Text>
              <Text style={styles.progressPercentage}>{progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {packedItems} / {totalItems} öğe hazırlandı
            </Text>
          </View>
        )}

        {/* Items by Category */}
        {categories.length > 0 ? (
          categories.map((category) => (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category}</Text>
              {groupedItems[category].map((item: any) => (
                <View key={item.id} style={styles.itemCard}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      item.isPacked && styles.checkboxChecked,
                    ]}
                    onPress={() => handleTogglePacked(item)}
                  >
                    {item.isPacked && (
                      <Text style={{ color: theme.colors.textOnPrimary, fontSize: 18 }}>
                        ✓
                      </Text>
                    )}
                  </TouchableOpacity>
                  <Text
                    style={[
                      styles.itemText,
                      item.isPacked && styles.itemTextPacked,
                    ]}
                  >
                    {item.itemName}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(item)}
                  >
                    <Text style={{ fontSize: 18 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎒</Text>
            <Text style={styles.emptyTitle}>Henüz Öğe Yok</Text>
            <Text style={styles.emptyText}>
              İlk öğenizi ekleyin veya varsayılan listeyi yükleyin
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Item Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Öğe Ekle</Text>

            <Text style={styles.label}>Kategori</Text>
            <View style={styles.categoryButtons}>
              {['Anne', 'Bebek', 'Eş'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    newItemCategory === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setNewItemCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      newItemCategory === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Öğe Adı</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: Kimlik belgesi"
              placeholderTextColor={theme.colors.textSecondary}
              value={newItemName}
              onChangeText={setNewItemName}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setModalVisible(false);
                  setNewItemName('');
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>
                  İptal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleAddItem}
              >
                <Text style={styles.modalButtonText}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
