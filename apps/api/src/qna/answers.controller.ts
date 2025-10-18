import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    BadRequestException,
    UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { QnaService } from './qna.service';
import { CreateAnswerDto, UpdateAnswerDto } from './dto';
import { OwnerGuard, QuestionOwnerGuard } from './guards';
import { SanitizePipe } from './pipes';

@Controller('qna')
@UseGuards(AuthGuard('jwt'))
export class AnswersController {
    constructor(private readonly qnaService: QnaService) { }

    @Post('questions/:questionId/answers')
    @HttpCode(HttpStatus.CREATED)
    @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 answers per hour
    @UsePipes(new SanitizePipe())
    async createAnswer(
        @Request() req,
        @Param('questionId') questionId: string,
        @Body() dto: CreateAnswerDto,
    ) {
        if (!questionId || questionId.length < 10) {
            throw new BadRequestException('Geçersiz soru ID');
        }
        return this.qnaService.createAnswer(questionId, req.user.id, dto);
    }

    @Get('questions/:questionId/answers')
    async getAnswers(@Request() req, @Param('questionId') questionId: string) {
        if (!questionId || questionId.length < 10) {
            throw new BadRequestException('Geçersiz soru ID');
        }
        return this.qnaService.getAnswers(questionId, req.user.id);
    }

    @Patch('answers/:id')
    @UseGuards(OwnerGuard)
    @Throttle({ default: { limit: 20, ttl: 3600000 } }) // 20 updates per hour
    @UsePipes(new SanitizePipe())
    async updateAnswer(
        @Request() req,
        @Param('id') id: string,
        @Body() dto: UpdateAnswerDto,
    ) {
        if (!id || id.length < 10) {
            throw new BadRequestException('Geçersiz cevap ID');
        }
        return this.qnaService.updateAnswer(id, req.user.id, dto);
    }

    @Delete('answers/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(OwnerGuard)
    @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 deletes per hour
    async deleteAnswer(@Request() req, @Param('id') id: string) {
        if (!id || id.length < 10) {
            throw new BadRequestException('Geçersiz cevap ID');
        }
        await this.qnaService.deleteAnswer(id, req.user.id);
    }

    @Post('questions/:questionId/answers/:answerId/mark-best')
    @HttpCode(HttpStatus.OK)
    @UseGuards(QuestionOwnerGuard)
    @Throttle({ default: { limit: 20, ttl: 3600000 } }) // 20 marks per hour
    async markBestAnswer(
        @Request() req,
        @Param('questionId') questionId: string,
        @Param('answerId') answerId: string,
    ) {
        if (!questionId || questionId.length < 10) {
            throw new BadRequestException('Geçersiz soru ID');
        }
        if (!answerId || answerId.length < 10) {
            throw new BadRequestException('Geçersiz cevap ID');
        }
        await this.qnaService.markBestAnswer(questionId, answerId, req.user.id);
        return { success: true };
    }
}
