import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSegmentationController } from './user-segmentation.controller';
import { UserSegmentationService } from './user-segmentation.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController, UserSegmentationController],
  providers: [UsersService, UserSegmentationService],
  exports: [UsersService],
})
export class UsersModule { }
