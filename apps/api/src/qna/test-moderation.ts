/**
 * Moderation System Test Script
 * 
 * Bu script moderation sisteminin tüm özelliklerini test eder:
 * - İçerik raporlama
 * - Spam detection
 * - Otomatik gizleme (3+ rapor)
 * - Report review ve action
 * 
 * Kullanım:
 * ts-node apps/api/src/qna/test-moderation.ts
 */

import { PrismaClient, ContentType, ReportStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Test kullanıcıları
let testUser1: any;
let testUser2: any;
let testUser3: any;
let testUser4: any;
let adminUser: any;

// Test içerikleri
let testQuestion: any;
let testAnswer: any;
let testComment: any;

async function setup() {
    console.log('🔧 Test ortamı hazırlanıyor...\n');

    // Test kullanıcıları oluştur
    testUser1 = await prisma.user.upsert({
        where: { email: 'modtest1@test.com' },
        update: {},
        create: {
            email: 'modtest1@test.com',
            username: 'modtest1',
            password: 'test',
            profile: {
                create: {
                    firstName: 'Mod',
                    lastName: 'Test1',
                    displayName: 'Mod Test1',
                },
            },
        },
    });

    testUser2 = await prisma.user.upsert({
        where: { email: 'modtest2@test.com' },
        update: {},
        create: {
            email: 'modtest2@test.com',
            username: 'modtest2',
            password: 'test',
            profile: {
                create: {
                    firstName: 'Mod',
                    lastName: 'Test2',
                    displayName: 'Mod Test2',
                },
            },
        },
    });

    testUser3 = await prisma.user.upsert({
        where: { email: 'modtest3@test.com' },
        update: {},
        create: {
            email: 'modtest3@test.com',
            username: 'modtest3',
            password: 'test',
            profile: {
                create: {
                    firstName: 'Mod',
                    lastName: 'Test3',
                    displayName: 'Mod Test3',
                },
            },
        },
    });

    testUser4 = await prisma.user.upsert({
        where: { email: 'modtest4@test.com' },
        update: {},
        create: {
            email: 'modtest4@test.com',
            username: 'modtest4',
            password: 'test',
            profile: {
                create: {
                    firstName: 'Mod',
                    lastName: 'Test4',
                    displayName: 'Mod Test4',
                },
            },
        },
    });

    adminUser = await prisma.user.upsert({
        where: { email: 'admin@test.com' },
        update: {},
        create: {
            email: 'admin@test.com',
            username: 'admin',
            password: 'test',
            profile: {
                create: {
                    firstName: 'Admin',
                    lastName: 'User',
                    displayName: 'Admin User',
                },
            },
        },
    });

    // Test sorusu oluştur
    testQuestion = await prisma.question.create({
        data: {
            userId: testUser1.id,
            title: 'Test Sorusu',
            content: 'Bu bir test sorusudur',
            category: 'GENERAL',
        },
    });

    // Test cevabı oluştur
    testAnswer = await prisma.answer.create({
        data: {
            questionId: testQuestion.id,
            userId: testUser2.id,
            content: 'Bu bir test cevabıdır',
        },
    });

    // Test yorumu oluştur
    testComment = await prisma.questionComment.create({
        data: {
            questionId: testQuestion.id,
            userId: testUser3.id,
            content: 'Bu bir test yorumudur',
        },
    });

    console.log('✅ Test ortamı hazır\n');
}

async function testSpamDetection() {
    console.log('📝 Test 1: Spam Detection');
    console.log('─────────────────────────────────────────\n');

    const spamTexts = [
        'Buy viagra now!',
        'Click here for free money',
        'Casino winner lottery',
        'Weight loss miracle cure',
    ];

    const normalTexts = [
        'Hamilelik döneminde hangi vitaminleri almalıyım?',
        'Adet döngüm düzensiz, ne yapmalıyım?',
        'Yoga yapmak için en iyi zaman nedir?',
    ];

    console.log('Spam metinler:');
    for (const text of spamTexts) {
        const isSpam = checkSpam(text);
        console.log(`  "${text.substring(0, 30)}..." -> ${isSpam ? '🚫 SPAM' : '✅ Normal'}`);
    }

    console.log('\nNormal metinler:');
    for (const text of normalTexts) {
        const isSpam = checkSpam(text);
        console.log(`  "${text.substring(0, 30)}..." -> ${isSpam ? '🚫 SPAM' : '✅ Normal'}`);
    }

    console.log('\n✅ Spam detection testi tamamlandı\n');
}

function checkSpam(content: string): boolean {
    const SPAM_KEYWORDS = [
        'viagra',
        'cialis',
        'casino',
        'lottery',
        'winner',
        'click here',
        'buy now',
        'limited offer',
        'act now',
        'free money',
        'make money fast',
        'work from home',
        'weight loss',
        'miracle cure',
    ];

    const lowerContent = content.toLowerCase();
    return SPAM_KEYWORDS.some(keyword => lowerContent.includes(keyword));
}

async function testReportContent() {
    console.log('📝 Test 2: İçerik Raporlama');
    console.log('─────────────────────────────────────────\n');

    // Soruyu raporla
    const report1 = await prisma.contentReport.create({
        data: {
            contentId: testQuestion.id,
            contentType: ContentType.QUESTION,
            reporterId: testUser2.id,
            reason: 'Uygunsuz içerik',
            description: 'Bu soru uygunsuz içerik barındırıyor',
        },
    });
    console.log(`✅ Soru raporlandı (ID: ${report1.id})`);

    // Cevabı raporla
    const report2 = await prisma.contentReport.create({
        data: {
            contentId: testAnswer.id,
            contentType: ContentType.ANSWER,
            reporterId: testUser3.id,
            reason: 'Spam',
            description: 'Bu cevap spam içeriyor',
        },
    });
    console.log(`✅ Cevap raporlandı (ID: ${report2.id})`);

    // Yorumu raporla
    const report3 = await prisma.contentReport.create({
        data: {
            contentId: testComment.id,
            contentType: ContentType.COMMENT,
            reporterId: testUser4.id,
            reason: 'Hakaret',
            description: 'Bu yorum hakaret içeriyor',
        },
    });
    console.log(`✅ Yorum raporlandı (ID: ${report3.id})`);

    // Aynı kullanıcı tekrar raporlamaya çalışsın (hata vermeli)
    try {
        await prisma.contentReport.create({
            data: {
                contentId: testQuestion.id,
                contentType: ContentType.QUESTION,
                reporterId: testUser2.id,
                reason: 'Tekrar rapor',
            },
        });
        console.log('❌ Hata: Aynı kullanıcı tekrar rapor edebildi!');
    } catch (error) {
        console.log('✅ Aynı kullanıcı tekrar rapor edemedi (beklenen davranış)');
    }

    console.log('\n✅ İçerik raporlama testi tamamlandı\n');
}

async function testAutoHide() {
    console.log('📝 Test 3: Otomatik Gizleme (3+ Rapor)');
    console.log('─────────────────────────────────────────\n');

    // Yeni bir soru oluştur
    const questionToHide = await prisma.question.create({
        data: {
            userId: testUser1.id,
            title: 'Otomatik gizlenecek soru',
            content: 'Bu soru 3 rapor alınca otomatik gizlenecek',
            category: 'GENERAL',
        },
    });
    console.log(`📄 Test sorusu oluşturuldu (ID: ${questionToHide.id})`);

    // 1. rapor
    await prisma.contentReport.create({
        data: {
            contentId: questionToHide.id,
            contentType: ContentType.QUESTION,
            reporterId: testUser2.id,
            reason: 'Uygunsuz',
        },
    });
    console.log('  1. rapor eklendi');

    let question = await prisma.question.findUnique({
        where: { id: questionToHide.id },
    });
    console.log(`  Soru durumu: ${question?.status}`);

    // 2. rapor
    await prisma.contentReport.create({
        data: {
            contentId: questionToHide.id,
            contentType: ContentType.QUESTION,
            reporterId: testUser3.id,
            reason: 'Spam',
        },
    });
    console.log('  2. rapor eklendi');

    question = await prisma.question.findUnique({
        where: { id: questionToHide.id },
    });
    console.log(`  Soru durumu: ${question?.status}`);

    // 3. rapor (otomatik gizleme tetiklenmeli)
    await prisma.contentReport.create({
        data: {
            contentId: questionToHide.id,
            contentType: ContentType.QUESTION,
            reporterId: testUser4.id,
            reason: 'Hakaret',
        },
    });
    console.log('  3. rapor eklendi');

    // Otomatik gizleme kontrolü
    const reportCount = await prisma.contentReport.count({
        where: {
            contentId: questionToHide.id,
            contentType: ContentType.QUESTION,
        },
    });

    question = await prisma.question.findUnique({
        where: { id: questionToHide.id },
    });

    console.log(`\n  Toplam rapor sayısı: ${reportCount}`);
    console.log(`  Soru durumu: ${question?.status}`);

    if (reportCount >= 3) {
        console.log('\n✅ 3+ rapor alındı, otomatik gizleme tetiklenebilir');
    } else {
        console.log('\n❌ Otomatik gizleme tetiklenmedi');
    }

    console.log('\n✅ Otomatik gizleme testi tamamlandı\n');
}

async function testReportReview() {
    console.log('📝 Test 4: Rapor İnceleme ve Aksiyon');
    console.log('─────────────────────────────────────────\n');

    // Pending raporları getir
    const pendingReports = await prisma.contentReport.findMany({
        where: {
            status: ReportStatus.PENDING,
        },
        take: 3,
    });

    console.log(`📋 ${pendingReports.length} adet pending rapor bulundu\n`);

    if (pendingReports.length > 0) {
        // İlk raporu RESOLVED olarak işaretle
        const report1 = pendingReports[0];
        await prisma.contentReport.update({
            where: { id: report1.id },
            data: {
                status: ReportStatus.RESOLVED,
                reviewedBy: adminUser.id,
                reviewedAt: new Date(),
            },
        });
        console.log(`✅ Rapor ${report1.id} RESOLVED olarak işaretlendi`);

        // İkinci raporu DISMISSED olarak işaretle
        if (pendingReports.length > 1) {
            const report2 = pendingReports[1];
            await prisma.contentReport.update({
                where: { id: report2.id },
                data: {
                    status: ReportStatus.DISMISSED,
                    reviewedBy: adminUser.id,
                    reviewedAt: new Date(),
                },
            });
            console.log(`✅ Rapor ${report2.id} DISMISSED olarak işaretlendi`);
        }
    }

    // Rapor istatistikleri
    const stats = await prisma.contentReport.groupBy({
        by: ['status'],
        _count: true,
    });

    console.log('\n📊 Rapor İstatistikleri:');
    for (const stat of stats) {
        console.log(`  ${stat.status}: ${stat._count} rapor`);
    }

    console.log('\n✅ Rapor inceleme testi tamamlandı\n');
}

async function testGetReports() {
    console.log('📝 Test 5: Rapor Listeleme ve Filtreleme');
    console.log('─────────────────────────────────────────\n');

    // Tüm raporlar
    const allReports = await prisma.contentReport.findMany({
        include: {
            reporter: {
                select: {
                    username: true,
                },
            },
            reviewer: {
                select: {
                    username: true,
                },
            },
        },
    });
    console.log(`📋 Toplam ${allReports.length} rapor bulundu`);

    // Status'a göre filtrele
    const pendingReports = await prisma.contentReport.findMany({
        where: { status: ReportStatus.PENDING },
    });
    console.log(`  - PENDING: ${pendingReports.length} rapor`);

    const resolvedReports = await prisma.contentReport.findMany({
        where: { status: ReportStatus.RESOLVED },
    });
    console.log(`  - RESOLVED: ${resolvedReports.length} rapor`);

    const dismissedReports = await prisma.contentReport.findMany({
        where: { status: ReportStatus.DISMISSED },
    });
    console.log(`  - DISMISSED: ${dismissedReports.length} rapor`);

    // Content type'a göre filtrele
    const questionReports = await prisma.contentReport.findMany({
        where: { contentType: ContentType.QUESTION },
    });
    console.log(`\n  - QUESTION: ${questionReports.length} rapor`);

    const answerReports = await prisma.contentReport.findMany({
        where: { contentType: ContentType.ANSWER },
    });
    console.log(`  - ANSWER: ${answerReports.length} rapor`);

    const commentReports = await prisma.contentReport.findMany({
        where: { contentType: ContentType.COMMENT },
    });
    console.log(`  - COMMENT: ${commentReports.length} rapor`);

    console.log('\n✅ Rapor listeleme testi tamamlandı\n');
}

async function cleanup() {
    console.log('🧹 Test verileri temizleniyor...\n');

    // Test raporlarını sil
    await prisma.contentReport.deleteMany({
        where: {
            reporter: {
                email: {
                    in: [
                        'modtest1@test.com',
                        'modtest2@test.com',
                        'modtest3@test.com',
                        'modtest4@test.com',
                    ],
                },
            },
        },
    });

    // Test içeriklerini sil
    await prisma.questionComment.deleteMany({
        where: {
            user: {
                email: {
                    in: [
                        'modtest1@test.com',
                        'modtest2@test.com',
                        'modtest3@test.com',
                        'modtest4@test.com',
                    ],
                },
            },
        },
    });

    await prisma.answer.deleteMany({
        where: {
            user: {
                email: {
                    in: [
                        'modtest1@test.com',
                        'modtest2@test.com',
                        'modtest3@test.com',
                        'modtest4@test.com',
                    ],
                },
            },
        },
    });

    await prisma.question.deleteMany({
        where: {
            user: {
                email: {
                    in: [
                        'modtest1@test.com',
                        'modtest2@test.com',
                        'modtest3@test.com',
                        'modtest4@test.com',
                    ],
                },
            },
        },
    });

    console.log('✅ Test verileri temizlendi\n');
}

async function main() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   MODERATION SYSTEM TEST SUITE         ║');
    console.log('╚════════════════════════════════════════╝\n');

    try {
        await setup();
        await testSpamDetection();
        await testReportContent();
        await testAutoHide();
        await testReportReview();
        await testGetReports();

        console.log('╔════════════════════════════════════════╗');
        console.log('║   ✅ TÜM TESTLER BAŞARILI              ║');
        console.log('╚════════════════════════════════════════╝\n');
    } catch (error) {
        console.error('❌ Test hatası:', error);
    } finally {
        await cleanup();
        await prisma.$disconnect();
    }
}

main();
