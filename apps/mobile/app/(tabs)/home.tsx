import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { homeService, discoverService } from '@/services/api';
import { useTheme } from '@/hooks/useTheme';
import { StreakChip } from '@/components/home/StreakChip';
import { StatusPill } from '@/components/home/StatusPill';
import { PriorityCard } from '@/components/home/PriorityCard';
import { WaterTile, StepsTile, MeditationTile, SleepTile } from '@/components/wellness';
import { ArticleCard } from '@/components/discover/ArticleCard';

export default function HomeScreen() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  // Track in-session dismissed cards (resets on app restart)
  const [sessionDismissedCards, setSessionDismissedCards] = useState<Set<string>>(new Set());

  const {
    data: snapshot,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['homeSnapshot'],
    queryFn: () => homeService.getSnapshot('tr'),
    enabled: isAuthenticated,
    staleTime: 60000, // 1 minute
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
      return homeService.dismissCard(cardId, 7);
    },
    onSuccess: (_, cardId) => {
      // Add to session dismissed cards (for immediate UI update)
      setSessionDismissedCards(prev => new Set(prev).add(cardId));
      // Refresh home snapshot
      queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });
    },
  });

  const toggleSaveMutation = useMutation({
    mutationFn: (articleId: string) => discoverService.toggleSave(articleId),
    onSuccess: () => {
      // Refresh home snapshot to update saved status
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
    if (hour >= 20 || hour < 6) return 'İyi Geceler';
    return 'Günaydın';
  };

  const styles = createStyles(theme);

  // Loading state (only show if no cached data)
  if (isLoading && !snapshot) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state (only show if no cached data)
  if (isError && !snapshot) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Veriler yüklenirken bir hata oluştu</Text>
          <Text style={styles.errorSubtext}>
            {error instanceof Error ? error.message : 'Lütfen tekrar deneyin'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
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
        <View style={styles.topBar}>
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
          <View style={styles.appTitleContainer}>
            <Text style={styles.appTitle}>Kadın</Text>
            <Text style={styles.appTitleAccent}>Atlası</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/(tabs)/reminders')}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Greeting Card */}
        <View style={styles.greetingCard}>
          <View style={styles.greetingOverlay} />
          <View style={styles.greetingContent}>
            <Text style={styles.userName}>{snapshot?.user.displayName || 'Misafir'}</Text>
            <Text style={styles.greetingTitle}>{getGreeting()}</Text>
            <Text style={styles.greetingQuestion}>Bugün Nasılsın?</Text>
          </View>
          <Image
            source={
              new Date().getHours() >= 20 || new Date().getHours() < 6
                ? require('../../assets/images/mascots/GoodNight.png')
                : require('../../assets/images/mascots/Morning.png')
            }
            style={styles.mascotImage}
            resizeMode="contain"
          />
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
        {(() => {
          // Check if there's any data other than water
          const hasCycleData = snapshot?.todaySnapshot.cycleDay != null && snapshot.todaySnapshot.cycleDay > 0;
          const hasPregnancyData = snapshot?.todaySnapshot.pregnancy != null;
          const hasRemindersData = snapshot?.todaySnapshot.remindersToday != null && snapshot.todaySnapshot.remindersToday > 0;

          // Only show section if there's data other than water
          const showSection = hasCycleData || hasPregnancyData || hasRemindersData;

          if (!showSection) return null;

          return (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bugün Bir Bakışta</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillsContainer}
              >
                {/* Cycle Snapshot Pill */}
                {hasCycleData && (
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
                {hasPregnancyData && snapshot.todaySnapshot.pregnancy && (
                  <StatusPill
                    icon="🤰"
                    title="Gebelik"
                    value={`${snapshot.todaySnapshot.pregnancy.weeks}h+${snapshot.todaySnapshot.pregnancy.days}g`}
                    subtitle={new Date(snapshot.todaySnapshot.pregnancy.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    onPress={() => router.push('/pregnancy')}
                  />
                )}

                {/* Reminders Pill */}
                {hasRemindersData && (
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
          );
        })()}

        {/* Wellness Tiles - 2x2 Grid */}
        {snapshot?.wellnessTiles && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İyilik Hali</Text>
            <View style={styles.tilesGrid}>
              {/* Top Row: Water + Steps */}
              <View style={styles.tilesRow}>
                <View style={styles.tileWrapper}>
                  <WaterTile data={snapshot.todaySnapshot.waterProgress} />
                </View>
                <View style={styles.tileWrapper}>
                  <StepsTile data={snapshot.wellnessTiles.steps} />
                </View>
              </View>

              {/* Bottom Row: Meditation + Sleep */}
              <View style={styles.tilesRow}>
                <View style={styles.tileWrapper}>
                  <MeditationTile data={snapshot.wellnessTiles.meditation} />
                </View>
                <View style={styles.tileWrapper}>
                  <SleepTile data={snapshot.wellnessTiles.sleep} />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Zone C: Priority Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Öncelikler</Text>
          {(() => {
            const visibleCards = snapshot?.priorityCards
              ?.filter((card) => !sessionDismissedCards.has(card.id))
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

        {/* Zone D: Educational Articles (Keşfet) */}
        {snapshot?.educationalArticles && snapshot.educationalArticles.length > 0 && (
          <View style={styles.discoverSection}>
            <View style={styles.discoverHeader}>
              <Text style={styles.discoverTitle}>Keşfet 📚</Text>
              <TouchableOpacity onPress={() => router.push('/discover')}>
                <Text style={styles.discoverSeeAll}>Tümünü Gör →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.discoverScroll}
            >
              {snapshot.educationalArticles.map((article, index) => (
                <TouchableOpacity
                  key={article.id}
                  style={[
                    styles.discoverCard,
                    index === 0 && styles.discoverCardFirst,
                  ]}
                  onPress={() => router.push(`/discover/article/${article.id}`)}
                >
                  {article.imageUrl && (
                    <Image
                      source={{ uri: article.imageUrl }}
                      style={styles.discoverCardImage}
                      resizeMode="cover"
                    />
                  )}
                  <View style={styles.discoverCardContent}>
                    <View style={styles.discoverCardCategory}>
                      <Text style={styles.discoverCardCategoryText}>
                        {article.category}
                      </Text>
                    </View>
                    <Text style={styles.discoverCardTitle} numberOfLines={2}>
                      {article.title}
                    </Text>
                    <View style={styles.discoverCardFooter}>
                      <Text style={styles.discoverCardTime}>
                        {article.readTimeMin} dk
                      </Text>
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleSaveMutation.mutate(article.id);
                        }}
                      >
                        <Text style={styles.discoverCardSave}>
                          {article.isSaved ? '❤️' : '🤍'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
              onPress={() => {
                // Navigate to calendar and trigger today's details
                router.push({
                  pathname: '/(tabs)/calendar',
                  params: { openToday: 'true' }
                });
              }}
            >
              <Text style={styles.quickActionIcon}>😊</Text>
              <Text style={styles.quickActionText}>Ruh Hali Ekle</Text>
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
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    errorIcon: {
      fontSize: 64,
      marginBottom: theme.spacing.lg,
    },
    errorText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    errorSubtext: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.md,
      borderRadius: 12,
    },
    retryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textOnPrimary,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
    },
    appTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    appTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: 0.3,
    },
    appTitleAccent: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.colors.primary,
      letterSpacing: 0.3,
    },
    profileButton: {
      position: 'relative',
    },
    profileImage: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    profilePlaceholder: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profilePlaceholderText: {
      color: theme.colors.textOnPrimary,
      fontSize: 18,
      fontWeight: '700',
    },
    notificationButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    notificationIcon: {
      fontSize: 24,
    },
    greetingCard: {
      marginHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      backgroundColor: '#E0F2FE',
      borderRadius: 24,
      padding: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: '#BAE6FD',
      shadowColor: '#0EA5E9',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
      height: 200,
      position: 'relative',
    },
    greetingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#F0F9FF',
      opacity: 0.6,
    },
    greetingContent: {
      width: '55%',
      justifyContent: 'center',
      paddingLeft: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      zIndex: 2,
    },
    userName: {
      fontSize: 24,
      fontWeight: '700',
      color: '#0C4A6E',
      marginBottom: 4,
    },
    greetingTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#0369A1',
      marginBottom: 6,
    },
    greetingQuestion: {
      fontSize: 18,
      fontWeight: '600',
      color: '#075985',
    },
    mascotImage: {
      width: 190,
      height: 190,
      position: 'absolute',
      right: 0,
      bottom: 0,
      zIndex: 2,
    },
    streakContainer: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    section: {
      marginTop: theme.spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    discoverSection: {
      marginTop: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
    },
    discoverHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    discoverTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.text,
    },
    discoverSeeAll: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    discoverScroll: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    discoverCard: {
      width: 280,
      backgroundColor: theme.colors.backgroundCard,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    discoverCardFirst: {
      marginLeft: 0,
    },
    discoverCardImage: {
      width: '100%',
      height: 140,
      backgroundColor: theme.colors.border,
    },
    discoverCardContent: {
      padding: theme.spacing.md,
    },
    discoverCardCategory: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: 8,
      marginBottom: theme.spacing.sm,
    },
    discoverCardCategoryText: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.primary,
      textTransform: 'uppercase',
    },
    discoverCardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      lineHeight: 22,
      marginBottom: theme.spacing.sm,
    },
    discoverCardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    discoverCardTime: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    discoverCardSave: {
      fontSize: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      letterSpacing: 0.3,
    },
    seeAllText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
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
    articlesContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingRight: theme.spacing.xl,
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
    tilesGrid: {
      paddingHorizontal: theme.spacing.lg,
    },
    tilesRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.md,
      gap: theme.spacing.md,
    },
    tileWrapper: {
      flex: 1,
    },
    bottomSpacer: {
      height: 40,
    },
  });
