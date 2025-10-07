import { Module } from '@nestjs/common';
import { PregnancyController } from './pregnancy.controller';
import { PregnancyService } from './pregnancy.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PregnancyController],
  providers: [PregnancyService],
  exports: [PregnancyService],
})
export class PregnancyModule {}
