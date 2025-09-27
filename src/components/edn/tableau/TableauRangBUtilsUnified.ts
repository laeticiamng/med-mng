import { logger } from '@/lib/logger';
import type { ProcessingData, EDNItem } from '@/types';

interface TableauRangBResult {
  lignesEnrichies: string[][];
  colonnesUtiles: Array<{ nom: string; description: string }>;
  theme: string;
  isRangB: boolean;
  expertiseLevel: string;
}

// Configuration unifiée pour tous les items Rang B
const getRangBConfig = (itemCode: string) => {
  const configs = {
    'IC-4': {
      theme: 'IC-4 Rang B - Expertise qualité et sécurité des soins',
      colonnes: [
        { nom: 'Concept expert', description: 'Expertise de haut niveau' },
        { nom: 'Analyse approfondie', description: 'Compréhension systémique' },
        { nom: 'Cas complexe', description: 'Situation réelle experte' },
        { nom: 'Écueil expert', description: 'Piège de niveau avancé' },
        { nom: 'Technique avancée', description: 'Méthode spécialisée' },
        { nom: 'Distinction fine', description: 'Nuances importantes' },
        { nom: 'Maîtrise', description: 'Application experte' },
        { nom: 'Excellence', description: 'Leadership et innovation' }
      ]
    },
    'IC-6': {
      theme: 'IC-6 Rang B - Expertise organisation et coordination',
      colonnes: [
        { nom: 'Concept expert', description: 'Organisation avancée' },
        { nom: 'Analyse systémique', description: 'Vision globale' },
        { nom: 'Cas complexe', description: 'Situation experte' },
        { nom: 'Écueil expert', description: 'Piège niveau avancé' },
        { nom: 'Technique avancée', description: 'Méthode spécialisée' },
        { nom: 'Distinction fine', description: 'Nuances organisationnelles' },
        { nom: 'Maîtrise', description: 'Application experte' },
        { nom: 'Excellence', description: 'Coordination optimale' }
      ]
    },
    'IC-7': {
      theme: 'IC-7 Rang B - Expertise application des droits',
      colonnes: [
        { nom: 'Concept expert', description: 'Droits appliqués' },
        { nom: 'Analyse juridique', description: 'Cadre légal approfondi' },
        { nom: 'Cas complexe', description: 'Situation experte' },
        { nom: 'Écueil expert', description: 'Piège niveau avancé' },
        { nom: 'Technique avancée', description: 'Méthode spécialisée' },
        { nom: 'Distinction fine', description: 'Nuances juridiques' },
        { nom: 'Maîtrise', description: 'Application experte' },
        { nom: 'Excellence', description: 'Médiation parfaite' }
      ]
    },
    'IC-8': {
      theme: 'IC-8 Rang B - Expertise lutte contre les discriminations',
      colonnes: [
        { nom: 'Concept expert', description: 'Lutte anti-discrimination' },
        { nom: 'Analyse systémique', description: 'Approche structurelle' },
        { nom: 'Cas complexe', description: 'Situation experte' },
        { nom: 'Écueil expert', description: 'Piège niveau avancé' },
        { nom: 'Technique avancée', description: 'Intervention spécialisée' },
        { nom: 'Distinction fine', description: 'Nuances sociales' },
        { nom: 'Maîtrise', description: 'Application experte' },
        { nom: 'Excellence', description: 'Équité parfaite' }
      ]
    },
    'IC-9': {
      theme: 'IC-9 Rang B - Expertise médico-légale avancée',
      colonnes: [
        { nom: 'Concept expert', description: 'Expertise médico-légale' },
        { nom: 'Analyse légale', description: 'Approche judiciaire' },
        { nom: 'Cas complexe', description: 'Situation experte' },
        { nom: 'Écueil expert', description: 'Piège niveau avancé' },
        { nom: 'Technique avancée', description: 'Méthode spécialisée' },
        { nom: 'Distinction fine', description: 'Nuances légales' },
        { nom: 'Maîtrise', description: 'Application experte' },
        { nom: 'Excellence', description: 'Expertise reconnue' }
      ]
    },
    'IC-10': {
      theme: 'IC-10 Rang B - Expertise approches transversales',
      colonnes: [
        { nom: 'Concept expert', description: 'Approche transversale experte' },
        { nom: 'Analyse holistique', description: 'Vision globale avancée' },
        { nom: 'Cas complexe', description: 'Situation experte' },
        { nom: 'Écueil expert', description: 'Piège niveau avancé' },
        { nom: 'Technique avancée', description: 'Méthode spécialisée' },
        { nom: 'Distinction fine', description: 'Nuances corporelles' },
        { nom: 'Maîtrise', description: 'Application experte' },
        { nom: 'Excellence', description: 'Approche parfaite' }
      ]
    },
    'OIC-010-03-B': {
      theme: 'OIC-010-03-B Rang B - Expertise impact psychocorporel',
      colonnes: [
        { nom: 'Concept expert', description: 'Évaluation psychocorporelle' },
        { nom: 'Analyse approfondie', description: 'Impact multidimensionnel' },
        { nom: 'Cas complexe', description: 'Situation experte' },
        { nom: 'Écueil expert', description: 'Piège niveau avancé' },
        { nom: 'Technique avancée', description: 'Protocole spécialisé' },
        { nom: 'Distinction fine', description: 'Nuances cliniques' },
        { nom: 'Maîtrise', description: 'Expertise psychosomatique' },
        { nom: 'Excellence', description: 'Accompagnement holistique' }
      ]
    }
  };
  
  return configs[itemCode as keyof typeof configs] || configs['IC-4']; // Fallback to IC-4
};

// Fonction unifiée pour traiter tous les tableaux Rang B
export const processTableauRangBUnified = (data: ProcessingData | EDNItem): TableauRangBResult => {
  const itemCode = data?.item_code || 'IC-4';
  
  logger.debug('Traitement unifié Rang B', { 
    component: 'TableauRangBUtilsUnified',
    itemCode 
  });
  
  // Extraire les données des concepts experts
  const tableauData = (data as any).tableau_rang_b || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const config = getRangBConfig(itemCode);
  
  const lignesEnrichies = concepts.map((concept: any) => [
    concept.concept || '',
    concept.definition || concept.analyse || '',
    concept.exemple || concept.cas || '',
    concept.piege || concept.ecueil || '',
    concept.mnemo || concept.technique || '',
    concept.subtilite || concept.distinction || '',
    concept.application || concept.maitrise || '',
    concept.vigilance || concept.excellence || ''
  ]);

  logger.debug(`${itemCode} Rang B expert traité: ${lignesEnrichies.length} concepts`, {
    component: 'TableauRangBUtilsUnified',
    itemCode
  });

  return {
    lignesEnrichies,
    colonnesUtiles: config.colonnes,
    theme: config.theme,
    isRangB: true,
    expertiseLevel: 'advanced'
  };
};

// Fonctions spécifiques pour compatibilité (aliases)
export const processTableauRangBIC4 = (data: any) => processTableauRangBUnified(data);
export const processTableauRangBIC6 = (data: any) => processTableauRangBUnified(data);
export const processTableauRangBIC7 = (data: any) => processTableauRangBUnified(data);
export const processTableauRangBIC8 = (data: any) => processTableauRangBUnified(data);
export const processTableauRangBIC9 = (data: any) => processTableauRangBUnified(data);
export const processTableauRangBIC10 = (data: any) => processTableauRangBUnified(data);
export const processTableauRangBOIC010 = (data: any) => processTableauRangBUnified(data);

// Fonctions de détection
export const isRangBItem = (data: any): boolean => {
  const itemCode = data?.item_code || '';
  return ['IC-4', 'IC-6', 'IC-7', 'IC-8', 'IC-9', 'IC-10', 'OIC-010-03-B'].includes(itemCode) ||
         data?.title?.includes('Rang B') ||
         data?.rang === 'B';
};

export const isIC4RangBItem = (data: any): boolean => {
  return data?.item_code === 'IC-4' || 
         data?.title?.includes('Qualité et sécurité des soins') ||
         data?.slug === 'ic4-qualite-securite-soins';
};