import React from 'react';
import { ChatMessageBubble } from './ChatMessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { Bot } from 'lucide-react';

interface ChatMessagesProps {
  messages: any[];
  isLoading: boolean;
  messagesEndRef?: React.RefObject<HTMLDivElement | null>;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading, messagesEndRef }) => {
  const safeMessages = Array.isArray(messages) ? messages : [];
  return (
    <div className="space-y-4">
      {safeMessages.map((msg) => (
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
      {messagesEndRef && <div ref={messagesEndRef} />}
    </div>
  );
}; 