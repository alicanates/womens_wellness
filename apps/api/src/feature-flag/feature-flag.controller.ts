import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../common/guards/admin.guard';
import { FeatureFlagService } from './feature-flag.service';

@Controller('feature-flags')
@UseGuards(AuthGuard('jwt'))
export class FeatureFlagController {
  constructor(private readonly featureFlagService: FeatureFlagService) { }

  // Public read endpoints (authenticated users only)
  @Get()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.featureFlagService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':key')
  async findOne(@Param('key') key: string) {
    return this.featureFlagService.findOne(key);
  }

  // Admin-only write endpoints
  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() data: { key: string; valueJson: any }) {
    return this.featureFlagService.create(data);
  }

  @Patch(':key')
  @UseGuards(AdminGuard)
  async update(@Param('key') key: string, @Body() data: { valueJson: any }) {
    return this.featureFlagService.update(key, data);
  }

  @Delete(':key')
  @UseGuards(AdminGuard)
  async delete(@Param('key') key: string) {
    return this.featureFlagService.delete(key);
  }
}
