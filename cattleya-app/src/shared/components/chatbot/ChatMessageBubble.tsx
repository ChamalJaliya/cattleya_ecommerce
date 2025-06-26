import React from 'react';
import { Bot, User } from 'lucide-react';
import { OrchidAvatar } from './OrchidAvatar';
import ChatProductCards from './ChatProductCards';
import { ProductSearchResult } from '@/core/infrastructure/api/chatbotApi';

interface ChatMessageBubbleProps {
  message: string;
  sender: 'USER' | 'BOT' | 'HUMAN';
  createdAt: Date | string;
  metadata?: {
    products?: ProductSearchResult[];
    productCards?: {
      type: 'product_card';
      data: {
        products: ProductSearchResult[];
        layout: 'grid' | 'list' | 'single' | 'carousel';
        showActions: boolean;
        showPricing: boolean;
        showStock: boolean;
        showRating: boolean;
        showTags: boolean;
      };
    };
  };
}

// Utility function to format message with enhanced styling
const formatMessage = (message: string) => {
  if (typeof message !== 'string') return '';
  // Convert markdown-like formatting to HTML
  let formattedMessage = message
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    // Line breaks
    .replace(/\n/g, '<br />');

  return formattedMessage;
};

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ 
  message, 
  sender, 
  createdAt, 
  metadata 
}) => {
  // Debug log for metadata
  // console.log('[ChatMessageBubble] metadata:', metadata);

  const isUser = sender === 'USER';
  const isBot = sender === 'BOT' || sender === 'HUMAN';
  const time = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedMessage = formatMessage(message);
  const hasProductCards = metadata?.productCards?.type === 'product_card';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white ml-3'
            : 'bg-gradient-to-br from-green-400 to-blue-500 text-white mr-3'
        }`}>
          {isUser ? <User size={20} /> : <OrchidAvatar size={28} />}
        </div>
        <div className={`px-4 py-3 rounded-2xl shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md'
            : 'bg-white/90 text-gray-800 rounded-bl-md border border-gray-100/50'
        }`}>
          <div 
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedMessage }}
          />
          
          {/* Render Product Cards if present */}
          {hasProductCards && metadata.productCards && (
            <div className="mt-4">
              <ChatProductCards
                products={metadata.productCards.data.products}
                layout={metadata.productCards.data.layout}
                showActions={metadata.productCards.data.showActions}
                showPricing={metadata.productCards.data.showPricing}
                showStock={metadata.productCards.data.showStock}
                showRating={metadata.productCards.data.showRating}
                showTags={metadata.productCards.data.showTags}
              />
            </div>
          )}
          
          <span className="text-xs opacity-70 mt-2 block text-right">{time}</span>
        </div>
      </div>
    </div>
  );
}; 