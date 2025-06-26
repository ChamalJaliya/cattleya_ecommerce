import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';
import { ChatMessage, CreateChatMessageDto, ChatResponse } from '../../domain/entities/chat-message.entity';
import { KnowledgeGraphService } from './knowledge-graph.service';
import { ChatMessageRepository } from '../../infrastructure/repositories/chat-message.repository';
import { ProductIntelligenceService, ProductSearchResult } from './product-intelligence.service';
import { getCategoryFromQuery } from './nlp-utils';

export interface ChatbotResponse {
  message: string;
  quickReplies?: string[];
  metadata?: {
    products?: ProductSearchResult[];
    recommendations?: any;
    intent?: string;
    confidence?: number;
    escalated?: boolean;
    suggestedActions?: string[];
  };
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private knowledgeGraphService: KnowledgeGraphService,
    private chatMessageRepository: ChatMessageRepository,
    private productIntelligenceService: ProductIntelligenceService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('app.openai.apiKey'),
    });
  }

  async processMessage(userId: string, message: string, sessionId?: string, context?: any): Promise<ChatbotResponse> {
    try {
      this.logger.debug(`Processing message: "${message}" for session: ${sessionId}`);

      // 1. Quick Reply Actions
      const quickReplyKey = message.trim().toLowerCase();
      const quickReplyActions = {
        'show more products': async () => {
          this.logger.debug('[QUICKREPLY] Show more products triggered');
          // Use last context or default to general search
          const lastQuery = context?.lastQuery || 'orchid';
          const results = await this.productIntelligenceService.searchProducts(lastQuery, 10);
          return {
            message: this.formatProductSearchResults(results),
            quickReplies: ['Search products', 'Get recommendations', 'Browse categories'],
            metadata: { products: results, intent: 'product_search' },
          };
        },
        'search products': async () => {
          this.logger.debug('[QUICKREPLY] Search products triggered');
          return {
            message: 'What kind of orchid or product are you looking for? You can search by name, color, or type!',
            quickReplies: ['Beginner orchids', 'Rare orchids', 'Featured orchids', 'Get recommendations'],
            metadata: { intent: 'product_search' },
          };
        },
        'get recommendations': async () => {
          this.logger.debug('[QUICKREPLY] Get recommendations triggered');
          const recommendations = await this.productIntelligenceService.getRecommendations('featured');
          return {
            message: this.formatRecommendations(recommendations),
            quickReplies: ['Show more recommendations', 'Search products', 'Browse categories'],
            metadata: { recommendations, intent: 'product_recommendation' },
          };
        },
        'beginner orchids': async () => {
          this.logger.debug('[QUICKREPLY] Beginner orchids triggered');
          const recommendations = await this.productIntelligenceService.getRecommendations('beginner');
          return {
            message: this.formatRecommendations(recommendations),
            quickReplies: ['Show more recommendations', 'Search products', 'Browse categories'],
            metadata: { recommendations, intent: 'product_recommendation' },
          };
        },
        'rare orchids': async () => {
          this.logger.debug('[QUICKREPLY] Rare orchids triggered');
          const recommendations = await this.productIntelligenceService.getRecommendations('rare');
          return {
            message: this.formatRecommendations(recommendations),
            quickReplies: ['Show more recommendations', 'Search products', 'Browse categories'],
            metadata: { recommendations, intent: 'product_recommendation' },
          };
        },
        'featured orchids': async () => {
          this.logger.debug('[QUICKREPLY] Featured orchids triggered');
          const recommendations = await this.productIntelligenceService.getRecommendations('featured');
          return {
            message: this.formatRecommendations(recommendations),
            quickReplies: ['Show more recommendations', 'Search products', 'Browse categories'],
            metadata: { recommendations, intent: 'product_recommendation' },
          };
        },
      };
      if (quickReplyActions[quickReplyKey]) {
        return await quickReplyActions[quickReplyKey]();
      }

      // 2. Category/type queries using synonyms
      const categoryType = getCategoryFromQuery(message);
      if (categoryType) {
        this.logger.debug(`[INTENT] Detected category/type: ${categoryType} for message: "${message}"`);
        const recommendations = await this.productIntelligenceService.getRecommendations(categoryType);
        return {
          message: this.formatRecommendations(recommendations),
          quickReplies: ['Show more recommendations', 'Search products', 'Browse categories'],
          metadata: { recommendations, intent: 'product_recommendation' },
        };
      }

      // 3. PRODUCT/ENTITY EXTRACTION (robust)
      // Get all product names for entity extraction
      const allProductsResult = await this.productIntelligenceService.productRepository.findAll({}, {}, { page: 1, limit: 1000 });
      const allProductNames = allProductsResult.products.map(p => p.name);
      const { extractProductNames } = await import('./nlp-utils');
      const extractedNames = extractProductNames(message, allProductNames);
      this.logger.debug(`[NLP-ENTITY] Extracted product names: ${JSON.stringify(extractedNames)}`);
      if (extractedNames.length > 0) {
        this.logger.debug(`[NLP-ENTITY] Message contains product/entity: ${JSON.stringify(extractedNames)}. Treating as product inquiry.`);
        // Treat as product inquiry
        const intent = 'product_inquiry';
        const productResponse = await this.handleProductQuery(message, intent, userId, sessionId);
        // Save the conversation
        await this.chatMessageRepository.create({
          userId,
          sessionId: sessionId || 'default',
          message,
          sender: 'USER',
          metadata: { intent, products: productResponse.metadata?.products },
        });
        await this.chatMessageRepository.create({
          userId,
          sessionId: sessionId || 'default',
          message: productResponse.message,
          sender: 'BOT',
          metadata: { intent, products: productResponse.metadata?.products },
        });
        return productResponse;
      }

      // 4. Product-related query by keywords
      if (this.isProductQuery(message)) {
        const intent = this.analyzeProductIntent(message);
        this.logger.debug(`[INTENT] Detected product intent: ${intent} for message: "${message}"`);
        const productResponse = await this.handleProductQuery(message, intent, userId, sessionId);
        this.logger.debug(`[PRODUCT] Product response: ${JSON.stringify(productResponse)}`);
        // Save the conversation
        await this.chatMessageRepository.create({
          userId,
          sessionId: sessionId || 'default',
          message,
          sender: 'USER',
          metadata: { intent, products: productResponse.metadata?.products },
        });
        await this.chatMessageRepository.create({
          userId,
          sessionId: sessionId || 'default',
          message: productResponse.message,
          sender: 'BOT',
          metadata: { intent, products: productResponse.metadata?.products },
        });
        return productResponse;
      }

      // Check if message is out of scope
      if (this.knowledgeGraphService.isOutOfScope(message)) {
        const outOfScopeTemplate = this.knowledgeGraphService.getConversationTemplates()
          .find(t => t.id === 'out-of-scope');
        
        return {
          message: outOfScopeTemplate?.response || 'I\'m here to help with orchids and Cattleya Orchids services. How can I assist you with our beautiful orchid collection?',
          metadata: {
            intent: 'out_of_scope',
            confidence: 0.9,
            escalated: false,
            suggestedActions: outOfScopeTemplate?.quickReplies || []
          },
        };
      }

      // Check for conversation templates first
      const matchingTemplate = this.knowledgeGraphService.findMatchingTemplate(message);
      if (matchingTemplate) {
        return {
          message: matchingTemplate.response,
          metadata: {
            intent: matchingTemplate.type,
            confidence: 0.8,
            escalated: false,
            suggestedActions: matchingTemplate.quickReplies || []
          },
        };
      }

      // Get conversation history for context
      const conversationHistory = await this.getConversationHistory(userId, sessionId);
      
      // Find relevant knowledge nodes
      const relevantNodes = this.knowledgeGraphService.findRelevantNodes(message);
      
      // Create enhanced system prompt
      const systemPrompt = this.createEnhancedSystemPrompt(relevantNodes);
      
      // Prepare messages for OpenAI
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: (msg.sender === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: msg.message
        })),
        { role: 'user', content: message }
      ];

      // Get response from OpenAI
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const botResponse = completion.choices[0]?.message?.content || 'I apologize, but I\'m having trouble processing your request right now.';

      // Analyze intent and determine if escalation is needed
      const intent = await this.analyzeIntent(message);
      const shouldEscalate = this.shouldEscalateToHuman(intent, botResponse);

      // Get context-appropriate quick replies
      const quickReplies = this.knowledgeGraphService.getQuickRepliesForContext(intent.intent);

      // Save the conversation
      await this.chatMessageRepository.create({
        userId,
        sessionId: sessionId || 'default',
        message,
        sender: 'USER',
        metadata: { intent: intent.intent, confidence: intent.confidence },
      });

      await this.chatMessageRepository.create({
        userId,
        sessionId: sessionId || 'default',
        message: botResponse,
        sender: 'BOT',
        metadata: { intent: intent.intent, confidence: intent.confidence },
      });

      return {
        message: botResponse,
        metadata: {
          intent: intent.intent,
          confidence: intent.confidence,
          escalated: shouldEscalate,
          suggestedActions: quickReplies,
        },
      };
    } catch (error) {
      this.logger.error('Error processing chat message:', error);
      return {
        message: 'I apologize, but I\'m experiencing technical difficulties. Please try again later or contact our support team.',
        metadata: {
          intent: 'error',
          confidence: 0,
          escalated: true,
          suggestedActions: ['Contact support', 'Try again later']
        },
      };
    }
  }

  private isProductQuery(message: string): boolean {
    const productKeywords = [
      'product', 'orchid', 'flower', 'plant', 'price', 'cost', 'stock', 'available',
      'search', 'find', 'recommend', 'suggestion', 'category', 'type', 'variety',
      'phalaenopsis', 'cattleya', 'dendrobium', 'oncidium', 'cymbidium', 'vanda',
      'how much', 'buy', 'purchase', 'order'
    ];
    
    const lowerMessage = message.toLowerCase();
    return productKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private analyzeProductIntent(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('look for')) {
      return 'product_search';
    }
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
      return 'product_price';
    }
    if (lowerMessage.includes('stock') || lowerMessage.includes('available') || lowerMessage.includes('in stock')) {
      return 'product_stock';
    }
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggestion') || lowerMessage.includes('best')) {
      return 'product_recommendation';
    }
    if (lowerMessage.includes('category') || lowerMessage.includes('type') || lowerMessage.includes('variety')) {
      return 'product_category';
    }
    return 'product_general';
  }

  private async handleProductQuery(message: string, intent: string, userId?: string, sessionId?: string): Promise<ChatbotResponse> {
    const lowerMessage = message.toLowerCase();
    let response = '';
    let quickReplies: string[] = [];
    let metadata: any = {};

    try {
      this.logger.debug(`[PRODUCT] Handling product query. Intent: ${intent}, Message: "${message}"`);
      
      // Check if message contains product names, if not, try to get from conversation context
      let searchQuery = message;
      let productsFromContext: ProductSearchResult[] = [];
      
      if (!this.containsProductName(message)) {
        this.logger.debug(`[CONTEXT] No product name in message, checking conversation history`);
        if (userId && sessionId) {
          const contextProducts = await this.getProductsFromConversationContext(userId, sessionId);
          if (contextProducts.length > 0) {
            searchQuery = contextProducts.map(p => p.name).join(' ');
            productsFromContext = contextProducts;
            this.logger.debug(`[CONTEXT] Found products from conversation: ${JSON.stringify(contextProducts.map(p => p.name))}`);
          }
        }
      }

      switch (intent) {
        case 'product_search':
          const searchResults = await this.productIntelligenceService.searchProducts(searchQuery, 3);
          this.logger.debug(`[PRODUCT] Search results: ${JSON.stringify(searchResults.map(p => p.name))}`);
          if (searchResults.length > 0) {
            response = this.formatProductSearchResults(searchResults);
            quickReplies = ['Show more products', 'Search by category', 'Get recommendations'];
            metadata = { products: searchResults, intent: 'product_search' };
          } else {
            response = '🌸 I couldn\'t find any orchids matching your search. Try searching by color, size, or category!';
            quickReplies = ['Browse categories', 'Get recommendations', 'Contact support'];
          }
          break;
        case 'product_recommendation':
          const recommendationType = this.extractRecommendationType(message);
          const recommendations = await this.productIntelligenceService.getRecommendations(recommendationType);
          this.logger.debug(`[PRODUCT] Recommendations: ${JSON.stringify(recommendations.products.map(p => p.name))}`);
          if (recommendations.products.length > 0) {
            response = this.formatRecommendations(recommendations);
            quickReplies = ['Show more recommendations', 'Search products', 'Browse categories'];
            metadata = { recommendations, intent: 'product_recommendation' };
          } else {
            response = '🌸 I\'m having trouble loading recommendations right now, but I\'d love to help you discover our featured orchids!';
            quickReplies = ['Featured products', 'Search products', 'Browse categories'];
          }
          break;
        case 'product_price':
          let priceProducts = productsFromContext.length > 0 ? productsFromContext : await this.productIntelligenceService.searchProducts(searchQuery, 3);
          this.logger.debug(`[PRODUCT] Price search results: ${JSON.stringify(priceProducts.map(p => p.name))}`);
          if (priceProducts.length > 0) {
            response = this.formatProductPrices(priceProducts);
            quickReplies = ['Show more products', 'Search by price range', 'Get recommendations'];
            metadata = { products: priceProducts, intent: 'product_price' };
          } else {
            response = '🌸 I couldn\'t find specific pricing information, but I\'d be happy to help you explore our orchid collection!';
            quickReplies = ['Price ranges', 'Search products', 'Contact sales'];
          }
          break;
        case 'product_stock':
          let stockProducts = productsFromContext.length > 0 ? productsFromContext : await this.productIntelligenceService.searchProducts(searchQuery, 3);
          this.logger.debug(`[PRODUCT] Stock search results: ${JSON.stringify(stockProducts.map(p => p.name))}`);
          if (stockProducts.length > 0) {
            response = this.formatStockStatus(stockProducts);
            quickReplies = ['Check other products', 'Search products', 'Get notifications'];
            metadata = { products: stockProducts, intent: 'product_stock' };
          } else {
            response = '🌸 I couldn\'t find stock information for that orchid, but I\'d love to help you find similar beauties!';
            quickReplies = ['Search products', 'Contact sales', 'Get recommendations'];
          }
          break;
        case 'product_category':
          const categoryProducts = await this.productIntelligenceService.searchProducts(searchQuery, 5);
          this.logger.debug(`[PRODUCT] Category search results: ${JSON.stringify(categoryProducts.map(p => p.name))}`);
          if (categoryProducts.length > 0) {
            response = this.formatCategoryProducts(categoryProducts);
            quickReplies = ['Show more in this category', 'Browse other categories', 'Get recommendations'];
            metadata = { products: categoryProducts, intent: 'product_category' };
          } else {
            response = '🌸 I couldn\'t find products in that category, but I\'d love to show you our other beautiful orchid collections!';
            quickReplies = ['Browse categories', 'Search products', 'Get recommendations'];
          }
          break;
        default:
          // General product query
          let generalProducts = productsFromContext.length > 0 ? productsFromContext : await this.productIntelligenceService.searchProducts(searchQuery, 3);
          this.logger.debug(`[PRODUCT] General product search results: ${JSON.stringify(generalProducts.map(p => p.name))}`);
          if (generalProducts.length > 0) {
            response = this.formatGeneralProductInfo(generalProducts);
            quickReplies = ['Show more products', 'Search products', 'Get recommendations'];
            metadata = { products: generalProducts, intent: 'product_general' };
          } else {
            response = '🌸 I\'d be happy to help you find the perfect orchid! Try asking about a specific type, color, or care need.';
            quickReplies = ['Beginner orchids', 'Rare orchids', 'Featured orchids', 'Search products'];
          }
          break;
      }
    } catch (error) {
      this.logger.error('Error handling product query:', error);
      response = 'I\'m having trouble accessing our product information right now. Please try again in a moment or contact our support team.';
      quickReplies = ['Contact support', 'Try again', 'Browse website'];
    }

    return { message: response, quickReplies, metadata };
  }

  private extractRecommendationType(message: string): 'beginner' | 'rare' | 'featured' | 'best_seller' | 'new_arrival' {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('beginner') || lowerMessage.includes('easy') || lowerMessage.includes('first time')) {
      return 'beginner';
    }
    if (lowerMessage.includes('rare') || lowerMessage.includes('exotic') || lowerMessage.includes('unique')) {
      return 'rare';
    }
    if (lowerMessage.includes('featured') || lowerMessage.includes('special') || lowerMessage.includes('highlighted')) {
      return 'featured';
    }
    if (lowerMessage.includes('best') || lowerMessage.includes('popular') || lowerMessage.includes('favorite')) {
      return 'best_seller';
    }
    if (lowerMessage.includes('new') || lowerMessage.includes('latest') || lowerMessage.includes('recent')) {
      return 'new_arrival';
    }
    
    return 'featured'; // Default
  }

  private formatProductSearchResults(products: ProductSearchResult[]): string {
    if (products.length === 0) return '🌸 I couldn\'t find any orchids matching your search. Let me help you discover something beautiful instead!';
    
    let response = `✨ I found ${products.length} stunning orchid${products.length > 1 ? 's' : ''} that might be perfect for you:\n\n`;
    
    products.forEach((product, index) => {
      const price = product.isOnSale && product.salePrice 
        ? `💚 **$${product.salePrice}** ~~$${product.basePrice}~~ *On Sale!*`
        : `💚 **$${product.basePrice}**`;
      
      const stockStatus = product.stockQuantity > 0 
        ? product.stockQuantity <= 5 
          ? '🔥 *Limited Stock*' 
          : '✅ *In Stock*'
        : '❌ *Out of Stock*';
      
      const emoji = this.getProductEmoji(product.name, product.category.name);
      
      response += `${index + 1}. ${emoji} **${product.name}**\n`;
      response += `   💰 ${price}\n`;
      response += `   📦 ${stockStatus}\n`;
      response += `   🌿 ${product.category.name}\n`;
      if (product.shortDescription) {
        response += `   💭 *"${product.shortDescription}"*\n`;
      }
      if (product.averageRating > 0) {
        const stars = '⭐'.repeat(Math.round(product.averageRating));
        response += `   ${stars} (${product.averageRating.toFixed(1)}/5)\n`;
      }
      response += '\n';
    });
    
    response += '💡 *Would you like me to show you more details about any of these beauties?*';
    
    return response;
  }

  private formatRecommendations(recommendations: any): string {
    if (recommendations.products.length === 0) return '🌸 I\'m having trouble loading recommendations right now, but I\'d love to help you discover our featured orchids!';
    
    let response = `🌟 **${recommendations.reason}**\n\n`;
    
    recommendations.products.forEach((product: ProductSearchResult, index: number) => {
      const price = product.isOnSale && product.salePrice 
        ? `💚 **$${product.salePrice}** ~~$${product.basePrice}~~ *Special Offer!*`
        : `💚 **$${product.basePrice}**`;
      
      const emoji = this.getProductEmoji(product.name, product.category.name);
      
      response += `${index + 1}. ${emoji} **${product.name}**\n`;
      response += `   💰 ${price}\n`;
      response += `   🌿 ${product.category.name}\n`;
      if (product.shortDescription) {
        response += `   💭 *"${product.shortDescription}"*\n`;
      }
      if (product.isFeatured) {
        response += `   ⭐ *Featured Selection*\n`;
      }
      response += '\n';
    });
    
    response += '💫 *These orchids are carefully selected for their beauty and quality. Which one catches your eye?*';
    
    return response;
  }

  private formatProductPrices(products: ProductSearchResult[]): string {
    if (products.length === 0) return '🌸 I couldn\'t find specific pricing information, but I\'d be happy to help you explore our orchid collection!';
    
    let response = '💰 **Current Orchid Prices** 💰\n\n';
    
    products.forEach((product, index) => {
      const price = product.isOnSale && product.salePrice 
        ? `💚 **$${product.salePrice}** ~~$${product.basePrice}~~ *Save $${(product.basePrice - product.salePrice).toFixed(2)}!*`
        : `💚 **$${product.basePrice}**`;
      
      const emoji = this.getProductEmoji(product.name, product.category.name);
      
      response += `${index + 1}. ${emoji} **${product.name}**: ${price}\n`;
    });
    
    response += '\n💡 *All prices include our expert care instructions and support!*';
    
    return response;
  }

  private formatStockStatus(products: ProductSearchResult[]): string {
    if (products.length === 0) return '🌸 I couldn\'t find stock information for that orchid, but I\'d love to help you find similar beauties!';
    
    let response = '📦 **Current Stock Status** 📦\n\n';
    
    products.forEach((product, index) => {
      let stockStatus = '';
      if (product.stockQuantity === 0) {
        stockStatus = '❌ *Out of Stock* - But we can notify you when it\'s back!';
      } else if (product.stockQuantity <= 5) {
        stockStatus = `🔥 *Limited Stock* - Only ${product.stockQuantity} left!`;
      } else {
        stockStatus = `✅ *In Stock* - ${product.stockQuantity} available`;
      }
      
      const emoji = this.getProductEmoji(product.name, product.category.name);
      
      response += `${index + 1}. ${emoji} **${product.name}**: ${stockStatus}\n`;
    });
    
    response += '\n💡 *Limited stock items sell quickly - don\'t miss out on these beauties!*';
    
    return response;
  }

  private formatCategoryProducts(products: ProductSearchResult[]): string {
    if (products.length === 0) return '🌸 I couldn\'t find products in that category, but I\'d love to show you our other beautiful orchid collections!';
    
    const categoryName = products[0]?.category?.name || 'this category';
    let response = `🌿 **${categoryName} Collection** 🌿\n\n`;
    
    products.forEach((product, index) => {
      const price = product.isOnSale && product.salePrice 
        ? `💚 **$${product.salePrice}** ~~$${product.basePrice}~~ *Special Price!*`
        : `💚 **$${product.basePrice}**`;
      
      const emoji = this.getProductEmoji(product.name, product.category.name);
      
      response += `${index + 1}. ${emoji} **${product.name}**\n`;
      response += `   💰 ${price}\n`;
      if (product.shortDescription) {
        response += `   💭 *"${product.shortDescription}"*\n`;
      }
      response += '\n';
    });
    
    response += '💫 *Each orchid in this collection has been carefully selected for its unique beauty and charm!*';
    
    return response;
  }

  private formatGeneralProductInfo(products: ProductSearchResult[]): string {
    if (products.length === 0) return '🌸 I\'d be happy to help you find the perfect orchid! What type of orchid are you looking for, or would you like some recommendations?';
    
    let response = '✨ **Here\'s what I found for you** ✨\n\n';
    
    products.forEach((product, index) => {
      const price = product.isOnSale && product.salePrice 
        ? `💚 **$${product.salePrice}** ~~$${product.basePrice}~~ *Special Offer!*`
        : `💚 **$${product.basePrice}**`;
      
      const emoji = this.getProductEmoji(product.name, product.category.name);
      
      response += `${index + 1}. ${emoji} **${product.name}**\n`;
      response += `   💰 ${price}\n`;
      response += `   🌿 ${product.category.name}\n`;
      if (product.shortDescription) {
        response += `   💭 *"${product.shortDescription}"*\n`;
      }
      if (product.isFeatured) {
        response += `   ⭐ *Featured Selection*\n`;
      }
      response += '\n';
    });
    
    response += '💡 *Each orchid tells a story of beauty and elegance. Which one speaks to your heart?*';
    
    return response;
  }

  private getProductEmoji(name: string, category: string): string {
    const lowerName = name.toLowerCase();
    const lowerCategory = category.toLowerCase();
    
    // Phalaenopsis
    if (lowerName.includes('phalaenopsis') || lowerName.includes('moth')) return '🦋';
    
    // Cattleya
    if (lowerName.includes('cattleya') || lowerName.includes('corsage')) return '👑';
    
    // Dendrobium
    if (lowerName.includes('dendrobium')) return '🌺';
    
    // Vanda
    if (lowerName.includes('vanda')) return '💎';
    
    // Oncidium
    if (lowerName.includes('oncidium') || lowerName.includes('dancing')) return '💃';
    
    // Cymbidium
    if (lowerName.includes('cymbidium')) return '🏮';
    
    // Colors
    if (lowerName.includes('white') || lowerName.includes('snow')) return '❄️';
    if (lowerName.includes('pink') || lowerName.includes('rose')) return '🌸';
    if (lowerName.includes('purple') || lowerName.includes('violet')) return '💜';
    if (lowerName.includes('yellow') || lowerName.includes('gold')) return '🌻';
    if (lowerName.includes('red') || lowerName.includes('crimson')) return '🌹';
    if (lowerName.includes('blue') || lowerName.includes('azure')) return '🔵';
    if (lowerName.includes('black') || lowerName.includes('dark')) return '🖤';
    
    // Special types
    if (lowerName.includes('rare') || lowerName.includes('exotic')) return '🌟';
    if (lowerName.includes('mini') || lowerName.includes('small')) return '🌱';
    if (lowerName.includes('giant') || lowerName.includes('large')) return '🌳';
    if (lowerName.includes('fragrant') || lowerName.includes('scented')) return '🌺';
    
    // Default based on category
    if (lowerCategory.includes('beginner')) return '🌱';
    if (lowerCategory.includes('rare')) return '💎';
    if (lowerCategory.includes('featured')) return '⭐';
    
    return '🌸'; // Default orchid emoji
  }

  private createEnhancedSystemPrompt(relevantNodes: any[]): string {
    const cattleyaProfile = this.knowledgeGraphService.getCattleyaProfile();
    const config = this.knowledgeGraphService.getChatbotConfig();
    
    let knowledgeContext = '';
    if (relevantNodes.length > 0) {
      knowledgeContext = '\n\nRelevant Knowledge:\n' + relevantNodes.map(node => 
        `${node.title}: ${node.content}`
      ).join('\n\n');
    }

    return `You are Cattleya, the AI assistant for ${cattleyaProfile.companyName}. You are knowledgeable, friendly, and focused on helping customers with orchids and our services.

COMPANY PROFILE:
- Name: ${cattleyaProfile.companyName}
- Description: ${cattleyaProfile.description}
- Location: ${cattleyaProfile.location.address}, ${cattleyaProfile.location.city}, ${cattleyaProfile.location.state} ${cattleyaProfile.location.postalCode}
- Phone: ${cattleyaProfile.contact.phone}
- Email: ${cattleyaProfile.contact.email}
- Support: ${cattleyaProfile.contact.supportEmail}
- Website: ${cattleyaProfile.contact.website}

BUSINESS HOURS:
${Object.entries(cattleyaProfile.businessHours).map(([day, hours]) => `${day}: ${hours}`).join('\n')}

SPECIALTIES:
${cattleyaProfile.specialties.join(', ')}

POLICIES:
- Shipping: ${cattleyaProfile.policies.shipping}
- Returns: ${cattleyaProfile.policies.returns}
- Warranty: ${cattleyaProfile.policies.warranty}

CONVERSATION GUIDELINES:
1. Stay focused on orchids, gardening, and Cattleya Orchids services
2. Be warm, knowledgeable, and helpful
3. Use botanical terminology appropriately
4. If asked about non-orchid topics, politely redirect to orchid-related subjects
5. Always provide accurate information based on the knowledge provided
6. Keep responses concise but informative
7. If unsure about something, suggest contacting human support
8. Use a friendly, botanical tone

${knowledgeContext}

Remember: You are Cattleya, the orchid expert. Help customers discover the perfect orchids and provide excellent care guidance.`;
  }

  private async analyzeIntent(message: string): Promise<{ intent: string; confidence: number }> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Analyze the user's message and classify it into one of these intents:
- greeting: Hello, hi, hey, start conversation
- product_inquiry: Questions about orchids, varieties, care, pricing, availability
- order_support: Order tracking, status, delivery, returns, shipping
- care_advice: Orchid care, watering, lighting, repotting, problems
- company_info: About Cattleya, location, contact, business hours
- technical_support: Website issues, account problems, payment issues
- out_of_scope: Topics unrelated to orchids or Cattleya services

Return only the intent name and confidence score (0-1).`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 50,
        temperature: 0.1,
      });

      const response = completion.choices[0]?.message?.content || 'general:0.5';
      const [intent, confidenceStr] = response.split(':');
      const confidence = parseFloat(confidenceStr) || 0.5;

      return { intent: intent.trim(), confidence };
    } catch (error) {
      this.logger.error('Error analyzing intent:', error);
      return { intent: 'general', confidence: 0.5 };
    }
  }

  private shouldEscalateToHuman(intent: { intent: string; confidence: number }, response: string): boolean {
    // Escalate if confidence is low or if it's a complex technical issue
    if (intent.confidence < 0.3) return true;
    if (intent.intent === 'technical_support') return true;
    if (response.includes('contact support') || response.includes('human')) return true;
    return false;
  }

  private async getConversationHistory(userId: string, sessionId?: string): Promise<ChatMessage[]> {
    try {
      if (sessionId) {
        return await this.chatMessageRepository.findBySessionId(sessionId, 10);
      } else {
        return await this.chatMessageRepository.findByUserId(userId, undefined, 10);
      }
    } catch (error) {
      this.logger.error('Error getting conversation history:', error);
      return [];
    }
  }

  async saveMessage(createMessageDto: CreateChatMessageDto): Promise<ChatMessage> {
    return this.chatMessageRepository.create(createMessageDto);
  }

  async getChatHistory(userId: string, sessionId?: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      if (sessionId) {
        return await this.chatMessageRepository.findBySessionId(sessionId, limit);
      } else {
        return await this.chatMessageRepository.findByUserId(userId, undefined, limit);
      }
    } catch (error) {
      this.logger.error('Error getting chat history:', error);
      return [];
    }
  }

  async markMessagesAsRead(userId: string, sessionId?: string): Promise<void> {
    try {
      await this.chatMessageRepository.markAllAsRead(userId, sessionId);
    } catch (error) {
      this.logger.error('Error marking messages as read:', error);
    }
  }

  async getUnreadCount(userId: string, sessionId?: string): Promise<number> {
    try {
      return await this.chatMessageRepository.getUnreadCount(userId, sessionId);
    } catch (error) {
      this.logger.error('Error getting unread count:', error);
      return 0;
    }
  }

  async getQuickReplies(context?: string): Promise<string[]> {
    try {
      return this.knowledgeGraphService.getQuickRepliesForContext(context || 'general');
    } catch (error) {
      this.logger.error('Error getting quick replies:', error);
      return ['Help', 'Contact Support'];
    }
  }

  async escalateToHuman(sessionId: string, reason: string): Promise<void> {
    this.logger.log(`Escalating session ${sessionId} to human: ${reason}`);
    // Implementation for human escalation would go here
  }

  private containsProductName(message: string): boolean {
    const productKeywords = [
      'phalaenopsis', 'cattleya', 'dendrobium', 'oncidium', 'cymbidium', 'vanda',
      'paphiopedilum', 'miltonia', 'brassia', 'zygopetalum', 'orchid', 'flower', 'plant'
    ];
    const lowerMessage = message.toLowerCase();
    return productKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private async getProductsFromConversationContext(userId: string, sessionId: string): Promise<ProductSearchResult[]> {
    try {
      // Get recent conversation history
      const history = await this.getConversationHistory(userId, sessionId);
      const recentMessages = history.slice(-5); // Last 5 messages
      
      // Extract product names from recent messages
      const allProductsResult = await this.productIntelligenceService.productRepository.findAll({}, {}, { page: 1, limit: 1000 });
      const allProductNames = allProductsResult.products.map(p => p.name);
      
      const { extractProductNames } = await import('./nlp-utils');
      const mentionedProducts = new Set<string>();
      
      for (const msg of recentMessages) {
        if (msg.sender === 'USER') {
          const extracted = extractProductNames(msg.message, allProductNames);
          extracted.forEach(name => mentionedProducts.add(name));
        }
      }
      
      if (mentionedProducts.size > 0) {
        this.logger.debug(`[CONTEXT] Found mentioned products: ${JSON.stringify(Array.from(mentionedProducts))}`);
        // Get full product details for mentioned products
        const products = allProductsResult.products.filter(p => mentionedProducts.has(p.name));
        return await this.productIntelligenceService.mapProductsToSearchResults(products);
      }
      
      return [];
    } catch (error) {
      this.logger.error('Error getting products from conversation context:', error);
      return [];
    }
  }
} 