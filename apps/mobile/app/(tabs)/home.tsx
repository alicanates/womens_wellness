import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { waterService, userService, remindersService } from '@/services/api';

export default function HomeScreen() {
  const { user } = useAuthStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  const { data: userData } = useQuery({
    queryKey: ['me'],
    queryFn: () => userService.getMe(),
    enabled: isAuthenticated,
  });

  const { data: waterToday } = useQuery({
    queryKey: ['waterToday'],
    queryFn: () => waterService.getTodayTotal(),
    enabled: isAuthenticated,
  });

  const { data: reminders } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => remindersService.getReminders(),
    enabled: isAuthenticated,
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Hoş Geldiniz</Text>
      <Text style={styles.subtitle}>
        {(userData as any)?.profile?.displayName || user?.email}
      </Text>

      {/* Water Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bugünkü Su Tüketimi</Text>
        <Text style={styles.cardValue}>
          {(waterToday as any)?.totalL || 0} L
        </Text>
        <Text style={styles.cardSubtitle}>
          {(waterToday as any)?.logs?.length || 0} kayıt
        </Text>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => router.push('/water')}
        >
          <Text style={styles.cardButtonText}>Su Ekle</Text>
        </TouchableOpacity>
      </View>

      {/* BMI Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vücut Kitle İndeksi</Text>
        <Text style={styles.cardSubtitle}>Hesapla</Text>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => router.push('/bmi-calculator')}
        >
          <Text style={styles.cardButtonText}>BMI Hesapla</Text>
        </TouchableOpacity>
      </View>

      {/* Period Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Regl Takvimi</Text>
        <Text style={styles.cardSubtitle}>Takip et</Text>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => router.push('/(tabs)/calendar')}
        >
          <Text style={styles.cardButtonText}>Takvime Git</Text>
        </TouchableOpacity>
      </View>

      {/* Reminders Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Hatırlatıcılar</Text>
        <Text style={styles.cardSubtitle}>
          {(reminders as any)?.length || 0} aktif hatırlatıcı
        </Text>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => router.push('/(tabs)/reminders')}
        >
          <Text style={styles.cardButtonText}>Hatırlatıcıları Yönet</Text>
        </TouchableOpacity>
      </View>

      {/* AI Companion Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>NOVA - AI Arkadaşın</Text>
        <Text style={styles.cardSubtitle}>Sohbet et</Text>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => router.push('/(tabs)/chat')}
        >
          <Text style={styles.cardButtonText}>Sohbeti Aç</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  cardButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cardButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
