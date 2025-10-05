import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { waterService, userService } from '@/services/api';
import { getGreetingMessage } from '@/utils/greeting';
import { useTheme } from '@/hooks/useTheme';

export default function HomeScreen() {
  const theme = useTheme();
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

  const displayName = (userData as any)?.profile?.displayName || user?.email?.split('@')[0] || 'Misafir';
  const greetingMessage = getGreetingMessage(displayName);

  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
      {/* Header with Profile Picture */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{greetingMessage}</Text>
          <Text style={styles.question}>Bugün nasılsın? 💕</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push('/settings')}
        >
          {(userData as any)?.profile?.profilePictureUrl ? (
            <Image
              source={{ uri: (userData as any).profile.profilePictureUrl }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profilePlaceholderText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Water Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>💧</Text>
          <Text style={styles.cardTitle}>Bugünkü Su Tüketimi</Text>
        </View>
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
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>⚖️</Text>
          <Text style={styles.cardTitle}>Vücut Kitle İndeksi</Text>
        </View>
        <Text style={styles.cardSubtitle}>Sağlık hedeflerine ulaşmak için BMI'nı hesapla</Text>
        <TouchableOpacity
          style={styles.cardButton}
          onPress={() => router.push('/bmi-calculator')}
        >
          <Text style={styles.cardButtonText}>BMI Hesapla</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  profileButton: {
    marginLeft: theme.spacing.md,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  profilePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  profilePlaceholderText: {
    color: theme.colors.textOnPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  greeting: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  question: {
    ...theme.typography.subtitle,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: theme.colors.backgroundCard,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.card.borderRadius,
    padding: theme.card.padding,
    shadowColor: theme.card.shadowColor,
    shadowOffset: theme.card.shadowOffset,
    shadowOpacity: theme.card.shadowOpacity,
    shadowRadius: theme.card.shadowRadius,
    elevation: theme.card.elevation,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  cardValue: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  cardSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  cardButton: {
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
  cardButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
