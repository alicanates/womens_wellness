import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ModelSelectorService } from './model-selector.service';
import { ContextBuilderService } from './context-builder.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MemoryModule } from '../memory/memory.module';
import { QuotaModule } from '../quota/quota.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { AIProviderModule } from '../ai-provider/ai-provider.module';
import { ModelPolicyModule } from '../model-policy/model-policy.module';

@Module({
  imports: [PrismaModule, MemoryModule, QuotaModule, SubscriptionModule, AIProviderModule, ModelPolicyModule],
  controllers: [ChatController],
  providers: [ChatService, ModelSelectorService, ContextBuilderService],
  exports: [ChatService],
})
export class ChatModule { }
