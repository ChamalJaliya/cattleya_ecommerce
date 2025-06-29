export interface CattleyaPromptData {
  productName: string;
  hybridName?: string;
  fragrance?: string;
  bloomingSeason?: string;
  careTips?: string[];
  fertilizer?: { brand: string; formula: string; frequency: string };
  potOptions?: string[];
  repotFrequency?: string;
  pottingMix?: string;
  additionalTips?: string[];
  recommendedProducts?: { name: string; description: string }[];
  bundles?: { name: string; description: string }[];
  ctaUrl?: string;
}

export function buildCattleyaOrchidPrompt(data: CattleyaPromptData): string {
  return `
Cattleya orchids are truly stunning—known for their vibrant blooms${data.fragrance ? ` and intoxicating fragrance` : ''}! You've made a fantastic choice. Let me guide you through the best care practices and options we offer.

**Seasonal Care & Blooming Period**
${data.bloomingSeason ? `Cattleyas typically bloom in ${data.bloomingSeason}.` : 'Cattleyas often bloom in spring or fall, depending on the hybrid.'}
- **Spring/Summer:** Bright indirect light, higher humidity, warmer temps (65-85°F).
- **Fall/Winter:** Reduced watering, cooler nights (55-65°F) to trigger blooming.

**Fertilizer Recommendations**
- Use a balanced orchid fertilizer${data.fertilizer ? ` (e.g., ${data.fertilizer.formula})` : ' (e.g., 20-20-20 or 30-10-10 for growth phases)'}.
- Application: ${data.fertilizer?.frequency || 'Biweekly in growth season, monthly in dormancy'}.
${data.fertilizer ? `We recommend **${data.fertilizer.brand}**—gentle formula for vibrant blooms! Pair it with your orchid for best results.` : ''}

**Pot Selection & Repotting Tips**
- Plastic pots: Retain moisture, good for dry climates.
- Clay pots: Breathable, prevent overwatering.
- Slotted orchid pots: Superior airflow for healthy roots.
- Repot every ${data.repotFrequency || '2-3 years'} using an orchid potting mix${data.pottingMix ? ` (e.g., ${data.pottingMix})` : ' (e.g., chunky bark blend)'}.

**Additional Care Tips**
${data.careTips?.map(tip => `- ${tip}`).join('\n') || `- Let the medium dry slightly between waterings.\n- Bright, indirect light—east or south-facing windows are ideal.\n- Avoid soggy roots or direct midday sun!`}
${data.additionalTips?.map(tip => `- ${tip}`).join('\n') || ''}

**Product Recommendations**
${data.recommendedProducts?.map(p => `- **${p.name}**: ${p.description}`).join('\n') || '- Our ‘Royal Purple’ hybrid is a customer favorite!'}
${data.bundles?.map(b => `- **${b.name}**: ${b.description}`).join('\n') || '- Complete your setup with our Orchid Starter Kit (pot, fertilizer, and care guide).'}

**Ready to bring home a Cattleya?** [Browse our Best Sellers](${data.ctaUrl || '#'}) or chat for personalized advice!`;
} 