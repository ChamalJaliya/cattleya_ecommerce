export interface CreateChatMessageDto {
  userId: string;
  sessionId?: string;
  message: string;
  sender: 'USER' | 'BOT' | 'HUMAN';
  metadata?: any;
  isRead?: boolean;
} 