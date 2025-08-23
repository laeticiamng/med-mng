
import type { ProcessingData, EDNItem } from '@/types';

// Utilitaires pour l'intégration des données IC-8
export const processTableauRangAIC8 = (data: ProcessingData | EDNItem) => {
  console.log('🔍 Traitement IC-8 - Certificats médicaux violences');
  
  // Extraire les données du tableau
  const tableauData = (data as EDNItem).tableau_rang_a || data;
  const concepts = (tableauData as any)?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles = [
    { nom: 'Concept', description: 'Élément médico-légal' },
    { nom: 'Définition', description: 'Cadre juridique précis' },
    { nom: 'Exemple', description: 'Cas pratique type' },
    { nom: 'Piège', description: 'Erreur à éviter' },
    { nom: 'Mnémotechnique', description: 'Aide-mémoire' },
    { nom: 'Subtilité', description: 'Nuance légale' },
    { nom: 'Application', description: 'Pratique concrète' },
    { nom: 'Vigilance', description: 'Point déontologique' }
  ];

  const lignesEnrichies = concepts.map((concept: any) => [
    concept.concept || '',
    concept.definition || '',
    concept.exemple || '',
    concept.piege || '',
    concept.mnemo || '',
    concept.subtilite || '',
    concept.application || '',
    concept.vigilance || ''
  ]);

  const theme = "IC-8 - Certificats médicaux dans le cadre des violences";

  console.log(`✅ IC-8 traité: ${lignesEnrichies.length} concepts`);

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: false
  };
};

export const isIC8Item = (data: ProcessingData | EDNItem): boolean => {
  return data?.item_code === 'IC-8' || 
         data?.title?.includes('Certificats médicaux') ||
         data?.title?.includes('violences') ||
         data?.theme?.includes('IC-8');
};
