from typing import Dict, List, Optional, Any
import json
import time
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class ConversationMemoryService:
    def __init__(self):
        self.memory_store = {}  # In production, use Redis or database
        self.max_memory_age = 3600  # 1 hour
        self.max_context_length = 10  # Keep last 10 messages for context
        
    def store_message(self, session_id: str, message: Dict) -> None:
        """Store a message in conversation memory"""
        try:
            if session_id not in self.memory_store:
                self.memory_store[session_id] = {
                    "messages": [],
                    "context": {},
                    "created_at": time.time(),
                    "last_updated": time.time()
                }
            
            memory = self.memory_store[session_id]
            memory["messages"].append({
                "message": message.get("message", ""),
                "sender": message.get("sender", "USER"),
                "timestamp": time.time(),
                "metadata": message.get("metadata", {})
            })
            
            # Keep only recent messages
            memory["messages"] = memory["messages"][-self.max_context_length:]
            memory["last_updated"] = time.time()
            
            # Update context based on message content
            self._update_context(session_id, message)
            
        except Exception as e:
            logger.error(f"Error storing message: {e}")
    
    def store_context(self, session_id: str, context_data: Dict) -> None:
        """Store arbitrary context data in conversation memory"""
        try:
            if session_id not in self.memory_store:
                self.memory_store[session_id] = {
                    "messages": [],
                    "context": {},
                    "created_at": time.time(),
                    "last_updated": time.time()
                }
            
            memory = self.memory_store[session_id]
            # Update context with new data
            memory["context"].update(context_data)
            memory["last_updated"] = time.time()
            
            logger.info(f"Stored context for session {session_id}: {list(context_data.keys())}")
            
        except Exception as e:
            logger.error(f"Error storing context: {e}")
    
    def get_conversation_context(self, session_id: str) -> Dict:
        """Get conversation context for a session"""
        try:
            if session_id not in self.memory_store:
                return {"messages": [], "context": {}, "session_age": 0}
            
            memory = self.memory_store[session_id]
            session_age = time.time() - memory["created_at"]
            
            return {
                "messages": memory["messages"],
                "context": memory["context"],
                "session_age": session_age,
                "message_count": len(memory["messages"])
            }
        except Exception as e:
            logger.error(f"Error getting conversation context: {e}")
            return {"messages": [], "context": {}, "session_age": 0}
    
    def _update_context(self, session_id: str, message: Dict) -> None:
        """Update conversation context based on message content"""
        try:
            memory = self.memory_store[session_id]
            context = memory["context"]
            
            # Extract key information from message
            message_text = message.get("message", "").lower()
            
            # Track user preferences
            if "orchid" in message_text or "plant" in message_text:
                context["interested_in_plants"] = True
            
            if "price" in message_text or "cost" in message_text:
                context["price_sensitive"] = True
            
            if "beginner" in message_text or "first time" in message_text:
                context["experience_level"] = "beginner"
            
            if "expert" in message_text or "collector" in message_text:
                context["experience_level"] = "expert"
            
            # Track conversation topics
            topics = context.get("topics", [])
            if "care" in message_text or "water" in message_text:
                if "care" not in topics:
                    topics.append("care")
            if "shipping" in message_text or "delivery" in message_text:
                if "shipping" not in topics:
                    topics.append("shipping")
            if "order" in message_text or "purchase" in message_text:
                if "ordering" not in topics:
                    topics.append("ordering")
            
            context["topics"] = topics[-5:]  # Keep last 5 topics
            
            # Track user sentiment
            if message.get("metadata", {}).get("sentiment"):
                context["recent_sentiment"] = message["metadata"]["sentiment"]
            
            # Track user intent
            if message.get("metadata", {}).get("intent"):
                context["last_intent"] = message["metadata"]["intent"]
            
            memory["context"] = context
            
        except Exception as e:
            logger.error(f"Error updating context: {e}")
    
    def get_relevant_context(self, session_id: str, current_message: str) -> Dict:
        """Get context relevant to the current message"""
        try:
            full_context = self.get_conversation_context(session_id)
            relevant_context = {
                "recent_messages": full_context["messages"][-3:],  # Last 3 messages
                "user_preferences": {},
                "conversation_topics": full_context["context"].get("topics", []),
                "experience_level": full_context["context"].get("experience_level"),
                "recent_sentiment": full_context["context"].get("recent_sentiment"),
                "last_intent": full_context["context"].get("last_intent")
            }
            
            # Extract user preferences
            context = full_context["context"]
            if context.get("interested_in_plants"):
                relevant_context["user_preferences"]["interested_in_plants"] = True
            if context.get("price_sensitive"):
                relevant_context["user_preferences"]["price_sensitive"] = True
            
            return relevant_context
            
        except Exception as e:
            logger.error(f"Error getting relevant context: {e}")
            return {"recent_messages": [], "user_preferences": {}, "conversation_topics": []}
    
    def generate_context_prompt(self, session_id: str, current_message: str) -> str:
        """Generate a context-aware prompt for the AI"""
        try:
            context = self.get_relevant_context(session_id, current_message)
            
            prompt_parts = []
            
            # Add conversation history
            if context["recent_messages"]:
                history = "\n".join([
                    f"{msg['sender']}: {msg['message']}" 
                    for msg in context["recent_messages"]
                ])
                prompt_parts.append(f"Recent conversation:\n{history}")
            
            # Add user preferences
            if context["user_preferences"]:
                prefs = ", ".join([f"{k}: {v}" for k, v in context["user_preferences"].items()])
                prompt_parts.append(f"User preferences: {prefs}")
            
            # Add experience level
            if context["experience_level"]:
                prompt_parts.append(f"User experience level: {context['experience_level']}")
            
            # Add conversation topics
            if context["conversation_topics"]:
                topics = ", ".join(context["conversation_topics"])
                prompt_parts.append(f"Previous topics discussed: {topics}")
            
            # Add sentiment context
            if context["recent_sentiment"]:
                sentiment = context["recent_sentiment"]
                prompt_parts.append(f"Recent user sentiment: {sentiment.get('sentiment_class', 'neutral')}")
            
            return "\n".join(prompt_parts)
            
        except Exception as e:
            logger.error(f"Error generating context prompt: {e}")
            return ""
    
    def cleanup_old_sessions(self) -> None:
        """Clean up old conversation sessions"""
        try:
            current_time = time.time()
            sessions_to_remove = []
            
            for session_id, memory in self.memory_store.items():
                if current_time - memory["last_updated"] > self.max_memory_age:
                    sessions_to_remove.append(session_id)
            
            for session_id in sessions_to_remove:
                del self.memory_store[session_id]
                
            if sessions_to_remove:
                logger.info(f"Cleaned up {len(sessions_to_remove)} old sessions")
                
        except Exception as e:
            logger.error(f"Error cleaning up old sessions: {e}")
    
    def get_session_analytics(self, session_id: str) -> Dict:
        """Get analytics for a conversation session"""
        try:
            context = self.get_conversation_context(session_id)
            
            if not context["messages"]:
                return {"error": "No messages found"}
            
            user_messages = [msg for msg in context["messages"] if msg["sender"] == "USER"]
            bot_messages = [msg for msg in context["messages"] if msg["sender"] == "BOT"]
            
            # Calculate response times
            response_times = []
            for i in range(len(user_messages) - 1):
                if i + 1 < len(bot_messages):
                    response_time = bot_messages[i]["timestamp"] - user_messages[i]["timestamp"]
                    response_times.append(response_time)
            
            avg_response_time = sum(response_times) / len(response_times) if response_times else 0
            
            return {
                "total_messages": len(context["messages"]),
                "user_messages": len(user_messages),
                "bot_messages": len(bot_messages),
                "session_duration": context["session_age"],
                "average_response_time": avg_response_time,
                "topics_discussed": context["context"].get("topics", []),
                "user_experience_level": context["context"].get("experience_level"),
                "recent_sentiment": context["context"].get("recent_sentiment")
            }
            
        except Exception as e:
            logger.error(f"Error getting session analytics: {e}")
            return {"error": str(e)} 