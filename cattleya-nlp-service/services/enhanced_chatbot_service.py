import aiohttp
import asyncio
import logging
import os
from typing import List, Optional, Dict, Any
from dataclasses import dataclass
from services.enhanced_entity_service import EnhancedEntityService
from services.cattleya_knowledge_service import DynamicCattleyaKnowledgeService, OrchidInfo
from services.openai_service import generate_elaborative_description
from services.sentiment_analysis_service import SentimentAnalysisService
from services.conversation_memory_service import ConversationMemoryService

logger = logging.getLogger(__name__)

@dataclass
class Entity:
    text: str
    type: str
    confidence: float
    source: str

@dataclass
class ChatbotResponse:
    message: str
    products: List[dict]
    quick_replies: List[str]
    intent: str
    confidence: float
    entities: List[Entity]
    sentiment: dict
    metadata: Dict[str, Any]

class EnhancedChatbotService:
    def __init__(self):
        self.entity_extractor = EnhancedEntityService()
        self.knowledge_service = DynamicCattleyaKnowledgeService()
        self.backend_url = os.getenv("NODEJS_BACKEND_URL", "http://localhost:3001")
        self.sentiment_service = SentimentAnalysisService()
        self.conversation_memory = ConversationMemoryService()
        # Cache for product data to avoid repeated API calls
        self._product_cache = {}
        self._cache_ttl = 300  # 5 minutes

    async def get_products_from_backend(self, product_names: List[str]) -> List[dict]:
        """Fetch product details from NestJS backend API with caching"""
        try:
            logger.info(f"Fetching products for names: {product_names}")
            
            # Check cache first
            cache_key = "all_products"
            if cache_key in self._product_cache:
                cached_data = self._product_cache[cache_key]
                if cached_data['timestamp'] + self._cache_ttl > asyncio.get_event_loop().time():
                    logger.info("Using cached product data")
                    products = cached_data['data']
                else:
                    logger.info("Cache expired, fetching fresh data")
                    del self._product_cache[cache_key]
                    products = None
            else:
                products = None

            if products is None:
                async with aiohttp.ClientSession() as session:
                    async with session.get(f"{self.backend_url}/api/products/all", params={"isActive": "true"}) as response:
                        if response.status == 200:
                            try:
                                products_data = await response.json()
                                logger.info(f"Backend response type: {type(products_data)}")
                                
                                # Extract products from the response structure
                                products = []
                                if isinstance(products_data, dict):
                                    if 'data' in products_data:
                                        data = products_data['data']
                                        if isinstance(data, dict) and 'data' in data and isinstance(data['data'], list):
                                            products = data['data']
                                        elif isinstance(data, list):
                                            products = data
                                        elif isinstance(data, dict) and 'items' in data:
                                            products = data['items']
                                    else:
                                        logger.error("No 'data' field found in response")
                                elif isinstance(products_data, list):
                                    products = products_data
                                else:
                                    logger.error(f"Unexpected response format: {type(products_data)}")
                                    return []
                                
                                # Cache the results
                                self._product_cache[cache_key] = {
                                    'data': products,
                                    'timestamp': asyncio.get_event_loop().time()
                                }
                                logger.info(f"Cached {len(products)} products")
                                
                            except Exception as json_error:
                                logger.error(f"Error parsing JSON response: {json_error}")
                                return []
                        else:
                            logger.error(f"Failed to fetch products: {response.status}")
                            return []
            
            # Filter products by name or ID (fuzzy matching and exact ID match)
            matched_products = []
            for product_identifier in product_names:
                logger.info(f"Looking for product: {product_identifier}")
                for product in products:
                    if not isinstance(product, dict):
                        continue
                    # Match by name (case-insensitive, substring)
                    product_backend_name = product.get('name', '').lower()
                    if product_identifier.lower() in product_backend_name:
                        logger.info(f"Found match by name: {product.get('name')}")
                        matched_products.append(product)
                        continue
                    # Match by ID (exact)
                    if product_identifier == product.get('id'):
                        logger.info(f"Found match by ID: {product.get('name')}")
                        matched_products.append(product)
                        continue
            logger.info(f"Matched {len(matched_products)} products")
            return matched_products
            
        except Exception as e:
            logger.error(f"Error fetching products: {e}")
            return []

    def store_product_context(self, session_id: str, product: dict) -> None:
        """Store the last discussed product in session context"""
        try:
            context = {
                "last_product_id": product.get('id', ''),
                "last_product_name": product.get('name', ''),
                "last_product_data": product
            }
            self.conversation_memory.store_context(session_id, context)
            logger.info(f"Stored product context for session {session_id}: {product.get('name', '')}")
        except Exception as e:
            logger.error(f"Error storing product context: {e}")

    def get_last_product_context(self, session_id: str) -> Optional[dict]:
        """Retrieve the last discussed product from session context"""
        try:
            context = self.conversation_memory.get_conversation_context(session_id)
            last_product_data = context.get('context', {}).get('last_product_data')
            if last_product_data:
                logger.info(f"Retrieved product context for session {session_id}: {last_product_data.get('name', '')}")
                return last_product_data
            return None
        except Exception as e:
            logger.error(f"Error retrieving product context: {e}")
            return None

    def clear_product_context(self, session_id: str) -> None:
        """Clear the stored product context for a session"""
        try:
            self.conversation_memory.store_context(session_id, {
                "last_product_id": None,
                "last_product_name": None,
                "last_product_data": None
            })
            logger.info(f"Cleared product context for session {session_id}")
        except Exception as e:
            logger.error(f"Error clearing product context: {e}")

    async def handle_product_inquiry(self, message: str, entities: List[Entity], sentiment: dict, session_id: str = None) -> ChatbotResponse:
        """Handle product inquiry intent with smart response strategy"""
        try:
            logger.info(f"Handling product inquiry: {message}")
            
            # Extract product entities
            product_entities = [entity for entity in entities if entity.type == 'PRODUCT']
            
            if not product_entities:
                return await self.handle_general_inquiry(message, entities, sentiment)
            
            # Get products from backend
            product_names = [entity.text for entity in product_entities]
            products = await self.get_products_from_backend(product_names)
            
            if not products:
                return await self.handle_general_inquiry(message, entities, sentiment)
            
            # Create product cards with basic info (no AI calls initially)
            product_cards = []
            for product in products:
                product_dict = {
                    "id": product.get('id', ''),
                    "name": product.get('name', ''),
                    "description": product.get('description', ''),
                    "shortDescription": product.get('description', '')[:150] + "..." if len(product.get('description', '')) > 150 else product.get('description', ''),
                    "basePrice": product.get('basePrice', 0),
                    "salePrice": product.get('salePrice', None),
                    "isOnSale": product.get('salePrice', None) is not None,
                    "stockQuantity": product.get('stockQuantity', 0),
                    "images": product.get('images', []),
                    "category": product.get('category', {}).get('name', '') if isinstance(product.get('category'), dict) else str(product.get('category', '')),
                    "tags": product.get('tags', []),
                    "availableSizes": [],
                    "primaryColors": [],
                    "colorPattern": "",
                    "hasDetailedInfo": False,  # Flag to indicate if detailed info is available
                    "careInstructions": "",
                    "fertilizerInfo": "",
                    "wateringGuide": "",
                    "lightingGuide": "",
                    "temperatureGuide": "",
                    "humidityGuide": "",
                    "repottingGuide": "",
                    "bloomingTips": "",
                    "commonIssues": "",
                    "expertTips": ""
                }
                product_cards.append(product_dict)
            
            # Store product context if single product found
            if len(product_cards) == 1 and session_id:
                self.store_product_context(session_id, product_cards[0])
            
            # Generate smart response based on number of products found
            if len(product_cards) == 1:
                # Single product - give brief overview with option for details
                product = product_cards[0]
                response_message = f"🌸 I found the perfect orchid for you!\n\n**{product['name']}**\n{product['shortDescription']}\n\n💰 **Price:** ${product['basePrice']}"
                if product['isOnSale']:
                    response_message += f" (Sale: ${product['salePrice']})"
                response_message += f"\n\n📦 **Stock:** {product['stockQuantity']} available"
                
                quick_replies = [
                    "🌿 Get detailed care guide",
                    "💡 Expert tips & advice", 
                    "🛒 Add to cart",
                    "❤️ Add to wishlist",
                    "📋 Show me more orchids"
                ]
            else:
                # Multiple products - show summary with options
                response_message = f"🌸 I found {len(product_cards)} orchids that match your search:\n\n"
                for i, product in enumerate(product_cards[:3], 1):  # Show first 3
                    response_message += f"{i}. **{product['name']}** - ${product['basePrice']}\n"
                
                if len(product_cards) > 3:
                    response_message += f"\n... and {len(product_cards) - 3} more options"
                
                response_message += "\n\nWhich one would you like to learn more about?"
                
                quick_replies = [
                    "🌿 Get care guides for all",
                    "💡 Expert advice",
                    "🛒 Add selected to cart",
                    "📋 Show me more options",
                    "🔍 Filter by price"
                ]
            
            return ChatbotResponse(
                message=response_message,
                products=product_cards,
                quick_replies=quick_replies,
                intent="product_inquiry",
                confidence=0.95,
                entities=entities,
                sentiment=sentiment,
                metadata={
                    "intent_confidence": 0.95,
                    "response_type": "product_summary",
                    "products_found": len(product_cards),
                    "has_detailed_info": False,
                    "interactive_features": ["cart", "wishlist", "care_guide", "expert_tips"],
                    "suggested_actions": ["get_details", "add_to_cart", "compare_products"]
                }
            )
            
        except Exception as e:
            logger.error(f"Error in handle_product_inquiry: {e}")
            return await self.handle_general_inquiry(message, entities, sentiment)

    async def handle_detailed_product_request(self, product_id: str, message: str, entities: List[Entity], sentiment: dict, session_id: str) -> ChatbotResponse:
        """Handle requests for detailed product information with AI-generated content (optimized: one LLM call, timeout, logging, fallback)"""
        try:
            logger.info(f"Generating detailed info for product: {product_id}")
            products = await self.get_products_from_backend([product_id])
            if not products:
                return ChatbotResponse(
                    message="I couldn't find that specific orchid. Could you try searching again?",
                    products=[],
                    quick_replies=["Search orchids", "Browse categories", "Get help"],
                    intent="product_inquiry",
                    confidence=0.7,
                    entities=entities,
                    sentiment=sentiment,
                    metadata={"error": "Product not found"}
                )
            product = products[0]
            logger.info("Calling OpenAI for detailed product response...")
            import asyncio
            try:
                comprehensive_data = await asyncio.wait_for(
                    self.generate_comprehensive_product_data(product, message),
                    timeout=30
                )
                logger.info("OpenAI call complete.")
            except asyncio.TimeoutError:
                logger.error("OpenAI call timed out!")
                comprehensive_data = {
                    "aiResponse": "Sorry, the response took too long. Please try again.",
                    "careInstructions": "",
                    "fertilizerInfo": "",
                    "wateringGuide": "",
                    "lightingGuide": "",
                    "temperatureGuide": "",
                    "humidityGuide": "",
                    "repottingGuide": "",
                    "bloomingTips": "",
                    "commonIssues": "",
                    "expertTips": ""
                }
            except Exception as e:
                logger.error(f"OpenAI call failed: {e}")
                comprehensive_data = {
                    "aiResponse": "Sorry, something went wrong. Please try again.",
                    "careInstructions": "",
                    "fertilizerInfo": "",
                    "wateringGuide": "",
                    "lightingGuide": "",
                    "temperatureGuide": "",
                    "humidityGuide": "",
                    "repottingGuide": "",
                    "bloomingTips": "",
                    "commonIssues": "",
                    "expertTips": ""
                }
            product_dict = {
                "id": product.get('id', ''),
                "name": product.get('name', ''),
                "description": product.get('description', ''),
                "shortDescription": product.get('description', '')[:150] + "..." if len(product.get('description', '')) > 150 else product.get('description', ''),
                "basePrice": product.get('basePrice', 0),
                "salePrice": product.get('salePrice', None),
                "isOnSale": product.get('salePrice', None) is not None,
                "stockQuantity": product.get('stockQuantity', 0),
                "images": product.get('images', []),
                "category": product.get('category', {}).get('name', '') if isinstance(product.get('category'), dict) else str(product.get('category', '')),
                "tags": product.get('tags', []),
                "availableSizes": [],
                "primaryColors": [],
                "colorPattern": "",
                "hasDetailedInfo": True,
                "aiResponse": comprehensive_data.get('aiResponse', ''),
                "careInstructions": comprehensive_data.get('careInstructions', ''),
                "fertilizerInfo": comprehensive_data.get('fertilizerInfo', ''),
                "wateringGuide": comprehensive_data.get('wateringGuide', ''),
                "lightingGuide": comprehensive_data.get('lightingGuide', ''),
                "temperatureGuide": comprehensive_data.get('temperatureGuide', ''),
                "humidityGuide": comprehensive_data.get('humidityGuide', ''),
                "repottingGuide": comprehensive_data.get('repottingGuide', ''),
                "bloomingTips": comprehensive_data.get('bloomingTips', ''),
                "commonIssues": comprehensive_data.get('commonIssues', ''),
                "expertTips": comprehensive_data.get('expertTips', '')
            }
            quick_replies = [
                "🛒 Add to cart",
                "❤️ Add to wishlist", 
                "📞 Contact expert",
                "📋 Show similar orchids",
                "🌿 Care reminders"
            ]
            return ChatbotResponse(
                message=comprehensive_data.get('aiResponse', f"🌸 Here's everything you need to know about the {product_dict['name']}!"),
                products=[product_dict],
                quick_replies=quick_replies,
                intent="detailed_product_inquiry",
                confidence=0.95,
                entities=entities,
                sentiment=sentiment,
                metadata={
                    "intent_confidence": 0.95,
                    "response_type": "detailed_product_response",
                    "hasDetailedInfo": True,  # This triggers ComprehensiveProductGuide
                    "products_found": 1,
                    "comprehensive_data": comprehensive_data,
                    "interactive_features": ["cart", "wishlist", "care_guide", "expert_tips"],
                    "suggested_actions": ["add_to_cart", "add_to_wishlist", "get_similar"]
                }
            )
        except Exception as e:
            logger.error(f"Error in handle_detailed_product_request: {e}")
            return ChatbotResponse(
                message="I'm having trouble generating detailed information right now. Please try again in a moment.",
                products=[],
                quick_replies=["Try again", "Contact support", "Browse products"],
                intent="detailed_product_inquiry",
                confidence=0.5,
                entities=entities,
                sentiment=sentiment,
                metadata={"error": str(e)}
            )

    async def generate_comprehensive_product_data(self, product: dict, user_message: str) -> dict:
        """Generate comprehensive product data using AI (optimized: one call, timeout, logging)"""
        try:
            logger.info(f"Generating comprehensive data for: {product.get('name', 'Unknown')}")
            
            # Create product info for AI context
            product_info = OrchidInfo(
                name=product.get('name', ''),
                description=product.get('description', ''),
                care_requirements={},
                blooming_info="",
                difficulty="intermediate",
                price_range=f"${product.get('basePrice', 0)}",
                source="database",
                confidence=0.9
            )
            
            # Search for additional information
            search_query = f"{product.get('name', '')} orchid care growing guide"
            search_results = await self.knowledge_service.search_orchid_info(search_query)
            
            # Generate comprehensive response with product context
            response_data = await self.knowledge_service.generate_ai_response(
                search_results, 
                user_message, 
                "product_inquiry",
                product  # Pass product for context
            )
            
            logger.info("[OPENAI] Raw LLM response for debugging:")
            logger.info(response_data)
            
            return response_data
            
        except Exception as e:
            logger.error(f"Error generating comprehensive product data: {e}")
            return {
                "aiResponse": f"I'd be happy to tell you more about the {product.get('name', 'orchid')}! This is a beautiful orchid that requires standard care.",
                "careInstructions": "Provide bright, indirect light and water when the medium is dry.",
                "fertilizerInfo": "Use a balanced orchid fertilizer during the growing season.",
                "wateringGuide": "Water thoroughly when the top layer feels dry to the touch.",
                "lightingGuide": "Bright, indirect light is ideal for most orchids.",
                "temperatureGuide": "Maintain temperatures between 65-80°F during the day.",
                "humidityGuide": "Aim for 50-70% humidity for optimal growth.",
                "repottingGuide": "Repot every 1-2 years using fresh orchid mix.",
                "bloomingTips": "Provide a slight temperature drop at night to encourage blooming.",
                "commonIssues": "Watch for overwatering and inadequate light.",
                "expertTips": "Group orchids together to increase humidity naturally."
            }

    async def handle_care_inquiry(self, message: str, entities: List[Entity], sentiment: dict, session_id: str) -> ChatbotResponse:
        """Handle care inquiry intent with optimized AI response"""
        try:
            logger.info(f"Handling care inquiry: {message}")
            
            # Extract product entities
            product_entities = [entity for entity in entities if entity.type == 'PRODUCT']
            
            # If no product mentioned, check for last product context
            if not product_entities and session_id:
                last_product = self.get_last_product_context(session_id)
                if last_product:
                    logger.info(f"Using last product context for care inquiry: {last_product.get('name', '')}")
                    product_entities = [Entity(
                        text=last_product.get('name', ''),
                        type='PRODUCT',
                        confidence=0.9,
                        source='context'
                    )]
            
            if product_entities:
                # Get products from backend
                product_names = [entity.text for entity in product_entities]
                products = await self.get_products_from_backend(product_names)
                
                if products:
                    # Generate comprehensive care response for specific products
                    care_response = await self.generate_comprehensive_care_response(products, message)
                    quick_replies = [
                        "🌿 More care tips",
                        "💡 Expert advice",
                        "🛒 Buy this orchid",
                        "📋 Show me other orchids",
                        "❓ Ask about specific care"
                    ]
                    
                    return ChatbotResponse(
                        message=care_response,
                        products=products,
                        quick_replies=quick_replies,
                        intent="care_inquiry",
                        confidence=0.9,
                        entities=entities,
                        sentiment=sentiment,
                        metadata={
                            "intent_confidence": 0.9,
                            "response_type": "product_specific_care",
                            "products_mentioned": len(products),
                            "hasDetailedInfo": len(products) == 1  # Show comprehensive guide for single product
                        }
                    )
            
            # Fallback to general care response
            general_care = await self.generate_general_care_response(message)
            quick_replies = [
                "🌿 Care guide",
                "💡 Expert tips",
                "🛒 Browse orchids",
                "📞 Contact expert",
                "❓ Ask specific question"
            ]
            
            return ChatbotResponse(
                message=general_care,
                products=[],
                quick_replies=quick_replies,
                intent="care_inquiry",
                confidence=0.8,
                entities=entities,
                sentiment=sentiment,
                metadata={
                    "intent_confidence": 0.8,
                    "response_type": "general_care"
                }
            )
            
        except Exception as e:
            logger.error(f"Error in care inquiry handler: {e}")
            return ChatbotResponse(
                message="🌸 **General Orchid Care Guide** 🌸\n\n💧 Water when medium is 70-80% dry\n☀️ Bright, indirect light\n🌡️ 65-80°F day, 55-65°F night\n💨 50-70% humidity\n🌱 Balanced orchid fertilizer every 2-4 weeks",
                products=[],
                quick_replies=["🌿 Care guide", "💡 Expert tips", "🛒 Browse orchids", "📞 Contact expert"],
                intent="care_inquiry",
                confidence=0.7,
                entities=entities,
                sentiment=sentiment,
                metadata={"error": str(e)}
            )

    async def generate_comprehensive_care_response(self, products: List[dict], message: str) -> str:
        """Generate comprehensive care response for specific products in ONE AI call"""
        try:
            product_names = [p.get('name', '') for p in products]
            product_info = "\n".join([f"- {name}" for name in product_names])
            
            prompt = f"""You are an AI orchid expert. Generate comprehensive care advice for these specific orchids:

**ORCHIDS:**
{product_info}

**USER'S QUESTION:** {message}

**YOUR TASK:**
Provide detailed, practical care advice that covers:
- Watering requirements
- Light needs
- Temperature preferences
- Humidity requirements
- Fertilizing schedule
- Common issues and solutions
- Expert tips

Make it engaging, informative, and specific to these orchid types. Use emojis and clear language. Keep it comprehensive but concise."""
            
            response_data = await self.knowledge_service.generate_ai_response([], prompt, "care_inquiry")
            
            if isinstance(response_data, dict) and 'aiResponse' in response_data:
                return response_data['aiResponse']
            elif isinstance(response_data, str):
                return response_data
            else:
                return f"🌸 Here's comprehensive care advice for {', '.join(product_names)}:\n\n💧 **Watering**: Water when medium is 70-80% dry\n☀️ **Light**: Bright, indirect light\n🌡️ **Temperature**: 65-80°F day, 55-65°F night\n💨 **Humidity**: 50-70% humidity\n🌱 **Fertilize**: Balanced orchid fertilizer every 2-4 weeks"
                
        except Exception as e:
            logger.error(f"Error generating comprehensive care response: {e}")
            return f"🌸 Here's care advice for {', '.join([p.get('name', '') for p in products])}:\n\n💧 Water when medium is 70-80% dry\n☀️ Bright, indirect light\n🌡️ 65-80°F day, 55-65°F night\n💨 50-70% humidity"

    async def generate_general_care_response(self, message: str) -> str:
        """Generate general care response in ONE AI call"""
        try:
            prompt = f"""You are an AI orchid expert. Generate comprehensive general orchid care advice:

**USER'S QUESTION:** {message}

**YOUR TASK:**
Provide detailed, practical care advice that covers:
- Watering requirements
- Light needs
- Temperature preferences
- Humidity requirements
- Fertilizing schedule
- Common issues and solutions
- Expert tips

Make it engaging, informative, and helpful for orchid growers. Use emojis and clear language."""
            
            response_data = await self.knowledge_service.generate_ai_response([], prompt, "care_inquiry")
            
            if isinstance(response_data, dict) and 'aiResponse' in response_data:
                return response_data['aiResponse']
            elif isinstance(response_data, str):
                return response_data
            else:
                return "🌸 **General Orchid Care Guide** 🌸\n\n💧 **Watering**: Water when medium is 70-80% dry\n☀️ **Light**: Bright, indirect light\n🌡️ **Temperature**: 65-80°F day, 55-65°F night\n💨 **Humidity**: 50-70% humidity\n🌱 **Fertilize**: Balanced orchid fertilizer every 2-4 weeks\n⚠️ **Common Issues**: Root rot (overwatering), sunburn (too much light)"
                
        except Exception as e:
            logger.error(f"Error generating general care response: {e}")
            return "🌸 **General Orchid Care Guide** 🌸\n\n💧 Water when medium is 70-80% dry\n☀️ Bright, indirect light\n🌡️ 65-80°F day, 55-65°F night\n💨 50-70% humidity\n🌱 Balanced orchid fertilizer every 2-4 weeks"

    async def handle_pricing_inquiry(self, message: str, entities: List[Entity], sentiment: dict, session_id: str) -> ChatbotResponse:
        """Handle pricing inquiry intent with optimized response"""
        try:
            product_names = [entity.text for entity in entities if entity.type == 'PRODUCT']
            
            if product_names:
                products = await self.get_products_from_backend(product_names)
                if products:
                    # Generate pricing response in ONE call
                    pricing_response = await self.generate_pricing_response(products, message)
                    quick_replies = ["Add to cart", "Payment options", "Shipping costs", "Discounts"]
                else:
                    pricing_response = "Our orchids range from $15 for beginner-friendly varieties to $200+ for rare specimens. We offer competitive pricing and value for money. Would you like to see our current selection?"
                    quick_replies = ["Browse orchids", "Price ranges", "Payment options", "Shipping costs"]
            else:
                pricing_response = "Our orchids range from $15 for beginner-friendly varieties to $200+ for rare specimens. We offer competitive pricing and value for money. Would you like to see our current selection?"
                quick_replies = ["Browse orchids", "Price ranges", "Payment options", "Shipping costs"]
            
            return ChatbotResponse(
                message=pricing_response,
                products=products if 'products' in locals() else [],
                quick_replies=quick_replies,
                intent="pricing_inquiry",
                confidence=0.8,
                entities=entities,
                sentiment=sentiment,
                metadata={
                    "pricing_info": True,
                    "intent_confidence": 0.8,
                    "response_type": "pricing_guidance"
                }
            )
            
        except Exception as e:
            logger.error(f"Error in pricing inquiry handler: {e}")
            return ChatbotResponse(
                message="Our orchids range from $15 for beginner-friendly varieties to $200+ for rare specimens. We offer competitive pricing and value for money.",
                products=[],
                quick_replies=["Browse orchids", "Price ranges", "Payment options", "Shipping costs"],
                intent="pricing_inquiry",
                confidence=0.6,
                entities=entities,
                sentiment=sentiment,
                metadata={"error": str(e)}
            )

    async def generate_pricing_response(self, products: List[dict], message: str) -> str:
        """Generate pricing response for specific products in ONE AI call"""
        try:
            product_info = "\n".join([f"- {p.get('name', '')}: ${p.get('basePrice', 0)}" for p in products])
            
            prompt = f"""You are an AI orchid sales consultant. Generate pricing information for these specific orchids:

**PRODUCTS:**
{product_info}

**USER'S QUESTION:** {message}

**YOUR TASK:**
Provide detailed pricing information that covers:
- Individual product prices
- Value for money explanation
- Any special offers or discounts
- Payment options
- Shipping costs
- Return policy

Make it engaging, informative, and sales-oriented. Use emojis and clear language."""
            
            response_data = await self.knowledge_service.generate_ai_response([], prompt, "pricing_inquiry")
            
            if isinstance(response_data, dict) and 'aiResponse' in response_data:
                return response_data['aiResponse']
            elif isinstance(response_data, str):
                return response_data
            else:
                return f"🌸 **Pricing Information** 🌸\n\n{product_info}\n\n💎 **Value**: Each orchid is carefully selected for quality and beauty\n💳 **Payment**: We accept all major credit cards and PayPal\n🚚 **Shipping**: Free shipping on orders over $50\n🔄 **Returns**: 30-day satisfaction guarantee"
                
        except Exception as e:
            logger.error(f"Error generating pricing response: {e}")
            product_info = "\n".join([f"- {p.get('name', '')}: ${p.get('basePrice', 0)}" for p in products])
            return f"🌸 **Pricing Information** 🌸\n\n{product_info}\n\n💎 Each orchid is carefully selected for quality and beauty\n💳 We accept all major credit cards and PayPal\n🚚 Free shipping on orders over $50"

    async def handle_shipping_inquiry(self, message: str, entities: List[Entity], sentiment: dict, session_id: str) -> ChatbotResponse:
        """Handle shipping inquiry intent"""
        try:
            ai_response = "We offer safe and secure shipping for all our orchids! Standard shipping takes 3-5 business days and costs $12. Express shipping (1-2 days) is available for $25. All orchids are carefully packaged to ensure they arrive healthy and ready to thrive."
            quick_replies = ["Shipping rates", "Delivery time", "Packaging info", "Track order"]
            
            return ChatbotResponse(
                message=ai_response,
                products=[],
                quick_replies=quick_replies,
                intent="shipping_inquiry",
                confidence=0.9,
                entities=entities,
                sentiment=sentiment,
                metadata={
                    "shipping_options": ["standard", "express"],
                    "delivery_times": ["3-5 days", "1-2 days"],
                    "intent_confidence": 0.9,
                    "response_type": "shipping_info"
                }
            )
            
        except Exception as e:
            logger.error(f"Error in shipping inquiry handler: {e}")
            return ChatbotResponse(
                message="We offer safe shipping for all our orchids! Standard shipping takes 3-5 days for $12. What would you like to know about our shipping?",
                products=[],
                quick_replies=["Shipping rates", "Delivery time", "Packaging info", "Track order"],
                intent="shipping_inquiry",
                confidence=0.8,
                entities=entities,
                sentiment=sentiment,
                metadata={"error": str(e)}
            )

    async def handle_technical_support(self, message: str, entities: List[Entity], sentiment: dict, session_id: str) -> ChatbotResponse:
        """Handle technical support intent"""
        try:
            # Check sentiment for urgency
            urgency = sentiment.get('urgency', 'low')
            
            if urgency in ['high', 'critical']:
                ai_response = "I understand this is urgent! Let me help you immediately. For critical orchid issues, please contact our expert support team right away at support@cattleyaorchids.com or call us at 1-800-ORCHIDS. They can provide immediate assistance."
                quick_replies = ["Contact support", "Emergency care", "Expert help", "Call now"]
            else:
                ai_response = "I'm here to help with any orchid issues! Please describe the problem you're experiencing, and I'll provide guidance. For complex issues, our expert team is always available to assist."
                quick_replies = ["Describe problem", "Contact support", "Care guide", "Common issues"]
            
            return ChatbotResponse(
                message=ai_response,
                products=[],
                quick_replies=quick_replies,
                intent="technical_support",
                confidence=0.9,
                entities=entities,
                sentiment=sentiment,
                metadata={
                    "urgency": urgency,
                    "support_contact": "support@cattleyaorchids.com",
                    "intent_confidence": 0.9,
                    "response_type": "technical_support"
                }
            )
            
        except Exception as e:
            logger.error(f"Error in technical support handler: {e}")
            return ChatbotResponse(
                message="I'm here to help with any orchid issues! Please describe the problem you're experiencing.",
                products=[],
                quick_replies=["Describe problem", "Contact support", "Care guide", "Common issues"],
                intent="technical_support",
                confidence=0.8,
                entities=entities,
                sentiment=sentiment,
                metadata={"error": str(e)}
            )

    async def handle_general_inquiry(self, message: str, entities: List[Entity], sentiment: dict, session_id: str) -> ChatbotResponse:
        """Handle general inquiry intent with optimized response"""
        try:
            logger.info(f"Handling general inquiry: {message}")
            
            # Generate general response in ONE call
            general_response = await self.generate_general_response(message)
            quick_replies = ["Show me orchids", "Care guide", "About us", "Contact support"]
            
            return ChatbotResponse(
                message=general_response,
                products=[],
                quick_replies=quick_replies,
                intent="general_inquiry",
                confidence=0.7,
                entities=entities,
                sentiment=sentiment,
                metadata={
                    "intent_confidence": 0.7,
                    "response_type": "general_response"
                }
            )
            
        except Exception as e:
            logger.error(f"Error in general inquiry handler: {e}")
            return ChatbotResponse(
                message="Hello! I'm your Cattleya orchid expert. How can I help you today?",
                products=[],
                quick_replies=["Show me orchids", "Care guide", "About us", "Contact support"],
                intent="general_inquiry",
                confidence=0.6,
                entities=entities,
                sentiment=sentiment,
                metadata={"error": str(e)}
            )

    async def generate_general_response(self, message: str) -> str:
        """Generate general response in ONE AI call"""
        try:
            prompt = f"""You are an AI orchid expert and sales consultant for Cattleya Orchids. Generate a friendly, helpful response to this general inquiry:

**USER'S MESSAGE:** {message}

**YOUR TASK:**
Provide a warm, informative response that:
- Welcomes the user warmly
- Shows expertise in orchids
- Offers helpful guidance
- Encourages further interaction
- Uses emojis and engaging language
- Mentions Cattleya Orchids' expertise

Make it sound like a passionate orchid expert speaking to a friend."""
            
            response_data = await self.knowledge_service.generate_ai_response([], prompt, "general_inquiry")
            
            if isinstance(response_data, dict) and 'aiResponse' in response_data:
                return response_data['aiResponse']
            elif isinstance(response_data, str):
                return response_data
            else:
                return "🌸 Hello! I'm your Cattleya orchid expert, here to help you discover the beauty and joy of growing orchids! 🌺 Whether you're a beginner or experienced grower, I can provide personalized advice, care tips, and help you find the perfect orchid for your home. What would you like to know about today?"
                
        except Exception as e:
            logger.error(f"Error generating general response: {e}")
            return "🌸 Hello! I'm your Cattleya orchid expert, here to help you discover the beauty and joy of growing orchids! 🌺 What would you like to know about today?"

    async def process_message(self, message: str, session_id: str) -> ChatbotResponse:
        """Main method to process user message and generate response"""
        try:
            logger.info(f"[DEBUG] Processing message: {message}")
            
            # Check for detailed product requests first (before intent analysis)
            detailed_request_keywords = [
                "detailed", "care guide", "expert tips", "comprehensive", 
                "full guide", "detailed info", "tell me more", "more details",
                "care instructions", "watering guide", "lighting guide"
            ]
            
            # Check if this is a request for detailed information
            if any(keyword in message.lower() for keyword in detailed_request_keywords):
                # Try to extract product ID from context or previous messages
                # For now, we'll look for product names in the message
                analysis = await self.entity_extractor.analyze_message(message)
                entities = analysis.get('entities', [])
                product_entities = [entity for entity in entities if entity.type == 'PRODUCT']
                
                if product_entities:
                    # Get the first product mentioned
                    product_name = product_entities[0].text
                    products = await self.get_products_from_backend([product_name])
                    if products:
                        return await self.handle_detailed_product_request(products[0].get('id', ''), message, entities, self.sentiment_service.analyze_sentiment(message), session_id)
                else:
                    # No product mentioned, check for last product context
                    last_product = self.get_last_product_context(session_id)
                    if last_product:
                        logger.info(f"Using last product context: {last_product.get('name', '')}")
                        return await self.handle_detailed_product_request(last_product.get('id', ''), message, entities, self.sentiment_service.analyze_sentiment(message), session_id)
            
            # Analyze message for intent and entities
            analysis = await self.entity_extractor.analyze_message(message)
            logger.info(f"[DEBUG] Analysis result: {analysis}")
            
            intent = analysis.get('intent', {})
            entities = analysis.get('entities', [])
            
            logger.info(f"[DEBUG] Extracted intent: {intent}")
            logger.info(f"[DEBUG] Extracted entities: {len(entities)} entities")
            for entity in entities:
                logger.info(f"[DEBUG] Entity: {entity.text} (type: {entity.type}, confidence: {entity.confidence})")
            
            # Analyze sentiment
            sentiment = self.sentiment_service.analyze_sentiment(message)
            
            # Route to appropriate handler based on intent
            # Patch: handle both dict and object for intent
            if isinstance(intent, dict):
                intent_name = intent.get('name', 'general_inquiry')
            else:
                # Try to get name attribute, fallback to str
                intent_name = getattr(intent, 'name', 'general_inquiry')
            logger.info(f"[DEBUG] Intent name: {intent_name}")
            
            if intent_name == 'product_inquiry':
                logger.info(f"[DEBUG] Routing to product_inquiry handler")
                return await self.handle_product_inquiry(message, entities, sentiment, session_id)
            elif intent_name == 'care_inquiry':
                logger.info(f"[DEBUG] Routing to care_inquiry handler")
                return await self.handle_care_inquiry(message, entities, sentiment, session_id)
            elif intent_name == 'pricing_inquiry':
                logger.info(f"[DEBUG] Routing to pricing_inquiry handler")
                return await self.handle_pricing_inquiry(message, entities, sentiment, session_id)
            elif intent_name == 'shipping_inquiry':
                logger.info(f"[DEBUG] Routing to shipping_inquiry handler")
                return await self.handle_shipping_inquiry(message, entities, sentiment, session_id)
            elif intent_name == 'technical_support':
                logger.info(f"[DEBUG] Routing to technical_support handler")
                return await self.handle_technical_support(message, entities, sentiment, session_id)
            else:
                logger.info(f"[DEBUG] Routing to general_inquiry handler (default)")
                return await self.handle_general_inquiry(message, entities, sentiment, session_id)
                
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return ChatbotResponse(
                message="I apologize for the confusion. How can I help you with your orchid needs today?",
                products=[],
                quick_replies=["Show me orchids", "Care guide", "Contact support", "About us"],
                intent="general_inquiry",
                confidence=0.5,
                entities=[],
                sentiment={"polarity": 0, "subjectivity": 0, "sentiment_class": "neutral"},
                metadata={"error": str(e)}
            )

# Global instance
enhanced_chatbot = EnhancedChatbotService() 