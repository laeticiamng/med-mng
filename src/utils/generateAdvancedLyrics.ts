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

interface SongStructure {
  intro?: string[];
  couplet1: string[];
  refrain: string[];
  couplet2: string[];
  couplet3: string[];
  couplet4?: string[];
  outro?: string[];
}

/**
 * Génère des paroles style Nekfeu avec contenu médical dense
 * Structure complète 3:30-4:30 min, max 5000 caractères
 */
export async function generateAdvancedLyrics(
  itemCode: string, 
  rang: 'A' | 'B' | 'AB'
): Promise<string[]> {
  console.log(`🎵 Génération avancée ${itemCode} Rang ${rang}`);
  
  try {
    // 1. Récupérer les données complètes de l'item
    const itemData = await fetchItemData(itemCode);
    
    // 2. Récupérer les compétences OIC si disponibles
    const competences = await fetchCompetences(itemCode, rang);
    
    // 3. Générer la structure complète de la chanson
    const songStructure = generateSongStructure(itemData, competences, rang);
    
    // 4. Assembler la chanson complète
    const fullSong = assembleSong(songStructure);
    
    // 5. Vérifier la limite de caractères (5000 max)
    const finalSong = optimizeSongLength(fullSong);
    
    console.log(`✅ Chanson générée: ${finalSong.join(' ').length} caractères`);
    return finalSong;
    
  } catch (error) {
    console.error('❌ Erreur génération avancée:', error);
    return generateFallbackAdvancedSong(itemCode, rang);
  }
}

async function fetchItemData(itemCode: string): Promise<EdnItemData> {
  const { _data, _error } = await supabase
    .from('edn_items_immersive')
    .select('item_code, title, tableau_rang_a, tableau_rang_b')
    .eq('item_code', itemCode)
    .maybeSingle();
    
  if (_error || !_data) {
    throw new Error(`Item ${itemCode} non trouvé`);
  }
  
  return _data;
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
  
  const { _data, _error } = await query.order('ordre');
  
  if (_error || !_data) {
    console.log(`Aucune compétence OIC pour ${itemCode}`);
    return [];
  }
  
  return _data;
}

function generateSongStructure(
  itemData: EdnItemData, 
  _competences: CompetenceOIC[], 
  rang: 'A' | 'B' | 'AB'
): SongStructure {
  const title = itemData.title;
  const itemCode = itemData.item_code;
  
  // Extraire le contenu médical réel des tableaux
  const medicalContent = extractMedicalContent(itemData, rang);
  
  // Générer une chanson complète style Nekfeu
  return {
    couplet1: generateCouplet1(itemCode, title, medicalContent.diagnostic, rang),
    refrain: generateRefrain(itemCode, title, rang),
    couplet2: generateCouplet2(medicalContent.clinique, medicalContent.paraclinique, rang),
    couplet3: generateCouplet3(medicalContent.traitement, medicalContent.surveillance, rang),
    couplet4: rang === 'AB' ? generateCouplet4(medicalContent.complexe, rang) : undefined,
    outro: generateOutro(itemCode, rang)
  };
}

function extractMedicalContent(itemData: EdnItemData, rang: 'A' | 'B' | 'AB') {
  const content = {
    diagnostic: [] as string[],
    clinique: [] as string[],
    paraclinique: [] as string[],
    traitement: [] as string[],
    surveillance: [] as string[],
    complexe: [] as string[]
  };
  
  // Extraire du tableau_rang_a
  if (itemData.tableau_rang_a?.sections) {
    const sections = itemData.tableau_rang_a.sections;
    sections.forEach((section: any) => {
      if (section.concepts) {
        section.concepts.forEach((concept: any) => {
          if (concept.definition) content.diagnostic.push(concept.definition);
          if (concept.exemple) content.clinique.push(concept.exemple);
          if (concept.application) content.traitement.push(concept.application);
        });
      }
    });
  }
  
  // Extraire du tableau_rang_b pour complexité
  if (itemData.tableau_rang_b?.sections && (rang === 'B' || rang === 'AB')) {
    const sections = itemData.tableau_rang_b.sections;
    sections.forEach((section: any) => {
      if (section.concepts) {
        section.concepts.forEach((concept: any) => {
          if (concept.analyse) content.complexe.push(concept.analyse);
          if (concept.cas) content.complexe.push(concept.cas);
          if (concept.technique) content.surveillance.push(concept.technique);
        });
      }
    });
  }
  
  return content;
}

function generateCouplet1(itemCode: string, title: string, diagnosticContent: string[], _rang: string): string[] {
  const shortTitle = title.length > 40 ? title.substring(0, 37) + '...' : title;
  
  return [
    `Premier contact avec ${shortTitle}`, // Nekfeu style: direct, personnel
    `Les signes s'imposent, faut que j'analyse bien`,
    `Anamnèse précise, chaque détail compte`,
    `L'examen clinique révèle les indices`, 
    `${diagnosticContent[0] || 'Sémiologie fine, rien n\'échappe à l\'œil'} sûr`,
    `${diagnosticContent[1] || 'Syndrome complet à bien identifier'}`,
    `Le diagnostic différentiel se dessine`,
    `${itemCode} se confirme, la voie est tracée`
  ];
}

function generateRefrain(itemCode: string, _title: string, rang: string): string[] {
  const intensity = rang === 'B' ? 'expertise' : rang === 'AB' ? 'maîtrise totale' : 'fondements';
  
  return [
    `${itemCode}, ${intensity} en action`, // Accroche forte
    `Chaque symptôme trouve sa raison`, // Assonance -on
    `De la clinique à la solution`, // Progression logique
    `La médecine, c'est ma passion` // Nekfeu style: personnel + assonance
  ];
}

function generateCouplet2(cliniqueContent: string[], paraclinique: string[], _rang: string): string[] {
  return [
    `Maintenant j'approfondis l'examen`,
    `${cliniqueContent[0] || 'Inspection, palpation méthodique'}`,
    `${cliniqueContent[1] || 'Auscultation révèle les murmures'}`,
    `Les signes fonctionnels s'assemblent`,
    `Biologie confirme mes suspicions`,
    `${paraclinique[0] || 'Imagerie précise l\'anatomie'}`,
    `Chaque résultat nourrit ma réflexion`,
    `Le puzzle se complète, j'y vois plus clair`
  ];
}

function generateCouplet3(traitementContent: string[], surveillance: string[], rang: string): string[] {
  const approach = rang === 'A' ? 'standard' : 'complexe';
  
  return [
    `Place au traitement, stratégie ${approach}`,
    `${traitementContent[0] || 'Thérapeutique ciblée et adaptée'}`,
    `Posologie ajustée au terrain`,
    `${traitementContent[1] || 'Efficacité et tolérance surveillées'}`,
    `${surveillance[0] || 'Surveillance clinique rapprochée'}`,
    `Effets secondaires à anticiper`,
    `Évolution favorable attendue`,
    `Le patient guérit, mission accomplie`
  ];
}

function generateCouplet4(complexeContent: string[], _rang: string): string[] {
  return [
    `Cas complexes, là où ça se corse`,
    `${complexeContent[0] || 'Formes atypiques, pièges diagnostiques'}`,
    `${complexeContent[1] || 'Comorbidités qui compliquent'}`,
    `L'expertise fait la différence`,
    `Techniques avancées maîtrisées`,
    `${complexeContent[2] || 'Innovations thérapeutiques intégrées'}`,
    `L'excellence n'a pas de limite`,
    `Chaque défi rend plus fort`
  ];
}

function generateOutro(itemCode: string, rang: string): string[] {
  return [
    `${itemCode} intégré, savoir ancré`,
    `De l'étudiant au praticien confirmé`,
    rang === 'AB' ? 'A et B maîtrisés, excellence atteinte' : `Rang ${rang} validé, progression assurée`,
    `La médecine avance, moi avec elle`
  ];
}

function assembleSong(structure: SongStructure): string[] {
  const song: string[] = [];
  
  // Structure complète de chanson
  if (structure.intro) song.push(...structure.intro, '[Pause]');
  
  song.push('[Couplet 1]', ...structure.couplet1, '[Pause]');
  song.push('[Refrain]', ...structure.refrain, '[Pause]');
  song.push('[Couplet 2]', ...structure.couplet2, '[Pause]'); 
  song.push('[Refrain]', ...structure.refrain, '[Pause]');
  song.push('[Couplet 3]', ...structure.couplet3, '[Pause]');
  song.push('[Refrain]', ...structure.refrain, '[Pause]');
  
  if (structure.couplet4) {
    song.push('[Couplet 4]', ...structure.couplet4, '[Pause]');
    song.push('[Refrain Final]', ...structure.refrain, '[Pause]');
  }
  
  if (structure.outro) song.push('[Outro]', ...structure.outro);
  
  return song;
}

function optimizeSongLength(song: string[]): string[] {
  const fullText = song.join('\n');
  
  if (fullText.length <= 5000) {
    return song;
  }
  
  // Réduire si trop long: supprimer le couplet 4 si présent
  const withoutCouplet4 = song.filter((_line, index) => {
    const nextLines = song.slice(index, index + 10);
    return !nextLines.some(l => l.includes('[Couplet 4]'));
  });
  
  const reducedText = withoutCouplet4.join('\n');
  if (reducedText.length <= 5000) {
    return withoutCouplet4;
  }
  
  // Si encore trop long, tronquer intelligemment
  return song.slice(0, Math.floor(song.length * 0.8));
}

function generateFallbackAdvancedSong(itemCode: string, _rang: 'A' | 'B' | 'AB'): string[] {
  const structure = {
    couplet1: [
      `${itemCode} pathologie centrale`,
      `Diagnostic différentiel essentiel`,
      `Signes cliniques pathognomoniques`,
      `Anamnèse orientée, précise`,
      `Examen physique méthodique`,
      `Syndrome complet à identifier`,
      `Mécanisme physiopathologique`,
      `Tableau clinique caractéristique`
    ],
    refrain: [
      `${itemCode}, expertise médicale`,
      `Chaque symptôme trouve sa place`,
      `De la clinique à la thérapie`,
      `La guérison dans mes traces`
    ],
    couplet2: [
      `Examens complémentaires ciblés`,
      `Biologie confirme l'hypothèse`,
      `Imagerie révèle l'anatomie`,
      `Résultats convergent vers le diagnostic`,
      `Critères de gravité évalués`,
      `Pronostic vital considéré`,
      `Complications à prévenir`,
      `Stratégie thérapeutique adaptée`
    ],
    couplet3: [
      `Traitement de première intention`,
      `Molécules ciblées efficaces`,
      `Posologie adaptée au terrain`,
      `Surveillance clinique rapprochée`,
      `Effets secondaires anticipés`,
      `Résistance thérapeutique rare`,
      `Évolution favorable attendue`,
      `Guérison complète possible`
    ],
    outro: [
      `${itemCode} maîtrisé parfaitement`,
      `Savoir médical consolidé`,
      `Excellence clinique atteinte`,
      `Médecin accompli, patient sauvé`
    ]
  };
  
  return assembleSong(structure);
}

// Export pour compatibilité avec l'existant
export async function generateMixedAdvancedLyrics(itemCode: string): Promise<string[]> {
  return generateAdvancedLyrics(itemCode, 'AB');
}