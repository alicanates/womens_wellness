import { Module } from '@nestjs/common';
import { QuotaService } from './quota.service';
import { QuotaController, QuotasController } from './quota.controller';
import { QuotaGuard } from './quota.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuotaController, QuotasController],
  providers: [QuotaService, QuotaGuard],
  exports: [QuotaService, QuotaGuard],
})
export class QuotaModule {}
