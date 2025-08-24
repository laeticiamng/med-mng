import { TableauProcessingData, TableauResult } from '@/types/tableau';

// Utilitaires pour l'affichage du Tableau Rang A IC-10  
export const processTableauRangAIC10 = (data: TableauProcessingData): TableauResult => {
  console.log('🔍 Traitement IC-10 Rang A');
  
  // Extraire les données des concepts
  const tableauData = data.tableau_rang_a || data;
  const concepts = (tableauData as any)?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles = [
    { nom: 'Concept', description: 'Approche transversale', couleur: 'bg-teal-600', couleurCellule: 'bg-teal-50', couleurTexte: 'text-teal-800' },
    { nom: 'Définition', description: 'Compréhension globale', couleur: 'bg-purple-600', couleurCellule: 'bg-purple-50', couleurTexte: 'text-purple-800' },
    { nom: 'Exemple', description: 'Application clinique', couleur: 'bg-blue-600', couleurCellule: 'bg-blue-50', couleurTexte: 'text-blue-800' },
    { nom: 'Piège', description: 'Réductionnisme', couleur: 'bg-red-600', couleurCellule: 'bg-red-50', couleurTexte: 'text-red-800' },
    { nom: 'Mnémo', description: 'Mémorisation', couleur: 'bg-yellow-600', couleurCellule: 'bg-yellow-50', couleurTexte: 'text-yellow-800' },
    { nom: 'Subtilité', description: 'Nuances importantes', couleur: 'bg-indigo-600', couleurCellule: 'bg-indigo-50', couleurTexte: 'text-indigo-800' },
    { nom: 'Application', description: 'Mise en pratique', couleur: 'bg-green-600', couleurCellule: 'bg-green-50', couleurTexte: 'text-green-800' },
    { nom: 'Vigilance', description: 'Points d\'attention', couleur: 'bg-orange-600', couleurCellule: 'bg-orange-50', couleurTexte: 'text-orange-800' }
  ];

  const lignesEnrichies = concepts.map((concept) => [
    concept.concept || '',
    concept.definition || '',
    concept.exemple || '',
    concept.piege || '',
    concept.mnemo || '',
    concept.subtilite || '',
    concept.application || '',
    concept.vigilance || ''
  ]);

  const theme = "IC-10 Rang A - Approches transversales du corps";

  console.log(`✅ IC-10 Rang A traité: ${lignesEnrichies.length} concepts`);

  return {
    lignesEnrichies,
    colonnesUtiles: colonnesUtiles.map(col => ({
      key: col.nom.toLowerCase(),
      label: col.nom,
      obligatoire: true,
      description: col.description || col.nom
    })),
    theme,
    isRangB: false
  };
};

export const isIC10Item = (data: TableauProcessingData): boolean => {
  return (typeof data?.theme === 'string' && data.theme.includes('IC-10')) || 
         (typeof data?.title === 'string' && data.title.includes('Approches transversales du corps')) ||
         data?.item_code === 'IC-10';
};