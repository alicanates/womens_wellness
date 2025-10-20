import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModelPolicyService {
  constructor(private prisma: PrismaService) { }

  async findAll(params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }) {
    const { page = 1, limit = 20, sortBy = 'updatedAt', sortOrder = 'desc' } = params || {};
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.modelPolicy.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.modelPolicy.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const policy = await this.prisma.modelPolicy.findUnique({
      where: { id },
    });

    if (!policy) {
      throw new NotFoundException(`ModelPolicy with ID ${id} not found`);
    }

    return policy;
  }

  async findByPlan(plan: 'free' | 'premium') {
    return this.prisma.modelPolicy.findFirst({
      where: { plan },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(data: {
    plan: 'free' | 'premium';
    provider: 'openai' | 'anthropic' | 'google' | 'deepseek';
    modelName: string;
    temperature: number;
    maxTokens: number;
    toolsEnabledJson?: string[];
  }) {
    return this.prisma.modelPolicy.create({
      data: {
        ...data,
        toolsEnabledJson: data.toolsEnabledJson || [],
      },
    });
  }

  async update(
    id: string,
    data: {
      plan?: 'free' | 'premium';
      provider?: 'openai' | 'anthropic' | 'google' | 'deepseek';
      modelName?: string;
      temperature?: number;
      maxTokens?: number;
      toolsEnabledJson?: string[];
    },
  ) {
    const policy = await this.findOne(id);

    return this.prisma.modelPolicy.update({
      where: { id: policy.id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string) {
    const policy = await this.findOne(id);

    return this.prisma.modelPolicy.delete({
      where: { id: policy.id },
    });
  }
}
