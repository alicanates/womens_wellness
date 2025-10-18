import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qnaNotificationService, QnaNotificationPreferences } from '../services/qnaNotificationService';

/**
 * Hook for managing QnA notification preferences
 */
export function useQnaNotificationPreferences() {
    const queryClient = useQueryClient();

    // Get preferences
    const {
        data: preferences,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['qna', 'notification-preferences'],
        queryFn: qnaNotificationService.getPreferences,
    });

    // Update preferences
    const updateMutation = useMutation({
        mutationFn: (updates: Partial<QnaNotificationPreferences>) =>
            qnaNotificationService.updatePreferences(updates),
        onSuccess: (data) => {
            // Update cache
            queryClient.setQueryData(['qna', 'notification-preferences'], data);
        },
    });

    return {
        preferences,
        isLoading,
        error,
        refetch,
        updatePreferences: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        updateError: updateMutation.error,
    };
}
