import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hash(password: string, rounds = 10): Promise<string> {
  return bcrypt.hash(password, rounds);
}

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@wellness.local' },
    update: {},
    create: {
      email: 'admin@wellness.local',
      password: await hash('admin123', 10),
      profile: {
        create: {
          displayName: 'Admin User',
          timezone: 'Europe/Istanbul',
        },
      },
      subscription: {
        create: {
          plan: 'premium',
          status: 'active',
        },
      },
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create free user
  const freeUser = await prisma.user.upsert({
    where: { email: 'free@wellness.local' },
    update: {},
    create: {
      email: 'free@wellness.local',
      password: await hash('free123', 10),
      profile: {
        create: {
          displayName: 'Free User',
          timezone: 'Europe/Istanbul',
          heightCm: 165,
          weightKg: 60,
        },
      },
      subscription: {
        create: {
          plan: 'free',
          status: 'active',
        },
      },
      usageQuota: {
        create: {
          monthKey: new Date().toISOString().slice(0, 7), // YYYY-MM
          aiRequests: 0,
          limit: 100,
          resetsAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      },
    },
  });

  console.log('✅ Created free user:', freeUser.email);

  // Create premium user
  const premiumUser = await prisma.user.upsert({
    where: { email: 'premium@wellness.local' },
    update: {},
    create: {
      email: 'premium@wellness.local',
      password: await hash('premium123', 10),
      profile: {
        create: {
          displayName: 'Premium User',
          timezone: 'Europe/Istanbul',
          heightCm: 170,
          weightKg: 65,
        },
      },
      subscription: {
        create: {
          plan: 'premium',
          status: 'active',
        },
      },
      usageQuota: {
        create: {
          monthKey: new Date().toISOString().slice(0, 7),
          aiRequests: 0,
          limit: 1000,
          resetsAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      },
    },
  });

  console.log('✅ Created premium user:', premiumUser.email);

  // Create model policies
  const freePolicy = await prisma.modelPolicy.upsert({
    where: { plan_provider: { plan: 'free', provider: 'openai' } },
    update: {},
    create: {
      plan: 'free',
      provider: 'openai',
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 1024,
      toolsEnabledJson: ['get_user_metrics', 'get_quota'],
    },
  });

  console.log('✅ Created free model policy:', freePolicy.id);

  const premiumPolicy = await prisma.modelPolicy.upsert({
    where: { plan_provider: { plan: 'premium', provider: 'anthropic' } },
    update: {},
    create: {
      plan: 'premium',
      provider: 'anthropic',
      modelName: 'claude-3-5-sonnet-20241022',
      temperature: 0.8,
      maxTokens: 4096,
      toolsEnabledJson: [
        'get_user_metrics',
        'log_water',
        'get_next_period_prediction',
        'create_reminder',
        'get_quota',
      ],
    },
  });

  console.log('✅ Created premium model policy:', premiumPolicy.id);

  // Create feature flags
  await prisma.featureFlag.upsert({
    where: { key: 'ai.google.enabled' },
    update: {},
    create: {
      key: 'ai.google.enabled',
      valueJson: false,
    },
  });

  await prisma.featureFlag.upsert({
    where: { key: 'reminders.server_push' },
    update: {},
    create: {
      key: 'reminders.server_push',
      valueJson: true,
    },
  });

  await prisma.featureFlag.upsert({
    where: { key: 'admin.impersonation' },
    update: {},
    create: {
      key: 'admin.impersonation',
      valueJson: false,
    },
  });

  console.log('✅ Created feature flags');

  // Create educational articles
  const articles = [
    {
      titleTr: 'Menstrüel Siklusunuzu Anlamak',
      titleEn: 'Understanding Your Menstrual Cycle',
      contentTr: 'Menstrüel siklus, vücudunuzun gebeliğe hazırlanma sürecidir. Ortalama 28 gün sürer, ancak 21-35 gün arası normal kabul edilir. Siklusunuzu takip etmek, vücudunuzu daha iyi anlamanıza yardımcı olur.',
      contentEn: 'The menstrual cycle is your body\'s process of preparing for pregnancy. It typically lasts 28 days, but 21-35 days is considered normal. Tracking your cycle helps you better understand your body.',
      category: 'menstrual_health',
      tags: ['cycle', 'period', 'basics'],
      priority: 100,
    },
    {
      titleTr: 'Hidrasyon ve Kadın Sağlığı',
      titleEn: 'Hydration and Women\'s Health',
      contentTr: 'Yeterli su içmek, hormonal dengeyi destekler ve döngü düzensizliklerini azaltabilir. Günde en az 2 litre su içmeyi hedefleyin. Vücut ağırlığınızın her kilosu için yaklaşık 30 ml su tüketin.',
      contentEn: 'Adequate water intake supports hormonal balance and can reduce cycle irregularities. Aim for at least 2 liters of water daily. Consume about 30 ml of water for each kilogram of body weight.',
      category: 'hydration',
      tags: ['water', 'health', 'hormones'],
      priority: 90,
    },
    {
      titleTr: 'Uyku ve Hormonal Sağlık',
      titleEn: 'Sleep and Hormonal Health',
      contentTr: 'Kaliteli uyku, hormonal dengeniz için çok önemlidir. Günde 7-9 saat uyumayı hedefleyin. Düzenli uyku saatleri, döngü düzenini destekler ve PMS semptomlarını azaltabilir.',
      contentEn: 'Quality sleep is crucial for your hormonal balance. Aim for 7-9 hours of sleep per day. Regular sleep schedules support cycle regularity and can reduce PMS symptoms.',
      category: 'sleep',
      tags: ['sleep', 'hormones', 'pms'],
      priority: 85,
    },
    {
      titleTr: 'Egzersiz ve Menstrüel Sağlık',
      titleEn: 'Exercise and Menstrual Health',
      contentTr: 'Düzenli egzersiz, ağrılı adet sorunlarını azaltabilir ve ruh halinizi iyileştirebilir. Haftada en az 150 dakika orta şiddette aktivite yapın. Yoga ve yürüyüş, dönem sırasında özellikle faydalıdır.',
      contentEn: 'Regular exercise can reduce period pain and improve mood. Aim for at least 150 minutes of moderate activity per week. Yoga and walking are especially beneficial during your period.',
      category: 'exercise',
      tags: ['exercise', 'pain', 'mood'],
      priority: 80,
    },
    {
      titleTr: 'Farkındalık ve Döngü Takibi',
      titleEn: 'Mindfulness and Cycle Tracking',
      contentTr: 'Döngünüzü takip etmek, vücudunuzla daha fazla bağlantı kurmanıza yardımcı olur. Semptomlarınızı, ruh halinizi ve enerji seviyelerinizi not edin. Bu bilgiler, sağlık profesyonellerinizle paylaşılabilir.',
      contentEn: 'Tracking your cycle helps you connect more with your body. Note your symptoms, mood, and energy levels. This information can be shared with your healthcare providers.',
      category: 'mindfulness',
      tags: ['tracking', 'awareness', 'health'],
      priority: 75,
    },
  ];

  for (const article of articles) {
    await prisma.educationalArticle.upsert({
      where: { id: `article-${article.category}-1` },
      update: {},
      create: {
        id: `article-${article.category}-1`,
        ...article,
      },
    });
  }

  console.log('✅ Created educational articles');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
