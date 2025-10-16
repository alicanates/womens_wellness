import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { ZODIAC_SIGNS, ZodiacSign, calculateCompatibility } from '@/utils/astrology';

export default function CompatibilityScreen() {
    const theme = useTheme();
    const router = useRouter();
    const [sign1, setSign1] = useState<ZodiacSign | null>(null);
    const [sign2, setSign2] = useState<ZodiacSign | null>(null);
    const [showResult, setShowResult] = useState(false);

    const styles = createStyles(theme);

    const allSigns: ZodiacSign[] = [
        'aries', 'taurus', 'gemini', 'cancer',
        'leo', 'virgo', 'libra', 'scorpio',
        'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];

    const handleCalculate = () => {
        if (sign1 && sign2) {
            setShowResult(true);
        }
    };

    const compatibility = sign1 && sign2 ? calculateCompatibility(sign1, sign2) : 0;

    const getCompatibilityMessage = (score: number) => {
        if (score >= 80) return 'Mükemmel Uyum! 💖';
        if (score >= 70) return 'Çok İyi Uyum! 💕';
        if (score >= 60) return 'İyi Uyum! 💗';
        if (score >= 50) return 'Orta Uyum 💛';
        return 'Zor Uyum 💙';
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Aşk Uyum Hesaplayıcı</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Description */}
                <View style={styles.description}>
                    <Text style={styles.descriptionText}>
                        İki burç arasındaki aşk uyumunu keşfedin. Burçları seçin ve uyum oranınızı görün!
                    </Text>
                </View>

                {/* Sign 1 Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Birinci Burç</Text>
                    <View style={styles.zodiacGrid}>
                        {allSigns.map((sign) => {
                            const info = ZODIAC_SIGNS[sign];
                            const isSelected = sign1 === sign;
                            return (
                                <TouchableOpacity
                                    key={sign}
                                    style={[
                                        styles.zodiacCard,
                                        { borderColor: info.color },
                                        isSelected && { backgroundColor: info.color + '30' }
                                    ]}
                                    onPress={() => {
                                        setSign1(sign);
                                        setShowResult(false);
                                    }}
                                >
                                    <Text style={styles.zodiacCardEmoji}>{info.emoji}</Text>
                                    <Text style={styles.zodiacCardName}>{info.nameTr}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Sign 2 Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>İkinci Burç</Text>
                    <View style={styles.zodiacGrid}>
                        {allSigns.map((sign) => {
                            const info = ZODIAC_SIGNS[sign];
                            const isSelected = sign2 === sign;
                            return (
                                <TouchableOpacity
                                    key={sign}
                                    style={[
                                        styles.zodiacCard,
                                        { borderColor: info.color },
                                        isSelected && { backgroundColor: info.color + '30' }
                                    ]}
                                    onPress={() => {
                                        setSign2(sign);
                                        setShowResult(false);
                                    }}
                                >
                                    <Text style={styles.zodiacCardEmoji}>{info.emoji}</Text>
                                    <Text style={styles.zodiacCardName}>{info.nameTr}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Calculate Button */}
                {sign1 && sign2 && !showResult && (
                    <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
                        <Text style={styles.calculateButtonText}>Uyumu Hesapla</Text>
                    </TouchableOpacity>
                )}

                {/* Result */}
                {showResult && sign1 && sign2 && (
                    <View style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <Text style={styles.resultEmoji}>
                                {ZODIAC_SIGNS[sign1].emoji} 💕 {ZODIAC_SIGNS[sign2].emoji}
                            </Text>
                            <Text style={styles.resultTitle}>
                                {ZODIAC_SIGNS[sign1].nameTr} & {ZODIAC_SIGNS[sign2].nameTr}
                            </Text>
                        </View>

                        <View style={styles.scoreContainer}>
                            <Text style={styles.scoreLabel}>Uyum Oranı</Text>
                            <Text style={styles.scoreValue}>%{compatibility}</Text>
                            <Text style={styles.scoreMessage}>{getCompatibilityMessage(compatibility)}</Text>
                        </View>

                        <View style={styles.resultContent}>
                            <Text style={styles.resultText}>
                                {compatibility >= 70
                                    ? 'Bu iki burç harika bir uyum sergiliyor! Birbirinizi anlıyor ve destekliyorsunuz.'
                                    : compatibility >= 50
                                        ? 'Orta düzeyde bir uyum var. İletişim ve anlayış ile güzel bir ilişki kurabilirsiniz.'
                                        : 'Farklılıklarınız olsa da, karşılıklı saygı ve anlayış ile güzel bir ilişki mümkün.'}
                            </Text>
                        </View>
                    </View>
                )}

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
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.text,
        },
        headerSpacer: {
            width: 40,
        },
        description: {
            paddingHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.lg,
        },
        descriptionText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            lineHeight: 20,
        },
        section: {
            marginBottom: theme.spacing.xl,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.text,
            paddingHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.md,
        },
        zodiacGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.sm,
        },
        zodiacCard: {
            width: '22%',
            aspectRatio: 1,
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 12,
            borderWidth: 2,
            padding: theme.spacing.xs,
            justifyContent: 'center',
            alignItems: 'center',
        },
        zodiacCardEmoji: {
            fontSize: 24,
            marginBottom: 4,
        },
        zodiacCardName: {
            fontSize: 11,
            fontWeight: '600',
            color: theme.colors.text,
            textAlign: 'center',
        },
        calculateButton: {
            marginHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.xl,
            backgroundColor: theme.colors.primary,
            paddingVertical: theme.spacing.md,
            borderRadius: 12,
            alignItems: 'center',
        },
        calculateButtonText: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.textOnPrimary,
        },
        resultCard: {
            marginHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.xl,
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 20,
            padding: theme.spacing.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        resultHeader: {
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
        },
        resultEmoji: {
            fontSize: 48,
            marginBottom: theme.spacing.sm,
        },
        resultTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.text,
        },
        scoreContainer: {
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
            paddingVertical: theme.spacing.lg,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: theme.colors.border,
        },
        scoreLabel: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.xs,
        },
        scoreValue: {
            fontSize: 48,
            fontWeight: '700',
            color: theme.colors.primary,
            marginBottom: theme.spacing.xs,
        },
        scoreMessage: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text,
        },
        resultContent: {
            paddingTop: theme.spacing.md,
        },
        resultText: {
            fontSize: 15,
            lineHeight: 22,
            color: theme.colors.text,
            textAlign: 'center',
        },
        bottomSpacer: {
            height: 40,
        },
    });
