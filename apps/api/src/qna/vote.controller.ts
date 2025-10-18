import {
    Controller,
    Post,
    Delete,
    Get,
    Body,
    Param,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { VoteService } from './vote.service';
import { VoteDto } from './dto';

@Controller('qna/answers')
@UseGuards(AuthGuard('jwt'))
export class VoteController {
    constructor(private readonly voteService: VoteService) { }

    /**
     * Cevaba oy ver
     * POST /api/qna/answers/:id/vote
     * Requirements: 5.1, 5.2, 5.3
     */
    @Post(':id/vote')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 50, ttl: 3600000 } }) // 50 votes per hour
    async voteAnswer(
        @Request() req,
        @Param('id') answerId: string,
        @Body() dto: VoteDto,
    ) {
        if (!answerId || answerId.length < 10) {
            throw new BadRequestException('Geçersiz cevap ID');
        }

        return this.voteService.voteAnswer(answerId, req.user.id, dto.voteType);
    }

    /**
     * Oyunu geri çek
     * DELETE /api/qna/answers/:id/vote
     * Requirements: 5.3
     */
    @Delete(':id/vote')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 50, ttl: 3600000 } }) // 50 vote removals per hour
    async removeVote(@Request() req, @Param('id') answerId: string) {
        if (!answerId || answerId.length < 10) {
            throw new BadRequestException('Geçersiz cevap ID');
        }

        return this.voteService.removeVote(answerId, req.user.id);
    }

    /**
     * Kullanıcının oyunu getir
     * GET /api/qna/answers/:id/vote
     * Requirements: 5.2
     */
    @Get(':id/vote')
    async getUserVote(@Request() req, @Param('id') answerId: string) {
        if (!answerId || answerId.length < 10) {
            throw new BadRequestException('Geçersiz cevap ID');
        }

        const voteType = await this.voteService.getUserVote(
            answerId,
            req.user.id,
        );

        return {
            answerId,
            voteType,
        };
    }

    /**
     * Cevabın oy sayısını getir
     * GET /api/qna/answers/:id/vote-count
     * Requirements: 5.4
     */
    @Get(':id/vote-count')
    async getVoteCount(@Param('id') answerId: string) {
        if (!answerId || answerId.length < 10) {
            throw new BadRequestException('Geçersiz cevap ID');
        }

        const voteCount = await this.voteService.getAnswerVoteCount(answerId);

        return {
            answerId,
            voteCount,
        };
    }
}
