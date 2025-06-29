import React from 'react';
import { Bot, User } from 'lucide-react';
import { OrchidAvatar } from './OrchidAvatar';
import ChatProductCards from './ChatProductCards';
import { ComprehensiveProductGuide } from './ComprehensiveProductGuide';
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
    hasDetailedInfo?: boolean;
    response_type?: string;
    products_found?: number;
  };
}

const formatMessage = (message: string): string => {
  // Convert markdown-style formatting to HTML
  return message
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>')
    .replace(/🌸/g, '<span class="text-pink-500">🌸</span>')
    .replace(/💰/g, '<span class="text-green-500">💰</span>')
    .replace(/📦/g, '<span class="text-blue-500">📦</span>')
    .replace(/🌿/g, '<span class="text-green-600">🌿</span>')
    .replace(/💡/g, '<span class="text-yellow-500">💡</span>')
    .replace(/🛒/g, '<span class="text-blue-600">🛒</span>')
    .replace(/❤️/g, '<span class="text-red-500">❤️</span>')
    .replace(/📋/g, '<span class="text-gray-600">📋</span>')
    .replace(/🔍/g, '<span class="text-purple-500">🔍</span>');
};

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ 
  message, 
  sender, 
  createdAt, 
  metadata 
}) => {
  // Debug log for metadata
  console.log('[ChatMessageBubble] metadata:', metadata);
  console.log('[ChatMessageBubble] hasProductCards:', metadata?.productCards?.type === 'product_card');
  console.log('[ChatMessageBubble] products:', metadata?.productCards?.data?.products);

  const isUser = sender === 'USER';
  const isBot = sender === 'BOT' || sender === 'HUMAN';
  const time = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedMessage = formatMessage(message);
  const hasProductCards = metadata?.productCards?.type === 'product_card';
  const hasProducts = metadata?.products && metadata.products.length > 0;
  const hasDetailedInfo = metadata?.hasDetailedInfo;
  const responseType = metadata?.response_type;
  const productsFound = metadata?.products_found || 0;

  // Determine layout based on response type and number of products
  const getLayout = (): 'grid' | 'list' | 'single' | 'carousel' => {
    if (responseType === 'detailed_product_response') return 'single';
    if (productsFound === 1) return 'single';
    if (productsFound <= 3) return 'grid';
    return 'carousel';
  };

  const getProducts = (): ProductSearchResult[] => {
    if (hasProductCards && metadata?.productCards?.data?.products) {
      return metadata.productCards.data.products;
    }
    if (hasProducts && metadata?.products) {
      return metadata.products;
    }
    return [];
  };

  const products = getProducts();

  // Handle cart and wishlist actions
  const handleAddToCart = (product: ProductSearchResult) => {
    // TODO: Implement add to cart functionality
    console.log('Add to cart:', product.name);
  };

  const handleAddToWishlist = (product: ProductSearchResult) => {
    // TODO: Implement add to wishlist functionality
    console.log('Add to wishlist:', product.name);
  };

  const handleGetSimilar = (product: ProductSearchResult) => {
    // TODO: Implement get similar products functionality
    console.log('Get similar:', product.name);
  };

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
          
          {/* Render Comprehensive Guide for detailed responses */}
          {hasDetailedInfo && products.length === 1 && (
            <div className="mt-4">
              <ComprehensiveProductGuide
                product={products[0]}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
                onGetSimilar={handleGetSimilar}
              />
            </div>
          )}
          
          {/* Render Product Cards for summary responses */}
          {(hasProductCards || hasProducts) && products.length > 0 && !hasDetailedInfo && (
            <div className="mt-4">
              <ChatProductCards
                products={products}
                layout={getLayout()}
                showActions={metadata?.productCards?.data?.showActions ?? true}
                showPricing={metadata?.productCards?.data?.showPricing ?? true}
                showStock={metadata?.productCards?.data?.showStock ?? true}
                showRating={metadata?.productCards?.data?.showRating ?? false}
                showTags={metadata?.productCards?.data?.showTags ?? true}
              />
            </div>
          )}
          
          <span className="text-xs opacity-70 mt-2 block text-right">{time}</span>
        </div>
      </div>
    </div>
  );
}; 