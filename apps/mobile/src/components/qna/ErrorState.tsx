import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export type ErrorType = 'network' | 'not-found' | 'unauthorized' | 'server' | 'unknown';

interface ErrorStateProps {
    type?: ErrorType;
    title?: string;
    message?: string;
    onRetry?: () => void;
    retryLabel?: string;
    showRetry?: boolean;
}

const ERROR_CONFIGS: Record<ErrorType, { icon: any; title: string; message: string }> = {
    network: {
        icon: 'cloud-offline-outline',
        title: 'Bağlantı Hatası',
        message: 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.',
    },
    'not-found': {
        icon: 'search-outline',
        title: 'Bulunamadı',
        message: 'Aradığınız içerik bulunamadı veya kaldırılmış olabilir.',
    },
    unauthorized: {
        icon: 'lock-closed-outline',
        title: 'Yetki Gerekli',
        message: 'Bu içeriği görüntülemek için giriş yapmanız gerekiyor.',
    },
    server: {
        icon: 'server-outline',
        title: 'Sunucu Hatası',
        message: 'Sunucuda bir sorun oluştu. Lütfen daha sonra tekrar deneyin.',
    },
    unknown: {
        icon: 'alert-circle-outline',
        title: 'Bir Hata Oluştu',
        message: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
    },
};

export function ErrorState({
    type = 'unknown',
    title,
    message,
    onRetry,
    retryLabel = 'Tekrar Dene',
    showRetry = true,
}: ErrorStateProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    const config = ERROR_CONFIGS[type];
    const displayTitle = title || config.title;
    const displayMessage = message || config.message;

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Ionicons name={config.icon} size={64} color={theme.colors.error} />
            </View>
            <Text style={styles.title}>{displayTitle}</Text>
            <Text style={styles.message}>{displayMessage}</Text>
            {showRetry && onRetry && (
                <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
                    <Ionicons name="refresh" size={20} color="#fff" />
                    <Text style={styles.retryButtonText}>{retryLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.xl,
            backgroundColor: theme.colors.background,
        },
        iconContainer: {
            marginBottom: theme.spacing.lg,
        },
        title: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
            textAlign: 'center',
        },
        message: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            textAlign: 'center',
            lineHeight: 20,
            marginBottom: theme.spacing.xl,
            paddingHorizontal: theme.spacing.md,
        },
        retryButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.md,
            borderRadius: 12,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
        retryButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#fff',
        },
    });
