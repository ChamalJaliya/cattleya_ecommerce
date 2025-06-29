import spacy
from textblob import TextBlob
from typing import Dict, List, Tuple
import logging
import re

logger = logging.getLogger(__name__)

class SentimentAnalysisService:
    def __init__(self):
        self.nlp = spacy.load("en_core_web_md")
        
    def _sanitize_text(self, text: str) -> str:
        # Remove surrogate pairs and invalid unicode
        return text.encode('utf-8', 'ignore').decode('utf-8', 'ignore')

    def analyze_sentiment(self, text: str) -> Dict:
        """
        Comprehensive sentiment analysis using multiple approaches
        """
        try:
            # Sanitize input text
            text = self._sanitize_text(text)
            # TextBlob sentiment analysis
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity  # -1 to 1
            subjectivity = blob.sentiment.subjectivity  # 0 to 1
            
            # spaCy-based analysis
            doc = self.nlp(text)
            
            # Emotion detection
            emotions = self._detect_emotions(doc)
            
            # Urgency detection
            urgency = self._detect_urgency(doc)
            
            # Sentiment classification
            sentiment_class = self._classify_sentiment(polarity, subjectivity)
            
            # Customer satisfaction indicators
            satisfaction_indicators = self._detect_satisfaction_indicators(doc)
            
            return {
                "polarity": polarity,
                "subjectivity": subjectivity,
                "sentiment_class": sentiment_class,
                "emotions": emotions,
                "urgency": urgency,
                "satisfaction_indicators": satisfaction_indicators,
                "confidence": self._calculate_confidence(polarity, subjectivity, emotions),
                "recommended_action": self._get_recommended_action(sentiment_class, urgency, emotions)
            }
        except Exception as e:
            logger.error(f"Error in sentiment analysis: {e}")
            return {
                "polarity": 0,
                "subjectivity": 0.5,
                "sentiment_class": "neutral",
                "emotions": [],
                "urgency": "low",
                "satisfaction_indicators": [],
                "confidence": 0.5,
                "recommended_action": "continue_conversation"
            }
    
    def _detect_emotions(self, doc) -> List[str]:
        """Detect emotions in the text"""
        emotions = []
        
        # Emotion keywords
        emotion_keywords = {
            "frustrated": ["frustrated", "annoyed", "angry", "upset", "disappointed"],
            "excited": ["excited", "thrilled", "happy", "delighted", "amazed"],
            "worried": ["worried", "concerned", "anxious", "nervous", "scared"],
            "confused": ["confused", "unsure", "uncertain", "puzzled", "lost"],
            "satisfied": ["satisfied", "pleased", "content", "happy", "great"],
            "impatient": ["impatient", "hurry", "quick", "fast", "urgent"]
        }
        
        text_lower = doc.text.lower()
        for emotion, keywords in emotion_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                emotions.append(emotion)
        
        return emotions
    
    def _detect_urgency(self, doc) -> str:
        """Detect urgency level in the message"""
        urgency_keywords = {
            "high": ["urgent", "asap", "immediately", "now", "quick", "emergency"],
            "medium": ["soon", "today", "this week", "important"],
            "low": ["whenever", "no rush", "take your time"]
        }
        
        text_lower = doc.text.lower()
        for level, keywords in urgency_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return level
        
        return "low"
    
    def _classify_sentiment(self, polarity: float, subjectivity: float) -> str:
        """Classify sentiment based on polarity and subjectivity"""
        if polarity > 0.3:
            return "positive"
        elif polarity < -0.3:
            return "negative"
        else:
            return "neutral"
    
    def _detect_satisfaction_indicators(self, doc) -> List[str]:
        """Detect customer satisfaction indicators"""
        indicators = []
        
        satisfaction_keywords = {
            "satisfied": ["satisfied", "pleased", "happy", "great", "excellent"],
            "dissatisfied": ["dissatisfied", "unhappy", "poor", "bad", "terrible"],
            "neutral": ["okay", "fine", "alright", "average"]
        }
        
        text_lower = doc.text.lower()
        for indicator, keywords in satisfaction_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                indicators.append(indicator)
        
        return indicators
    
    def _calculate_confidence(self, polarity: float, subjectivity: float, emotions: List[str]) -> float:
        """Calculate confidence in sentiment analysis"""
        # Higher confidence for more extreme polarities
        polarity_confidence = abs(polarity)
        
        # Higher confidence for more emotions detected
        emotion_confidence = min(len(emotions) * 0.2, 1.0)
        
        # Lower subjectivity often means more confident analysis
        subjectivity_confidence = 1 - subjectivity
        
        return (polarity_confidence + emotion_confidence + subjectivity_confidence) / 3
    
    def _get_recommended_action(self, sentiment_class: str, urgency: str, emotions: List[str]) -> str:
        """Get recommended action based on sentiment analysis"""
        if sentiment_class == "negative" and urgency == "high":
            return "escalate_immediately"
        elif sentiment_class == "negative":
            return "empathize_and_help"
        elif "frustrated" in emotions:
            return "calm_and_assist"
        elif urgency == "high":
            return "prioritize_response"
        elif sentiment_class == "positive":
            return "reinforce_positive"
        else:
            return "continue_conversation"
    
    def analyze_conversation_sentiment(self, messages: List[Dict]) -> Dict:
        """Analyze sentiment across an entire conversation"""
        if not messages:
            return {"overall_sentiment": "neutral", "trend": "stable"}
        
        sentiments = []
        for message in messages:
            if message.get("sender") == "USER":
                sentiment = self.analyze_sentiment(message.get("message", ""))
                sentiments.append(sentiment)
        
        if not sentiments:
            return {"overall_sentiment": "neutral", "trend": "stable"}
        
        # Calculate overall sentiment
        avg_polarity = sum(s["polarity"] for s in sentiments) / len(sentiments)
        overall_sentiment = self._classify_sentiment(avg_polarity, 0.5)
        
        # Detect trend
        if len(sentiments) >= 2:
            recent_polarity = sentiments[-1]["polarity"]
            earlier_polarity = sentiments[0]["polarity"]
            if recent_polarity > earlier_polarity + 0.2:
                trend = "improving"
            elif recent_polarity < earlier_polarity - 0.2:
                trend = "declining"
            else:
                trend = "stable"
        else:
            trend = "stable"
        
        return {
            "overall_sentiment": overall_sentiment,
            "trend": trend,
            "message_count": len(sentiments),
            "average_polarity": avg_polarity
        } 