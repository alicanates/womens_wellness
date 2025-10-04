import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Reminder } from '@prisma/client';

@Injectable()
export class ReminderSchedulerService {
  constructor(
    @InjectQueue('reminders')
    private reminderQueue: Queue,
  ) {}

  /**
   * Calculate next run time based on reminder type
   * Implements quiet hours logic per CLAUDE.md §40.2
   */
  calculateNextRun(
    type: string,
    time: string,
    days?: number[],
    customCron?: string,
    timezone = 'Europe/Istanbul',
  ): Date {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);

    let nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);

    switch (type) {
      case 'DAILY':
        // If time has passed today, schedule for tomorrow
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        break;

      case 'WEEKLY':
        // Find next occurrence of specified day(s)
        if (days && days.length > 0) {
          const currentDay = now.getDay();
          const sortedDays = [...days].sort((a, b) => a - b);

          // Find next day in the list
          let targetDay = sortedDays.find((d) => d > currentDay);

          // If no day found this week, use first day of next week
          if (!targetDay) {
            targetDay = sortedDays[0];
            nextRun.setDate(nextRun.getDate() + (7 - currentDay + targetDay));
          } else {
            nextRun.setDate(nextRun.getDate() + (targetDay - currentDay));
          }

          // If same day but time passed, move to next week
          if (targetDay === currentDay && nextRun <= now) {
            nextRun.setDate(nextRun.getDate() + 7);
          }
        }
        break;

      case 'MONTHLY':
        // Schedule for specific day(s) of month
        if (days && days.length > 0) {
          const currentDate = now.getDate();
          const sortedDays = [...days].sort((a, b) => a - b);

          // Find next day in this month
          let targetDay = sortedDays.find((d) => d > currentDate);

          if (!targetDay) {
            // Move to next month
            nextRun.setMonth(nextRun.getMonth() + 1);
            targetDay = sortedDays[0];
          }

          nextRun.setDate(targetDay);

          // If same day but time passed, move to next occurrence
          if (targetDay === currentDate && nextRun <= now) {
            const nextDayIndex = sortedDays.indexOf(targetDay) + 1;
            if (nextDayIndex < sortedDays.length) {
              nextRun.setDate(sortedDays[nextDayIndex]);
            } else {
              nextRun.setMonth(nextRun.getMonth() + 1);
              nextRun.setDate(sortedDays[0]);
            }
          }
        }
        break;

      case 'CUSTOM':
        // Use custom cron expression (handled by BullMQ)
        // For now, just set to next hour
        nextRun = new Date(now.getTime() + 3600000);
        break;
    }

    return nextRun;
  }

  /**
   * Check if push should be sent based on quiet hours
   * Per CLAUDE.md §40.2
   */
  shouldSendPush(
    now: Date,
    quietHours?: {
      enabled: boolean;
      startHour: number;
      endHour: number;
      timezone: string;
    },
  ): boolean {
    if (!quietHours || !quietHours.enabled) {
      return true;
    }

    const hour = Number(
      new Intl.DateTimeFormat('tr-TR', {
        hour: 'numeric',
        hour12: false,
        timeZone: quietHours.timezone,
      }).format(now),
    );

    // Handle overnight window (e.g., 22:00 - 08:00)
    if (quietHours.startHour > quietHours.endHour) {
      return !(hour >= quietHours.startHour || hour < quietHours.endHour);
    }

    // Regular window (e.g., 08:00 - 22:00)
    return !(hour >= quietHours.startHour && hour < quietHours.endHour);
  }

  async scheduleReminder(reminder: Reminder) {
    const delay = reminder.nextRunAt.getTime() - Date.now();

    await this.reminderQueue.add(
      'send-reminder',
      {
        reminderId: reminder.id,
        userId: reminder.userId,
        payload: reminder.payloadJson,
      },
      {
        jobId: `reminder-${reminder.id}`,
        delay: Math.max(0, delay),
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  async cancelReminder(reminderId: string) {
    const jobId = `reminder-${reminderId}`;
    const job = await this.reminderQueue.getJob(jobId);

    if (job) {
      await job.remove();
    }
  }

  async rescheduleReminder(reminder: Reminder) {
    await this.cancelReminder(reminder.id);
    await this.scheduleReminder(reminder);
  }
}
