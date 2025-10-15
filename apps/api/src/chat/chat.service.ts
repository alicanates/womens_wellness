import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModelSelectorService } from './model-selector.service';
import { ContextBuilderService } from './context-builder.service';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly modelSelector: ModelSelectorService,
    private readonly contextBuilder: ContextBuilderService,
  ) { }

  async getOrCreateConversation(userId: string, conversationId?: string) {
    if (conversationId) {
      const conversation = await this.prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId,
        },
      });
      if (conversation) return conversation;
    }

    // Create new conversation
    return this.prisma.conversation.create({
      data: {
        userId,
        title: 'Yeni Sohbet',
      },
    });
  }

  async saveMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'tool',
    content: string,
    tokens?: number,
  ) {
    return this.prisma.message.create({
      data: {
        conversationId,
        role,
        content,
        tokens,
      },
    });
  }

  async getConversationHistory(conversationId: string, limit = 20) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        role: true,
        content: true,
        createdAt: true,
      },
    });
  }

  async streamResponse(userId: string, conversationId: string, userMessage: string) {
    // Build user context with health data
    const userContext = await this.contextBuilder.buildUserContext(userId);
    const systemPrompt = this.contextBuilder.buildSystemPrompt(userContext);

    // Get conversation history
    const history = await this.getConversationHistory(conversationId, 10);

    // Build messages array (reverse to get chronological order)
    // Filter out any 'tool' role messages and only include user/assistant
    const messages = [
      ...history.reverse()
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
      { role: 'user' as const, content: userMessage },
    ];

    // Use Gemini Flash model (latest stable version)
    const model = google('gemini-2.0-flash');

    // Stream the response with system prompt as separate parameter
    const result = streamText({
      model,
      system: systemPrompt,
      messages,
      temperature: 0.8,
    });

    return result;
  }

  private getModel(provider: string, modelName: string) {
    switch (provider) {
      case 'openai':
        return openai(modelName);

      case 'anthropic':
        return anthropic(modelName);

      case 'google':
        return google(modelName);

      default:
        // Fallback to OpenAI
        return openai('gpt-4o-mini');
    }
  }

  async getUserConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: {
        userId,
        archivedAt: null,
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async deleteConversation(userId: string, conversationId: string) {
    // Soft delete by archiving
    return this.prisma.conversation.update({
      where: {
        id: conversationId,
        userId,
      },
      data: {
        archivedAt: new Date(),
      },
    });
  }

  async forgetConversation(userId: string, conversationId: string) {
    // Verify ownership
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId,
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Delete all messages in this conversation
    await this.prisma.message.deleteMany({
      where: { conversationId },
    });

    // Delete conversation-scoped memory
    await this.prisma.memory.deleteMany({
      where: {
        userId,
        scope: 'conversation',
        key: { startsWith: `conv:${conversationId}:` },
      },
    });

    return { deleted: true };
  }
}
