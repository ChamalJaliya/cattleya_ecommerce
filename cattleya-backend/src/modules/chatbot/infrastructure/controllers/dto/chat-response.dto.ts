import { ApiProperty } from '@nestjs/swagger';

export class ChatResponseDto {
  @ApiProperty({ description: 'Response message from the chatbot' })
  message: string;

  @ApiProperty({ description: 'Quick reply suggestions', required: false, type: [String] })
  quickReplies?: string[];

  @ApiProperty({ description: 'Response metadata', required: false })
  metadata?: {
    products?: any[];
    recommendations?: any;
    intent?: string;
    confidence?: number;
    escalated?: boolean;
    suggestedActions?: string[];
  };
} 