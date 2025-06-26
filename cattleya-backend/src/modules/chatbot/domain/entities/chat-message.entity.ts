export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  sender: 'USER' | 'BOT' | 'HUMAN';
  metadata?: {
    intent?: string;
    confidence?: number;
    escalated?: boolean;
    sessionId?: string;
    productId?: string;
    orderId?: string;
  };
  isRead: boolean;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChatMessageDto {
  userId: string;
  message: string;
  sender: 'USER' | 'BOT' | 'HUMAN';
  metadata?: {
    intent?: string;
    confidence?: number;
    escalated?: boolean;
    sessionId?: string;
    productId?: string;
    orderId?: string;
  };
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