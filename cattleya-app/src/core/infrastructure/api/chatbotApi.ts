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
  slug?: string;
  description: string;
  shortDescription?: string;
  basePrice: number;
  salePrice?: number;
  isOnSale: boolean;
  stockQuantity: number;
  sku?: string;
  defaultSize?: string;
  availableSizes: string[];
  primaryColors: string[];
  colorPattern?: string;
  averageRating?: number;
  totalReviews?: number;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | string;
  images: Array<{
    id: string;
    url: string;
    altText: string;
    isMain: boolean;
    sortOrder: number;
    color?: string;
    size?: string;
    createdAt: string;
  }> | string[];
  tags: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  // Additional fields from backend response
  aiResponse?: string;
  careInstructions?: string;
  fertilizerInfo?: string;
  wateringGuide?: string;
  lightingGuide?: string;
  temperatureGuide?: string;
  humidityGuide?: string;
  repottingGuide?: string;
  bloomingTips?: string;
  commonIssues?: string;
  expertTips?: string;
  hasDetailedInfo?: boolean;
}

export interface ProductRecommendation {
  type: 'beginner' | 'rare' | 'featured' | 'best_seller' | 'new_arrival';
  products: ProductSearchResult[];
  reason: string;
}

function unwrapApiResponse(response: any) {
  console.log('Raw API response:', response);
  
  // Handle the new nested structure: { data: { success: true, data: { ... } } }
  if (response?.data?.success && response?.data?.data) {
    console.log('Detected nested response structure, extracting from data.data');
    return response.data.data;
  }
  
  // Handle different response structures
  if (response?.data?.data?.messages) {
    // Chat history response: { data: { data: { messages: [...] } } }
    console.log('Detected chat history response with messages array');
    return response.data.data.messages;
  }
  
  if (response?.data?.data?.count !== undefined) {
    // Unread count response: { data: { data: { count: number } } }
    return response.data.data.count;
  }
  
  if (response?.data?.data?.quickReplies) {
    // Quick replies response: { data: { data: { quickReplies: [...] } } }
    return response.data.data.quickReplies;
  }
  
  // Handle direct array response for chat history
  if (Array.isArray(response?.data?.data)) {
    console.log('Detected direct array response for chat history');
    return response.data.data;
  }
  
  // Handle direct array response
  if (Array.isArray(response?.data)) {
    console.log('Detected direct array response in data');
    return response.data;
  }
  
  // Fallback to original structure
  if (response?.data) {
    return response.data;
  }
  
  return response;
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