import { supabase } from '@/integrations/supabase/client';

interface CompetenceOIC {
  objectif_id: string;
  intitule: string;
  description: string;
  rang: string;
  rubrique: string;
  item_parent: string;
}

interface LyricsSection {
  title: string;
  content: string[];
  assonances: string[];
}

export async function generateComprehensiveLyrics(itemCode: string, rang: 'A' | 'B'): Promise<string[]> {
  console.log(`🎵 Génération paroles complètes pour ${itemCode} Rang ${rang}`);
  
  try {
    // 1. Récupérer TOUTES les compétences pour cet item
    const { data: competences, error } = await supabase
      .from('oic_competences')
      .select('*')
      .eq('item_parent', itemCode.replace('IC-', '').padStart(3, '0'))
      .eq('rang', rang)
      .order('ordre');

    if (error) {
      console.error('Erreur récupération compétences:', error);
      return generateFallbackLyrics(itemCode, rang);
    }

    if (!competences || competences.length === 0) {
      console.log('Aucune compétence OIC trouvée, génération fallback');
      return generateFallbackLyrics(itemCode, rang);
    }

    console.log(`✅ ${competences.length} compétences trouvées pour ${itemCode} Rang ${rang}`);

    // 2. Générer des paroles musicales avec assonances
    const lyricsSection = generateMusicalLyrics(itemCode, competences, rang);
    
    return lyricsSection.content;
    
  } catch (error) {
    console.error('Erreur génération paroles:', error);
    return generateFallbackLyrics(itemCode, rang);
  }
}

function generateMusicalLyrics(itemCode: string, competences: CompetenceOIC[], rang: 'A' | 'B'): LyricsSection {
  const verses: string[] = [];
  
  // Traiter chaque compétence avec du contenu médical dense
  competences.forEach((comp, index) => {
    const competenceTitle = comp.intitule || `Objectif ${comp.objectif_id}`;
    const description = comp.description || '';
    
    // Couplet avec contenu médical réel (assonances en -é/-er)
    if (description.length > 20) {
      // Extraire les points médicaux clés de la description
      const medicalFacts = extractMedicalFacts(description, competenceTitle);
      verses.push(...medicalFacts);
    } else {
      // Couplet basé sur l'intitulé avec contenu médical
      const titleFacts = generateMedicalContent(competenceTitle, itemCode, rang);
      verses.push(...titleFacts);
    }
    
    // Refrain avec diagnostic/traitement (assonances en -ir/-ain)
    if (index % 2 === 0) {
      verses.push(`Diagnostic précis à bien définir`);
      verses.push(`Traitement adapté pour guérir`);
    } else {
      verses.push(`Signes cliniques à observer, pronostic certain`);
      verses.push(`Prise en charge optimale, résultat sain`);
    }
    
    // Séparateur rythmique entre compétences
    if (index < competences.length - 1) {
      verses.push(`---`);
    }
  });
  
  // Coda finale avec assonances forte (éviter les mots interdits)
  verses.push(`${itemCode} maîtrisé, savoir consolidé`);
  verses.push(`Diagnostic affiné, traitement validé`);
  verses.push(`EDN réussie, objectifs atteints`);
  verses.push(`Excellence médicale, succès certains`);

  return {
    title: `${itemCode} Rang ${rang} - Contenus Médicaux`,
    content: verses,
    assonances: ['é', 'er', 'ir', 'ain', 'ée', 'ise']
  };
}

// Extraire les faits médicaux de la description
function extractMedicalFacts(description: string, title: string): string[] {
  const facts: string[] = [];
  const cleanDesc = description.replace(/[.,!?;:]/g, ' ').trim();
  
  // Diviser en segments de 40-60 caractères avec assonances
  const words = cleanDesc.split(' ').filter(w => w.length > 0);
  let currentLine = '';
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (currentLine.length + word.length + 1 <= 50) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        // Ajouter assonance selon le contenu
        if (currentLine.includes('diagnostic') || currentLine.includes('symptôme')) {
          facts.push(`${currentLine} à identifier`);
        } else if (currentLine.includes('traitement') || currentLine.includes('thérapie')) {
          facts.push(`${currentLine} à maîtriser`);
        } else {
          facts.push(`${currentLine} essentiel`);
        }
      }
      currentLine = word;
    }
  }
  
  // Dernière ligne
  if (currentLine) {
    facts.push(`${currentLine} médical`);
  }
  
  // S'assurer d'avoir au moins 2 lignes
  if (facts.length < 2) {
    facts.push(`${title.substring(0, 40)} fondamental`);
    facts.push(`Savoir médical spécialisé`);
  }
  
  return facts;
}

// Générer du contenu médical à partir du titre
function generateMedicalContent(title: string, itemCode: string, rang: 'A' | 'B'): string[] {
  const content: string[] = [];
  const cleanTitle = title.substring(0, 45);
  
  // Premier vers : définition/concept principal
  content.push(`${cleanTitle} bien défini`);
  
  // Deuxième vers : aspect clinique avec assonance
  if (rang === 'A') {
    content.push(`Signes cliniques à bien cerner`);
    content.push(`Diagnostic différentiel établi`);
    content.push(`Prise en charge à bien mener`);
  } else {
    content.push(`Expertise clinique approfondie`);
    content.push(`Cas complexes à analyser`);
    content.push(`Techniques avancées maîtrisées`);
  }
  
  return content;
}

function generateFallbackLyrics(itemCode: string, rang: 'A' | 'B'): string[] {
  const isRangA = rang === 'A';
  
  return [
    // Contenu médical dense sans mots interdits
    `${itemCode} pathologies multiples`,
    `Signes cliniques spécifiques à reconnaître`,
    `Diagnostic différentiel méthodique`,
    `Examens paracliniques orientés`,
    `---`,
    `Thérapeutiques ciblées efficaces`,
    `Posologie adaptée au terrain`,
    `Surveillance clinique rapprochée`,
    `Effets secondaires à prévenir`,
    `---`,
    `Pronostic vital engagé parfois`,
    `Évolution favorable attendue`,
    `Complications rares mais graves`,
    `Prévention primaire essentielle`,
    `---`,
    // Conclusion avec assonances fortes
    `${itemCode} pathologie maîtrisée`,
    `Diagnostic affiné, traitement validé`,
    `Excellence médicale démontrée`,
    `Réussite clinique assurée`
  ];
}

// Fonction pour générer des paroles mix A+B
export async function generateMixedLyrics(itemCode: string): Promise<string[]> {
  console.log(`🎵 Génération paroles mixtes pour ${itemCode}`);
  
  const lyricsA = await generateComprehensiveLyrics(itemCode, 'A');
  const lyricsB = await generateComprehensiveLyrics(itemCode, 'B');
  
  // Entrelacer les paroles A et B pour créer un mix cohérent
  const mixedLyrics: string[] = [];
  
  // Introduction commune
  mixedLyrics.push(`${itemCode} complet, A et B maîtrisés`);
  mixedLyrics.push(`Fondamentaux et expertise, tout dominé`);
  
  // Alterner entre A et B
  const maxLength = Math.max(lyricsA.length, lyricsB.length);
  for (let i = 0; i < maxLength; i += 4) {
    // 2 vers de A
    if (i < lyricsA.length) {
      mixedLyrics.push(lyricsA[i]);
      if (i + 1 < lyricsA.length) mixedLyrics.push(lyricsA[i + 1]);
    }
    
    // 2 vers de B  
    if (i < lyricsB.length) {
      mixedLyrics.push(lyricsB[i]);
      if (i + 1 < lyricsB.length) mixedLyrics.push(lyricsB[i + 1]);
    }
    
    // Séparateur si pas la fin
    if (i + 4 < maxLength) {
      mixedLyrics.push(`---`);
    }
  }
  
  // Conclusion puissante
  mixedLyrics.push(`${itemCode} intégral, perfection atteinte`);
  mixedLyrics.push(`A et B unis, excellence certaine`);
  mixedLyrics.push(`EDN dominée, vingt sur vingt assuré`);
  mixedLyrics.push(`Médecin accompli, avenir radieux !`);
  
  return mixedLyrics;
}