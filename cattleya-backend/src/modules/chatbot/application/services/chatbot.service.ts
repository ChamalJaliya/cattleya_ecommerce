import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { ChatMessage, CreateChatMessageDto, ChatResponse } from '../../domain/entities/chat-message.entity';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('app.openai.apiKey'),
    });
  }

  async processMessage(userId: string, message: string, sessionId?: string): Promise<ChatResponse> {
    try {
      // Get conversation history for context
      const conversationHistory = await this.getConversationHistory(userId, sessionId);
      
      // Create system prompt for orchid e-commerce context
      const systemPrompt = this.createSystemPrompt();
      
      // Prepare messages for OpenAI
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: (msg.sender === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: msg.message
        })),
        { role: 'user', content: message }
      ];

      // Get response from OpenAI
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const botResponse = completion.choices[0]?.message?.content || 'I apologize, but I\'m having trouble processing your request right now.';

      // Analyze intent and determine if escalation is needed
      const intent = await this.analyzeIntent(message);
      const shouldEscalate = this.shouldEscalateToHuman(intent, botResponse);

      return {
        message: botResponse,
        metadata: {
          intent: intent.intent,
          confidence: intent.confidence,
          escalated: shouldEscalate,
          suggestedActions: this.getSuggestedActions(intent.intent),
        },
      };
    } catch (error) {
      this.logger.error('Error processing chat message:', error);
      return {
        message: 'I apologize, but I\'m experiencing technical difficulties. Please try again later or contact our support team.',
        metadata: {
          intent: 'error',
          confidence: 0,
          escalated: true,
        },
      };
    }
  }

  private createSystemPrompt(): string {
    return `You are Cattleya, a helpful AI assistant for an orchid e-commerce platform. You help customers with:

1. **Product Information**: Orchid varieties, care instructions, sizes, colors, pricing
2. **Order Support**: Order status, tracking, returns, refunds
3. **General Help**: Website navigation, account issues, payment methods
4. **Care Advice**: Orchid care tips, watering, lighting, repotting

Key guidelines:
- Be friendly, knowledgeable, and helpful
- Focus on orchids and gardening
- If you can't help, suggest contacting human support
- Keep responses concise but informative
- Use a warm, botanical tone
- Don't make up information about products or policies

Current store info:
- Specializes in rare and beautiful orchids
- Offers various sizes from seedlings to specimen plants
- Ships carefully packaged live plants
- Provides care instructions with each order
- Has a loyalty program for customers

If a customer asks about something you're not sure about, politely suggest they contact our support team for detailed assistance.`;
  }

  private async analyzeIntent(message: string): Promise<{ intent: string; confidence: number }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Analyze the user's message and classify it into one of these intents:
- product_info: Questions about orchids, varieties, care, pricing
- order_status: Order tracking, status, delivery
- technical_support: Website issues, account problems, payment
- general_help: General questions, navigation
- escalation: Complex issues that need human help

Respond with JSON: {"intent": "intent_name", "confidence": 0.0-1.0}`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 100,
        temperature: 0.1,
      });

      const response = completion.choices[0]?.message?.content;
      if (response) {
        try {
          return JSON.parse(response);
        } catch {
          return { intent: 'general_help', confidence: 0.5 };
        }
      }
    } catch (error) {
      this.logger.error('Error analyzing intent:', error);
    }
    
    return { intent: 'general_help', confidence: 0.5 };
  }

  private shouldEscalateToHuman(intent: { intent: string; confidence: number }, response: string): boolean {
    // Escalate if confidence is low or for complex issues
    if (intent.confidence < 0.3) return true;
    if (intent.intent === 'escalation') return true;
    if (response.toLowerCase().includes('contact support') || response.toLowerCase().includes('human')) return true;
    
    return false;
  }

  private getSuggestedActions(intent: string): string[] {
    switch (intent) {
      case 'product_info':
        return ['Browse our orchid collection', 'View care guides', 'Check availability'];
      case 'order_status':
        return ['Track your order', 'View order history', 'Contact support'];
      case 'technical_support':
        return ['Contact support', 'Check FAQ', 'Reset password'];
      case 'general_help':
        return ['Browse products', 'View care guides', 'Contact support'];
      default:
        return ['Contact support', 'Browse products', 'View FAQ'];
    }
  }

  private async getConversationHistory(userId: string, sessionId?: string): Promise<ChatMessage[]> {
    // This would be implemented to fetch recent conversation history
    // For now, return empty array - will implement with repository
    return [];
  }

  async saveMessage(createMessageDto: CreateChatMessageDto): Promise<ChatMessage> {
    // This would be implemented to save messages to database
    // For now, return mock data - will implement with repository
    return {
      id: 'mock-id',
      userId: createMessageDto.userId,
      message: createMessageDto.message,
      sender: createMessageDto.sender,
      metadata: createMessageDto.metadata,
      isRead: false,
      sessionId: createMessageDto.sessionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getChatHistory(userId: string, sessionId?: string, limit: number = 50): Promise<ChatMessage[]> {
    // This would be implemented to fetch chat history
    // For now, return empty array - will implement with repository
    return [];
  }
} 