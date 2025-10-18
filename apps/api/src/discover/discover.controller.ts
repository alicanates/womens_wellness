import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    BadRequestException,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DiscoverService } from './discover.service';

@Controller('discover')
@UseGuards(AuthGuard('jwt'))
export class DiscoverController {
    constructor(private readonly discoverService: DiscoverService) { }

    // Get personalized articles for home screen
    @Get('home-feed')
    async getHomeFeed(
        @Request() req,
        @Query('locale') locale: string = 'tr',
        @Query('limit') limit: string = '5',
    ) {
        const parsedLimit = parseInt(limit, 10);

        // Validate limit
        if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
            throw new BadRequestException('Limit must be between 1 and 50');
        }

        // Validate locale
        if (!['tr', 'en'].includes(locale)) {
            throw new BadRequestException('Locale must be "tr" or "en"');
        }

        return this.discoverService.getHomeFeed(
            req.user.id,
            locale,
            parsedLimit,
        );
    }

    // Get all articles with filters
    @Get('articles')
    async getArticles(
        @Request() req,
        @Query('category') category?: string,
        @Query('search') search?: string,
        @Query('locale') locale: string = 'tr',
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
    ) {
        const parsedPage = parseInt(page, 10);
        const parsedLimit = parseInt(limit, 10);

        // Validate pagination
        if (isNaN(parsedPage) || parsedPage < 1) {
            throw new BadRequestException('Page must be a positive number');
        }

        if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
            throw new BadRequestException('Limit must be between 1 and 100');
        }

        // Validate locale
        if (!['tr', 'en'].includes(locale)) {
            throw new BadRequestException('Locale must be "tr" or "en"');
        }

        // Validate search length
        if (search && search.length > 200) {
            throw new BadRequestException('Search query too long (max 200 characters)');
        }

        return this.discoverService.getArticles(
            req.user.id,
            {
                category,
                search,
            },
            locale,
            {
                page: parsedPage,
                limit: parsedLimit,
            },
        );
    }

    // Get single article detail
    @Get('articles/:id')
    async getArticle(
        @Request() req,
        @Param('id') id: string,
        @Query('locale') locale: string = 'tr',
    ) {
        // Validate ID format (CUID)
        if (!id || id.length < 10) {
            throw new BadRequestException('Invalid article ID');
        }

        // Validate locale
        if (!['tr', 'en'].includes(locale)) {
            throw new BadRequestException('Locale must be "tr" or "en"');
        }

        return this.discoverService.getArticle(req.user.id, id, locale);
    }

    // Get saved articles
    @Get('saved')
    async getSavedArticles(
        @Request() req,
        @Query('locale') locale: string = 'tr',
    ) {
        return this.discoverService.getSavedArticles(req.user.id, locale);
    }

    // Save/unsave article
    @Post('articles/:id/save')
    @HttpCode(HttpStatus.OK)
    async toggleSaveArticle(@Request() req, @Param('id') id: string) {
        // Validate ID format
        if (!id || id.length < 10) {
            throw new BadRequestException('Invalid article ID');
        }

        const saved = await this.discoverService.toggleSaveArticle(
            req.user.id,
            id,
        );
        return { saved };
    }

    // Track article view
    @Post('articles/:id/view')
    @HttpCode(HttpStatus.OK)
    async trackView(
        @Request() req,
        @Param('id') id: string,
        @Body() body: { readTimeMs?: number },
    ) {
        // Validate ID format
        if (!id || id.length < 10) {
            throw new BadRequestException('Invalid article ID');
        }

        // Validate readTimeMs if provided
        if (body.readTimeMs !== undefined) {
            if (typeof body.readTimeMs !== 'number' || body.readTimeMs < 0 || body.readTimeMs > 3600000) {
                throw new BadRequestException('Read time must be between 0 and 3600000ms (1 hour)');
            }
        }

        await this.discoverService.trackView(req.user.id, id, body.readTimeMs);
        return { success: true };
    }

    // Track article share
    @Post('articles/:id/share')
    @HttpCode(HttpStatus.OK)
    async trackShare(@Request() req, @Param('id') id: string) {
        // Validate ID format
        if (!id || id.length < 10) {
            throw new BadRequestException('Invalid article ID');
        }

        await this.discoverService.trackShare(req.user.id, id);
        return { success: true };
    }

    // Get user preferences
    @Get('preferences')
    async getPreferences(@Request() req) {
        return this.discoverService.getPreferences(req.user.id);
    }

    // Update user preferences
    @Patch('preferences')
    async updatePreferences(
        @Request() req,
        @Body() body: {
            categoryWeights?: Record<string, number>;
            showPregnancyContent?: boolean;
            showCycleContent?: boolean;
        },
    ) {
        return this.discoverService.updatePreferences(req.user.id, body);
    }

    // Admin: Create article
    @Post('articles')
    async createArticle(@Body() data: any) {
        return this.discoverService['prisma'].educationalArticle.create({
            data,
        });
    }

    // Admin: Update article
    @Patch('articles/:id')
    async updateArticle(@Param('id') id: string, @Body() data: any) {
        return this.discoverService['prisma'].educationalArticle.update({
            where: { id },
            data,
        });
    }

    // Admin: Delete article
    @Post('articles/:id/delete')
    @HttpCode(HttpStatus.OK)
    async deleteArticle(@Param('id') id: string) {
        return this.discoverService['prisma'].educationalArticle.delete({
            where: { id },
        });
    }
}
