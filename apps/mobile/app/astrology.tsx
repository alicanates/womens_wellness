import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { getZodiacSign, ZODIAC_SIGNS, ZodiacSign } from '@/utils/astrology';

type Period = 'daily' | 'weekly' | 'monthly';

export default function AstrologyScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { user } = useAuthStore();
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('daily');

    // Get user's zodiac sign from birth date
    const userBirthDate = user?.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth) : null;
    const userZodiacSign = userBirthDate ? getZodiacSign(userBirthDate) : null;
    const userZodiacInfo = userZodiacSign ? ZODIAC_SIGNS[userZodiacSign] : null;

    const styles = createStyles(theme);

    const allSigns: ZodiacSign[] = [
        'aries', 'taurus', 'gemini', 'cancer',
        'leo', 'virgo', 'libra', 'scorpio',
        'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Astroloji</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* User's Zodiac Card */}
                {userZodiacInfo ? (
                    <View style={[styles.userZodiacCard, { backgroundColor: userZodiacInfo.color + '20' }]}>
                        <View style={styles.userZodiacHeader}>
                            <Text style={styles.userZodiacEmoji}>{userZodiacInfo.emoji}</Text>
                            <View style={styles.userZodiacInfo}>
                                <Text style={styles.userZodiacName}>{userZodiacInfo.nameTr}</Text>
                                <Text style={styles.userZodiacDates}>{userZodiacInfo.dates}</Text>
                            </View>
                        </View>
                        <View style={styles.userZodiacContent}>
                            <Text style={styles.userZodiacLabel}>Bugünün Yorumu</Text>
                            <Text style={styles.userZodiacHoroscope}>
                                Bugün enerjiniz yüksek! Yeni başlangıçlar için harika bir gün.
                                Sevdiklerinizle kaliteli zaman geçirmeye özen gösterin.
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.noBirthDateCard}>
                        <Text style={styles.noBirthDateEmoji}>📅</Text>
                        <Text style={styles.noBirthDateTitle}>Doğum Tarihinizi Ekleyin</Text>
                        <Text style={styles.noBirthDateText}>
                            Kişisel burç yorumlarınızı görmek için profilinize doğum tarihinizi ekleyin.
                        </Text>
                        <TouchableOpacity
                            style={styles.noBirthDateButton}
                            onPress={() => router.push('/settings')}
                        >
                            <Text style={styles.noBirthDateButtonText}>Profile Git</Text>
                        </TouchableOpacity>
                    </View>
                )}

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

                {/* All Zodiac Signs */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tüm Burçlar</Text>
                    <View style={styles.zodiacGrid}>
                        {allSigns.map((sign) => {
                            const info = ZODIAC_SIGNS[sign];
                            return (
                                <TouchableOpacity
                                    key={sign}
                                    style={[styles.zodiacCard, { borderColor: info.color }]}
                                    onPress={() => router.push(`/astrology/${sign}`)}
                                >
                                    <Text style={styles.zodiacCardEmoji}>{info.emoji}</Text>
                                    <Text style={styles.zodiacCardName}>{info.nameTr}</Text>
                                    <Text style={styles.zodiacCardDates}>{info.dates}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Tools Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Araçlar</Text>

                    <TouchableOpacity
                        style={styles.toolCard}
                        onPress={() => router.push('/astrology/compatibility')}
                    >
                        <View style={styles.toolCardIcon}>
                            <Text style={styles.toolCardEmoji}>💕</Text>
                        </View>
                        <View style={styles.toolCardContent}>
                            <Text style={styles.toolCardTitle}>Aşk Uyum Hesaplayıcı</Text>
                            <Text style={styles.toolCardDescription}>
                                İki burç arasındaki uyumu keşfedin
                            </Text>
                        </View>
                        <Text style={styles.toolCardArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.toolCard}
                        onPress={() => router.push('/astrology/birth-chart')}
                    >
                        <View style={styles.toolCardIcon}>
                            <Text style={styles.toolCardEmoji}>🌟</Text>
                        </View>
                        <View style={styles.toolCardContent}>
                            <Text style={styles.toolCardTitle}>Doğum Haritası</Text>
                            <Text style={styles.toolCardDescription}>
                                Detaylı astrolojik analizinizi görün
                            </Text>
                        </View>
                        <Text style={styles.toolCardArrow}>→</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
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
        userZodiacCard: {
            marginHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
            borderRadius: 20,
            padding: theme.spacing.lg,
            borderWidth: 2,
            borderColor: theme.colors.border,
        },
        userZodiacHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        userZodiacEmoji: {
            fontSize: 48,
            marginRight: theme.spacing.md,
        },
        userZodiacInfo: {
            flex: 1,
        },
        userZodiacName: {
            fontSize: 24,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: 4,
        },
        userZodiacDates: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        userZodiacContent: {
            marginTop: theme.spacing.sm,
        },
        userZodiacLabel: {
            fontSize: 12,
            fontWeight: '600',
            color: theme.colors.textSecondary,
            textTransform: 'uppercase',
            marginBottom: theme.spacing.sm,
        },
        userZodiacHoroscope: {
            fontSize: 15,
            lineHeight: 22,
            color: theme.colors.text,
        },
        noBirthDateCard: {
            marginHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 20,
            padding: theme.spacing.xl,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: theme.colors.border,
        },
        noBirthDateEmoji: {
            fontSize: 48,
            marginBottom: theme.spacing.md,
        },
        noBirthDateTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
            textAlign: 'center',
        },
        noBirthDateText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            lineHeight: 20,
            marginBottom: theme.spacing.lg,
        },
        noBirthDateButton: {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.md,
            borderRadius: 12,
        },
        noBirthDateButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.textOnPrimary,
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
            backgroundColor: theme.colors.primary,
        },
        periodButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.textSecondary,
        },
        periodButtonTextActive: {
            color: theme.colors.textOnPrimary,
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
        zodiacGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.md,
        },
        zodiacCard: {
            width: '30%',
            aspectRatio: 1,
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 16,
            borderWidth: 2,
            padding: theme.spacing.sm,
            justifyContent: 'center',
            alignItems: 'center',
        },
        zodiacCardEmoji: {
            fontSize: 32,
            marginBottom: theme.spacing.xs,
        },
        zodiacCardName: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
            textAlign: 'center',
            marginBottom: 2,
        },
        zodiacCardDates: {
            fontSize: 10,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
        toolCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.backgroundCard,
            marginHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.md,
            padding: theme.spacing.md,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        toolCardIcon: {
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: theme.colors.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.md,
        },
        toolCardEmoji: {
            fontSize: 28,
        },
        toolCardContent: {
            flex: 1,
        },
        toolCardTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 4,
        },
        toolCardDescription: {
            fontSize: 13,
            color: theme.colors.textSecondary,
        },
        toolCardArrow: {
            fontSize: 20,
            color: theme.colors.textSecondary,
        },
        bottomSpacer: {
            height: 40,
        },
    });
