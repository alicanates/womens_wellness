import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Sse,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { ChatService } from './chat.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { QuotaGuard } from '../quota/quota.guard';
import { QuotaService } from '../quota/quota.service';

interface MessageEvent {
  data: string;
  type?: 'token' | 'done' | 'error';
}

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly quotaService: QuotaService,
  ) {}

  @Post(':conversationId/message')
  async sendMessage(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
    @Body('content') content: string,
  ) {
    // Ensure conversation exists or create it
    const conversation = await this.chatService.getOrCreateConversation(
      user.id,
      conversationId,
    );

    // Save user message
    const message = await this.chatService.saveMessage(
      conversation.id,
      'user',
      content,
    );

    return { messageId: message.id, conversationId: conversation.id };
  }

  @Sse(':conversationId/stream')
  @UseGuards(QuotaGuard)
  async stream(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
    @Req() req: any,
  ): Promise<Observable<MessageEvent>> {
    // Get the last user message from this conversation
    const history = await this.chatService.getConversationHistory(
      conversationId,
      1,
    );
    const lastMessage = history[0];

    if (!lastMessage || lastMessage.role !== 'user') {
      throw new Error('No user message to respond to');
    }

    // Create abort controller for client disconnect
    const abort = new AbortController();
    req.on('close', () => abort.abort());

    return new Observable((subscriber) => {
      (async () => {
        try {
          const result = await this.chatService.streamResponse(
            user.id,
            conversationId,
            lastMessage.content,
          );

          let fullResponse = '';
          let tokenCount = 0;

          // Stream tokens
          for await (const chunk of result.textStream) {
            fullResponse += chunk;
            tokenCount++;

            subscriber.next({
              type: 'token',
              data: chunk,
            });

            // Check if aborted
            if (abort.signal.aborted) {
              break;
            }
          }

          // Save assistant response to database
          if (!abort.signal.aborted) {
            await this.chatService.saveMessage(
              conversationId,
              'assistant',
              fullResponse,
              tokenCount,
            );

            // Increment quota counter
            await this.quotaService.increment(user.id);

            subscriber.next({
              type: 'done',
              data: JSON.stringify({ tokens: tokenCount }),
            });
          }

          subscriber.complete();
        } catch (error) {
          subscriber.next({
            type: 'error',
            data: JSON.stringify({
              message: error.message || 'Stream error occurred',
            }),
          });
          subscriber.error(error);
        }
      })();
    });
  }

  @Post(':conversationId/forget')
  async forgetConversation(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
  ) {
    // Delete all messages in conversation
    await this.chatService.forgetConversation(user.id, conversationId);

    return { status: 'ok', message: 'Conversation forgotten' };
  }

  @Get('conversations')
  async getConversations(@CurrentUser() user: any) {
    return this.chatService.getUserConversations(user.id);
  }

  @Get(':conversationId/history')
  async getHistory(
    @CurrentUser() user: any,
    @Param('conversationId') conversationId: string,
  ) {
    const messages = await this.chatService.getConversationHistory(
      conversationId,
    );
    return { conversationId, messages };
  }
}
