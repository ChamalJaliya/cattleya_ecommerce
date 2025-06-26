// Use require for compromise to avoid import issues in Node.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const nlp = require('compromise');
const fuzz = require('fuzzball');

// Test log to verify NLP works
if (process.env.NODE_ENV !== 'production') {
  console.log('[NLP-TEST] compromise nouns:', nlp('Tell me about Phalaenopsis').nouns().out('array'));
}

// Synonym map for categories/types
const CATEGORY_SYNONYMS = {
  beginner: ['beginner', 'easy', 'starter', 'novice', 'simple', 'first time'],
  rare: ['rare', 'exotic', 'unique', 'uncommon', 'special'],
  featured: ['featured', 'special', 'highlighted', 'spotlight'],
  best_seller: ['best', 'popular', 'favorite', 'top', 'bestseller'],
  new_arrival: ['new', 'latest', 'recent', 'just arrived'],
};

function getCategoryFromQuery(text: string): 'beginner' | 'rare' | 'featured' | 'best_seller' | 'new_arrival' | null {
  const lowerText = text.toLowerCase();
  for (const [category, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    if (synonyms.some(s => lowerText.includes(s))) {
      return category as 'beginner' | 'rare' | 'featured' | 'best_seller' | 'new_arrival';
    }
  }
  return null;
}

// Optionally, pass in a list of known product names for better matching
export function extractProductNames(text: string, productList: string[] = []): string[] {
  const doc = nlp(text);
  let nouns = doc.nouns().out('array').map((n: string) => n.toLowerCase());
  const lowerText = text.toLowerCase();

  // Fuzzy match: if any product name is similar to any noun or keyword from the query
  const matches = productList.filter((name) => {
    const lowerName = name.toLowerCase();
    return (
      nouns.some((noun) => fuzz.ratio(lowerName, noun) > 80) ||
      fuzz.ratio(lowerText, lowerName) > 80 ||
      lowerName.includes(lowerText) ||
      lowerText.includes(lowerName)
    );
  });

  // Log for debugging
  console.log('[NLP-DEBUG] Query:', text, '| Nouns:', nouns, '| Fuzzy Matches:', matches);

  return matches;
}

export { getCategoryFromQuery, CATEGORY_SYNONYMS }; 