import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeatureFlagService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: { page?: number; limit?: number }) {
    const { page = 1, limit = 100 } = params || {};
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.featureFlag.findMany({
        skip,
        take: limit,
        orderBy: { key: 'asc' },
      }),
      this.prisma.featureFlag.count(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(key: string) {
    const flag = await this.prisma.featureFlag.findUnique({
      where: { key },
    });

    if (!flag) {
      throw new NotFoundException(`FeatureFlag with key ${key} not found`);
    }

    return flag;
  }

  async findByKey(key: string) {
    return this.prisma.featureFlag.findUnique({
      where: { key },
    });
  }

  async isEnabled(key: string): Promise<boolean> {
    const flag = await this.findByKey(key);
    if (!flag) return false;

    // Handle boolean flags
    if (typeof flag.valueJson === 'boolean') {
      return flag.valueJson;
    }

    return false;
  }

  async getValue<T = any>(key: string, defaultValue?: T): Promise<T> {
    const flag = await this.findByKey(key);
    if (!flag) return defaultValue as T;
    return flag.valueJson as T;
  }

  async create(data: { key: string; valueJson: any }) {
    return this.prisma.featureFlag.create({
      data,
    });
  }

  async update(key: string, data: { valueJson: any }) {
    const flag = await this.findOne(key);

    return this.prisma.featureFlag.update({
      where: { key: flag.key },
      data,
    });
  }

  async delete(key: string) {
    const flag = await this.findOne(key);

    return this.prisma.featureFlag.delete({
      where: { key: flag.key },
    });
  }
}
