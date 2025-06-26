import React, { useState, useRef, useEffect } from 'react';

import { ChatHeader } from './ChatHeader';
import { ChatMessages } from './ChatMessages';
import { QuickReplies } from './QuickReplies';
import { ChatInput } from './ChatInput';
import { Flower } from 'lucide-react';
import { useChatbot } from '../../hooks/useChatbot';
import { ChatbotWidget } from '../ChatbotWidget';

export const ChatbotWidgetContainer: React.FC<{ sessionId?: string; className?: string }> = ({ sessionId, className = '' }) => {
  const {
    messages,
    isLoading,
    error,
    quickReplies,
    sendMessage,
    loadHistory,
    clearError,
    sessionId: hookSessionId,
  } = useChatbot();

  const [inputMessage, setInputMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-greet when chat opens for the first time
  useEffect(() => {
    if (isOpen && !hasGreeted && messages.length === 0) {
      setHasGreeted(true);
      // Send a greeting message
      sendMessage("Hello! I'm looking for orchids");
    }
  }, [isOpen, hasGreeted, messages.length, sendMessage]);

  // Fallback quick replies if backend doesn't provide any
  const fallbackQuickReplies = [
    '🌸 What orchids do you recommend for beginners?',
    '💧 How do I care for my orchid?',
    '🚚 What\'s your shipping policy?',
    '📦 I need help with my order',
  ];

  const displayQuickReplies = quickReplies.length > 0 ? quickReplies : fallbackQuickReplies;

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

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setMinimized(false);
    }
  };

  const closeChat = () => {
    setIsOpen(false);
    setMinimized(false);
  };

  return (
    <ChatbotWidget
      sessionId={sessionId}
      className={className}
      isOpen={isOpen}
      toggleChat={toggleChat}
      closeChat={closeChat}
      minimized={minimized}
      setMinimized={setMinimized}
    />
  );
}; 