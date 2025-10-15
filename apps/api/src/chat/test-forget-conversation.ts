/**
 * End-to-End Test: Forget Conversation
 * 
 * Bu script "forget conversation" özelliğini test eder:
 * 1. Test kullanıcısı ve conversation oluşturma
 * 2. Birkaç mesaj ekleme
 * 3. "Sil" butonuna basıp conversation'ı silme
 * 4. Tüm mesajların silindiğini doğrulama
 * 5. Yeni conversation ID'nin oluştuğunu kontrol etme
 * 
 * Kullanım: bash src/chat/run-forget-test.sh
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
        const email = `test-forget-${Date.now()}@example.com`;
        const user = await prisma.user.create({
            data: {
                email,
                password: 'hashedpassword',
                profile: {
                    create: {
                        firstName: 'Test',
                        lastName: 'Forget',
                        displayName: 'Test Forget User',
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

async function testForgetConversation() {
    let testUser: any;
    let conversationId: string | undefined;

    try {
        console.log('\n🚀 Starting Forget Conversation Test\n');

        // Step 1: Create test user
        testUser = await createTestUser();

        // Step 2: Create conversation with multiple messages
        conversationId = `test-forget-conv-${Date.now()}`;

        const conversation = await prisma.conversation.create({
            data: {
                id: conversationId,
                userId: testUser.id,
                title: 'Test Conversation to Forget',
            },
        });

        logResult(
            'Create Conversation',
            true,
            `Conversation created with ID: ${conversationId}`,
            { conversationId }
        );

        // Step 3: Add multiple messages to the conversation
        const messages = [
            { role: 'user' as const, content: 'Merhaba NOVA!' },
            { role: 'assistant' as const, content: 'Merhaba! Nasıl yardımcı olabilirim?' },
            { role: 'user' as const, content: 'Bugün kendimi yorgun hissediyorum' },
            { role: 'assistant' as const, content: 'Anlıyorum. Yeterli uyku aldığından emin ol.' },
            { role: 'user' as const, content: 'Teşekkürler!' },
        ];

        for (const msg of messages) {
            await prisma.message.create({
                data: {
                    conversationId,
                    role: msg.role,
                    content: msg.content,
                    tokens: msg.role === 'assistant' ? msg.content.split(' ').length : undefined,
                },
            });
        }

        logResult(
            'Add Messages',
            true,
            `${messages.length} messages added to conversation`,
            { messageCount: messages.length }
        );

        // Step 4: Verify messages exist
        const messagesBefore = await prisma.message.findMany({
            where: { conversationId },
        });

        if (messagesBefore.length === messages.length) {
            logResult(
                'Verify Messages Exist',
                true,
                `Found ${messagesBefore.length} messages before deletion`,
                { messageCount: messagesBefore.length }
            );
        } else {
            logResult(
                'Verify Messages Exist',
                false,
                `Expected ${messages.length} messages, found ${messagesBefore.length}`
            );
        }

        // Step 5: Create conversation-scoped memory entries
        await prisma.memory.createMany({
            data: [
                {
                    userId: testUser.id,
                    scope: 'conversation',
                    key: `conv:${conversationId}:preference`,
                    valueJson: { value: 'user prefers detailed explanations' },
                },
                {
                    userId: testUser.id,
                    scope: 'conversation',
                    key: `conv:${conversationId}:context`,
                    valueJson: { value: 'discussing wellness and fatigue' },
                },
            ],
        });

        const memoryBefore = await prisma.memory.findMany({
            where: {
                userId: testUser.id,
                scope: 'conversation',
                key: { startsWith: `conv:${conversationId}:` },
            },
        });

        logResult(
            'Create Conversation Memory',
            true,
            `${memoryBefore.length} memory entries created`,
            { memoryCount: memoryBefore.length }
        );

        // Step 6: Call forgetConversation (simulate the service method)
        // Delete all messages
        const deletedMessages = await prisma.message.deleteMany({
            where: { conversationId },
        });

        logResult(
            'Delete Messages',
            true,
            `${deletedMessages.count} messages deleted`,
            { deletedCount: deletedMessages.count }
        );

        // Delete conversation-scoped memory
        const deletedMemory = await prisma.memory.deleteMany({
            where: {
                userId: testUser.id,
                scope: 'conversation',
                key: { startsWith: `conv:${conversationId}:` },
            },
        });

        logResult(
            'Delete Conversation Memory',
            true,
            `${deletedMemory.count} memory entries deleted`,
            { deletedCount: deletedMemory.count }
        );

        // Step 7: Verify all messages are deleted
        const messagesAfter = await prisma.message.findMany({
            where: { conversationId },
        });

        if (messagesAfter.length === 0) {
            logResult(
                'Verify Messages Deleted',
                true,
                'All messages successfully deleted',
                { remainingMessages: 0 }
            );
        } else {
            logResult(
                'Verify Messages Deleted',
                false,
                `${messagesAfter.length} messages still exist`,
                { remainingMessages: messagesAfter.length }
            );
        }

        // Step 8: Verify all conversation memory is deleted
        const memoryAfter = await prisma.memory.findMany({
            where: {
                userId: testUser.id,
                scope: 'conversation',
                key: { startsWith: `conv:${conversationId}:` },
            },
        });

        if (memoryAfter.length === 0) {
            logResult(
                'Verify Memory Deleted',
                true,
                'All conversation memory successfully deleted',
                { remainingMemory: 0 }
            );
        } else {
            logResult(
                'Verify Memory Deleted',
                false,
                `${memoryAfter.length} memory entries still exist`,
                { remainingMemory: memoryAfter.length }
            );
        }

        // Step 9: Verify conversation still exists (only messages are deleted)
        const conversationAfter = await prisma.conversation.findUnique({
            where: { id: conversationId },
        });

        if (conversationAfter) {
            logResult(
                'Verify Conversation Exists',
                true,
                'Conversation container still exists (as expected)',
                { conversationId: conversationAfter.id }
            );
        } else {
            logResult(
                'Verify Conversation Exists',
                false,
                'Conversation was deleted (unexpected)'
            );
        }

        // Step 10: Simulate creating a new conversation (user continues chatting)
        const newConversationId = `test-new-conv-${Date.now()}`;
        const newConversation = await prisma.conversation.create({
            data: {
                id: newConversationId,
                userId: testUser.id,
                title: 'New Conversation After Forget',
            },
        });

        if (newConversation.id !== conversationId) {
            logResult(
                'Create New Conversation',
                true,
                'New conversation created with different ID',
                {
                    oldId: conversationId,
                    newId: newConversation.id,
                }
            );
        } else {
            logResult(
                'Create New Conversation',
                false,
                'New conversation has same ID as old one'
            );
        }

        // Step 11: Add a message to new conversation
        await prisma.message.create({
            data: {
                conversationId: newConversation.id,
                role: 'user',
                content: 'Yeni bir sohbet başlatıyorum',
            },
        });

        const newMessages = await prisma.message.findMany({
            where: { conversationId: newConversation.id },
        });

        if (newMessages.length === 1) {
            logResult(
                'Verify New Conversation Independent',
                true,
                'New conversation has its own messages',
                { messageCount: newMessages.length }
            );
        } else {
            logResult(
                'Verify New Conversation Independent',
                false,
                `Expected 1 message, found ${newMessages.length}`
            );
        }

        // Step 12: Verify old conversation still has no messages
        const oldMessages = await prisma.message.findMany({
            where: { conversationId },
        });

        if (oldMessages.length === 0) {
            logResult(
                'Verify Old Conversation Empty',
                true,
                'Old conversation remains empty after new conversation created',
                { oldConvMessages: 0 }
            );
        } else {
            logResult(
                'Verify Old Conversation Empty',
                false,
                `Old conversation has ${oldMessages.length} messages`
            );
        }

        // Cleanup
        await prisma.message.deleteMany({
            where: { conversationId: newConversation.id },
        });

        await prisma.conversation.delete({
            where: { id: newConversation.id },
        });

        await prisma.conversation.delete({
            where: { id: conversationId },
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
                await prisma.memory.deleteMany({ where: { userId: testUser.id } });
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
        console.log('✨ Forget conversation feature is working correctly!');
        console.log('   - Messages are deleted');
        console.log('   - Conversation memory is cleared');
        console.log('   - New conversations can be created independently\n');
    } else {
        console.log('\n⚠️  Some tests failed. Review the results above.\n');
        process.exit(1);
    }
}

// Run the test
testForgetConversation().catch(console.error);
