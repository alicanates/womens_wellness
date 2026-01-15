import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

type Language = {
    code: string;
    name: string;
    nativeName: string;
    flag: string;
};

const LANGUAGES: Language[] = [
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
];

export default function LanguageSettingsScreen() {
    const router = useRouter();
    const theme = useTheme();
    const [selectedLanguage, setSelectedLanguage] = useState('tr');

    const handleSelectLanguage = (languageCode: string) => {
        Alert.alert(
            'Dil Değiştir',
            'Dil değişikliği için uygulama yeniden başlatılacak. Devam etmek istiyor musunuz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Değiştir',
                    onPress: () => {
                        setSelectedLanguage(languageCode);
                        // TODO: Implement language change logic
                        Alert.alert('Başarılı', 'Dil değiştirildi. Uygulama yeniden başlatılıyor...');
                        setTimeout(() => {
                            router.back();
                        }, 1500);
                    },
                },
            ]
        );
    };

    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>‹ Geri</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Dil Seçimi</Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.container}>
                <View style={styles.section}>
                    <Text style={styles.sectionDescription}>
                        Uygulamada kullanılacak dili seçin
                    </Text>

                    {LANGUAGES.map((language) => (
                        <TouchableOpacity
                            key={language.code}
                            style={[
                                styles.languageItem,
                                selectedLanguage === language.code && styles.languageItemSelected,
                            ]}
                            onPress={() => handleSelectLanguage(language.code)}
                        >
                            <Text style={styles.languageFlag}>{language.flag}</Text>
                            <View style={styles.languageInfo}>
                                <Text style={styles.languageName}>{language.nativeName}</Text>
                                <Text style={styles.languageNameEn}>{language.name}</Text>
                            </View>
                            {selectedLanguage === language.code && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.infoCard}>
                    <Text style={styles.infoCardIcon}>ℹ️</Text>
                    <View style={styles.infoCardContent}>
                        <Text style={styles.infoCardTitle}>Dil Desteği</Text>
                        <Text style={styles.infoCardText}>
                            Şu anda sadece Türkçe dili desteklenmektedir. Diğer diller yakında eklenecektir.
                        </Text>
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
        sectionDescription: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.md,
        },
        languageItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 12,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.sm,
            borderWidth: 2,
            borderColor: 'transparent',
        },
        languageItemSelected: {
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.primary + '10',
        },
        languageFlag: {
            fontSize: 32,
            marginRight: theme.spacing.md,
        },
        languageInfo: {
            flex: 1,
        },
        languageName: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 2,
        },
        languageNameEn: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        checkmark: {
            fontSize: 24,
            color: theme.colors.primary,
            fontWeight: '700',
        },
        infoCard: {
            flexDirection: 'row',
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 12,
            padding: theme.spacing.md,
            margin: theme.spacing.lg,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        infoCardIcon: {
            fontSize: 24,
            marginRight: theme.spacing.md,
        },
        infoCardContent: {
            flex: 1,
        },
        infoCardTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 4,
        },
        infoCardText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            lineHeight: 20,
        },
    });
