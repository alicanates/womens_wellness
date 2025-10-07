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
// import { Ionicons } from '@expo/vector-icons';

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
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border || 'rgba(0,0,0,0.1)',
      backgroundColor: theme.card,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      marginRight: 16,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
    },
    addButton: {
      padding: 8,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    noteCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 18,
      marginBottom: 16,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
      borderWidth: 1,
      borderColor: theme.border || 'rgba(0,0,0,0.05)',
    },
    noteHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    noteTitle: {
      flex: 1,
      fontSize: 17,
      fontWeight: '700',
      color: theme.text,
    },
    noteActions: {
      flexDirection: 'row',
      gap: 8,
    },
    noteContent: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 20,
      marginBottom: 8,
    },
    noteTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    tag: {
      backgroundColor: theme.primaryLight || theme.primary + '20',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    tagText: {
      fontSize: 12,
      color: theme.primary,
      fontWeight: '600',
    },
    noteDate: {
      fontSize: 12,
      color: theme.text,
      opacity: 0.6,
      marginTop: 8,
      fontWeight: '500',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 64,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: theme.text,
      opacity: 0.6,
      textAlign: 'center',
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
    },
    closeButton: {
      padding: 4,
    },
    input: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.text,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border || 'rgba(0,0,0,0.1)',
    },
    textArea: {
      height: 150,
      textAlignVertical: 'top',
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    saveButton: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      padding: 18,
      alignItems: 'center',
      marginTop: 16,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 17,
      fontWeight: '700',
      letterSpacing: 0.5,
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
            <Text style={{ fontSize: 24 }}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notlar</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Text style={{ fontSize: 32, color: theme.primary }}>➕</Text>
        </TouchableOpacity>
      </View>

      {/* Notes List */}
      <ScrollView style={styles.content}>
        {notes && notes.length > 0 ? (
          notes.map((note: any) => (
            <View key={note.id} style={styles.noteCard}>
              <View style={styles.noteHeader}>
                {note.title && (
                  <Text style={styles.noteTitle}>{note.title}</Text>
                )}
                <View style={styles.noteActions}>
                  <TouchableOpacity onPress={() => openEditModal(note)}>
                    <Text style={{ fontSize: 20, color: theme.primary }}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(note)}>
                    <Text style={{ fontSize: 20 }}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.noteContent} numberOfLines={5}>
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
            <Text style={[styles.emptyIcon, { fontSize: 64, color: theme.textSecondary }]}>
              📝
            </Text>
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
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingNote ? 'Not Düzenle' : 'Yeni Not'}
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}
                >
                  <Text style={{ fontSize: 28, color: theme.text }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView>
                <Text style={styles.label}>Başlık (Opsiyonel)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Başlık giriniz"
                  placeholderTextColor={theme.textSecondary}
                  value={title}
                  onChangeText={setTitle}
                />

                <Text style={styles.label}>İçerik</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Not içeriğini giriniz"
                  placeholderTextColor={theme.textSecondary}
                  value={content}
                  onChangeText={setContent}
                  multiline
                />

                <Text style={styles.label}>Etiketler (virgülle ayırın)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ör: doktor, test sonuçları"
                  placeholderTextColor={theme.textSecondary}
                  value={tags}
                  onChangeText={setTags}
                />

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
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
