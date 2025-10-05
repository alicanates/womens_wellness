import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { waterService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';

export default function WaterScreen() {
  const theme = useTheme();
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

  const styles = createStyles(theme);

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
          placeholderTextColor={theme.colors.textLight}
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

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.subtitle,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  quickButtons: {
    marginBottom: theme.spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  quickButton: {
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.card.borderRadius,
    padding: theme.spacing.lg,
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: theme.card.shadowColor,
    shadowOffset: theme.card.shadowOffset,
    shadowOpacity: theme.card.shadowOpacity,
    shadowRadius: theme.card.shadowRadius,
    elevation: theme.card.elevation,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  quickButtonSubtext: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  customSection: {
    marginBottom: theme.spacing.xl,
  },
  input: {
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.button.borderRadius,
    padding: theme.spacing.md,
    fontSize: 16,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
  },
  addButton: {
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
  addButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cancelButton: {
    backgroundColor: theme.colors.backgroundCard,
    borderRadius: theme.button.borderRadius,
    padding: theme.button.padding,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});
