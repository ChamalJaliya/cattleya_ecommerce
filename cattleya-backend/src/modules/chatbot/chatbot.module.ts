import { Module } from '@nestjs/common';
import { ChatbotController } from './infrastructure/controllers/chatbot.controller';
import { ChatbotService } from './application/services/chatbot.service';

@Module({
  controllers: [ChatbotController],
  providers: [ChatbotService],
  exports: [ChatbotService],
})
export class ChatbotModule {} 