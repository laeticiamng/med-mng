
import { conceptsRangAIC4 } from './TableauRangADataIC4';
import { generateLignesRangAIntelligentIC4, determinerColonnesUtilesIC4 } from './TableauRangAUtilsIC4';

// Fonction pour détecter si c'est l'item IC-4
export const isIC4Item = (data: any): boolean => {
  if (!data || !data.item_code) return false;
  return data.item_code === 'IC-4';
};

// Fonction principale pour traiter les données IC-4 depuis Supabase
export function processTableauRangAIC4(tableauData: any) {
  console.log('Processing IC-4 data from Supabase:', tableauData);
  
  // Extraire les concepts depuis la structure Supabase
  const lignes: string[][] = [];
  
  if (tableauData && tableauData.sections) {
    tableauData.sections.forEach((section: any) => {
      section.concepts?.forEach((concept: any) => {
        const ligne = [
          concept.concept || '',
          concept.definition || '',
          concept.exemple || '',
          concept.piege || '',
          concept.mnemo || '',
          concept.subtilite || '',
          concept.application || '',
          concept.vigilance || ''
        ];
        lignes.push(ligne);
      });
    });
  }
  
  // Si pas de données structurées, utiliser les données par défaut
  if (lignes.length === 0) {
    console.log('Utilisation des données IC-4 par défaut');
    return {
      lignesEnrichies: generateLignesRangAIntelligentIC4({}),
      colonnesUtiles: determinerColonnesUtilesIC4([]),
      theme: 'IC-4 : Qualité et sécurité des soins - Rang A'
    };
  }
  
  // Déterminer les colonnes utiles basées sur le contenu
  const colonnesUtiles = determinerColonnesUtilesIC4(lignes);
  
  return {
    lignesEnrichies: lignes,
    colonnesUtiles,
    theme: tableauData?.theme || 'IC-4 : Qualité et sécurité des soins - Rang A'
  };
}

// Fonction pour générer les lignes IC-4 optimisées (compatibilité)
export const generateLignesRangAWithIC4 = (data: any): string[][] => {
  if (isIC4Item(data)) {
    console.log('Utilisation des données spécifiques IC-4');
    const processed = processTableauRangAIC4(data.tableau_rang_a || data);
    return processed.lignesEnrichies;
  }
  
  // Retombe sur la génération standard pour les autres items
  return data.lignes || [];
};

// Fonction pour déterminer les colonnes IC-4 optimisées (compatibilité)
export const determinerColonnesUtilesWithIC4 = (lignes: string[][], data: any): any[] => {
  if (isIC4Item(data)) {
    console.log('Utilisation des colonnes spécifiques IC-4');
    return determinerColonnesUtilesIC4(lignes);
  }
  
  // Retombe sur la détermination standard pour les autres items
  return [
    { nom: 'Concept', couleur: 'bg-blue-600', couleurCellule: 'bg-blue-50', couleurTexte: 'text-blue-800' },
    { nom: 'Définition', couleur: 'bg-green-600', couleurCellule: 'bg-green-50', couleurTexte: 'text-green-800' }
  ];
};
