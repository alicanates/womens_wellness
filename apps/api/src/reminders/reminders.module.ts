import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { ReminderSchedulerService } from './scheduler.service';
import { PushService } from './push.service';
import { RemindersProcessor } from './reminders.processor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'reminders',
    }),
  ],
  controllers: [RemindersController],
  providers: [
    RemindersService,
    ReminderSchedulerService,
    PushService,
    RemindersProcessor,
  ],
  exports: [RemindersService],
})
export class RemindersModule {}
