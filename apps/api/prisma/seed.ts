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
