import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AstrologyService, BirthChartInput } from './astrology.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';

@Controller('astrology')
@UseGuards(JwtAuthGuard)
export class AstrologyController {
    constructor(private readonly astrologyService: AstrologyService) { }

    @Post('birth-chart')
    async calculateBirthChart(@Body() input: BirthChartInput) {
        return this.astrologyService.calculateBirthChart(input);
    }

    @Post('sun-sign')
    async getSunSign(@Body() body: { birthDate: string }) {
        const sunSign = this.astrologyService.getSimpleSunSign(body.birthDate);
        return { sunSign };
    }
}
