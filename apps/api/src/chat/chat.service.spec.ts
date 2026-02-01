import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
import { MemoryService } from '../memory/memory.service';
import { QuotaService } from '../quota/quota.service';
import { ModelPolicyService } from '../model-policy/model-policy.service';
import { ContextBuilderService } from './context-builder.service';
import { ModelSelectorService } from './model-selector.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ChatService', () => {
    let service: ChatService;
    let prisma: jest.Mocked<PrismaService>;
    let memoryService: jest.Mocked<MemoryService>;
    let quotaService: jest.Mocked<QuotaService>;
    let modelPolicyService: jest.Mocked<ModelPolicyService>;
    let contextBuilder: jest.Mocked<ContextBuilderService>;
    let modelSelector: jest.Mocked<ModelSelectorService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChatService,
                {
                    provide: PrismaService,
                    useValue: {
                        conversation: {
                            findUnique: jest.fn(),
                            findMany: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
                        },
                        message: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                            deleteMany: jest.fn(),
                        },
                        user: {
                            findUnique: jest.fn(),
                        },
                    },
                },
                {
                    provide: MemoryService,
                    useValue: {
                        getMemoriesForContext: jest.fn(),
                        saveMemory: jest.fn(),
                        forgetAll: jest.fn(),
                    },
                },
                {
                    provide: QuotaService,
                    useValue: {
                        checkQuota: jest.fn(),
                        incrementUsage: jest.fn(),
                    },
                },
                {
                    provide: ModelPolicyService,
                    useValue: {
                        getActivePolicy: jest.fn(),
                    },
                },
                {
                    provide: ContextBuilderService,
                    useValue: {
                        buildContext: jest.fn(),
                    },
                },
                {
                    provide: ModelSelectorService,
                    useValue: {
                        getModel: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<ChatService>(ChatService);
        prisma = module.get(PrismaService) as jest.Mocked<PrismaService>;
        memoryService = module.get(MemoryService) as jest.Mocked<MemoryService>;
        quotaService = module.get(QuotaService) as jest.Mocked<QuotaService>;
        modelPolicyService = module.get(ModelPolicyService) as jest.Mocked<ModelPolicyService>;
        contextBuilder = module.get(ContextBuilderService) as jest.Mocked<ContextBuilderService>;
        modelSelector = module.get(ModelSelectorService) as jest.Mocked<ModelSelectorService>;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getConversations', () => {
        it('should return user conversations', async () => {
            const userId = 'user-1';
            const mockConversations = [
                {
                    id: 'conv-1',
                    userId,
                    title: 'Test Conversation',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            prisma.conversation.findMany.mockResolvedValue(mockConversations as any);

            const result = await service.getConversations(userId);

            expect(result).toEqual(mockConversations);
            expect(prisma.conversation.findMany).toHaveBeenCalledWith({
                where: { userId },
                orderBy: { updatedAt: 'desc' },
            });
        });
    });

    describe('getHistory', () => {
        it('should return conversation history', async () => {
            const userId = 'user-1';
            const conversationId = 'conv-1';
            const mockConversation = {
                id: conversationId,
                userId,
            };
            const mockMessages = [
                {
                    id: 'msg-1',
                    conversationId,
                    role: 'user',
                    content: 'Hello',
                    createdAt: new Date(),
                },
                {
                    id: 'msg-2',
                    conversationId,
                    role: 'assistant',
                    content: 'Hi there!',
                    createdAt: new Date(),
                },
            ];

            prisma.conversation.findUnique.mockResolvedValue(mockConversation as any);
            prisma.message.findMany.mockResolvedValue(mockMessages as any);

            const result = await service.getHistory(userId, conversationId);

            expect(result).toEqual(mockMessages);
            expect(prisma.message.findMany).toHaveBeenCalledWith({
                where: { conversationId },
                orderBy: { createdAt: 'asc' },
            });
        });

        it('should throw NotFoundException if conversation not found', async () => {
            const userId = 'user-1';
            const conversationId = 'nonexistent';

            prisma.conversation.findUnique.mockResolvedValue(null);

            await expect(service.getHistory(userId, conversationId)).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if user does not own conversation', async () => {
            const userId = 'user-1';
            const conversationId = 'conv-1';
            const mockConversation = {
                id: conversationId,
                userId: 'other-user',
            };

            prisma.conversation.findUnique.mockResolvedValue(mockConversation as any);

            await expect(service.getHistory(userId, conversationId)).rejects.toThrow(BadRequestException);
        });
    });

    describe('forgetConversation', () => {
        it('should delete conversation messages and memories', async () => {
            const userId = 'user-1';
            const conversationId = 'conv-1';
            const mockConversation = {
                id: conversationId,
                userId,
            };

            prisma.conversation.findUnique.mockResolvedValue(mockConversation as any);
            prisma.message.deleteMany.mockResolvedValue({ count: 5 } as any);
            memoryService.forgetAll.mockResolvedValue(undefined);

            const result = await service.forgetConversation(userId, conversationId);

            expect(result).toEqual({ success: true, message: expect.any(String) });
            expect(prisma.message.deleteMany).toHaveBeenCalledWith({
                where: { conversationId },
            });
            expect(memoryService.forgetAll).toHaveBeenCalledWith(userId, conversationId);
        });
    });

    describe('checkQuota', () => {
        it('should return quota status', async () => {
            const userId = 'user-1';
            const mockQuota = {
                hasQuota: true,
                remaining: 50,
                limit: 100,
                used: 50,
            };

            quotaService.checkQuota.mockResolvedValue(mockQuota as any);

            const result = await service.checkQuota(userId);

            expect(result).toEqual(mockQuota);
            expect(quotaService.checkQuota).toHaveBeenCalledWith(userId);
        });
    });
});
