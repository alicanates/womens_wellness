import { Module } from '@nestjs/common';
import { AIProviderController } from './ai-provider.controller';
import { AIProviderService } from './ai-provider.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [AIProviderController],
    providers: [AIProviderService],
    exports: [AIProviderService],
})
export class AIProviderModule { }
