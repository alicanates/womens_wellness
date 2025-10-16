// Astrology utility functions

export type ZodiacSign =
    | 'aries' | 'taurus' | 'gemini' | 'cancer'
    | 'leo' | 'virgo' | 'libra' | 'scorpio'
    | 'sagittarius' | 'capricorn' | 'aquarius' | 'pisces';

export interface ZodiacInfo {
    sign: ZodiacSign;
    name: string;
    nameTr: string;
    emoji: string;
    element: 'fire' | 'earth' | 'air' | 'water';
    dates: string;
    color: string;
}

export const ZODIAC_SIGNS: Record<ZodiacSign, ZodiacInfo> = {
    aries: {
        sign: 'aries',
        name: 'Aries',
        nameTr: 'Koç',
        emoji: '♈',
        element: 'fire',
        dates: '21 Mart - 19 Nisan',
        color: '#FF6B6B',
    },
    taurus: {
        sign: 'taurus',
        name: 'Taurus',
        nameTr: 'Boğa',
        emoji: '♉',
        element: 'earth',
        dates: '20 Nisan - 20 Mayıs',
        color: '#4ECDC4',
    },
    gemini: {
        sign: 'gemini',
        name: 'Gemini',
        nameTr: 'İkizler',
        emoji: '♊',
        element: 'air',
        dates: '21 Mayıs - 20 Haziran',
        color: '#FFE66D',
    },
    cancer: {
        sign: 'cancer',
        name: 'Cancer',
        nameTr: 'Yengeç',
        emoji: '♋',
        element: 'water',
        dates: '21 Haziran - 22 Temmuz',
        color: '#A8DADC',
    },
    leo: {
        sign: 'leo',
        name: 'Leo',
        nameTr: 'Aslan',
        emoji: '♌',
        element: 'fire',
        dates: '23 Temmuz - 22 Ağustos',
        color: '#F4A261',
    },
    virgo: {
        sign: 'virgo',
        name: 'Virgo',
        nameTr: 'Başak',
        emoji: '♍',
        element: 'earth',
        dates: '23 Ağustos - 22 Eylül',
        color: '#2A9D8F',
    },
    libra: {
        sign: 'libra',
        name: 'Libra',
        nameTr: 'Terazi',
        emoji: '♎',
        element: 'air',
        dates: '23 Eylül - 22 Ekim',
        color: '#E76F51',
    },
    scorpio: {
        sign: 'scorpio',
        name: 'Scorpio',
        nameTr: 'Akrep',
        emoji: '♏',
        element: 'water',
        dates: '23 Ekim - 21 Kasım',
        color: '#8B5A8D',
    },
    sagittarius: {
        sign: 'sagittarius',
        name: 'Sagittarius',
        nameTr: 'Yay',
        emoji: '♐',
        element: 'fire',
        dates: '22 Kasım - 21 Aralık',
        color: '#9B59B6',
    },
    capricorn: {
        sign: 'capricorn',
        name: 'Capricorn',
        nameTr: 'Oğlak',
        emoji: '♑',
        element: 'earth',
        dates: '22 Aralık - 19 Ocak',
        color: '#34495E',
    },
    aquarius: {
        sign: 'aquarius',
        name: 'Aquarius',
        nameTr: 'Kova',
        emoji: '♒',
        element: 'air',
        dates: '20 Ocak - 18 Şubat',
        color: '#3498DB',
    },
    pisces: {
        sign: 'pisces',
        name: 'Pisces',
        nameTr: 'Balık',
        emoji: '♓',
        element: 'water',
        dates: '19 Şubat - 20 Mart',
        color: '#1ABC9C',
    },
};

// Calculate zodiac sign from birth date
export function getZodiacSign(birthDate: Date): ZodiacSign {
    const month = birthDate.getMonth() + 1; // 1-12
    const day = birthDate.getDate();

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
    return 'pisces';
}

// Calculate compatibility percentage between two signs
export function calculateCompatibility(sign1: ZodiacSign, sign2: ZodiacSign): number {
    const info1 = ZODIAC_SIGNS[sign1];
    const info2 = ZODIAC_SIGNS[sign2];

    // Same element = high compatibility
    if (info1.element === info2.element) return 85 + Math.floor(Math.random() * 10);

    // Compatible elements
    const compatible: Record<string, string[]> = {
        fire: ['air'],
        air: ['fire'],
        water: ['earth'],
        earth: ['water'],
    };

    if (compatible[info1.element]?.includes(info2.element)) {
        return 70 + Math.floor(Math.random() * 15);
    }

    // Neutral compatibility
    return 50 + Math.floor(Math.random() * 20);
}
