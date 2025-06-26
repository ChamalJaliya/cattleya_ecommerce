# Enhanced Cattleya Chatbot Implementation

## Overview

The Cattleya chatbot has been significantly enhanced with knowledge graphs, prompt templates, and intelligent conversation management. This implementation provides a more contextual, accurate, and user-friendly experience while ensuring the bot stays focused on orchid-related topics.

## Key Features

### 1. Knowledge Graph System
- **Company Profile**: Complete Cattleya business information including location, contact details, business hours, and policies
- **Product Knowledge**: Detailed information about orchid varieties, care guides, and beginner recommendations
- **Policy Information**: Shipping, returns, warranty, and privacy policies
- **Dynamic Context**: Relevant knowledge nodes are automatically selected based on user queries

### 2. Prompt Templates
- **Greeting Templates**: Personalized welcome messages with context-appropriate quick replies
- **Intent Recognition**: Automatic classification of user messages into specific categories
- **Out-of-Scope Handling**: Polite redirection when users ask about non-orchid topics
- **Escalation Management**: Intelligent escalation to human support when needed

### 3. Backend-Driven Quick Replies
- **Context-Aware Suggestions**: Quick replies are generated based on conversation context
- **Dynamic Updates**: Suggestions change as the conversation progresses
- **Fallback System**: Default suggestions when backend is unavailable

### 4. Conversation Management
- **Intent Analysis**: AI-powered classification of user intent
- **Confidence Scoring**: Automatic escalation when confidence is low
- **Session Management**: Conversation history tracking for context
- **User Personalization**: Greeting based on user authentication status

## Architecture

### Backend Components

#### 1. Knowledge Graph Service (`knowledge-graph.service.ts`)
```typescript
interface KnowledgeNode {
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
```

#### 2. Conversation Templates
```typescript
interface ConversationTemplate {
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
```

#### 3. Cattleya Profile
```typescript
interface CattleyaProfile {
  companyName: string;
  description: string;
  location: { /* address details */ };
  contact: { /* contact information */ };
  businessHours: { /* operating hours */ };
  specialties: string[];
  policies: { /* business policies */ };
  socialMedia: { /* social media links */ };
}
```

### Frontend Components

#### 1. Enhanced useChatbot Hook
- Fetches quick replies from backend
- Manages conversation state
- Handles greeting logic
- Provides fallback suggestions

#### 2. Updated ChatbotWidgetContainer
- Auto-greeting functionality
- Dynamic quick reply display
- Improved error handling
- Better user experience

## API Endpoints

### 1. Send Message
```http
POST /api/chatbot/send
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "What orchids do you recommend for beginners?",
  "sessionId": "optional-session-id"
}
```

### 2. Get Quick Replies
```http
GET /api/chatbot/quick-replies?context=greeting
Authorization: Bearer <token>
```

### 3. Get Chat History
```http
GET /api/chatbot/history?sessionId=optional&limit=50
Authorization: Bearer <token>
```

### 4. Escalate to Human
```http
POST /api/chatbot/escalate
Content-Type: application/json
Authorization: Bearer <token>

{
  "sessionId": "optional-session-id",
  "reason": "Complex technical issue"
}
```

## Conversation Flow

### 1. Initial Greeting
1. User opens chat widget
2. System loads greeting quick replies from backend
3. User sees personalized welcome message
4. Context-appropriate suggestions are displayed

### 2. Message Processing
1. User sends message
2. System checks if message is out of scope
3. If out of scope, returns polite redirection
4. If in scope, checks for matching conversation templates
5. If no template match, processes with AI using knowledge graph context
6. Returns response with updated quick replies

### 3. Intent Classification
The system classifies messages into these categories:
- `greeting`: Hello, hi, hey, start conversation
- `product_inquiry`: Questions about orchids, varieties, care, pricing
- `order_support`: Order tracking, status, delivery, returns
- `care_advice`: Orchid care, watering, lighting, repotting
- `company_info`: About Cattleya, location, contact, business hours
- `technical_support`: Website issues, account problems, payment
- `out_of_scope`: Topics unrelated to orchids or Cattleya services
- `escalation`: Complex issues that need human help

### 4. Escalation Logic
Automatic escalation occurs when:
- Intent confidence is below threshold (0.3)
- Message is classified as escalation
- Response suggests human assistance
- Technical errors occur

## Knowledge Graph Content

### Company Information
- **Name**: Cattleya Orchids
- **Description**: Premium orchid nursery with 20+ years experience
- **Location**: 123 Orchid Lane, Garden City, CA 90210
- **Contact**: +1 (555) 123-4567, info@cattleyaorchids.com
- **Business Hours**: Mon-Fri 9AM-6PM, Sat 10AM-4PM, Sun Closed

### Specialties
- Rare orchid varieties
- Phalaenopsis hybrids
- Cattleya species
- Dendrobium orchids
- Miniature orchids
- Orchid care supplies

### Policies
- **Shipping**: Live plants shipped Mon-Tue, 3-5 business days
- **Returns**: 7-day return policy for damaged plants
- **Warranty**: 30-day health guarantee
- **Privacy**: Data protection and secure handling

## Quick Reply Categories

### Greeting Quick Replies
- 🌸 What orchids do you recommend for beginners?
- 💧 How do I care for my orchid?
- 🚚 What's your shipping policy?
- 📦 I need help with my order

### Product Inquiry Quick Replies
- Show me beginner-friendly orchids
- I want rare varieties
- What's currently in stock?
- Tell me about care requirements

### Order Support Quick Replies
- Track my order
- Check shipping status
- Return or exchange
- Contact support

### Out-of-Scope Quick Replies
- Browse our orchid collection
- Learn about orchid care
- Check our shipping policy
- View our care guides

## Configuration

### Chatbot Configuration
```typescript
interface ChatbotConfig {
  maxResponseLength: number;        // 500
  temperature: number;              // 0.7
  model: string;                    // 'gpt-3.5-turbo'
  escalationThreshold: number;      // 0.3
  outOfScopeThreshold: number;      // 0.2
  maxConversationHistory: number;   // 10
  quickReplyLimit: number;          // 4
}
```

## Benefits

### 1. Improved Accuracy
- Knowledge graph provides accurate, up-to-date information
- Context-aware responses based on conversation history
- Reduced hallucination through structured knowledge

### 2. Better User Experience
- Personalized greetings based on user status
- Context-appropriate quick replies
- Polite handling of off-topic questions
- Seamless escalation to human support

### 3. Business Focus
- Ensures conversations stay relevant to orchids and Cattleya services
- Promotes business objectives through guided conversations
- Maintains brand voice and expertise

### 4. Scalability
- Easy to add new knowledge nodes
- Simple template management
- Configurable thresholds and settings
- Modular architecture for future enhancements

## Future Enhancements

### 1. Advanced Knowledge Graph
- Product inventory integration
- Real-time availability updates
- Seasonal care recommendations
- Customer preference learning

### 2. Enhanced Personalization
- User purchase history integration
- Personalized product recommendations
- Care reminder system
- Loyalty program integration

### 3. Multi-language Support
- Internationalization of templates
- Language-specific knowledge nodes
- Cultural adaptation of responses

### 4. Analytics and Insights
- Conversation analytics
- Intent tracking and analysis
- Customer satisfaction metrics
- Performance optimization

## Testing

### Manual Testing Scenarios
1. **Greeting Flow**: Open chat, verify greeting and quick replies
2. **Product Inquiry**: Ask about orchids, verify knowledge-based responses
3. **Out-of-Scope**: Ask about weather/politics, verify polite redirection
4. **Escalation**: Test complex queries, verify escalation logic
5. **Quick Replies**: Test all quick reply categories
6. **Error Handling**: Test network failures, verify fallbacks

### Automated Testing
- Unit tests for knowledge graph service
- Integration tests for chatbot API
- Frontend component testing
- End-to-end conversation flow testing

## Deployment

### Backend Deployment
1. Ensure all new services are included in the module
2. Verify environment variables for OpenAI API
3. Test knowledge graph initialization
4. Monitor conversation processing performance

### Frontend Deployment
1. Update chatbot components
2. Test API integration
3. Verify fallback mechanisms
4. Monitor user experience metrics

## Monitoring

### Key Metrics
- Response accuracy
- Escalation rate
- User satisfaction
- Conversation completion rate
- Quick reply usage

### Alerts
- High error rates
- Escalation threshold breaches
- API response time degradation
- Knowledge graph update failures

This enhanced chatbot implementation provides a robust, intelligent, and user-friendly experience while maintaining focus on Cattleya's core business of orchid sales and care guidance. 