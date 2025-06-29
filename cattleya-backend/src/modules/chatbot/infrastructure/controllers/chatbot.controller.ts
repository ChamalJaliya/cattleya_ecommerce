import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Query,
  Param,
  HttpStatus,
  HttpException,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { EnhancedChatbotService, ChatbotRequest, EnhancedChatbotResponse, ProductCard, ExtractedEntity } from '../../application/services/enhanced-chatbot.service';
import { CreateChatMessageDto, ChatMessage } from '../../domain/entities/chat-message.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

export class ProductCardDto {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  image: string;
  stock: number;
  category: string;
  rating: number;
  reviews: number;
  tags: string[];
}

export class ExtractedEntityDto {
  text: string;
  type: string;
  confidence: number;
  source: string;
}

export class EnhancedChatResponseDto {
  message: string;
  products: ProductCardDto[];
  quick_replies: string[];
  intent: string;
  confidence: number;
  entities: ExtractedEntityDto[];
  metadata: any;
}

export class ChatHistoryResponseDto {
  messages: ChatMessage[];
  total: number;
}

export class QuickRepliesResponseDto {
  quickReplies: string[];
  context?: string;
}

export class UnreadCountResponseDto {
  count: number;
}

@ApiTags('Chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(
    private readonly enhancedChatbotService: EnhancedChatbotService,
  ) {}

  @Post('test')
  @ApiOperation({ summary: 'Test chatbot without authentication (for debugging)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Test message processed successfully',
    type: EnhancedChatResponseDto
  })
  @ApiBody({ type: SendMessageDto })
  async testMessage(@Body() sendMessageDto: SendMessageDto) {
    try {
      const userId = 'test-user';
      
      const request: ChatbotRequest = {
        message: sendMessageDto.message,
        session_id: sendMessageDto.sessionId || 'test-session',
        user_experience: sendMessageDto.userExperience || 'beginner',
        context: sendMessageDto.context
      };

      const response = await this.enhancedChatbotService.processMessage(request, userId);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to process test message', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('send')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a message to the enhanced AI-powered chatbot with product cards' })
  @ApiResponse({ 
    status: 200, 
    description: 'Message processed successfully with dynamic AI response and product cards',
    type: EnhancedChatResponseDto
  })
  @ApiBody({ type: SendMessageDto })
  async sendMessage(@Body() sendMessageDto: SendMessageDto, @Request() req: any) {
    try {
      const userId = req.user?.id || 'anonymous';
      
      const request: ChatbotRequest = {
        message: sendMessageDto.message,
        session_id: sendMessageDto.sessionId || userId,
        user_experience: sendMessageDto.userExperience || 'beginner',
        context: sendMessageDto.context
      };

      const response = await this.enhancedChatbotService.processMessage(request, userId);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to process message', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('send/legacy')
  @ApiOperation({ summary: 'Send a message to the legacy chatbot (backward compatibility)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Message processed successfully with legacy response format',
    type: ChatResponseDto
  })
  @ApiBody({ type: SendMessageDto })
  async sendMessageLegacy(@Body() sendMessageDto: SendMessageDto, @Request() req: any) {
    try {
      const userId = req.user?.id || 'anonymous';
      
      const request: ChatbotRequest = {
        message: sendMessageDto.message,
        session_id: sendMessageDto.sessionId || userId,
        user_experience: sendMessageDto.userExperience || 'beginner',
        context: sendMessageDto.context
      };

      const response = await this.enhancedChatbotService.processMessageLegacy(request);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to process message', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('voice')
  @ApiOperation({ summary: 'Send voice message to enhanced chatbot' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ 
    status: 200, 
    description: 'Voice message processed successfully with product cards'
  })
  @UseInterceptors(FileInterceptor('audio'))
  async sendVoiceMessage(
    @UploadedFile() audioFile: Express.Multer.File,
    @Body() body: { sessionId?: string; language?: string },
    @Request() req: any
  ) {
    try {
      const userId = req.user?.id || 'anonymous';
      const sessionId = body.sessionId || userId;
      const language = body.language || 'en-US';

      // First transcribe the voice
      const transcription = await this.enhancedChatbotService.transcribeVoice(
        audioFile.buffer,
        sessionId,
        language
      );

      if (!transcription.success) {
        throw new HttpException(
          { success: false, message: 'Voice transcription failed', error: transcription.error },
          HttpStatus.BAD_REQUEST
        );
      }

      // Then process the transcribed text with enhanced chatbot
      const request: ChatbotRequest = {
        message: transcription.text,
        session_id: sessionId,
        user_experience: 'beginner',
        context: 'voice_message'
      };

      const response = await this.enhancedChatbotService.processMessage(request, userId);

      return {
        success: true,
        data: {
          transcription,
          response
        },
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to process voice message', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('orchid/search')
  @ApiOperation({ summary: 'Search for orchid information dynamically' })
  @ApiQuery({ name: 'query', required: true, description: 'Search query for orchid information' })
  @ApiResponse({ 
    status: 200, 
    description: 'Orchid information search results'
  })
  async searchOrchidInfo(@Query('query') query: string) {
    try {
      const results = await this.enhancedChatbotService.searchOrchidInfo(query);
      
      return {
        success: true,
        data: results,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to search orchid info', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('orchid/recommendations')
  @ApiOperation({ summary: 'Get AI-generated orchid recommendations' })
  @ApiQuery({ name: 'experience', required: false, description: 'User experience level' })
  @ApiQuery({ name: 'budget', required: false, description: 'Budget range' })
  @ApiResponse({ 
    status: 200, 
    description: 'AI-generated recommendations retrieved successfully'
  })
  async getOrchidRecommendations(
    @Query('experience') experience: string = 'beginner',
    @Query('budget') budget: string = 'medium'
  ) {
    try {
      const recommendations = await this.enhancedChatbotService.getOrchidRecommendations(experience, budget);
      
      return {
        success: true,
        data: recommendations,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to get recommendations', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('orchid/generate-response')
  @ApiOperation({ summary: 'Generate AI-powered orchid response' })
  @ApiResponse({ 
    status: 200, 
    description: 'AI response generated successfully'
  })
  async generateOrchidResponse(@Body() request: ChatbotRequest) {
    try {
      const response = await this.enhancedChatbotService.generateOrchidResponse(request);
      
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to generate response', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('sentiment')
  @ApiOperation({ summary: 'Analyze sentiment of text' })
  @ApiResponse({ 
    status: 200, 
    description: 'Sentiment analysis completed successfully'
  })
  async analyzeSentiment(
    @Body() body: { text: string; sessionId?: string },
    @Request() req: any
  ) {
    try {
      const userId = req.user?.id || 'anonymous';
      const sessionId = body.sessionId || userId;

      const sentiment = await this.enhancedChatbotService.analyzeSentiment(body.text, sessionId);
      
      return {
        success: true,
        data: sentiment,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to analyze sentiment', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('conversation-context/:sessionId')
  @ApiOperation({ summary: 'Get conversation context and history' })
  @ApiResponse({ 
    status: 200, 
    description: 'Conversation context retrieved successfully'
  })
  async getConversationContext(@Param('sessionId') sessionId: string) {
    try {
      const context = await this.enhancedChatbotService.getConversationContext(sessionId);
      
      return {
        success: true,
        data: context,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to get conversation context', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Check chatbot service health' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service health status'
  })
  async healthCheck() {
    try {
      const health = await this.enhancedChatbotService.healthCheck();
      
      return {
        success: true,
        data: health,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Health check failed', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('quick-replies')
  @ApiOperation({ summary: 'Get contextual quick replies' })
  @ApiQuery({ name: 'context', required: false, description: 'Context for generating quick replies' })
  @ApiResponse({ 
    status: 200, 
    description: 'Quick replies generated successfully',
    type: QuickRepliesResponseDto
  })
  async getQuickReplies(@Query('context') context?: string) {
    try {
      // Generate contextual quick replies based on context
      let quickReplies: string[];
      
      if (context?.includes('product') || context?.includes('orchid')) {
        quickReplies = ['View Details', 'Add to Cart', 'Show Similar', 'Care Guide'];
      } else if (context?.includes('care') || context?.includes('help')) {
        quickReplies = ['Watering Tips', 'Light Requirements', 'Fertilizing Guide', 'Repotting Help'];
      } else if (context?.includes('recommend')) {
        quickReplies = ['Beginner Orchids', 'Rare Varieties', 'Popular Choices', 'Budget-Friendly'];
      } else {
        quickReplies = ['Browse Products', 'Care Guide', 'Get Recommendations', 'Ask Expert'];
      }
      
      return {
        success: true,
        data: {
          quickReplies,
          context
        },
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to get quick replies', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('history')
  @ApiOperation({ summary: 'Get chat history for user' })
  @ApiQuery({ name: 'sessionId', required: false, description: 'Session ID for filtering' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of messages to retrieve' })
  @ApiResponse({ 
    status: 200, 
    description: 'Chat history retrieved successfully',
    type: ChatHistoryResponseDto
  })
  async getChatHistory(
    @Request() req: any,
    @Query('sessionId') sessionId?: string,
    @Query('limit') limit?: number,
  ) {
    try {
      const userId = req.user?.id || 'anonymous';
      const targetSessionId = sessionId || userId;
      const messageLimit = limit || 50;
      
      // Fetch messages from MongoDB using ChatMessageRepository
      const messages = await this.enhancedChatbotService.getChatHistory(userId, targetSessionId, messageLimit);
      
      return {
        success: true,
        data: {
          messages,
          total: messages.length,
        },
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to get chat history', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count (dummy)' })
  @ApiResponse({ status: 200, description: 'Unread count (always 0 in local/dev)' })
  async getUnreadCount(@Query('sessionId') sessionId: string) {
    return { success: true, data: { count: 0 } };
  }

  @Put('mark-read')
  @ApiOperation({ summary: 'Mark messages as read' })
  @ApiQuery({ name: 'sessionId', required: false, description: 'Session ID for filtering' })
  @ApiResponse({ status: 200, description: 'Messages marked as read successfully' })
  async markMessagesAsRead(
    @Request() req: any,
    @Query('sessionId') sessionId?: string
  ) {
    try {
      const userId = req.user?.id || 'anonymous';
      await this.enhancedChatbotService.markMessagesAsRead(userId, sessionId);
      
      return {
        success: true,
        message: 'Messages marked as read successfully',
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to mark messages as read', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 