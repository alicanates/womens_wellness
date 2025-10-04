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
import { CyclesService } from './cycles.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

interface PeriodSymptoms {
  flow: 'light' | 'moderate' | 'heavy';
  cramps: 0 | 1 | 2 | 3 | 4 | 5;
  mood: string[];
  physical: string[];
  notes?: string;
}

@Controller('cycles')
@UseGuards(AuthGuard('jwt'))
export class CyclesController {
  constructor(private readonly cyclesService: CyclesService) {}

  @Post()
  async createCycle(
    @CurrentUser() user: any,
    @Body()
    data: {
      startDate: string;
      endDate?: string;
      symptoms?: PeriodSymptoms;
      notes?: string;
    },
  ) {
    return this.cyclesService.createCycle(user.id, data);
  }

  @Get()
  async getCycles(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
  ) {
    return this.cyclesService.getCycles(
      user.id,
      limit ? parseInt(limit) : undefined,
    );
  }

  @Get('stats')
  async getStats(@CurrentUser() user: any) {
    return this.cyclesService.getStats(user.id);
  }

  @Get('prediction')
  async getPrediction(@CurrentUser() user: any) {
    return this.cyclesService.getPrediction(user.id);
  }

  @Get('calendar')
  async getCalendarMonth(
    @CurrentUser() user: any,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.cyclesService.getCalendarMonth(
      user.id,
      parseInt(year),
      parseInt(month),
    );
  }

  @Get(':id')
  async getCycle(@CurrentUser() user: any, @Param('id') id: string) {
    return this.cyclesService.getCycle(user.id, id);
  }

  @Patch(':id')
  async updateCycle(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body()
    data: {
      startDate?: string;
      endDate?: string;
      symptoms?: PeriodSymptoms;
      notes?: string;
    },
  ) {
    return this.cyclesService.updateCycle(user.id, id, data);
  }

  @Delete(':id')
  async deleteCycle(@CurrentUser() user: any, @Param('id') id: string) {
    return this.cyclesService.deleteCycle(user.id, id);
  }

  @Delete()
  async deleteAllCycles(@CurrentUser() user: any) {
    return this.cyclesService.deleteAllCycles(user.id);
  }
}
