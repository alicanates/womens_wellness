import { PrismaClient, AIProvider } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding AI providers...');

    // Get API key from environment
    const googleApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (googleApiKey) {
        await prisma.aIProviderConfig.upsert({
            where: { provider: AIProvider.google },
            update: {
                apiKey: googleApiKey,
                modelName: 'gemini-2.5-flash',
                displayName: 'Google Gemini 2.5 Flash',
                description: 'Fast and efficient model for chat',
                isActive: true,
                priority: 100,
            },
            create: {
                provider: AIProvider.google,
                apiKey: googleApiKey,
                modelName: 'gemini-2.5-flash',
                displayName: 'Google Gemini 2.5 Flash',
                description: 'Fast and efficient model for chat',
                isActive: true,
                priority: 100,
            },
        });
        console.log('✓ Google Gemini provider configured');
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
