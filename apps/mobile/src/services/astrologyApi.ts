import { api } from './api';

export interface BirthChartRequest {
    birthDate: string; // ISO date string
    birthTime: string; // HH:MM format
    city: string; // City name (e.g., "Istanbul", "Adiyaman")
}

export interface BirthChartResponse {
    sunSign: string;
    risingSign: string;
    moonSign: string;
    sunDegree: number;
    risingDegree: number;
    moonDegree: number;
}

export const astrologyApi = {
    calculateBirthChart: async (data: BirthChartRequest): Promise<BirthChartResponse> => {
        const response = await api.post<BirthChartResponse>('/astrology/birth-chart', data);
        return response;
    },

    getSunSign: async (birthDate: string): Promise<{ sunSign: string }> => {
        const response = await api.post<{ sunSign: string }>('/astrology/sun-sign', { birthDate });
        return response;
    },
};
