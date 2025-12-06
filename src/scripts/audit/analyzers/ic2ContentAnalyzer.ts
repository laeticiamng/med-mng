
import { KEYWORD_MAP } from '../constants/ic2Constants';
import { IC2ConceptAnalysis } from '../types/ic2Types';

// Fonction pour analyser le contenu et détecter les concepts présents
export function analyzeContentForConcepts(content: any, expectedConcepts: string[]): IC2ConceptAnalysis {
  const found: string[] = [];
  const missing: string[] = [];
  
  const contentStr = JSON.stringify(content).toLowerCase();
  
  expectedConcepts.forEach(concept => {
    const keywords = extractKeywords(concept);
    const isPresent = keywords.some(keyword => contentStr.includes(keyword.toLowerCase()));
    
    if (isPresent) {
      found.push(concept);
    } else {
      missing.push(concept);
    }
  });
  
  return { found, missing };
}

// Extraire les mots-clés principaux d'un concept
export function extractKeywords(concept: string): string[] {
  // Trouver la clé correspondante
  const matchingKey = Object.keys(KEYWORD_MAP).find(key => 
    concept.toLowerCase().includes(key.toLowerCase())
  );
  
  if (matchingKey) {
    return KEYWORD_MAP[matchingKey];
  }
  
  // Fallback : extraire les mots principaux du concept
  return concept.split(' ').filter(word => word.length > 3);
}
