
interface TableauDataIC6B {
  tableau_rang_b?: {
    sections?: Array<{
      concepts?: Array<{
        concept?: string;
        definition?: string;
        exemple?: string;
        piege?: string;
        mnemo?: string;
        subtilite?: string;
        application?: string;
        vigilance?: string;
      }>;
    }>;
  };
}

interface ColonneConfigIC6B {
  nom: string;
  description: string;
}

interface ProcessedTableauResultIC6B {
  lignesEnrichies: string[][];
  colonnesUtiles: ColonneConfigIC6B[];
  theme: string;
  isRangB: boolean;
  expertiseLevel: string;
}

// Utilitaires pour l'affichage du Tableau Rang B IC-6
export const processTableauRangBIC6 = (data: TableauDataIC6B): ProcessedTableauResultIC6B => {
  const tableauData = data.tableau_rang_b || data;
  const concepts = (tableauData as TableauDataIC6B['tableau_rang_b'])?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles: ColonneConfigIC6B[] = [
    { nom: 'Concept expert', description: 'Organisation avancée' },
    { nom: 'Analyse systémique', description: 'Vision globale' },
    { nom: 'Cas complexe', description: 'Situation experte' },
    { nom: 'Écueil expert', description: 'Piège niveau avancé' },
    { nom: 'Technique avancée', description: 'Méthode spécialisée' },
    { nom: 'Distinction fine', description: 'Nuances organisationnelles' },
    { nom: 'Maîtrise', description: 'Application experte' },
    { nom: 'Excellence', description: 'Coordination optimale' }
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

  const theme = "IC-6 Rang B - Expertise organisation et coordination";

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: true,
    expertiseLevel: 'advanced'
  };
};
