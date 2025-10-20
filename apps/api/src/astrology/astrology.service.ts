import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

export interface BirthChartInput {
    birthDate: string; // ISO date string
    birthTime: string; // HH:MM format
    city: string; // City name
}

export interface BirthChartResult {
    sunSign: string;
    risingSign: string;
    moonSign: string;
    sunDegree: number;
    risingDegree: number;
    moonDegree: number;
}

@Injectable()
export class AstrologyService {
    private readonly logger = new Logger(AstrologyService.name);

    private readonly zodiacSigns = [
        'aries', 'taurus', 'gemini', 'cancer',
        'leo', 'virgo', 'libra', 'scorpio',
        'sagittarius', 'capricorn', 'aquarius', 'pisces'
    ];

    /**
     * Calculate birth chart using Python microservice (Kerykeion)
     */
    async calculateBirthChart(input: BirthChartInput): Promise<BirthChartResult> {
        try {
            const { birthDate, birthTime, city } = input;

            this.logger.log(`Calculating birth chart for ${birthDate} ${birthTime} in ${city}`);

            // Call Python microservice
            const pythonServiceUrl = process.env.ASTROLOGY_SERVICE_URL || 'http://localhost:5001';

            const response = await axios.post(`${pythonServiceUrl}/calculate-birth-chart`, {
                birthDate,
                birthTime,
                city,
            }, {
                timeout: 10000,
            });

            const result = response.data;

            this.logger.log(`Result: Sun=${result.sunSign}, Rising=${result.risingSign}, Moon=${result.moonSign}`);

            return {
                sunSign: result.sunSign,
                risingSign: result.risingSign,
                moonSign: result.moonSign,
                sunDegree: result.sunDegree || 0,
                risingDegree: result.risingDegree || 0,
                moonDegree: result.moonDegree || 0,
            };
        } catch (error) {
            this.logger.error('Error calculating birth chart:', error);
            this.logger.error('Error details:', error.message);
            this.logger.error('Error stack:', error.stack);

            // Fallback to simple calculation if microservice is down
            this.logger.warn('Falling back to simple sun sign calculation');

            throw new HttpException(
                `Astrology service error: ${error.message}`,
                HttpStatus.SERVICE_UNAVAILABLE,
            );
        }
    }



    /**
     * Simple sun sign calculation (fallback)
     */
    getSimpleSunSign(birthDate: string): string {
        const date = new Date(birthDate);
        const month = date.getMonth() + 1;
        const day = date.getDate();

        if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
        if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
        if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
        if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
        if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
        if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
        if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
        if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
        if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
        if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
        if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
        return 'pisces';
    }
}
