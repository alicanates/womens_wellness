import { Module } from '@nestjs/common';
import { DiscoverController } from './discover.controller';
import { DiscoverService } from './discover.service';
import { RecommendationEngine } from './recommendation-engine.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CyclesModule } from '../cycles/cycles.module';
import { PregnancyModule } from '../pregnancy/pregnancy.module';

@Module({
    imports: [PrismaModule, CyclesModule, PregnancyModule],
    controllers: [DiscoverController],
    providers: [DiscoverService, RecommendationEngine],
    exports: [DiscoverService],
})
export class DiscoverModule { }
