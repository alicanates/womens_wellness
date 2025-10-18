export enum QnaNotificationType {
    NEW_ANSWER = 'NEW_ANSWER', // Soruna yeni cevap geldi
    ANSWER_VOTED = 'ANSWER_VOTED', // Cevabına oy verildi
    BEST_ANSWER_SELECTED = 'BEST_ANSWER_SELECTED', // Cevabın en iyi seçildi
    QUESTION_COMMENTED = 'QUESTION_COMMENTED', // Soruya yorum yapıldı
    ANSWER_COMMENTED = 'ANSWER_COMMENTED', // Cevaba yorum yapıldı
    FOLLOWED_QUESTION_ANSWERED = 'FOLLOWED_QUESTION_ANSWERED', // Takip edilen soruya cevap
    FOLLOWED_USER_ASKED = 'FOLLOWED_USER_ASKED', // Takip edilen kullanıcı soru sordu
    BADGE_EARNED = 'BADGE_EARNED', // Yeni rozet kazanıldı
}

export interface QnaNotificationData {
    type: QnaNotificationType;
    questionId?: string;
    answerId?: string;
    commentId?: string;
    userId?: string;
    badgeId?: string;
    questionTitle?: string;
    answerContent?: string;
    username?: string;
    badgeName?: string;
    voteType?: 'UPVOTE' | 'DOWNVOTE';
}

export interface QnaNotificationPreferences {
    newAnswers: boolean; // Default: true
    answerVotes: boolean; // Default: true
    bestAnswerSelected: boolean; // Default: true
    comments: boolean; // Default: true
    followedContent: boolean; // Default: true
    badgesEarned: boolean; // Default: true
}

export class UpdateQnaNotificationPreferencesDto {
    newAnswers?: boolean;
    answerVotes?: boolean;
    bestAnswerSelected?: boolean;
    comments?: boolean;
    followedContent?: boolean;
    badgesEarned?: boolean;
}
