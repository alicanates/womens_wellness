import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async findAll(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    entity?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const {
      page = 1,
      limit = 50,
      userId,
      action,
      entity,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params || {};
    const skip = (page - 1) * limit;

    const where: any = {};
    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entity) where.entity = entity;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    return this.prisma.auditLog.findUnique({
      where: { id },
    });
  }

  async log(data: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    metadataJson?: any;
  }) {
    return this.prisma.auditLog.create({
      data: {
        ...data,
        metadataJson: data.metadataJson || {},
      },
    });
  }

  async logCreate(userId: string, entity: string, entityId: string, metadata?: any) {
    return this.log({
      userId,
      action: AuditAction.CREATE,
      entity,
      entityId,
      metadataJson: metadata,
    });
  }

  async logUpdate(userId: string, entity: string, entityId: string, metadata?: any) {
    return this.log({
      userId,
      action: AuditAction.UPDATE,
      entity,
      entityId,
      metadataJson: metadata,
    });
  }

  async logDelete(userId: string, entity: string, entityId: string, metadata?: any) {
    return this.log({
      userId,
      action: AuditAction.DELETE,
      entity,
      entityId,
      metadataJson: metadata,
    });
  }

  async logLogin(userId: string, metadata?: any) {
    return this.log({
      userId,
      action: AuditAction.LOGIN,
      entity: 'auth',
      metadataJson: metadata,
    });
  }

  async logLogout(userId: string, metadata?: any) {
    return this.log({
      userId,
      action: AuditAction.LOGOUT,
      entity: 'auth',
      metadataJson: metadata,
    });
  }
}
