import { Module } from '@nestjs/common';
import { WellnessController } from './wellness.controller';
import { WellnessService } from './wellness.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WellnessController],
  providers: [WellnessService],
  exports: [WellnessService],
})
export class WellnessModule {}
