import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export type EmptyStateType = 'questions' | 'answers' | 'comments' | 'favorites' | 'following' | 'search' | 'generic';

interface EmptyStateProps {
    type?: EmptyStateType;
    title?: string;
    message?: string;
    icon?: any;
    actionLabel?: string;
    onAction?: () => void;
    showAction?: boolean;
}

const EMPTY_STATE_CONFIGS: Record<EmptyStateType, { icon: any; title: string; message: string }> = {
    questions: {
        icon: 'chatbubbles-outline',
        title: 'Henüz Soru Yok',
        message: 'İlk soruyu sormak için yukarıdaki butona tıklayın.',
    },
    answers: {
        icon: 'chatbubble-ellipses-outline',
        title: 'Henüz Cevap Yok',
        message: 'İlk cevabı siz verin ve topluluğa katkıda bulunun!',
    },
    comments: {
        icon: 'chatbox-outline',
        title: 'Henüz Yorum Yok',
        message: 'İlk yorumu siz yapın.',
    },
    favorites: {
        icon: 'heart-outline',
        title: 'Favori Sorunuz Yok',
        message: 'İlginizi çeken soruları favorilerinize ekleyin.',
    },
    following: {
        icon: 'notifications-outline',
        title: 'Takip Ettiğiniz Soru Yok',
        message: 'Soruları takip ederek güncellemelerden haberdar olun.',
    },
    search: {
        icon: 'search-outline',
        title: 'Sonuç Bulunamadı',
        message: 'Arama kriterlerinizi değiştirerek tekrar deneyin.',
    },
    generic: {
        icon: 'document-outline',
        title: 'İçerik Yok',
        message: 'Henüz gösterilecek içerik bulunmuyor.',
    },
};

export function EmptyState({
    type = 'generic',
    title,
    message,
    icon,
    actionLabel,
    onAction,
    showAction = true,
}: EmptyStateProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    const config = EMPTY_STATE_CONFIGS[type];
    const displayTitle = title || config.title;
    const displayMessage = message || config.message;
    const displayIcon = icon || config.icon;

    const emojiMap: Record<string, string> = {
        'chatbubbles-outline': '💬',
        'chatbubble-ellipses-outline': '💭',
        'chatbox-outline': '💬',
        'heart-outline': '❤️',
        'notifications-outline': '🔔',
        'search-outline': '🔍',
        'document-outline': '📄',
    };

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Text style={{ fontSize: 64, opacity: 0.5 }}>
                    {emojiMap[displayIcon] || '📄'}
                </Text>
            </View>
            <Text style={styles.title}>{displayTitle}</Text>
            <Text style={styles.message}>{displayMessage}</Text>
            {showAction && onAction && actionLabel && (
                <TouchableOpacity style={styles.actionButton} onPress={onAction} activeOpacity={0.8}>
                    <Text style={styles.actionButtonText}>{actionLabel}</Text>
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
            minHeight: 300,
        },
        iconContainer: {
            marginBottom: theme.spacing.lg,
            opacity: 0.5,
        },
        title: {
            fontSize: 18,
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
        actionButton: {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.md,
            borderRadius: 12,
        },
        actionButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#fff',
        },
    });
