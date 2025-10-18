/**
 * E2E Test Setup Validation
 * 
 * Bu script, e2e testlerinin çalışması için gerekli ortamı kontrol eder.
 */

import { PrismaClient } from '@prisma/client';

async function validateSetup() {
    console.log('🔍 E2E Test Ortamı Kontrol Ediliyor...\n');

    let hasErrors = false;

    // 1. Database bağlantısı kontrolü
    console.log('1️⃣  Database bağlantısı kontrol ediliyor...');
    try {
        const prisma = new PrismaClient();
        await prisma.$connect();
        console.log('   ✅ Database bağlantısı başarılı\n');
        await prisma.$disconnect();
    } catch (error) {
        console.error('   ❌ Database bağlantısı başarısız:', error.message);
        console.error('   💡 Çözüm: PostgreSQL\'in çalıştığından emin olun\n');
        hasErrors = true;
    }

    // 2. Environment variables kontrolü
    console.log('2️⃣  Environment variables kontrol ediliyor...');
    const requiredEnvVars = [
        'DATABASE_URL',
        'JWT_SECRET',
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length === 0) {
        console.log('   ✅ Tüm gerekli environment variables mevcut\n');
    } else {
        console.error('   ❌ Eksik environment variables:', missingVars.join(', '));
        console.error('   💡 Çözüm: .env dosyasını kontrol edin\n');
        hasErrors = true;
    }

    // 3. QnA modülü varlık kontrolü
    console.log('3️⃣  QnA modülü dosyaları kontrol ediliyor...');
    const fs = require('fs');
    const path = require('path');

    const requiredFiles = [
        'qna.module.ts',
        'qna.service.ts',
        'questions.controller.ts',
        'answers.controller.ts',
        'vote.controller.ts',
        'vote.service.ts',
    ];

    const qnaDir = path.join(__dirname);
    const missingFiles = requiredFiles.filter(file =>
        !fs.existsSync(path.join(qnaDir, file))
    );

    if (missingFiles.length === 0) {
        console.log('   ✅ Tüm QnA modülü dosyaları mevcut\n');
    } else {
        console.error('   ❌ Eksik dosyalar:', missingFiles.join(', '));
        hasErrors = true;
    }

    // 4. Prisma schema kontrolü
    console.log('4️⃣  Prisma schema kontrol ediliyor...');
    const schemaPath = path.join(__dirname, '../../../prisma/schema.prisma');

    if (fs.existsSync(schemaPath)) {
        const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
        const requiredModels = [
            'Question',
            'Answer',
            'AnswerVote',
            'QuestionComment',
            'AnswerComment',
            'UserReputation',
        ];

        const missingModels = requiredModels.filter(model =>
            !schemaContent.includes(`model ${model}`)
        );

        if (missingModels.length === 0) {
            console.log('   ✅ Tüm gerekli Prisma modelleri mevcut\n');
        } else {
            console.error('   ❌ Eksik Prisma modelleri:', missingModels.join(', '));
            console.error('   💡 Çözüm: Prisma migration\'ları çalıştırın\n');
            hasErrors = true;
        }
    } else {
        console.error('   ❌ Prisma schema dosyası bulunamadı');
        hasErrors = true;
    }

    // Sonuç
    console.log('═══════════════════════════════════════════════════\n');

    if (hasErrors) {
        console.log('❌ E2E testleri çalıştırılamaz - Yukarıdaki hataları düzeltin\n');
        console.log('📝 Gerekli adımlar:');
        console.log('   1. PostgreSQL\'i başlatın');
        console.log('   2. .env dosyasını yapılandırın');
        console.log('   3. Prisma migration\'ları çalıştırın:');
        console.log('      cd apps/api && npx prisma migrate dev\n');
        process.exit(1);
    } else {
        console.log('✅ E2E test ortamı hazır!\n');
        console.log('🚀 Testleri çalıştırmak için:');
        console.log('   ./src/qna/run-e2e-test.sh\n');
        console.log('   veya\n');
        console.log('   npx jest src/qna/qna.e2e.spec.ts --runInBand --verbose\n');
        process.exit(0);
    }
}

validateSetup().catch(error => {
    console.error('❌ Validation hatası:', error);
    process.exit(1);
});
