/**
 * 🎨 Prompt Builders - Construction de prompts riches
 * 
 * Fonctions pour créer des prompts optimisés pour l'API Suno
 */

/**
 * Construire un prompt éducatif riche
 */
export function buildRichEducationalPrompt(
  itemCode: string, 
  rang: string, 
  style: string, 
  mood: string, 
  tempo: string
): string {
  // OPTIMISATION: Prompt condensé et précis pour génération rapide
  const basePrompt = `Educational ${style} song about ${itemCode || 'medical content'} for level ${rang || 'A'}.
${mood} melody, ${tempo} tempo, clear vocals, memorable medical concepts, professional quality.`;

  return basePrompt.trim();
}

/**
 * Construire un style musical riche
 */
export function buildRichStyle(
  style: string, 
  mood: string, 
  tempo: string, 
  instruments: string[]
): string {
  const instrumentList = instruments?.join(', ') || 'piano, strings';
  
  // OPTIMISATION: Style condensé pour génération plus rapide
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
 * Créer un prompt synthétique avec compétences et assonances
 */
export function buildSyntheticPromptWithAssonances(
  itemCode: string, 
  rang: string, 
  style: string, 
  competences: any[]
): string {
  const rangText = rang === 'A' ? 'fondamental' : 'expert';
  
  // Créer des vers avec assonances basés sur les compétences
  let verses = [];
  
  // Vers d'introduction avec assonance
  verses.push(`${itemCode} ${rangText}, compétences à maîtriser`);
  
  // Intégrer les compétences avec assonances et rimes
  if (competences && competences.length > 0) {
    // Prendre un échantillon représentatif des compétences
    const sampledCompetences = competences.slice(0, Math.min(5, competences.length));
    
    sampledCompetences.forEach((comp, index) => {
      const intitule = comp.intitule || comp.concept || 'Compétence médicale';
      const shortIntitule = intitule.substring(0, 80); // Limiter la longueur
      
      if (index % 2 === 0) {
        verses.push(`${shortIntitule}, essentiel médical`);
        verses.push(`Diagnostic précis à bien définir`);
        verses.push(`Traitement adapté pour guérir`);
      } else {
        verses.push(`${shortIntitule}, fondamental`);
        verses.push(`Signes cliniques à observer, pronostic certain`);
        verses.push(`Prise en charge optimale, résultat sain`);
      }
      verses.push('---'); // Séparateur pour structure musicale
    });
  }
  
  // Conclusion avec assonance
  verses.push(`${itemCode} maîtrisé, excellence atteinte`);
  verses.push(`Compétences solides, réussite certaine`);
  verses.push(`Formation complète, expertise validée`);
  
  return verses.join('\n').substring(0, 4800); // Laisser marge pour 5000 caractères max
}

/**
 * Créer un prompt simplifié (réduction de taille)
 */
export function buildSimplifiedPrompt(
  itemCode: string, 
  rang: string, 
  style: string
): string {
  return `Educational song for ${itemCode || 'medical content'}, ${rang ? `level ${rang}` : 'medical training'}, ${style} style, clear melody, memorable, professional medical education music.`;
}
