import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RemindersService, CreateReminderDto, UpdateReminderDto } from './reminders.service';
import { PushService } from './push.service';

@Controller('reminders')
@UseGuards(AuthGuard('jwt'))
export class RemindersController {
  constructor(
    private readonly remindersService: RemindersService,
    private readonly pushService: PushService,
  ) { }

  // Admin: Get all reminders (must be before @Get(':id'))
  @Get('admin/all')
  async getAllReminders(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.remindersService.getAllReminders(
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Post()
  async createReminder(
    @Request() req: any,
    @Body() data: CreateReminderDto,
  ) {
    return this.remindersService.createReminder(req.user.id, data);
  }

  @Get()
  async getReminders(@Request() req: any) {
    return this.remindersService.getReminders(req.user.id);
  }

  @Get(':id')
  async getReminder(@Request() req: any, @Param('id') id: string) {
    return this.remindersService.getReminder(req.user.id, id);
  }

  @Patch(':id')
  async updateReminder(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: UpdateReminderDto,
  ) {
    return this.remindersService.updateReminder(req.user.id, id, data);
  }

  @Delete(':id')
  async deleteReminder(@Request() req: any, @Param('id') id: string) {
    return this.remindersService.deleteReminder(req.user.id, id);
  }

  @Patch(':id/toggle')
  async toggleReminder(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: { active: boolean },
  ) {
    return this.remindersService.toggleReminder(req.user.id, id, data.active);
  }

  @Post('push/register')
  async registerPushToken(
    @Request() req: any,
    @Body() data: { pushToken: string },
  ) {
    return this.pushService.registerPushToken(req.user.id, data.pushToken);
  }

  @Post('push/test')
  async testPush(@Request() req: any) {
    return this.pushService.sendPush(req.user.id, {
      to: '',
      title: 'Test Bildirimi',
      body: 'Bu bir test bildirimidir.',
      data: { test: true },
    });
  }
}
