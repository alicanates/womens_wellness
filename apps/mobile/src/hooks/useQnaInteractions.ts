import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQnaInteractionsStore } from '@/store/qnaInteractionsStore';
import { qnaService } from '@/services/api';
import type { VoteDto, ContentType } from '@/types/qna';
import { VoteType } from '@/types/qna';

/**
 * Hook for managing question favorites with optimistic updates
 */
export function useQuestionFavorite(questionId: string) {
    const queryClient = useQueryClient();
    const { isFavorited, addFavorite, removeFavorite } = useQnaInteractionsStore();

    const favorited = isFavorited(questionId);

    const favoriteMutation = useMutation({
        mutationFn: async () => {
            if (favorited) {
                await qnaService.unfavoriteQuestion(questionId);
            } else {
                await qnaService.favoriteQuestion(questionId);
            }
        },
        onMutate: async () => {
            // Optimistic update
            if (favorited) {
                removeFavorite(questionId);
            } else {
                addFavorite(questionId);
            }
        },
        onError: () => {
            // Rollback on error
            if (favorited) {
                addFavorite(questionId);
            } else {
                removeFavorite(questionId);
            }
        },
        onSuccess: () => {
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['question', questionId] });
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
        },
    });

    return {
        favorited,
        toggleFavorite: favoriteMutation.mutate,
        isLoading: favoriteMutation.isPending,
    };
}

/**
 * Hook for managing question following with optimistic updates
 */
export function useQuestionFollow(questionId: string) {
    const queryClient = useQueryClient();
    const { isFollowingQuestion, addFollowedQuestion, removeFollowedQuestion } =
        useQnaInteractionsStore();

    const following = isFollowingQuestion(questionId);

    const followMutation = useMutation({
        mutationFn: async () => {
            if (following) {
                await qnaService.unfollowQuestion(questionId);
            } else {
                await qnaService.followQuestion(questionId);
            }
        },
        onMutate: async () => {
            // Optimistic update
            if (following) {
                removeFollowedQuestion(questionId);
            } else {
                addFollowedQuestion(questionId);
            }
        },
        onError: () => {
            // Rollback on error
            if (following) {
                addFollowedQuestion(questionId);
            } else {
                removeFollowedQuestion(questionId);
            }
        },
        onSuccess: () => {
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['question', questionId] });
            queryClient.invalidateQueries({ queryKey: ['following'] });
        },
    });

    return {
        following,
        toggleFollow: followMutation.mutate,
        isLoading: followMutation.isPending,
    };
}

/**
 * Hook for managing user following with optimistic updates
 */
export function useUserFollow(userId: string) {
    const queryClient = useQueryClient();
    const { isFollowingUser, addFollowedUser, removeFollowedUser } = useQnaInteractionsStore();

    const following = isFollowingUser(userId);

    const followMutation = useMutation({
        mutationFn: async () => {
            if (following) {
                await qnaService.unfollowUser(userId);
            } else {
                await qnaService.followUser(userId);
            }
        },
        onMutate: async () => {
            // Optimistic update
            if (following) {
                removeFollowedUser(userId);
            } else {
                addFollowedUser(userId);
            }
        },
        onError: () => {
            // Rollback on error
            if (following) {
                addFollowedUser(userId);
            } else {
                removeFollowedUser(userId);
            }
        },
        onSuccess: () => {
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
            queryClient.invalidateQueries({ queryKey: ['following-users'] });
        },
    });

    return {
        following,
        toggleFollow: followMutation.mutate,
        isLoading: followMutation.isPending,
    };
}

/**
 * Hook for managing answer votes with optimistic updates
 */
export function useAnswerVote(answerId: string, currentVoteCount: number) {
    const queryClient = useQueryClient();
    const { getUserVote, setVote, removeVote } = useQnaInteractionsStore();

    const userVote = getUserVote(answerId);

    const voteMutation = useMutation({
        mutationFn: async (voteType: VoteType) => {
            if (userVote === voteType) {
                // Remove vote if clicking same button
                await qnaService.removeVote(answerId);
                return null;
            } else {
                // Add or change vote
                await qnaService.voteAnswer(answerId, { voteType });
                return voteType;
            }
        },
        onMutate: async (voteType) => {
            // Optimistic update
            const previousVote = userVote;

            if (previousVote === voteType) {
                removeVote(answerId);
            } else {
                setVote(answerId, voteType);
            }

            return { previousVote };
        },
        onError: (_error, _variables, context) => {
            // Rollback on error
            if (context?.previousVote) {
                setVote(answerId, context.previousVote);
            } else {
                removeVote(answerId);
            }
        },
        onSuccess: () => {
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['answer', answerId] });
            queryClient.invalidateQueries({ queryKey: ['answers'] });
        },
    });

    // Calculate optimistic vote count
    const getOptimisticVoteCount = () => {
        let count = currentVoteCount;

        // If there was no vote before
        if (!userVote) {
            return count;
        }

        // Adjust based on current vote
        if (userVote === 'UPVOTE') {
            count += 1;
        } else if (userVote === 'DOWNVOTE') {
            count -= 1;
        }

        return count;
    };

    return {
        userVote,
        vote: voteMutation.mutate,
        isLoading: voteMutation.isPending,
        optimisticVoteCount: getOptimisticVoteCount(),
    };
}

/**
 * Hook for checking if content has been reported
 */
export function useContentReport(contentId: string, contentType: ContentType) {
    const { isReported, addReportedContent } = useQnaInteractionsStore();

    const reported = isReported(contentId);

    const reportMutation = useMutation({
        mutationFn: async (data: { reason: string; description?: string }) => {
            await qnaService.reportContent({
                contentId,
                contentType,
                reason: data.reason,
                description: data.description,
            });
        },
        onSuccess: () => {
            addReportedContent(contentId);
        },
    });

    return {
        reported,
        report: reportMutation.mutate,
        isLoading: reportMutation.isPending,
    };
}

/**
 * Hook for checking if question belongs to current user
 */
export function useIsMyQuestion(questionId: string) {
    const { isMyQuestion } = useQnaInteractionsStore();
    return isMyQuestion(questionId);
}

/**
 * Hook for checking if answer belongs to current user
 */
export function useIsMyAnswer(answerId: string) {
    const { isMyAnswer } = useQnaInteractionsStore();
    return isMyAnswer(answerId);
}
