import { Tabs } from 'expo-router';
import { Platform, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.backgroundCard,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          ...Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Takvim',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reminders"
        options={{
          title: 'Hatırlatıcılar',
          tabBarIcon: ({ color }) => <TabBarIcon name="bell" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'NOVA',
          tabBarIcon: ({ color }) => <TabBarIcon name="chatbubble" color={color} />,
        }}
      />
    </Tabs>
  );
}

// Simple icon component (you can replace with actual icons later)
function TabBarIcon(props: { name: string; color: string }) {
  // For now, just render emoji icons
  const icons: Record<string, string> = {
    home: '🏠',
    calendar: '📅',
    bell: '🔔',
    chatbubble: '💬',
  };

  return (
    <Text style={{ fontSize: 24 }}>{icons[props.name] || '•'}</Text>
  );
}
