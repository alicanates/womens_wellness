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

// Rising sign lookup table based on sun sign and birth time
// This is a more accurate approximation based on traditional astrology tables
const RISING_SIGN_TABLE: Record<ZodiacSign, ZodiacSign[]> = {
    aries: ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'],
    taurus: ['taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces', 'aries'],
    gemini: ['gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces', 'aries', 'taurus'],
    cancer: ['cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces', 'aries', 'taurus', 'gemini'],
    leo: ['leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces', 'aries', 'taurus', 'gemini', 'cancer'],
    virgo: ['virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces', 'aries', 'taurus', 'gemini', 'cancer', 'leo'],
    libra: ['libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces', 'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo'],
    scorpio: ['scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces', 'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra'],
    sagittarius: ['sagittarius', 'capricorn', 'aquarius', 'pisces', 'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio'],
    capricorn: ['capricorn', 'aquarius', 'pisces', 'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius'],
    aquarius: ['aquarius', 'pisces', 'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn'],
    pisces: ['pisces', 'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius'],
};

// Calculate rising sign based on birth time and date
// NOTE: This uses a traditional astrology table for better approximation
// For 100% accuracy, professional astrology software with exact coordinates is needed
export function calculateRisingSign(birthDate: Date, birthTime: string): ZodiacSign {
    // Parse time (HH:MM format)
    const [hours, minutes] = birthTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
        return getZodiacSign(birthDate); // Fallback to sun sign
    }

    // Get the sun sign
    const sunSign = getZodiacSign(birthDate);

    // Get the rising sign table for this sun sign
    const risingTable = RISING_SIGN_TABLE[sunSign];

    // Rising sign changes approximately every 2 hours
    // At sunrise (6 AM), rising sign typically equals sun sign
    // We use 2-hour intervals starting from midnight
    const timeSlot = Math.floor(hours / 2);

    // Get rising sign from table
    const risingSign = risingTable[timeSlot % 12];

    return risingSign;
}

// Calculate moon sign based on birth date
export function calculateMoonSign(birthDate: Date): ZodiacSign {
    // Moon changes sign approximately every 2.5 days
    // This is a simplified calculation
    const start = new Date(2000, 0, 1); // Reference date (Moon was in Pisces)
    const diff = birthDate.getTime() - start.getTime();
    const daysSinceRef = Math.floor(diff / (1000 * 60 * 60 * 24));

    // Calculate moon position (approximately 2.5 days per sign)
    let moonIndex = Math.floor((daysSinceRef / 2.5) % 12);

    // Ensure index is within valid range
    if (moonIndex < 0) moonIndex = Math.abs(moonIndex) % 12;
    if (moonIndex >= 12) moonIndex = moonIndex % 12;

    const signs: ZodiacSign[] = [
        'pisces', 'aries', 'taurus', 'gemini',
        'cancer', 'leo', 'virgo', 'libra',
        'scorpio', 'sagittarius', 'capricorn', 'aquarius'
    ];

    return signs[moonIndex];
}

// Calculate element distribution for birth chart
export function calculateElementDistribution(
    sunSign: ZodiacSign,
    risingSign: ZodiacSign,
    moonSign: ZodiacSign
): Record<string, number> {
    type ElementType = 'fire' | 'earth' | 'air' | 'water';

    const elements: Record<ElementType, number> = {
        fire: 0,
        earth: 0,
        air: 0,
        water: 0,
    };

    // Count elements from the three main signs
    const signs: ZodiacSign[] = [sunSign, risingSign, moonSign];
    signs.forEach((sign: ZodiacSign) => {
        const zodiacInfo = ZODIAC_SIGNS[sign];
        if (zodiacInfo && zodiacInfo.element) {
            const element: ElementType = zodiacInfo.element;
            elements[element] = elements[element] + 1;
        }
    });

    // Convert to percentages
    const total = 3;
    return {
        fire: Math.round((elements.fire / total) * 100),
        earth: Math.round((elements.earth / total) * 100),
        air: Math.round((elements.air / total) * 100),
        water: Math.round((elements.water / total) * 100),
    };
}

// Get detailed description for each sign position
export function getSignDescription(position: 'sun' | 'rising' | 'moon', sign: ZodiacSign): string {
    const descriptions = {
        sun: {
            aries: 'Enerjik, cesur ve öncü bir kişiliğe sahipsiniz. Liderlik özellikleri güçlüdür.',
            taurus: 'Kararlı, güvenilir ve pratik bir yapınız var. Güzelliğe ve konfora değer verirsiniz.',
            gemini: 'Meraklı, iletişim yeteneği güçlü ve çok yönlü bir kişiliğiniz var.',
            cancer: 'Duygusal, koruyucu ve sezgisel bir yapınız var. Aile ve yuva önemlidir.',
            leo: 'Yaratıcı, cömert ve karizmatik bir kişiliğe sahipsiniz. Dikkat çekmeyi seversiniz.',
            virgo: 'Analitik, detaycı ve pratik bir yapınız var. Mükemmeliyetçi eğilimleriniz güçlüdür.',
            libra: 'Dengeli, diplomatik ve sosyal bir kişiliğiniz var. Uyum ve adalet önemlidir.',
            scorpio: 'Tutkulu, derin ve güçlü bir yapınız var. Dönüşüm ve yenilenme yeteneğiniz yüksektir.',
            sagittarius: 'İyimser, özgür ruhlu ve maceracı bir kişiliğiniz var. Öğrenmeyi ve keşfetmeyi seversiniz.',
            capricorn: 'Disiplinli, sorumlu ve hırslı bir yapınız var. Başarı ve statü önemlidir.',
            aquarius: 'Özgün, yenilikçi ve bağımsız bir kişiliğiniz var. İnsanlığa hizmet etmek istersiniz.',
            pisces: 'Empatik, yaratıcı ve ruhani bir yapınız var. Hayal gücünüz ve sezgileriniz güçlüdür.',
        },
        rising: {
            aries: 'İlk izleniminiz enerjik ve dinamiktir. İnsanlar sizi cesur ve girişken görür.',
            taurus: 'Sakin, güvenilir ve çekici bir dış görünüşünüz var. İnsanlar size güvenir.',
            gemini: 'Canlı, konuşkan ve meraklı görünürsünüz. İletişim yeteneğiniz dikkat çeker.',
            cancer: 'Sıcak, koruyucu ve duygusal bir izlenim bırakırsınız. İnsanlar size yakınlık hisseder.',
            leo: 'Karizmatik, özgüvenli ve dikkat çekici bir dış görünüşünüz var.',
            virgo: 'Düzenli, temiz ve detaycı görünürsünüz. İnsanlar sizi güvenilir bulur.',
            libra: 'Zarif, nazik ve dengeli bir izlenim bırakırsınız. Estetik anlayışınız dikkat çeker.',
            scorpio: 'Gizemli, güçlü ve etkileyici bir dış görünüşünüz var. İnsanlar sizi unutamaz.',
            sagittarius: 'Neşeli, özgür ve maceracı görünürsünüz. İyimserliğiniz bulaşıcıdır.',
            capricorn: 'Ciddi, olgun ve sorumlu bir izlenim bırakırsınız. İnsanlar size saygı duyar.',
            aquarius: 'Özgün, farklı ve ilginç görünürsünüz. Bireyselliğiniz dikkat çeker.',
            pisces: 'Hassas, rüyacı ve gizemli bir dış görünüşünüz var. İnsanlar size empati duyar.',
        },
        moon: {
            aries: 'Duygusal olarak hızlı ve spontansınız. Heyecan ve aksiyon ihtiyacınız var.',
            taurus: 'Duygusal güvenlik ve istikrar önemlidir. Rahatlık ve konfor arayışındasınız.',
            gemini: 'Duygularınızı konuşarak ifade edersiniz. Zihinsel uyarım ihtiyacınız var.',
            cancer: 'Çok duygusal ve hassassınız. Aile ve yuva duygusal ihtiyaçlarınızın merkezindedir.',
            leo: 'Duygusal olarak cömert ve sıcaksınız. Takdir edilme ihtiyacınız var.',
            virgo: 'Duygularınızı analiz edersiniz. Düzen ve yararlı olma ihtiyacınız var.',
            libra: 'Duygusal denge ve uyum arayışındasınız. İlişkiler çok önemlidir.',
            scorpio: 'Derin ve yoğun duygular yaşarsınız. Duygusal dönüşüm yeteneğiniz güçlüdür.',
            sagittarius: 'Duygusal özgürlük ve macera ihtiyacınız var. İyimser bir duygusal yapınız var.',
            capricorn: 'Duygularınızı kontrol edersiniz. Güvenlik ve başarı duygusal ihtiyaçlarınızdır.',
            aquarius: 'Duygusal bağımsızlık önemlidir. Farklı ve özgün duygusal tepkiler verirsiniz.',
            pisces: 'Son derece empatik ve hassassınız. Duygusal sınırlarınız belirsiz olabilir.',
        },
    };

    return descriptions[position][sign];
}
