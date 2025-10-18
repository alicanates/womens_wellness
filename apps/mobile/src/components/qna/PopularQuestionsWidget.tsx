import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuestions } from '@/hooks/useQna';
import { QuestionCategory } from '@/types/qna';

interface PopularQuestionsWidgetProps {
    category?: QuestionCategory;
    limit?: number;
    showHeader?: boolean;
    onSeeAll?: () => void;
    visible?: boolean;
}

export function PopularQuestionsWidget({
    category,
    limit = 5,
    showHeader = true,
    onSeeAll,
    visible = true,
}: PopularQuestionsWidgetProps) {
    const { data, isLoading } = useQuestions(
        {
            category,
            sort: 'popular',
            limit,
        },
        {
            staleTime: 10 * 60 * 1000, // 10 minutes
        }
    );

    // Don't render if not visible (but hooks are still called)
    if (!visible) {
        return null;
    }

    // Don't render anything if no data (but hooks are still called)
    if (!isLoading && !data?.questions.length) {
        return null;
    }

    if (isLoading) {
        return (
            <View style={styles.container}>
                {showHeader && <Text style={styles.title}>Popüler Sorular</Text>}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#8B5CF6" />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {showHeader && (
                <View style={styles.header}>
                    <Text style={styles.title}>Popüler Sorular</Text>
                    {onSeeAll && (
                        <TouchableOpacity onPress={onSeeAll}>
                            <Text style={styles.seeAllText}>Tümünü Gör</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <View style={styles.questionsContainer}>
                {data.questions.map((question, index) => (
                    <TouchableOpacity
                        key={question.id}
                        style={[
                            styles.questionItem,
                            index !== data.questions.length - 1 && styles.questionItemBorder,
                        ]}
                        onPress={() => router.push(`/community/${question.id}`)}
                    >
                        <View style={styles.questionContent}>
                            <Text style={styles.questionTitle} numberOfLines={2}>
                                {question.title}
                            </Text>
                            <View style={styles.questionMeta}>
                                <View style={styles.metaItem}>
                                    <Ionicons name="chatbubble-outline" size={14} color="#6B7280" />
                                    <Text style={styles.metaText}>{question._count?.answers || 0}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Ionicons name="eye-outline" size={14} color="#6B7280" />
                                    <Text style={styles.metaText}>{question.viewCount}</Text>
                                </View>
                                {question.status === 'ANSWERED' && (
                                    <View style={styles.answeredBadge}>
                                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                                        <Text style={styles.answeredText}>Cevaplanmış</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    seeAllText: {
        fontSize: 14,
        color: '#8B5CF6',
        fontWeight: '600',
    },
    loadingContainer: {
        paddingVertical: 32,
        alignItems: 'center',
    },
    questionsContainer: {
        gap: 0,
    },
    questionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    questionItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    questionContent: {
        flex: 1,
        marginRight: 12,
    },
    questionTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 8,
    },
    questionMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: '#6B7280',
    },
    answeredBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    answeredText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '500',
    },
});
