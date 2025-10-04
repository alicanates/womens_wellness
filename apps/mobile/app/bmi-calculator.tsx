import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { metricsService } from '@/services/api';

export default function BMICalculatorScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState<any>(null);

  const calculateBMIMutation = useMutation({
    mutationFn: (data: { heightCm: number; weightKg: number }) =>
      metricsService.calculateBMI(data.heightCm, data.weightKg),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'BMI hesaplanırken bir hata oluştu');
    },
  });

  const handleCalculate = () => {
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (isNaN(h) || h <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir boy değeri girin');
      return;
    }
    if (isNaN(w) || w <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir kilo değeri girin');
      return;
    }

    calculateBMIMutation.mutate({ heightCm: h, weightKg: w });
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'underweight':
        return { text: 'Zayıf', color: '#FFA500' };
      case 'normal':
        return { text: 'Normal', color: '#4CAF50' };
      case 'overweight':
        return { text: 'Fazla Kilolu', color: '#FF9800' };
      case 'obese':
        return { text: 'Obez', color: '#F44336' };
      default:
        return { text: category, color: '#666' };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BMI Hesaplama</Text>
      <Text style={styles.subtitle}>Vücut Kitle İndeksi</Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Boy (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="örn: 170"
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
            editable={!calculateBMIMutation.isPending}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kilo (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="örn: 65"
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
            editable={!calculateBMIMutation.isPending}
          />
        </View>

        <TouchableOpacity
          style={styles.calculateButton}
          onPress={handleCalculate}
          disabled={calculateBMIMutation.isPending}
        >
          <Text style={styles.calculateButtonText}>
            {calculateBMIMutation.isPending ? 'Hesaplanıyor...' : 'Hesapla'}
          </Text>
        </TouchableOpacity>
      </View>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Sonuç</Text>
          <Text style={styles.bmiValue}>{result.bmi?.toFixed(1)}</Text>
          <Text
            style={[
              styles.category,
              { color: getCategoryInfo(result.category).color },
            ]}
          >
            {getCategoryInfo(result.category).text}
          </Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>BMI Aralıkları:</Text>
            <Text style={styles.infoText}>• Zayıf: &lt; 18.5</Text>
            <Text style={styles.infoText}>• Normal: 18.5 - 24.9</Text>
            <Text style={styles.infoText}>• Fazla Kilolu: 25.0 - 29.9</Text>
            <Text style={styles.infoText}>• Obez: ≥ 30.0</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        disabled={calculateBMIMutation.isPending}
      >
        <Text style={styles.backButtonText}>Geri Dön</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  calculateButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#666',
  },
  bmiValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  category: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  backButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
