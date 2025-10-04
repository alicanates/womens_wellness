import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
      metricsService.calculateBMI(data),
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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
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

          <View style={styles.idealWeightCard}>
            <Text style={styles.idealWeightTitle}>İdeal Kilo Aralığınız</Text>
            <View style={styles.idealWeightContent}>
              <View style={styles.weightRangeBox}>
                <Text style={styles.weightValue}>
                  {((18.5 * Math.pow(result.heightCm || parseFloat(height), 2)) / 10000).toFixed(1)}
                </Text>
                <Text style={styles.weightUnit}>kg</Text>
              </View>
              <View style={styles.rangeDivider}>
                <View style={styles.dividerLine} />
              </View>
              <View style={styles.weightRangeBox}>
                <Text style={styles.weightValue}>
                  {((24.9 * Math.pow(result.heightCm || parseFloat(height), 2)) / 10000).toFixed(1)}
                </Text>
                <Text style={styles.weightUnit}>kg</Text>
              </View>
            </View>
            <Text style={styles.idealWeightSubtext}>
              {parseFloat(height)} cm boy için normal BMI aralığı
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>BMI Aralıkları</Text>
            <View style={styles.rangesList}>
              <View style={[styles.rangeItem, styles.rangeUnderweight]}>
                <View style={styles.rangeIndicator} />
                <View style={styles.rangeContent}>
                  <Text style={styles.rangeLabel}>Zayıf</Text>
                  <Text style={styles.rangeValue}>&lt; 18.5</Text>
                </View>
              </View>
              <View style={[styles.rangeItem, styles.rangeNormal]}>
                <View style={styles.rangeIndicator} />
                <View style={styles.rangeContent}>
                  <Text style={styles.rangeLabel}>Normal</Text>
                  <Text style={styles.rangeValue}>18.5 - 24.9</Text>
                </View>
              </View>
              <View style={[styles.rangeItem, styles.rangeOverweight]}>
                <View style={styles.rangeIndicator} />
                <View style={styles.rangeContent}>
                  <Text style={styles.rangeLabel}>Fazla Kilolu</Text>
                  <Text style={styles.rangeValue}>25.0 - 29.9</Text>
                </View>
              </View>
              <View style={[styles.rangeItem, styles.rangeObese]}>
                <View style={styles.rangeIndicator} />
                <View style={styles.rangeContent}>
                  <Text style={styles.rangeLabel}>Obez</Text>
                  <Text style={styles.rangeValue}>≥ 30.0</Text>
                </View>
              </View>
            </View>
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
  idealWeightCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  idealWeightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  idealWeightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  weightRangeBox: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  weightValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  weightUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rangeDivider: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dividerLine: {
    width: 32,
    height: 3,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  idealWeightSubtext: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoBox: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  rangesList: {
    gap: 12,
  },
  rangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rangeUnderweight: {
    borderLeftColor: '#FFA500',
  },
  rangeNormal: {
    borderLeftColor: '#4CAF50',
  },
  rangeOverweight: {
    borderLeftColor: '#FF9800',
  },
  rangeObese: {
    borderLeftColor: '#F44336',
  },
  rangeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'currentColor',
    marginRight: 12,
  },
  rangeContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rangeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  rangeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
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
