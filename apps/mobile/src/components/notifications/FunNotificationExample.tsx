import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FunNotificationCard } from './FunNotificationCard';
import { useFunNotifications } from '@/hooks/useFunNotifications';

/**
 * KULLANIM ÖRNEĞİ
 * 
 * Bu component'i home screen'de veya istediğiniz yerde kullanabilirsiniz.
 * 
 * Örnek 1: Otomatik bildirim gösterme
 * <FunNotificationExample 
 *   streakDay={7} 
 *   isPeriodWeek={true}
 *   autoShow={true}
 * />
 * 
 * Örnek 2: Manuel bildirim gösterme
 * const { showNotification, getStreakNotification } = useFunNotifications();
 * const notification = getStreakNotification(7);
 * if (notification) showNotification(notification);
 */

interface FunNotificationExampleProps {
    streakDay?: number;
    dataEntryCount?: number;
    isPeriodWeek?: boolean;
    lastDataEntryHours?: number;
    autoShow?: boolean;
}

export function FunNotificationExample(props: FunNotificationExampleProps) {
    const { currentNotification, dismissNotification, hasPermission, canShowDaily } = useFunNotifications({
        ...props,
        autoShow: props.autoShow ?? true,
    });

    // Debug logs
    if (__DEV__) {
        console.log('[FunNotification] Props:', props);
        console.log('[FunNotification] Has permission:', hasPermission);
        console.log('[FunNotification] Can show daily:', canShowDaily);
        console.log('[FunNotification] Current notification:', currentNotification?.id);
    }

    if (!currentNotification) return null;

    return (
        <View style={styles.container}>
            <FunNotificationCard
                notification={currentNotification}
                onDismiss={dismissNotification}
                onPress={() => {
                    // İsteğe bağlı: Bildirime tıklandığında yapılacak işlem
                    console.log('Notification pressed:', currentNotification.id);
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 12,
    },
});

/**
 * KULLANIM ÖRNEKLERİ:
 * 
 * 1. Home Screen'de otomatik göster:
 * ```tsx
 * import { FunNotificationExample } from '@/components/notifications/FunNotificationExample';
 * 
 * function HomeScreen() {
 *   const { stats } = useGamification();
 *   const { isPeriodWeek } = usePeriodTracking();
 *   
 *   return (
 *     <ScrollView>
 *       <FunNotificationExample
 *         streakDay={stats.currentStreak}
 *         dataEntryCount={stats.totalDataEntries}
 *         isPeriodWeek={isPeriodWeek}
 *         autoShow={true}
 *       />
 *       {/* Diğer componentler *\/}
 *     </ScrollView>
 *   );
 * }
 * ```
 * 
 * 2. Veri girişinden sonra manuel göster:
 * ```tsx
 * import { useFunNotifications } from '@/hooks/useFunNotifications';
 * 
 * function DataEntryScreen() {
 *   const { showNotification, getAchievementNotification } = useFunNotifications();
 *   
 *   const handleDataEntry = async () => {
 *     await saveData();
 *     
 *     // Başarı bildirimi göster
 *     const notification = getAchievementNotification(50);
 *     if (notification) {
 *       showNotification(notification);
 *     }
 *   };
 * }
 * ```
 * 
 * 3. Ayarlar sayfasında:
 * ```tsx
 * import { FunNotificationSettings } from '@/components/settings/FunNotificationSettings';
 * 
 * function SettingsScreen() {
 *   return (
 *     <ScrollView>
 *       <FunNotificationSettings />
 *     </ScrollView>
 *   );
 * }
 * ```
 */
