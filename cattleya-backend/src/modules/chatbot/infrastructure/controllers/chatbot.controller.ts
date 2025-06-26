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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { ChatbotService } from '../../application/services/chatbot.service';
import { ProductIntelligenceService } from '../../application/services/product-intelligence.service';
import { CreateChatMessageDto, ChatMessage } from '../../domain/entities/chat-message.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatResponseDto } from './dto/chat-response.dto';

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
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatbotController {
  constructor(
    private readonly chatbotService: ChatbotService,
    private readonly productIntelligenceService: ProductIntelligenceService,
  ) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a message to the chatbot' })
  @ApiResponse({ 
    status: 200, 
    description: 'Message processed successfully',
    type: ChatResponseDto
  })
  @ApiBody({ type: SendMessageDto })
  async sendMessage(@Body() sendMessageDto: SendMessageDto, @Request() req: any) {
    try {
      const userId = req.user?.id || 'anonymous';
      const response = await this.chatbotService.processMessage(
        userId,
        sendMessageDto.message,
        sendMessageDto.sessionId
      );

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

  @Get('quick-replies')
  @ApiOperation({ summary: 'Get quick reply suggestions' })
  @ApiQuery({ name: 'context', required: false, description: 'Context for quick replies' })
  @ApiResponse({ 
    status: 200, 
    description: 'Quick replies retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { 
          type: 'array', 
          items: { type: 'string' } 
        }
      }
    }
  })
  async getQuickReplies(@Query('context') context?: string) {
    try {
      const quickReplies = await this.chatbotService.getQuickReplies(context);
      
      return {
        success: true,
        data: quickReplies,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to get quick replies', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('history')
  @ApiOperation({ summary: 'Get chat history' })
  @ApiQuery({ name: 'sessionId', required: false, description: 'Session ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of messages to retrieve', type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Chat history retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { 
          type: 'array', 
          items: { $ref: '#/components/schemas/ChatMessage' } 
        }
      }
    }
  })
  async getChatHistory(
    @Request() req: any,
    @Query('sessionId') sessionId?: string,
    @Query('limit') limit?: number,
  ) {
    try {
      const userId = req.user.id;
      const history = await this.chatbotService.getChatHistory(userId, sessionId, limit);
      
      return {
        success: true,
        data: history,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to get chat history', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('mark-read')
  @ApiOperation({ summary: 'Mark messages as read' })
  @ApiQuery({ name: 'sessionId', required: false, description: 'Session ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Messages marked as read successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  async markMessagesAsRead(
    @Request() req: any,
    @Query('sessionId') sessionId?: string,
  ) {
    try {
      const userId = req.user.id;
      await this.chatbotService.markMessagesAsRead(userId, sessionId);
      
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

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  @ApiQuery({ name: 'sessionId', required: false, description: 'Session ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Unread count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { type: 'number' }
      }
    }
  })
  async getUnreadCount(
    @Request() req: any,
    @Query('sessionId') sessionId?: string,
  ) {
    try {
      const userId = req.user.id;
      const count = await this.chatbotService.getUnreadCount(userId, sessionId);
      
      return {
        success: true,
        data: count,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to get unread count', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('escalate')
  @ApiOperation({ summary: 'Escalate conversation to human support' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        reason: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Conversation escalated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  async escalateToHuman(@Body() body: { sessionId: string; reason: string }) {
    try {
      await this.chatbotService.escalateToHuman(body.sessionId, body.reason);
      
      return {
        success: true,
        message: 'Conversation escalated to human support',
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to escalate conversation', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Product-related endpoints
  @Get('products/search')
  @ApiOperation({ summary: 'Search products through chatbot' })
  @ApiQuery({ name: 'query', required: true, description: 'Search query' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results', type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Products found successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { 
          type: 'array', 
          items: { $ref: '#/components/schemas/ProductSearchResult' } 
        }
      }
    }
  })
  async searchProducts(
    @Query('query') query: string,
    @Query('limit') limit?: number
  ) {
    try {
      const products = await this.productIntelligenceService.searchProducts(query, limit || 5);
      
      return {
        success: true,
        data: products,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to search products', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('products/recommendations')
  @ApiOperation({ summary: 'Get product recommendations' })
  @ApiQuery({ 
    name: 'type', 
    required: true, 
    description: 'Recommendation type',
    enum: ['beginner', 'rare', 'featured', 'best_seller', 'new_arrival']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Recommendations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { $ref: '#/components/schemas/ProductRecommendation' }
      }
    }
  })
  async getRecommendations(@Query('type') type: 'beginner' | 'rare' | 'featured' | 'best_seller' | 'new_arrival') {
    try {
      const recommendations = await this.productIntelligenceService.getRecommendations(type);
      
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

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product details' })
  @ApiResponse({ 
    status: 200, 
    description: 'Product details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: { $ref: '#/components/schemas/ProductSearchResult' }
      }
    }
  })
  async getProduct(@Param('id') id: string) {
    try {
      const product = await this.productIntelligenceService.getProductById(id);
      
      if (!product) {
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
      }
      
      return {
        success: true,
        data: product,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { success: false, message: 'Failed to get product details', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('products/stock/:id')
  @ApiOperation({ summary: 'Get product stock status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Stock status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            inStock: { type: 'boolean' },
            quantity: { type: 'number' },
            status: { type: 'string' }
          }
        }
      }
    }
  })
  async getStockStatus(@Param('id') id: string) {
    try {
      const stockStatus = await this.productIntelligenceService.getStockStatus(id);
      
      return {
        success: true,
        data: stockStatus,
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: 'Failed to get stock status', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 