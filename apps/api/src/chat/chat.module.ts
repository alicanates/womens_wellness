import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ModelSelectorService } from './model-selector.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MemoryModule } from '../memory/memory.module';
import { QuotaModule } from '../quota/quota.module';

@Module({
  imports: [PrismaModule, MemoryModule, QuotaModule],
  controllers: [ChatController],
  providers: [ChatService, ModelSelectorService],
  exports: [ChatService],
})
export class ChatModule {}
