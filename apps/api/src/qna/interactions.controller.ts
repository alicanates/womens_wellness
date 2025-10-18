import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { QnaService } from './qna.service';

@Controller('qna/users')
@UseGuards(AuthGuard('jwt'))
export class InteractionsController {
    constructor(private readonly qnaService: QnaService) { }

    @Post(':id/follow')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 20, ttl: 3600000 } }) // 20 follows per hour
    async followUser(@Request() req, @Param('id') id: string) {
        if (!id || id.length < 10) {
            throw new BadRequestException('Geçersiz kullanıcı ID');
        }
        await this.qnaService.followUser(id, req.user.id);
        return { success: true };
    }

    @Delete(':id/follow')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 20, ttl: 3600000 } }) // 20 unfollows per hour
    async unfollowUser(@Request() req, @Param('id') id: string) {
        if (!id || id.length < 10) {
            throw new BadRequestException('Geçersiz kullanıcı ID');
        }
        await this.qnaService.unfollowUser(id, req.user.id);
        return { success: true };
    }

    @Get(':id/followers')
    async getUserFollowers(@Param('id') id: string) {
        if (!id || id.length < 10) {
            throw new BadRequestException('Geçersiz kullanıcı ID');
        }
        return this.qnaService.getUserFollowers(id);
    }

    @Get(':id/following')
    async getUserFollowing(@Param('id') id: string) {
        if (!id || id.length < 10) {
            throw new BadRequestException('Geçersiz kullanıcı ID');
        }
        return this.qnaService.getUserFollowing(id);
    }
}
