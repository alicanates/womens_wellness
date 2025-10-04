import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { remindersService } from '../services/api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationData {
  screen?: string;
  reminderId?: string;
  [key: string]: any;
}

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const router = useRouter();

  // Request permissions
  async function requestPermissions() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus as any);

      if (finalStatus !== 'granted') {
        console.warn('Push notification permissions not granted');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  // Register for push notifications
  async function registerForPushNotifications() {
    try {
      // Request permissions first
      const granted = await requestPermissions();
      if (!granted) return null;

      // Get Expo push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID || 'wellness-app', // fallback for dev
      });

      setExpoPushToken(token.data);

      // Register token with backend
      try {
        await remindersService.registerPushToken(token.data);
        console.log('Push token registered with backend:', token.data);
      } catch (error) {
        console.error('Failed to register push token with backend:', error);
      }

      // Configure Android channel (required for Android 8+)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Hatırlatıcılar',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      return token.data;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  // Handle notification received while app is in foreground
  function handleNotificationReceived(notification: Notifications.Notification) {
    console.log('Notification received:', notification);
    // You can show custom UI here or let the default notification show
  }

  // Handle notification tap (deep linking)
  function handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data as NotificationData;
    console.log('Notification tapped:', data);

    // Route to appropriate screen based on notification data
    if (data.screen) {
      switch (data.screen) {
        case 'reminders':
          router.push('/(tabs)/reminders');
          break;
        case 'calendar':
          router.push('/(tabs)/calendar');
          break;
        case 'chat':
          router.push('/(tabs)/chat');
          break;
        case 'home':
        default:
          router.push('/(tabs)/home');
          break;
      }
    }

    // If specific reminder ID is provided, you can navigate to detail view
    if (data.reminderId) {
      // TODO: Navigate to reminder detail if we add that screen
      console.log('Reminder ID:', data.reminderId);
    }
  }

  // Schedule a local notification (for testing or offline reminders)
  async function scheduleLocalNotification(
    title: string,
    body: string,
    data?: NotificationData,
    trigger?: Notifications.NotificationTriggerInput
  ) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: 'default',
        },
        trigger: trigger || null, // null = show immediately
      });
      return id;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      return null;
    }
  }

  // Cancel a scheduled notification
  async function cancelNotification(notificationId: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  // Get all scheduled notifications
  async function getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Setup listeners on mount
  useEffect(() => {
    // Listener for notifications received while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(
      handleNotificationReceived
    );

    // Listener for user tapping on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    // Cleanup listeners on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return {
    expoPushToken,
    permissionStatus,
    requestPermissions,
    registerForPushNotifications,
    scheduleLocalNotification,
    cancelNotification,
    getScheduledNotifications,
  };
}
