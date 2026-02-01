import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';
import { StepsService } from './steps.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class LogStepsDto {
    @ApiProperty({ example: 1000, description: 'Number of steps' })
    @IsNumber()
    steps!: number;

    @ApiProperty({ required: false, example: '2024-01-01T12:00:00Z' })
    @IsOptional()
    @IsString()
    loggedAt?: string;

    @ApiProperty({ enum: ['manual', 'pedometer'], default: 'manual' })
    @IsEnum(['manual', 'pedometer'])
    @IsOptional()
    source?: 'manual' | 'pedometer';
}

@ApiTags('steps')
@Controller('steps')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class StepsController {
    constructor(private readonly stepsService: StepsService) { }

    @Get()
    @ApiOperation({ summary: 'Get steps logs' })
    async getStepsLogs(
        @CurrentUser() user: any,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.stepsService.getStepsLogs(user.id, { startDate, endDate });
    }

    @Post()
    @ApiOperation({ summary: 'Log steps' })
    async logSteps(@CurrentUser() user: any, @Body() dto: LogStepsDto) {
        return this.stepsService.logSteps(user.id, {
            steps: dto.steps,
            loggedAt: dto.loggedAt ? new Date(dto.loggedAt) : new Date(),
            source: dto.source || 'manual',
        });
    }

    @Get('today')
    @ApiOperation({ summary: "Get today's steps" })
    async getTodayTotal(@CurrentUser() user: any) {
        return this.stepsService.getTodayTotal(user.id);
    }

    @Get('stats')
    @ApiOperation({ summary: 'Get steps statistics' })
    async getStats(
        @CurrentUser() user: any,
        @Query('days') days?: string,
    ) {
        const daysNum = days ? parseInt(days, 10) : 7;
        return this.stepsService.getStats(user.id, daysNum);
    }
}
