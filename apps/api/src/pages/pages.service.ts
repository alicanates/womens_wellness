import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreatePageDto {
    slug: string;
    titleTr: string;
    titleEn?: string;
    contentTr: string;
    contentEn?: string;
    isActive?: boolean;
    sortOrder?: number;
}

export interface UpdatePageDto {
    slug?: string;
    titleTr?: string;
    titleEn?: string;
    contentTr?: string;
    contentEn?: string;
    isActive?: boolean;
    sortOrder?: number;
}

@Injectable()
export class PagesService {
    constructor(private prisma: PrismaService) { }

    async findAll(isActive?: boolean) {
        return this.prisma.page.findMany({
            where: isActive !== undefined ? { isActive } : undefined,
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
    }

    async findBySlug(slug: string) {
        const page = await this.prisma.page.findUnique({
            where: { slug },
        });

        if (!page) {
            throw new NotFoundException(`Page with slug "${slug}" not found`);
        }

        return page;
    }

    async findById(id: string) {
        const page = await this.prisma.page.findUnique({
            where: { id },
        });

        if (!page) {
            throw new NotFoundException(`Page with id "${id}" not found`);
        }

        return page;
    }

    async create(data: CreatePageDto) {
        return this.prisma.page.create({
            data: {
                slug: data.slug,
                titleTr: data.titleTr,
                titleEn: data.titleEn,
                contentTr: data.contentTr,
                contentEn: data.contentEn,
                isActive: data.isActive ?? true,
                sortOrder: data.sortOrder ?? 0,
            },
        });
    }

    async update(id: string, data: UpdatePageDto) {
        await this.findById(id); // Check if exists

        return this.prisma.page.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        await this.findById(id); // Check if exists

        return this.prisma.page.delete({
            where: { id },
        });
    }
}
