export interface KnowledgeNode {
  id: string;
  type: 'company_info' | 'product_category' | 'care_guide' | 'policy' | 'faq' | 'location';
  title: string;
  content: string;
  keywords: string[];
  relatedNodes: string[];
  metadata?: {
    category?: string;
    priority?: number;
    lastUpdated?: Date;
    source?: string;
  };
}

export interface ConversationTemplate {
  id: string;
  name: string;
  type: 'greeting' | 'product_inquiry' | 'order_support' | 'care_advice' | 'escalation' | 'out_of_scope';
  triggerKeywords: string[];
  response: string;
  quickReplies?: string[];
  metadata?: {
    confidence?: number;
    requiresUserInfo?: boolean;
    escalationThreshold?: number;
  };
}

export interface CattleyaProfile {
  companyName: string;
  description: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    email: string;
    website: string;
    supportEmail: string;
  };
  businessHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  specialties: string[];
  policies: {
    shipping: string;
    returns: string;
    warranty: string;
    privacy: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface ChatbotConfig {
  maxResponseLength: number;
  temperature: number;
  model: string;
  escalationThreshold: number;
  outOfScopeThreshold: number;
  maxConversationHistory: number;
  quickReplyLimit: number;
} 