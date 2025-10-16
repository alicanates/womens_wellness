import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Benefit {
    icon: string;
    title: string;
    description: string;
}

const BENEFITS: Benefit[] = [
    {
        icon: '🧠',
        title: 'Gelişmiş Hafıza',
        description: 'AI asistanınız sizi daha iyi hatırlıyor ve kişiselleştirilmiş yanıtlar veriyor',
    },
    {
        icon: '⚡',
        title: 'Öncelikli Yanıt',
        description: 'Sorularınıza daha hızlı ve detaylı yanıtlar alın',
    },
    {
        icon: '✨',
        title: 'Özel Özellikler',
        description: 'Sadece premium kullanıcılara özel içgörüler ve öneriler',
    },
    {
        icon: '🎯',
        title: 'Kişiselleştirilmiş İçgörüler',
        description: 'Sağlık verilerinize özel analizler ve öneriler',
    },
    {
        icon: '📈',
        title: 'Gelişmiş Analizler',
        description: 'Detaylı raporlar ve trendler ile sağlığınızı daha iyi anlayın',
    },
    {
        icon: '💬',
        title: 'Sınırsız Konuşma',
        description: 'Ayda 1000 mesaj ile AI asistanınızla daha fazla etkileşim',
    },
];

export function BenefitsSection() {
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Premium Avantajları</Text>
            <Text style={styles.subtitle}>
                Premium üyelikle elde edeceğiniz tüm avantajlar
            </Text>

            <View style={styles.benefitsGrid}>
                {BENEFITS.map((benefit, index) => (
                    <BenefitCard key={index} benefit={benefit} />
                ))}
            </View>
        </View>
    );
}

interface BenefitCardProps {
    benefit: Benefit;
}

function BenefitCard({ benefit }: BenefitCardProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.benefitCard}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>{benefit.icon}</Text>
            </View>
            <Text style={styles.benefitTitle}>{benefit.title}</Text>
            <Text style={styles.benefitDescription}>{benefit.description}</Text>
        </View>
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
            marginBottom: theme.spacing.xs,
        },
        subtitle: {
            ...theme.typography.body,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.lg,
        },
        benefitsGrid: {
            gap: theme.spacing.md,
        },
        benefitCard: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: theme.card.borderRadius,
            padding: theme.spacing.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        iconContainer: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: theme.colors.backgroundSecondary,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        icon: {
            fontSize: 24,
        },
        benefitTitle: {
            ...theme.typography.subtitle,
            color: theme.colors.text,
            marginBottom: theme.spacing.xs,
            fontSize: 16,
        },
        benefitDescription: {
            ...theme.typography.body,
            color: theme.colors.textSecondary,
            lineHeight: 20,
        },
    });
