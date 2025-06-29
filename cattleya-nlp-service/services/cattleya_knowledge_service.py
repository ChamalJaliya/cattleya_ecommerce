import json
import os
import asyncio
import aiohttp
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import logging
import re
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

@dataclass
class OrchidInfo:
    name: str
    description: str
    care_requirements: Dict[str, str]
    blooming_info: str
    difficulty: str
    price_range: str
    source: str
    confidence: float

class DynamicCattleyaKnowledgeService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.search_api_key = os.getenv("SEARCH_API_KEY", "your_search_api_key")  # SerpAPI, Google Custom Search, etc.
        self.cache = {}
        
    async def search_orchid_info(self, query: str) -> List[Dict[str, Any]]:
        """Search the web for orchid information using AI-powered search"""
        try:
            logger.info(f"Searching for orchid info: {query}")
            search_results = []
            
            # Try multiple search approaches
            search_methods = [
                self._search_serpapi,
                self._search_google,
                self._search_duckduckgo,
                self._scrape_orchid_sites
            ]
            
            for search_method in search_methods:
                try:
                    if search_method == self._search_serpapi and not self.search_api_key:
                        continue  # Skip if no API key
                    
                    results = await search_method(query)
                    if results:
                        search_results.extend(results)
                        logger.info(f"Found {len(results)} results using {search_method.__name__}")
                        break  # Use first successful method
                        
                except Exception as e:
                    logger.warning(f"Search method {search_method.__name__} failed: {e}")
                    continue
            
            # If no results from APIs, use fallback knowledge
            if not search_results:
                logger.info("No web search results, using fallback orchid knowledge")
                search_results = self._get_fallback_orchid_knowledge(query)
            
            logger.info(f"Total search results: {len(search_results)}")
            return search_results
            
        except Exception as e:
            logger.error(f"Error searching orchid info: {e}")
            return self._get_fallback_orchid_knowledge(query)
    
    async def _search_serpapi(self, query: str) -> List[Dict[str, Any]]:
        """Search using SerpAPI"""
        try:
            async with aiohttp.ClientSession() as session:
                url = "https://serpapi.com/search"
                params = {
                    "q": f"{query} orchid care growing guide",
                    "api_key": self.search_api_key,
                    "engine": "google",
                    "num": 10
                }
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("organic_results", [])
                    return []
        except Exception as e:
            logger.error(f"SerpAPI search error: {e}")
            return []
    
    async def _search_google(self, query: str) -> List[Dict[str, Any]]:
        """Search using Google Custom Search API"""
        try:
            async with aiohttp.ClientSession() as session:
                url = "https://www.googleapis.com/customsearch/v1"
                params = {
                    "key": self.search_api_key,
                    "cx": "your_search_engine_id",  # Google Custom Search Engine ID
                    "q": f"{query} orchid care growing guide",
                    "num": 10
                }
                
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data.get("items", [])
                    return []
        except Exception as e:
            logger.error(f"Google search error: {e}")
            return []
    
    async def _search_duckduckgo(self, query: str) -> List[Dict[str, Any]]:
        """Search using DuckDuckGo (no API key required)"""
        try:
            # Use the correct import for the newer version
            from duckduckgo_search import DDGS
            
            # Use DuckDuckGo search
            search_results = []
            with DDGS() as ddgs:
                results = ddgs.text(
                    f"{query} orchid care growing guide",
                    max_results=5
                )
                
                for result in results:
                    search_results.append({
                        "title": result.get("title", ""),
                        "snippet": result.get("body", ""),
                        "link": result.get("link", ""),
                        "source": "duckduckgo"
                    })
            
            return search_results
            
        except Exception as e:
            logger.error(f"DuckDuckGo search error: {e}")
            return []
    
    async def _scrape_orchid_sites(self, query: str) -> List[Dict[str, Any]]:
        """Fallback web scraping from known orchid sites"""
        orchid_sites = [
            "https://www.aos.org/orchids",
            "https://www.orchidweb.com",
            "https://www.repotme.com",
            "https://www.orchidspecies.com"
        ]
        
        results = []
        async with aiohttp.ClientSession() as session:
            for site in orchid_sites:
                try:
                    async with session.get(site) as response:
                        if response.status == 200:
                            content = await response.text()
                            # Extract relevant information (simplified)
                            results.append({
                                "title": f"Orchid Information from {site}",
                                "snippet": content[:500] + "...",
                                "link": site
                            })
                except Exception as e:
                    logger.error(f"Error scraping {site}: {e}")
        
        return results
    
    async def generate_ai_response(self, search_results: List[Dict], user_query: str, intent: str, product: Optional[Dict] = None) -> dict:
        """Use AI to generate comprehensive orchid response from search results, returning all fields as JSON"""
        try:
            if not self.openai_api_key:
                return self._generate_fallback_response(search_results, user_query, intent)

            context = self._prepare_search_context(search_results)
            prompt = self._create_orchid_comprehensive_json_prompt(user_query, intent, context, product)

            # Clear any proxy environment variables
            import os
            proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'OPENAI_PROXY', 'openai_proxy']
            for var in proxy_vars:
                if var in os.environ:
                    del os.environ[var]

            from openai import OpenAI
            
            # Use basic client initialization
            client = OpenAI(api_key=self.openai_api_key)
            
            # Use synchronous call instead of async with increased token limit
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an AI agent specializing in orchids and e-commerce. You actively think, analyze, and reason about user queries. You don't just respond with templates - you use your intelligence to provide dynamic, personalized advice. You search through information, synthesize insights, and deliver expert-level responses that show you understand the user's specific needs."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=4000,  # Increased from 1800 to 4000
                temperature=0.7,
                response_format={"type": "json_object"}  # Ensure JSON response
            )
            
            logger.info("[OPENAI] Raw LLM response for debugging:")
            logger.info(response.choices[0].message.content)
            
            try:
                response_data = json.loads(response.choices[0].message.content)
                return response_data
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response: {e}")
                logger.error(f"Raw response: {response.choices[0].message.content}")
                return self._generate_fallback_response(search_results, user_query, intent)
                
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            return self._generate_fallback_response(search_results, user_query, intent)

    def _create_orchid_comprehensive_json_prompt(self, user_query: str, intent: str, context: str, product: Optional[Dict] = None) -> str:
        """Prompt template for comprehensive JSON response"""
        product_context = ""
        if product:
            product_context = f"""
Product Information:
- Name: {product.get("name", "N/A")}
- Description: {product.get("description", "N/A")}
- Care Requirements: {product.get("care_requirements", "N/A")}
- Blooming Info: {product.get("blooming_info", "N/A")}
- Difficulty: {product.get("difficulty", "N/A")}
- Price Range: {product.get("price_range", "N/A")}
- Source: {product.get("source", "N/A")}
- Confidence: {product.get("confidence", "N/A")}
"""
        return f'''
You are an expert orchid assistant. For the orchid or query: "{user_query}", generate a JSON object with the following fields. 
**Each field must be specific, detailed, and unique to this orchid. Do not repeat content. Do not leave any field as '...' or generic. If you do not know, say 'Not available for this orchid'.**

{{
  "aiResponse": "...",
  "bloomingTips": "...",
  "careInstructions": "...",
  "commonIssues": "...",
  "fertilizerInfo": "...",
  "humidityGuide": "...",
  "lightingGuide": "...",
  "repottingGuide": "...",
  "temperatureGuide": "...",
  "wateringGuide": "..."
}}

Only output the JSON object. Use the following context from web search and your own expertise:

{context}

{product_context}
'''

    def _prepare_search_context(self, search_results: List[Dict]) -> str:
        """Prepare search results as context for AI"""
        context_parts = []
        
        for result in search_results[:5]:  # Use top 5 results
            title = result.get("title", "")
            snippet = result.get("snippet", "")
            link = result.get("link", "")
            
            context_parts.append(f"Source: {title}\nContent: {snippet}\nURL: {link}\n")
        
        return "\n".join(context_parts)
    
    def _generate_fallback_response(self, search_results: List[Dict], user_query: str, intent: str) -> str:
        """Generate fallback response when AI is unavailable"""
        
        # Extract key information from search results
        orchid_name = self._extract_orchid_name(user_query)
        
        if "cattleya" in user_query.lower():
            return f"""🌸 **Cattleya Orchid Expert Guide**

Based on the latest orchid research and expert knowledge:

**About Cattleya Orchids:**
Cattleyas are known as the "Queen of Orchids" for their stunning blooms and intoxicating fragrances. They're epiphytic orchids native to Central and South America.

**Care Requirements:**
• **Light**: Bright, indirect light (east or south-facing windows)
• **Water**: Let potting medium dry 70-80% between waterings
• **Temperature**: Day 70-85°F, Night 55-65°F with 10-15°F drop
• **Humidity**: 50-70% humidity
• **Fertilizer**: Balanced orchid fertilizer (20-20-20) diluted to 1/4 strength

**Why Choose Cattleyas:**
• Spectacular, long-lasting blooms
• Wonderful fragrances
• Relatively easy care for intermediate growers
• Great for collectors and enthusiasts

**Getting Started:**
Would you like to browse our selection of Cattleya varieties or learn more about specific care requirements? 🌺"""

        else:
            return f"""🌸 **Orchid Expert Assistance**

I'd be happy to help you with information about {orchid_name or 'orchids'}!

Based on current orchid research and expert knowledge, I can provide:
• Detailed care instructions
• Growing requirements
• Troubleshooting tips
• Product recommendations

What specific aspect would you like to learn more about? 💚"""
    
    def _extract_orchid_name(self, query: str) -> str:
        """Extract orchid name from user query"""
        # Simple extraction - can be enhanced with NLP
        orchid_keywords = ["cattleya", "phalaenopsis", "dendrobium", "oncidium", "cymbidium"]
        
        query_lower = query.lower()
        for keyword in orchid_keywords:
            if keyword in query_lower:
                return keyword.title()
        
        return "orchid"
    
    async def generate_dynamic_response(self, 
                                      user_query: str, 
                                      intent: str, 
                                      entities: List[str],
                                      sentiment: Dict[str, Any],
                                      user_experience: str = "beginner") -> Dict[str, Any]:
        """Generate dynamic, AI-powered response based on web search"""
        try:
            search_query = self._build_search_query(user_query, intent, entities)
            search_results = await self.search_orchid_info(search_query)
            ai_data = await self.generate_ai_response(search_results, user_query, intent)
            quick_replies = self._generate_quick_replies(intent, entities, user_experience)
            metadata = self._create_metadata(intent, entities, sentiment, search_results)
            return {
                **ai_data,
                "quick_replies": quick_replies,
                "metadata": metadata,
                "confidence": 0.9,
                "intent": intent,
                "entities": entities,
                "sentiment": sentiment,
                "context": {
                    "search_query": search_query,
                    "sources_used": len(search_results),
                    "user_experience": user_experience
                }
            }
        except Exception as e:
            logger.error(f"Error in dynamic response generation: {e}")
            return self._generate_error_response(user_query, intent, entities, sentiment)
    
    def _build_search_query(self, user_query: str, intent: str, entities: List[str]) -> str:
        """Build optimized search query based on user input and intent"""
        
        base_query = user_query
        
        # Add intent-specific terms
        if "care" in intent or "watering" in intent:
            base_query += " care watering lighting temperature"
        elif "product" in intent or "buy" in intent:
            base_query += " varieties types for sale"
        elif "problem" in intent or "troubleshoot" in intent:
            base_query += " problems issues solutions"
        
        # Add entity-specific terms
        for entity in entities:
            if entity.lower() not in base_query.lower():
                base_query += f" {entity}"
        
        # Add orchid-specific terms
        if "orchid" not in base_query.lower():
            base_query += " orchid"
        
        return base_query
    
    def _generate_quick_replies(self, intent: str, entities: List[str], experience: str) -> List[str]:
        """Generate contextual quick replies"""
        
        if "care" in intent:
            return ["Watering Guide", "Lighting Tips", "Fertilizer Info", "Repotting Guide"]
        elif "product" in intent:
            return ["View Products", "Add to Cart", "See More Varieties", "Get Care Guide"]
        elif "problem" in intent:
            return ["No Blooms", "Yellow Leaves", "Root Problems", "Pest Issues"]
        else:
            return ["Browse Orchids", "Care Basics", "Ask Expert", "View Products"]
    
    def _create_metadata(self, intent: str, entities: List[str], sentiment: Dict, search_results: List[Dict]) -> Dict[str, Any]:
        """Create metadata for response tracking"""
        
        return {
            "intent": intent,
            "confidence": 0.9,
            "entities": entities,
            "sentiment": sentiment,
            "search_sources": len(search_results),
            "response_type": "ai_generated",
            "timestamp": "2024-01-01T00:00:00Z"
        }
    
    def _generate_error_response(self, user_query: str, intent: str, entities: List[str], sentiment: Dict) -> Dict[str, Any]:
        """Generate fallback response when dynamic generation fails"""
        
        return {
            "message": "I'm here to help you with orchid information! Let me search for the latest details about your query. 🌸",
            "quick_replies": ["Browse Orchids", "Care Guide", "Ask Expert", "View Products"],
            "metadata": {
                "intent": "fallback",
                "confidence": 0.5,
                "error": "Dynamic generation failed"
            },
            "confidence": 0.5,
            "intent": "fallback",
            "entities": entities,
            "sentiment": sentiment,
            "context": {}
        }
    
    async def get_orchid_recommendations(self, experience: str = "beginner", budget: str = "medium") -> list:
        """Get AI-generated orchid recommendations based on experience and budget"""
        try:
            if self.openai_api_key:
                from openai import OpenAI
                client = OpenAI(api_key=self.openai_api_key)
                prompt = f"""ANALYSIS TASK:\n1. Consider the gardener's experience level: {experience}\n2. Consider their budget constraints: {budget}\n3. Think about what orchids would be most suitable\n4. Consider care difficulty, blooming patterns, and success rates\n\n**YOUR THINKING PROCESS:**\n- What makes an orchid suitable for {experience} level?\n- What price range fits a {budget} budget?\n- Which orchids have the highest success rates?\n- What would give the best value for money?\n\n**RECOMMENDATION REQUIREMENTS:**\nFor each of 5 orchids, provide:\n- Name and scientific name\n- Brief description highlighting why it's perfect for this level\n- Care difficulty (Easy/Medium/Hard)\n- Price range that fits the budget\n- Specific reasons why it's suitable\n- Key care tips for success\n\n**FORMAT AS JSON:**\n{{\n  \"recommendations\": [\n    {{\n      \"name\": \"Orchid Name\",\n      \"scientific_name\": \"Scientific Name\",\n      \"description\": \"Why this is perfect for {experience} level\",\n      \"difficulty\": \"Easy/Medium/Hard\",\n      \"price_range\": \"Budget-appropriate range\",\n      \"suitability\": \"Specific reasons for {experience} level\",\n      \"care_tips\": \"Key tips for success\"\n    }}\n  ]\n}}\n\nThink like an AI agent - analyze, reason, and provide intelligent recommendations."""
                response = client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are an AI agent specializing in orchid recommendations. You think critically about user needs and provide intelligent, personalized advice."},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=1000,
                )
                return response.choices[0].message.content
            else:
                return self._get_fallback_recommendations(experience, budget)
        except Exception as e:
            logger.error(f"Error getting recommendations: {e}")
            return self._get_fallback_recommendations(experience, budget)
    
    def _get_fallback_recommendations(self, experience: str, budget: str) -> List[Dict[str, Any]]:
        """Fallback recommendations when AI is unavailable"""
        recommendations = {
            "beginner": {
                "low": [
                    {"name": "Phalaenopsis", "scientific_name": "Phalaenopsis spp.", "description": "Easy-care moth orchid", "difficulty": "Easy", "price_range": "$15-30"},
                    {"name": "Dendrobium", "scientific_name": "Dendrobium spp.", "description": "Hardy cane orchid", "difficulty": "Easy", "price_range": "$20-40"}
                ],
                "medium": [
                    {"name": "Cattleya", "scientific_name": "Cattleya spp.", "description": "Classic corsage orchid", "difficulty": "Medium", "price_range": "$25-60"},
                    {"name": "Oncidium", "scientific_name": "Oncidium spp.", "description": "Dancing lady orchid", "difficulty": "Medium", "price_range": "$30-70"}
                ],
                "high": [
                    {"name": "Vanda", "scientific_name": "Vanda spp.", "description": "Stunning aerial orchid", "difficulty": "Medium", "price_range": "$40-100"},
                    {"name": "Cymbidium", "scientific_name": "Cymbidium spp.", "description": "Cool-growing beauty", "difficulty": "Medium", "price_range": "$35-80"}
                ]
            }
        }
        
        return recommendations.get(experience, {}).get(budget, [])
    
    async def generate_response(self, message: str, context: str = "") -> str:
        """Generate AI response for chatbot messages"""
        try:
            if not self.openai_api_key:
                return "🌸 I'm here to help you with all things orchids! What would you like to know about today?"

            # Create a simple prompt for the message
            prompt = f"""You are an AI orchid expert and sales consultant. The user asks: "{message}"

Context: {context}

Please provide a helpful, engaging response about orchids. Be warm, knowledgeable, and use emojis to make it friendly. Keep it concise but informative."""

            from openai import OpenAI
            client = OpenAI(api_key=self.openai_api_key)
            
            # Use synchronous call
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an AI orchid expert and sales consultant. Be warm, knowledgeable, and helpful."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "🌸 I'm here to help you with all things orchids! What would you like to know about today?"
    
    def _extract_intent(self, message: str) -> str:
        """Simple intent extraction"""
        message_lower = message.lower()
        
        if any(word in message_lower for word in ['care', 'water', 'light', 'fertilizer']):
            return "care_question"
        elif any(word in message_lower for word in ['buy', 'purchase', 'price', 'cost']):
            return "purchase_inquiry"
        elif any(word in message_lower for word in ['recommend', 'suggest', 'best']):
            return "recommendation"
        elif any(word in message_lower for word in ['problem', 'issue', 'help', 'dying']):
            return "problem_solving"
        else:
            return "general_inquiry"
    
    def _extract_entities(self, message: str) -> List[str]:
        """Simple entity extraction"""
        # Common orchid names and terms
        orchid_terms = [
            'phalaenopsis', 'cattleya', 'dendrobium', 'oncidium', 'vanda', 'cymbidium',
            'moth orchid', 'corsage orchid', 'dancing lady', 'spider orchid'
        ]
        
        entities = []
        message_lower = message.lower()
        
        for term in orchid_terms:
            if term in message_lower:
                entities.append(term)
        
        return entities
    
    def _get_fallback_orchid_knowledge(self, query: str) -> List[Dict[str, Any]]:
        """Provide fallback orchid knowledge when web search fails"""
        query_lower = query.lower()
        
        # Comprehensive fallback knowledge base
        orchid_knowledge = {
            "cattleya": {
                "title": "Cattleya Orchid Care Guide",
                "snippet": "Cattleyas are known as the 'Queen of Orchids' for their stunning blooms and intoxicating fragrances. They're epiphytic orchids native to Central and South America. Care requirements: Bright, indirect light (east or south-facing windows), let potting medium dry 70-80% between waterings, day temperature 70-85°F with 10-15°F night drop, 50-70% humidity, balanced orchid fertilizer diluted to 1/4 strength.",
                "link": "https://www.aos.org/orchids/culture-sheets/cattleya",
                "source": "fallback_knowledge"
            },
            "phalaenopsis": {
                "title": "Phalaenopsis Orchid Care Guide", 
                "snippet": "Phalaenopsis orchids, also known as moth orchids, are perfect for beginners. They prefer bright, indirect light, moderate humidity (50-70%), and temperatures between 65-80°F. Water when the potting mix is nearly dry, and fertilize monthly during the growing season.",
                "link": "https://www.aos.org/orchids/culture-sheets/phalaenopsis",
                "source": "fallback_knowledge"
            },
            "dendrobium": {
                "title": "Dendrobium Orchid Care Guide",
                "snippet": "Dendrobiums are diverse orchids with varying care requirements. Most prefer bright light, good air circulation, and a well-draining potting mix. Water thoroughly when the mix is nearly dry, and provide a 10-15°F temperature drop at night.",
                "link": "https://www.aos.org/orchids/culture-sheets/dendrobium",
                "source": "fallback_knowledge"
            },
            "watering": {
                "title": "Orchid Watering Guide",
                "snippet": "Proper watering is crucial for orchid health. Most orchids prefer to dry out between waterings. Water thoroughly when the potting mix is nearly dry, and avoid letting orchids sit in water. Use room temperature water and water in the morning.",
                "link": "https://www.aos.org/orchids/culture-sheets/watering",
                "source": "fallback_knowledge"
            },
            "light": {
                "title": "Orchid Light Requirements",
                "snippet": "Orchids have varying light requirements. Most prefer bright, indirect light. East or south-facing windows are ideal. Signs of too much light include yellowing leaves, while too little light results in dark green leaves and poor blooming.",
                "link": "https://www.aos.org/orchids/culture-sheets/light",
                "source": "fallback_knowledge"
            },
            "temperature": {
                "title": "Orchid Temperature Guide",
                "snippet": "Most orchids prefer temperatures between 65-80°F during the day with a 10-15°F drop at night. This temperature variation is crucial for blooming. Avoid placing orchids near heating or cooling vents.",
                "link": "https://www.aos.org/orchids/culture-sheets/temperature",
                "source": "fallback_knowledge"
            },
            "fertilizer": {
                "title": "Orchid Fertilizer Guide",
                "snippet": "Use a balanced orchid fertilizer (20-20-20) diluted to 1/4 strength. Fertilize monthly during the growing season and reduce or stop during winter. Always water before fertilizing to avoid root burn.",
                "link": "https://www.aos.org/orchids/culture-sheets/fertilizer",
                "source": "fallback_knowledge"
            }
        }
        
        # Find relevant knowledge based on query
        relevant_results = []
        for keyword, knowledge in orchid_knowledge.items():
            if keyword in query_lower:
                relevant_results.append(knowledge)
        
        # If no specific matches, return general orchid care
        if not relevant_results:
            relevant_results.append(orchid_knowledge["cattleya"])
        
        return relevant_results

    async def generate_field_response(self, prompt: str) -> str:
        """Generate a single field response using OpenAI"""
        try:
            if not self.openai_api_key:
                return "Information not available at the moment."

            # Clear any proxy environment variables
            import os
            proxy_vars = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy', 'OPENAI_PROXY', 'openai_proxy']
            for var in proxy_vars:
                if var in os.environ:
                    del os.environ[var]

            from openai import OpenAI
            
            # Use basic client initialization
            client = OpenAI(api_key=self.openai_api_key)
            
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an AI orchid expert. Provide helpful, specific, and engaging information about orchids. Use emojis and be warm and knowledgeable."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"[OPENAI] Error generating field response: {e}")
            return "Information not available at the moment." 