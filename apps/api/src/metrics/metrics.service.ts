import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HealthMetricKind } from '@prisma/client';

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserMetrics(userId: string, limit = 50) {
    return this.prisma.healthMetric.findMany({
      where: { userId },
      orderBy: { measuredAt: 'desc' },
      take: limit,
    });
  }

  async saveMetric(
    userId: string,
    data: {
      kind: HealthMetricKind;
      valueJson: any;
      measuredAt?: Date;
    },
  ) {
    return this.prisma.healthMetric.create({
      data: {
        userId,
        kind: data.kind,
        valueJson: data.valueJson,
        measuredAt: data.measuredAt || new Date(),
      },
    });
  }
}
