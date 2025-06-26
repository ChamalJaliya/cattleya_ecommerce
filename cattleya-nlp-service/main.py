from fastapi import FastAPI, Body
from pydantic import BaseModel
from typing import Optional
import os
import spacy
import logging

# Import our services
from services.intent_entity_service import analyze_message
from services.openai_service import generate_elaborative_description
from services.spacy_service import generate_spacy_description

app = FastAPI(title="Cattleya NLP Service", version="1.0.0")

# Load spaCy model once
nlp = spacy.load("en_core_web_md")

# Try to import OpenAI if available
try:
    import openai
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if OPENAI_API_KEY:
        openai.api_key = OPENAI_API_KEY
    else:
        openai = None
except ImportError:
    openai = None
    OPENAI_API_KEY = None

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AnalyzeRequest(BaseModel):
    message: str
    context: Optional[str] = None

class AnalyzeResponse(BaseModel):
    spaCy: dict
    llm: dict
    final_intent: str
    final_entities: list
    confidence: float

class ElaborateRequest(BaseModel):
    product_name: str
    context: Optional[str] = None

class ElaborateResponse(BaseModel):
    product_name: str
    description: str
    method: str

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    """Hybrid intent and entity analysis using spaCy + OpenAI"""
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
    
    logger.info(f"[PYTHON] /analyze final_intent: {final_intent}, final_entities: {final_entities}, confidence: {final_confidence}")
    
    return AnalyzeResponse(
        spaCy=analysis['spaCy'],
        llm=analysis.get('llm', {}),
        final_intent=final_intent,
        final_entities=final_entities,
        confidence=final_confidence
    )

@app.post("/elaborate", response_model=ElaborateResponse)
def elaborate_product(req: ElaborateRequest):
    """Generate creative, elaborative product descriptions"""
    logger.info(f"[PYTHON] /elaborate called for: {req.product_name} | context: {req.context}")
    logger.info(f"Elaborating product: {req.product_name}")
    
    try:
        # Try OpenAI first for creative generation
        if openai and OPENAI_API_KEY:
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

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "spacy_model": "en_core_web_md", "openai_available": openai is not None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 