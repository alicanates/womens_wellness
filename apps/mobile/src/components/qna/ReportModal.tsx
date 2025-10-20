import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { ContentType } from '@/types/qna';

interface ReportModalProps {
    visible: boolean;
    onClose: () => void;
    contentId: string;
    contentType: ContentType;
    onSubmit: (reason: string, description?: string) => Promise<void>;
}

interface ReportReason {
    id: string;
    label: string;
    emoji: string;
}

const REPORT_REASONS: ReportReason[] = [
    {
        id: 'spam',
        label: 'Spam veya Reklam',
        emoji: '📢',
    },
    {
        id: 'inappropriate',
        label: 'Uygunsuz İçerik',
        emoji: '⚠️',
    },
    {
        id: 'misleading',
        label: 'Yanıltıcı Bilgi',
        emoji: '❗',
    },
    {
        id: 'harassment',
        label: 'Taciz veya Zorbalık',
        emoji: '😢',
    },
    {
        id: 'violence',
        label: 'Şiddet veya Tehdit',
        emoji: '💀',
    },
    {
        id: 'hate',
        label: 'Nefret Söylemi',
        emoji: '💔',
    },
    {
        id: 'privacy',
        label: 'Gizlilik İhlali',
        emoji: '🔒',
    },
    {
        id: 'other',
        label: 'Diğer',
        emoji: '❓',
    },
];

export function ReportModal({
    visible,
    onClose,
    contentId,
    contentType,
    onSubmit,
}: ReportModalProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!selectedReason) return;

        setIsSubmitting(true);
        try {
            const reason = REPORT_REASONS.find(r => r.id === selectedReason)?.label || selectedReason;
            await onSubmit(reason, description.trim() || undefined);

            // Reset form
            setSelectedReason(null);
            setDescription('');
            onClose();
        } catch (error) {
            // Error is handled by parent
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setSelectedReason(null);
            setDescription('');
            onClose();
        }
    };

    const contentTypeLabel = contentType === ContentType.QUESTION ? 'soruyu' : 'cevabı';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>İçeriği Raporla</Text>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={styles.closeButton}
                            disabled={isSubmitting}
                        >
                            <Text style={{ fontSize: 24 }}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Description */}
                        <Text style={styles.description}>
                            Bu {contentTypeLabel} neden raporlamak istiyorsunuz?
                        </Text>

                        {/* Reasons */}
                        <View style={styles.reasonsContainer}>
                            {REPORT_REASONS.map((reason) => (
                                <TouchableOpacity
                                    key={reason.id}
                                    style={[
                                        styles.reasonOption,
                                        selectedReason === reason.id && styles.reasonOptionSelected,
                                    ]}
                                    onPress={() => setSelectedReason(reason.id)}
                                    disabled={isSubmitting}
                                >
                                    <View style={styles.reasonIconContainer}>
                                        <Text style={styles.reasonEmoji}>{reason.emoji}</Text>
                                    </View>
                                    <Text
                                        style={[
                                            styles.reasonLabel,
                                            selectedReason === reason.id && styles.reasonLabelSelected,
                                        ]}
                                    >
                                        {reason.label}
                                    </Text>
                                    {selectedReason === reason.id && (
                                        <Text style={{ fontSize: 20 }}>✅</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Additional Details */}
                        <View style={styles.detailsContainer}>
                            <Text style={styles.detailsLabel}>
                                Ek Açıklama (İsteğe Bağlı)
                            </Text>
                            <TextInput
                                style={styles.detailsInput}
                                placeholder="Daha fazla detay ekleyin..."
                                placeholderTextColor={theme.colors.textLight}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                maxLength={500}
                                editable={!isSubmitting}
                            />
                            <Text style={styles.characterCount}>
                                {description.length}/500
                            </Text>
                        </View>

                        {/* Info */}
                        <View style={styles.infoContainer}>
                            <Text style={{ fontSize: 20 }}>ℹ️</Text>
                            <Text style={styles.infoText}>
                                Raporunuz gizli tutulacak ve moderasyon ekibimiz tarafından incelenecektir.
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.cancelButtonText}>İptal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (!selectedReason || isSubmitting) && styles.submitButtonDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={!selectedReason || isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Gönder</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        container: {
            backgroundColor: theme.colors.backgroundCard,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '90%',
            paddingBottom: Platform.OS === 'ios' ? 34 : 0,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing.lg,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.text,
        },
        closeButton: {
            padding: theme.spacing.xs,
        },
        content: {
            padding: theme.spacing.lg,
        },
        description: {
            fontSize: 16,
            color: theme.colors.text,
            marginBottom: theme.spacing.lg,
            lineHeight: 22,
        },
        reasonsContainer: {
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.xl,
        },
        reasonOption: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: theme.spacing.md,
            borderRadius: 12,
            backgroundColor: theme.colors.background,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        reasonOptionSelected: {
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderColor: theme.colors.primary,
        },
        reasonIconContainer: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.backgroundCard,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.md,
        },
        reasonLabel: {
            flex: 1,
            fontSize: 15,
            fontWeight: '500',
            color: theme.colors.text,
        },
        reasonLabelSelected: {
            color: theme.colors.primary,
            fontWeight: '600',
        },
        reasonEmoji: {
            fontSize: 24,
        },
        detailsContainer: {
            marginBottom: theme.spacing.lg,
        },
        detailsLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
        },
        detailsInput: {
            backgroundColor: theme.colors.background,
            borderRadius: 12,
            padding: theme.spacing.md,
            fontSize: 15,
            color: theme.colors.text,
            minHeight: 100,
            textAlignVertical: 'top',
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        characterCount: {
            fontSize: 12,
            color: theme.colors.textLight,
            textAlign: 'right',
            marginTop: theme.spacing.xs,
        },
        infoContainer: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: theme.spacing.sm,
            padding: theme.spacing.md,
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderRadius: 12,
            marginBottom: theme.spacing.md,
        },
        infoText: {
            flex: 1,
            fontSize: 13,
            color: theme.colors.text,
            lineHeight: 18,
        },
        footer: {
            flexDirection: 'row',
            gap: theme.spacing.md,
            padding: theme.spacing.lg,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
        },
        cancelButton: {
            flex: 1,
            paddingVertical: theme.spacing.md,
            borderRadius: 12,
            backgroundColor: theme.colors.background,
            alignItems: 'center',
            justifyContent: 'center',
        },
        cancelButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
        },
        submitButton: {
            flex: 1,
            paddingVertical: theme.spacing.md,
            borderRadius: 12,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
        },
        submitButtonDisabled: {
            opacity: 0.5,
        },
        submitButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#fff',
        },
    });
