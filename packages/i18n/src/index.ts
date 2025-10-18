import tr from './locales/tr.json';
import en from './locales/en.json';

export const translations = {
  tr,
  en,
};

export type TranslationKey = keyof typeof tr;

// Re-export Q&A helpers
export * from './qna';
