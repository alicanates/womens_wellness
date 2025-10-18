import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface CommentInputProps {
    onSubmit: (content: string) => Promise<void>;
    isSubmitting?: boolean;
    placeholder?: string;
    maxLength?: number;
    autoFocus?: boolean;
}

export function CommentInput({
    onSubmit,
    isSubmitting = false,
    placeholder = 'Yorum yap... (max 300 karakter)',
    maxLength = 300,
    autoFocus = false,
}: CommentInputProps) {
    const theme = useTheme();
    const styles = createStyles(theme);
    const [content, setContent] = useState('');
    const [error, setError] = useState<string | null>(null);

    const characterCount = content.length;
    const isValid = content.trim().length > 0 && characterCount <= maxLength;
    const showWarning = characterCount > maxLength * 0.9;

    const handleSubmit = async () => {
        setError(null);

        if (!content.trim()) {
            setError('Lütfen yorum içeriğini girin');
            return;
        }

        if (characterCount > maxLength) {
            setError(`Yorum en fazla ${maxLength} karakter olabilir`);
            return;
        }

        try {
            await onSubmit(content.trim());
            setContent('');
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Yorum eklenemedi');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputRow}>
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
                    maxLength={maxLength}
                    multiline
                    numberOfLines={2}
                    editable={!isSubmitting}
                    autoFocus={autoFocus}
                />

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
                        <Ionicons name="send" size={20} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>

            {/* Character Count & Error */}
            <View style={styles.footer}>
                <Text
                    style={[
                        styles.characterCount,
                        showWarning && styles.characterCountWarning,
                        characterCount > maxLength && styles.characterCountError,
                    ]}
                >
                    {characterCount} / {maxLength}
                </Text>

                {error && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={12} color={theme.colors.error} />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        container: {
            width: '100%',
            gap: theme.spacing.xs,
        },
        inputRow: {
            flexDirection: 'row',
            gap: theme.spacing.sm,
            alignItems: 'flex-end',
        },
        input: {
            flex: 1,
            backgroundColor: theme.colors.background,
            borderRadius: 12,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            fontSize: 14,
            color: theme.colors.text,
            borderWidth: 1,
            borderColor: theme.colors.border,
            minHeight: 40,
            maxHeight: 100,
            textAlignVertical: 'top',
        },
        inputError: {
            borderColor: theme.colors.error,
        },
        submitButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        submitButtonDisabled: {
            opacity: 0.5,
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.sm,
            gap: theme.spacing.sm,
        },
        characterCount: {
            fontSize: 11,
            color: theme.colors.textSecondary,
        },
        characterCountWarning: {
            color: theme.colors.warning || '#F59E0B',
            fontWeight: '500',
        },
        characterCountError: {
            color: theme.colors.error,
            fontWeight: '600',
        },
        errorContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            flex: 1,
        },
        errorText: {
            fontSize: 11,
            color: theme.colors.error,
            flex: 1,
        },
    });
