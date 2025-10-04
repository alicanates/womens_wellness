import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Wait for auth to initialize before redirecting
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/signin" />;
}
