import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { WaterService } from './water.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class LogWaterDto {
  amountMl!: number;
  loggedAt?: string;
}

@ApiTags('water')
@Controller('water')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class WaterController {
  constructor(private readonly waterService: WaterService) { }

  @Get()
  @ApiOperation({ summary: 'Get water logs' })
  async getWaterLogs(
    @CurrentUser() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.waterService.getWaterLogs(user.id, { startDate, endDate });
  }

  @Post()
  @ApiOperation({ summary: 'Log water intake' })
  async logWater(@CurrentUser() user: any, @Body() dto: LogWaterDto) {
    console.log('[WaterController] Received request:', { userId: user.id, dto });
    console.log('[WaterController] dto.amountMl:', dto.amountMl, 'type:', typeof dto.amountMl);

    return this.waterService.logWater(user.id, {
      amountMl: dto.amountMl,
      loggedAt: dto.loggedAt ? new Date(dto.loggedAt) : new Date(),
    });
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today\'s water intake' })
  async getTodayTotal(@CurrentUser() user: any) {
    return this.waterService.getTodayTotal(user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get water intake statistics' })
  async getStats(
    @CurrentUser() user: any,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days, 10) : 7;
    return this.waterService.getStats(user.id, daysNum);
  }
}
