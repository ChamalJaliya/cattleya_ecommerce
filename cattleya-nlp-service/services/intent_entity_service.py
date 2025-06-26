import spacy
from spacy.matcher import Matcher
import os
from typing import Dict, List

# Load spaCy model
nlp = spacy.load("en_core_web_md")

# Intent patterns (multi-word)
intent_patterns = {
    "greeting": [[{"LOWER": {"IN": ["hello", "hi", "hey"]}}]],
    "order_support": [
        [{"LOWER": "track"}, {"LOWER": "order"}],
        [{"LOWER": "return"}, {"LOWER": "order"}],
        [{"LOWER": "shipping"}],
        [{"LOWER": "where"}, {"LOWER": "order"}],
    ],
    "care_advice": [
        [{"LOWER": "how"}, {"LOWER": "water"}],
        [{"LOWER": "light"}],
        [{"LOWER": "fertilizer"}],
        [{"LOWER": "care"}],
    ],
    "product_inquiry": [
        [{"LOWER": "in"}, {"LOWER": "stock"}],
        [{"LOWER": "how"}, {"LOWER": "much"}],
        [{"LOWER": "price"}],
        [{"LOWER": "orchid"}],
        [{"LOWER": "phalaenopsis"}],
        [{"LOWER": "cattleya"}],
        [{"LOWER": "product"}],
    ],
    "company_info": [
        [{"LOWER": "about"}, {"LOWER": "company"}],
        [{"LOWER": "who"}, {"LOWER": "are"}, {"LOWER": "you"}],
    ],
}

# Build spaCy matcher
matcher = Matcher(nlp.vocab)
for intent, patterns in intent_patterns.items():
    matcher.add(intent.upper(), patterns)

# Entity extraction (reuse from spacy_service)
def extract_entities(text):
    doc = nlp(text)
    entities = [f"{ent.text} ({ent.label_})" for ent in doc.ents]
    return entities

# OpenAI fallback for ambiguous/complex cases
def openai_intent_entity(message, context=None):
    import openai
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None
    prompt = (
        "Classify the following message into one of these intents: "
        "greeting, product_inquiry, order_support, care_advice, company_info, technical_support, out_of_scope. "
        "Also extract any product names, order numbers, or care-related entities. "
        f"Message: '{message}'\nContext: '{context or ''}'\n"
        "Respond as JSON: {\"intent\":..., \"confidence\":..., \"entities\": [...]}"
    )
    completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "system", "content": "You are an expert intent and entity classifier for an orchid e-commerce chatbot."},
                 {"role": "user", "content": prompt}],
        max_tokens=200,
        temperature=0.0,
    )
    import json
    try:
        # Try to parse the first JSON object in the response
        text = completion.choices[0].message.content
        start = text.find('{')
        end = text.rfind('}') + 1
        return json.loads(text[start:end])
    except Exception:
        return None

def analyze_message(message: str, context: str = None) -> Dict:
    doc = nlp(message + " " + (context or ""))
    matches = matcher(doc)
    spaCy_intent = "general"
    spaCy_confidence = 0.5
    for match_id, start, end in matches:
        intent = nlp.vocab.strings[match_id].lower()
        spaCy_intent = intent
        spaCy_confidence = 0.95
        break
    entities = extract_entities(message + " " + (context or ""))
    # OpenAI fallback
    llm_result = openai_intent_entity(message, context)
    return {
        "spaCy": {
            "intent": spaCy_intent,
            "confidence": spaCy_confidence,
            "entities": entities,
        },
        "llm": llm_result or {},
    } 