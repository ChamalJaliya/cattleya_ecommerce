'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatbot } from '../hooks/useChatbot';
import { ChatMessage } from '../../core/infrastructure/api/chatbotApi';
import { useAuthStore } from '../../core/application/stores/useAuthStore';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Minus,
  Sparkles,
  Flower,
} from 'lucide-react';
import { ChatMessageBubble } from './chatbot/ChatMessageBubble';
import { QuickReplies } from './chatbot/QuickReplies';
import { TypingIndicator } from './chatbot/TypingIndicator';

interface ChatbotWidgetProps {
  sessionId?: string;
  className?: string;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  sessionId,
  className = '',
}) => {
  const { user } = useAuthStore();
  const {
    messages,
    isLoading,
    error,
    isOpen,
    sendMessage,
    toggleChat,
    closeChat,
  } = useChatbot(sessionId);

  const [inputMessage, setInputMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ensure messages is always an array
  const safeMessages = messages || [];

  // Debug logging
  console.log('ChatbotWidget render:', { 
    user: user?.id,
    messagesLength: safeMessages.length,
    isOpen,
    isLoading,
    error 
  });

  // Don't render if no user
  if (!user) {
    console.log('ChatbotWidget: No user, not rendering');
    return null;
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [safeMessages, isLoading]);

  useEffect(() => {
    if (isOpen && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, minimized]);

  const quickSuggestions = [
    '🌸 What orchids do you recommend for beginners?',
    '💧 How do I care for my orchid?',
    '🚚 What\'s your shipping policy?',
    '📦 I need help with my order',
  ];

  // Find suggested actions from the latest bot message
  const latestBotMessage = [...(safeMessages || [])].reverse().find(m => m.sender === 'BOT' && m.metadata?.suggestedActions?.length);
  const dynamicSuggestions = latestBotMessage?.metadata?.suggestedActions || quickSuggestions;

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    const message = inputMessage.trim();
    setInputMessage('');
    setShowSuggestions(false);
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
    await sendMessage(suggestion);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.sender === 'USER';
    const isBot = message.sender === 'BOT';
    
    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`flex max-w-[85%] ${
            isUser ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
              isUser
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white ml-3'
                : 'bg-gradient-to-br from-green-400 to-blue-500 text-white'
            }`}
          >
            {isUser ? <User size={20} /> : <Bot size={20} />}
          </div>
          
          <div
            className={`px-4 py-3 rounded-2xl shadow-lg ${
              isUser
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md'
                : 'bg-white/90 text-gray-800 rounded-bl-md border border-gray-100/50'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.message}
            </p>
            <span className="text-xs opacity-70 mt-2 block text-right">
              {formatTime(message.createdAt)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div 
        className={`transition-all duration-500 ease-out ${
          isOpen && !minimized 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        } ${className}`}
      >
        {isOpen && !minimized && (
          <div className="mb-4 w-96 h-[600px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 flex flex-col overflow-hidden">
            <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl">
                  <div className="relative">
                    <Bot size={28} className="drop-shadow-lg" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-xl tracking-wide flex items-center gap-2">
                    <Flower size={20} className="text-yellow-300" />
                    Cattleya AI
                    <Sparkles size={16} className="text-yellow-300 animate-pulse" />
                  </h3>
                  <p className="text-sm opacity-90 font-medium">Your Orchid Concierge</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMinimized(true)}
                  className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
                >
                  <Minus size={20} />
                </button>
                <button
                  onClick={closeChat}
                  className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
              {!safeMessages || safeMessages.length === 0 ? (
                <div className="text-center text-gray-600 py-12">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Flower size={32} className="text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg mb-3 text-gray-800">Welcome to Cattleya!</h3>
                  <p className="text-sm mb-6 text-gray-600 max-w-xs mx-auto">
                    I'm here to help you discover the perfect orchids and answer all your questions.
                  </p>
                  <QuickReplies suggestions={quickSuggestions} onClick={handleSuggestionClick} />
                </div>
              ) : (
                <div className="space-y-4">
                  {safeMessages?.map((msg) => (
                    <ChatMessageBubble
                      key={msg.id}
                      message={msg.message}
                      sender={msg.sender}
                      createdAt={msg.createdAt}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex justify-start mb-4">
                      <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl rounded-bl-md border border-gray-100/50 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                          <Bot size={16} className="text-white" />
                        </div>
                        <TypingIndicator />
                      </div>
                    </div>
                  )}
                  {/* Show dynamic quick replies only if available and not loading */}
                  {!isLoading && dynamicSuggestions?.length > 0 && (
                    <QuickReplies suggestions={dynamicSuggestions} onClick={handleSuggestionClick} />
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="p-6 bg-white/90 backdrop-blur-sm border-t border-gray-100/50">
              {error && (
                <div className="mb-3 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
                  ⚠️ {error}
                </div>
              )}
              
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about orchids..."
                    className="w-full px-4 py-3 border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-transparent bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200"
                    disabled={isLoading}
                  />
                </div>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <button
        onClick={() => {
          if (isOpen && minimized) setMinimized(false);
          else toggleChat();
        }}
        className={`w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group border-4 border-white absolute bottom-0 right-0 ${
          isOpen && !minimized ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{ 
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4), 0 4px 16px rgba(147, 51, 234, 0.3)'
        }}
        aria-label="Open chat"
      >
        <MessageCircle size={28} className="group-hover:scale-110 transition-transform duration-200" />
      </button>
      
      {isOpen && minimized && (
        <div 
          className="w-80 bg-gradient-to-r from-blue-500 via-purple-600 to-blue-700 text-white rounded-full shadow-2xl flex items-center justify-between px-6 py-4 absolute bottom-0 right-0 cursor-pointer backdrop-blur-sm"
          onClick={() => setMinimized(false)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot size={20} className="drop-shadow" />
            </div>
            <div>
              <span className="font-semibold tracking-wide">Cattleya AI</span>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs opacity-80">Online</span>
              </div>
            </div>
          </div>
          <ChevronUp size={20} className="opacity-80" />
        </div>
      )}
    </div>
  );
}; 