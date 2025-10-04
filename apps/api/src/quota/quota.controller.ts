import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { QuotaService } from './quota.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('quota')
@UseGuards(AuthGuard('jwt'))
export class QuotaController {
  constructor(private readonly quotaService: QuotaService) {}

  @Get()
  async getQuota(@CurrentUser() user: any) {
    const status = await this.quotaService.getStatus(user.id);
    return status;
  }
}

// Admin endpoint for listing all quotas
@Controller('quotas')
@UseGuards(AuthGuard('jwt'))
export class QuotasController {
  constructor(private readonly quotaService: QuotaService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.quotaService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
