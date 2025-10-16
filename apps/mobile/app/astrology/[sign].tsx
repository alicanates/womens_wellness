import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { ZODIAC_SIGNS, ZodiacSign } from '@/utils/astrology';

type Period = 'daily' | 'weekly' | 'monthly';

export default function ZodiacDetailScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { sign } = useLocalSearchParams<{ sign: string }>();
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('daily');

    const zodiacSign = sign as ZodiacSign;
    const zodiacInfo = ZODIAC_SIGNS[zodiacSign];

    if (!zodiacInfo) {
        return null;
    }

    const styles = createStyles(theme, zodiacInfo.color);

    const horoscopes = {
        daily: 'Bugün enerjiniz yüksek! Yeni fırsatlar kapınızı çalabilir. Sevdiklerinizle kaliteli zaman geçirmeye özen gösterin. Finansal konularda dikkatli olun.',
        weekly: 'Bu hafta kariyerinizde önemli gelişmeler yaşanabilir. Pazartesi ve Salı günleri özellikle verimli geçecek. Hafta sonu kendinize zaman ayırın ve dinlenin.',
        monthly: 'Bu ay sizin için dönüşüm ayı olacak. Yeni projeler başlatmak için ideal bir dönem. Ay ortasında önemli bir karar vermeniz gerekebilir. Sağlığınıza dikkat edin.',
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>{zodiacInfo.nameTr}</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Zodiac Header Card */}
                <View style={styles.zodiacHeader}>
                    <Text style={styles.zodiacEmoji}>{zodiacInfo.emoji}</Text>
                    <Text style={styles.zodiacName}>{zodiacInfo.nameTr}</Text>
                    <Text style={styles.zodiacDates}>{zodiacInfo.dates}</Text>
                    <View style={styles.elementBadge}>
                        <Text style={styles.elementText}>
                            {zodiacInfo.element === 'fire' && '🔥 Ateş'}
                            {zodiacInfo.element === 'earth' && '🌍 Toprak'}
                            {zodiacInfo.element === 'air' && '💨 Hava'}
                            {zodiacInfo.element === 'water' && '🌊 Su'}
                        </Text>
                    </View>
                </View>

                {/* Period Selector */}
                <View style={styles.periodSelector}>
                    <TouchableOpacity
                        style={[styles.periodButton, selectedPeriod === 'daily' && styles.periodButtonActive]}
                        onPress={() => setSelectedPeriod('daily')}
                    >
                        <Text style={[styles.periodButtonText, selectedPeriod === 'daily' && styles.periodButtonTextActive]}>
                            Günlük
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.periodButton, selectedPeriod === 'weekly' && styles.periodButtonActive]}
                        onPress={() => setSelectedPeriod('weekly')}
                    >
                        <Text style={[styles.periodButtonText, selectedPeriod === 'weekly' && styles.periodButtonTextActive]}>
                            Haftalık
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.periodButton, selectedPeriod === 'monthly' && styles.periodButtonActive]}
                        onPress={() => setSelectedPeriod('monthly')}
                    >
                        <Text style={[styles.periodButtonText, selectedPeriod === 'monthly' && styles.periodButtonTextActive]}>
                            Aylık
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Horoscope Content */}
                <View style={styles.horoscopeCard}>
                    <Text style={styles.horoscopeTitle}>
                        {selectedPeriod === 'daily' && 'Günlük Yorum'}
                        {selectedPeriod === 'weekly' && 'Haftalık Yorum'}
                        {selectedPeriod === 'monthly' && 'Aylık Yorum'}
                    </Text>
                    <Text style={styles.horoscopeText}>{horoscopes[selectedPeriod]}</Text>
                </View>

                {/* Characteristics */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Genel Özellikler</Text>
                    <View style={styles.characteristicsCard}>
                        <View style={styles.characteristicRow}>
                            <Text style={styles.characteristicLabel}>💪 Güçlü Yönler</Text>
                            <Text style={styles.characteristicValue}>
                                {zodiacSign === 'aries' && 'Cesur, enerjik, lider'}
                                {zodiacSign === 'taurus' && 'Güvenilir, sabırlı, pratik'}
                                {zodiacSign === 'gemini' && 'Zeki, iletişim yeteneği, uyumlu'}
                                {zodiacSign === 'cancer' && 'Duygusal, koruyucu, sadık'}
                                {zodiacSign === 'leo' && 'Özgüvenli, cömert, yaratıcı'}
                                {zodiacSign === 'virgo' && 'Detaycı, analitik, yardımsever'}
                                {zodiacSign === 'libra' && 'Dengeli, diplomatik, adil'}
                                {zodiacSign === 'scorpio' && 'Tutkulu, kararlı, derin'}
                                {zodiacSign === 'sagittarius' && 'İyimser, özgür, maceracı'}
                                {zodiacSign === 'capricorn' && 'Disiplinli, sorumlu, hırslı'}
                                {zodiacSign === 'aquarius' && 'Özgün, vizyoner, insancıl'}
                                {zodiacSign === 'pisces' && 'Empatik, yaratıcı, sezgisel'}
                            </Text>
                        </View>
                        <View style={styles.characteristicRow}>
                            <Text style={styles.characteristicLabel}>🎯 Gelişim Alanları</Text>
                            <Text style={styles.characteristicValue}>
                                {zodiacSign === 'aries' && 'Sabır, empati'}
                                {zodiacSign === 'taurus' && 'Esneklik, değişime açıklık'}
                                {zodiacSign === 'gemini' && 'Odaklanma, derinlik'}
                                {zodiacSign === 'cancer' && 'Sınır koyma, bağımsızlık'}
                                {zodiacSign === 'leo' && 'Alçakgönüllülük, dinleme'}
                                {zodiacSign === 'virgo' && 'Mükemmeliyetçilik, eleştiri'}
                                {zodiacSign === 'libra' && 'Kararlılık, kendi ihtiyaçları'}
                                {zodiacSign === 'scorpio' && 'Güven, bağışlama'}
                                {zodiacSign === 'sagittarius' && 'Sorumluluk, detay'}
                                {zodiacSign === 'capricorn' && 'Esneklik, duygusallık'}
                                {zodiacSign === 'aquarius' && 'Duygusal bağ, yakınlık'}
                                {zodiacSign === 'pisces' && 'Sınır koyma, gerçekçilik'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>, accentColor: string) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        container: {
            flex: 1,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
        },
        backButton: {
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
        },
        backIcon: {
            fontSize: 24,
            color: theme.colors.text,
        },
        title: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.text,
        },
        headerSpacer: {
            width: 40,
        },
        zodiacHeader: {
            marginHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
            backgroundColor: accentColor + '20',
            borderRadius: 20,
            padding: theme.spacing.xl,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: accentColor + '40',
        },
        zodiacEmoji: {
            fontSize: 72,
            marginBottom: theme.spacing.md,
        },
        zodiacName: {
            fontSize: 28,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: theme.spacing.xs,
        },
        zodiacDates: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.md,
        },
        elementBadge: {
            backgroundColor: accentColor + '30',
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.xs,
            borderRadius: 20,
        },
        elementText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
        },
        periodSelector: {
            flexDirection: 'row',
            marginHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 12,
            padding: 4,
        },
        periodButton: {
            flex: 1,
            paddingVertical: theme.spacing.sm,
            borderRadius: 8,
            alignItems: 'center',
        },
        periodButtonActive: {
            backgroundColor: accentColor,
        },
        periodButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.textSecondary,
        },
        periodButtonTextActive: {
            color: '#FFFFFF',
        },
        horoscopeCard: {
            marginHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 16,
            padding: theme.spacing.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        horoscopeTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: theme.spacing.md,
        },
        horoscopeText: {
            fontSize: 15,
            lineHeight: 24,
            color: theme.colors.text,
        },
        section: {
            marginBottom: theme.spacing.xl,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.text,
            paddingHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.md,
        },
        characteristicsCard: {
            marginHorizontal: theme.spacing.lg,
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 16,
            padding: theme.spacing.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        characteristicRow: {
            marginBottom: theme.spacing.md,
        },
        characteristicLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: theme.spacing.xs,
        },
        characteristicValue: {
            fontSize: 14,
            lineHeight: 20,
            color: theme.colors.textSecondary,
        },
        bottomSpacer: {
            height: 40,
        },
    });
