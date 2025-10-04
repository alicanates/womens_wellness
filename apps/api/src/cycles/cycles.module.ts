import { Module } from '@nestjs/common';
import { CyclesController } from './cycles.controller';
import { CyclesService } from './cycles.service';
import { PredictionService } from './prediction.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CyclesController],
  providers: [CyclesService, PredictionService],
  exports: [CyclesService, PredictionService],
})
export class CyclesModule {}
