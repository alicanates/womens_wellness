import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReminderSchedulerService } from './scheduler.service';

export interface CreateReminderDto {
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  title: string;
  message: string;
  time: string; // HH:mm format
  days?: number[]; // 0-6 for WEEKLY, 1-31 for MONTHLY
  customCron?: string; // for CUSTOM type
  active?: boolean;
}

export interface UpdateReminderDto {
  title?: string;
  message?: string;
  time?: string;
  days?: number[];
  customCron?: string;
  active?: boolean;
}

@Injectable()
export class RemindersService {
  constructor(
    private prisma: PrismaService,
    private scheduler: ReminderSchedulerService,
  ) {}

  async createReminder(userId: string, data: CreateReminderDto) {
    const payloadJson = {
      title: data.title,
      message: data.message,
      time: data.time,
      days: data.days,
      customCron: data.customCron,
    } as any;

    const nextRunAt = this.scheduler.calculateNextRun(
      data.type,
      data.time,
      data.days,
      data.customCron,
    );

    const reminder = await this.prisma.reminder.create({
      data: {
        userId,
        type: data.type,
        payloadJson,
        nextRunAt,
        active: data.active ?? true,
      },
    });

    // Schedule the job
    if (reminder.active) {
      await this.scheduler.scheduleReminder(reminder);
    }

    return reminder;
  }

  async getReminders(userId: string) {
    return this.prisma.reminder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReminder(userId: string, id: string) {
    const reminder = await this.prisma.reminder.findFirst({
      where: { id, userId },
    });

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    return reminder;
  }

  async updateReminder(userId: string, id: string, data: UpdateReminderDto) {
    const reminder = await this.getReminder(userId, id);

    const payloadJson = {
      ...(reminder.payloadJson as any),
      ...(data.title && { title: data.title }),
      ...(data.message && { message: data.message }),
      ...(data.time && { time: data.time }),
      ...(data.days && { days: data.days }),
      ...(data.customCron && { customCron: data.customCron }),
    };

    const nextRunAt =
      data.time || data.days || data.customCron
        ? this.scheduler.calculateNextRun(
            reminder.type,
            (payloadJson as any).time,
            (payloadJson as any).days,
            (payloadJson as any).customCron,
          )
        : reminder.nextRunAt;

    const updated = await this.prisma.reminder.update({
      where: { id },
      data: {
        payloadJson,
        nextRunAt,
        ...(data.active !== undefined && { active: data.active }),
      },
    });

    // Update scheduled job
    await this.scheduler.cancelReminder(id);
    if (updated.active) {
      await this.scheduler.scheduleReminder(updated);
    }

    return updated;
  }

  async deleteReminder(userId: string, id: string) {
    const reminder = await this.getReminder(userId, id);

    await this.scheduler.cancelReminder(id);
    await this.prisma.reminder.delete({ where: { id } });

    return { success: true };
  }

  async toggleReminder(userId: string, id: string, active: boolean) {
    const reminder = await this.getReminder(userId, id);

    const updated = await this.prisma.reminder.update({
      where: { id },
      data: { active },
    });

    if (active) {
      await this.scheduler.scheduleReminder(updated);
    } else {
      await this.scheduler.cancelReminder(id);
    }

    return updated;
  }
}
