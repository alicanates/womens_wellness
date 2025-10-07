import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HomeService } from './home.service';

@Controller('home')
@UseGuards(AuthGuard('jwt'))
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('snapshot')
  async getHomeSnapshot(
    @Request() req,
    @Query('locale') locale: string = 'tr',
  ) {
    return this.homeService.getHomeSnapshot(req.user.id, locale);
  }

  @Post('cards/dismiss')
  async dismissCard(
    @Request() req,
    @Body() body: { cardId: string; days?: number },
  ) {
    await this.homeService.dismissCard(req.user.id, body.cardId, body.days || 7);
    return { success: true };
  }

  @Post('cards/pin')
  async pinCard(@Request() req, @Body() body: { cardId: string }) {
    await this.homeService.pinCard(req.user.id, body.cardId);
    return { success: true };
  }

  @Post('cards/unpin')
  async unpinCard(@Request() req, @Body() body: { cardId: string }) {
    await this.homeService.unpinCard(req.user.id, body.cardId);
    return { success: true };
  }

  @Post('pills/set-visible')
  async setVisiblePills(
    @Request() req,
    @Body() body: { pillIds: string[] },
  ) {
    await this.homeService.setVisiblePills(req.user.id, body.pillIds);
    return { success: true };
  }
}
