import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MetricsService } from './metrics.service';
import { CalculatorService } from './calculator.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class CalculateBMIDto {
  @Type(() => Number)
  @IsNumber()
  heightCm!: number;

  @Type(() => Number)
  @IsNumber()
  weightKg!: number;

  @IsOptional()
  @IsString()
  measuredAt?: string;
}

class CalculateBMRDto {
  @Type(() => Number)
  @IsNumber()
  heightCm!: number;

  @Type(() => Number)
  @IsNumber()
  weightKg!: number;

  @Type(() => Number)
  @IsNumber()
  ageYears!: number;

  @IsString()
  sex!: 'male' | 'female';

  @IsOptional()
  @IsString()
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

class CalculateWaterDto {
  @Type(() => Number)
  @IsNumber()
  weightKg!: number;

  @IsOptional()
  @IsString()
  activity?: 'sedentary' | 'moderate' | 'active';

  @IsOptional()
  @IsString()
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
  ) { }

  @Get()
  @ApiOperation({ summary: 'Get user health metrics history' })
  async getMetrics(@CurrentUser() user: any) {
    return this.metricsService.getUserMetrics(user.id);
  }

  @Post('bmi')
  @ApiOperation({ summary: 'Calculate and save BMI' })
  async calculateBMI(@CurrentUser() user: any, @Body() dto: CalculateBMIDto) {
    console.log('BMI Request DTO:', dto);
    console.log('weightKg:', dto.weightKg, 'type:', typeof dto.weightKg);
    console.log('heightCm:', dto.heightCm, 'type:', typeof dto.heightCm);

    const result = this.calculatorService.calculateBMI(
      dto.weightKg,
      dto.heightCm,
    );

    console.log('BMI Calculation Result:', result);

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
      bmi: result.bmi,
      category: result.category,
      heightCm: dto.heightCm,
      weightKg: dto.weightKg,
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
    console.log('Water Request DTO:', dto);
    console.log('weightKg:', dto.weightKg, 'type:', typeof dto.weightKg);
    console.log('activity:', dto.activity);
    console.log('climate:', dto.climate);

    // Ensure weightKg is a number
    const weightKg = typeof dto.weightKg === 'string' ? parseFloat(dto.weightKg) : dto.weightKg;

    const dailyNeed = this.calculatorService.calculateDailyWaterNeed(
      weightKg,
      dto.activity || 'moderate',
      dto.climate || 'temperate',
    );

    console.log('Calculated daily need:', dailyNeed);

    return {
      dailyWaterMl: dailyNeed,
      dailyNeedMl: dailyNeed,
      dailyNeedL: Math.round(dailyNeed / 100) / 10,
    };
  }
}
