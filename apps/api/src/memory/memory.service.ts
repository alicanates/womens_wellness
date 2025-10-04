import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemoryScope } from '@prisma/client';

interface MemoryItem {
  key: string;
  value: any;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

@Injectable()
export class MemoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Store a memory item with explicit user consent
   */
  async store(
    userId: string,
    scope: MemoryScope,
    key: string,
    value: any,
    tags: string[] = [],
  ) {
    return this.prisma.memory.upsert({
      where: {
        userId_scope_key: {
          userId,
          scope,
          key,
        },
      },
      update: {
        valueJson: { value, tags },
        updatedAt: new Date(),
      },
      create: {
        userId,
        scope,
        key,
        valueJson: { value, tags },
      },
    });
  }

  /**
   * Retrieve a specific memory item
   */
  async get(userId: string, scope: MemoryScope, key: string) {
    const memory = await this.prisma.memory.findUnique({
      where: {
        userId_scope_key: {
          userId,
          scope,
          key,
        },
      },
    });

    if (!memory) return null;

    const data = memory.valueJson as any;
    return {
      key: memory.key,
      value: data.value,
      tags: data.tags || [],
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt,
    };
  }

  /**
   * Retrieve all memories for a user with optional scope filter
   */
  async getAll(userId: string, scope?: MemoryScope): Promise<MemoryItem[]> {
    const memories = await this.prisma.memory.findMany({
      where: {
        userId,
        ...(scope && { scope }),
      },
      orderBy: { updatedAt: 'desc' },
    });

    return memories.map((m) => {
      const data = m.valueJson as any;
      return {
        key: m.key,
        value: data.value,
        tags: data.tags || [],
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      };
    });
  }

  /**
   * Search memories by tags (for context-aware retrieval)
   */
  async searchByTags(
    userId: string,
    tags: string[],
    scope?: MemoryScope,
    limit = 10,
  ): Promise<MemoryItem[]> {
    const memories = await this.prisma.memory.findMany({
      where: {
        userId,
        ...(scope && { scope }),
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Filter by tags and score by relevance
    const scored = memories
      .map((m) => {
        const data = m.valueJson as any;
        const memTags = data.tags || [];
        const matchCount = memTags.filter((t: string) => tags.includes(t)).length;
        const score = matchCount / Math.max(1, memTags.length);

        return {
          memory: m,
          score,
          data,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored.map((item) => ({
      key: item.memory.key,
      value: item.data.value,
      tags: item.data.tags || [],
      createdAt: item.memory.createdAt,
      updatedAt: item.memory.updatedAt,
    }));
  }

  /**
   * Delete a specific memory
   */
  async delete(userId: string, scope: MemoryScope, key: string) {
    return this.prisma.memory.delete({
      where: {
        userId_scope_key: {
          userId,
          scope,
          key,
        },
      },
    });
  }

  /**
   * Delete all memories for a user (GDPR/KVKK "Forget me")
   */
  async forgetAll(userId: string) {
    return this.prisma.memory.deleteMany({
      where: { userId },
    });
  }

  /**
   * Delete conversation-scoped memories for a specific conversation
   */
  async forgetConversation(userId: string, conversationId: string) {
    return this.prisma.memory.deleteMany({
      where: {
        userId,
        scope: 'conversation',
        key: {
          startsWith: `conv:${conversationId}:`,
        },
      },
    });
  }

  /**
   * Prune old or low-value memories to keep storage lean
   * (Keep top N by last access, or by relevance score)
   */
  async prune(userId: string, scope: MemoryScope, keepCount = 50) {
    const memories = await this.prisma.memory.findMany({
      where: { userId, scope },
      orderBy: { updatedAt: 'desc' },
    });

    if (memories.length <= keepCount) {
      return { pruned: 0 };
    }

    const toDelete = memories.slice(keepCount);
    await this.prisma.memory.deleteMany({
      where: {
        id: {
          in: toDelete.map((m) => m.id),
        },
      },
    });

    return { pruned: toDelete.length };
  }

  /**
   * Build context string for AI from relevant memories
   */
  async buildContext(
    userId: string,
    tags: string[],
    conversationId?: string,
  ): Promise<string> {
    // Get global memories
    const globalMemories = await this.searchByTags(userId, tags, 'global', 5);

    // Get conversation-specific memories if conversationId provided
    let convMemories: MemoryItem[] = [];
    if (conversationId) {
      const allConvMemories = await this.prisma.memory.findMany({
        where: {
          userId,
          scope: 'conversation',
          key: { startsWith: `conv:${conversationId}:` },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      });

      convMemories = allConvMemories.map((m) => {
        const data = m.valueJson as any;
        return {
          key: m.key,
          value: data.value,
          tags: data.tags || [],
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        };
      });
    }

    // Format memories into context string
    const parts: string[] = [];

    if (globalMemories.length > 0) {
      parts.push('Kullanıcı hakkında bilinen bilgiler:');
      globalMemories.forEach((m) => {
        parts.push(`- ${m.key}: ${JSON.stringify(m.value)}`);
      });
    }

    if (convMemories.length > 0) {
      parts.push('\nBu sohbet hakkında notlar:');
      convMemories.forEach((m) => {
        const cleanKey = m.key.replace(`conv:${conversationId}:`, '');
        parts.push(`- ${cleanKey}: ${JSON.stringify(m.value)}`);
      });
    }

    return parts.join('\n');
  }
}
