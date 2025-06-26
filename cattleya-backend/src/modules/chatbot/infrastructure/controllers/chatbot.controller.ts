import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { ChatbotService } from '../../application/services/chatbot.service';
import { CreateChatMessageDto, ChatMessage } from '../../domain/entities/chat-message.entity';

export class SendMessageDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class ChatResponseDto {
  message: string;
  metadata?: {
    intent?: string;
    confidence?: number;
    escalated?: boolean;
    suggestedActions?: string[];
  };
}

export class ChatHistoryResponseDto {
  messages: ChatMessage[];
  total: number;
}

@ApiTags('Chatbot')
@Controller('chatbot')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a message to the chatbot' })
  @ApiResponse({ status: 200, description: 'Message processed successfully', type: ChatResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendMessage(
    @Request() req,
    @Body() body: any,
  ): Promise<ChatResponseDto> {
    console.log('Chatbot sendMessage received:', {
      body: body,
      user: req.user?.id,
      headers: req.headers
    });
    
    const userId = req.user.id;
    const message = body.message;
    const sessionId = body.sessionId;
    
    // Save user message
    await this.chatbotService.saveMessage({
      userId,
      message: message,
      sender: 'USER',
      sessionId: sessionId,
    });

    // Process message and get bot response
    const response = await this.chatbotService.processMessage(
      userId,
      message,
      sessionId,
    );

    // Save bot response
    await this.chatbotService.saveMessage({
      userId,
      message: response.message,
      sender: 'BOT',
      metadata: response.metadata,
      sessionId: sessionId,
    });

    return response;
  }

  @Get('history')
  @ApiOperation({ summary: 'Get chat history' })
  @ApiResponse({ status: 200, description: 'Chat history retrieved successfully', type: ChatHistoryResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'sessionId', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getChatHistory(
    @Request() req,
    @Query('sessionId') sessionId?: string,
    @Query('limit') limit?: number,
  ): Promise<ChatHistoryResponseDto> {
    const userId = req.user.id;
    const messages = await this.chatbotService.getChatHistory(userId, sessionId, limit);
    
    return {
      messages,
      total: messages.length,
    };
  }

  @Post('escalate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Escalate chat to human support' })
  @ApiResponse({ status: 200, description: 'Chat escalated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async escalateToHuman(
    @Request() req,
    @Body() body: { sessionId?: string; reason?: string },
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    
    // Save escalation message
    await this.chatbotService.saveMessage({
      userId,
      message: `Chat escalated to human support. Reason: ${body.reason || 'User requested human assistance'}`,
      sender: 'BOT',
      metadata: { escalated: true },
      sessionId: body.sessionId,
    });

    // TODO: Create support ticket or notify admin
    // This would integrate with your existing support system

    return {
      message: 'Your chat has been escalated to our support team. They will respond shortly.',
    };
  }
} 