import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminGateway } from './admin.gateway';

@Module({
    imports: [PrismaModule],
    controllers: [AdminController],
    providers: [AdminService, AdminGateway],
    exports: [AdminService],
})
export class AdminModule { }
