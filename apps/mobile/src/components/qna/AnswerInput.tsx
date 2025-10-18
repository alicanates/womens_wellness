import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface AnswerInputProps {
    onSubmit: (content: string) => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
    placeholder?: string;
    minLength?: number;
    maxLength?: number;
}

export function AnswerInput({
    onSubmit,
    onCancel,
    isSubmitting = false,
    placeholder = 'Cevabınızı yazın... (En az 3 karakter)',
    minLength = 3,
    maxLength = 5000,
}: AnswerInputProps) {
    const theme = useTheme();
    const styles = createStyles(theme);
    const [content, setContent] = useState('');
    const [error, setError] = useState<string | null>(null);

    const characterCount = content.length;
    const isValid = characterCount >= minLength && characterCount <= maxLength;
    const showWarning = characterCount > maxLength * 0.9;

    const handleSubmit = async () => {
        setError(null);

        if (!content.trim()) {
            setError('Lütfen cevap içeriğini girin');
            return;
        }

        if (characterCount < minLength) {
            setError(`Cevap en az ${minLength} karakter olmalıdır`);
            return;
        }

        if (characterCount > maxLength) {
            setError(`Cevap en fazla ${maxLength} karakter olabilir`);
            return;
        }

        try {
            await onSubmit(content.trim());
            setContent('');
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Cevap gönderilemedi');
        }
    };

    const handleCancel = () => {
        setContent('');
        setError(null);
        onCancel();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <View style={styles.inputContainer}>
                <TextInput
                    style={[
                        styles.input,
                        error && styles.inputError,
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor={theme.colors.textLight}
                    value={content}
                    onChangeText={(text) => {
                        setContent(text);
                        setError(null);
                    }}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    maxLength={maxLength}
                    editable={!isSubmitting}
                />

                {/* Character Count */}
                <View style={styles.footer}>
                    <View style={styles.characterCountContainer}>
                        <Text
                            style={[
                                styles.characterCount,
                                showWarning && styles.characterCountWarning,
                                characterCount > maxLength && styles.characterCountError,
                            ]}
                        >
                            {characterCount} / {maxLength}
                        </Text>
                        {characterCount < minLength && characterCount > 0 && (
                            <Text style={styles.minLengthHint}>
                                (En az {minLength} karakter gerekli)
                            </Text>
                        )}
                    </View>

                    {error && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={14} color={theme.colors.error} />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancel}
                        disabled={isSubmitting}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.cancelButtonText}>İptal</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            (!isValid || isSubmitting) && styles.submitButtonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={!isValid || isSubmitting}
                        activeOpacity={0.7}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="send" size={18} color="#fff" />
                                <Text style={styles.submitButtonText}>Gönder</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        container: {
            width: '100%',
        },
        inputContainer: {
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 16,
            padding: theme.spacing.lg,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
        },
        input: {
            backgroundColor: theme.colors.background,
            borderRadius: 12,
            padding: theme.spacing.md,
            fontSize: 15,
            color: theme.colors.text,
            borderWidth: 1,
            borderColor: theme.colors.border,
            minHeight: 120,
            maxHeight: 200,
            textAlignVertical: 'top',
        },
        inputError: {
            borderColor: theme.colors.error,
        },
        footer: {
            marginTop: theme.spacing.sm,
            gap: theme.spacing.xs,
        },
        characterCountContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: theme.spacing.xs,
        },
        characterCount: {
            fontSize: 12,
            color: theme.colors.textSecondary,
        },
        minLengthHint: {
            fontSize: 11,
            color: theme.colors.textLight,
            fontStyle: 'italic',
        },
        characterCountWarning: {
            color: theme.colors.warning || '#F59E0B',
        },
        characterCountError: {
            color: theme.colors.error,
            fontWeight: '600',
        },
        errorContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: theme.spacing.sm,
            paddingVertical: theme.spacing.xs,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: 8,
        },
        errorText: {
            fontSize: 12,
            color: theme.colors.error,
            flex: 1,
        },
        actions: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: theme.spacing.sm,
            marginTop: theme.spacing.md,
        },
        cancelButton: {
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.sm,
            borderRadius: 12,
            backgroundColor: theme.colors.background,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        cancelButtonText: {
            fontSize: 15,
            fontWeight: '600',
            color: theme.colors.textSecondary,
        },
        submitButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.sm,
            borderRadius: 12,
            backgroundColor: theme.colors.primary,
            minWidth: 100,
            justifyContent: 'center',
        },
        submitButtonDisabled: {
            opacity: 0.5,
        },
        submitButtonText: {
            fontSize: 15,
            fontWeight: '600',
            color: '#fff',
        },
    });
