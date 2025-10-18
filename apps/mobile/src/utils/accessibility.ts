import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Accessibility utilities for improved app accessibility
 */

export const accessibility = {
    /**
     * Check if screen reader is enabled
     */
    isScreenReaderEnabled: async (): Promise<boolean> => {
        try {
            return await AccessibilityInfo.isScreenReaderEnabled();
        } catch (error) {
            return false;
        }
    },

    /**
     * Announce message to screen reader
     */
    announce: (message: string) => {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            AccessibilityInfo.announceForAccessibility(message);
        }
    },

    /**
     * Get accessibility label for vote count
     */
    getVoteCountLabel: (count: number): string => {
        if (count === 0) return 'Henüz oy yok';
        if (count === 1) return '1 oy';
        if (count > 0) return `${count} pozitif oy`;
        return `${Math.abs(count)} negatif oy`;
    },

    /**
     * Get accessibility label for answer count
     */
    getAnswerCountLabel: (count: number): string => {
        if (count === 0) return 'Henüz cevap yok';
        if (count === 1) return '1 cevap';
        return `${count} cevap`;
    },

    /**
     * Get accessibility label for view count
     */
    getViewCountLabel: (count: number): string => {
        if (count === 0) return 'Henüz görüntülenmedi';
        if (count === 1) return '1 kez görüntülendi';
        return `${count} kez görüntülendi`;
    },

    /**
     * Get accessibility label for timestamp
     */
    getTimestampLabel: (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Şimdi paylaşıldı';
        if (diffMins < 60) return `${diffMins} dakika önce paylaşıldı`;
        if (diffHours < 24) return `${diffHours} saat önce paylaşıldı`;
        if (diffDays < 7) return `${diffDays} gün önce paylaşıldı`;

        return `${date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })} tarihinde paylaşıldı`;
    },

    /**
     * Get accessibility hint for button
     */
    getButtonHint: (action: string): string => {
        return `${action} için çift dokunun`;
    },

    /**
     * Get accessibility label for question status
     */
    getQuestionStatusLabel: (status: string, hasAcceptedAnswer: boolean): string => {
        if (hasAcceptedAnswer) return 'Cevaplanmış soru, en iyi cevap seçilmiş';
        if (status === 'ANSWERED') return 'Cevaplanmış soru';
        if (status === 'OPEN') return 'Açık soru, cevap bekliyor';
        return 'Kapalı soru';
    },

    /**
     * Get accessibility label for premium badge
     */
    getPremiumBadgeLabel: (): string => {
        return 'Premium kullanıcı sorusu';
    },

    /**
     * Get accessibility label for anonymous user
     */
    getAnonymousLabel: (): string => {
        return 'Anonim kullanıcı tarafından soruldu';
    },

    /**
     * Get accessibility label for best answer badge
     */
    getBestAnswerLabel: (): string => {
        return 'En iyi cevap olarak işaretlenmiş';
    },

    /**
     * Get accessibility label for category
     */
    getCategoryLabel: (category: string): string => {
        const categoryMap: Record<string, string> = {
            MENSTRUAL_HEALTH: 'Adet Sağlığı kategorisi',
            PREGNANCY: 'Hamilelik kategorisi',
            FERTILITY: 'Doğurganlık kategorisi',
            NUTRITION: 'Beslenme kategorisi',
            EXERCISE: 'Egzersiz kategorisi',
            MENTAL_HEALTH: 'Ruh Sağlığı kategorisi',
            SLEEP: 'Uyku kategorisi',
            CONTRACEPTION: 'Doğum Kontrolü kategorisi',
            PMS: 'PMS kategorisi',
            MENOPAUSE: 'Menopoz kategorisi',
            SEXUAL_HEALTH: 'Cinsel Sağlık kategorisi',
            GENERAL: 'Genel kategorisi',
        };
        return categoryMap[category] || category;
    },
};
