# 🤖 Cattleya Chatbot Implementation

## Overview

The Cattleya chatbot is an AI-powered assistant that helps customers with orchid-related questions, order support, and general inquiries. It uses OpenAI's GPT-3.5-turbo model to provide intelligent, context-aware responses.

## Features

### ✅ Implemented
- **AI-Powered Responses**: Uses OpenAI GPT-3.5-turbo for intelligent conversations
- **Orchid-Specific Knowledge**: Specialized system prompt for orchid e-commerce
- **Intent Recognition**: Automatically categorizes user queries
- **Escalation System**: Routes complex issues to human support
- **Chat History**: Stores and retrieves conversation history
- **Session Management**: Supports multiple chat sessions
- **Suggested Actions**: Provides quick action buttons based on context
- **Beautiful UI**: Modern, responsive chat widget with orchid theme

### 🔄 In Progress
- **Database Integration**: Full Prisma integration for message storage
- **Admin Dashboard**: Chat management interface for admins
- **Analytics**: Chat performance and user satisfaction metrics

## Architecture

### Backend Structure
```
src/modules/chatbot/
├── chatbot.module.ts                 # Main module
├── domain/
│   └── entities/
│       └── chat-message.entity.ts    # Data models
├── application/
│   ├── chatbot.application.module.ts
│   └── services/
│       └── chatbot.service.ts        # OpenAI integration
└── infrastructure/
    ├── chatbot.infrastructure.module.ts
    └── controllers/
        └── chatbot.controller.ts     # API endpoints
```

### Frontend Structure
```
src/
├── core/infrastructure/api/
│   └── chatbotApi.ts                 # API client
├── shared/
│   ├── hooks/
│   │   └── useChatbot.ts             # React hook
│   └── components/
│       └── ChatbotWidget.tsx         # UI component
```

## Quick Start

1. **Add OpenAI API Key** to your `.env` file:
```env
OPENAI_API_KEY=sk-proj-your-openai-api-key-here
```

2. **Start the backend**:
```bash
cd cattleya-backend
npm run start:dev
```

3. **Start the frontend**:
```bash
cd cattleya-app
npm run dev
```

4. **Test the chatbot**:
- Navigate to `http://localhost:3000/test-chatbot`
- Look for the chat button in the bottom-right corner
- Try asking questions about orchids!

## API Endpoints

- `POST /chatbot/send` - Send a message
- `GET /chatbot/history` - Get chat history  
- `POST /chatbot/escalate` - Escalate to human support

## Testing

Run the backend test:
```bash
cd cattleya-backend
node test-chatbot.js
```

---

**Built with ❤️ for Cattleya Orchid Collection**

## System Prompt

The chatbot uses a specialized system prompt for orchid e-commerce:

```
You are Cattleya, a helpful AI assistant for an orchid e-commerce platform. You help customers with:

1. Product Information: Orchid varieties, care instructions, sizes, colors, pricing
2. Order Support: Order status, tracking, returns, refunds
3. General Help: Website navigation, account issues, payment methods
4. Care Advice: Orchid care tips, watering, lighting, repotting

Key guidelines:
- Be friendly, knowledgeable, and helpful
- Focus on orchids and gardening
- If you can't help, suggest contacting human support
- Keep responses concise but informative
- Use a warm, botanical tone
- Don't make up information about products or policies
```

## Intent Recognition

The chatbot automatically categorizes user queries into:

- **product_info**: Questions about orchids, varieties, care, pricing
- **order_status**: Order tracking, status, delivery
- **technical_support**: Website issues, account problems, payment
- **general_help**: General questions, navigation
- **escalation**: Complex issues that need human help

## Escalation Logic

The chatbot escalates to human support when:
- Confidence score is below 0.3
- Intent is classified as "escalation"
- Response contains keywords like "contact support" or "human"

## UI Features

### Chat Widget
- **Floating Design**: Fixed position in bottom-right corner
- **Responsive**: Adapts to different screen sizes
- **Orchid Theme**: Purple/pink gradient matching brand colors
- **Quick Actions**: Suggested buttons for common queries
- **Typing Indicators**: Shows when bot is processing
- **Message History**: Scrollable conversation view

### User Experience
- **Auto-scroll**: Automatically scrolls to new messages
- **Input Focus**: Focuses input when chat opens
- **Keyboard Support**: Enter to send, suggestions on arrow keys
- **Error Handling**: Graceful error messages and retry options

## Security

- **Authentication Required**: All endpoints require JWT token
- **Rate Limiting**: Integrated with existing rate limiting
- **Input Validation**: Sanitized inputs to prevent injection
- **Session Isolation**: Messages are isolated by user ID

## Performance

- **Caching**: Conversation history cached in memory
- **Async Processing**: Non-blocking message processing
- **Optimized Prompts**: Efficient system prompts for faster responses
- **Connection Pooling**: Reuses OpenAI connections

## Future Enhancements

### Phase 2
- [ ] **Knowledge Base Integration**: Connect to product catalog and FAQ
- [ ] **Multi-language Support**: Support for Spanish, French, etc.
- [ ] **Voice Input**: Speech-to-text capabilities
- [ ] **Image Recognition**: Identify orchid types from photos

### Phase 3
- [ ] **Live Chat Handoff**: Seamless transition to human agents
- [ ] **Advanced Analytics**: Conversation insights and metrics
- [ ] **Personalization**: User-specific recommendations
- [ ] **Proactive Messaging**: Initiate conversations based on user behavior

## Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Check API key is valid and has credits
   - Verify network connectivity
   - Check rate limits

2. **Authentication Issues**
   - Ensure user is logged in
   - Check JWT token is valid
   - Verify token hasn't expired

3. **Database Issues**
   - Run `npx prisma generate` after schema changes
   - Check database connection
   - Verify ChatMessage model exists

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
LOG_LEVEL=debug
```

## Support

For technical support or questions about the chatbot implementation:
1. Check the logs for error messages
2. Test with the provided test scripts
3. Verify all environment variables are set
4. Ensure both frontend and backend are running

---

**Built with ❤️ for Cattleya Orchid Collection** 