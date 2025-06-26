export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  sender: 'USER' | 'BOT' | 'HUMAN';
  metadata?: any;
  isRead: boolean;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateChatMessageDto {
  userId: string;
  message: string;
  sender: 'USER' | 'BOT' | 'HUMAN';
  metadata?: any;
  sessionId?: string;
}

export interface ChatResponse {
  message: string;
  metadata?: {
    intent?: string;
    confidence?: number;
    escalated?: boolean;
    suggestedActions?: string[];
  };
} 