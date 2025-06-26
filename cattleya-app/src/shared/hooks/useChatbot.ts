import { useState, useCallback, useRef, useEffect } from 'react';
import { chatbotApi, ChatbotResponse, ChatMessage, ProductSearchResult, ProductRecommendation } from '../../core/infrastructure/api/chatbotApi';
import { useAuthStore } from '../../core/application/stores/useAuthStore';

export interface ChatMessageWithId extends ChatMessage {
  tempId?: string;
}

export interface UseChatbotReturn {
  messages: ChatMessageWithId[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  quickReplies: string[];
  unreadCount: number;
  markAsRead: () => Promise<void>;
  loadHistory: () => Promise<void>;
  clearError: () => void;
  sessionId: string;
  products: ProductSearchResult[];
  recommendations: ProductRecommendation | null;
  currentIntent: string | null;
  // Product-related methods
  searchProducts: (query: string, limit?: number) => Promise<ProductSearchResult[]>;
  getRecommendations: (type: 'beginner' | 'rare' | 'featured' | 'best_seller' | 'new_arrival') => Promise<ProductRecommendation | null>;
  getProductDetails: (productId: string) => Promise<ProductSearchResult | null>;
  getStockStatus: (productId: string) => Promise<{ inStock: boolean; quantity: number; status: string } | null>;
}

export const useChatbot = (): UseChatbotReturn => {
  const [messages, setMessages] = useState<ChatMessageWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [products, setProducts] = useState<ProductSearchResult[]>([]);
  const [recommendations, setRecommendations] = useState<ProductRecommendation | null>(null);
  const [currentIntent, setCurrentIntent] = useState<string | null>(null);
  
  const sessionIdRef = useRef<string>(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const { user } = useAuthStore();

  // Load chat history on mount
  useEffect(() => {
    loadHistory();
    loadQuickReplies();
  }, []);

  // Load unread count periodically
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await chatbotApi.getUnreadCount(sessionIdRef.current);
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to load unread count:', error);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const history = await chatbotApi.getChatHistory(sessionIdRef.current, 50);
      setMessages(Array.isArray(history) ? history : []);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      setError('Failed to load chat history');
    }
  }, []);

  const loadQuickReplies = useCallback(async (context?: string) => {
    try {
      const replies = await chatbotApi.getQuickReplies(context);
      setQuickReplies(replies);
    } catch (error) {
      console.error('Failed to load quick replies:', error);
      // Fallback to default quick replies
      setQuickReplies(['Help', 'Contact Support', 'Browse Products']);
    }
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage: ChatMessageWithId = {
      id: `temp_${Date.now()}`,
      userId: user?.id || 'anonymous',
      message: message.trim(),
      sender: 'USER',
      sessionId: sessionIdRef.current,
      isRead: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      tempId: `temp_${Date.now()}`,
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await chatbotApi.sendMessage({
        message: message.trim(),
        sessionId: sessionIdRef.current,
      });

      // Add bot response
      const botMessage: ChatMessageWithId = {
        id: `bot_${Date.now()}`,
        userId: 'bot',
        message: response.message,
        sender: 'BOT',
        sessionId: sessionIdRef.current,
        isRead: false,
        metadata: response.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

      // Update quick replies if provided
      if (response.quickReplies && response.quickReplies.length > 0) {
        setQuickReplies(response.quickReplies);
      }

      // Update products if provided
      if (response.metadata?.products) {
        setProducts(response.metadata.products);
      }

      // Update recommendations if provided
      if (response.metadata?.recommendations) {
        setRecommendations(response.metadata.recommendations);
      }

      // Update current intent
      if (response.metadata?.intent) {
        setCurrentIntent(response.metadata.intent);
      }

      // Mark messages as read
      await markAsRead();

      // Reload history to get the actual saved messages
      await loadHistory();

    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      
      // Remove the temporary user message on error
      setMessages(prev => prev.filter(msg => msg.tempId !== userMessage.tempId));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, loadHistory]);

  const markAsRead = useCallback(async () => {
    try {
      await chatbotApi.markMessagesAsRead(sessionIdRef.current);
      setUnreadCount(0);
      
      // Update messages to mark them as read
      setMessages(prev => prev.map(msg => 
        msg.sender === 'BOT' ? { ...msg, isRead: true } : msg
      ));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Product-related methods
  const searchProducts = useCallback(async (query: string, limit?: number) => {
    try {
      const results = await chatbotApi.searchProducts(query, limit);
      setProducts(results);
      return results;
    } catch (error) {
      console.error('Failed to search products:', error);
      setError('Failed to search products');
      return [];
    }
  }, []);

  const getRecommendations = useCallback(async (type: 'beginner' | 'rare' | 'featured' | 'best_seller' | 'new_arrival') => {
    try {
      const recs = await chatbotApi.getProductRecommendations(type);
      setRecommendations(recs);
      return recs;
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      setError('Failed to get recommendations');
      return null;
    }
  }, []);

  const getProductDetails = useCallback(async (productId: string) => {
    try {
      const product = await chatbotApi.getProductDetails(productId);
      return product;
    } catch (error) {
      console.error('Failed to get product details:', error);
      setError('Failed to get product details');
      return null;
    }
  }, []);

  const getStockStatus = useCallback(async (productId: string) => {
    try {
      const status = await chatbotApi.getProductStockStatus(productId);
      return status;
    } catch (error) {
      console.error('Failed to get stock status:', error);
      setError('Failed to get stock status');
      return null;
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    quickReplies,
    unreadCount,
    markAsRead,
    loadHistory,
    clearError,
    sessionId: sessionIdRef.current,
    products,
    recommendations,
    currentIntent,
    // Product-related methods
    searchProducts,
    getRecommendations,
    getProductDetails,
    getStockStatus,
  };
}; 