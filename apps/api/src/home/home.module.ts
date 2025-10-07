import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MetricsModule } from '../metrics/metrics.module';
import { CyclesModule } from '../cycles/cycles.module';
import { WaterModule } from '../water/water.module';
import { PregnancyModule } from '../pregnancy/pregnancy.module';

@Module({
  imports: [PrismaModule, MetricsModule, CyclesModule, WaterModule, PregnancyModule],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule {}
