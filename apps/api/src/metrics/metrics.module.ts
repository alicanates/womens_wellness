import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { CalculatorService } from './calculator.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MetricsController],
  providers: [MetricsService, CalculatorService],
  exports: [MetricsService, CalculatorService],
})
export class MetricsModule {}
