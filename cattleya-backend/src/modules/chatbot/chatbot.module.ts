import { Module } from '@nestjs/common';
import { ChatbotController } from './infrastructure/controllers/chatbot.controller';
import { ChatbotService } from './application/services/chatbot.service';
import { KnowledgeGraphService } from './application/services/knowledge-graph.service';
import { ProductIntelligenceService } from './application/services/product-intelligence.service';
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
    ChatbotService,
    KnowledgeGraphService,
    ProductIntelligenceService,
    ChatMessageRepository,
    PrismaService,
  ],
  exports: [
    ChatbotService,
    KnowledgeGraphService,
    ProductIntelligenceService,
  ],
})
export class ChatbotModule {} 