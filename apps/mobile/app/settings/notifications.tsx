import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useTheme } from '@/hooks/useTheme';

export default function NotificationSettingsScreen() {
    const router = useRouter();
    const theme = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [periodReminders, setPeriodReminders] = useState(true);
    const [pregnancyUpdates, setPregnancyUpdates] = useState(true);
    const [appointmentReminders, setAppointmentReminders] = useState(true);
    const [dailyTips, setDailyTips] = useState(true);
    const [funNotifications, setFunNotifications] = useState(true);
    const [meditationReminders, setMeditationReminders] = useState(false);
    const [waterReminders, setWaterReminders] = useState(false);

    useEffect(() => {
        checkNotificationPermissions();
    }, []);

    const checkNotificationPermissions = async () => {
        const { status } = await Notifications.getPermissionsAsync();
        setNotificationsEnabled(status === 'granted');
    };

    const handleToggleNotifications = async (value: boolean) => {
        if (value) {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status === 'granted') {
                setNotificationsEnabled(true);
            } else {
                Alert.alert(
                    'Bildirim İzni',
                    'Bildirimler için izin vermeniz gerekiyor. Lütfen ayarlardan izin verin.',
                    [
                        { text: 'İptal', style: 'cancel' },
                        {
                            text: 'Ayarlara Git',
                            onPress: () => {
                                if (Platform.OS === 'ios') {
                                    Notifications.requestPermissionsAsync();
                                }
                            },
                        },
                    ]
                );
            }
        } else {
            Alert.alert(
                'Bildirimleri Kapat',
                'Tüm bildirimleri kapatmak istediğinizden emin misiniz?',
                [
                    { text: 'İptal', style: 'cancel' },
                    {
                        text: 'Kapat',
                        style: 'destructive',
                        onPress: () => setNotificationsEnabled(false),
                    },
                ]
            );
        }
    };

    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>‹ Geri</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Bildirim Ayarları</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.container}>
                {/* Master Toggle */}
                <View style={styles.section}>
                    <View style={styles.settingItem}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingTitle}>Bildirimleri Etkinleştir</Text>
                            <Text style={styles.settingDescription}>Tüm bildirimleri aç/kapat</Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={handleToggleNotifications}
                            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                            thumbColor={Platform.OS === 'ios' ? undefined : '#fff'}
                        />
                    </View>
                </View>

                {notificationsEnabled && (
                    <>
                        {/* Period Tracking */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Regl Takibi</Text>
                            <View style={styles.settingItem}>
                                <View style={styles.settingInfo}>
                                    <Text style={styles.settingTitle}>Regl Hatırlatıcıları</Text>
                                    <Text style={styles.settingDescription}>Dönem başlangıcı ve bitiş bildirimleri</Text>
                                </View>
                                <Switch
                                    value={periodReminders}
                                    onValueChange={setPeriodReminders}
                                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                    thumbColor={Platform.OS === 'ios' ? undefined : '#fff'}
                                />
                            </View>
                        </View>

                        {/* Pregnancy */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Hamilelik</Text>
                            <View style={styles.settingItem}>
                                <View style={styles.settingInfo}>
                                    <Text style={styles.settingTitle}>Hamilelik Güncellemeleri</Text>
                                    <Text style={styles.settingDescription}>Haftalık gelişim bildirimleri</Text>
                                </View>
                                <Switch
                                    value={pregnancyUpdates}
                                    onValueChange={setPregnancyUpdates}
                                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                    thumbColor={Platform.OS === 'ios' ? undefined : '#fff'}
                                />
                            </View>

                            <View style={styles.settingItem}>
                                <View style={styles.settingInfo}>
                                    <Text style={styles.settingTitle}>Randevu Hatırlatıcıları</Text>
                                    <Text style={styles.settingDescription}>Doktor randevusu bildirimleri</Text>
                                </View>
                                <Switch
                                    value={appointmentReminders}
                                    onValueChange={setAppointmentReminders}
                                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                    thumbColor={Platform.OS === 'ios' ? undefined : '#fff'}
                                />
                            </View>
                        </View>

                        {/* Wellness */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Sağlık & Wellness</Text>
                            <View style={styles.settingItem}>
                                <View style={styles.settingInfo}>
                                    <Text style={styles.settingTitle}>Günlük İpuçları</Text>
                                    <Text style={styles.settingDescription}>Sağlık ve wellness önerileri</Text>
                                </View>
                                <Switch
                                    value={dailyTips}
                                    onValueChange={setDailyTips}
                                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                    thumbColor={Platform.OS === 'ios' ? undefined : '#fff'}
                                />
                            </View>

                            <View style={styles.settingItem}>
                                <View style={styles.settingInfo}>
                                    <Text style={styles.settingTitle}>Meditasyon Hatırlatıcıları</Text>
                                    <Text style={styles.settingDescription}>Günlük meditasyon önerileri</Text>
                                </View>
                                <Switch
                                    value={meditationReminders}
                                    onValueChange={setMeditationReminders}
                                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                    thumbColor={Platform.OS === 'ios' ? undefined : '#fff'}
                                />
                            </View>

                            <View style={styles.settingItem}>
                                <View style={styles.settingInfo}>
                                    <Text style={styles.settingTitle}>Su İçme Hatırlatıcıları</Text>
                                    <Text style={styles.settingDescription}>Düzenli su içme bildirimleri</Text>
                                </View>
                                <Switch
                                    value={waterReminders}
                                    onValueChange={setWaterReminders}
                                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                    thumbColor={Platform.OS === 'ios' ? undefined : '#fff'}
                                />
                            </View>
                        </View>

                        {/* Fun Notifications */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Eğlence</Text>
                            <View style={styles.settingItem}>
                                <View style={styles.settingInfo}>
                                    <Text style={styles.settingTitle}>😊 Mizahi Bildirimler</Text>
                                    <Text style={styles.settingDescription}>Eğlenceli ve motive edici mesajlar</Text>
                                </View>
                                <Switch
                                    value={funNotifications}
                                    onValueChange={setFunNotifications}
                                    trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                                    thumbColor={Platform.OS === 'ios' ? undefined : '#fff'}
                                />
                            </View>
                        </View>
                    </>
                )}

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoCardIcon}>💡</Text>
                    <View style={styles.infoCardContent}>
                        <Text style={styles.infoCardTitle}>Bildirim İpucu</Text>
                        <Text style={styles.infoCardText}>
                            Bildirimleri istediğiniz zaman ayarlardan özelleştirebilirsiniz. Önemli hatırlatıcıları kaçırmamak için bildirimleri açık tutmanızı öneririz.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        backButton: {
            padding: theme.spacing.xs,
        },
        backButtonText: {
            fontSize: 24,
            color: theme.colors.primary,
            fontWeight: '600',
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.text,
        },
        headerRight: {
            width: 40,
        },
        container: {
            flex: 1,
        },
        section: {
            marginTop: theme.spacing.lg,
            paddingHorizontal: theme.spacing.lg,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
        },
        settingItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        settingInfo: {
            flex: 1,
            marginRight: theme.spacing.md,
        },
        settingTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 4,
        },
        settingDescription: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        infoCard: {
            flexDirection: 'row',
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 12,
            padding: theme.spacing.md,
            margin: theme.spacing.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        infoCardIcon: {
            fontSize: 24,
            marginRight: theme.spacing.md,
        },
        infoCardContent: {
            flex: 1,
        },
        infoCardTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 4,
        },
        infoCardText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            lineHeight: 20,
        },
    });
