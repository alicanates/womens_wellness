import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { getZodiacSign, ZODIAC_SIGNS } from '@/utils/astrology';

export default function BirthChartScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { user } = useAuthStore();

    const [birthDate, setBirthDate] = useState(
        user?.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth) : new Date()
    );
    const [birthDateInput, setBirthDateInput] = useState(
        birthDate.toLocaleDateString('tr-TR')
    );
    const [birthTime, setBirthTime] = useState('12:00');
    const [birthPlace, setBirthPlace] = useState('');
    const [showChart, setShowChart] = useState(false);

    const handleDateInputChange = (text: string) => {
        setBirthDateInput(text);
        // Try to parse the date (format: DD.MM.YYYY or DD/MM/YYYY)
        const parts = text.split(/[./]/);
        if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1;
            const year = parseInt(parts[2]);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                const newDate = new Date(year, month, day);
                if (!isNaN(newDate.getTime())) {
                    setBirthDate(newDate);
                }
            }
        }
    };

    const styles = createStyles(theme);

    const zodiacSign = getZodiacSign(birthDate);
    const zodiacInfo = ZODIAC_SIGNS[zodiacSign];

    // Mock rising and moon signs (in real app, calculate based on time and place)
    const risingSign = 'leo';
    const moonSign = 'cancer';

    const handleCalculate = () => {
        if (birthPlace.trim()) {
            setShowChart(true);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Doğum Haritası</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Description */}
                <View style={styles.description}>
                    <Text style={styles.descriptionText}>
                        Doğum tarihiniz, saatiniz ve yerinize göre detaylı astrolojik analizinizi görün.
                    </Text>
                </View>

                {/* Input Form */}
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Doğum Tarihi</Text>
                        <TextInput
                            style={styles.input}
                            value={birthDateInput}
                            onChangeText={handleDateInputChange}
                            placeholder="GG.AA.YYYY (Örn: 15.03.1990)"
                            placeholderTextColor={theme.colors.textSecondary}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Doğum Saati</Text>
                        <TextInput
                            style={styles.input}
                            value={birthTime}
                            onChangeText={setBirthTime}
                            placeholder="Örn: 14:30"
                            placeholderTextColor={theme.colors.textSecondary}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Doğum Yeri</Text>
                        <TextInput
                            style={styles.input}
                            value={birthPlace}
                            onChangeText={setBirthPlace}
                            placeholder="Şehir adı girin"
                            placeholderTextColor={theme.colors.textSecondary}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.calculateButton, !birthPlace.trim() && styles.calculateButtonDisabled]}
                        onPress={handleCalculate}
                        disabled={!birthPlace.trim()}
                    >
                        <Text style={styles.calculateButtonText}>Haritayı Oluştur</Text>
                    </TouchableOpacity>
                </View>

                {/* Birth Chart Result */}
                {showChart && (
                    <View style={styles.chartContainer}>
                        {/* Sun Sign */}
                        <View style={[styles.chartCard, { borderColor: zodiacInfo.color }]}>
                            <View style={styles.chartCardHeader}>
                                <Text style={styles.chartCardEmoji}>{zodiacInfo.emoji}</Text>
                                <View style={styles.chartCardInfo}>
                                    <Text style={styles.chartCardLabel}>Güneş Burcunuz</Text>
                                    <Text style={styles.chartCardValue}>{zodiacInfo.nameTr}</Text>
                                </View>
                            </View>
                            <Text style={styles.chartCardDescription}>
                                Kişiliğinizin temeli. Kim olduğunuzu ve nasıl davrandığınızı gösterir.
                            </Text>
                        </View>

                        {/* Rising Sign */}
                        <View style={[styles.chartCard, { borderColor: ZODIAC_SIGNS[risingSign].color }]}>
                            <View style={styles.chartCardHeader}>
                                <Text style={styles.chartCardEmoji}>{ZODIAC_SIGNS[risingSign].emoji}</Text>
                                <View style={styles.chartCardInfo}>
                                    <Text style={styles.chartCardLabel}>Yükselen Burcunuz</Text>
                                    <Text style={styles.chartCardValue}>{ZODIAC_SIGNS[risingSign].nameTr}</Text>
                                </View>
                            </View>
                            <Text style={styles.chartCardDescription}>
                                Dış görünüşünüz ve ilk izleniminiz. Dünyaya nasıl göründüğünüzü belirler.
                            </Text>
                        </View>

                        {/* Moon Sign */}
                        <View style={[styles.chartCard, { borderColor: ZODIAC_SIGNS[moonSign].color }]}>
                            <View style={styles.chartCardHeader}>
                                <Text style={styles.chartCardEmoji}>{ZODIAC_SIGNS[moonSign].emoji}</Text>
                                <View style={styles.chartCardInfo}>
                                    <Text style={styles.chartCardLabel}>Ay Burcunuz</Text>
                                    <Text style={styles.chartCardValue}>{ZODIAC_SIGNS[moonSign].nameTr}</Text>
                                </View>
                            </View>
                            <Text style={styles.chartCardDescription}>
                                Duygusal dünyanız. İç duygu ve ihtiyaçlarınızı yansıtır.
                            </Text>
                        </View>

                        {/* Elements Summary */}
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>Element Dağılımı</Text>
                            <View style={styles.elementRow}>
                                <View style={styles.elementItem}>
                                    <Text style={styles.elementEmoji}>🔥</Text>
                                    <Text style={styles.elementLabel}>Ateş</Text>
                                    <Text style={styles.elementValue}>33%</Text>
                                </View>
                                <View style={styles.elementItem}>
                                    <Text style={styles.elementEmoji}>🌊</Text>
                                    <Text style={styles.elementLabel}>Su</Text>
                                    <Text style={styles.elementValue}>33%</Text>
                                </View>
                                <View style={styles.elementItem}>
                                    <Text style={styles.elementEmoji}>🌍</Text>
                                    <Text style={styles.elementLabel}>Toprak</Text>
                                    <Text style={styles.elementValue}>17%</Text>
                                </View>
                                <View style={styles.elementItem}>
                                    <Text style={styles.elementEmoji}>💨</Text>
                                    <Text style={styles.elementLabel}>Hava</Text>
                                    <Text style={styles.elementValue}>17%</Text>
                                </View>
                            </View>
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
            fontSize: 20,
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
        form: {
            paddingHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.xl,
        },
        inputGroup: {
            marginBottom: theme.spacing.md,
        },
        inputLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: theme.spacing.xs,
        },
        input: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 12,
            padding: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            fontSize: 15,
            color: theme.colors.text,
        },
        inputText: {
            fontSize: 15,
            color: theme.colors.text,
        },
        calculateButton: {
            backgroundColor: theme.colors.primary,
            paddingVertical: theme.spacing.md,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: theme.spacing.md,
        },
        calculateButtonDisabled: {
            opacity: 0.5,
        },
        calculateButtonText: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.textOnPrimary,
        },
        chartContainer: {
            paddingHorizontal: theme.spacing.lg,
        },
        chartCard: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 16,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.md,
            borderWidth: 2,
        },
        chartCardHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        chartCardEmoji: {
            fontSize: 40,
            marginRight: theme.spacing.md,
        },
        chartCardInfo: {
            flex: 1,
        },
        chartCardLabel: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginBottom: 4,
        },
        chartCardValue: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.text,
        },
        chartCardDescription: {
            fontSize: 14,
            lineHeight: 20,
            color: theme.colors.textSecondary,
        },
        summaryCard: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 16,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        summaryTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: theme.spacing.md,
            textAlign: 'center',
        },
        elementRow: {
            flexDirection: 'row',
            justifyContent: 'space-around',
        },
        elementItem: {
            alignItems: 'center',
        },
        elementEmoji: {
            fontSize: 32,
            marginBottom: theme.spacing.xs,
        },
        elementLabel: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginBottom: 4,
        },
        elementValue: {
            fontSize: 16,
            fontWeight: '700',
            color: theme.colors.text,
        },
        bottomSpacer: {
            height: 40,
        },
    });
