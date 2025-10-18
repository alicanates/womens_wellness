import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export default function MetricsScreen() {
    const theme = useTheme();
    const router = useRouter();

    const calculators = [
        {
            id: 'bmi',
            title: 'VKİ Hesaplama',
            subtitle: 'Vücut Kitle İndeksi',
            icon: '⚖️',
            color: '#10B981',
            route: '/metrics/bmi',
        },
        {
            id: 'calorie',
            title: 'Kalori Hesaplama',
            subtitle: 'Günlük kalori ihtiyacı',
            icon: '🔥',
            color: '#F59E0B',
            route: '/metrics/calorie',
        },
        {
            id: 'water',
            title: 'Su İhtiyacı',
            subtitle: 'Günlük su tüketimi',
            icon: '💧',
            color: '#3B82F6',
            route: '/metrics/water',
        },
        {
            id: 'ovulation',
            title: 'Ovulasyon Hesaplayıcı',
            subtitle: 'Yumurtlama takvimi',
            icon: '🌸',
            color: '#EC4899',
            route: '/metrics/ovulation',
        },
        {
            id: 'ideal-weight',
            title: 'İdeal Kilo',
            subtitle: 'Hedef kilo aralığı',
            icon: '🎯',
            color: '#8B5CF6',
            route: '/metrics/ideal-weight',
        },
        {
            id: 'body-fat',
            title: 'Vücut Yağ Oranı',
            subtitle: 'Yağ yüzdesi hesaplama',
            icon: '📊',
            color: '#EF4444',
            route: '/metrics/body-fat',
        },
        {
            id: 'fertility',
            title: 'Doğurganlık Hesaplayıcı',
            subtitle: 'Verimli günler',
            icon: '🌺',
            color: '#F97316',
            route: '/metrics/fertility',
        },
    ];

    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backIcon}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>Sağlık Metrikleri</Text>
                        <Text style={styles.subtitle}>Hesaplayıcılar ve Araçlar</Text>
                    </View>
                </View>

                <View style={styles.grid}>
                    {calculators.map((calc) => (
                        <TouchableOpacity
                            key={calc.id}
                            style={[styles.card, { borderLeftColor: calc.color }]}
                            onPress={() => router.push(calc.route as any)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: calc.color + '20' }]}>
                                <Text style={styles.icon}>{calc.icon}</Text>
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{calc.title}</Text>
                                <Text style={styles.cardSubtitle}>{calc.subtitle}</Text>
                            </View>
                            <Text style={styles.arrow}>›</Text>
                        </TouchableOpacity>
                    ))}
                </View>
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
        contentContainer: {
            padding: theme.spacing.lg,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.xl,
        },
        backButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.backgroundCard,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        backIcon: {
            fontSize: 24,
            color: theme.colors.text,
        },
        headerTextContainer: {
            flex: 1,
        },
        title: {
            fontSize: 28,
            fontWeight: '800',
            color: theme.colors.text,
            marginBottom: 4,
        },
        subtitle: {
            fontSize: 16,
            color: theme.colors.textSecondary,
        },
        grid: {
            gap: theme.spacing.md,
        },
        card: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 16,
            padding: theme.spacing.lg,
            borderLeftWidth: 4,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        iconContainer: {
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.md,
        },
        icon: {
            fontSize: 28,
        },
        cardContent: {
            flex: 1,
        },
        cardTitle: {
            fontSize: 17,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: 4,
        },
        cardSubtitle: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        arrow: {
            fontSize: 28,
            color: theme.colors.textLight,
            marginLeft: theme.spacing.sm,
        },
    });
