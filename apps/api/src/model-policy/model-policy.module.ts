import { Module } from '@nestjs/common';
import { ModelPolicyController } from './model-policy.controller';
import { ModelPolicyService } from './model-policy.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ModelPolicyController],
  providers: [ModelPolicyService],
  exports: [ModelPolicyService],
})
export class ModelPolicyModule {}
