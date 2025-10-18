import { View, Text, StyleSheet, ScrollView, Switch, ActivityIndicator, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { useQnaNotificationPreferences } from '@/hooks/useQnaNotificationPreferences';
import { QnaNotificationPreferences } from '@/services/qnaNotificationService';
import { useState, useEffect } from 'react';

interface PreferenceItem {
    key: keyof QnaNotificationPreferences;
    title: string;
    description: string;
}

const preferenceItems: PreferenceItem[] = [
    {
        key: 'newAnswers',
        title: 'Yeni Cevaplar',
        description: 'Sorularınıza yeni cevap geldiğinde bildirim alın',
    },
    {
        key: 'answerVotes',
        title: 'Cevap Oyları',
        description: 'Cevaplarınız oy aldığında bildirim alın',
    },
    {
        key: 'bestAnswerSelected',
        title: 'En İyi Cevap',
        description: 'Cevabınız en iyi cevap seçildiğinde bildirim alın',
    },
    {
        key: 'comments',
        title: 'Yorumlar',
        description: 'Sorularınıza veya cevaplarınıza yorum yapıldığında bildirim alın',
    },
    {
        key: 'followedContent',
        title: 'Takip Edilen İçerik',
        description: 'Takip ettiğiniz sorulara ve kullanıcılara ait güncellemeler',
    },
    {
        key: 'badgesEarned',
        title: 'Rozetler',
        description: 'Yeni rozet kazandığınızda bildirim alın',
    },
];

export default function NotificationPreferencesScreen() {
    const { preferences, isLoading, updatePreferences, isUpdating } = useQnaNotificationPreferences();
    const [localPreferences, setLocalPreferences] = useState<QnaNotificationPreferences | null>(null);

    // Initialize local state when preferences load
    useEffect(() => {
        if (preferences) {
            setLocalPreferences(preferences);
        }
    }, [preferences]);

    const handleToggle = (key: keyof QnaNotificationPreferences, value: boolean) => {
        if (!localPreferences) return;

        // Update local state immediately for responsive UI
        setLocalPreferences((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                [key]: value,
            };
        });

        // Update on server
        updatePreferences(
            { [key]: value },
            {
                onError: () => {
                    // Revert on error
                    setLocalPreferences((prev) => {
                        if (!prev) return prev;
                        return {
                            ...prev,
                            [key]: !value,
                        };
                    });
                    Alert.alert('Hata', 'Ayarlar güncellenemedi. Lütfen tekrar deneyin.');
                },
            }
        );
    };

    if (isLoading || !localPreferences) {
        return (
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        title: 'Bildirim Tercihleri',
                        headerShown: true,
                    }}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Bildirim Tercihleri',
                    headerShown: true,
                }}
            />
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Topluluk Bildirimleri</Text>
                    <Text style={styles.headerDescription}>
                        Hangi topluluk aktivitelerinden bildirim almak istediğinizi seçin
                    </Text>
                </View>

                <View style={styles.preferencesContainer}>
                    {preferenceItems.map((item, index) => (
                        <View
                            key={item.key}
                            style={[
                                styles.preferenceItem,
                                index === preferenceItems.length - 1 && styles.lastItem,
                            ]}
                        >
                            <View style={styles.preferenceInfo}>
                                <Text style={styles.preferenceTitle}>{item.title}</Text>
                                <Text style={styles.preferenceDescription}>{item.description}</Text>
                            </View>
                            <Switch
                                value={localPreferences[item.key]}
                                onValueChange={(value) => handleToggle(item.key, value)}
                                disabled={isUpdating}
                                trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        💡 Bildirimleri tamamen kapatmak için cihaz ayarlarınızdan uygulama bildirimlerini
                        devre dışı bırakabilirsiniz.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingBottom: 32,
    },
    header: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000000',
        marginBottom: 8,
    },
    headerDescription: {
        fontSize: 15,
        color: '#8E8E93',
        lineHeight: 20,
    },
    preferencesContainer: {
        marginTop: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E5EA',
    },
    preferenceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    lastItem: {
        borderBottomWidth: 0,
    },
    preferenceInfo: {
        flex: 1,
        marginRight: 16,
    },
    preferenceTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 4,
    },
    preferenceDescription: {
        fontSize: 14,
        color: '#8E8E93',
        lineHeight: 18,
    },
    footer: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    footerText: {
        fontSize: 13,
        color: '#8E8E93',
        lineHeight: 18,
        textAlign: 'center',
    },
});
