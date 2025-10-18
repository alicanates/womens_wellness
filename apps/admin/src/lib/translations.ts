// Türkçe çeviriler için yardımcı fonksiyonlar ve sabitler

export const statusLabels: Record<string, string> = {
    ACTIVE: 'Aktif',
    INACTIVE: 'Pasif',
    SUSPENDED: 'Askıya Alındı',
    DELETED: 'Silindi',
    OPEN: 'Açık',
    ANSWERED: 'Cevaplandı',
    CLOSED: 'Kapalı',
    PENDING: 'Beklemede',
    REVIEWED: 'İncelendi',
    RESOLVED: 'Çözüldü',
    DISMISSED: 'Reddedildi',
    FREE: 'Ücretsiz',
    TRIAL: 'Deneme',
    EXPIRED: 'Süresi Doldu',
    CANCELLED: 'İptal Edildi',
    GRACE_PERIOD: 'Ek Süre',
};

export const categoryLabels: Record<string, string> = {
    MENSTRUAL_HEALTH: 'Regl Sağlığı',
    PREGNANCY: 'Hamilelik',
    FERTILITY: 'Doğurganlık',
    NUTRITION: 'Beslenme',
    EXERCISE: 'Egzersiz',
    MENTAL_HEALTH: 'Ruh Sağlığı',
    SLEEP: 'Uyku',
    CONTRACEPTION: 'Doğum Kontrolü',
    PMS: 'PMS',
    MENOPAUSE: 'Menopoz',
    SEXUAL_HEALTH: 'Cinsel Sağlık',
    GENERAL: 'Genel',
    menstrual_health: 'Regl Sağlığı',
    pregnancy: 'Hamilelik',
    fertility: 'Doğurganlık',
    nutrition: 'Beslenme',
    exercise: 'Egzersiz',
    mental_health: 'Ruh Sağlığı',
    sleep: 'Uyku',
    hydration: 'Hidrasyon',
    contraception: 'Doğum Kontrolü',
    pms: 'PMS',
    menopause: 'Menopoz',
    sexual_health: 'Cinsel Sağlık',
};

export const contentTypeLabels: Record<string, string> = {
    QUESTION: 'Soru',
    ANSWER: 'Cevap',
    COMMENT: 'Yorum',
};

export const tierLabels: Record<string, string> = {
    MONTHLY: 'Aylık',
    YEARLY: 'Yıllık',
};

export const providerLabels: Record<string, string> = {
    APPLE: 'Apple',
    GOOGLE: 'Google',
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google',
};

export const reminderTypeLabels: Record<string, string> = {
    DAILY: 'Günlük',
    WEEKLY: 'Haftalık',
    MONTHLY: 'Aylık',
    CUSTOM: 'Özel',
};

export const yesNo = (value: boolean | undefined | null): string => {
    return value ? 'Evet' : 'Hayır';
};

export const formatDate = (date: string | Date | null | undefined, format: string = 'YYYY-MM-DD'): string => {
    if (!date) return 'Yok';
    return date.toString();
};
