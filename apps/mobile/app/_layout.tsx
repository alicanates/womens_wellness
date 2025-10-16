import { useEffect, useState } from 'react';
import { ActivityIndicator, View, AppState, AppStateStatus } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useNotifications } from '../src/hooks/useNotifications';
import { useAuthStore } from '../src/store/authStore';
import { queryClient } from '../src/lib/queryClient';
import { iapManager } from '../src/services/iap.wrapper';
import { subscriptionSyncService } from '../src/services/subscriptionSync';

function AppContent() {
  const { registerForPushNotifications } = useNotifications();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialize = useAuthStore((state) => state.initialize);
  const isLoading = useAuthStore((state) => state.isLoading);
  const router = useRouter();

  const [pinCheckComplete, setPinCheckComplete] = useState(false);

  // Initialize app
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Initialize IAP on app start
  useEffect(() => {
    const initIAP = async () => {
      try {
        console.log('[App] Initializing IAP...');
        await iapManager.initialize();
        console.log('[App] IAP initialized successfully');
      } catch (error) {
        console.error('[App] Failed to initialize IAP:', error);
        // IAP initialization failure is not critical
        // App can still function without IAP
      }
    };

    initIAP();

    // Cleanup on unmount
    return () => {
      iapManager.cleanup().catch(error => {
        console.error('[App] IAP cleanup failed:', error);
      });
    };
  }, []);

  // Register for push notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications();
    }
  }, [isAuthenticated, registerForPushNotifications]);

  // Sync subscription status on app start
  // Requirement 14.1: THE System SHALL abonelik durumunu sunucuda saklar
  // Requirement 14.2: WHEN kullanıcı farklı cihazda oturum açtığında, 
  //                   THE System SHALL abonelik durumunu senkronize eder
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('[App] Syncing subscription status on app start...');
      subscriptionSyncService.syncSubscriptionStatus().catch((error) => {
        console.error('[App] Failed to sync subscription on start:', error);
      });
    }
  }, [isAuthenticated, isLoading]);

  // Handle app state changes (foreground/background)
  // Sync subscription when app comes to foreground
  // Requirement 14.4: THE System SHALL kullanıcının tüm cihazlarında premium erişimi sağlar
  // Requirement 14.5: WHEN abonelik durumu değiştiğinde, THE System SHALL tüm cihazları günceller
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground, check if we should sync
        if (subscriptionSyncService.shouldSync()) {
          console.log('[App] App foregrounded, syncing subscription...');
          subscriptionSyncService.syncSubscriptionStatus().catch((error) => {
            console.error('[App] Failed to sync subscription on foreground:', error);
          });
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  // Check for PIN lock ONLY on app start (once)
  useEffect(() => {
    const checkPinLock = async () => {
      if (!isAuthenticated || isLoading) {
        setPinCheckComplete(true);
        return;
      }

      try {
        const pinEnabled = await SecureStore.getItemAsync('pinEnabled');
        const pinVerified = await SecureStore.getItemAsync('pinVerified');

        if (pinEnabled === 'true' && pinVerified !== 'true') {
          // PIN is enabled but not verified - redirect to pin-lock
          router.replace('/pin-lock');
        }
      } catch (error) {
        console.error('PIN check error:', error);
      } finally {
        setPinCheckComplete(true);
      }
    };

    checkPinLock();
    // Only run once when isAuthenticated becomes true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isLoading]);

  if (isLoading || !pinCheckComplete) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
