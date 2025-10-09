import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WellnessService, StepsData, MeditationData, SleepData } from './wellness.service';

@Controller('wellness/v1')
@UseGuards(AuthGuard('jwt'))
export class WellnessController {
  constructor(private readonly wellnessService: WellnessService) {}

  // ────────────────────────────────────────────────────────────────────────
  // Steps Endpoints
  // ────────────────────────────────────────────────────────────────────────

  @Get('steps')
  async getSteps(
    @Request() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    return this.wellnessService.getSteps(req.user.id, fromDate, toDate);
  }

  @Get('steps/today')
  async getTodaySteps(@Request() req) {
    return this.wellnessService.getTodaySteps(req.user.id);
  }

  @Post('steps')
  async logSteps(@Request() req, @Body() data: StepsData) {
    return this.wellnessService.logSteps(req.user.id, data);
  }

  @Delete('steps/:date')
  async deleteSteps(@Request() req, @Param('date') date: string) {
    return this.wellnessService.deleteSteps(req.user.id, date);
  }

  // ────────────────────────────────────────────────────────────────────────
  // Meditation Endpoints
  // ────────────────────────────────────────────────────────────────────────

  @Get('meditation')
  async getMeditation(
    @Request() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    return this.wellnessService.getMeditation(req.user.id, fromDate, toDate);
  }

  @Get('meditation/today')
  async getTodayMeditation(@Request() req) {
    return this.wellnessService.getTodayMeditation(req.user.id);
  }

  @Post('meditation')
  async logMeditation(@Request() req, @Body() data: MeditationData) {
    return this.wellnessService.logMeditation(req.user.id, data);
  }

  @Delete('meditation/:sessionId')
  async deleteMeditation(@Request() req, @Param('sessionId') sessionId: string) {
    return this.wellnessService.deleteMeditation(req.user.id, sessionId);
  }

  // ────────────────────────────────────────────────────────────────────────
  // Sleep Endpoints
  // ────────────────────────────────────────────────────────────────────────

  @Get('sleep')
  async getSleep(
    @Request() req,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    return this.wellnessService.getSleep(req.user.id, fromDate, toDate);
  }

  @Get('sleep/last-night')
  async getLastNightSleep(@Request() req) {
    return this.wellnessService.getLastNightSleep(req.user.id);
  }

  @Post('sleep')
  async logSleep(@Request() req, @Body() data: SleepData) {
    return this.wellnessService.logSleep(req.user.id, data);
  }

  @Delete('sleep/:date')
  async deleteSleep(@Request() req, @Param('date') date: string) {
    return this.wellnessService.deleteSleep(req.user.id, date);
  }

  // ────────────────────────────────────────────────────────────────────────
  // Preferences Endpoints
  // ────────────────────────────────────────────────────────────────────────

  @Get('preferences')
  async getPreferences(@Request() req) {
    return this.wellnessService.getPreferences(req.user.id);
  }

  @Post('preferences')
  async updatePreferences(@Request() req, @Body() data: any) {
    return this.wellnessService.updatePreferences(req.user.id, data);
  }

  // ────────────────────────────────────────────────────────────────────────
  // Summary Endpoint (for Home Screen)
  // ────────────────────────────────────────────────────────────────────────

  @Get('summary')
  async getWellnessSummary(@Request() req) {
    return this.wellnessService.getWellnessSummary(req.user.id);
  }
}
