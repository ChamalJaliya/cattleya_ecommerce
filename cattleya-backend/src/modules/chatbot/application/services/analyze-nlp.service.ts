import axios from 'axios';

export interface AnalyzeResult {
  spaCy: { 
    intent: string; 
    confidence: number; 
    entities: string[] 
  };
  llm: { 
    intent?: string; 
    confidence?: number; 
    entities?: string[] 
  };
  final_intent: string;
  final_entities: string[];
  confidence: number;
}

export async function analyzeMessage(message: string, context?: string): Promise<AnalyzeResult> {
  try {
    const response = await axios.post('http://localhost:8000/analyze', {
      message,
      context,
    });
    console.log('[NODE] Python /analyze response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error calling NLP service:', error);
    // Fallback to basic analysis
    return {
      spaCy: { intent: 'unknown', confidence: 0, entities: [] },
      llm: {},
      final_intent: 'unknown',
      final_entities: [],
      confidence: 0
    };
  }
} 