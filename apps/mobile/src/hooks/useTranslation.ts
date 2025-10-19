/**
 * useTranslation Hook
 * 
 * Provides translation functionality for the mobile app
 */

import { useMemo } from 'react';
import { translations, interpolate } from '@wellness/i18n';

type Language = 'tr' | 'en';

// For now, we'll use Turkish as default
// In the future, this can be connected to a language preference store
const DEFAULT_LANGUAGE: Language = 'tr';

/**
 * Get nested translation value from object
 */
function getNestedValue(obj: any, path: string): string {
    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return path; // Return the key if not found
        }
    }

    return typeof value === 'string' ? value : path;
}

export function useTranslation(language: Language = DEFAULT_LANGUAGE) {
    const t = useMemo(() => {
        const translationData = translations[language] || translations.tr;

        return (key: string, variables?: Record<string, string | number>): string => {
            const translation = getNestedValue(translationData, key);

            if (variables) {
                return interpolate(translation, variables);
            }

            return translation;
        };
    }, [language]);

    return { t, language };
}

/**
 * Hook specifically for Q&A translations
 */
export function useQnaTranslation(language: Language = DEFAULT_LANGUAGE) {
    const { t } = useTranslation(language);

    const tQna = useMemo(() => {
        return (key: string, variables?: Record<string, string | number>): string => {
            return t(`qna.${key}`, variables);
        };
    }, [t]);

    return { t: tQna, language };
}
