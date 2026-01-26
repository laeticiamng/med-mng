import { supabase } from '@/integrations/supabase/client';

interface CompetenceOIC {
  objectif_id: string;
  intitule: string;
  description: string | null;
  rang: string;
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
    // Normaliser le code item (IC-8 -> 008, IC-12 -> 012, etc.)
    const itemNumber = itemCode.replace('IC-', '').padStart(3, '0');
    
    // 1. Récupérer TOUTES les compétences pour cet item
    const { data: competences, error } = await supabase
      .from('oic_competences')
      .select('objectif_id, intitule, description, rang, item_parent')
      .eq('item_parent', itemNumber)
      .eq('rang', rang)
      .order('objectif_id');

    console.log(`📋 Requête oic_competences:`, { itemNumber, rang, competences: competences?.length, error });

    if (error) {
      console.error('Erreur récupération compétences:', error);
      return generateFallbackLyrics(itemCode, rang);
    }

    if (!competences || competences.length === 0) {
      console.log('Aucune compétence OIC trouvée, génération fallback');
      return generateFallbackLyrics(itemCode, rang);
    }

    console.log(`✅ ${competences.length} compétences trouvées pour ${itemCode} Rang ${rang}`);

    // 2. Générer des paroles musicales BASÉES sur le contenu réel
    const lyricsSection = generateMusicalLyricsFromContent(itemCode, competences, rang);
    
    return lyricsSection.content;
    
  } catch (error) {
    console.error('Erreur génération paroles:', error);
    return generateFallbackLyrics(itemCode, rang);
  }
}

/**
 * Génère des paroles musicales basées sur le VRAI contenu des compétences OIC
 */
function generateMusicalLyricsFromContent(itemCode: string, competences: CompetenceOIC[], rang: 'A' | 'B'): LyricsSection {
  const verses: string[] = [];
  const rangText = rang === 'A' ? 'fondamental' : 'expert';
  
  // Intro basée sur le premier intitulé (souvent le titre du thème)
  const mainTopic = competences[0]?.intitule || itemCode;
  verses.push(`[Intro]`);
  verses.push(`${itemCode} ${mainTopic}`);
  verses.push(`Niveau ${rangText} à maîtriser`);
  verses.push(``);
  
  // Traiter chaque compétence avec son VRAI contenu
  competences.forEach((comp, index) => {
    const intitule = comp.intitule || `Objectif ${comp.objectif_id}`;
    const description = comp.description || '';
    
    // Couplet basé sur le contenu réel
    verses.push(`[Couplet ${index + 1}]`);
    
    // Utiliser l'intitulé comme première ligne
    const cleanIntitule = cleanTextForLyrics(intitule, 60);
    verses.push(cleanIntitule);
    
    // Extraire les points clés de la description
    if (description && description.length > 20) {
      const keyPoints = extractKeyPointsFromDescription(description);
      keyPoints.forEach(point => {
        verses.push(point);
      });
    }
    
    // Refrain court entre les compétences (pas après la dernière)
    if (index < competences.length - 1 && index % 2 === 1) {
      verses.push(``);
      verses.push(`[Refrain]`);
      verses.push(`${mainTopic} bien compris`);
      verses.push(`${itemCode} maîtrisé`);
      verses.push(``);
    }
  });
  
  // Coda finale
  verses.push(``);
  verses.push(`[Outro]`);
  verses.push(`${itemCode} ${mainTopic}`);
  verses.push(`Compétences ${rangText}es acquises`);
  verses.push(`Formation validée avec succès`);

  return {
    title: `${itemCode} Rang ${rang} - ${mainTopic}`,
    content: verses,
    assonances: ['é', 'er', 'is', 'ée']
  };
}

/**
 * Nettoie le texte pour les paroles (limite la longueur, retire les caractères spéciaux)
 */
function cleanTextForLyrics(text: string, maxLength: number = 60): string {
  // Retirer les caractères spéciaux et formater
  let clean = text
    .replace(/[.,!?;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Limiter la longueur
  if (clean.length > maxLength) {
    const words = clean.split(' ');
    clean = '';
    for (const word of words) {
      if ((clean + ' ' + word).length <= maxLength) {
        clean = clean ? clean + ' ' + word : word;
      } else {
        break;
      }
    }
  }
  
  return clean;
}

/**
 * Extrait les points clés d'une description médicale pour en faire des vers
 */
function extractKeyPointsFromDescription(description: string): string[] {
  const points: string[] = [];
  
  // Nettoyer la description
  const cleanDesc = description
    .replace(/\s+/g, ' ')
    .trim();
  
  // Diviser en phrases
  const sentences = cleanDesc.split(/[.!?]+/).filter(s => s.trim().length > 10);
  
  // Prendre les 2-3 premières phrases significatives
  const maxPoints = Math.min(3, sentences.length);
  
  for (let i = 0; i < maxPoints; i++) {
    const sentence = sentences[i].trim();
    if (sentence.length > 10) {
      // Formater comme vers (max 60 caractères)
      const verse = cleanTextForLyrics(sentence, 60);
      if (verse.length > 10) {
        points.push(verse);
      }
    }
  }
  
  // S'assurer d'avoir au moins 2 lignes
  if (points.length < 2) {
    // Découper la description en segments
    const words = cleanDesc.split(' ').filter(w => w.length > 0);
    let currentLine = '';
    
    for (const word of words) {
      if (currentLine.length + word.length + 1 <= 50) {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      } else if (currentLine) {
        points.push(currentLine);
        currentLine = word;
        if (points.length >= 3) break;
      }
    }
    
    if (currentLine && points.length < 3) {
      points.push(currentLine);
    }
  }
  
  return points;
}

function generateFallbackLyrics(itemCode: string, rang: 'A' | 'B'): string[] {
  const rangText = rang === 'A' ? 'fondamental' : 'expert';
  
  return [
    `[Intro]`,
    `${itemCode} formation médicale`,
    `Niveau ${rangText} à maîtriser`,
    ``,
    `[Couplet 1]`,
    `Connaissances essentielles`,
    `Compétences professionnelles`,
    `Savoir médical approfondi`,
    ``,
    `[Refrain]`,
    `${itemCode} bien compris`,
    `Formation validée aujourd'hui`,
    ``,
    `[Couplet 2]`,
    `Pratique clinique rigoureuse`,
    `Diagnostic méthodique`,
    `Prise en charge adaptée`,
    ``,
    `[Outro]`,
    `${itemCode} maîtrisé`,
    `Compétences acquises avec succès`,
    `Excellence médicale atteinte`
  ];
}

// Fonction pour générer des paroles mix A+B
export async function generateMixedLyrics(itemCode: string): Promise<string[]> {
  console.log(`🎵 Génération paroles mixtes pour ${itemCode}`);
  
  const lyricsA = await generateComprehensiveLyrics(itemCode, 'A');
  const lyricsB = await generateComprehensiveLyrics(itemCode, 'B');
  
  // Combiner les paroles A et B intelligemment
  const mixedLyrics: string[] = [];
  
  // Introduction commune
  mixedLyrics.push(`[Intro]`);
  mixedLyrics.push(`${itemCode} complet A et B`);
  mixedLyrics.push(`Maîtrise totale`);
  mixedLyrics.push(``);
  
  // Alterner entre A et B (sans les intros/outros)
  const aContent = lyricsA.filter(l => !l.startsWith('[Intro]') && !l.startsWith('[Outro]') && l.trim());
  const bContent = lyricsB.filter(l => !l.startsWith('[Intro]') && !l.startsWith('[Outro]') && l.trim());
  
  // Partie A
  mixedLyrics.push(`[Partie Rang A - Fondamentaux]`);
  aContent.slice(0, 8).forEach(line => {
    if (!line.startsWith('[')) mixedLyrics.push(line);
  });
  mixedLyrics.push(``);
  
  // Partie B
  mixedLyrics.push(`[Partie Rang B - Expert]`);
  bContent.slice(0, 8).forEach(line => {
    if (!line.startsWith('[')) mixedLyrics.push(line);
  });
  mixedLyrics.push(``);
  
  // Conclusion puissante
  mixedLyrics.push(`[Outro]`);
  mixedLyrics.push(`${itemCode} intégral maîtrisé`);
  mixedLyrics.push(`Rang A et B validés`);
  mixedLyrics.push(`Excellence médicale certifiée`);
  
  return mixedLyrics;
}
