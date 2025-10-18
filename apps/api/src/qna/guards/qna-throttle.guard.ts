import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

/**
 * QnA-specific throttle guard
 * Allows custom rate limits per endpoint
 */
@Injectable()
export class QnaThrottleGuard extends ThrottlerGuard {
    constructor(
        protected readonly options: any,
        protected readonly storageService: any,
        protected readonly reflector: Reflector,
    ) {
        super(options, storageService, reflector);
    }

    protected async getTracker(req: Record<string, any>): Promise<string> {
        // Track by user ID if authenticated, otherwise by IP
        return req.user?.id || req.ip;
    }

    protected async getThrottlerLimit(context: ExecutionContext): Promise<number> {
        const request = context.switchToHttp().getRequest();
        const route = request.route?.path;

        // Custom limits per route
        const limits: Record<string, number> = {
            // Questions
            'POST /api/qna/questions': 5, // 5 questions per hour
            'PATCH /api/qna/questions/:id': 10, // 10 updates per hour
            'DELETE /api/qna/questions/:id': 10, // 10 deletes per hour

            // Answers
            'POST /api/qna/questions/:questionId/answers': 10, // 10 answers per hour
            'PATCH /api/qna/answers/:id': 20, // 20 updates per hour
            'DELETE /api/qna/answers/:id': 10, // 10 deletes per hour

            // Votes
            'POST /api/qna/answers/:id/vote': 50, // 50 votes per hour
            'DELETE /api/qna/answers/:id/vote': 50, // 50 vote removals per hour

            // Comments
            'POST /api/qna/questions/:id/comments': 20, // 20 comments per hour
            'POST /api/qna/answers/:id/comments': 20, // 20 comments per hour
            'DELETE /api/qna/comments/question/:id': 20, // 20 deletes per hour
            'DELETE /api/qna/comments/answer/:id': 20, // 20 deletes per hour

            // Interactions
            'POST /api/qna/questions/:id/favorite': 30, // 30 favorites per hour
            'DELETE /api/qna/questions/:id/favorite': 30, // 30 unfavorites per hour
            'POST /api/qna/questions/:id/follow': 30, // 30 follows per hour
            'DELETE /api/qna/questions/:id/follow': 30, // 30 unfollows per hour
            'POST /api/qna/users/:id/follow': 20, // 20 user follows per hour
            'DELETE /api/qna/users/:id/follow': 20, // 20 user unfollows per hour

            // Moderation
            'POST /api/qna/moderation/report': 10, // 10 reports per hour
        };

        const method = request.method;
        const path = route?.replace(/^\//, ''); // Remove leading slash
        const key = `${method} /${path}`;

        return limits[key] || 60; // Default: 60 requests per hour
    }

    protected async getThrottlerTtl(context: ExecutionContext): Promise<number> {
        // 1 hour TTL for all QnA operations
        return 60 * 60 * 1000; // 60 minutes in milliseconds
    }
}
