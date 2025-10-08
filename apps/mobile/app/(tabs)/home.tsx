import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { homeService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';
import { StreakChip } from '@/components/home/StreakChip';
import { StatusPill } from '@/components/home/StatusPill';
import { PriorityCard } from '@/components/home/PriorityCard';

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  // Track in-session dismissed cards (resets on app restart)
  const [sessionDismissedCards, setSessionDismissedCards] = useState<Set<string>>(new Set());

  const { data: snapshot, isLoading, refetch } = useQuery({
    queryKey: ['homeSnapshot'],
    queryFn: () => homeService.getSnapshot('tr'),
    enabled: isAuthenticated,
    staleTime: 60000, // 1 minute
  });

  // Refetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        refetch();
      }
    }, [isAuthenticated, refetch])
  );

  const dismissCardMutation = useMutation({
    mutationFn: (cardId: string) => {
      // Hydration card should never be dismissed (no X button shown)
      // Other cards dismiss via API (persists until end of day)
      return homeService.dismissCard(cardId, 7);
    },
    onSuccess: (_, cardId) => {
      // Add to session dismissed cards (for immediate UI update)
      setSessionDismissedCards(prev => new Set(prev).add(cardId));
      // Refresh home snapshot
      queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    if (hour < 22) return 'İyi akşamlar';
    return 'İyi geceler';
  };

  const styles = createStyles(theme);

  if (isLoading && !snapshot) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* Zone A: Identity & Quick Access */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              {getGreeting()}, {snapshot?.user.displayName || 'Misafir'}!
            </Text>
            <Text style={styles.question}>Bugün nasılsın? 💕</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/settings')}
          >
            {snapshot?.user.profilePictureUrl ? (
              <Image
                source={{ uri: snapshot.user.profilePictureUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Text style={styles.profilePlaceholderText}>
                  {snapshot?.user.displayName?.charAt(0).toUpperCase() || 'M'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Streak Chip */}
        {snapshot?.streak != null && (
          <View style={styles.streakContainer}>
            <StreakChip
              current={snapshot.streak.current}
              longest={snapshot.streak.longest}
              onPress={() => {
                // Show streak details modal
              }}
            />
          </View>
        )}

        {/* Zone B: Today at a Glance (Status Pills) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bugün Bir Bakışta</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsContainer}
          >
            {/* Cycle Snapshot Pill */}
            {snapshot?.todaySnapshot.cycleDay != null && snapshot.todaySnapshot.cycleDay > 0 && (
              <StatusPill
                icon="🌸"
                title="Döngü"
                value={`Gün ${snapshot.todaySnapshot.cycleDay}`}
                subtitle={
                  snapshot.todaySnapshot.nextPeriodEstimate
                    ? new Date(snapshot.todaySnapshot.nextPeriodEstimate.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
                    : undefined
                }
                onPress={() => router.push('/(tabs)/calendar')}
              />
            )}

            {/* Pregnancy Pill */}
            {snapshot?.todaySnapshot.pregnancy && (
              <StatusPill
                icon="🤰"
                title="Gebelik"
                value={`${snapshot.todaySnapshot.pregnancy.weeks}h+${snapshot.todaySnapshot.pregnancy.days}g`}
                subtitle={new Date(snapshot.todaySnapshot.pregnancy.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                onPress={() => router.push('/pregnancy')}
              />
            )}

            {/* Water Pill */}
            {snapshot?.todaySnapshot.waterProgress && (
              <StatusPill
                icon="💧"
                title="Su"
                value={`${(snapshot.todaySnapshot.waterProgress.current / 1000).toFixed(1)}L`}
                subtitle={`${(snapshot.todaySnapshot.waterProgress.target / 1000).toFixed(1)}L hedef`}
                onPress={() => router.push('/water')}
              />
            )}

            {/* Reminders Pill */}
            {snapshot?.todaySnapshot.remindersToday != null && snapshot.todaySnapshot.remindersToday > 0 && (
              <StatusPill
                icon="⏰"
                title="Hatırlatıcılar"
                value={`${snapshot.todaySnapshot.remindersToday}`}
                subtitle="bugün"
                onPress={() => router.push('/(tabs)/reminders')}
              />
            )}
          </ScrollView>
        </View>

        {/* Zone C: Priority Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Öncelikler</Text>
          {(() => {
            const visibleCards = snapshot?.priorityCards
              ?.filter((card) => {
                // Hydration card should NEVER be filtered out
                if (card.id === 'hydration') return true;
                // Other cards check session dismissal
                return !sessionDismissedCards.has(card.id);
              })
              .slice(0, 4) || [];

            return visibleCards.length > 0 ? (
              visibleCards.map((card) => (
                <PriorityCard
                  key={card.id}
                  card={card}
                  onDismiss={() => dismissCardMutation.mutate(card.id)}
                />
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Harika! Şu an için öncelikli bir şey yok.</Text>
              </View>
            );
          })()}
        </View>

        {/* Zone D: Educational Articles (Optional) */}
        {snapshot?.educationalArticles && snapshot.educationalArticles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Keşfet</Text>
            {snapshot.educationalArticles.slice(0, 3).map((article) => (
              <TouchableOpacity key={article.id} style={styles.articleCard}>
                <View style={styles.articleHeader}>
                  <Text style={styles.articleCategory}>
                    {article.category === 'menstrual_health' ? 'Regl Sağlığı' :
                     article.category === 'hydration' ? 'Hidrasyon' :
                     article.category === 'sleep' ? 'Uyku' :
                     article.category === 'exercise' ? 'Egzersiz' : 'Farkındalık'}
                  </Text>
                </View>
                <Text style={styles.articleTitle}>{article.title || ''}</Text>
                <Text style={styles.articleExcerpt} numberOfLines={2}>
                  {article.content || ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Zone E: Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionButton, styles.quickActionButtonFirst]}
              onPress={() => router.push('/water')}
            >
              <Text style={styles.quickActionIcon}>💧</Text>
              <Text style={styles.quickActionText}>Su Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/(tabs)/calendar')}
            >
              <Text style={styles.quickActionIcon}>📝</Text>
              <Text style={styles.quickActionText}>Semptom Ekle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => router.push('/bmi-calculator')}
            >
              <Text style={styles.quickActionIcon}>⚖️</Text>
              <Text style={styles.quickActionText}>Metrikler</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
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
    },
    profilePlaceholderText: {
      color: theme.colors.textOnPrimary,
      fontSize: 20,
      fontWeight: '700',
    },
    greeting: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 4,
    },
    question: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    streakContainer: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    section: {
      marginTop: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    pillsContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingRight: theme.spacing.xl,
    },
    emptyCard: {
      backgroundColor: theme.colors.backgroundCard,
      marginHorizontal: theme.spacing.lg,
      borderRadius: theme.card.borderRadius,
      padding: theme.card.padding,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 100,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    articleCard: {
      backgroundColor: theme.colors.backgroundCard,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderRadius: theme.card.borderRadius,
      padding: theme.card.padding,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    articleHeader: {
      marginBottom: 8,
    },
    articleCategory: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    articleTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 6,
    },
    articleExcerpt: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    quickActions: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      justifyContent: 'space-between',
    },
    quickActionButton: {
      flex: 1,
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 12,
      padding: theme.spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginLeft: theme.spacing.md,
    },
    quickActionButtonFirst: {
      marginLeft: 0,
    },
    quickActionIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    quickActionText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
    },
    bottomSpacer: {
      height: 40,
    },
  });
