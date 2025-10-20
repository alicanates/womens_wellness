import { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Share,
    RefreshControl,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { qnaService } from '@/services/api';
import {
    useQuestion,
    useAnswers,
    useQuestionComments,
    useCreateAnswer,
    useCreateQuestionComment,
    useCreateAnswerComment,
    useMarkBestAnswer,
    useVoteAnswer,
    useFavoriteQuestion,
    useUnfavoriteQuestion,
    useFollowQuestion,
    useUnfollowQuestion,
    useReportContent,
} from '@/hooks/useQna';
import {
    AnswerCard,
    CommentList,
    CommentInput,
    AnswerInput,
    CategoryPill,
    TagChip,
    ShareSheet,
    ReportModal,
    RelatedQuestions,
    AnswerListSkeleton,
    ErrorState,
    EmptyState,
    OfflineBanner,
    OptimizedAvatar,
} from '@/components/qna';
import { VoteType, ContentType } from '@/types/qna';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export default function QuestionDetailScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuthStore();
    const { isConnected } = useNetworkStatus();

    // CRITICAL FIX: Always use a valid string for questionId to prevent hook count changes
    // Use 'INVALID_ID' instead of empty string to ensure hooks are always enabled with same count
    const questionId = typeof id === 'string' && id.length > 0 ? id : 'INVALID_ID';
    const hasValidId = typeof id === 'string' && id.length > 0;

    // State - ALL useState calls MUST be unconditional
    const [showComments, setShowComments] = useState(false);
    const [showAnswerInput, setShowAnswerInput] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [answerCommentsMap, setAnswerCommentsMap] = useState<Record<string, any[]>>({});
    const [showShareSheet, setShowShareSheet] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [shareContent, setShareContent] = useState<{ title: string; url: string } | null>(null);
    const [reportContent, setReportContent] = useState<{ id: string; type: ContentType } | null>(null);

    // Queries - MUST be called unconditionally with stable enabled flag
    // CRITICAL: Use hasValidId (stable boolean) instead of !!questionId to prevent hook count changes
    const { data: question, isLoading: questionLoading, refetch: refetchQuestion } = useQuestion(questionId, {
        enabled: hasValidId,
    });
    const { data: answers = [], isLoading: answersLoading, refetch: refetchAnswers } = useAnswers(questionId, 'best', {
        enabled: hasValidId,
    });

    // Load comments for all answers (only once when answers change)
    useEffect(() => {
        const loadAnswerComments = async () => {
            if (answers.length > 0) {
                const answerIds = answers.map(a => a.id).sort().join(',');
                const currentIds = Object.keys(answerCommentsMap).sort().join(',');

                // Only load if answer IDs changed
                if (answerIds !== currentIds) {
                    const commentsMap: Record<string, any[]> = {};
                    for (const answer of answers) {
                        try {
                            const comments = await qnaService.getAnswerComments(answer.id);
                            commentsMap[answer.id] = comments;
                        } catch (error) {
                            console.error(`Failed to load comments for answer ${answer.id}:`, error);
                            commentsMap[answer.id] = [];
                        }
                    }
                    setAnswerCommentsMap(commentsMap);
                }
            }
        };
        loadAnswerComments();
    }, [answers.length]);
    const { data: comments = [], isLoading: commentsLoading, refetch: refetchComments } = useQuestionComments(questionId, {
        enabled: hasValidId,
    });

    // Mutations - MUST be called unconditionally
    const createAnswer = useCreateAnswer();
    const createQuestionComment = useCreateQuestionComment();
    const createAnswerComment = useCreateAnswerComment();
    const markBestAnswer = useMarkBestAnswer();
    const voteAnswer = useVoteAnswer();
    const favoriteQuestion = useFavoriteQuestion();
    const unfavoriteQuestion = useUnfavoriteQuestion();
    const followQuestion = useFollowQuestion();
    const unfollowQuestion = useUnfollowQuestion();
    const reportContentMutation = useReportContent();

    // Derived state - AFTER all hooks
    const isQuestionAuthor = user?.id === question?.userId;
    const answerCount = answers.length;
    const styles = createStyles(theme);

    // Check if user can answer (minimum 3 minutes between answers)
    const userLastAnswer = answers
        .filter(a => a.userId === user?.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    const canAnswer = !userLastAnswer ||
        (Date.now() - new Date(userLastAnswer.createdAt).getTime()) >= 3 * 60 * 1000; // 3 minutes

    const timeUntilCanAnswer = userLastAnswer
        ? Math.ceil((3 * 60 * 1000 - (Date.now() - new Date(userLastAnswer.createdAt).getTime())) / 1000 / 60)
        : 0;

    // Track view count on mount - useEffect MUST be unconditional
    useEffect(() => {
        if (questionId) {
            // View count is tracked automatically by backend when fetching question
        }
    }, [questionId]);

    // Handlers
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([refetchQuestion(), refetchAnswers(), refetchComments()]);
        setRefreshing(false);
    }, [refetchQuestion, refetchAnswers, refetchComments]);

    const handleSubmitAnswer = async (content: string) => {
        // Check if user can answer
        if (!canAnswer) {
            Alert.alert(
                'Bekleyin',
                `Aynı soruya tekrar cevap verebilmek için ${timeUntilCanAnswer} dakika beklemelisiniz.`
            );
            return;
        }

        await createAnswer.mutateAsync({
            questionId: questionId,
            data: { content },
        });
        setShowAnswerInput(false);
        Alert.alert('Başarılı', 'Cevabınız gönderildi');
    };

    const handleSubmitQuestionComment = async (content: string) => {
        await createQuestionComment.mutateAsync({
            questionId: questionId,
            data: { content },
        });
        Alert.alert('Başarılı', 'Yorumunuz eklendi');
    };

    const handleSubmitAnswerComment = async (answerId: string, content: string) => {
        await createAnswerComment.mutateAsync({
            answerId,
            data: { content },
        });
        // Refresh answer comments
        const answerComments = await qnaService.getAnswerComments(answerId);
        setAnswerCommentsMap(prev => ({ ...prev, [answerId]: answerComments }));
    };

    const handleMarkBest = async (answerId: string) => {
        try {
            console.log('🎯 handleMarkBest called:', { answerId, questionId });

            // Check if user is the question author
            if (!isQuestionAuthor) {
                Alert.alert('Uyarı', 'Sadece soru sahibi en iyi cevabı seçebilir');
                return;
            }

            // Check if there's already a best answer
            const hasBestAnswer = answers.some(a => a.isBestAnswer);
            console.log('📊 Current answers state:', answers.map(a => ({ id: a.id, isBestAnswer: a.isBestAnswer })));

            if (hasBestAnswer) {
                Alert.alert(
                    'Dikkat',
                    'Zaten bir en iyi cevap seçilmiş. Değiştirmek istiyor musunuz?',
                    [
                        { text: 'İptal', style: 'cancel' },
                        {
                            text: 'Değiştir',
                            onPress: async () => {
                                try {
                                    console.log('🔄 Calling markBestAnswer API...');
                                    const result = await markBestAnswer.mutateAsync({ answerId, questionId: questionId });
                                    console.log('✅ API Success:', result);

                                    // Force immediate refetch to update UI
                                    await refetchAnswers();
                                    await refetchQuestion();

                                    Alert.alert('Başarılı', 'En iyi cevap güncellendi');
                                } catch (error: any) {
                                    console.error('❌ API Error:', error);
                                    const errorMessage = error.message || 'İşlem başarısız';
                                    Alert.alert('Hata', errorMessage);
                                }
                            },
                        },
                    ]
                );
            } else {
                console.log('🔄 Calling markBestAnswer API (first time)...');
                const result = await markBestAnswer.mutateAsync({ answerId, questionId: questionId });
                console.log('✅ API Success:', result);

                // Force immediate refetch to update UI
                await refetchAnswers();
                await refetchQuestion();

                Alert.alert('Başarılı', 'Cevap en iyi cevap olarak işaretlendi');
            }
        } catch (error: any) {
            const errorMessage = error.message || 'İşlem başarısız';

            if (errorMessage.includes('soru sahibi')) {
                Alert.alert('Uyarı', 'Sadece soru sahibi en iyi cevabı seçebilir');
            } else if (errorMessage.includes('bulunamadı')) {
                Alert.alert('Hata', 'Cevap veya soru bulunamadı');
            } else {
                Alert.alert('Hata', errorMessage);
            }
        }
    };

    const handleVote = async (answerId: string, voteType: VoteType) => {
        try {
            // Find the answer to check if it's user's own answer
            const answer = answers.find(a => a.id === answerId);
            if (!answer) return;

            // Check if user is trying to vote on their own answer
            if (user?.id === answer.userId) {
                Alert.alert('Uyarı', 'Kendi cevabınıza oy veremezsiniz');
                return;
            }

            // Vote or change vote
            await voteAnswer.mutateAsync({ answerId, data: { voteType } });
        } catch (error: any) {
            // Handle specific error messages
            const errorMessage = error.message || 'Oy verilemedi';

            if (errorMessage.includes('kendi cevabınıza')) {
                Alert.alert('Uyarı', 'Kendi cevabınıza oy veremezsiniz');
            } else if (errorMessage.includes('bulunamadı')) {
                Alert.alert('Hata', 'Cevap bulunamadı');
            } else {
                Alert.alert('Hata', errorMessage);
            }
        }
    };

    const handleFavorite = async () => {
        try {
            if (question?.isFavorited) {
                // Unfavorite (backend auto-unfollows)
                await unfavoriteQuestion.mutateAsync(questionId);
            } else {
                // Favorite (backend auto-follows)
                await favoriteQuestion.mutateAsync(questionId);
            }
        } catch (error: any) {
            Alert.alert('Hata', error.message || 'İşlem başarısız');
        }
    };

    const handleShare = () => {
        setShareContent({
            title: question?.title || '',
            url: `https://app.wellnesscompanion.com/community/${questionId}`,
        });
        setShowShareSheet(true);
    };

    const handleShareAnswer = (answerId: string, answerContent: string) => {
        const preview = answerContent.length > 100
            ? answerContent.substring(0, 100) + '...'
            : answerContent;
        setShareContent({
            title: `${question?.title} - Cevap: ${preview}`,
            url: `https://app.wellnesscompanion.com/community/${questionId}#answer-${answerId}`,
        });
        setShowShareSheet(true);
    };

    const handleShareComplete = async () => {
        // Track share event
        try {
            await qnaService.trackShare(questionId);
        } catch (error) {
            console.error('Failed to track share:', error);
        }
    };

    const handleReport = () => {
        setReportContent({
            id: questionId,
            type: ContentType.QUESTION,
        });
        setShowReportModal(true);
    };

    const handleReportAnswer = (answerId: string) => {
        setReportContent({
            id: answerId,
            type: ContentType.ANSWER,
        });
        setShowReportModal(true);
    };

    const handleReportComment = (commentId: string) => {
        setReportContent({
            id: commentId,
            type: ContentType.COMMENT,
        });
        setShowReportModal(true);
    };

    const handleSubmitReport = async (reason: string, description?: string) => {
        if (!reportContent) return;

        const reportData = {
            contentId: reportContent.id,
            contentType: reportContent.type,
            reason,
            description,
        };

        console.log('📤 Sending report:', reportData);

        try {
            const result = await reportContentMutation.mutateAsync(reportData);
            console.log('✅ Report success:', result);
            Alert.alert('Başarılı', 'Raporunuz alındı. İnceleme yapılacaktır.');
        } catch (error: any) {
            console.error('❌ Report error:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            Alert.alert('Hata', error.message || 'Rapor gönderilemedi');
        }
    };

    // Loading state - render after all hooks
    if (questionLoading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <Stack.Screen options={{ title: 'Yükleniyor...' }} />
                <OfflineBanner />
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.questionCard}>
                        <AnswerListSkeleton count={1} />
                    </View>
                    <View style={styles.answersSection}>
                        <AnswerListSkeleton count={2} />
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // Error state - render after all hooks
    if (!question) {
        const errorType = !isConnected ? 'network' : 'not-found';
        return (
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <Stack.Screen options={{ title: 'Hata' }} />
                <OfflineBanner />
                <ErrorState
                    type={errorType}
                    title={errorType === 'not-found' ? 'Soru Bulunamadı' : undefined}
                    message={errorType === 'not-found' ? 'Bu soru silinmiş veya mevcut değil.' : undefined}
                    onRetry={errorType === 'network' ? () => refetchQuestion() : undefined}
                    showRetry={errorType === 'network'}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: question?.title || 'Soru',
                    headerTitleStyle: {
                        fontSize: 16,
                    },
                    headerBackVisible: true,
                    headerBackTitle: 'Geri',
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', gap: 12, marginRight: 16 }}>
                            <TouchableOpacity onPress={handleReport}>
                                <Text style={{ fontSize: 24 }}>🚩</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleShare}>
                                <Text style={{ fontSize: 24 }}>📤</Text>
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />
            <OfflineBanner />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={100}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={theme.colors.primary}
                        />
                    }
                >
                    {/* Question Card */}
                    <View style={styles.questionCard}>
                        {/* Author Info */}
                        <View style={styles.authorSection}>
                            <OptimizedAvatar
                                imageUrl={question.user?.profilePictureUrl}
                                displayName={question.user?.displayName}
                                size={44}
                                isAnonymous={question.isAnonymous}
                            />
                            <View style={styles.authorInfo}>
                                <Text style={styles.authorName}>
                                    {question.isAnonymous ? 'Anonim Kullanıcı' : question.user?.displayName}
                                </Text>
                                <Text style={styles.timestamp}>{formatTimestamp(question.createdAt)}</Text>
                            </View>
                            {question.isPremium && (
                                <View style={styles.premiumBadge}>
                                    <Text style={{ fontSize: 12 }}>⭐</Text>
                                </View>
                            )}
                        </View>

                        {/* Title */}
                        <Text style={styles.questionTitle}>{question.title}</Text>

                        {/* Content */}
                        <Text style={styles.questionContent}>{question.content}</Text>

                        {/* Category and Tags */}
                        <View style={styles.tagsContainer}>
                            <CategoryPill category={question.category} />
                            {question.tags.map((tag) => (
                                <TagChip key={tag} tag={tag} />
                            ))}
                        </View>

                        {/* Stats */}
                        <View style={styles.statsRow}>
                            <View style={styles.stat}>
                                <Text style={{ fontSize: 16 }}>👁️</Text>
                                <Text style={styles.statText}>{question.viewCount} görüntülenme</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={{ fontSize: 16 }}>💬</Text>
                                <Text style={styles.statText}>{answerCount} cevap</Text>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionButton, question.isFavorited && styles.actionButtonActive]}
                                onPress={handleFavorite}
                            >
                                <Text style={{ fontSize: 20 }}>
                                    {question.isFavorited ? '❤️' : '🤍'}
                                </Text>
                                <Text style={[styles.actionButtonText, question.isFavorited && styles.actionButtonTextActive]}>
                                    {question.isFavorited ? 'Favorilerde' : 'Favorile'}
                                </Text>
                                {question.isFavorited && (
                                    <Text style={{ fontSize: 12, marginLeft: 4 }}>🔔</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                                <Text style={{ fontSize: 20 }}>📤</Text>
                                <Text style={styles.actionButtonText}>Paylaş</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.reportButton]}
                                onPress={handleReport}
                            >
                                <Text style={{ fontSize: 20 }}>🚩</Text>
                                <Text style={[styles.actionButtonText, styles.reportButtonText]}>Bildir</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Comments Section */}
                        <View style={styles.commentsSection}>
                            <TouchableOpacity
                                style={styles.commentsHeader}
                                onPress={() => setShowComments(!showComments)}
                            >
                                <Text style={styles.commentsTitle}>
                                    Yorumlar ({comments.length})
                                </Text>
                                <Text style={{ fontSize: 20 }}>
                                    {showComments ? '⬆️' : '⬇️'}
                                </Text>
                            </TouchableOpacity>

                            {showComments && (
                                <>
                                    <CommentList
                                        comments={comments}
                                        loading={commentsLoading}
                                        onReportComment={handleReportComment}
                                    />
                                    <View style={styles.commentInputContainer}>
                                        <CommentInput
                                            onSubmit={handleSubmitQuestionComment}
                                            isSubmitting={createQuestionComment.isPending}
                                            placeholder="Soruya yorum yap..."
                                        />
                                    </View>
                                </>
                            )}
                        </View>
                    </View>

                    {/* Answers Section */}
                    <View style={styles.answersSection}>
                        <View style={styles.answersSectionHeader}>
                            <Text style={styles.sectionTitle}>
                                Cevaplar ({answerCount})
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.answerButton,
                                    !canAnswer && styles.answerButtonDisabled
                                ]}
                                onPress={() => {
                                    if (!canAnswer) {
                                        Alert.alert(
                                            'Bekleyin',
                                            `Aynı soruya tekrar cevap verebilmek için ${timeUntilCanAnswer} dakika beklemelisiniz.`
                                        );
                                        return;
                                    }
                                    setShowAnswerInput(!showAnswerInput);
                                }}
                                disabled={!canAnswer}
                            >
                                <Text style={{ fontSize: 20 }}>➕</Text>
                                <Text style={[
                                    styles.answerButtonText,
                                    !canAnswer && styles.answerButtonTextDisabled
                                ]}>
                                    {canAnswer ? 'Cevap Ver' : `Bekleyin (${timeUntilCanAnswer}dk)`}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Answer Input */}
                        {showAnswerInput && (
                            <View style={styles.answerInputContainer}>
                                <AnswerInput
                                    onSubmit={handleSubmitAnswer}
                                    onCancel={() => setShowAnswerInput(false)}
                                    isSubmitting={createAnswer.isPending}
                                />
                            </View>
                        )}

                        {/* Answers List */}
                        {answersLoading ? (
                            <AnswerListSkeleton count={2} />
                        ) : answers.length === 0 ? (
                            <EmptyState
                                type="answers"
                                actionLabel="Cevap Ver"
                                onAction={() => setShowAnswerInput(true)}
                            />
                        ) : (
                            answers.map((answer, index) => (
                                <AnswerCard
                                    key={`${answer.id}-${answer.isBestAnswer}-${index}`}
                                    answer={answer}
                                    isQuestionAuthor={isQuestionAuthor}
                                    onMarkBest={
                                        isQuestionAuthor && !answer.isBestAnswer
                                            ? () => handleMarkBest(answer.id)
                                            : undefined
                                    }
                                    onVote={(voteType) => handleVote(answer.id, voteType)}
                                    onShare={() => handleShareAnswer(answer.id, answer.content)}
                                    onReport={() => handleReportAnswer(answer.id)}
                                    comments={answerCommentsMap[answer.id] || []}
                                    onSubmitComment={(content) => handleSubmitAnswerComment(answer.id, content)}
                                    isSubmittingComment={createAnswerComment.isPending}
                                />
                            ))
                        )}
                    </View>

                    {/* Related Questions */}
                    {question && (
                        <RelatedQuestions
                            currentQuestionId={question.id}
                            category={question.category}
                            tags={question.tags}
                            limit={5}
                        />
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Share Sheet */}
            {shareContent && (
                <ShareSheet
                    visible={showShareSheet}
                    onClose={() => {
                        setShowShareSheet(false);
                        setShareContent(null);
                    }}
                    title={shareContent.title}
                    shareUrl={shareContent.url}
                    onShareComplete={handleShareComplete}
                />
            )}

            {/* Report Modal */}
            {reportContent && (
                <ReportModal
                    visible={showReportModal}
                    onClose={() => {
                        setShowReportModal(false);
                        setReportContent(null);
                    }}
                    contentId={reportContent.id}
                    contentType={reportContent.type}
                    onSubmit={handleSubmitReport}
                />
            )}
        </SafeAreaView>
    );
}

function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;

    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
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
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: theme.spacing.xl,
        },
        headerButton: {
            padding: theme.spacing.sm,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
        errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
        errorText: {
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.text,
            marginTop: theme.spacing.md,
            marginBottom: theme.spacing.lg,
        },
        backButton: {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.md,
            borderRadius: 12,
        },
        backButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: '#fff',
        },
        questionCard: {
            backgroundColor: theme.colors.backgroundCard,
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.md,
        },
        authorSection: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        avatar: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        avatarText: {
            fontSize: 18,
            fontWeight: '700',
            color: '#fff',
        },
        anonymousAvatar: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.border,
            justifyContent: 'center',
            alignItems: 'center',
        },
        authorInfo: {
            flex: 1,
            marginLeft: theme.spacing.sm,
        },
        authorName: {
            fontSize: 15,
            fontWeight: '600',
            color: theme.colors.text,
        },
        timestamp: {
            fontSize: 12,
            color: theme.colors.textLight,
            marginTop: 2,
        },
        premiumBadge: {
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        questionTitle: {
            fontSize: 22,
            fontWeight: '700',
            color: theme.colors.text,
            lineHeight: 30,
            marginBottom: theme.spacing.md,
        },
        questionContent: {
            fontSize: 16,
            color: theme.colors.text,
            lineHeight: 24,
            marginBottom: theme.spacing.lg,
        },
        tagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.xs,
            marginBottom: theme.spacing.lg,
        },
        statsRow: {
            flexDirection: 'row',
            gap: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: theme.colors.border,
            marginBottom: theme.spacing.md,
        },
        stat: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        statText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        actionButtons: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.lg,
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: 12,
            backgroundColor: theme.colors.background,
            borderWidth: 1,
            borderColor: theme.colors.border,
        },
        actionButtonActive: {
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderColor: theme.colors.primary,
        },
        actionButtonText: {
            fontSize: 13,
            fontWeight: '500',
            color: theme.colors.textSecondary,
        },
        actionButtonTextActive: {
            color: theme.colors.primary,
        },
        reportButton: {
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: '#ef4444',
        },
        reportButtonText: {
            color: '#ef4444',
            fontWeight: '600',
        },
        commentsSection: {
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            paddingTop: theme.spacing.md,
        },
        commentsHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.md,
        },
        commentsTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
        },
        commentInputContainer: {
            marginTop: theme.spacing.md,
        },
        answersSection: {
            padding: theme.spacing.lg,
        },
        answersSectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.lg,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: theme.colors.text,
        },
        answerButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            borderRadius: 12,
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
        },
        answerButtonDisabled: {
            backgroundColor: theme.colors.background,
            opacity: 0.5,
        },
        answerButtonText: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.primary,
        },
        answerButtonTextDisabled: {
            color: theme.colors.textSecondary,
        },
        answerInputContainer: {
            marginBottom: theme.spacing.lg,
        },
        emptyContainer: {
            alignItems: 'center',
            padding: theme.spacing.xl,
        },
        emptyText: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.md,
        },
        emptySubtext: {
            fontSize: 14,
            color: theme.colors.textLight,
            marginTop: theme.spacing.xs,
        },
    });
