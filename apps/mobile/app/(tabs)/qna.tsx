import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface QnAItem {
    id: string;
    question: string;
    answer: string;
    category: string;
}

const QNA_DATA: QnAItem[] = [
    {
        id: '1',
        question: 'Adet döngüm nasıl takip edilir?',
        answer: 'Takvim sekmesinden adet başlangıç ve bitiş tarihlerinizi işaretleyebilirsiniz. Uygulama otomatik olarak döngünüzü takip eder ve gelecek dönemlerinizi tahmin eder.',
        category: 'Adet Takibi',
    },
    {
        id: '2',
        question: 'Su hedefim nasıl belirlenir?',
        answer: 'Su hedefiniz kilonuza göre otomatik olarak hesaplanır (30 ml/kg). Ayarlar bölümünden kişiselleştirebilirsiniz.',
        category: 'Su Takibi',
    },
    {
        id: '3',
        question: 'Gebelik modu nedir?',
        answer: 'Gebelik modunu aktifleştirdiğinizde, haftalık gelişim takibi, randevu hatırlatıcıları ve bebek hareketleri sayacı gibi özel özelliklere erişebilirsiniz.',
        category: 'Gebelik',
    },
    {
        id: '4',
        question: 'NOVA nedir?',
        answer: 'NOVA, size özel sağlık önerileri sunan yapay zeka destekli sağlık asistanınızdır. Sorularınızı yanıtlar ve kişiselleştirilmiş öneriler sunar.',
        category: 'NOVA',
    },
    {
        id: '5',
        question: 'Premium üyelik ne sağlar?',
        answer: 'Premium üyelikle sınırsız NOVA mesajları, gelişmiş analizler, öncelikli içgörüler ve reklamsız deneyim elde edersiniz.',
        category: 'Premium',
    },
    {
        id: '6',
        question: 'Verilerim güvende mi?',
        answer: 'Tüm verileriniz şifrelenmiş olarak saklanır ve sadece sizin erişiminize açıktır. Verilerinizi asla üçüncü taraflarla paylaşmayız.',
        category: 'Güvenlik',
    },
    {
        id: '7',
        question: 'Semptomlarımı nasıl kaydederim?',
        answer: 'Takvim sekmesinde herhangi bir güne tıklayarak o günün detaylarını açabilir ve semptomlarınızı, ruh halinizi ve notlarınızı ekleyebilirsiniz.',
        category: 'Adet Takibi',
    },
    {
        id: '8',
        question: 'BMI ve BMR nedir?',
        answer: 'BMI (Vücut Kitle İndeksi) kilo-boy oranınızı, BMR (Bazal Metabolizma Hızı) ise günlük kalori ihtiyacınızı gösterir. Metrikler sekmesinden hesaplayabilirsiniz.',
        category: 'Sağlık Metrikleri',
    },
];

const CATEGORIES = ['Tümü', ...Array.from(new Set(QNA_DATA.map(item => item.category)))];

export default function QnAScreen() {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tümü');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const styles = createStyles(theme);

    const filteredData = QNA_DATA.filter(item => {
        const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Tümü' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Soru & Cevap</Text>
                <Text style={styles.headerSubtitle}>Sık sorulan sorular ve cevapları</Text>
            </View>

            <View style={styles.searchContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Soru ara..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesContainer}
                contentContainerStyle={styles.categoriesContent}
            >
                {CATEGORIES.map((category) => (
                    <TouchableOpacity
                        key={category}
                        style={[
                            styles.categoryChip,
                            selectedCategory === category && styles.categoryChipActive,
                        ]}
                        onPress={() => setSelectedCategory(category)}
                    >
                        <Text
                            style={[
                                styles.categoryChipText,
                                selectedCategory === category && styles.categoryChipTextActive,
                            ]}
                        >
                            {category}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.qnaCard}
                            onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.qnaHeader}>
                                <View style={styles.qnaQuestionContainer}>
                                    <Text style={styles.qnaQuestion}>{item.question}</Text>
                                    <Text style={styles.qnaCategory}>{item.category}</Text>
                                </View>
                                <Text style={styles.expandIcon}>
                                    {expandedId === item.id ? '▼' : '▶'}
                                </Text>
                            </View>
                            {expandedId === item.id && (
                                <View style={styles.qnaAnswerContainer}>
                                    <Text style={styles.qnaAnswer}>{item.answer}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>🔍</Text>
                        <Text style={styles.emptyText}>Sonuç bulunamadı</Text>
                        <Text style={styles.emptySubtext}>
                            Farklı bir arama terimi veya kategori deneyin
                        </Text>
                    </View>
                )}

                <View style={styles.helpCard}>
                    <Text style={styles.helpIcon}>💬</Text>
                    <Text style={styles.helpTitle}>Sorunuzu bulamadınız mı?</Text>
                    <Text style={styles.helpText}>
                        NOVA ile sohbet ederek daha fazla bilgi alabilirsiniz
                    </Text>
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
        header: {
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.lg,
            paddingBottom: theme.spacing.md,
        },
        headerTitle: {
            fontSize: 28,
            fontWeight: '800',
            color: theme.colors.text,
            marginBottom: 4,
        },
        headerSubtitle: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.backgroundCard,
            marginHorizontal: theme.spacing.lg,
            marginBottom: theme.spacing.md,
            paddingHorizontal: theme.spacing.md,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        searchIcon: {
            fontSize: 20,
            marginRight: theme.spacing.sm,
        },
        searchInput: {
            flex: 1,
            paddingVertical: theme.spacing.md,
            fontSize: 16,
            color: theme.colors.text,
        },
        categoriesContainer: {
            maxHeight: 50,
            marginBottom: theme.spacing.md,
        },
        categoriesContent: {
            paddingHorizontal: theme.spacing.lg,
            gap: theme.spacing.sm,
        },
        categoryChip: {
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: 20,
            backgroundColor: theme.colors.backgroundCard,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        categoryChipActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        categoryChipText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
        },
        categoryChipTextActive: {
            color: theme.colors.textOnPrimary,
        },
        container: {
            flex: 1,
        },
        contentContainer: {
            paddingHorizontal: theme.spacing.lg,
            paddingBottom: 100,
        },
        qnaCard: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 16,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
        },
        qnaHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        qnaQuestionContainer: {
            flex: 1,
            marginRight: theme.spacing.md,
        },
        qnaQuestion: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 4,
        },
        qnaCategory: {
            fontSize: 12,
            color: theme.colors.primary,
            fontWeight: '500',
        },
        expandIcon: {
            fontSize: 16,
            color: theme.colors.textSecondary,
        },
        qnaAnswerContainer: {
            marginTop: theme.spacing.md,
            paddingTop: theme.spacing.md,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
        },
        qnaAnswer: {
            fontSize: 14,
            lineHeight: 20,
            color: theme.colors.textSecondary,
        },
        emptyState: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: theme.spacing.xl * 2,
        },
        emptyIcon: {
            fontSize: 64,
            marginBottom: theme.spacing.lg,
        },
        emptyText: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
        },
        emptySubtext: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
        helpCard: {
            backgroundColor: '#E0F2FE',
            borderRadius: 16,
            padding: theme.spacing.xl,
            marginTop: theme.spacing.lg,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: '#BAE6FD',
        },
        helpIcon: {
            fontSize: 48,
            marginBottom: theme.spacing.md,
        },
        helpTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: '#0C4A6E',
            marginBottom: theme.spacing.sm,
            textAlign: 'center',
        },
        helpText: {
            fontSize: 14,
            color: '#0369A1',
            textAlign: 'center',
        },
        bottomSpacer: {
            height: 40,
        },
    });
