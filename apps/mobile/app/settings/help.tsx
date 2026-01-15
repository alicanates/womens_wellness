import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

type FAQItem = {
    question: string;
    answer: string;
    category: string;
};

const FAQ_DATA: FAQItem[] = [
    {
        category: 'Genel',
        question: 'Uygulama nasıl kullanılır?',
        answer: 'Ana ekrandan istediğiniz özelliğe tıklayarak başlayabilirsiniz. Regl takibi, hamilelik modu, wellness aktiviteleri ve daha fazlası için ilgili bölümlere gidin.',
    },
    {
        category: 'Genel',
        question: 'Verilerim güvende mi?',
        answer: 'Evet, tüm verileriniz şifrelenmiş olarak saklanır ve sadece sizin erişiminize açıktır. Gizlilik politikamızı inceleyebilirsiniz.',
    },
    {
        category: 'Regl Takibi',
        question: 'Regl döngümü nasıl takip ederim?',
        answer: 'Ana ekrandan "Regl Takvimi" bölümüne girin. Dönem başlangıç ve bitiş tarihlerinizi işaretleyin. Uygulama otomatik olarak bir sonraki döneminizi tahmin edecektir.',
    },
    {
        category: 'Regl Takibi',
        question: 'Semptomlarımı nasıl kaydederim?',
        answer: 'Regl takviminde herhangi bir güne tıklayın ve "Semptom Ekle" butonuna basın. Ruh haliniz, ağrılar ve diğer belirtileri kaydedebilirsiniz.',
    },
    {
        category: 'Hamilelik',
        question: 'Hamilelik modunu nasıl aktif ederim?',
        answer: 'Ayarlar > Hamilelik Modu\'na gidin ve son adet tarihinizi girin. Uygulama otomatik olarak hamilelik haftanızı hesaplayacaktır.',
    },
    {
        category: 'Hamilelik',
        question: 'Randevularımı nasıl eklerim?',
        answer: 'Hamilelik bölümünden "Randevular" sekmesine gidin ve "Yeni Randevu" butonuna tıklayın. Tarih, saat ve notlarınızı ekleyin.',
    },
    {
        category: 'Premium',
        question: 'Premium üyelik ne sağlar?',
        answer: 'Premium üyelikle sınırsız AI sohbet, sınırsız soru sorma, gelişmiş raporlar, özel içerikler ve reklamsız deneyim elde edersiniz.',
    },
    {
        category: 'Premium',
        question: 'Aboneliğimi nasıl iptal ederim?',
        answer: 'iOS: App Store > Hesabınız > Abonelikler. Android: Play Store > Hesap > Abonelikler. Buradan aboneliğinizi yönetebilirsiniz.',
    },
    {
        category: 'Teknik',
        question: 'Uygulama çöküyor, ne yapmalıyım?',
        answer: 'Önce uygulamayı tamamen kapatıp yeniden açmayı deneyin. Sorun devam ederse uygulamayı güncelleyin veya destek ekibimizle iletişime geçin.',
    },
    {
        category: 'Teknik',
        question: 'Verilerimi nasıl yedeklerim?',
        answer: 'Ayarlar > Veri ve Gizlilik > Verileri Senkronize Et. Verileriniz otomatik olarak bulutta yedeklenir.',
    },
];

export default function HelpScreen() {
    const router = useRouter();
    const theme = useTheme();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');

    const categories = ['Tümü', ...Array.from(new Set(FAQ_DATA.map(item => item.category)))];

    const filteredFAQ = selectedCategory === 'Tümü'
        ? FAQ_DATA
        : FAQ_DATA.filter(item => item.category === selectedCategory);

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>‹ Geri</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Yardım Merkezi</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.container}>
                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hızlı Erişim</Text>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => Linking.openURL('mailto:support@womenswellness.app')}
                    >
                        <Text style={styles.actionIcon}>📧</Text>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>E-posta Desteği</Text>
                            <Text style={styles.actionDescription}>support@womenswellness.app</Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => Linking.openURL('https://womenswellness.app/docs')}
                    >
                        <Text style={styles.actionIcon}>📚</Text>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Kullanım Kılavuzu</Text>
                            <Text style={styles.actionDescription}>Detaylı dokümantasyon</Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => Linking.openURL('https://womenswellness.app/video-tutorials')}
                    >
                        <Text style={styles.actionIcon}>🎥</Text>
                        <View style={styles.actionContent}>
                            <Text style={styles.actionTitle}>Video Eğitimleri</Text>
                            <Text style={styles.actionDescription}>Adım adım rehberler</Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* FAQ Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Sık Sorulan Sorular</Text>

                    {/* Category Filter */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryScroll}
                        contentContainerStyle={styles.categoryScrollContent}
                    >
                        {categories.map((category) => (
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

                    {/* FAQ Items */}
                    {filteredFAQ.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.faqItem}
                            onPress={() => toggleExpand(index)}
                        >
                            <View style={styles.faqHeader}>
                                <Text style={styles.faqQuestion}>{item.question}</Text>
                                <Text style={styles.faqIcon}>
                                    {expandedIndex === index ? '−' : '+'}
                                </Text>
                            </View>
                            {expandedIndex === index && (
                                <Text style={styles.faqAnswer}>{item.answer}</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Contact Support */}
                <View style={styles.section}>
                    <View style={styles.supportCard}>
                        <Text style={styles.supportTitle}>Sorunuz mu var?</Text>
                        <Text style={styles.supportText}>
                            Aradığınız cevabı bulamadıysanız, destek ekibimizle iletişime geçin.
                        </Text>
                        <TouchableOpacity
                            style={styles.supportButton}
                            onPress={() => Linking.openURL('mailto:support@womenswellness.app?subject=Destek Talebi')}
                        >
                            <Text style={styles.supportButtonText}>Destek Ekibiyle İletişime Geç</Text>
                        </TouchableOpacity>
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
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: theme.spacing.md,
        },
        actionCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 12,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.sm,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        actionIcon: {
            fontSize: 32,
            marginRight: theme.spacing.md,
        },
        actionContent: {
            flex: 1,
        },
        actionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 2,
        },
        actionDescription: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        actionArrow: {
            fontSize: 24,
            color: theme.colors.textSecondary,
        },
        categoryScroll: {
            marginBottom: theme.spacing.md,
        },
        categoryScrollContent: {
            paddingRight: theme.spacing.lg,
        },
        categoryChip: {
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: 20,
            backgroundColor: theme.colors.backgroundCard,
            borderWidth: 1,
            borderColor: theme.colors.border,
            marginRight: theme.spacing.sm,
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
        faqItem: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 12,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.sm,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        faqHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        faqQuestion: {
            flex: 1,
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginRight: theme.spacing.sm,
        },
        faqIcon: {
            fontSize: 24,
            fontWeight: '300',
            color: theme.colors.primary,
        },
        faqAnswer: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            lineHeight: 20,
            marginTop: theme.spacing.sm,
            paddingTop: theme.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
        },
        supportCard: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 16,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.xl,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: 'center',
        },
        supportTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
            textAlign: 'center',
        },
        supportText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            marginBottom: theme.spacing.lg,
            lineHeight: 20,
        },
        supportButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: 12,
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.lg,
        },
        supportButtonText: {
            color: theme.colors.textOnPrimary,
            fontSize: 16,
            fontWeight: '700',
        },
    });
