import speech_recognition as sr
import io
import wave
import numpy as np
from typing import Dict, Optional, Tuple
import logging
import os

logger = logging.getLogger(__name__)

class VoiceTranscriptionService:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 4000
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.pause_threshold = 0.8
        
    def transcribe_audio_file(self, audio_data: bytes, file_format: str = "wav") -> Dict:
        """
        Transcribe audio file data to text
        """
        try:
            # Convert bytes to audio file
            audio_file = io.BytesIO(audio_data)
            
            # Use speech recognition
            with sr.AudioFile(audio_file) as source:
                audio = self.recognizer.record(source)
                
            # Try multiple recognition services
            transcription_result = self._try_multiple_services(audio)
            
            return {
                "success": True,
                "text": transcription_result["text"],
                "confidence": transcription_result["confidence"],
                "service_used": transcription_result["service"],
                "language": transcription_result.get("language", "en-US")
            }
            
        except Exception as e:
            logger.error(f"Error transcribing audio: {e}")
            return {
                "success": False,
                "error": str(e),
                "text": "",
                "confidence": 0.0
            }
    
    def _try_multiple_services(self, audio) -> Dict:
        """
        Try multiple speech recognition services for better accuracy
        """
        services = [
            ("google", self._try_google),
            ("sphinx", self._try_sphinx),
            ("whisper", self._try_whisper)
        ]
        
        for service_name, service_func in services:
            try:
                result = service_func(audio)
                if result["success"]:
                    return result
            except Exception as e:
                logger.warning(f"Service {service_name} failed: {e}")
                continue
        
        # Fallback to basic transcription
        return {
            "success": False,
            "text": "",
            "confidence": 0.0,
            "service": "none"
        }
    
    def _try_google(self, audio) -> Dict:
        """Try Google Speech Recognition"""
        try:
            text = self.recognizer.recognize_google(audio)
            return {
                "success": True,
                "text": text,
                "confidence": 0.8,  # Google doesn't provide confidence
                "service": "google",
                "language": "en-US"
            }
        except sr.UnknownValueError:
            return {"success": False, "text": "", "confidence": 0.0, "service": "google"}
        except sr.RequestError as e:
            logger.error(f"Google Speech Recognition error: {e}")
            return {"success": False, "text": "", "confidence": 0.0, "service": "google"}
    
    def _try_sphinx(self, audio) -> Dict:
        """Try CMU Sphinx (offline)"""
        try:
            text = self.recognizer.recognize_sphinx(audio)
            return {
                "success": True,
                "text": text,
                "confidence": 0.6,  # Sphinx typically has lower accuracy
                "service": "sphinx",
                "language": "en-US"
            }
        except sr.UnknownValueError:
            return {"success": False, "text": "", "confidence": 0.0, "service": "sphinx"}
        except Exception as e:
            logger.error(f"Sphinx error: {e}")
            return {"success": False, "text": "", "confidence": 0.0, "service": "sphinx"}
    
    def _try_whisper(self, audio) -> Dict:
        """Try OpenAI Whisper (if available)"""
        try:
            # This would require OpenAI Whisper API or local installation
            # For now, return not available
            return {"success": False, "text": "", "confidence": 0.0, "service": "whisper"}
        except Exception as e:
            logger.error(f"Whisper error: {e}")
            return {"success": False, "text": "", "confidence": 0.0, "service": "whisper"}
    
    def validate_audio_format(self, audio_data: bytes, expected_format: str = "wav") -> Dict:
        """
        Validate audio format and quality
        """
        try:
            audio_file = io.BytesIO(audio_data)
            
            with wave.open(audio_file, 'rb') as wav_file:
                # Check audio properties
                channels = wav_file.getnchannels()
                sample_width = wav_file.getsampwidth()
                frame_rate = wav_file.getframerate()
                frames = wav_file.getnframes()
                duration = frames / frame_rate
                
                # Validate audio quality
                quality_score = self._calculate_quality_score(
                    channels, sample_width, frame_rate, duration
                )
                
                return {
                    "valid": True,
                    "format": "wav",
                    "channels": channels,
                    "sample_width": sample_width,
                    "frame_rate": frame_rate,
                    "duration": duration,
                    "quality_score": quality_score,
                    "recommendations": self._get_quality_recommendations(quality_score)
                }
                
        except Exception as e:
            logger.error(f"Audio validation error: {e}")
            return {
                "valid": False,
                "error": str(e),
                "quality_score": 0.0
            }
    
    def _calculate_quality_score(self, channels: int, sample_width: int, 
                               frame_rate: int, duration: float) -> float:
        """
        Calculate audio quality score (0-1)
        """
        score = 0.0
        
        # Channel score (mono or stereo is good)
        if channels in [1, 2]:
            score += 0.2
        else:
            score += 0.1
        
        # Sample width score (16-bit is ideal)
        if sample_width == 2:  # 16-bit
            score += 0.3
        elif sample_width == 1:  # 8-bit
            score += 0.1
        else:
            score += 0.2
        
        # Frame rate score (16kHz+ is good for speech)
        if frame_rate >= 16000:
            score += 0.3
        elif frame_rate >= 8000:
            score += 0.2
        else:
            score += 0.1
        
        # Duration score (1-30 seconds is ideal)
        if 1 <= duration <= 30:
            score += 0.2
        elif duration < 1:
            score += 0.1
        else:
            score += 0.15
        
        return min(score, 1.0)
    
    def _get_quality_recommendations(self, quality_score: float) -> list:
        """
        Get recommendations based on quality score
        """
        recommendations = []
        
        if quality_score < 0.5:
            recommendations.append("Audio quality is low. Consider using a better microphone.")
            recommendations.append("Ensure quiet environment for better transcription.")
        elif quality_score < 0.7:
            recommendations.append("Audio quality is acceptable but could be improved.")
        else:
            recommendations.append("Audio quality is good for transcription.")
        
        return recommendations
    
    def get_supported_languages(self) -> list:
        """
        Get list of supported languages for transcription
        """
        return [
            {"code": "en-US", "name": "English (US)"},
            {"code": "en-GB", "name": "English (UK)"},
            {"code": "es-ES", "name": "Spanish"},
            {"code": "fr-FR", "name": "French"},
            {"code": "de-DE", "name": "German"},
            {"code": "it-IT", "name": "Italian"},
            {"code": "pt-BR", "name": "Portuguese (Brazil)"},
            {"code": "ja-JP", "name": "Japanese"},
            {"code": "ko-KR", "name": "Korean"},
            {"code": "zh-CN", "name": "Chinese (Simplified)"}
        ] 