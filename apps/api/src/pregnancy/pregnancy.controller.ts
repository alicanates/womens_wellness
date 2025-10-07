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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PregnancyService } from './pregnancy.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('pregnancy')
@UseGuards(AuthGuard('jwt'))
export class PregnancyController {
  constructor(private readonly pregnancyService: PregnancyService) {}

  // ─────────────────────────────────────────────────────────────
  // Pregnancy Profile
  // ─────────────────────────────────────────────────────────────

  @Post()
  async createOrUpdatePregnancy(
    @CurrentUser() user: any,
    @Body()
    data: {
      lmpDate?: string;
      dueDate?: string;
      doctorNotes?: string;
      isActive?: boolean;
      anonymousMode?: boolean;
    },
  ) {
    return this.pregnancyService.createOrUpdatePregnancy(user.id, data);
  }

  @Get()
  async getPregnancy(@CurrentUser() user: any) {
    return this.pregnancyService.getPregnancy(user.id);
  }

  @Get('summary')
  async getPregnancySummary(@CurrentUser() user: any) {
    return this.pregnancyService.getPregnancySummary(user.id);
  }

  @Delete()
  async deletePregnancy(@CurrentUser() user: any) {
    return this.pregnancyService.deletePregnancy(user.id);
  }

  // ─────────────────────────────────────────────────────────────
  // Kick Counter
  // ─────────────────────────────────────────────────────────────

  @Post('kicks')
  async logKickCount(
    @CurrentUser() user: any,
    @Body()
    data: {
      sessionDate: string;
      kickCount: number;
      durationMin: number;
      notes?: string;
    },
  ) {
    return this.pregnancyService.logKickCount(user.id, data);
  }

  @Get('kicks')
  async getKickCounts(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
  ) {
    return this.pregnancyService.getKickCounts(
      user.id,
      limit ? parseInt(limit) : undefined,
    );
  }

  @Delete('kicks/:id')
  async deleteKickCount(@CurrentUser() user: any, @Param('id') id: string) {
    return this.pregnancyService.deleteKickCount(user.id, id);
  }

  // ─────────────────────────────────────────────────────────────
  // Contraction Timer
  // ─────────────────────────────────────────────────────────────

  @Post('contractions')
  async logContraction(
    @CurrentUser() user: any,
    @Body()
    data: {
      startTime: string;
      endTime: string;
      durationSec: number;
      intensity?: number;
      notes?: string;
    },
  ) {
    return this.pregnancyService.logContraction(user.id, data);
  }

  @Get('contractions')
  async getContractions(
    @CurrentUser() user: any,
    @Query('hours') hours?: string,
  ) {
    return this.pregnancyService.getContractions(
      user.id,
      hours ? parseInt(hours) : undefined,
    );
  }

  @Get('contractions/summary')
  async getContractionsSummary(@CurrentUser() user: any) {
    return this.pregnancyService.getContractionsSummary(user.id);
  }

  @Delete('contractions/:id')
  async deleteContraction(@CurrentUser() user: any, @Param('id') id: string) {
    return this.pregnancyService.deleteContraction(user.id, id);
  }

  @Delete('contractions')
  async deleteAllContractions(@CurrentUser() user: any) {
    return this.pregnancyService.deleteAllContractions(user.id);
  }

  // ─────────────────────────────────────────────────────────────
  // Appointments
  // ─────────────────────────────────────────────────────────────

  @Post('appointments')
  async createAppointment(
    @CurrentUser() user: any,
    @Body()
    data: {
      appointmentAt: string;
      clinic?: string;
      doctorName?: string;
      notes?: string;
      vitals?: {
        bloodPressure?: string;
        weight?: number;
        glucose?: number;
        [key: string]: any;
      };
    },
  ) {
    return this.pregnancyService.createAppointment(user.id, data);
  }

  @Get('appointments')
  async getAppointments(@CurrentUser() user: any) {
    return this.pregnancyService.getAppointments(user.id);
  }

  @Get('appointments/:id')
  async getAppointment(@CurrentUser() user: any, @Param('id') id: string) {
    return this.pregnancyService.getAppointment(user.id, id);
  }

  @Patch('appointments/:id')
  async updateAppointment(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body()
    data: {
      appointmentAt?: string;
      clinic?: string;
      doctorName?: string;
      notes?: string;
      vitals?: any;
    },
  ) {
    return this.pregnancyService.updateAppointment(user.id, id, data);
  }

  @Delete('appointments/:id')
  async deleteAppointment(@CurrentUser() user: any, @Param('id') id: string) {
    return this.pregnancyService.deleteAppointment(user.id, id);
  }

  // ─────────────────────────────────────────────────────────────
  // Medications
  // ─────────────────────────────────────────────────────────────

  @Post('medications')
  async addMedication(
    @CurrentUser() user: any,
    @Body()
    data: {
      name: string;
      dosage?: string;
      frequency?: string;
      safetyRating?: string;
      notes?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    return this.pregnancyService.addMedication(user.id, data);
  }

  @Get('medications')
  async getMedications(@CurrentUser() user: any) {
    return this.pregnancyService.getMedications(user.id);
  }

  @Patch('medications/:id')
  async updateMedication(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.pregnancyService.updateMedication(user.id, id, data);
  }

  @Delete('medications/:id')
  async deleteMedication(@CurrentUser() user: any, @Param('id') id: string) {
    return this.pregnancyService.deleteMedication(user.id, id);
  }

  // ─────────────────────────────────────────────────────────────
  // Birth Plan
  // ─────────────────────────────────────────────────────────────

  @Post('birth-plan')
  async createOrUpdateBirthPlan(
    @CurrentUser() user: any,
    @Body() data: { content: any },
  ) {
    return this.pregnancyService.createOrUpdateBirthPlan(user.id, data.content);
  }

  @Get('birth-plan')
  async getBirthPlan(@CurrentUser() user: any) {
    return this.pregnancyService.getBirthPlan(user.id);
  }

  @Delete('birth-plan')
  async deleteBirthPlan(@CurrentUser() user: any) {
    return this.pregnancyService.deleteBirthPlan(user.id);
  }

  // ─────────────────────────────────────────────────────────────
  // Hospital Bag Checklist
  // ─────────────────────────────────────────────────────────────

  @Post('hospital-bag')
  async addHospitalBagItem(
    @CurrentUser() user: any,
    @Body()
    data: {
      category: string;
      itemName: string;
      sortOrder?: number;
    },
  ) {
    return this.pregnancyService.addHospitalBagItem(user.id, data);
  }

  @Get('hospital-bag')
  async getHospitalBagItems(@CurrentUser() user: any) {
    return this.pregnancyService.getHospitalBagItems(user.id);
  }

  @Patch('hospital-bag/:id')
  async updateHospitalBagItem(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: { isPacked?: boolean; itemName?: string; sortOrder?: number },
  ) {
    return this.pregnancyService.updateHospitalBagItem(user.id, id, data);
  }

  @Delete('hospital-bag/:id')
  async deleteHospitalBagItem(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.pregnancyService.deleteHospitalBagItem(user.id, id);
  }

  // ─────────────────────────────────────────────────────────────
  // Notes
  // ─────────────────────────────────────────────────────────────

  @Post('notes')
  async createNote(
    @CurrentUser() user: any,
    @Body()
    data: {
      title?: string;
      content: string;
      tags?: string[];
    },
  ) {
    return this.pregnancyService.createNote(user.id, data);
  }

  @Get('notes')
  async getNotes(@CurrentUser() user: any) {
    return this.pregnancyService.getNotes(user.id);
  }

  @Get('notes/:id')
  async getNote(@CurrentUser() user: any, @Param('id') id: string) {
    return this.pregnancyService.getNote(user.id, id);
  }

  @Patch('notes/:id')
  async updateNote(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() data: { title?: string; content?: string; tags?: string[] },
  ) {
    return this.pregnancyService.updateNote(user.id, id, data);
  }

  @Delete('notes/:id')
  async deleteNote(@CurrentUser() user: any, @Param('id') id: string) {
    return this.pregnancyService.deleteNote(user.id, id);
  }

  // ─────────────────────────────────────────────────────────────
  // Weekly Content
  // ─────────────────────────────────────────────────────────────

  @Get('weekly-content')
  async getWeeklyContent(@CurrentUser() user: any) {
    return this.pregnancyService.getWeeklyContent(user.id);
  }
}
