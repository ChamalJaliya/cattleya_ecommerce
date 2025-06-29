from fastapi import FastAPI, Body, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List
import os
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import our services
from services.intent_entity_service import analyze_message
from services.openai_service import generate_elaborative_description
from services.spacy_service import generate_spacy_description
from services.sentiment_analysis_service import SentimentAnalysisService
from services.conversation_memory_service import ConversationMemoryService
from services.voice_transcription_service import VoiceTranscriptionService
from services.cattleya_knowledge_service import DynamicCattleyaKnowledgeService
from services.enhanced_chatbot_service import enhanced_chatbot, ChatbotResponse as EnhancedChatbotResponse

app = FastAPI(title="Cattleya NLP Service", version="4.0.0")

# Initialize services
sentiment_service = SentimentAnalysisService()
memory_service = ConversationMemoryService()
voice_service = VoiceTranscriptionService()
knowledge_service = DynamicCattleyaKnowledgeService()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatbotRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_experience: Optional[str] = "beginner"
    context: Optional[str] = None

class EnhancedChatbotResponseModel(BaseModel):
    message: str
    products: List[dict]
    quick_replies: List[str]
    intent: str
    confidence: float
    entities: List[dict]
    sentiment: dict
    metadata: dict

class ChatbotResponse(BaseModel):
    message: str
    quick_replies: List[str]
    metadata: dict
    confidence: float
    intent: str
    entities: List[str]
    sentiment: dict
    context: dict

class AnalyzeRequest(BaseModel):
    message: str
    context: Optional[str] = None
    session_id: Optional[str] = None

class AnalyzeResponse(BaseModel):
    spaCy: dict
    llm: dict
    final_intent: str
    final_entities: list
    confidence: float
    sentiment: dict
    context: dict

class ElaborateRequest(BaseModel):
    product_name: str
    context: Optional[str] = None

class ElaborateResponse(BaseModel):
    product_name: str
    description: str
    method: str

class SentimentRequest(BaseModel):
    text: str
    session_id: Optional[str] = None

class SentimentResponse(BaseModel):
    polarity: float
    subjectivity: float
    sentiment_class: str
    emotions: List[str]
    urgency: str
    satisfaction_indicators: List[str]
    confidence: float
    recommended_action: str

class VoiceTranscriptionRequest(BaseModel):
    session_id: Optional[str] = None
    language: Optional[str] = "en-US"

class VoiceTranscriptionResponse(BaseModel):
    success: bool
    text: str
    confidence: float
    service_used: str
    language: str
    error: Optional[str] = None

class ConversationContextRequest(BaseModel):
    session_id: str

class ConversationContextResponse(BaseModel):
    recent_messages: List[dict]
    user_preferences: dict
    conversation_topics: List[str]
    experience_level: Optional[str]
    recent_sentiment: Optional[dict]
    last_intent: Optional[str]

@app.post("/chatbot", response_model=EnhancedChatbotResponseModel)
async def chatbot_endpoint(req: ChatbotRequest):
    """
    Enhanced chatbot endpoint - combines product lookup with AI-generated content!
    This endpoint provides interactive product cards and expert responses.
    """
    logger.info(f"[PYTHON] /chatbot called with: {req.message} | session: {req.session_id}")
    
    try:
        # Use the enhanced chatbot service
        response = await enhanced_chatbot.process_message(req.message, req.session_id)
        
        # Store conversation in memory
        if req.session_id:
            memory_service.store_message(req.session_id, {
                "message": req.message,
                "sender": "USER",
                "metadata": {
                    "intent": response.intent,
                    "entities": [e.text for e in response.entities],
                    "confidence": response.confidence
                }
            })
            
            memory_service.store_message(req.session_id, {
                "message": response.message,
                "sender": "BOT",
                "metadata": {
                    "intent": response.intent,
                    "products": [p.get('name', '') for p in response.products],
                    "confidence": response.confidence
                }
            })
        
        # Convert entities to dict format for response
        entities_dict = [
            {
                "text": entity.text,
                "type": entity.type,
                "confidence": entity.confidence,
                "source": entity.source
            }
            for entity in response.entities
        ]
        
        # Products are already dictionaries, no conversion needed
        product_cards = response.products
        
        logger.info(f"[PYTHON] /chatbot enhanced response generated successfully")
        
        return EnhancedChatbotResponseModel(
            message=response.message,
            products=product_cards,
            quick_replies=response.quick_replies,
            intent=response.intent,
            confidence=response.confidence,
            entities=entities_dict,
            sentiment=response.sentiment,
            metadata=response.metadata
        )
        
    except Exception as e:
        logger.error(f"Error in enhanced chatbot: {e}")
        # Fallback to basic response
        return EnhancedChatbotResponseModel(
            message="🌸 I'm here to help with all things orchids! What would you like to know?",
            products=[],
            quick_replies=["Browse Products", "Care Guide", "Get Recommendations"],
            intent="greeting",
            confidence=0.5,
            entities=[],
            sentiment={"polarity": 0, "subjectivity": 0, "sentiment_class": "neutral"},
            metadata={"error": str(e)}
        )

@app.post("/chatbot/legacy", response_model=ChatbotResponse)
async def legacy_chatbot_endpoint(req: ChatbotRequest):
    """
    Legacy chatbot endpoint - original implementation for backward compatibility
    """
    logger.info(f"[PYTHON] /chatbot/legacy called with: {req.message} | session: {req.session_id}")
    
    try:
        # Step 1: Analyze intent, entities, and sentiment
        analysis = analyze_message(req.message, req.context)
        
        # Get final intent and entities
        spaCy_intent = analysis['spaCy']['intent']
        spaCy_confidence = analysis['spaCy']['confidence']
        llm_intent = analysis.get('llm', {}).get('intent')
        llm_confidence = analysis.get('llm', {}).get('confidence', 0)
        
        # Use the most confident result
        if llm_confidence > spaCy_confidence and llm_intent:
            final_intent = llm_intent
            final_confidence = llm_confidence
        else:
            final_intent = spaCy_intent
            final_confidence = spaCy_confidence
        
        # Combine entities from both sources
        final_entities = list(set(
            analysis['spaCy']['entities'] + 
            analysis.get('llm', {}).get('entities', [])
        ))
        
        # Step 2: Analyze sentiment
        sentiment = sentiment_service.analyze_sentiment(req.message)
        
        # Step 3: Get conversation context
        context = {}
        if req.session_id:
            memory_service.store_message(req.session_id, {
                "message": req.message,
                "sender": "USER",
                "metadata": {
                    "intent": final_intent,
                    "sentiment": sentiment,
                    "entities": final_entities
                }
            })
            context = memory_service.get_relevant_context(req.session_id, req.message)
        
        # Step 4: Generate dynamic AI-powered response
        response = await knowledge_service.generate_dynamic_response(
            user_query=req.message,
            intent=final_intent,
            entities=final_entities,
            sentiment=sentiment,
            user_experience=req.user_experience
        )
        
        # Step 5: Store bot response in memory
        if req.session_id:
            memory_service.store_message(req.session_id, {
                "message": response["message"],
                "sender": "BOT",
                "metadata": {
                    "intent": final_intent,
                    "confidence": final_confidence,
                    "entities": final_entities
                }
            })
        
        logger.info(f"[PYTHON] /chatbot/legacy dynamic response generated successfully")
        
        return ChatbotResponse(
            message=response["message"],
            quick_replies=response["quick_replies"],
            metadata=response["metadata"],
            confidence=final_confidence,
            intent=final_intent,
            entities=final_entities,
            sentiment=sentiment,
            context=context
        )
        
    except Exception as e:
        logger.error(f"Error in legacy chatbot: {e}")
        return ChatbotResponse(
            message="🌸 I'm here to help with all things orchids! What would you like to know?",
            quick_replies=["Browse Products", "Care Guide", "Get Recommendations"],
            metadata={"error": str(e)},
            confidence=0.5,
            intent="greeting",
            entities=[],
            sentiment={"polarity": 0, "subjectivity": 0, "sentiment_class": "neutral"},
            context={}
        )

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    """Enhanced intent and entity analysis with sentiment and context"""
    logger.info(f"[PYTHON] /analyze called with: {req.message} | context: {req.context}")
    logger.info(f"Analyzing message: {req.message}")
    
    # Get both spaCy and LLM results
    analysis = analyze_message(req.message, req.context)
    logger.info(f"[PYTHON] /analyze result: {analysis}")
    
    # Determine final intent and entities based on confidence
    spaCy_intent = analysis['spaCy']['intent']
    spaCy_confidence = analysis['spaCy']['confidence']
    llm_intent = analysis.get('llm', {}).get('intent')
    llm_confidence = analysis.get('llm', {}).get('confidence', 0)
    
    # Use the most confident result
    if llm_confidence > spaCy_confidence and llm_intent:
        final_intent = llm_intent
        final_confidence = llm_confidence
    else:
        final_intent = spaCy_intent
        final_confidence = spaCy_confidence
    
    # Combine entities from both sources
    final_entities = list(set(
        analysis['spaCy']['entities'] + 
        analysis.get('llm', {}).get('entities', [])
    ))
    
    # Analyze sentiment
    sentiment = sentiment_service.analyze_sentiment(req.message)
    
    # Store message in conversation memory if session_id provided
    context = {}
    if req.session_id:
        memory_service.store_message(req.session_id, {
            "message": req.message,
            "sender": "USER",
            "metadata": {
                "intent": final_intent,
                "sentiment": sentiment,
                "entities": final_entities
            }
        })
        context = memory_service.get_relevant_context(req.session_id, req.message)
    
    logger.info(f"[PYTHON] /analyze final_intent: {final_intent}, final_entities: {final_entities}, confidence: {final_confidence}")
    
    return AnalyzeResponse(
        spaCy=analysis['spaCy'],
        llm=analysis.get('llm', {}),
        final_intent=final_intent,
        final_entities=final_entities,
        confidence=final_confidence,
        sentiment=sentiment,
        context=context
    )

@app.post("/elaborate", response_model=ElaborateResponse)
def elaborate_product(req: ElaborateRequest):
    """Generate creative, elaborative product descriptions"""
    logger.info(f"[PYTHON] /elaborate called for: {req.product_name} | context: {req.context}")
    logger.info(f"Elaborating product: {req.product_name}")
    
    try:
        # Try OpenAI first for creative generation
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            description = generate_elaborative_description(req.product_name, req.context)
            method = "openai"
            logger.info(f"[PYTHON] /elaborate result (openai): {description[:100]}...")
        else:
            # Fallback to spaCy-based generation
            description, entities = generate_spacy_description(req.product_name, req.context)
            method = "spacy"
            logger.info(f"[PYTHON] /elaborate result (spacy): {description[:100]}...")
            
    except Exception as e:
        logger.error(f"Error in elaboration: {e}")
        # Ultimate fallback
        description = (
            f"The {req.product_name} is a beautiful orchid. "
            f"{req.context or 'It is known for its unique beauty and elegance, making it a favorite among collectors.'} "
            f"With proper care, it will reward you with stunning blooms."
        )
        method = "fallback"
        logger.info(f"[PYTHON] /elaborate result (fallback): {description[:100]}...")
    
    return ElaborateResponse(
        product_name=req.product_name,
        description=description,
        method=method
    )

@app.post("/sentiment", response_model=SentimentResponse)
def analyze_sentiment(req: SentimentRequest):
    """Analyze sentiment of text"""
    logger.info(f"[PYTHON] /sentiment called for text: {req.text[:50]}...")
    
    sentiment = sentiment_service.analyze_sentiment(req.text)
    
    # Store sentiment in memory if session_id provided
    if req.session_id:
        memory_service.store_sentiment(req.session_id, sentiment)
    
    return SentimentResponse(**sentiment)

@app.post("/conversation-sentiment")
def analyze_conversation_sentiment(messages: List[dict]):
    """Analyze sentiment across entire conversation"""
    return sentiment_service.analyze_conversation_sentiment(messages)

@app.post("/voice-transcribe", response_model=VoiceTranscriptionResponse)
async def transcribe_voice(
    file: UploadFile = File(...),
    req: VoiceTranscriptionRequest = None
):
    """Transcribe voice message to text"""
    logger.info(f"[PYTHON] /voice-transcribe called for file: {file.filename}")
    
    try:
        # Save uploaded file temporarily
        temp_path = f"temp_audio_{file.filename}"
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Transcribe using voice service
        result = voice_service.transcribe_audio(temp_path, req.language if req else "en-US")
        
        # Clean up temp file
        os.remove(temp_path)
        
        return VoiceTranscriptionResponse(**result)
        
    except Exception as e:
        logger.error(f"Error in voice transcription: {e}")
        return VoiceTranscriptionResponse(
            success=False,
            text="",
            confidence=0.0,
            service_used="error",
            language=req.language if req else "en-US",
            error=str(e)
        )

@app.get("/conversation-context/{session_id}", response_model=ConversationContextResponse)
def get_conversation_context(session_id: str):
    """Get conversation context and history"""
    # Use get_relevant_context to match the response model
    context = memory_service.get_relevant_context(session_id, "")
    return ConversationContextResponse(
        recent_messages=context.get("recent_messages", []),
        user_preferences=context.get("user_preferences", {}),
        conversation_topics=context.get("conversation_topics", []),
        experience_level=context.get("experience_level"),
        recent_sentiment=context.get("recent_sentiment"),
        last_intent=context.get("last_intent")
    )

@app.get("/session-analytics/{session_id}")
def get_session_analytics(session_id: str):
    """Get analytics for a conversation session"""
    return memory_service.get_session_analytics(session_id)

@app.get("/supported-languages")
def get_supported_languages():
    """Get list of supported languages for voice transcription"""
    return voice_service.get_supported_languages()

@app.post("/cleanup-sessions")
def cleanup_old_sessions():
    """Clean up old conversation sessions"""
    return memory_service.cleanup_old_sessions()

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Cattleya NLP Service",
        "version": "4.0.0",
        "features": [
            "Dynamic AI-Powered Responses",
            "Web Search Integration",
            "Intent Recognition",
            "Entity Extraction", 
            "Sentiment Analysis",
            "Conversation Memory",
            "Voice Transcription",
            "Real-time Orchid Knowledge"
        ]
    }

# New endpoints for dynamic orchid functionality
@app.get("/orchid/search")
async def search_orchid_info(query: str):
    """Search for orchid information dynamically"""
    try:
        results = await knowledge_service.search_orchid_info(query)
        return {
            "query": query,
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        logger.error(f"Error searching orchid info: {e}")
        return {"error": str(e)}

@app.get("/orchid/recommendations")
async def get_orchid_recommendations(experience: str = "beginner", budget: str = "medium"):
    """Get AI-generated orchid recommendations"""
    try:
        recommendations = await knowledge_service.get_orchid_recommendations(experience, budget)
        return {
            "experience_level": experience,
            "budget": budget,
            "recommendations": recommendations
        }
    except Exception as e:
        logger.error(f"Error getting recommendations: {e}")
        return {"error": str(e)}

@app.post("/orchid/generate-response")
async def generate_orchid_response(request: ChatbotRequest):
    """Generate AI-powered orchid response"""
    try:
        # Analyze the message first
        analysis = analyze_message(request.message, request.context)
        
        # Get intent and entities
        final_intent = analysis['spaCy']['intent']
        final_entities = analysis['spaCy']['entities']
        
        # Analyze sentiment
        sentiment = sentiment_service.analyze_sentiment(request.message)
        
        # Generate dynamic response
        response = await knowledge_service.generate_dynamic_response(
            user_query=request.message,
            intent=final_intent,
            entities=final_entities,
            sentiment=sentiment,
            user_experience=request.user_experience
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error generating orchid response: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 