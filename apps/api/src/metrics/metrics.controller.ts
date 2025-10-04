import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MetricsService } from './metrics.service';
import { CalculatorService } from './calculator.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class CalculateBMIDto {
  heightCm!: number;
  weightKg!: number;
  measuredAt?: string;
}

class CalculateBMRDto {
  heightCm!: number;
  weightKg!: number;
  ageYears!: number;
  sex!: 'male' | 'female';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

class CalculateWaterDto {
  weightKg!: number;
  activity?: 'sedentary' | 'moderate' | 'active';
  climate?: 'cool' | 'temperate' | 'hot';
}

@ApiTags('metrics')
@Controller('metrics')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class MetricsController {
  constructor(
    private readonly metricsService: MetricsService,
    private readonly calculatorService: CalculatorService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user health metrics history' })
  async getMetrics(@CurrentUser() user: any) {
    return this.metricsService.getUserMetrics(user.id);
  }

  @Post('bmi')
  @ApiOperation({ summary: 'Calculate and save BMI' })
  async calculateBMI(@CurrentUser() user: any, @Body() dto: CalculateBMIDto) {
    const result = this.calculatorService.calculateBMI(
      dto.weightKg,
      dto.heightCm,
    );

    const metric = await this.metricsService.saveMetric(user.id, {
      kind: 'BMI',
      valueJson: {
        ...result,
        heightCm: dto.heightCm,
        weightKg: dto.weightKg,
      },
      measuredAt: dto.measuredAt ? new Date(dto.measuredAt) : new Date(),
    });

    return {
      ...result,
      metricId: metric.id,
    };
  }

  @Post('bmr')
  @ApiOperation({ summary: 'Calculate BMR and TDEE' })
  async calculateBMR(@CurrentUser() user: any, @Body() dto: CalculateBMRDto) {
    const bmr = this.calculatorService.calculateBMR(
      dto.weightKg,
      dto.heightCm,
      dto.ageYears,
      dto.sex,
    );

    const tdee = dto.activityLevel
      ? this.calculatorService.calculateTDEE(bmr, dto.activityLevel)
      : null;

    const metric = await this.metricsService.saveMetric(user.id, {
      kind: 'BMR',
      valueJson: {
        bmr: Math.round(bmr),
        tdee,
        heightCm: dto.heightCm,
        weightKg: dto.weightKg,
        ageYears: dto.ageYears,
        sex: dto.sex,
        activityLevel: dto.activityLevel,
      },
    });

    return {
      bmr: Math.round(bmr),
      tdee,
      metricId: metric.id,
    };
  }

  @Post('water/calculate')
  @ApiOperation({ summary: 'Calculate daily water need' })
  async calculateWater(@Body() dto: CalculateWaterDto) {
    const dailyNeed = this.calculatorService.calculateDailyWaterNeed(
      dto.weightKg,
      dto.activity || 'moderate',
      dto.climate || 'temperate',
    );

    return {
      dailyNeedMl: dailyNeed,
      dailyNeedL: Math.round(dailyNeed / 100) / 10,
    };
  }
}
