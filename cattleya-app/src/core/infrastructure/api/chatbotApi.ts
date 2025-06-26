import { apiClient } from './apiClient';

export interface ChatbotResponse {
  message: string;
  quickReplies?: string[];
  metadata?: {
    products?: any[];
    recommendations?: any;
    intent?: string;
    confidence?: number;
    escalated?: boolean;
    suggestedActions?: string[];
  };
}

export interface SendMessageRequest {
  message: string;
  sessionId?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  sender: 'USER' | 'BOT';
  sessionId: string;
  isRead: boolean;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSearchResult {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  salePrice?: number;
  isOnSale: boolean;
  stockQuantity: number;
  sku: string;
  defaultSize: string;
  availableSizes: string[];
  primaryColors: string[];
  colorPattern: string;
  averageRating: number;
  totalReviews: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
}

export interface ProductRecommendation {
  type: 'beginner' | 'rare' | 'featured' | 'best_seller' | 'new_arrival';
  products: ProductSearchResult[];
  reason: string;
}

function unwrapApiResponse(response: any) {
  return response?.data?.data?.data ?? response?.data?.data ?? response?.data ?? response;
}

class ChatbotApi {
  async sendMessage(request: SendMessageRequest): Promise<ChatbotResponse> {
    const response = await apiClient.post('/chatbot/send', request);
    return unwrapApiResponse(response);
  }

  async getQuickReplies(context?: string): Promise<string[]> {
    const params = context ? { context } : {};
    const response = await apiClient.get('/chatbot/quick-replies', { params });
    return unwrapApiResponse(response);
  }

  async getChatHistory(sessionId?: string, limit?: number): Promise<ChatMessage[]> {
    const params: any = {};
    if (sessionId) params.sessionId = sessionId;
    if (limit) params.limit = limit;
    
    const response = await apiClient.get('/chatbot/history', { params });
    return unwrapApiResponse(response);
  }

  async markMessagesAsRead(sessionId?: string): Promise<void> {
    const params = sessionId ? { sessionId } : {};
    await apiClient.put('/chatbot/mark-read', {}, { params });
  }

  async getUnreadCount(sessionId?: string): Promise<number> {
    const params = sessionId ? { sessionId } : {};
    const response = await apiClient.get('/chatbot/unread-count', { params });
    return unwrapApiResponse(response);
  }

  async escalateToHuman(sessionId: string, reason: string): Promise<void> {
    await apiClient.post('/chatbot/escalate', { sessionId, reason });
  }

  // Product-related methods
  async searchProducts(query: string, limit?: number): Promise<ProductSearchResult[]> {
    const params: any = { query };
    if (limit) params.limit = limit;
    
    const response = await apiClient.get('/chatbot/products/search', { params });
    return unwrapApiResponse(response);
  }

  async getProductRecommendations(type: 'beginner' | 'rare' | 'featured' | 'best_seller' | 'new_arrival'): Promise<ProductRecommendation> {
    const response = await apiClient.get('/chatbot/products/recommendations', { 
      params: { type } 
    });
    return unwrapApiResponse(response);
  }

  async getProductDetails(productId: string): Promise<ProductSearchResult> {
    const response = await apiClient.get(`/chatbot/products/${productId}`);
    return unwrapApiResponse(response);
  }

  async getProductStockStatus(productId: string): Promise<{ inStock: boolean; quantity: number; status: string }> {
    const response = await apiClient.get(`/chatbot/products/stock/${productId}`);
    return unwrapApiResponse(response);
  }
}

export const chatbotApi = new ChatbotApi(); 