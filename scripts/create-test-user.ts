import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Test1234', 10);

  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password,
      status: 'ACTIVE',
      profile: {
        create: {
          displayName: 'Test User',
          timezone: 'Europe/Istanbul',
        },
      },
      subscription: {
        create: {
          plan: 'FREE',
          status: 'ACTIVE',
        },
      },
      usageQuotas: {
        create: {
          monthKey: new Date().toISOString().substring(0, 7),
          aiRequests: 0,
          limit: 100,
          resetsAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      },
    },
    include: {
      profile: true,
    },
  });

  console.log('✅ Test user created successfully!');
  console.log('📧 Email: test@example.com');
  console.log('🔑 Password: Test1234');
  console.log('👤 User ID:', user.id);
}

main()
  .catch((e) => {
    console.error('❌ Error creating test user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
