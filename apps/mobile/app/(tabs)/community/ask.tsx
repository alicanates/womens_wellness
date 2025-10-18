import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useCreateQuestion, useQnaQuota } from '@/hooks/useQna';
import { useQnaStore } from '@/store/qnaStore';
import { QuestionCategory } from '@/types/qna';
import { useAuthStore } from '@/store/authStore';
import { subscriptionService } from '@/services/api';

const CATEGORY_LABELS: Record<QuestionCategory, { label: string; icon: string }> = {
    [QuestionCategory.MENSTRUAL_HEALTH]: { label: 'Regl Sağlığı', icon: '🩸' },
    [QuestionCategory.PREGNANCY]: { label: 'Hamilelik', icon: '🤰' },
    [QuestionCategory.FERTILITY]: { label: 'Doğurganlık', icon: '🌸' },
    [QuestionCategory.NUTRITION]: { label: 'Beslenme', icon: '🥗' },
    [QuestionCategory.EXERCISE]: { label: 'Egzersiz', icon: '💪' },
    [QuestionCategory.MENTAL_HEALTH]: { label: 'Ruh Sağlığı', icon: '🧠' },
    [QuestionCategory.SLEEP]: { label: 'Uyku', icon: '😴' },
    [QuestionCategory.CONTRACEPTION]: { label: 'Doğum Kontrolü', icon: '💊' },
    [QuestionCategory.PMS]: { label: 'PMS', icon: '😣' },
    [QuestionCategory.MENOPAUSE]: { label: 'Menopoz', icon: '🌡️' },
    [QuestionCategory.SEXUAL_HEALTH]: { label: 'Cinsel Sağlık', icon: '❤️' },
    [QuestionCategory.GENERAL]: { label: 'Genel', icon: '💬' },
};

export default function AskQuestionScreen() {
    const theme = useTheme();
    const styles = createStyles(theme);
    const router = useRouter();
    const { user } = useAuthStore();

    // Store
    const { draftQuestion, setDraftQuestion, clearDraftQuestion } = useQnaStore();

    // API hooks
    const createQuestionMutation = useCreateQuestion();
    const { data: quota, isLoading: quotaLoading } = useQnaQuota();

    // Check premium status
    const [isPremium, setIsPremium] = useState(false);
    const [checkingPremium, setCheckingPremium] = useState(true);

    useEffect(() => {
        const checkPremiumStatus = async () => {
            try {
                const subscription = await subscriptionService.getStatus();
                setIsPremium(subscription.status === 'ACTIVE');
            } catch (error) {
                setIsPremium(false);
            } finally {
                setCheckingPremium(false);
            }
        };
        checkPremiumStatus();
    }, []);

    // Form state
    const [title, setTitle] = useState(draftQuestion?.title || '');
    const [content, setContent] = useState(draftQuestion?.content || '');
    const [category, setCategory] = useState<QuestionCategory | undefined>(draftQuestion?.category);
    const [tags, setTags] = useState<string[]>(draftQuestion?.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(draftQuestion?.isAnonymous || false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Check if user has reached quota
    const quotaLimit = quota?.limit || 0;
    const quotaUsed = quota?.questionsAsked || 0;
    const quotaRemaining = quota?.remaining || 0;
    const quotaExceeded = quotaRemaining <= 0;

    // Debug log
    useEffect(() => {
        if (quota) {
            console.log('Quota data:', JSON.stringify(quota, null, 2));
            console.log('isPremium:', isPremium);
            console.log('quotaLimit:', quotaLimit);
            console.log('quotaRemaining:', quotaRemaining);
        }
    }, [quota, isPremium, quotaLimit, quotaRemaining]);

    // Auto-save draft
    useEffect(() => {
        const timer = setTimeout(() => {
            if (title || content) {
                setDraftQuestion({
                    title,
                    content,
                    category,
                    tags,
                    isAnonymous,
                });
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [title, content, category, tags, isAnonymous]);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!title.trim()) {
            newErrors.title = 'Başlık gerekli';
        } else if (title.trim().length < 10) {
            newErrors.title = 'Başlık en az 10 karakter olmalı';
        } else if (title.trim().length > 200) {
            newErrors.title = 'Başlık en fazla 200 karakter olabilir';
        }

        if (!content.trim()) {
            newErrors.content = 'Açıklama gerekli';
        } else if (content.trim().length < 20) {
            newErrors.content = 'Açıklama en az 20 karakter olmalı';
        } else if (content.trim().length > 5000) {
            newErrors.content = 'Açıklama en fazla 5000 karakter olabilir';
        }

        if (!category) {
            newErrors.category = 'Kategori seçmelisiniz';
        }

        if (tags.length > 5) {
            newErrors.tags = 'En fazla 5 etiket ekleyebilirsiniz';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddTag = () => {
        const trimmedTag = tagInput.trim().toLowerCase();
        if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
            setTags([...tags, trimmedTag]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handlePublish = async () => {
        if (!validateForm()) {
            return;
        }

        if (quotaExceeded && quotaLimit > 0) {
            Alert.alert(
                'Aylık soru limitinize ulaştınız',
                isPremium
                    ? `Premium üyeler ayda ${quotaLimit} soru sorabilir. Limitiniz gelecek ay yenilenecek.`
                    : `Ücretsiz üyeler ayda ${quotaLimit} soru sorabilir. Premium'a geçerek daha fazla soru sorabilirsiniz.`,
                [
                    {
                        text: 'Tamam',
                        style: 'cancel',
                    },
                    ...(!isPremium ? [{
                        text: "Premium'a Geç",
                        onPress: () => router.push('/premium'),
                    }] : []),
                ]
            );
            return;
        }

        try {
            await createQuestionMutation.mutateAsync({
                title: title.trim(),
                content: content.trim(),
                category: category!,
                tags: tags.length > 0 ? tags : undefined,
                isAnonymous,
            });

            clearDraftQuestion();

            // Navigate back first
            router.back();

            // Show success message after navigation
            setTimeout(() => {
                Alert.alert('Başarılı', 'Sorunuz yayınlandı ve toplulukta görünecek');
            }, 300);
        } catch (error: any) {
            Alert.alert(
                'Hata',
                error.message || 'Soru oluşturulamadı. Lütfen tekrar deneyin.'
            );
        }
    };

    const categories = Object.values(QuestionCategory);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <Stack.Screen
                options={{
                    title: 'Soru Sor',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Text style={{ fontSize: 24 }}>✖️</Text>
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={handlePublish}
                            disabled={createQuestionMutation.isPending}
                        >
                            {createQuestionMutation.isPending ? (
                                <ActivityIndicator size="small" color={theme.colors.primary} />
                            ) : (
                                <Text style={styles.publishButton}>Yayınla</Text>
                            )}
                        </TouchableOpacity>
                    ),
                }}
            />

            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Quota Display */}
                    {!quotaLoading && !checkingPremium && quota && quotaLimit > 0 && (
                        <View style={[styles.quotaCard, quotaExceeded && styles.quotaCardExceeded]}>
                            <View style={styles.quotaRow}>
                                <Text style={{ fontSize: 20 }}>
                                    {quotaExceeded ? '⚠️' : '✅'}
                                </Text>
                                <Text style={styles.quotaText}>
                                    {quotaRemaining}/{quotaLimit} soru hakkı kaldı
                                </Text>
                            </View>
                            {quotaExceeded && !isPremium && (
                                <TouchableOpacity
                                    style={styles.upgradeButton}
                                    onPress={() => router.push('/premium')}
                                >
                                    <Text style={styles.upgradeButtonText}>Premium'a Geç</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    {/* Title Input */}
                    <View style={styles.section}>
                        <Text style={styles.label}>
                            Başlık <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, errors.title && styles.inputError]}
                            placeholder="Sorunuzu kısaca özetleyin"
                            placeholderTextColor={theme.colors.textSecondary}
                            value={title}
                            onChangeText={(text) => {
                                setTitle(text);
                                if (errors.title) setErrors({ ...errors, title: '' });
                            }}
                            maxLength={200}
                        />
                        <View style={styles.inputFooter}>
                            {errors.title ? (
                                <Text style={styles.errorText}>{errors.title}</Text>
                            ) : (
                                <Text style={styles.hint}>En az 10 karakter</Text>
                            )}
                            <Text style={styles.charCount}>{title.length}/200</Text>
                        </View>
                    </View>

                    {/* Content Input */}
                    <View style={styles.section}>
                        <Text style={styles.label}>
                            Açıklama <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                            style={[styles.input, styles.textArea, errors.content && styles.inputError]}
                            placeholder="Sorunuzu detaylı olarak açıklayın..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={content}
                            onChangeText={(text) => {
                                setContent(text);
                                if (errors.content) setErrors({ ...errors, content: '' });
                            }}
                            multiline
                            numberOfLines={8}
                            textAlignVertical="top"
                            maxLength={5000}
                        />
                        <View style={styles.inputFooter}>
                            {errors.content ? (
                                <Text style={styles.errorText}>{errors.content}</Text>
                            ) : (
                                <Text style={styles.hint}>En az 20 karakter</Text>
                            )}
                            <Text style={styles.charCount}>{content.length}/5000</Text>
                        </View>
                    </View>

                    {/* Category Picker */}
                    <View style={styles.section}>
                        <Text style={styles.label}>
                            Kategori <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={[styles.picker, errors.category && styles.inputError]}
                            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                        >
                            <View style={styles.pickerContent}>
                                {category && (
                                    <Text style={styles.categoryIcon}>
                                        {CATEGORY_LABELS[category].icon}
                                    </Text>
                                )}
                                <Text
                                    style={[
                                        styles.pickerText,
                                        !category && styles.pickerPlaceholder,
                                    ]}
                                >
                                    {category ? CATEGORY_LABELS[category].label : 'Kategori Seçin'}
                                </Text>
                            </View>
                            <Text style={{ fontSize: 20 }}>
                                {showCategoryPicker ? '⬆️' : '⬇️'}
                            </Text>
                        </TouchableOpacity>
                        {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

                        {showCategoryPicker && (
                            <ScrollView style={styles.categoryList} nestedScrollEnabled>
                                {categories.map((cat, index) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.categoryItem,
                                            category === cat && styles.categoryItemSelected,
                                            index === categories.length - 1 && styles.categoryItemLast,
                                        ]}
                                        onPress={() => {
                                            setCategory(cat);
                                            setShowCategoryPicker(false);
                                            if (errors.category) setErrors({ ...errors, category: '' });
                                        }}
                                    >
                                        <View style={styles.categoryItemContent}>
                                            <Text style={styles.categoryItemIcon}>
                                                {CATEGORY_LABELS[cat].icon}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.categoryItemText,
                                                    category === cat && styles.categoryItemTextSelected,
                                                ]}
                                            >
                                                {CATEGORY_LABELS[cat].label}
                                            </Text>
                                        </View>
                                        {category === cat && (
                                            <Text style={{ fontSize: 20 }}>✅</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    {/* Tags Input */}
                    <View style={styles.section}>
                        <Text style={styles.label}>Etiketler (Opsiyonel)</Text>
                        {tags.length > 0 && (
                            <View style={styles.tagsContainer}>
                                {tags.map((tag) => (
                                    <View key={tag} style={styles.tag}>
                                        <Text style={styles.tagText}>#{tag}</Text>
                                        <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                                            <Text style={{ fontSize: 16 }}>❌</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}
                        {tags.length < 5 && (
                            <View style={styles.tagInputContainer}>
                                <TextInput
                                    style={styles.tagInput}
                                    placeholder="Etiket ekle (Enter'a bas)"
                                    placeholderTextColor={theme.colors.textSecondary}
                                    value={tagInput}
                                    onChangeText={setTagInput}
                                    onSubmitEditing={handleAddTag}
                                    returnKeyType="done"
                                />
                                <TouchableOpacity
                                    style={styles.addTagButton}
                                    onPress={handleAddTag}
                                    disabled={!tagInput.trim()}
                                >
                                    <Text style={{ fontSize: 24, opacity: tagInput.trim() ? 1 : 0.4 }}>➕</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        <Text style={styles.hint}>En fazla 5 etiket ekleyebilirsiniz</Text>
                    </View>

                    {/* Anonymous Toggle */}
                    <TouchableOpacity
                        style={styles.anonymousCard}
                        onPress={() => setIsAnonymous(!isAnonymous)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.anonymousLeft}>
                            <View style={[styles.anonymousIcon, isAnonymous && styles.anonymousIconActive]}>
                                <Text style={{ fontSize: 20 }}>
                                    {isAnonymous ? '🙈' : '👁️'}
                                </Text>
                            </View>
                            <View style={styles.anonymousText}>
                                <Text style={styles.anonymousTitle}>Anonim Olarak Sor</Text>
                                <Text style={styles.anonymousDesc}>Kimliğiniz gizli kalacak</Text>
                            </View>
                        </View>
                        <View style={[styles.switch, isAnonymous && styles.switchActive]}>
                            <View style={[styles.switchThumb, isAnonymous && styles.switchThumbActive]} />
                        </View>
                    </TouchableOpacity>

                    {/* Publish Button */}
                    <TouchableOpacity
                        style={[
                            styles.publishButtonLarge,
                            createQuestionMutation.isPending && styles.publishButtonDisabled,
                        ]}
                        onPress={handlePublish}
                        disabled={createQuestionMutation.isPending}
                        activeOpacity={0.8}
                    >
                        {createQuestionMutation.isPending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Text style={{ fontSize: 20, color: '#fff' }}>📤</Text>
                                <Text style={styles.publishButtonText}>Soruyu Yayınla</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <View style={styles.bottomSpacer} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        container: {
            flex: 1,
        },
        publishButton: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.primary,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            padding: theme.spacing.lg,
        },
        quotaCard: {
            backgroundColor: '#E8F5E9',
            borderRadius: 12,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.lg,
        },
        quotaCardExceeded: {
            backgroundColor: '#FFEBEE',
        },
        quotaRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
        },
        quotaText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.text,
        },
        upgradeButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: 8,
            paddingVertical: theme.spacing.xs,
            paddingHorizontal: theme.spacing.md,
            marginTop: theme.spacing.sm,
            alignSelf: 'flex-start',
        },
        upgradeButtonText: {
            fontSize: 13,
            fontWeight: '600',
            color: '#fff',
        },
        section: {
            marginBottom: theme.spacing.xl,
        },
        label: {
            fontSize: 15,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: theme.spacing.sm,
        },
        required: {
            color: theme.colors.error,
        },
        input: {
            backgroundColor: theme.colors.backgroundCard,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 12,
            padding: theme.spacing.md,
            fontSize: 16,
            color: theme.colors.text,
        },
        inputError: {
            borderColor: theme.colors.error,
        },
        textArea: {
            minHeight: 150,
            textAlignVertical: 'top',
        },
        inputFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: theme.spacing.xs,
        },
        hint: {
            fontSize: 12,
            color: theme.colors.textSecondary,
        },
        errorText: {
            fontSize: 12,
            color: theme.colors.error,
        },
        charCount: {
            fontSize: 12,
            color: theme.colors.textSecondary,
        },
        picker: {
            backgroundColor: theme.colors.backgroundCard,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 12,
            padding: theme.spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        pickerContent: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
        },
        categoryIcon: {
            fontSize: 20,
        },
        pickerText: {
            fontSize: 16,
            color: theme.colors.text,
        },
        pickerPlaceholder: {
            color: theme.colors.textSecondary,
        },
        categoryList: {
            backgroundColor: theme.colors.backgroundCard,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 12,
            marginTop: theme.spacing.sm,
            maxHeight: 250,
        },
        categoryItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        categoryItemLast: {
            borderBottomWidth: 0,
        },
        categoryItemSelected: {
            backgroundColor: theme.colors.primaryLight,
        },
        categoryItemContent: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
        },
        categoryItemIcon: {
            fontSize: 18,
        },
        categoryItemText: {
            fontSize: 15,
            color: theme.colors.text,
        },
        categoryItemTextSelected: {
            fontWeight: '600',
            color: theme.colors.primary,
        },
        tagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.xs,
            marginBottom: theme.spacing.sm,
        },
        tag: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: theme.colors.primaryLight,
            borderRadius: 16,
            paddingVertical: 6,
            paddingHorizontal: 12,
        },
        tagText: {
            fontSize: 14,
            fontWeight: '500',
            color: theme.colors.primary,
        },
        tagInputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.xs,
        },
        tagInput: {
            flex: 1,
            backgroundColor: theme.colors.backgroundCard,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 12,
            padding: theme.spacing.md,
            fontSize: 16,
            color: theme.colors.text,
        },
        addTagButton: {
            padding: 4,
        },
        anonymousCard: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: theme.colors.backgroundCard,
            borderRadius: 12,
            padding: theme.spacing.md,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        anonymousLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            gap: theme.spacing.sm,
        },
        anonymousIcon: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.primaryLight,
            alignItems: 'center',
            justifyContent: 'center',
        },
        anonymousIconActive: {
            backgroundColor: theme.colors.primary,
        },
        anonymousText: {
            flex: 1,
        },
        anonymousTitle: {
            fontSize: 15,
            fontWeight: '600',
            color: theme.colors.text,
        },
        anonymousDesc: {
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginTop: 2,
        },
        switch: {
            width: 50,
            height: 28,
            borderRadius: 14,
            backgroundColor: theme.colors.border,
            padding: 2,
            justifyContent: 'center',
        },
        switchActive: {
            backgroundColor: theme.colors.primary,
        },
        switchThumb: {
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: '#fff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
        },
        switchThumbActive: {
            alignSelf: 'flex-end',
        },
        publishButtonLarge: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing.sm,
            backgroundColor: theme.colors.primary,
            borderRadius: 12,
            padding: theme.spacing.lg,
            marginTop: theme.spacing.xl,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
        publishButtonDisabled: {
            opacity: 0.6,
        },
        publishButtonText: {
            fontSize: 17,
            fontWeight: '700',
            color: '#fff',
        },
        bottomSpacer: {
            height: 40,
        },
    });
