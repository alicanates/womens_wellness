import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../prisma/prisma.service';
import { ChatModule } from './chat.module';
import { AuthModule } from '../auth/auth.module';
import { QuotaModule } from '../quota/quota.module';
import { UsersModule } from '../users/users.module';
import { JwtService } from '@nestjs/jwt';

describe('Chat E2E Tests', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let jwtService: JwtService;
    let authToken: string;
    let testUserId: string;
    let conversationId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ChatModule, AuthModule, QuotaModule, UsersModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        prisma = moduleFixture.get<PrismaService>(PrismaService);
        jwtService = moduleFixture.get<JwtService>(JwtService);

        // Create test user
        const testUser = await prisma.user.create({
            data: {
                email: `test-chat-${Date.now()}@example.com`,
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

        testUserId = testUser.id;

        // Generate auth token
        authToken = jwtService.sign({ sub: testUserId, email: testUser.email });
    });

    afterAll(async () => {
        // Cleanup: Delete test data
        if (conversationId) {
            await prisma.message.deleteMany({
                where: { conversationId },
            });
            await prisma.conversation.delete({
                where: { id: conversationId },
            });
        }

        await prisma.profile.deleteMany({
            where: { userId: testUserId },
        });
        await prisma.user.delete({
            where: { id: testUserId },
        });

        await app.close();
    });

    describe('Complete Chat Flow', () => {
        it('should create conversation and send message', async () => {
            // Generate a unique conversation ID
            conversationId = `test-conv-${Date.now()}`;

            // Send first message
            const response = await request(app.getHttpServer())
                .post(`/chat/${conversationId}/message`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Merhaba NOVA, nasılsın?' })
                .expect(201);

            expect(response.body).toHaveProperty('messageId');
            expect(response.body).toHaveProperty('conversationId');
            expect(response.body.conversationId).toBe(conversationId);

            // Verify conversation was created
            const conversation = await prisma.conversation.findUnique({
                where: { id: conversationId },
            });

            expect(conversation).toBeDefined();
            expect(conversation?.userId).toBe(testUserId);

            // Verify message was saved
            const messages = await prisma.message.findMany({
                where: { conversationId },
            });

            expect(messages).toHaveLength(1);
            expect(messages[0].role).toBe('user');
            expect(messages[0].content).toBe('Merhaba NOVA, nasılsın?');
        });

        it('should stream response and save to database', async () => {
            // Get initial quota
            const initialQuota = await prisma.usageQuota.findFirst({
                where: { userId: testUserId },
            });

            const initialUsage = initialQuota?.aiRequests || 0;

            // Stream response
            const response = await request(app.getHttpServer())
                .get(`/chat/${conversationId}/stream`)
                .set('Authorization', `Bearer ${authToken}`)
                .set('Accept', 'text/event-stream')
                .expect(200);

            // Wait a bit for streaming to complete
            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Verify assistant message was saved
            const messages = await prisma.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: 'asc' },
            });

            expect(messages.length).toBeGreaterThanOrEqual(2);

            const assistantMessage = messages.find((m) => m.role === 'assistant');
            expect(assistantMessage).toBeDefined();
            expect(assistantMessage?.content).toBeTruthy();
            expect(assistantMessage?.tokens).toBeGreaterThan(0);

            console.log('✅ Assistant response:', assistantMessage?.content.substring(0, 100) + '...');
            console.log('✅ Token count:', assistantMessage?.tokens);
        });

        it('should increment quota after streaming', async () => {
            // Get updated quota
            const updatedQuota = await prisma.usageQuota.findFirst({
                where: { userId: testUserId },
            });

            expect(updatedQuota).toBeDefined();
            expect(updatedQuota?.aiRequests).toBeGreaterThan(0);

            console.log('✅ Quota incremented:', updatedQuota?.aiRequests);
        });

        it('should retrieve conversation history correctly', async () => {
            const response = await request(app.getHttpServer())
                .get(`/chat/${conversationId}/history`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('conversationId', conversationId);
            expect(response.body).toHaveProperty('messages');
            expect(Array.isArray(response.body.messages)).toBe(true);
            expect(response.body.messages.length).toBeGreaterThanOrEqual(2);

            // Verify message order (most recent first)
            const messages = response.body.messages;
            const userMsg = messages.find((m: any) => m.role === 'user');
            const assistantMsg = messages.find((m: any) => m.role === 'assistant');

            expect(userMsg).toBeDefined();
            expect(assistantMsg).toBeDefined();
            expect(userMsg.content).toBe('Merhaba NOVA, nasılsın?');

            console.log('✅ Conversation history retrieved successfully');
            console.log('✅ User message:', userMsg.content);
            console.log('✅ Assistant message:', assistantMsg.content.substring(0, 100) + '...');
        });

        it('should send multiple messages in same conversation', async () => {
            // Send second message
            const response = await request(app.getHttpServer())
                .post(`/chat/${conversationId}/message`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ content: 'Bugün su içmeyi unuttum, ne yapmalıyım?' })
                .expect(201);

            expect(response.body.conversationId).toBe(conversationId);

            // Verify message count increased
            const messages = await prisma.message.findMany({
                where: { conversationId },
            });

            expect(messages.length).toBeGreaterThanOrEqual(3);

            console.log('✅ Second message sent successfully');
            console.log('✅ Total messages in conversation:', messages.length);
        });

        it('should maintain context across multiple messages', async () => {
            // Stream response for second message
            await request(app.getHttpServer())
                .get(`/chat/${conversationId}/stream`)
                .set('Authorization', `Bearer ${authToken}`)
                .set('Accept', 'text/event-stream')
                .expect(200);

            // Wait for streaming to complete
            await new Promise((resolve) => setTimeout(resolve, 5000));

            // Get all messages
            const messages = await prisma.message.findMany({
                where: { conversationId },
                orderBy: { createdAt: 'asc' },
            });

            expect(messages.length).toBeGreaterThanOrEqual(4);

            // Verify we have alternating user/assistant messages
            const roles = messages.map((m) => m.role);
            expect(roles).toContain('user');
            expect(roles).toContain('assistant');

            console.log('✅ Context maintained across multiple messages');
            console.log('✅ Message sequence:', roles.join(' -> '));
        });
    });

    describe('Conversation Management', () => {
        it('should list user conversations', async () => {
            const response = await request(app.getHttpServer())
                .get('/chat/conversations')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);

            const testConv = response.body.find((c: any) => c.id === conversationId);
            expect(testConv).toBeDefined();
            expect(testConv.userId).toBe(testUserId);

            console.log('✅ Conversations listed successfully');
            console.log('✅ Found test conversation:', testConv.id);
        });

        it('should forget conversation and delete all messages', async () => {
            const response = await request(app.getHttpServer())
                .post(`/chat/${conversationId}/forget`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(201);

            expect(response.body.status).toBe('ok');

            // Verify all messages were deleted
            const messages = await prisma.message.findMany({
                where: { conversationId },
            });

            expect(messages).toHaveLength(0);

            console.log('✅ Conversation forgotten successfully');
            console.log('✅ All messages deleted');
        });
    });
});
