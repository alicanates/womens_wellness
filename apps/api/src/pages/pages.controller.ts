import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { PagesService, CreatePageDto, UpdatePageDto } from './pages.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('pages')
export class PagesController {
    constructor(private readonly pagesService: PagesService) { }

    // Public endpoint - Get all active pages
    @Get()
    async findAll(@Query('isActive') isActive?: string) {
        const isActiveFilter = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
        return this.pagesService.findAll(isActiveFilter);
    }

    // Public endpoint - Get page by slug
    @Get('slug/:slug')
    async findBySlug(@Param('slug') slug: string) {
        return this.pagesService.findBySlug(slug);
    }

    // Admin endpoints
    // TODO: Add proper authentication in production
    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.pagesService.findById(id);
    }

    @Post()
    async create(@Body() data: CreatePageDto) {
        return this.pagesService.create(data);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() data: UpdatePageDto) {
        return this.pagesService.update(id, data);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.pagesService.delete(id);
    }
}
