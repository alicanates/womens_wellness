import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { FunNotificationSettings } from '@/components/settings/FunNotificationSettings';

export default function FunNotificationsScreen() {
    const router = useRouter();
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>‹ Geri</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mizahi Bildirimler</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <FunNotificationSettings />

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>ℹ️ Bilgi</Text>
                    <Text style={styles.infoText}>
                        Mizahi bildirimler, streak hatırlatmaları, motivasyon mesajları ve regl dönemi desteği ile sizi motive eder.
                    </Text>
                    <Text style={styles.infoText}>
                        Bildirim sıklığını ve türlerini istediğiniz gibi özelleştirebilirsiniz.
                    </Text>
                </View>

                {/* Examples Section */}
                <View style={styles.examplesSection}>
                    <Text style={styles.examplesTitle}>📝 Örnek Mesajlar</Text>

                    <View style={styles.exampleCard}>
                        <Text style={styles.exampleEmoji}>🔥</Text>
                        <Text style={styles.exampleTitle}>Streak Bildirimi</Text>
                        <Text style={styles.exampleMessage}>
                            "7 gün streak! Netflix dizisi bitirme hızınla aynı! 🎬"
                        </Text>
                    </View>

                    <View style={styles.exampleCard}>
                        <Text style={styles.exampleEmoji}>💪</Text>
                        <Text style={styles.exampleTitle}>Motivasyon</Text>
                        <Text style={styles.exampleMessage}>
                            "Bugün de harika gidiyorsun! Streak'in seni bekliyor! 🔥"
                        </Text>
                    </View>

                    <View style={styles.exampleCard}>
                        <Text style={styles.exampleEmoji}>💕</Text>
                        <Text style={styles.exampleTitle}>Regl Dönemi Desteği</Text>
                        <Text style={styles.exampleMessage}>
                            "Yanındayız! Kendine ekstra iyi bak! 🌸"
                        </Text>
                    </View>

                    <View style={styles.exampleCard}>
                        <Text style={styles.exampleEmoji}>🎮</Text>
                        <Text style={styles.exampleTitle}>Başarı</Text>
                        <Text style={styles.exampleMessage}>
                            "50 veri girişi! Veri bilimci olma yolunda! 📊"
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        backgroundColor: theme.colors.backgroundCard,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border + '30',
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 18,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    placeholder: {
        width: 50,
    },
    content: {
        flex: 1,
    },
    infoSection: {
        margin: 16,
        padding: 16,
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.primary + '20',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        lineHeight: 20,
        marginBottom: 8,
    },
    examplesSection: {
        margin: 16,
        marginTop: 0,
    },
    examplesTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 16,
    },
    exampleCard: {
        backgroundColor: theme.colors.backgroundCard,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border + '30',
    },
    exampleEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    exampleTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 6,
    },
    exampleMessage: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        lineHeight: 20,
        fontStyle: 'italic',
    },
});
