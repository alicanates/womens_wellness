import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

const API_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:4000';

interface Page {
    id: string;
    slug: string;
    titleTr: string;
    titleEn?: string;
    contentTr: string;
    contentEn?: string;
    isActive: boolean;
}

export default function PageViewScreen() {
    const router = useRouter();
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const theme = useTheme();
    const [page, setPage] = useState<Page | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('PageViewScreen mounted with slug:', slug);
        if (slug) {
            fetchPage();
        }
    }, [slug]);

    const fetchPage = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching page from:', `${API_URL}/pages/slug/${slug}`);
            const response = await fetch(`${API_URL}/pages/slug/${slug}`);

            if (!response.ok) {
                throw new Error('Sayfa bulunamadı');
            }

            const data = await response.json();
            setPage(data);
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const styles = createStyles(theme);

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>‹ Geri</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Yükleniyor...</Text>
                    <View style={styles.headerRight} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !page) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Text style={styles.backButtonText}>‹ Geri</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Hata</Text>
                    <View style={styles.headerRight} />
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error || 'Sayfa bulunamadı'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={fetchPage}>
                        <Text style={styles.retryButtonText}>Tekrar Dene</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>‹ Geri</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {page.titleTr}
                </Text>
                <View style={styles.headerRight} />
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <View style={styles.content}>
                    <Text style={styles.title}>{page.titleTr}</Text>
                    <Text style={styles.body}>{page.contentTr}</Text>
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
            flex: 1,
            textAlign: 'center',
            marginHorizontal: theme.spacing.md,
        },
        headerRight: {
            width: 40,
        },
        container: {
            flex: 1,
        },
        contentContainer: {
            padding: theme.spacing.lg,
        },
        content: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 12,
            padding: theme.spacing.lg,
        },
        title: {
            fontSize: 24,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: theme.spacing.lg,
        },
        body: {
            fontSize: 16,
            lineHeight: 24,
            color: theme.colors.text,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
        errorText: {
            fontSize: 16,
            color: theme.colors.error,
            textAlign: 'center',
            marginBottom: theme.spacing.lg,
        },
        retryButton: {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.md,
            borderRadius: 12,
        },
        retryButtonText: {
            color: theme.colors.textOnPrimary,
            fontSize: 16,
            fontWeight: '600',
        },
    });
