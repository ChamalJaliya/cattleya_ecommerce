# Cattleya NLP Service

Advanced AI-powered NLP microservice for the Cattleya Orchid e-commerce platform. This service provides dynamic, real-time chatbot capabilities with expert orchid knowledge, sentiment analysis, voice transcription, and intelligent conversation management.

## 🚀 Features

- **Dynamic AI Knowledge Base**: Real-time web search for up-to-date orchid information
- **Advanced Intent Recognition**: Multi-layered NLP with spaCy and custom patterns
- **Sentiment Analysis**: Real-time emotion detection and response adaptation
- **Voice Transcription**: Speech-to-text capabilities for voice interactions
- **Conversation Memory**: Persistent context-aware conversations
- **Expert Orchid Guidance**: Specialized knowledge for Cattleya orchid care and sales
- **Multi-Source Search**: SerpAPI, Google Custom Search, and web scraping
- **Async Processing**: High-performance concurrent request handling

## 📋 Prerequisites

- Python 3.8 or higher
- pip package manager
- API keys for external services (see Configuration section)

## 🛠️ Quick Setup

### 1. Clone and Navigate
```bash
cd cattleya-nlp-service
```

### 2. Run Setup Script
```bash
python setup_env.py
```

This will:
- ✅ Check Python version
- ✅ Create `.env` file from `env.sample`
- ✅ Install all required dependencies
- ✅ Create necessary directories
- ✅ Download spaCy model

### 3. Configure Environment
Edit the `.env` file with your API keys:

```bash
# Required API Keys
OPENAI_API_KEY=your_openai_api_key_here
SERPAPI_API_KEY=your_serpapi_key_here
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CSE_ID=your_google_cse_id_here
```

### 4. Start the Service
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Test the API
Visit: http://localhost:8000/docs

## 🔑 Required API Keys

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to `.env`: `OPENAI_API_KEY=your_key_here`

### SerpAPI Key (Primary Search)
1. Go to [SerpAPI](https://serpapi.com/)
2. Sign up and get your API key
3. Add to `.env`: `SERPAPI_API_KEY=your_key_here`

### Google Custom Search (Fallback)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Custom Search API
3. Create API key
4. Go to [Google Custom Search](https://cse.google.com/)
5. Create a search engine
6. Add to `.env`:
   ```
   GOOGLE_API_KEY=your_google_api_key
   GOOGLE_CSE_ID=your_search_engine_id
   ```

## 📚 API Endpoints

### Chatbot Interaction
```http
POST /api/chatbot/chat
Content-Type: application/json

{
  "message": "How do I care for Cattleya orchids?",
  "session_id": "user_session_123",
  "user_context": {
    "experience_level": "beginner",
    "location": "indoor"
  }
}
```

### Orchid Information Search
```http
POST /api/chatbot/search-orchid-info
Content-Type: application/json

{
  "query": "Cattleya orchid watering frequency",
  "max_results": 5
}
```

### AI-Generated Recommendations
```http
POST /api/chatbot/recommendations
Content-Type: application/json

{
  "user_preferences": {
    "experience": "intermediate",
    "light_conditions": "bright_indirect",
    "budget": "medium"
  },
  "current_plants": ["phalaenopsis", "dendrobium"]
}
```

### Direct AI Response
```http
POST /api/chatbot/ai-response
Content-Type: application/json

{
  "prompt": "Explain the best potting mix for Cattleya orchids",
  "context": "User is a beginner gardener",
  "max_tokens": 500
}
```

### Voice Transcription
```http
POST /api/chatbot/transcribe
Content-Type: multipart/form-data

file: audio_file.wav
language: en-US
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4-turbo-preview` |
| `SERPAPI_API_KEY` | SerpAPI key for web search | Required |
| `GOOGLE_API_KEY` | Google API key | Optional |
| `GOOGLE_CSE_ID` | Google Custom Search Engine ID | Optional |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `DEBUG` | Debug mode | `true` |
| `LOG_LEVEL` | Logging level | `INFO` |

### Advanced Configuration

```env
# Performance Tuning
MAX_CONCURRENT_REQUESTS=10
REQUEST_TIMEOUT=30
CACHE_TTL=1800

# Knowledge Base Settings
KNOWLEDGE_CACHE_TTL=3600
MAX_SEARCH_RESULTS=5
MIN_RELEVANCE_SCORE=0.7

# Security
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=3600
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Node.js        │    │   Python NLP    │
│   (Next.js)     │◄──►│   Backend        │◄──►│   Service       │
│                 │    │   (NestJS)       │    │   (FastAPI)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
                                              ┌──────────────────┐
                                              │   External APIs  │
                                              │ • OpenAI         │
                                              │ • SerpAPI        │
                                              │ • Google Search  │
                                              └──────────────────┘
```

## 🧪 Testing

### Run Tests
```bash
pytest tests/
```

### Test Specific Endpoint
```bash
# Test chatbot endpoint
curl -X POST "http://localhost:8000/api/chatbot/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "session_id": "test_123"}'
```

## 📊 Monitoring

### Health Check
```http
GET /health
```

### Metrics (if enabled)
```http
GET /metrics
```

### Logs
Logs are stored in `logs/nlp_service.log`

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t cattleya-nlp .

# Run container
docker run -p 8000:8000 --env-file .env cattleya-nlp
```

### Production
```bash
# Install production dependencies
pip install -r requirements.txt

# Start with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 🔍 Troubleshooting

### Common Issues

1. **ModuleNotFoundError: No module named 'textblob'**
   ```bash
   pip install textblob
   ```

2. **spaCy model not found**
   ```bash
   python -m spacy download en_core_web_sm
   ```

3. **API key errors**
   - Verify API keys in `.env` file
   - Check API key permissions and quotas

4. **Port already in use**
   ```bash
   # Change port in .env or use different port
   python -m uvicorn main:app --port 8001
   ```

### Debug Mode
Set `DEBUG=true` in `.env` for detailed error messages and logging.

## 📝 Development

### Code Formatting
```bash
black .
```

### Linting
```bash
flake8 .
```

### Adding New Features
1. Create new service in `services/` directory
2. Add endpoints in `main.py`
3. Update requirements.txt if needed
4. Add tests in `tests/` directory

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is part of the Cattleya Orchid e-commerce platform.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs in `logs/nlp_service.log`
3. Create an issue in the repository

---

**Happy coding! 🌸** 