
import type { ProcessingData, EDNItem } from '@/types';

// Utilitaires pour l'intégration des données OIC-010-03-B
export const processTableauRangAOIC010 = (data: ProcessingData | EDNItem) => {
  console.log('🔍 Traitement OIC-010-03-B - Impact des maladies sur l\'expérience du corps');
  
  // Extraire les données du tableau
  const tableauData = (data as EDNItem).tableau_rang_a || data;
  const concepts = (tableauData as any)?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles = [
    { nom: 'Concept', description: 'Impact psychocorporel' },
    { nom: 'Définition', description: 'Cadre théorique' },
    { nom: 'Exemple', description: 'Situation clinique' },
    { nom: 'Piège', description: 'Erreur fréquente' },
    { nom: 'Mnémotechnique', description: 'Aide-mémoire' },
    { nom: 'Subtilité', description: 'Nuance clinique' },
    { nom: 'Application', description: 'Prise en charge' },
    { nom: 'Vigilance', description: 'Point de surveillance' }
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

  const theme = "OIC-010-03-B - Impact des maladies sur l'expérience du corps";

  console.log(`✅ OIC-010-03-B traité: ${lignesEnrichies.length} concepts`);

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: false
  };
};

export const isOIC010Item = (data: ProcessingData | EDNItem): boolean => {
  return data?.item_code === 'OIC-010-03-B' || 
         data?.title?.includes('impact des différentes maladies') ||
         data?.title?.includes('expérience du corps') ||
         data?.theme?.includes('OIC-010');
};
