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
  const itemNum = itemCode.replace('IC-', '');
  const isRangA = rang === 'A';
  
  // Créer des vers rythmés avec assonances
  const verses: string[] = [];
  
  // Couplet d'introduction avec assonance
  verses.push(`${itemCode} c'est parti, on va tout maîtriser`);
  verses.push(`${isRangA ? 'Fondamentaux' : 'Expertise'} à réviser, pour tout retenir`);
  verses.push(`Compétences médicales, essentielles à connaître`);
  verses.push(`Pour l'EDN réussir, il faut s'entraîner`);
  
  // Traiter chaque compétence avec des rimes
  competences.forEach((comp, index) => {
    const competenceTitle = comp.intitule || `Compétence ${comp.objectif_id}`;
    const shortTitle = competenceTitle.substring(0, 40);
    
    // Créer des vers rythmés pour chaque compétence
    if (index % 2 === 0) {
      // Vers avec assonance en "é"
      verses.push(`${shortTitle.replace(/[.,!?]$/, '')} à étudier`);
      verses.push(`Diagnostic précis pour bien soigner`);
    } else {
      // Vers avec assonance en "ir"
      verses.push(`${shortTitle.replace(/[.,!?]$/, '')} à découvrir`);
      verses.push(`Traitement adapté pour guérir`);
    }
    
    // Ajouter des détails cliniques rythmés
    if (comp.description) {
      const desc = comp.description.substring(0, 60);
      verses.push(`${desc.replace(/[.,!?]$/, '')}, c'est à retenir`);
    }
    
    // Séparateur musical entre compétences
    if (index < competences.length - 1) {
      verses.push(`---`);
    }
  });
  
  // Refrain final avec assonances
  verses.push(`${itemCode} maîtrisé, objectif atteint`);
  verses.push(`${isRangA ? 'Base solide' : 'Expert confirmé'}, succès certain`);
  verses.push(`EDN réussie, compétences acquises`);
  verses.push(`Médecine pratiquée, excellence conquise`);
  
  // Coda finale énergique
  verses.push(`Vingt sur vingt c'est gagné !`);
  verses.push(`${itemCode} c'est validé !`);
  verses.push(`Excellence médicale !`);
  verses.push(`Réussite totale !`);

  return {
    title: `${itemCode} Rang ${rang} - Compétences Complètes`,
    content: verses,
    assonances: ['é', 'er', 'ir', 'ain', 'ée', 'ise']
  };
}

function generateFallbackLyrics(itemCode: string, rang: 'A' | 'B'): string[] {
  const itemNum = itemCode.replace('IC-', '');
  const isRangA = rang === 'A';
  
  return [
    `${itemCode} à maîtriser, compétences à réviser`,
    `${isRangA ? 'Fondamentaux' : 'Expertise'} médicale, connaissances essentielles`,
    `Diagnostic précis, traitement adapté`,
    `Prise en charge optimale, patient soigné`,
    `Complications à éviter, vigilance requise`,
    `Pronostic à évaluer, évolution maîtrisée`,
    `Examens complémentaires, investigations ciblées`,
    `Thérapeutique efficace, guérison assurée`,
    `${itemCode} validé, objectifs atteints`,
    `EDN réussie, excellence certaine`,
    `Compétences acquises, savoir confirmé`,
    `Médecine pratiquée, succès mérité`,
    `Vingt sur vingt obtenu !`,
    `${itemCode} maîtrisé !`,
    `Réussite garantie !`,
    `Excellence validée !`
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