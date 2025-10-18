import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SharingService } from './sharing.service';

@Controller('qna')
export class SharingController {
    constructor(private sharingService: SharingService) { }

    @Get('questions/:id/share-link')
    async getQuestionShareLink(@Param('id') questionId: string) {
        return this.sharingService.generateQuestionShareLink(questionId);
    }

    @Get('answers/:id/share-link')
    async getAnswerShareLink(@Param('id') answerId: string) {
        return this.sharingService.generateAnswerShareLink(answerId);
    }

    @Get('questions/:id/share-metadata')
    async getQuestionShareMetadata(@Param('id') questionId: string) {
        return this.sharingService.getQuestionShareMetadata(questionId);
    }

    @Get('answers/:id/share-metadata')
    async getAnswerShareMetadata(@Param('id') answerId: string) {
        return this.sharingService.getAnswerShareMetadata(answerId);
    }

    @Post('questions/:id/track-share')
    @UseGuards(AuthGuard('jwt'))
    async trackQuestionShare(@Param('id') questionId: string) {
        await this.sharingService.trackShare(questionId);
        return { success: true };
    }
}
