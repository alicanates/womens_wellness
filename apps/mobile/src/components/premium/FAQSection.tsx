import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

interface FAQ {
    question: string;
    answer: string;
}

const FAQS: FAQ[] = [
    {
        question: 'Premium\'u nasıl iptal edebilirim?',
        answer: 'Ayarlar > Abonelik Yönetimi\'nden istediğiniz zaman iptal edebilirsiniz. İptal ettiğinizde mevcut dönem sonuna kadar premium özelliklerinize erişmeye devam edersiniz.',
    },
    {
        question: 'Farklı cihazlarda kullanabilir miyim?',
        answer: 'Evet, aynı hesapla giriş yaptığınız tüm cihazlarda premium özellikler otomatik olarak aktif olur.',
    },
    {
        question: 'İade alabilir miyim?',
        answer: 'İlk 7 gün içinde herhangi bir nedenle tam iade alabilirsiniz. İade talebi için destek ekibimizle iletişime geçin.',
    },
    {
        question: 'Deneme süresi var mı?',
        answer: 'Evet, ilk kez premium\'a abone olan kullanıcılar için 7 günlük ücretsiz deneme süresi sunuyoruz. Deneme süresi boyunca tüm premium özelliklere erişebilirsiniz.',
    },
    {
        question: 'Aylık ve yıllık plan arasındaki fark nedir?',
        answer: 'Her iki plan da aynı özellikleri sunar. Yıllık plan ile %17 tasarruf edersiniz ve yıl boyunca kesintisiz premium erişiminiz olur.',
    },
    {
        question: 'Ödeme güvenli mi?',
        answer: 'Evet, tüm ödemeler Apple App Store veya Google Play Store üzerinden güvenli bir şekilde işlenir. Ödeme bilgileriniz bizimle paylaşılmaz.',
    },
];

export function FAQSection() {
    const router = useRouter();
    const theme = useTheme();
    const styles = createStyles(theme);

    const handleTerms = () => {
        router.push('/settings/terms-of-service' as any);
    };

    const handlePrivacy = () => {
        router.push('/settings/privacy-policy' as any);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sıkça Sorulan Sorular</Text>

            <View style={styles.faqList}>
                {FAQS.map((faq, index) => (
                    <FAQItem key={index} faq={faq} />
                ))}
            </View>

            {/* Terms and Privacy Links */}
            <View style={styles.linksContainer}>
                <TouchableOpacity onPress={handleTerms} style={styles.link}>
                    <Text style={styles.linkText}>Kullanım Koşulları</Text>
                </TouchableOpacity>
                <Text style={styles.separator}>•</Text>
                <TouchableOpacity onPress={handlePrivacy} style={styles.link}>
                    <Text style={styles.linkText}>Gizlilik Politikası</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

interface FAQItemProps {
    faq: FAQ;
}

function FAQItem({ faq }: FAQItemProps) {
    const theme = useTheme();
    const styles = createStyles(theme);
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <TouchableOpacity
            style={styles.faqItem}
            onPress={() => setIsExpanded(!isExpanded)}
            activeOpacity={0.7}
        >
            <View style={styles.faqHeader}>
                <Text style={styles.question}>{faq.question}</Text>
                <Text style={[styles.chevron, isExpanded && styles.chevronExpanded]}>
                    ›
                </Text>
            </View>
            {isExpanded && (
                <Text style={styles.answer}>{faq.answer}</Text>
            )}
        </TouchableOpacity>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        container: {
            marginBottom: theme.spacing.xl,
        },
        title: {
            ...theme.typography.subtitle,
            color: theme.colors.text,
            marginBottom: theme.spacing.lg,
        },
        faqList: {
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.lg,
        },
        faqItem: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: theme.card.borderRadius,
            padding: theme.spacing.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        faqHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        question: {
            ...theme.typography.body,
            color: theme.colors.text,
            fontWeight: '600',
            flex: 1,
            marginRight: theme.spacing.sm,
        },
        chevron: {
            fontSize: 24,
            color: theme.colors.textSecondary,
            transform: [{ rotate: '90deg' }],
        },
        chevronExpanded: {
            transform: [{ rotate: '270deg' }],
        },
        answer: {
            ...theme.typography.body,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.md,
            lineHeight: 20,
        },
        linksContainer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: theme.spacing.sm,
            paddingVertical: theme.spacing.md,
        },
        link: {
            padding: theme.spacing.xs,
        },
        linkText: {
            ...theme.typography.body,
            color: theme.colors.primary,
            textDecorationLine: 'underline',
        },
        separator: {
            ...theme.typography.body,
            color: theme.colors.textSecondary,
        },
    });
