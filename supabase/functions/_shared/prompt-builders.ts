/**
 * 🎨 Prompt Builders - Construction de prompts pour l'API Suno
 * 
 * ⚠️ IMPORTANT: La génération de PAROLES est maintenant centralisée dans:
 *    → supabase/functions/generate-lyrics-from-oic/index.ts (Style NEKFEU)
 * 
 * Ce fichier contient uniquement les helpers pour les prompts musicaux (style, titre, etc.)
 */

/**
 * Construire un prompt éducatif pour Suno
 */
export function buildRichEducationalPrompt(
  itemCode: string, 
  rang: string, 
  style: string, 
  mood: string, 
  tempo: string
): string {
  const basePrompt = `Educational ${style} song about ${itemCode || 'medical content'} for level ${rang || 'A'}.
${mood} melody, ${tempo} tempo, clear vocals, memorable medical concepts, professional quality.`;

  return basePrompt.trim();
}

/**
 * Construire un style musical
 */
export function buildRichStyle(
  style: string, 
  mood: string, 
  tempo: string, 
  instruments: string[]
): string {
  const instrumentList = instruments?.join(', ') || 'piano, strings';
  return `${style}, ${mood}, ${tempo}, ${instrumentList}, educational, clear vocals`;
}

/**
 * Construire un titre expressif
 */
export function buildExpressiveTitle(
  itemCode: string, 
  rang: string, 
  style: string
): string {
  const styleCapitalized = style.charAt(0).toUpperCase() + style.slice(1);
  const rangSuffix = rang ? ` (${rang} Level)` : '';
  return `${itemCode || 'Medical'} Mastery${rangSuffix} - ${styleCapitalized} Education`;
}

/**
 * Créer un prompt simplifié
 */
export function buildSimplifiedPrompt(
  itemCode: string, 
  rang: string, 
  style: string
): string {
  return `Educational song for ${itemCode || 'medical content'}, ${rang ? `level ${rang}` : 'medical training'}, ${style} style, clear melody, memorable, professional medical education music.`;
}
