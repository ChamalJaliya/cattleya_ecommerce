import { Injectable, Logger } from '@nestjs/common';
import { 
  KnowledgeNode, 
  ConversationTemplate, 
  CattleyaProfile, 
  ChatbotConfig 
} from '../../domain/entities/knowledge-graph.entity';

@Injectable()
export class KnowledgeGraphService {
  private readonly logger = new Logger(KnowledgeGraphService.name);
  
  private cattleyaProfile: CattleyaProfile = {
    companyName: 'Cattleya Orchids',
    description: 'Premium orchid nursery specializing in rare and beautiful orchid varieties. We offer carefully curated collections of Phalaenopsis, Cattleya, Dendrobium, and other exotic orchid species.',
    location: {
      address: '123 Orchid Lane',
      city: 'Garden City',
      state: 'CA',
      country: 'USA',
      postalCode: '90210',
      coordinates: { lat: 34.0522, lng: -118.2437 }
    },
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'info@cattleyaorchids.com',
      website: 'https://cattleyaorchids.com',
      supportEmail: 'support@cattleyaorchids.com'
    },
    businessHours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '10:00 AM - 4:00 PM',
      sunday: 'Closed'
    },
    specialties: [
      'Rare orchid varieties',
      'Phalaenopsis hybrids',
      'Cattleya species',
      'Dendrobium orchids',
      'Miniature orchids',
      'Orchid care supplies'
    ],
    policies: {
      shipping: 'We ship live plants carefully packaged with care instructions. Shipping available within continental US. Plants are shipped on Mondays and Tuesdays to ensure safe delivery.',
      returns: 'Live plant returns accepted within 7 days if plant arrives damaged. Contact us immediately with photos for replacement or refund.',
      warranty: '30-day health guarantee on all live plants. We provide care instructions and support to ensure your orchids thrive.',
      privacy: 'We protect your personal information and never share it with third parties. Your data is used only for order processing and customer service.'
    },
    socialMedia: {
      instagram: '@cattleyaorchids',
      facebook: 'Cattleya Orchids'
    }
  };

  private knowledgeNodes: KnowledgeNode[] = [
    {
      id: 'company-overview',
      type: 'company_info',
      title: 'About Cattleya Orchids',
      content: 'Cattleya Orchids is a premium orchid nursery with over 20 years of experience. We specialize in rare and beautiful orchid varieties, offering carefully curated collections of Phalaenopsis, Cattleya, Dendrobium, and other exotic species. Our mission is to bring the beauty of orchids to homes worldwide while providing expert care guidance.',
      keywords: ['about', 'company', 'nursery', 'experience', 'mission', 'specialize'],
      relatedNodes: ['location', 'contact', 'policies'],
      metadata: { priority: 1 }
    },
    {
      id: 'phalaenopsis-care',
      type: 'care_guide',
      title: 'Phalaenopsis Orchid Care',
      content: 'Phalaenopsis orchids prefer bright, indirect light. Water when the potting mix is nearly dry, typically every 7-10 days. Maintain humidity around 50-70%. Temperature should be 65-80°F during day, 60-65°F at night. Fertilize monthly with orchid fertilizer during growing season.',
      keywords: ['phalaenopsis', 'care', 'watering', 'light', 'temperature', 'fertilizer'],
      relatedNodes: ['watering-guide', 'lighting-guide'],
      metadata: { category: 'care', priority: 2 }
    },
    {
      id: 'shipping-policy',
      type: 'policy',
      title: 'Shipping Information',
      content: 'We ship live plants carefully packaged with care instructions. Shipping available within continental US. Plants are shipped on Mondays and Tuesdays to ensure safe delivery. Standard shipping takes 3-5 business days. Express shipping available for additional fee.',
      keywords: ['shipping', 'delivery', 'packaging', 'care instructions', 'express'],
      relatedNodes: ['returns-policy', 'warranty'],
      metadata: { category: 'policy', priority: 1 }
    },
    {
      id: 'beginner-orchids',
      type: 'product_category',
      title: 'Orchids for Beginners',
      content: 'Perfect for beginners: Phalaenopsis hybrids, Dendrobium nobile, and Oncidium hybrids. These varieties are hardy, forgiving, and produce beautiful blooms. They adapt well to home environments and require minimal special care.',
      keywords: ['beginner', 'easy', 'hardy', 'forgiving', 'phalaenopsis', 'dendrobium'],
      relatedNodes: ['phalaenopsis-care', 'care-basics'],
      metadata: { category: 'product', priority: 2 }
    }
  ];

  private conversationTemplates: ConversationTemplate[] = [
    {
      id: 'greeting',
      name: 'Welcome Greeting',
      type: 'greeting',
      triggerKeywords: ['hello', 'hi', 'hey', 'start', 'begin'],
      response: 'Hello! I\'m Cattleya, your orchid expert assistant. I\'m here to help you discover the perfect orchids and answer all your questions about care, ordering, and our beautiful collection. How can I assist you today?',
      quickReplies: [
        '🌸 What orchids do you recommend for beginners?',
        '💧 How do I care for my orchid?',
        '🚚 What\'s your shipping policy?',
        '📦 I need help with my order'
      ]
    },
    {
      id: 'out-of-scope',
      name: 'Out of Scope Response',
      type: 'out_of_scope',
      triggerKeywords: ['politics', 'weather', 'sports', 'movies', 'unrelated'],
      response: 'I\'m here specifically to help with orchids and Cattleya Orchids services. I\'d be happy to assist you with questions about our orchid collection, care guides, ordering, or any other orchid-related topics. What would you like to know about our beautiful orchids?',
      quickReplies: [
        'Browse our orchid collection',
        'Learn about orchid care',
        'Check our shipping policy',
        'View our care guides'
      ]
    },
    {
      id: 'product-inquiry',
      name: 'Product Information',
      type: 'product_inquiry',
      triggerKeywords: ['orchid', 'plant', 'variety', 'species', 'bloom', 'flower'],
      response: 'I\'d love to help you find the perfect orchid! We offer a wide variety including Phalaenopsis, Cattleya, Dendrobium, and other exotic species. What type of orchid are you looking for, or do you have any specific preferences?',
      quickReplies: [
        'Show me beginner-friendly orchids',
        'I want rare varieties',
        'What\'s currently in stock?',
        'Tell me about care requirements'
      ]
    },
    {
      id: 'order-support',
      name: 'Order Support',
      type: 'order_support',
      triggerKeywords: ['order', 'tracking', 'delivery', 'shipping', 'purchase'],
      response: 'I can help you with your order! Our shipping policy ensures safe delivery of live plants within 3-5 business days. We ship on Mondays and Tuesdays for optimal plant health. What specific order assistance do you need?',
      quickReplies: [
        'Track my order',
        'Check shipping status',
        'Return or exchange',
        'Contact support'
      ]
    }
  ];

  private chatbotConfig: ChatbotConfig = {
    maxResponseLength: 500,
    temperature: 0.7,
    model: 'gpt-3.5-turbo',
    escalationThreshold: 0.3,
    outOfScopeThreshold: 0.2,
    maxConversationHistory: 10,
    quickReplyLimit: 4
  };

  getCattleyaProfile(): CattleyaProfile {
    return this.cattleyaProfile;
  }

  getKnowledgeNodes(): KnowledgeNode[] {
    return this.knowledgeNodes;
  }

  getConversationTemplates(): ConversationTemplate[] {
    return this.conversationTemplates;
  }

  getChatbotConfig(): ChatbotConfig {
    return this.chatbotConfig;
  }

  findRelevantNodes(query: string): KnowledgeNode[] {
    const queryLower = query.toLowerCase();
    return this.knowledgeNodes.filter(node => 
      node.keywords.some(keyword => queryLower.includes(keyword.toLowerCase())) ||
      node.title.toLowerCase().includes(queryLower) ||
      node.content.toLowerCase().includes(queryLower)
    );
  }

  findMatchingTemplate(message: string): ConversationTemplate | null {
    const messageLower = message.toLowerCase();
    
    for (const template of this.conversationTemplates) {
      if (template.triggerKeywords.some(keyword => 
        messageLower.includes(keyword.toLowerCase())
      )) {
        return template;
      }
    }
    
    return null;
  }

  getQuickRepliesForContext(context: string): string[] {
    switch (context) {
      case 'greeting':
        return [
          '🌸 Browse our orchid collection',
          '💧 Learn about orchid care',
          '🌟 Get recommendations',
          '📞 Contact support'
        ];
      
      case 'product_inquiry':
        return [
          '🦋 Phalaenopsis orchids',
          '👑 Cattleya orchids',
          '🌺 Dendrobium orchids',
          '💎 Rare orchids',
          '💰 Check prices'
        ];
      
      case 'care_advice':
        return [
          '💧 Watering guide',
          '☀️ Light requirements',
          '🌡️ Temperature tips',
          '🌱 Repotting help',
          '🐛 Pest control'
        ];
      
      case 'order_support':
        return [
          '📦 Track my order',
          '🚚 Shipping info',
          '↩️ Return policy',
          '💳 Payment options',
          '📞 Contact sales'
        ];
      
      case 'company_info':
        return [
          '📍 Visit our location',
          '📞 Call us',
          '✉️ Email us',
          '🕒 Business hours',
          '🌟 About Cattleya'
        ];
      
      case 'technical_support':
        return [
          '🔧 Website help',
          '👤 Account issues',
          '💳 Payment problems',
          '📱 Mobile app',
          '📞 Contact support'
        ];
      
      case 'product_search':
        return [
          '🔍 Search more orchids',
          '🌿 Browse categories',
          '🌟 Get recommendations',
          '💰 Price ranges',
          '📞 Contact sales'
        ];
      
      case 'product_recommendation':
        return [
          '🌱 Beginner orchids',
          '💎 Rare orchids',
          '⭐ Featured orchids',
          '🔥 Best sellers',
          '🆕 New arrivals'
        ];
      
      case 'product_price':
        return [
          '💰 View all prices',
          '💚 Special offers',
          '🌿 Browse by price',
          '📞 Contact sales',
          '💳 Payment plans'
        ];
      
      case 'product_stock':
        return [
          '📦 Check availability',
          '🔔 Get notifications',
          '🌿 Similar orchids',
          '📞 Contact sales',
          '🌟 Recommendations'
        ];
      
      default:
        return [
          '🌸 Browse orchids',
          '💧 Care guide',
          '🌟 Recommendations',
          '📞 Contact us'
        ];
    }
  }

  isOutOfScope(message: string): boolean {
    const outOfScopeKeywords = [
      'politics', 'weather', 'sports', 'movies', 'music', 'celebrities',
      'cooking', 'travel', 'finance', 'health', 'medical', 'legal'
    ];
    
    const messageLower = message.toLowerCase();
    return outOfScopeKeywords.some(keyword => messageLower.includes(keyword));
  }
} 