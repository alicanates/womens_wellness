import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { waterService } from '@/services/api';

export default function WaterScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');

  const addWaterMutation = useMutation({
    mutationFn: (amountMl: number) => waterService.logWater({ amountMl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waterToday'] });
      Alert.alert('Başarılı', 'Su kaydı eklendi');
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Su eklenirken bir hata oluştu');
    },
  });

  const handleQuickAdd = (ml: number) => {
    addWaterMutation.mutate(ml);
  };

  const handleCustomAdd = () => {
    const ml = parseInt(amount);
    if (isNaN(ml) || ml <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir miktar girin');
      return;
    }
    addWaterMutation.mutate(ml);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
      <Text style={styles.title}>Su Ekle</Text>

      <View style={styles.quickButtons}>
        <Text style={styles.sectionTitle}>Hızlı Ekle</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => handleQuickAdd(250)}
            disabled={addWaterMutation.isPending}
          >
            <Text style={styles.quickButtonText}>250 ml</Text>
            <Text style={styles.quickButtonSubtext}>Bardak</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => handleQuickAdd(500)}
            disabled={addWaterMutation.isPending}
          >
            <Text style={styles.quickButtonText}>500 ml</Text>
            <Text style={styles.quickButtonSubtext}>Şişe</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => handleQuickAdd(750)}
            disabled={addWaterMutation.isPending}
          >
            <Text style={styles.quickButtonText}>750 ml</Text>
            <Text style={styles.quickButtonSubtext}>Büyük Şişe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => handleQuickAdd(1000)}
            disabled={addWaterMutation.isPending}
          >
            <Text style={styles.quickButtonText}>1000 ml</Text>
            <Text style={styles.quickButtonSubtext}>1 Litre</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.customSection}>
        <Text style={styles.sectionTitle}>Özel Miktar</Text>
        <TextInput
          style={styles.input}
          placeholder="Miktar (ml)"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          editable={!addWaterMutation.isPending}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleCustomAdd}
          disabled={addWaterMutation.isPending}
        >
          <Text style={styles.addButtonText}>
            {addWaterMutation.isPending ? 'Ekleniyor...' : 'Ekle'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={addWaterMutation.isPending}
      >
        <Text style={styles.cancelButtonText}>İptal</Text>
      </TouchableOpacity>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickButtons: {
    marginBottom: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  quickButtonSubtext: {
    fontSize: 12,
    color: '#666',
  },
  customSection: {
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
