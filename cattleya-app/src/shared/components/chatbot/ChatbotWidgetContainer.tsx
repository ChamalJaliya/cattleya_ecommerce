import React, { useState, useRef, useEffect } from 'react';

import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { QuickReplies } from './QuickReplies';
import { ChatInput } from './ChatInput';
import { Flower } from 'lucide-react';
import { useChatbot } from '../../hooks/useChatbot';

export const ChatbotWidgetContainer: React.FC<{ sessionId?: string; className?: string }> = ({ sessionId, className = '' }) => {
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
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find suggested actions from the latest bot message
  const quickSuggestions = [
    '🌸 What orchids do you recommend for beginners?',
    '💧 How do I care for my orchid?',
    '🚚 What\'s your shipping policy?',
    '📦 I need help with my order',
  ];
  const latestBotMessage = [...(messages || [])].reverse().find(m => m.sender === 'BOT' && m.metadata?.suggestedActions?.length);
  const dynamicSuggestions = latestBotMessage?.metadata?.suggestedActions || quickSuggestions;

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    const message = inputMessage.trim();
    setInputMessage(''); // Clear input immediately
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setInputMessage('');
    await sendMessage(suggestion);
  };

  if (!isOpen && !minimized) {
    return (
      <button
        onClick={toggleChat}
        className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group border-4 border-white absolute bottom-8 right-8"
        style={{ boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4), 0 4px 16px rgba(147, 51, 234, 0.3)' }}
        aria-label="Open chat"
      >
        <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle group-hover:scale-110 transition-transform duration-200"><circle cx="12" cy="12" r="10" /><path d="m21 21-4.35-4.35" /></svg>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <div className={`transition-all duration-500 ease-out ${isOpen && !minimized ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}`}>
        {isOpen && !minimized && (
          <div className="mb-4 w-96 h-[600px] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 flex flex-col overflow-hidden">
            <ChatHeader onMinimize={() => setMinimized(true)} onClose={closeChat} />
            <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
              {messages.length === 0 ? (
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
                <>
                  <ChatMessages messages={messages} isLoading={isLoading} messagesEndRef={messagesEndRef} />
                  {!isLoading && dynamicSuggestions?.length > 0 && (
                    <QuickReplies suggestions={dynamicSuggestions} onClick={handleSuggestionClick} />
                  )}
                </>
              )}
            </div>
            <div className="p-6 bg-white/90 backdrop-blur-sm border-t border-gray-100/50">
              {error && (
                <div className="mb-3 p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
                  ⚠️ {error}
                </div>
              )}
              <ChatInput
                value={inputMessage}
                onChange={setInputMessage}
                onSend={handleSendMessage}
                isLoading={isLoading}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>
        )}
      </div>
      {isOpen && minimized && (
        <div
          className="w-80 bg-gradient-to-r from-blue-500 via-purple-600 to-blue-700 text-white rounded-full shadow-2xl flex items-center justify-between px-6 py-4 absolute bottom-8 right-8 cursor-pointer backdrop-blur-sm"
          onClick={() => setMinimized(false)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bot drop-shadow"><circle cx="12" cy="12" r="10" /><path d="m21 21-4.35-4.35" /></svg>
            </div>
            <div>
              <span className="font-semibold tracking-wide">Cattleya AI</span>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs opacity-80">Online</span>
              </div>
            </div>
          </div>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up opacity-80"><path d="m18 15-6-6-6 6" /></svg>
        </div>
      )}
    </div>
  );
}; 