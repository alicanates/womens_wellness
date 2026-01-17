/**
 * Q&A Community i18n Helper Functions
 * 
 * Bu dosya Q&A topluluğu için kategori, durum ve diğer enum değerlerinin
 * çevirilerini sağlar.
 */

import tr from './locales/tr.json';
import en from './locales/en.json';

const translations = { tr, en };

export type Language = 'tr' | 'en';

/**
 * Question Category Enum
 */
export enum QuestionCategory {
    MENSTRUAL_HEALTH = 'MENSTRUAL_HEALTH',
    PREGNANCY = 'PREGNANCY',
    FERTILITY = 'FERTILITY',
    NUTRITION = 'NUTRITION',
    EXERCISE = 'EXERCISE',
    MENTAL_HEALTH = 'MENTAL_HEALTH',
    SLEEP = 'SLEEP',
    CONTRACEPTION = 'CONTRACEPTION',
    PMS = 'PMS',
    MENOPAUSE = 'MENOPAUSE',
    SEXUAL_HEALTH = 'SEXUAL_HEALTH',
    GENERAL = 'GENERAL',
}

/**
 * Question Status Enum
 */
export enum QuestionStatus {
    OPEN = 'OPEN',
    ANSWERED = 'ANSWERED',
    CLOSED = 'CLOSED',
}

/**
 * Vote Type Enum
 */
export enum VoteType {
    UPVOTE = 'UPVOTE',
    DOWNVOTE = 'DOWNVOTE',
}

/**
 * Get translated category name
 */
export function getCategoryTranslation(
    category: QuestionCategory,
    language: Language = 'tr'
): string {
    const t = language === 'tr' ? translations.tr : translations.tr; // TODO: Add en translations
    return t.qna.categories[category] || category;
}

/**
 * Get translated status name
 */
export function getStatusTranslation(
    status: QuestionStatus,
    language: Language = 'tr'
): string {
    const statusMap: Record<QuestionStatus, string> = {
        [QuestionStatus.OPEN]: language === 'tr' ? 'Açık' : 'Open',
        [QuestionStatus.ANSWERED]: language === 'tr' ? 'Cevaplanmış' : 'Answered',
        [QuestionStatus.CLOSED]: language === 'tr' ? 'Kapalı' : 'Closed',
    };
    return statusMap[status] || status;
}

/**
 * Get all categories with translations
 */
export function getAllCategories(language: Language = 'tr') {
    return Object.values(QuestionCategory).map((category) => ({
        value: category,
        label: getCategoryTranslation(category, language),
    }));
}

/**
 * Get all statuses with translations
 */
export function getAllStatuses(language: Language = 'tr') {
    return Object.values(QuestionStatus).map((status) => ({
        value: status,
        label: getStatusTranslation(status, language),
    }));
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(
    timestamp: string | Date,
    language: Language = 'tr'
): string {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (language === 'tr') {
        if (diffMins < 1) return 'Şimdi';
        if (diffMins < 60) return `${diffMins} dk önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } else {
        if (diffMins < 1) return 'Now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    }
}

/**
 * Format count with proper pluralization
 */
export function formatCount(
    count: number,
    singular: string,
    plural: string,
    language: Language = 'tr'
): string {
    if (language === 'tr') {
        // Turkish doesn't have plural forms for most nouns
        return `${count} ${singular}`;
    } else {
        return `${count} ${count === 1 ? singular : plural}`;
    }
}

/**
 * Get category icon emoji
 */
export function getCategoryIcon(category: QuestionCategory): string {
    const iconMap: Record<QuestionCategory, string> = {
        [QuestionCategory.MENSTRUAL_HEALTH]: '🩸',
        [QuestionCategory.PREGNANCY]: '🤰',
        [QuestionCategory.FERTILITY]: '🌸',
        [QuestionCategory.NUTRITION]: '🥗',
        [QuestionCategory.EXERCISE]: '💪',
        [QuestionCategory.MENTAL_HEALTH]: '🧠',
        [QuestionCategory.SLEEP]: '😴',
        [QuestionCategory.CONTRACEPTION]: '💊',
        [QuestionCategory.PMS]: '🌙',
        [QuestionCategory.MENOPAUSE]: '🌺',
        [QuestionCategory.SEXUAL_HEALTH]: '💗',
        [QuestionCategory.GENERAL]: '💬',
    };
    return iconMap[category] || '📋';
}

/**
 * Get status color
 */
export function getStatusColor(status: QuestionStatus): string {
    const colorMap: Record<QuestionStatus, string> = {
        [QuestionStatus.OPEN]: '#3B82F6', // blue
        [QuestionStatus.ANSWERED]: '#22C55E', // green
        [QuestionStatus.CLOSED]: '#6B7280', // gray
    };
    return colorMap[status] || '#6B7280';
}

/**
 * Interpolate translation string with variables
 * Example: interpolate("Remaining: {count}/{limit}", { count: 3, limit: 5 })
 * Returns: "Remaining: 3/5"
 */
export function interpolate(
    template: string,
    variables: Record<string, string | number>
): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
        return variables[key] !== undefined ? String(variables[key]) : match;
    });
}
