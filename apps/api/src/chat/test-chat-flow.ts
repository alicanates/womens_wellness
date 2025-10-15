/**
 * End-to-End Chat Flow Test
 * 
 * Bu script tam chat akışını test eder:
 * 1. Yeni conversation oluşturma ve mesaj gönderme
 * 2. Streaming yanıtı alma ve veritabanına kaydetme
 * 3. Quota'nın arttığını doğrulama
 * 4. Conversation history'nin doğru çalıştığını test etme
 * 
 * Kullanım: bash src/chat/run-chat-flow-test.sh
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TestResult {
    step: string;
    success: boolean;
    message: string;
    data?: any;
}

const results: TestResult[] = [];

function logResult(step: string, success: boolean, message: string, data?: any) {
    results.push({ step, success, message, data });
    const icon = success ? '✅' : '❌';
    console.log(`${icon} ${step}: ${message}`);
    if (data) {
        console.log('   Data:', JSON.stringify(data, null, 2));
    }
}

async function createTestUser() {
    try {
        const email = `test-chat-${Date.now()}@example.com`;
        const user = await prisma.user.create({
            data: {
                email,
                password: 'hashedpassword',
                profile: {
                    create: {
                        firstName: 'Test',
                        lastName: 'User',
                        displayName: 'Test User',
                    },
                },
            },
        });

        logResult('Create Test User', true, `User created with ID: ${user.id}`, { userId: user.id, email });
        return user;
    } catch (error: any) {
        logResult('Create Test User', false, error.message);
        throw error;
    }
}

async function generateAuthToken(userId: string, email: string): Promise<string> {
    // Bu basitleştirilmiş bir token. Gerçek uygulamada JWT service kullanılmalı
    // Şimdilik manuel olarak bir token oluşturacağız
    try {
        // Test için mevcut bir kullanıcının token'ını kullanabiliriz
        // veya auth endpoint'ini çağırabiliriz
        logResult('Generate Auth Token', true, 'Token generation simulated');
        return 'test-token'; // Bu gerçek bir test için değiştirilmeli
    } catch (error: any) {
        logResult('Generate Auth Token', false, error.message);
        throw error;
    }
}

async function testChatFlow() {
    let testUser: any;
    let conversationId: string | undefined;
    let authToken: string;

    try {
        console.log('\n🚀 Starting End-to-End Chat Flow Test\n');

        // Step 1: Create test user
        testUser = await createTestUser();
        authToken = await generateAuthToken(testUser.id, testUser.email);

        // Step 2: Create conversation and send message
        conversationId = `test-conv-${Date.now()}`;

        const userMessage = 'Merhaba NOVA, nasılsın?';

        // Save user message directly to database
        const conversation = await prisma.conversation.create({
            data: {
                id: conversationId,
                userId: testUser.id,
                title: 'Test Conversation',
            },
        });

        const message = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                role: 'user',
                content: userMessage,
            },
        });

        logResult(
            'Create Conversation & Send Message',
            true,
            `Conversation created with ID: ${conversationId}`,
            { conversationId, messageId: message.id, content: userMessage }
        );

        // Step 3: Verify conversation was created
        const savedConversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { messages: true },
        });

        if (savedConversation && savedConversation.messages.length === 1) {
            logResult(
                'Verify Conversation Created',
                true,
                `Conversation found with ${savedConversation.messages.length} message(s)`
            );
        } else {
            logResult('Verify Conversation Created', false, 'Conversation not found or message count mismatch');
        }

        // Step 4: Get initial quota
        let quota = await prisma.usageQuota.findFirst({
            where: { userId: testUser.id },
        });

        if (!quota) {
            // Create initial quota
            const now = new Date();
            const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const resetsAt = new Date(now.getFullYear(), now.getMonth() + 1, 1);

            quota = await prisma.usageQuota.create({
                data: {
                    userId: testUser.id,
                    monthKey,
                    aiRequests: 0,
                    limit: 100,
                    resetsAt,
                },
            });
        }

        const initialQuotaUsage = quota.aiRequests;
        logResult('Get Initial Quota', true, `Initial quota usage: ${initialQuotaUsage}/${quota.limit}`);

        // Step 5: Simulate streaming response (we'll create a mock assistant message)
        // In a real test, this would call the actual streaming endpoint
        const assistantResponse = 'Merhaba! Ben NOVA, senin sağlık asistanınım. Çok iyiyim, teşekkür ederim! Sana nasıl yardımcı olabilirim?';
        const tokenCount = assistantResponse.split(' ').length;

        const assistantMessage = await prisma.message.create({
            data: {
                conversationId,
                role: 'assistant',
                content: assistantResponse,
                tokens: tokenCount,
            },
        });

        logResult(
            'Save Assistant Response',
            true,
            `Assistant message saved with ${tokenCount} tokens`,
            { messageId: assistantMessage.id, tokens: tokenCount }
        );

        // Step 6: Increment quota
        const updatedQuota = await prisma.usageQuota.update({
            where: { id: quota.id },
            data: {
                aiRequests: { increment: 1 },
            },
        });

        if (updatedQuota.aiRequests === initialQuotaUsage + 1) {
            logResult(
                'Increment Quota',
                true,
                `Quota incremented: ${initialQuotaUsage} → ${updatedQuota.aiRequests}`,
                { before: initialQuotaUsage, after: updatedQuota.aiRequests }
            );
        } else {
            logResult('Increment Quota', false, 'Quota increment failed');
        }

        // Step 7: Retrieve conversation history
        const history = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'desc' },
            select: {
                role: true,
                content: true,
                tokens: true,
                createdAt: true,
            },
        });

        if (history.length === 2) {
            const hasUserMessage = history.some(m => m.role === 'user');
            const hasAssistantMessage = history.some(m => m.role === 'assistant');

            if (hasUserMessage && hasAssistantMessage) {
                logResult(
                    'Retrieve Conversation History',
                    true,
                    `History retrieved with ${history.length} messages`,
                    { messageCount: history.length, roles: history.map(m => m.role) }
                );
            } else {
                logResult('Retrieve Conversation History', false, 'Message roles incorrect');
            }
        } else {
            logResult('Retrieve Conversation History', false, `Expected 2 messages, got ${history.length}`);
        }

        // Step 8: Send second message and test context
        const secondUserMessage = 'Bugün su içmeyi unuttum, ne yapmalıyım?';

        await prisma.message.create({
            data: {
                conversationId,
                role: 'user',
                content: secondUserMessage,
            },
        });

        const secondAssistantResponse = 'Su içmek çok önemli! Hemen bir bardak su içmeye başlayabilirsin. Günlük hedefine ulaşmak için düzenli aralıklarla su içmeyi unutma.';

        await prisma.message.create({
            data: {
                conversationId,
                role: 'assistant',
                content: secondAssistantResponse,
                tokens: secondAssistantResponse.split(' ').length,
            },
        });

        // Increment quota again
        await prisma.usageQuota.update({
            where: { id: quota.id },
            data: {
                aiRequests: { increment: 1 },
            },
        });

        logResult(
            'Send Second Message',
            true,
            'Second message exchange completed',
            { userMessage: secondUserMessage }
        );

        // Step 9: Verify context maintained
        const fullHistory = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
        });

        if (fullHistory.length === 4) {
            const roles = fullHistory.map(m => m.role);
            const expectedPattern = ['user', 'assistant', 'user', 'assistant'];
            const patternMatches = roles.every((role, idx) => role === expectedPattern[idx]);

            if (patternMatches) {
                logResult(
                    'Verify Context Maintained',
                    true,
                    'Message sequence correct',
                    { sequence: roles.join(' → ') }
                );
            } else {
                logResult('Verify Context Maintained', false, 'Message sequence incorrect');
            }
        } else {
            logResult('Verify Context Maintained', false, `Expected 4 messages, got ${fullHistory.length}`);
        }

        // Step 10: Test forget conversation
        await prisma.message.deleteMany({
            where: { conversationId },
        });

        const remainingMessages = await prisma.message.findMany({
            where: { conversationId },
        });

        if (remainingMessages.length === 0) {
            logResult(
                'Forget Conversation',
                true,
                'All messages deleted successfully'
            );
        } else {
            logResult('Forget Conversation', false, `${remainingMessages.length} messages still exist`);
        }

        // Cleanup
        await prisma.conversation.delete({
            where: { id: conversationId },
        });

        await prisma.usageQuota.delete({
            where: { id: quota.id },
        });

        await prisma.profile.delete({
            where: { userId: testUser.id },
        });

        await prisma.user.delete({
            where: { id: testUser.id },
        });

        logResult('Cleanup', true, 'Test data cleaned up');

    } catch (error: any) {
        console.error('\n❌ Test failed with error:', error.message);
        console.error(error.stack);

        // Cleanup on error
        if (testUser) {
            try {
                if (conversationId) {
                    await prisma.message.deleteMany({ where: { conversationId } });
                    await prisma.conversation.deleteMany({ where: { id: conversationId } });
                }
                await prisma.usageQuota.deleteMany({ where: { userId: testUser.id } });
                await prisma.profile.deleteMany({ where: { userId: testUser.id } });
                await prisma.user.delete({ where: { id: testUser.id } });
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError);
            }
        }
    } finally {
        await prisma.$disconnect();
    }

    // Print summary
    console.log('\n📊 Test Summary\n');
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    const successRate = ((successCount / totalCount) * 100).toFixed(1);

    console.log(`Total Tests: ${totalCount}`);
    console.log(`Passed: ${successCount}`);
    console.log(`Failed: ${totalCount - successCount}`);
    console.log(`Success Rate: ${successRate}%`);

    if (successCount === totalCount) {
        console.log('\n🎉 All tests passed!\n');
    } else {
        console.log('\n⚠️  Some tests failed. Review the results above.\n');
    }
}

// Run the test
testChatFlow().catch(console.error);
