import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VoteType } from '@/types/qna';

interface QnaInteractionsStore {
    // Favorited questions (local cache for quick access)
    favoritedQuestions: Set<string>;
    addFavorite: (questionId: string) => void;
    removeFavorite: (questionId: string) => void;
    isFavorited: (questionId: string) => boolean;
    clearFavorites: () => void;

    // Followed questions (local cache)
    followedQuestions: Set<string>;
    addFollowedQuestion: (questionId: string) => void;
    removeFollowedQuestion: (questionId: string) => void;
    isFollowingQuestion: (questionId: string) => boolean;
    clearFollowedQuestions: () => void;

    // Followed users (local cache)
    followedUsers: Set<string>;
    addFollowedUser: (userId: string) => void;
    removeFollowedUser: (userId: string) => void;
    isFollowingUser: (userId: string) => boolean;
    clearFollowedUsers: () => void;

    // User votes (local cache for quick UI updates)
    userVotes: Record<string, VoteType>; // answerId -> voteType
    setVote: (answerId: string, voteType: VoteType) => void;
    removeVote: (answerId: string) => void;
    getUserVote: (answerId: string) => VoteType | null;
    clearVotes: () => void;

    // Reported content (to prevent duplicate reports)
    reportedContent: Set<string>; // contentId
    addReportedContent: (contentId: string) => void;
    isReported: (contentId: string) => boolean;
    clearReportedContent: () => void;

    // My questions cache (for quick access)
    myQuestionIds: string[];
    setMyQuestionIds: (ids: string[]) => void;
    addMyQuestionId: (id: string) => void;
    removeMyQuestionId: (id: string) => void;
    isMyQuestion: (id: string) => boolean;

    // My answers cache (for quick access)
    myAnswerIds: string[];
    setMyAnswerIds: (ids: string[]) => void;
    addMyAnswerId: (id: string) => void;
    removeMyAnswerId: (id: string) => void;
    isMyAnswer: (id: string) => boolean;

    // Clear all interactions (on logout)
    clearAll: () => void;
}

export const useQnaInteractionsStore = create<QnaInteractionsStore>()(
    persist(
        (set, get) => ({
            // Favorited questions
            favoritedQuestions: new Set(),
            addFavorite: (questionId) =>
                set((state) => ({
                    favoritedQuestions: new Set(state.favoritedQuestions).add(questionId),
                })),
            removeFavorite: (questionId) =>
                set((state) => {
                    const newSet = new Set(state.favoritedQuestions);
                    newSet.delete(questionId);
                    return { favoritedQuestions: newSet };
                }),
            isFavorited: (questionId) => get().favoritedQuestions.has(questionId),
            clearFavorites: () => set({ favoritedQuestions: new Set() }),

            // Followed questions
            followedQuestions: new Set(),
            addFollowedQuestion: (questionId) =>
                set((state) => ({
                    followedQuestions: new Set(state.followedQuestions).add(questionId),
                })),
            removeFollowedQuestion: (questionId) =>
                set((state) => {
                    const newSet = new Set(state.followedQuestions);
                    newSet.delete(questionId);
                    return { followedQuestions: newSet };
                }),
            isFollowingQuestion: (questionId) => get().followedQuestions.has(questionId),
            clearFollowedQuestions: () => set({ followedQuestions: new Set() }),

            // Followed users
            followedUsers: new Set(),
            addFollowedUser: (userId) =>
                set((state) => ({
                    followedUsers: new Set(state.followedUsers).add(userId),
                })),
            removeFollowedUser: (userId) =>
                set((state) => {
                    const newSet = new Set(state.followedUsers);
                    newSet.delete(userId);
                    return { followedUsers: newSet };
                }),
            isFollowingUser: (userId) => get().followedUsers.has(userId),
            clearFollowedUsers: () => set({ followedUsers: new Set() }),

            // User votes
            userVotes: {},
            setVote: (answerId, voteType) =>
                set((state) => ({
                    userVotes: {
                        ...state.userVotes,
                        [answerId]: voteType,
                    },
                })),
            removeVote: (answerId) =>
                set((state) => {
                    const newVotes = { ...state.userVotes };
                    delete newVotes[answerId];
                    return { userVotes: newVotes };
                }),
            getUserVote: (answerId) => get().userVotes[answerId] || null,
            clearVotes: () => set({ userVotes: {} }),

            // Reported content
            reportedContent: new Set(),
            addReportedContent: (contentId) =>
                set((state) => ({
                    reportedContent: new Set(state.reportedContent).add(contentId),
                })),
            isReported: (contentId) => get().reportedContent.has(contentId),
            clearReportedContent: () => set({ reportedContent: new Set() }),

            // My questions
            myQuestionIds: [],
            setMyQuestionIds: (ids) => set({ myQuestionIds: ids }),
            addMyQuestionId: (id) =>
                set((state) => ({
                    myQuestionIds: state.myQuestionIds.includes(id)
                        ? state.myQuestionIds
                        : [...state.myQuestionIds, id],
                })),
            removeMyQuestionId: (id) =>
                set((state) => ({
                    myQuestionIds: state.myQuestionIds.filter((qId) => qId !== id),
                })),
            isMyQuestion: (id) => get().myQuestionIds.includes(id),

            // My answers
            myAnswerIds: [],
            setMyAnswerIds: (ids) => set({ myAnswerIds: ids }),
            addMyAnswerId: (id) =>
                set((state) => ({
                    myAnswerIds: state.myAnswerIds.includes(id)
                        ? state.myAnswerIds
                        : [...state.myAnswerIds, id],
                })),
            removeMyAnswerId: (id) =>
                set((state) => ({
                    myAnswerIds: state.myAnswerIds.filter((aId) => aId !== id),
                })),
            isMyAnswer: (id) => get().myAnswerIds.includes(id),

            // Clear all
            clearAll: () =>
                set({
                    favoritedQuestions: new Set(),
                    followedQuestions: new Set(),
                    followedUsers: new Set(),
                    userVotes: {},
                    reportedContent: new Set(),
                    myQuestionIds: [],
                    myAnswerIds: [],
                }),
        }),
        {
            name: 'qna-interactions-store',
            storage: createJSONStorage(() => AsyncStorage),
            // Custom serialization for Sets
            serialize: (state) => {
                return JSON.stringify({
                    state: {
                        ...state.state,
                        favoritedQuestions: Array.from(state.state.favoritedQuestions),
                        followedQuestions: Array.from(state.state.followedQuestions),
                        followedUsers: Array.from(state.state.followedUsers),
                        reportedContent: Array.from(state.state.reportedContent),
                    },
                });
            },
            deserialize: (str) => {
                const parsed = JSON.parse(str);
                return {
                    state: {
                        ...parsed.state,
                        favoritedQuestions: new Set(parsed.state.favoritedQuestions || []),
                        followedQuestions: new Set(parsed.state.followedQuestions || []),
                        followedUsers: new Set(parsed.state.followedUsers || []),
                        reportedContent: new Set(parsed.state.reportedContent || []),
                    },
                };
            },
        }
    )
);
