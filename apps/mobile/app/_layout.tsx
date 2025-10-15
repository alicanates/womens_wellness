import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useNotifications } from '../src/hooks/useNotifications';
import { useAuthStore } from '../src/store/authStore';
import { queryClient } from '../src/lib/queryClient';

function AppContent() {
  const { registerForPushNotifications } = useNotifications();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const initialize = useAuthStore((state) => state.initialize);
  const isLoading = useAuthStore((state) => state.isLoading);
  const router = useRouter();

  const [pinCheckComplete, setPinCheckComplete] = useState(false);

  // Register for push notifications when user is authenticated
  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications();
    }
  }, [isAuthenticated, registerForPushNotifications]);

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
