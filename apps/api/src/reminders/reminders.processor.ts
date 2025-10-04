import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from './push.service';
import { ReminderSchedulerService } from './scheduler.service';

@Processor('reminders')
export class RemindersProcessor extends WorkerHost {
  private readonly logger = new Logger(RemindersProcessor.name);

  constructor(
    private prisma: PrismaService,
    private pushService: PushService,
    private scheduler: ReminderSchedulerService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { reminderId, userId, payload } = job.data;

    this.logger.log(`Processing reminder ${reminderId} for user ${userId}`);

    try {
      // Get reminder from database
      const reminder = await this.prisma.reminder.findUnique({
        where: { id: reminderId },
      });

      if (!reminder) {
        this.logger.warn(`Reminder ${reminderId} not found`);
        return { status: 'skipped', reason: 'Reminder not found' };
      }

      if (!reminder.active) {
        this.logger.log(`Reminder ${reminderId} is inactive, skipping`);
        return { status: 'skipped', reason: 'Reminder inactive' };
      }

      // Send push notification
      const result = await this.pushService.sendPushWithRetry(
        userId,
        {
          to: '',
          title: payload.title,
          body: payload.message,
          data: {
            reminderId: reminder.id,
            type: reminder.type,
          },
        },
        3, // max retries
      );

      if (result.status === 'ok') {
        this.logger.log(`Push sent successfully: ${result.id}`);

        // Calculate next run and reschedule
        const nextRunAt = this.scheduler.calculateNextRun(
          reminder.type,
          payload.time,
          payload.days,
          payload.customCron,
        );

        await this.prisma.reminder.update({
          where: { id: reminderId },
          data: { nextRunAt },
        });

        // Schedule next occurrence
        const updatedReminder = await this.prisma.reminder.findUnique({
          where: { id: reminderId },
        });

        if (updatedReminder && updatedReminder.active) {
          await this.scheduler.scheduleReminder(updatedReminder);
        }

        return { status: 'success', pushId: result.id };
      } else {
        this.logger.error(
          `Failed to send push for reminder ${reminderId}: ${result.message}`,
        );

        // Still reschedule for next occurrence
        const nextRunAt = this.scheduler.calculateNextRun(
          reminder.type,
          payload.time,
          payload.days,
          payload.customCron,
        );

        await this.prisma.reminder.update({
          where: { id: reminderId },
          data: { nextRunAt },
        });

        const updatedReminder = await this.prisma.reminder.findUnique({
          where: { id: reminderId },
        });

        if (updatedReminder && updatedReminder.active) {
          await this.scheduler.scheduleReminder(updatedReminder);
        }

        return { status: 'failed', error: result.message };
      }
    } catch (error: any) {
      this.logger.error(
        `Error processing reminder ${reminderId}: ${error.message}`,
      );
      throw error; // Let BullMQ handle retry
    }
  }
}
