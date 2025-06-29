import spacy
import re
import logging
import asyncio
import aiohttp
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from textblob import TextBlob
import json
import os
import unicodedata
from difflib import SequenceMatcher

logger = logging.getLogger(__name__)

@dataclass
class ProductEntity:
    id: str
    name: str
    confidence: float
    matched_text: str
    match_type: str  # 'exact', 'fuzzy', 'attribute', 'category'

@dataclass
class Intent:
    name: str
    confidence: float
    patterns: List[str]
    action: str

@dataclass
class Entity:
    text: str
    type: str
    confidence: float
    source: str
    metadata: Dict[str, Any] = None

class EnhancedEntityService:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_sm")
        self.backend_url = os.getenv("NODEJS_BACKEND_URL", "http://localhost:3001")
        self.products_cache = []
        self.last_cache_update = 0
        self.cache_ttl = 300  # 5 minutes
        
        # Predefined intents with patterns
        self.intents = {
            "product_inquiry": {
                "patterns": [
                    r"show me", r"i want", r"looking for", r"need", r"search for",
                    r"find", r"get", r"buy", r"purchase", r"order", r"see",
                    r"what.*orchid", r"which.*orchid", r"tell me about",
                    r"information about", r"details about", r"price of",
                    r"cost of", r"how much", r"where.*buy", r"available"
                ],
                "action": "product_search"
            },
            "care_inquiry": {
                "patterns": [
                    r"care", r"maintenance", r"watering", r"light", r"temperature",
                    r"humidity", r"soil", r"potting", r"fertilizer", r"pruning",
                    r"how to", r"tips", r"advice", r"guide", r"instructions",
                    r"growing", r"cultivation", r"nurturing", r"keeping alive",
                    r"survival", r"thriving", r"healthy", r"problems", r"issues"
                ],
                "action": "care_guidance"
            },
            "pricing_inquiry": {
                "patterns": [
                    r"price", r"cost", r"expensive", r"cheap", r"budget",
                    r"affordable", r"value", r"worth", r"money", r"dollars",
                    r"euros", r"currency", r"payment", r"discount", r"sale",
                    r"offer", r"deal", r"promotion", r"special", r"clearance"
                ],
                "action": "pricing_info"
            },
            "shipping_inquiry": {
                "patterns": [
                    r"shipping", r"delivery", r"transport", r"ship", r"send",
                    r"arrive", r"receive", r"package", r"tracking", r"track",
                    r"location", r"address", r"postal", r"mail", r"courier",
                    r"express", r"standard", r"time", r"when", r"how long"
                ],
                "action": "shipping_info"
            },
            "technical_support": {
                "patterns": [
                    r"help", r"support", r"problem", r"issue", r"broken",
                    r"damaged", r"dead", r"dying", r"disease", r"pest",
                    r"bug", r"infection", r"rot", r"mold", r"fungus",
                    r"emergency", r"urgent", r"critical", r"save", r"rescue"
                ],
                "action": "technical_support"
            },
            "general_inquiry": {
                "patterns": [
                    r"hello", r"hi", r"hey", r"good", r"morning", r"afternoon",
                    r"evening", r"thanks", r"thank you", r"bye", r"goodbye",
                    r"what", r"how", r"why", r"when", r"where", r"who",
                    r"tell me", r"explain", r"describe", r"information"
                ],
                "action": "general_response"
            }
        }
        
        # Product attributes for matching
        self.product_attributes = {
            "colors": ["purple", "white", "pink", "yellow", "orange", "red", "blue", "green", "black", "brown"],
            "sizes": ["small", "medium", "large", "mini", "giant", "compact"],
            "difficulty": ["beginner", "easy", "intermediate", "advanced", "expert", "difficult"],
            "seasons": ["spring", "summer", "fall", "autumn", "winter", "year-round"],
            "environments": ["indoor", "outdoor", "greenhouse", "terrarium", "windowsill"],
            "care_levels": ["low maintenance", "high maintenance", "drought tolerant", "water loving"]
        }

    async def load_products_from_backend(self) -> List[Dict[str, Any]]:
        """Load all products from backend API with caching"""
        try:
            current_time = asyncio.get_event_loop().time()
            if (current_time - self.last_cache_update) < self.cache_ttl and self.products_cache:
                logger.info(f"Using cached products: {len(self.products_cache)} products")
                return self.products_cache

            async with aiohttp.ClientSession() as session:
                # Use the new /api/products/all endpoint for flat array
                async with session.get(f"{self.backend_url}/api/products/all", params={"isActive": "true"}) as response:
                    if response.status == 200:
                        try:
                            text_response = await response.text()
                            logger.info(f"Raw response from backend: {text_response[:500]}...")
                            
                            # Parse JSON response
                            response_data = json.loads(text_response)
                            logger.info(f"Backend response type: {type(response_data)}")
                            logger.info(f"Backend response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Not a dict'}")
                            
                            # Extract products from the response
                            products = []
                            
                            # Check if response has the expected structure
                            if isinstance(response_data, dict):
                                if 'data' in response_data:
                                    data = response_data['data']
                                    logger.info(f"Data field type: {type(data)}")
                                    logger.info(f"Data field keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
                                    
                                    if isinstance(data, dict):
                                        # Check if data contains a list directly
                                        if isinstance(data, list):
                                            products = data
                                            logger.info(f"Found products list directly in data: {len(products)} products")
                                        # Check if data has 'items' field
                                        elif 'items' in data and isinstance(data['items'], list):
                                            products = data['items']
                                            logger.info(f"Found products in data.items: {len(products)} products")
                                        # Check if data has the products directly
                                        elif 'success' in data and data.get('success'):
                                            # This might be the case where products are directly in data
                                            logger.info("Data has success=true, checking for direct product list")
                                            # Look for any list field that might contain products
                                            for key, value in data.items():
                                                if isinstance(value, list) and len(value) > 0:
                                                    # Check if first item looks like a product
                                                    if isinstance(value[0], dict) and 'name' in value[0]:
                                                        products = value
                                                        logger.info(f"Found products in data.{key}: {len(products)} products")
                                                        break
                                    else:
                                        logger.error(f"Data field is not a dict: {type(data)}")
                                else:
                                    logger.error("No 'data' field found in response")
                            else:
                                logger.error(f"Response is not a dict: {type(response_data)}")
                            
                            # Log the first few product names for debugging
                            if products:
                                product_names = [p.get('name', 'Unknown') for p in products[:5]]
                                logger.info(f"First 5 product names: {product_names}")
                                logger.info(f"Total products loaded: {len(products)}")
                                
                                # Update cache
                                self.products_cache = products
                                self.last_cache_update = current_time
                                
                                return products
                            else:
                                logger.error("No products found in response")
                                return []
                                
                        except json.JSONDecodeError as e:
                            logger.error(f"JSON decode error: {e}")
                            return []
                        except Exception as e:
                            logger.error(f"Error parsing response: {e}")
                            return []
                    else:
                        logger.error(f"Backend returned status {response.status}")
                        return []
        except Exception as e:
            logger.error(f"Error loading products: {e}")
            return []

    def extract_intent(self, message: str, product_entities: List[Dict[str, Any]] = None) -> Intent:
        """Extract intent from message using pattern matching and product detection"""
        message_lower = message.lower()
        best_intent = None
        best_confidence = 0.0
        
        # If products are found, prioritize product inquiry intent
        if product_entities and len(product_entities) > 0:
            logger.info(f"Products found in message ({len(product_entities)} products), setting intent to product_inquiry")
            return Intent(
                name="product_inquiry",
                confidence=0.9,
                patterns=["product_detected"],
                action="product_search"
            )
        
        for intent_name, intent_data in self.intents.items():
            confidence = 0.0
            matched_patterns = []
            
            for pattern in intent_data["patterns"]:
                if re.search(pattern, message_lower):
                    matched_patterns.append(pattern)
                    confidence += 0.3  # Base confidence for pattern match
            
            # Boost confidence for multiple pattern matches
            if len(matched_patterns) > 1:
                confidence += 0.2
            
            # Boost confidence for longer, more specific patterns
            for pattern in matched_patterns:
                if len(pattern) > 10:
                    confidence += 0.1
            
            if confidence > best_confidence:
                best_confidence = confidence
                best_intent = Intent(
                    name=intent_name,
                    confidence=min(confidence, 1.0),
                    patterns=matched_patterns,
                    action=intent_data["action"]
                )
        
        # Default to general inquiry if no strong intent found
        if not best_intent or best_intent.confidence < 0.3:
            best_intent = Intent(
                name="general_inquiry",
                confidence=0.5,
                patterns=[],
                action="general_response"
            )
        
        return best_intent

    async def extract_product_entities(self, message: str) -> List[Entity]:
        """Extract product entities from message using multiple strategies"""
        try:
            # Load products from backend
            products = await self.load_products_from_backend()
            
            logger.info(f"Using cached products: {len(products)} products")
            logger.info(f"Extracting product entities from message: '{message}'")
            
            # Get product names for matching
            product_names = [product.get('name', '') for product in products if product.get('name')]
            logger.info(f"Available products: {len(product_names)}")
            logger.info(f"First 10 product names: {product_names[:10]}")
            
            found_entities = []
            
            # Strategy 1: Exact match
            logger.info("Strategy 1: Exact match")
            for product in products:
                product_name = product.get('name', '').lower()
                if product_name and product_name in message.lower():
                    found_entities.append(Entity(
                        text=product.get('name', ''),
                        type='PRODUCT',
                        confidence=1.0,
                        source='exact_match',
                        metadata={
                            'product_id': product.get('id', ''),
                            'match_type': 'exact_match'
                        }
                    ))
                    logger.info(f"Exact match found: {product.get('name')}")
            
            # Strategy 2: Partial match
            logger.info("Strategy 2: Partial match")
            for product in products:
                product_name = product.get('name', '').lower()
                if product_name:
                    # Check if any word in product name appears in message
                    product_words = product_name.split()
                    for word in product_words:
                        if len(word) > 3 and word in message.lower():  # Only match words longer than 3 chars
                            found_entities.append(Entity(
                                text=product.get('name', ''),
                                type='PRODUCT',
                                confidence=0.8,
                                source='partial_match',
                                metadata={
                                    'product_id': product.get('id', ''),
                                    'match_type': 'partial_match'
                                }
                            ))
                            logger.info(f"Partial match found: '{word}' from '{product_name}' in message")
                            break
            
            # Strategy 3: Fuzzy match
            logger.info("Strategy 3: Fuzzy match")
            for product in products:
                product_name = product.get('name', '').lower()
                if product_name:
                    similarity = SequenceMatcher(None, message.lower(), product_name).ratio()
                    if similarity > 0.7:  # 70% similarity threshold
                        found_entities.append(Entity(
                            text=product.get('name', ''),
                            type='PRODUCT',
                            confidence=similarity,
                            source='fuzzy_match',
                            metadata={
                                'product_id': product.get('id', ''),
                                'match_type': 'fuzzy_match'
                            }
                        ))
                        logger.info(f"Fuzzy match found: '{product_name}' with similarity {similarity}")
            
            # Strategy 4: Category/Tag match
            logger.info("Strategy 4: Category/Tag match")
            for product in products:
                # Check category
                category = product.get('category', {}).get('name', '').lower() if isinstance(product.get('category'), dict) else str(product.get('category', '')).lower()
                if category and category in message.lower():
                    found_entities.append(Entity(
                        text=product.get('name', ''),
                        type='PRODUCT',
                        confidence=0.6,
                        source='category_match',
                        metadata={
                            'product_id': product.get('id', ''),
                            'match_type': 'category_match'
                        }
                    ))
                    logger.info(f"Category match found: '{category}' for '{product.get('name')}'")
                
                # Check tags
                tags = product.get('tags', [])
                for tag in tags:
                    if tag.lower() in message.lower():
                        found_entities.append(Entity(
                            text=product.get('name', ''),
                            type='PRODUCT',
                            confidence=0.6,
                            source='tag_match',
                            metadata={
                                'product_id': product.get('id', ''),
                                'match_type': 'tag_match'
                            }
                        ))
                        logger.info(f"Tag match found: '{tag}' for '{product.get('name')}'")
                        break
            
            # Remove duplicates and sort by confidence
            unique_entities = []
            seen_names = set()
            for entity in sorted(found_entities, key=lambda x: x.confidence, reverse=True):
                if entity.text not in seen_names:
                    unique_entities.append(entity)
                    seen_names.add(entity.text)
            
            logger.info(f"Final product entities found: {len(unique_entities)}")
            for entity in unique_entities:
                logger.info(f"  - {entity.text} (confidence: {entity.confidence}, source: {entity.source})")
            
            return unique_entities
            
        except Exception as e:
            logger.error(f"Error extracting product entities: {e}")
            return []

    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two strings using simple ratio"""
        if not text1 or not text2:
            return 0.0
        
        # Simple character-based similarity
        common_chars = sum(1 for c in text1 if c in text2)
        total_chars = max(len(text1), len(text2))
        return common_chars / total_chars if total_chars > 0 else 0.0

    def match_product_attributes(self, message: str, product: Dict[str, Any]) -> Optional[str]:
        """Match product attributes in the message"""
        product_description = product.get('description', '').lower()
        
        for attr_type, attr_values in self.product_attributes.items():
            for attr_value in attr_values:
                if attr_value in message:
                    # Check if this attribute is mentioned in product description
                    if attr_value in product_description:
                        return f"{attr_type}: {attr_value}"
        
        return None

    def extract_spacy_entities(self, message: str) -> List[Entity]:
        """Extract entities using spaCy"""
        doc = self.nlp(message)
        entities = []
        
        for ent in doc.ents:
            # Map spaCy entity types to our types
            entity_type = ent.label_
            if entity_type in ['PERSON', 'ORG', 'GPE']:
                entity_type = 'PRODUCT'  # Treat as potential product names
            
            entities.append(Entity(
                text=ent.text,
                type=entity_type,
                confidence=0.8,
                source='spacy',
                metadata={'spacy_label': ent.label_}
            ))
        
        return entities

    async def analyze_message(self, message: str) -> Dict[str, Any]:
        """Analyze message for intent and entities with enhanced product detection"""
        try:
            # Handle Unicode/emoji characters properly
            if isinstance(message, str):
                # Clean the message to handle emoji and special characters
                message = unicodedata.normalize('NFKC', message)
                # Remove or replace problematic characters
                message = message.encode('utf-8', errors='ignore').decode('utf-8')
            
            logger.info(f"Analyzing message: '{message}'")
            
            # Extract product entities
            product_entities = await self.extract_product_entities(message)
            
            # Determine intent based on entities and message content
            intent = self.extract_intent(message, product_entities)
            
            return {
                'intent': intent,
                'entities': product_entities,
                'products_found': len(product_entities),
                'message': message
            }
            
        except Exception as e:
            logger.error(f"Error analyzing message: {e}")
            # Return default analysis on error
            return {
                'intent': {'name': 'general_inquiry', 'confidence': 0.5, 'action': 'general_response', 'patterns': []},
                'entities': [],
                'products_found': 0,
                'message': message
            }

# Global instance
entity_service = EnhancedEntityService() 