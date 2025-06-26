import { apiClient } from './apiClient';

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
    suggestedActions?: string[];
  };
  isRead: boolean;
  sessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageRequest {
  message: string;
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

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  total: number;
}

export interface EscalateRequest {
  sessionId?: string;
  reason?: string;
}

export const chatbotApi = {
  // Send a message to the chatbot
  sendMessage: async (data: SendMessageRequest): Promise<ChatResponse> => {
    console.log('Frontend sending chatbot message:', data);
    const response = await apiClient.post('/chatbot/send', data);
    console.log('Frontend chatbot response:', response.data);
    return response.data.data || response.data;
  },

  // Get chat history
  getChatHistory: async (sessionId?: string, limit?: number): Promise<ChatHistoryResponse> => {
    const params = new URLSearchParams();
    if (sessionId) params.append('sessionId', sessionId);
    if (limit) params.append('limit', limit.toString());
    
    const response = await apiClient.get(`/chatbot/history?${params.toString()}`);
    return response.data;
  },

  // Escalate chat to human support
  escalateToHuman: async (data: EscalateRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/chatbot/escalate', data);
    return response.data;
  },
}; 