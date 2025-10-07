import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pregnancyService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';
import { router } from 'expo-router';

export default function PregnancyNotesScreen() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  // Fetch notes
  const { data: notes, isLoading } = useQuery({
    queryKey: ['pregnancy', 'notes'],
    queryFn: () => pregnancyService.getNotes(),
  });

  const createNoteMutation = useMutation({
    mutationFn: (data: any) => pregnancyService.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pregnancy', 'notes'] });
      closeModal();
      Alert.alert('Başarılı', 'Not kaydedildi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Kaydedilemedi');
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({ id, data }: any) => pregnancyService.updateNote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pregnancy', 'notes'] });
      closeModal();
      Alert.alert('Başarılı', 'Not güncellendi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Güncellenemedi');
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) => pregnancyService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pregnancy', 'notes'] });
      Alert.alert('Başarılı', 'Not silindi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Silinemedi');
    },
  });

  const openCreateModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setTags('');
    setModalVisible(true);
  };

  const openEditModal = (note: any) => {
    setEditingNote(note);
    setTitle(note.title || '');
    setContent(note.content || '');
    setTags(note.tags?.join(', ') || '');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingNote(null);
    setTitle('');
    setContent('');
    setTags('');
  };

  const handleSave = () => {
    if (!content.trim()) {
      Alert.alert('Uyarı', 'Lütfen not içeriği giriniz');
      return;
    }

    const data = {
      title: title.trim() || undefined,
      content: content.trim(),
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
    };

    if (editingNote) {
      updateNoteMutation.mutate({ id: editingNote.id, data });
    } else {
      createNoteMutation.mutate(data);
    }
  };

  const handleDelete = (note: any) => {
    Alert.alert(
      'Not Sil',
      'Bu notu silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => deleteNoteMutation.mutate(note.id),
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
    addButton: {
      padding: theme.spacing.sm,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    noteCard: {
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
    noteHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    noteTitle: {
      flex: 1,
      fontSize: 17,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    noteActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    noteContent: {
      fontSize: 15,
      color: theme.colors.text,
      lineHeight: 22,
      marginBottom: theme.spacing.sm,
    },
    noteTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    tag: {
      backgroundColor: theme.colors.overlay,
      borderRadius: 12,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    tagText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    noteDate: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
      fontWeight: '500',
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
      height: 150,
      textAlignVertical: 'top',
    },
    buttonRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.lg,
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
    cancelButton: {
      flex: 1,
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: theme.button.borderRadius,
      padding: theme.button.padding,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    cancelButtonText: {
      color: theme.colors.primary,
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
          <Text style={styles.headerTitle}>Notlar</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Text style={{ fontSize: 28, color: theme.colors.primary }}>➕</Text>
        </TouchableOpacity>
      </View>

      {/* Notes List */}
      <ScrollView style={styles.content}>
        {notes && (notes as any[]).length > 0 ? (
          notes.map((note: any) => (
            <View key={note.id} style={styles.noteCard}>
              <View style={styles.noteHeader}>
                <View style={{ flex: 1 }}>
                  {note.title && (
                    <Text style={styles.noteTitle}>{note.title}</Text>
                  )}
                </View>
                <View style={styles.noteActions}>
                  <TouchableOpacity onPress={() => openEditModal(note)}>
                    <Text style={{ fontSize: 20, color: theme.colors.primary }}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(note)}>
                    <Text style={{ fontSize: 20 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.noteContent}>
                {note.content}
              </Text>
              {note.tags && note.tags.length > 0 && (
                <View style={styles.noteTags}>
                  {note.tags.map((tag: string, index: number) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
              <Text style={styles.noteDate}>
                {new Date(note.createdAt).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>Henüz Not Yok</Text>
            <Text style={styles.emptyText}>
              Hamilelik sürecinizle ilgili notlar almaya başlayın
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
                  {editingNote ? 'Not Düzenle' : 'Yeni Not'}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                >
                  <Text style={{ fontSize: 28, color: theme.colors.text }}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Başlık (Opsiyonel)</Text>
              <TextInput
                style={styles.input}
                placeholder="Başlık giriniz"
                placeholderTextColor={theme.colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.label}>İçerik *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Not içeriğini giriniz"
                placeholderTextColor={theme.colors.textSecondary}
                value={content}
                onChangeText={setContent}
                multiline
              />

              <Text style={styles.label}>Etiketler (virgülle ayırın)</Text>
              <TextInput
                style={styles.input}
                placeholder="ör: doktor, test sonuçları"
                placeholderTextColor={theme.colors.textSecondary}
                value={tags}
                onChangeText={setTags}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeModal}
                >
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!content.trim() ||
                      createNoteMutation.isPending ||
                      updateNoteMutation.isPending) &&
                      styles.saveButtonDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={
                    !content.trim() ||
                    createNoteMutation.isPending ||
                    updateNoteMutation.isPending
                  }
                >
                  <Text style={styles.saveButtonText}>
                    {createNoteMutation.isPending || updateNoteMutation.isPending
                      ? 'Kaydediliyor...'
                      : 'Kaydet'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
