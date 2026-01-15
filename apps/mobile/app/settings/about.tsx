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

export default function AboutScreen() {
    const router = useRouter();
    const theme = useTheme();

    const appVersion = '1.0.0';
    const buildNumber = '1';

    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>‹ Geri</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Hakkında</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                {/* App Logo & Name */}
                <View style={styles.logoSection}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoEmoji}>🌸</Text>
                    </View>
                    <Text style={styles.appName}>Women's Wellness</Text>
                    <Text style={styles.appTagline}>Companion</Text>
                    <Text style={styles.versionText}>Versiyon {appVersion} ({buildNumber})</Text>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.description}>
                        Women's Wellness Companion, kadınların sağlık ve wellness yolculuğunda yanlarında olan kapsamlı bir dijital asistanıdır.
                    </Text>
                    <Text style={styles.description}>
                        Regl takibinden hamilelik moduna, meditasyondan beslenme önerilerine kadar birçok özellikle kadınların hayatını kolaylaştırıyoruz.
                    </Text>
                </View>

                {/* Features */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Özellikler</Text>
                    <View style={styles.featureList}>
                        <FeatureItem icon="📅" text="Regl ve ovülasyon takibi" />
                        <FeatureItem icon="🤰" text="Hamilelik modu ve takibi" />
                        <FeatureItem icon="🧘‍♀️" text="Meditasyon ve nefes egzersizleri" />
                        <FeatureItem icon="💬" text="AI destekli sohbet asistanı" />
                        <FeatureItem icon="📊" text="Sağlık raporları ve analizler" />
                        <FeatureItem icon="🎯" text="Kişiselleştirilmiş öneriler" />
                        <FeatureItem icon="🏆" text="Gamification ve motivasyon" />
                        <FeatureItem icon="🔒" text="Güvenli ve özel veri saklama" />
                    </View>
                </View>

                {/* Links */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bağlantılar</Text>

                    <TouchableOpacity
                        style={styles.linkItem}
                        onPress={() => Linking.openURL('https://womenswellness.app')}
                    >
                        <Text style={styles.linkIcon}>🌐</Text>
                        <Text style={styles.linkText}>Web Sitesi</Text>
                        <Text style={styles.linkArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkItem}
                        onPress={() => Linking.openURL('https://instagram.com/womenswellness')}
                    >
                        <Text style={styles.linkIcon}>📱</Text>
                        <Text style={styles.linkText}>Instagram</Text>
                        <Text style={styles.linkArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkItem}
                        onPress={() => Linking.openURL('https://twitter.com/womenswellness')}
                    >
                        <Text style={styles.linkIcon}>🐦</Text>
                        <Text style={styles.linkText}>Twitter</Text>
                        <Text style={styles.linkArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkItem}
                        onPress={() => router.push('/privacy-policy')}
                    >
                        <Text style={styles.linkIcon}>🔒</Text>
                        <Text style={styles.linkText}>Gizlilik Politikası</Text>
                        <Text style={styles.linkArrow}>›</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkItem}
                        onPress={() => router.push('/terms-of-use')}
                    >
                        <Text style={styles.linkIcon}>📄</Text>
                        <Text style={styles.linkText}>Kullanım Koşulları</Text>
                        <Text style={styles.linkArrow}>›</Text>
                    </TouchableOpacity>
                </View>

                {/* Credits */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Teşekkürler</Text>
                    <Text style={styles.creditsText}>
                        Bu uygulamayı geliştiren ekibe, beta test kullanıcılarımıza ve değerli geri bildirimlerini paylaşan tüm kullanıcılarımıza teşekkür ederiz.
                    </Text>
                </View>

                {/* Copyright */}
                <View style={styles.copyrightSection}>
                    <Text style={styles.copyrightText}>
                        © 2024 Women's Wellness Companion
                    </Text>
                    <Text style={styles.copyrightText}>
                        Tüm hakları saklıdır.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
    const theme = useTheme();
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 20, marginRight: 12 }}>{icon}</Text>
            <Text style={{ fontSize: 15, color: theme.colors.text }}>{text}</Text>
        </View>
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
        contentContainer: {
            paddingBottom: 40,
        },
        logoSection: {
            alignItems: 'center',
            paddingVertical: theme.spacing.xl,
        },
        logoContainer: {
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: theme.colors.primary + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        logoEmoji: {
            fontSize: 50,
        },
        appName: {
            fontSize: 28,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: 4,
        },
        appTagline: {
            fontSize: 20,
            fontWeight: '600',
            color: theme.colors.primary,
            marginBottom: theme.spacing.sm,
        },
        versionText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
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
        description: {
            fontSize: 15,
            color: theme.colors.textSecondary,
            lineHeight: 22,
            marginBottom: theme.spacing.md,
            textAlign: 'center',
        },
        featureList: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 12,
            padding: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        linkItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 12,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.sm,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        linkIcon: {
            fontSize: 24,
            marginRight: theme.spacing.md,
        },
        linkText: {
            flex: 1,
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
        },
        linkArrow: {
            fontSize: 24,
            color: theme.colors.textSecondary,
        },
        creditsText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            lineHeight: 20,
            textAlign: 'center',
        },
        copyrightSection: {
            alignItems: 'center',
            marginTop: theme.spacing.xl,
            paddingVertical: theme.spacing.lg,
        },
        copyrightText: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginVertical: 2,
        },
    });
