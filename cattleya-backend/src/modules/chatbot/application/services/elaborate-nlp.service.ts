import axios from 'axios';

export async function getElaborativeDescription(productName: string, context?: string): Promise<string> {
  try {
    const response = await axios.post('http://localhost:8000/elaborate', {
      product_name: productName,
      context,
    });
    console.log('[NODE] Python /elaborate response:', response.data);
    return response.data.description;
  } catch (error) {
    console.error('Error calling elaboration service:', error);
    // Fallback: return a generic but still engaging message
    return `The ${productName} is a stunning orchid that captivates with its unique beauty. ${context || 'This premium variety is cherished by collectors for its exceptional qualities and elegant presence.'} With proper care, it will reward you with magnificent blooms that will be the centerpiece of any collection.`;
  }
} 