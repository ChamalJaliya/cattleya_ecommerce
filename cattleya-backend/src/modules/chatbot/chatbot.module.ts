import { Module } from '@nestjs/common';
import { ChatbotController } from './infrastructure/controllers/chatbot.controller';
import { EnhancedChatbotService } from './application/services/enhanced-chatbot.service';
import { ChatMessageRepository } from './infrastructure/repositories/chat-message.repository';
import { PrismaService } from '../../shared/database/prisma/prisma.service';
import { ProductsModule } from '../products/products.module';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [
    ProductsModule,
    SharedModule,
  ],
  controllers: [ChatbotController],
  providers: [
    EnhancedChatbotService,
    ChatMessageRepository,
    PrismaService,
  ],
  exports: [
    EnhancedChatbotService,
  ],
})
export class ChatbotModule {} 