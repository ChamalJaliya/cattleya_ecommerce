import { useState, useCallback, useRef, useEffect } from 'react';
import { chatbotApi, ChatbotResponse, ChatMessage, ProductSearchResult, ProductRecommendation } from '../../core/infrastructure/api/chatbotApi';
import { useAuthStore } from '../../core/application/stores/useAuthStore';

export interface ChatMessageWithId extends ChatMessage {
  tempId?: string;
}

// Extend the ChatbotResponse interface to handle both camelCase and snake_case
export interface ExtendedChatbotResponse extends ChatbotResponse {
  quick_replies?: string[];
  products?: ProductSearchResult[];
  data?: {
    message?: string;
    metadata?: any;
    quick_replies?: string[];
    products?: ProductSearchResult[];
    data?: {
      message?: string;
      metadata?: any;
      quick_replies?: string[];
      products?: ProductSearchResult[];
    };
  };
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
  // Debug methods
  clearSession: () => void;
  getCurrentSessionId: () => string;
}

// Helper function to get or create persistent session ID
const getOrCreateSessionId = (userId: string): string => {
  if (typeof window === 'undefined') {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Use different storage keys for authenticated vs anonymous users
  const storageKey = userId === 'anonymous' 
    ? 'chatbot_session_anonymous' 
    : `chatbot_session_${userId}`;
  
  let sessionId = localStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
};

export const useChatbot = (shouldPollUnread: boolean = true): UseChatbotReturn => {
  const [messages, setMessages] = useState<ChatMessageWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [products, setProducts] = useState<ProductSearchResult[]>([]);
  const [recommendations, setRecommendations] = useState<ProductRecommendation | null>(null);
  const [currentIntent, setCurrentIntent] = useState<string | null>(null);
  
  const { user } = useAuthStore();
  
  // Create persistent session ID based on user ID
  const sessionIdRef = useRef<string>('');
  
  // Unread count polling interval ref
  const unreadIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debounce history reload to prevent overwriting optimistic UI
  const historyReloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize session ID when user changes
  useEffect(() => {
    // Always initialize session ID, even for anonymous users
    const userId = user?.id || 'anonymous';
    sessionIdRef.current = getOrCreateSessionId(userId);
    console.log('Chatbot session ID initialized:', sessionIdRef.current, 'for user:', userId);
  }, [user?.id]);

  // Load chat history on mount and when session ID changes (debounced)
  useEffect(() => {
    if (sessionIdRef.current) {
      // Clear any existing timeout
      if (historyReloadTimeoutRef.current) {
        clearTimeout(historyReloadTimeoutRef.current);
      }
      
      // Debounce history reload to prevent race conditions
      historyReloadTimeoutRef.current = setTimeout(() => {
        loadHistory();
        loadQuickReplies();
      }, 100); // Small delay to prevent immediate overwrite
    }
    
    return () => {
      if (historyReloadTimeoutRef.current) {
        clearTimeout(historyReloadTimeoutRef.current);
      }
    };
  }, [sessionIdRef.current]);

  // Load unread count periodically ONLY if shouldPollUnread is true
  useEffect(() => {
    if (!sessionIdRef.current || !shouldPollUnread) return;

    const loadUnreadCount = async () => {
      try {
        const count = await chatbotApi.getUnreadCount(sessionIdRef.current);
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to load unread count:', error);
      }
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // 30s

    return () => clearInterval(interval);
  }, [sessionIdRef.current, shouldPollUnread]);

  // Helper to check if a message from backend matches a temp message
  const isMessageConfirmed = (tempMsg: ChatMessageWithId, backendMsgs: ChatMessageWithId[]) => {
    return backendMsgs.some(
      (msg) =>
        msg.sender === tempMsg.sender &&
        msg.message === tempMsg.message &&
        Math.abs(new Date(msg.createdAt).getTime() - new Date(tempMsg.createdAt).getTime()) < 60000 // within 1 min
    );
  };

  const loadHistory = useCallback(async () => {
    if (!sessionIdRef.current) return;
    try {
      console.log('Loading chat history for session:', sessionIdRef.current);
      const history = await chatbotApi.getChatHistory(sessionIdRef.current, 50);
      console.log('Chat history loaded:', history);
      
      // Ensure history is an array
      const historyArray = Array.isArray(history) ? history : [];
      console.log('History array:', historyArray);
      
      // Merge: keep any temp messages not yet confirmed by backend
      setMessages((prev) => {
        console.log('Previous messages before merge:', prev);
        console.log('Backend history array:', historyArray);
        
        // Find temp messages that haven't been confirmed by backend yet
        const tempMsgs = prev.filter((msg) => {
          if (!msg.tempId) return false; // Only check temp messages
          return !isMessageConfirmed(msg, historyArray);
        });
        
        console.log('Temp messages to preserve:', tempMsgs);
        
        // Merge: backend history + unconfirmed temp messages
        const mergedMessages = [...historyArray, ...tempMsgs];
        console.log('Final merged messages:', mergedMessages);
        
        return mergedMessages;
      });
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

  const markAsRead = useCallback(async () => {
    if (!sessionIdRef.current) return;
    
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

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) {
      console.warn('sendMessage: Empty message provided');
      return;
    }
    
    if (!sessionIdRef.current) {
      console.error('sendMessage: No session ID available. User:', user?.id || 'anonymous');
      setError('Chat session not initialized. Please refresh the page.');
      return;
    }

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
      console.log('Sending message:', message.trim(), 'Session:', sessionIdRef.current, 'User:', user?.id || 'anonymous');
      const response = await chatbotApi.sendMessage({
        message: message.trim(),
        sessionId: sessionIdRef.current,
      }) as ExtendedChatbotResponse;

      console.log('Chatbot response:', response);
      console.log('Response message:', response.message || response.data?.message);
      console.log('Response metadata:', response.metadata || response.data?.metadata);
      console.log('Response products:', response.metadata?.products || response.data?.metadata?.products);

      // Extract data from the nested response structure
      const responseData = response.data?.data || response.data || response;
      console.log('Extracted response data:', responseData);

      // Add bot response
      const products = responseData.products || responseData.metadata?.products || response.metadata?.products || response.products || [];
      const quickReplies = responseData.quick_replies || response.quick_replies || response.quickReplies || [];
      
      console.log('Extracted products:', products);
      console.log('Extracted quick replies:', quickReplies);

      const botMessage: ChatMessageWithId = {
        id: `bot_${Date.now()}`,
        userId: 'bot',
        message: responseData.message || response.message || response.data?.message || 'I apologize, but I couldn\'t generate a response right now.',
        sender: 'BOT',
        sessionId: sessionIdRef.current,
        isRead: false,
        metadata: {
          ...response.metadata,
          ...response.data?.metadata,
          ...responseData.metadata,
          productCards: products.length > 0 ? {
            type: 'product_card',
            data: {
              products,
              layout: 'list',
              showActions: true,
              showPricing: true,
              showStock: true,
              showRating: true,
              showTags: true,
            }
          } : undefined,
          quickReplies,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);

      console.log('Bot message created:', botMessage);
      console.log('Bot message metadata:', botMessage.metadata);
      console.log('Total messages after adding bot message:', messages.length + 1);

      // Update quick replies if provided (handle both quickReplies and quick_replies)
      if (quickReplies && quickReplies.length > 0) {
        console.log('Setting quick replies:', quickReplies);
        setQuickReplies(quickReplies);
      }

      // Update products if provided
      if (products.length > 0) {
        console.log('Setting products:', products);
        setProducts(products);
      }

      // Update recommendations if provided
      if (response.metadata?.recommendations) {
        console.log('Setting recommendations:', response.metadata.recommendations);
        setRecommendations(response.metadata.recommendations);
      }

      // Update current intent
      if (response.metadata?.intent) {
        console.log('Setting intent:', response.metadata.intent);
        setCurrentIntent(response.metadata.intent);
      }

      // Mark messages as read
      await markAsRead();

      // IMPORTANT: Don't reload history immediately to prevent flickering
      // The backend will save the messages, and they'll be loaded on next mount
      // This prevents the race condition that causes chat bubbles to disappear

    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      
      // Remove the temporary user message on error
      setMessages(prev => prev.filter(msg => msg.tempId !== userMessage.tempId));
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, markAsRead]);

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

  const clearSession = useCallback(() => {
    console.log('🔄 Clearing chat session - this should only happen on explicit user action');
    if (user?.id) {
      localStorage.removeItem(`chatbot_session_${user.id}`);
    }
    sessionIdRef.current = '';
    setMessages([]);
    setIsLoading(false);
    setError(null);
    setQuickReplies([]);
    setUnreadCount(0);
    setProducts([]);
    setRecommendations(null);
    setCurrentIntent(null);
    console.log('Chat session cleared');
  }, [user?.id]);

  const getCurrentSessionId = useCallback(() => {
    return sessionIdRef.current;
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
    // Debug methods
    clearSession,
    getCurrentSessionId,
  };
}; 