import { useState, useEffect, useCallback } from 'react';
import { chatbotApi, ChatMessage, SendMessageRequest, ChatResponse } from '../../core/infrastructure/api/chatbotApi';
import { useAuthStore } from '../../core/application/stores/useAuthStore';

export const useChatbot = (sessionId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();

  // Ensure messages is always an array
  const safeMessages = messages || [];

  // Debug logging
  console.log('useChatbot debug:', { 
    user: user?.id, 
    isAuthenticated: !!user, 
    messagesLength: safeMessages.length,
    isOpen,
    sessionId 
  });

  // Load chat history on mount
  useEffect(() => {
    console.log('useChatbot useEffect: user =', user?.id, 'isOpen =', isOpen);
    if (user && isOpen) {
      console.log('useChatbot: Loading chat history');
      loadChatHistory();
    } else {
      console.log('useChatbot: Skipping chat history load - user:', !!user, 'isOpen:', isOpen);
    }
  }, [user, isOpen, sessionId]);

  const loadChatHistory = useCallback(async () => {
    if (!user) {
      console.log('loadChatHistory: No user, skipping');
      return;
    }
    
    try {
      console.log('loadChatHistory: Loading chat history for user:', user.id);
      setIsLoading(true);
      setError(null);
      const response = await chatbotApi.getChatHistory(sessionId, 50);
      console.log('loadChatHistory: Response received:', response);
      setMessages(response.messages || []);
    } catch (err) {
      console.error('loadChatHistory: Error loading chat history:', err);
      setError('Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  }, [user, sessionId]);

  const sendMessage = useCallback(async (message: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        userId: user.id,
        message,
        sender: 'USER',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setMessages(prev => [...prev, userMessage]);

      // Send to API
      const request: SendMessageRequest = {
        message,
        sessionId,
      };
      
      const response: ChatResponse = await chatbotApi.sendMessage(request);

      // Add bot response to UI
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        userId: user.id,
        message: response.message,
        sender: 'BOT',
        metadata: response.metadata,
        isRead: false,
        sessionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);

      return response;
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
      
      // Remove the temporary user message on error
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
    } finally {
      setIsLoading(false);
    }
  }, [user, sessionId]);

  const escalateToHuman = useCallback(async (reason?: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await chatbotApi.escalateToHuman({ sessionId, reason });
      
      // Add escalation message
      const escalationMessage: ChatMessage = {
        id: `escalation-${Date.now()}`,
        userId: user.id,
        message: response.message,
        sender: 'BOT',
        metadata: { escalated: true },
        isRead: false,
        sessionId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setMessages(prev => [...prev, escalationMessage]);
      
      return response;
    } catch (err) {
      setError('Failed to escalate chat');
      console.error('Error escalating chat:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, sessionId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    messages: safeMessages,
    isLoading,
    error,
    isOpen,
    sendMessage,
    escalateToHuman,
    clearMessages,
    toggleChat,
    openChat,
    closeChat,
    loadChatHistory,
  };
}; 