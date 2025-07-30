import { supabase } from '@/integrations/supabase/client';

interface CompetenceOIC {
  objectif_id: string;
  intitule: string;
  description: string;
  rang: string;
  rubrique: string;
  item_parent: string;
}

interface EdnItemData {
  item_code: string;
  title: string;
  tableau_rang_a?: any;
  tableau_rang_b?: any;
}

interface OptimizedSongStructure {
  couplet1: string[];
  refrain: string[];
  couplet2: string[];
  couplet3: string[];
  couplet4?: string[];
  refrainFinal: string[];
}

/**
 * 🎫 GÉNÉRATION OPTIMISÉE POUR VOIX IA - STYLE NEKFEU MÉDICAL
 * Structure: 3:30-4:30min, max 5000 caractères
 * Optimisé pour prononciation IA avec assonances simples
 */
export async function generateOptimizedLyrics(
  itemCode: string, 
  rang: 'A' | 'B' | 'AB'
): Promise<string[]> {
  console.log(`🎵 Génération ultra-optimisée ${itemCode} Rang ${rang}`);
  
  try {
    const itemData = await fetchItemData(itemCode);
    const competences = await fetchCompetences(itemCode, rang);
    
    // Structure standardisée selon spécifications
    const songStructure = generateOptimizedStructure(itemData, competences, rang);
    
    // Assemblage avec balises IA
    const optimizedSong = assembleOptimizedSong(songStructure);
    
    // Vérification contraintes (max 5000 caractères)
    const finalSong = enforceConstraints(optimizedSong);
    
    const charCount = finalSong.join('\n').length;
    console.log(`✅ Chanson optimisée IA: ${charCount}/5000 caractères`);
    
    return finalSong;
    
  } catch (error) {
    console.error('❌ Erreur génération optimisée:', error);
    return generateOptimizedFallback(itemCode, rang);
  }
}

async function fetchItemData(itemCode: string): Promise<EdnItemData> {
  const { data, error } = await supabase
    .from('edn_items_immersive')
    .select('item_code, title, tableau_rang_a, tableau_rang_b')
    .eq('item_code', itemCode)
    .single();
    
  if (error || !data) {
    throw new Error(`Item ${itemCode} non trouvé`);
  }
  
  return data;
}

async function fetchCompetences(itemCode: string, rang: 'A' | 'B' | 'AB'): Promise<CompetenceOIC[]> {
  const itemNum = itemCode.replace('IC-', '').padStart(3, '0');
  
  let query = supabase
    .from('oic_competences')
    .select('*')
    .eq('item_parent', itemNum);
    
  if (rang !== 'AB') {
    query = query.eq('rang', rang);
  }
  
  const { data, error } = await query.order('ordre');
  return data || [];
}

function generateOptimizedStructure(
  itemData: EdnItemData, 
  competences: CompetenceOIC[], 
  rang: 'A' | 'B' | 'AB'
): OptimizedSongStructure {
  
  const medicalContent = extractAdvancedMedicalContent(itemData, competences, rang);
  const itemCode = itemData.item_code;
  const title = itemData.title;
  
  return {
    couplet1: generateCouplet1IA(itemCode, title, medicalContent.definition, medicalContent.epidemio, rang),
    refrain: generateRefrainOptimized(itemCode, medicalContent.keywords, rang),
    couplet2: generateCouplet2IA(medicalContent.clinique, medicalContent.paraclinique, rang),
    couplet3: generateCouplet3IA(medicalContent.traitement, medicalContent.complications, rang),
    couplet4: rang === 'AB' ? generateCouplet4IA(medicalContent.expert, rang) : undefined,
    refrainFinal: generateRefrainFinalOptimized(itemCode, rang)
  };
}

function extractAdvancedMedicalContent(itemData: EdnItemData, competences: CompetenceOIC[], rang: 'A' | 'B' | 'AB') {
  console.log(`📋 Extraction contenu médical pour ${itemData.item_code}:`, {
    competencesCount: competences.length,
    rang,
    competencesTitles: competences.map(c => c.intitule).slice(0, 3)
  });

  const content = {
    definition: [] as string[],
    epidemio: [] as string[],
    clinique: [] as string[],
    paraclinique: [] as string[],
    traitement: [] as string[],
    complications: [] as string[],
    expert: [] as string[],
    keywords: [] as string[]
  };
  
  // Extraire des compétences OIC (contenu réel)
  competences.forEach(comp => {
    if (comp.description) {
      const desc = comp.description.toLowerCase();
      
      // Classification intelligente du contenu médical
      if (desc.includes('définir') || desc.includes('concept')) {
        content.definition.push(extractMedicalPhrase(comp.description, 45));
      } else if (desc.includes('signe') || desc.includes('symptôme') || desc.includes('clinique')) {
        content.clinique.push(extractMedicalPhrase(comp.description, 45));
      } else if (desc.includes('examen') || desc.includes('biologie') || desc.includes('imagerie')) {
        content.paraclinique.push(extractMedicalPhrase(comp.description, 45));
      } else if (desc.includes('traitement') || desc.includes('thérapie') || desc.includes('médicament')) {
        content.traitement.push(extractMedicalPhrase(comp.description, 45));
      } else if (desc.includes('complication') || desc.includes('évolution')) {
        content.complications.push(extractMedicalPhrase(comp.description, 45));
      }
      
      // Mots-clés pour le refrain
      const keywords = extractKeywords(comp.description);
      content.keywords.push(...keywords);
    }
  });
  
  // Extraire des tableaux structurés
  if (itemData.tableau_rang_a?.sections) {
    extractFromTableau(itemData.tableau_rang_a.sections, content, 'A');
  }
  
  if (itemData.tableau_rang_b?.sections && (rang === 'B' || rang === 'AB')) {
    extractFromTableau(itemData.tableau_rang_b.sections, content, 'B');
  }
  
  return content;
}

function extractMedicalPhrase(text: string, maxLength: number): string {
  // Nettoyer et optimiser pour IA
  const cleaned = text
    .replace(/[.,!?;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
    
  if (cleaned.length <= maxLength) return cleaned;
  
  // Couper intelligemment sur un mot complet
  const truncated = cleaned.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > maxLength * 0.7 ? truncated.substring(0, lastSpace) : truncated;
}

function extractKeywords(description: string): string[] {
  const medicalTerms = ['diagnostic', 'traitement', 'symptôme', 'examen', 'syndrome', 'pathologie', 'thérapie'];
  const keywords: string[] = [];
  
  medicalTerms.forEach(term => {
    if (description.toLowerCase().includes(term)) {
      keywords.push(term);
    }
  });
  
  return keywords;
}

function extractFromTableau(sections: any[], content: any, rang: string) {
  sections.forEach(section => {
    if (section.concepts) {
      section.concepts.forEach((concept: any) => {
        if (concept.definition) content.definition.push(extractMedicalPhrase(concept.definition, 45));
        if (concept.exemple) content.clinique.push(extractMedicalPhrase(concept.exemple, 45));
        if (concept.application) content.traitement.push(extractMedicalPhrase(concept.application, 45));
        if (concept.analyse && rang === 'B') content.expert.push(extractMedicalPhrase(concept.analyse, 45));
      });
    }
  });
}

// 🎶 COUPLET 1 - Introduction avec définitions précises
function generateCouplet1IA(itemCode: string, title: string, definition: string[], epidemio: string[], rang: string): string[] {
  const shortTitle = title.length > 35 ? title.substring(0, 32) + '...' : title;
  
  return [
    `${shortTitle} pathologie centrale`, // IA-friendly: pas d'apostrophes
    `Définition précise et essentielle`, // Assonance -elle
    definition[0] || `Mécanisme physiopathologique clair`,
    definition[1] || `Tableau clinique caractéristique`,
    `Épidémiologie bien documentée`, // Éviter "bien" → remplacer par contenu
    epidemio[0] || `Population cible identifiée`,
    `Facteurs de risque analysés`, // Assonance -és
    `${itemCode} concept maîtrisé` // Eviter "je maîtrise"
  ];
}

// 🔁 REFRAIN - Résumé musical des notions clés  
function generateRefrainOptimized(itemCode: string, keywords: string[], rang: string): string[] {
  const intensity = rang === 'A' ? 'fondements' : rang === 'B' ? 'expertise' : 'maîtrise totale';
  const mainKeyword = keywords[0] || 'diagnostic';
  
  return [
    `${itemCode}, ${intensity} médical`, // Assonance -al
    `${mainKeyword} optimal`, // Assonance -al
    `Clinique et paraclinique`, // Rythme IA fluide
    `Excellence thérapeutique` // Assonance -ique
  ];
}

// 🎶 COUPLET 2 - Développement logique (causes, mécanismes, signes)
function generateCouplet2IA(clinique: string[], paraclinique: string[], rang: string): string[] {
  return [
    `Signes fonctionnels et physiques`, // Éviter contractions
    clinique[0] || `Inspection, palpation méthodiques`,
    clinique[1] || `Auscultation révélatrice`,
    `Syndrome complet caractéristique`, // Assonance -ique
    `Examens complémentaires ciblés`, // Assonance -és
    paraclinique[0] || `Biologie confirme l'hypothèse`,
    paraclinique[1] || `Imagerie précise l'anatomie`,
    `Diagnostic différentiel établi` // Éviter mots difficiles
  ];
}

// 🎶 COUPLET 3 - Approche thérapeutique + complications
function generateCouplet3IA(traitement: string[], complications: string[], rang: string): string[] {
  const approach = rang === 'A' ? 'standard' : 'experte';
  
  return [
    `Stratégie thérapeutique ${approach}`, // IA-friendly
    traitement[0] || `Molécules de première intention`,
    traitement[1] || `Posologie adaptée au terrain`,
    `Surveillance clinique rapprochée`, // Assonance -ée
    complications[0] || `Complications rares mais graves`,
    complications[1] || `Effets secondaires surveillés`,
    `Évolution favorable attendue`, // Optimisme médical
    `Guérison complète possible` // Finale positive
  ];
}

// 🎶 COUPLET 4 - Cas cliniques emblématiques (rang AB uniquement)
function generateCouplet4IA(expert: string[], rang: string): string[] {
  return [
    `Cas complexes et atypiques`, // Assonance -iques
    expert[0] || `Formes rares diagnostiquées`,
    expert[1] || `Techniques avancées maîtrisées`,
    `Comorbidités bien gérées`, // Assonance -ées
    expert[2] || `Innovations thérapeutiques`,
    `Recherche clinique intégrée`, // Assonance -ée
    `Excellence sans compromis`, // Rythme IA
    `Expertise médicale accomplie` // Finale forte
  ];
}

// 🔁 REFRAIN FINAL - Clôture forte et pédagogique
function generateRefrainFinalOptimized(itemCode: string, rang: string): string[] {
  const achievement = rang === 'A' ? 'validé' : rang === 'B' ? 'maîtrisé' : 'totalement intégré';
  
  return [
    `${itemCode} ${achievement}`, // Personnalisé selon rang
    `Savoir médical consolidé`, // Assonance -é
    `De la théorie à la pratique`, // Progression logique
    `Médecine moderne maîtrisée` // Finale inspirante
  ];
}

function assembleOptimizedSong(structure: OptimizedSongStructure): string[] {
  const song: string[] = [];
  
  // 🎵 STRUCTURE STANDARDISÉE AVEC BALISES IA
  song.push('[Couplet 1]');
  song.push(...structure.couplet1);
  song.push('');
  
  song.push('[Refrain]');
  song.push(...structure.refrain);
  song.push('');
  
  song.push('[Couplet 2]');
  song.push(...structure.couplet2);
  song.push('');
  
  song.push('[Refrain]');
  song.push(...structure.refrain); // Répétition identique
  song.push('');
  
  song.push('[Couplet 3]');
  song.push(...structure.couplet3);
  song.push('');
  
  song.push('[Refrain]');
  song.push(...structure.refrain);
  song.push('');
  
  // Couplet 4 optionnel pour rang AB
  if (structure.couplet4) {
    song.push('[Couplet 4]');
    song.push(...structure.couplet4);
    song.push('');
    
    song.push('[Refrain Final]');
    song.push(...structure.refrainFinal);
  } else {
    song.push('[Refrain Final]');
    song.push(...structure.refrainFinal);
  }
  
  return song;
}

function enforceConstraints(song: string[]): string[] {
  const fullText = song.join('\n');
  
  // Contrainte 5000 caractères MAX
  if (fullText.length <= 5000) {
    return song;
  }
  
  console.log(`⚠️ Chanson trop longue (${fullText.length}/5000), optimisation...`);
  
  // Stratégie 1: Supprimer le Couplet 4 si présent
  const withoutCouplet4 = song.filter((line, index) => {
    const nextLines = song.slice(index, index + 10);
    return !nextLines.some(l => l.includes('[Couplet 4]'));
  });
  
  if (withoutCouplet4.join('\n').length <= 5000) {
    return withoutCouplet4;
  }
  
  // Stratégie 2: Raccourcir intelligemment chaque section
  return song.map(line => {
    if (line.startsWith('[') || line === '') return line;
    return line.length > 50 ? line.substring(0, 47) + '...' : line;
  });
}

function generateOptimizedFallback(itemCode: string, rang: 'A' | 'B' | 'AB'): string[] {
  const intensity = rang === 'A' ? 'fondamentaux' : rang === 'B' ? 'expertise' : 'maîtrise complète';
  
  return [
    '[Couplet 1]',
    `${itemCode} pathologie essentielle`,
    `Définition clinique précise`,
    `Mécanisme physiopathologique`,
    `Tableau symptomatique typique`,
    `Épidémiologie documentée`,
    `Facteurs de risque identifiés`,
    `Diagnostic différentiel établi`,
    `Approche méthodique requise`,
    '',
    '[Refrain]',
    `${itemCode}, ${intensity}`,
    `Diagnostic optimal`,
    `Clinique et paraclinique`,
    `Excellence thérapeutique`,
    '',
    '[Couplet 2]',
    `Signes cliniques pathognomoniques`,
    `Examen physique méthodique`,
    `Examens complémentaires ciblés`,
    `Biologie confirme hypothèse`,
    `Imagerie révèle anatomie`,
    `Critères diagnostiques validés`,
    `Pronostic vital évalué`,
    `Stratégie thérapeutique adaptée`,
    '',
    '[Refrain]',
    `${itemCode}, ${intensity}`,
    `Diagnostic optimal`,
    `Clinique et paraclinique`,
    `Excellence thérapeutique`,
    '',
    '[Couplet 3]',
    `Traitement de première intention`,
    `Molécules ciblées efficaces`,
    `Posologie adaptée terrain`,
    `Surveillance clinique rapprochée`,
    `Effets secondaires anticipés`,
    `Complications rares prévenues`,
    `Évolution favorable attendue`,
    `Guérison complète possible`,
    '',
    '[Refrain Final]',
    `${itemCode} parfaitement maîtrisé`,
    `Savoir médical consolidé`,
    `De la théorie à la pratique`,
    `Excellence médicale atteinte`
  ];
}

// Compatibilité avec l'existant
export async function generateRangA(itemCode: string): Promise<string[]> {
  return generateOptimizedLyrics(itemCode, 'A');
}

export async function generateRangB(itemCode: string): Promise<string[]> {
  return generateOptimizedLyrics(itemCode, 'B');
}

export async function generateRangAB(itemCode: string): Promise<string[]> {
  return generateOptimizedLyrics(itemCode, 'AB');
}