import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, AIProvider } from '@prisma/client';

export interface CreateAIProviderDto {
    provider: AIProvider;
    apiKey: string;
    modelName: string;
    displayName: string;
    description?: string;
    priority?: number;
}

export interface UpdateAIProviderDto {
    apiKey?: string;
    modelName?: string;
    displayName?: string;
    description?: string;
    isActive?: boolean;
    priority?: number;
}

@Injectable()
export class AIProviderService {
    private readonly logger = new Logger(AIProviderService.name);
    private readonly prisma: any = new PrismaClient();

    async getAll() {
        return this.prisma.aIProviderConfig.findMany({
            orderBy: { priority: 'desc' },
        });
    }

    async getActive() {
        return this.prisma.aIProviderConfig.findMany({
            where: { isActive: true },
            orderBy: { priority: 'desc' },
        });
    }

    async getByProvider(provider: AIProvider) {
        return this.prisma.aIProviderConfig.findUnique({
            where: { provider },
        });
    }

    async getActiveProvider(): Promise<{
        provider: AIProvider;
        apiKey: string;
        modelName: string;
    } | null> {
        const config = await this.prisma.aIProviderConfig.findFirst({
            where: { isActive: true },
            orderBy: { priority: 'desc' },
        });

        if (!config) {
            this.logger.warn('No active AI provider found');
            return null;
        }

        return {
            provider: config.provider,
            apiKey: config.apiKey,
            modelName: config.modelName,
        };
    }

    async create(data: CreateAIProviderDto) {
        return this.prisma.aIProviderConfig.create({
            data: {
                provider: data.provider,
                apiKey: data.apiKey,
                modelName: data.modelName,
                displayName: data.displayName,
                description: data.description,
                priority: data.priority ?? 0,
                isActive: true,
            },
        });
    }

    async update(provider: AIProvider, data: UpdateAIProviderDto) {
        return this.prisma.aIProviderConfig.update({
            where: { provider },
            data,
        });
    }

    async delete(provider: AIProvider) {
        return this.prisma.aIProviderConfig.delete({
            where: { provider },
        });
    }

    async toggleActive(provider: AIProvider) {
        const config = await this.getByProvider(provider);
        if (!config) {
            throw new Error('Provider not found');
        }

        return this.prisma.aIProviderConfig.update({
            where: { provider },
            data: { isActive: !config.isActive },
        });
    }
}
