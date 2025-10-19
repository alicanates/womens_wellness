import { FunNotification } from '@/types/funNotifications';

// Streak Bildirimleri
export const STREAK_NOTIFICATIONS: FunNotification[] = [
    {
        id: 'streak_3',
        type: 'STREAK_MILESTONE',
        titleTr: '3 Gün Streak! 🎉',
        titleEn: '3 Day Streak! 🎉',
        messageTr: 'Artık profesyonelsin! Devam et! 😎',
        messageEn: "You're a pro now! Keep going! 😎",
        emoji: '😎',
        triggerCondition: { streakDay: 3 }
    },
    {
        id: 'streak_7',
        type: 'STREAK_MILESTONE',
        titleTr: '7 Gün Streak! 🔥',
        titleEn: '7 Day Streak! 🔥',
        messageTr: 'Netflix dizisi bitirme hızınla aynı! 🎬',
        messageEn: 'Same speed as finishing a Netflix series! 🎬',
        emoji: '🎬',
        triggerCondition: { streakDay: 7 }
    },
    {
        id: 'streak_14',
        type: 'STREAK_MILESTONE',
        titleTr: '2 Hafta! 💪',
        titleEn: '2 Weeks! 💪',
        messageTr: 'Artık bir alışkanlık haline geldi! Süpersin! 🌟',
        messageEn: "It's a habit now! You're amazing! 🌟",
        emoji: '🌟',
        triggerCondition: { streakDay: 14 }
    },
    {
        id: 'streak_30',
        type: 'STREAK_MILESTONE',
        titleTr: '30 Gün! 🏆',
        titleEn: '30 Days! 🏆',
        messageTr: 'Bir ay! Artık efsanesin! 👑',
        messageEn: 'One month! You\'re a legend! 👑',
        emoji: '👑',
        triggerCondition: { streakDay: 30 }
    },
    {
        id: 'streak_50',
        type: 'STREAK_MILESTONE',
        titleTr: '50 Gün! 🚀',
        titleEn: '50 Days! 🚀',
        messageTr: 'Artık durdurulamaz bir güçsün! 💫',
        messageEn: "You're an unstoppable force! 💫",
        emoji: '💫',
        triggerCondition: { streakDay: 50 }
    },
    {
        id: 'streak_100',
        type: 'STREAK_MILESTONE',
        titleTr: '100 GÜN! 🎊',
        titleEn: '100 DAYS! 🎊',
        messageTr: 'İnanılmaz! Artık bir efsanesin! 🌈',
        messageEn: 'Incredible! You\'re a legend! 🌈',
        emoji: '🌈',
        triggerCondition: { streakDay: 100 }
    }
];

// Motivasyon Bildirimleri
export const MOTIVATION_NOTIFICATIONS: FunNotification[] = [
    {
        id: 'motivation_1',
        type: 'MOTIVATION',
        titleTr: 'Bugün de harika gidiyorsun! 💪',
        titleEn: "You're doing great today! 💪",
        messageTr: 'Streak\'in seni bekliyor! Veri girmeyi unutma! 🔥',
        messageEn: "Your streak is waiting! Don't forget to log! 🔥",
        emoji: '🔥',
        triggerCondition: { random: true }
    },
    {
        id: 'motivation_2',
        type: 'MOTIVATION',
        titleTr: 'Dün harika gitmişti! 🌟',
        titleEn: 'Yesterday was great! 🌟',
        messageTr: 'Bugün de devam edelim mi? 😊',
        messageEn: "Let's continue today? 😊",
        emoji: '😊',
        triggerCondition: { random: true }
    },
    {
        id: 'motivation_3',
        type: 'MOTIVATION',
        titleTr: 'Streak\'in 1 gün daha uzasın mı? 🎯',
        titleEn: 'Extend your streak by 1 more day? 🎯',
        messageTr: 'Sadece birkaç saniye sürüyor! 💫',
        messageEn: 'It only takes a few seconds! 💫',
        emoji: '💫',
        triggerCondition: { random: true }
    },
    {
        id: 'motivation_4',
        type: 'MOTIVATION',
        titleTr: 'Kendine iyi bak! ❤️',
        titleEn: 'Take care of yourself! ❤️',
        messageTr: 'Bugün nasıl hissediyorsun? Bize de anlat! 💭',
        messageEn: 'How are you feeling today? Tell us! 💭',
        emoji: '💭',
        triggerCondition: { random: true }
    },
    {
        id: 'motivation_5',
        type: 'MOTIVATION',
        titleTr: 'Su içmeyi unutma! 💧',
        titleEn: "Don't forget to drink water! 💧",
        messageTr: 'Bitkiler gibi sen de suya ihtiyacın var! 🌱',
        messageEn: 'Like plants, you need water too! 🌱',
        emoji: '🌱',
        triggerCondition: { random: true }
    }
];

// Başarı Bildirimleri
export const ACHIEVEMENT_NOTIFICATIONS: FunNotification[] = [
    {
        id: 'achievement_week',
        type: 'ACHIEVEMENT_FUN',
        titleTr: 'İlk hafta tamamlandı! 🎓',
        titleEn: 'First week completed! 🎓',
        messageTr: 'Artık bir uzman sayılırsın! 🌟',
        messageEn: "You're an expert now! 🌟",
        emoji: '🎓',
        triggerCondition: { streakDay: 7 }
    },
    {
        id: 'achievement_50_entries',
        type: 'ACHIEVEMENT_FUN',
        titleTr: '50 veri girişi! 📊',
        titleEn: '50 data entries! 📊',
        messageTr: 'Veri bilimci olma yolunda ilerliyorsun! 🚀',
        messageEn: "You're on your way to becoming a data scientist! 🚀",
        emoji: '📊',
        triggerCondition: { dataEntryCount: 50 }
    },
    {
        id: 'achievement_100_entries',
        type: 'ACHIEVEMENT_FUN',
        titleTr: '100 veri girişi! 🎮',
        titleEn: '100 data entries! 🎮',
        messageTr: 'Level 5! Artık oyunun kurallarını biliyorsun! 🏆',
        messageEn: 'Level 5! You know the rules of the game now! 🏆',
        emoji: '🎮',
        triggerCondition: { dataEntryCount: 100 }
    },
    {
        id: 'achievement_200_entries',
        type: 'ACHIEVEMENT_FUN',
        titleTr: '200 veri girişi! 🌟',
        titleEn: '200 data entries! 🌟',
        messageTr: 'Artık bir efsanesin! Devam et! 💪',
        messageEn: "You're a legend! Keep going! 💪",
        emoji: '🌟',
        triggerCondition: { dataEntryCount: 200 }
    }
];

// Rastgele Eğlenceli Mesajlar
export const RANDOM_FUN_NOTIFICATIONS: FunNotification[] = [
    {
        id: 'random_1',
        type: 'RANDOM_FUN',
        titleTr: 'Merhaba! 👋',
        titleEn: 'Hello! 👋',
        messageTr: 'Bugün nasıl hissediyorsun? Bize de anlat! 💭',
        messageEn: 'How are you feeling today? Tell us! 💭',
        emoji: '💭',
        triggerCondition: { random: true }
    },
    {
        id: 'random_2',
        type: 'RANDOM_FUN',
        titleTr: 'Hatırlatma! 💧',
        titleEn: 'Reminder! 💧',
        messageTr: 'Su içmeyi unutma! Bitkiler gibi sen de suya ihtiyacın var! 🌱',
        messageEn: "Don't forget to drink water! Like plants, you need it too! 🌱",
        emoji: '🌱',
        triggerCondition: { random: true }
    },
    {
        id: 'random_3',
        type: 'RANDOM_FUN',
        titleTr: 'Kendine iyi bak! ❤️',
        titleEn: 'Take care of yourself! ❤️',
        messageTr: 'Bugün kendine zaman ayırdın mı? 🧘‍♀️',
        messageEn: 'Did you take time for yourself today? 🧘‍♀️',
        emoji: '❤️',
        triggerCondition: { random: true }
    },
    {
        id: 'random_4',
        type: 'RANDOM_FUN',
        titleTr: 'Harika gidiyorsun! ✨',
        titleEn: "You're doing great! ✨",
        messageTr: 'Bugün de muhteşemsin! 🌟',
        messageEn: "You're amazing today! 🌟",
        emoji: '✨',
        triggerCondition: { random: true }
    }
];

// Regl Dönemi Destek Bildirimleri
export const PERIOD_SUPPORT_NOTIFICATIONS: FunNotification[] = [
    {
        id: 'period_1',
        type: 'PERIOD_SUPPORT',
        titleTr: 'Yanındayız! 💕',
        titleEn: "We're here for you! 💕",
        messageTr: 'Regl dönemindesin. Kendine ekstra iyi bak! 🌸',
        messageEn: "You're on your period. Take extra care of yourself! 🌸",
        emoji: '💕',
        triggerCondition: { isPeriodWeek: true }
    },
    {
        id: 'period_2',
        type: 'PERIOD_SUPPORT',
        titleTr: 'Güçlüsün! 💪',
        titleEn: "You're strong! 💪",
        messageTr: 'Bu dönem de geçecek. Sen harikasın! 🌺',
        messageEn: 'This period will pass too. You\'re amazing! 🌺',
        emoji: '💪',
        triggerCondition: { isPeriodWeek: true }
    },
    {
        id: 'period_3',
        type: 'PERIOD_SUPPORT',
        titleTr: 'Dinlen! 🛋️',
        titleEn: 'Rest! 🛋️',
        messageTr: 'Bugün kendine bol bol dinlenme zamanı ayır! 😴',
        messageEn: 'Give yourself plenty of rest time today! 😴',
        emoji: '🛋️',
        triggerCondition: { isPeriodWeek: true }
    },
    {
        id: 'period_4',
        type: 'PERIOD_SUPPORT',
        titleTr: 'Sıcak içecek zamanı! ☕',
        titleEn: 'Hot drink time! ☕',
        messageTr: 'Bir fincan sıcak çay seni rahatlatabilir! 🍵',
        messageEn: 'A cup of hot tea can help you relax! 🍵',
        emoji: '☕',
        triggerCondition: { isPeriodWeek: true }
    },
    {
        id: 'period_5',
        type: 'PERIOD_SUPPORT',
        titleTr: 'Kendine nazik ol! 🌷',
        titleEn: 'Be kind to yourself! 🌷',
        messageTr: 'Bu dönemde kendine karşı daha anlayışlı ol! 💖',
        messageEn: 'Be more understanding with yourself during this time! 💖',
        emoji: '🌷',
        triggerCondition: { isPeriodWeek: true }
    },
    {
        id: 'period_6',
        type: 'PERIOD_SUPPORT',
        titleTr: 'Yanındayız! 🤗',
        titleEn: "We're with you! 🤗",
        messageTr: 'Zor bir gün mü? Biz buradayız! 💝',
        messageEn: 'Having a tough day? We\'re here! 💝',
        emoji: '🤗',
        triggerCondition: { isPeriodWeek: true }
    },
    {
        id: 'period_7',
        type: 'PERIOD_SUPPORT',
        titleTr: 'Hareket et! 🚶‍♀️',
        titleEn: 'Move around! 🚶‍♀️',
        messageTr: 'Hafif bir yürüyüş seni iyi hissettirebilir! 🌿',
        messageEn: 'A light walk can make you feel better! 🌿',
        emoji: '🚶‍♀️',
        triggerCondition: { isPeriodWeek: true }
    },
    {
        id: 'period_8',
        type: 'PERIOD_SUPPORT',
        titleTr: 'Sıcak duş! 🚿',
        titleEn: 'Hot shower! 🚿',
        messageTr: 'Sıcak bir duş krampları azaltabilir! 💆‍♀️',
        messageEn: 'A hot shower can reduce cramps! 💆‍♀️',
        emoji: '🚿',
        triggerCondition: { isPeriodWeek: true }
    }
];

// Tüm bildirimleri birleştir
export const ALL_FUN_NOTIFICATIONS: FunNotification[] = [
    ...STREAK_NOTIFICATIONS,
    ...MOTIVATION_NOTIFICATIONS,
    ...ACHIEVEMENT_NOTIFICATIONS,
    ...RANDOM_FUN_NOTIFICATIONS,
    ...PERIOD_SUPPORT_NOTIFICATIONS
];
