import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Q&A Community Badge Seed Data
 * Rozetler kullanıcıların başarılarını ödüllendirmek için kullanılır
 */
const badges = [
    // Başlangıç Rozetleri
    {
        key: 'first_question',
        nameTr: 'İlk Soru',
        nameEn: 'First Question',
        description: 'İlk sorunuzu sordunuz',
        iconUrl: '🎯',
        requirement: { type: 'questions_asked', count: 1 },
    },
    {
        key: 'first_answer',
        nameTr: 'İlk Cevap',
        nameEn: 'First Answer',
        description: 'İlk cevabınızı verdiniz',
        iconUrl: '💬',
        requirement: { type: 'answers_given', count: 1 },
    },

    // Soru Rozetleri
    {
        key: 'curious',
        nameTr: 'Meraklı',
        nameEn: 'Curious',
        description: '5 soru sordunuz',
        iconUrl: '🤔',
        requirement: { type: 'questions_asked', count: 5 },
    },
    {
        key: 'inquisitive',
        nameTr: 'Araştırmacı',
        nameEn: 'Inquisitive',
        description: '10 soru sordunuz',
        iconUrl: '🔍',
        requirement: { type: 'questions_asked', count: 10 },
    },

    // Cevap Rozetleri
    {
        key: 'helpful',
        nameTr: 'Yardımsever',
        nameEn: 'Helpful',
        description: '10 cevap verdiniz',
        iconUrl: '🤝',
        requirement: { type: 'answers_given', count: 10 },
    },
    {
        key: 'mentor',
        nameTr: 'Mentor',
        nameEn: 'Mentor',
        description: '25 cevap verdiniz',
        iconUrl: '👩‍🏫',
        requirement: { type: 'answers_given', count: 25 },
    },
    {
        key: 'expert',
        nameTr: 'Uzman',
        nameEn: 'Expert',
        description: '50 cevap verdiniz',
        iconUrl: '⭐',
        requirement: { type: 'answers_given', count: 50 },
    },

    // En İyi Cevap Rozetleri
    {
        key: 'best_answer',
        nameTr: 'En İyi Cevap',
        nameEn: 'Best Answer',
        description: 'İlk en iyi cevabınız seçildi',
        iconUrl: '✅',
        requirement: { type: 'best_answers', count: 1 },
    },
    {
        key: 'trusted_advisor',
        nameTr: 'Güvenilir Danışman',
        nameEn: 'Trusted Advisor',
        description: '5 en iyi cevabınız var',
        iconUrl: '🏆',
        requirement: { type: 'best_answers', count: 5 },
    },
    {
        key: 'community_champion',
        nameTr: 'Topluluk Şampiyonu',
        nameEn: 'Community Champion',
        description: '10 en iyi cevabınız var',
        iconUrl: '👑',
        requirement: { type: 'best_answers', count: 10 },
    },

    // Oy Rozetleri
    {
        key: 'appreciated',
        nameTr: 'Takdir Edilen',
        nameEn: 'Appreciated',
        description: '10 upvote aldınız',
        iconUrl: '👍',
        requirement: { type: 'upvotes_received', count: 10 },
    },
    {
        key: 'popular',
        nameTr: 'Popüler',
        nameEn: 'Popular',
        description: '25 upvote aldınız',
        iconUrl: '🌟',
        requirement: { type: 'upvotes_received', count: 25 },
    },
    {
        key: 'influencer',
        nameTr: 'Etkileyici',
        nameEn: 'Influencer',
        description: '50 upvote aldınız',
        iconUrl: '💫',
        requirement: { type: 'upvotes_received', count: 50 },
    },

    // Toplam Puan Rozetleri
    {
        key: 'rising_star',
        nameTr: 'Yükselen Yıldız',
        nameEn: 'Rising Star',
        description: '100 puana ulaştınız',
        iconUrl: '🌠',
        requirement: { type: 'total_points', count: 100 },
    },
    {
        key: 'veteran',
        nameTr: 'Deneyimli',
        nameEn: 'Veteran',
        description: '500 puana ulaştınız',
        iconUrl: '🎖️',
        requirement: { type: 'total_points', count: 500 },
    },
    {
        key: 'legend',
        nameTr: 'Efsane',
        nameEn: 'Legend',
        description: '1000 puana ulaştınız',
        iconUrl: '🏅',
        requirement: { type: 'total_points', count: 1000 },
    },
];

async function seedQnaBadges() {
    console.log('🎖️  Q&A Rozetleri seed ediliyor...');

    for (const badge of badges) {
        await prisma.badge.upsert({
            where: { key: badge.key },
            update: badge,
            create: badge,
        });
    }

    console.log(`✅ ${badges.length} rozet başarıyla eklendi`);
}

export { seedQnaBadges };

// Eğer direkt çalıştırılırsa
if (require.main === module) {
    seedQnaBadges()
        .catch((e) => {
            console.error('❌ Seed hatası:', e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
