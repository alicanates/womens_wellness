import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: { connected: boolean; latency?: number };
    redis?: { connected: boolean; memory?: number };
    storage?: { accessible: boolean; space?: number };
    ai?: { provider: string; available: boolean };
  };
  version: string;
  uptime: number;
}

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Wellness API v1.0 - Women\'s Wellness Companion';
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const startTime = Date.now();

    // Check database
    let dbConnected = false;
    let dbLatency = 0;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
      dbLatency = Date.now() - startTime;
    } catch (error) {
      // Database connection failed
    }

    return {
      status: dbConnected ? 'healthy' : 'unhealthy',
      services: {
        database: {
          connected: dbConnected,
          latency: dbLatency,
        },
      },
      version: '1.0.0',
      uptime: process.uptime(),
    };
  }
}
