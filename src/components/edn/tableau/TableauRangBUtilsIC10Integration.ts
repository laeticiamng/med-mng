
interface TableauDataIC10B {
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

interface ColonneConfigB {
  nom: string;
  description: string;
}

interface ProcessedTableauResultB {
  lignesEnrichies: string[][];
  colonnesUtiles: ColonneConfigB[];
  theme: string;
  isRangB: boolean;
  expertiseLevel: string;
}

// Utilitaires pour l'affichage du Tableau Rang B IC-10
export const processTableauRangBIC10 = (data: TableauDataIC10B): ProcessedTableauResultB => {
  // Extraire les données des concepts experts
  const tableauData = data.tableau_rang_b || data;
  const concepts = (tableauData as TableauDataIC10B['tableau_rang_b'])?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles: ColonneConfigB[] = [
    { nom: 'Concept expert', description: 'Approche transversale experte' },
    { nom: 'Analyse holistique', description: 'Vision globale avancée' },
    { nom: 'Cas complexe', description: 'Situation experte' },
    { nom: 'Écueil expert', description: 'Piège niveau avancé' },
    { nom: 'Technique avancée', description: 'Méthode spécialisée' },
    { nom: 'Distinction fine', description: 'Nuances corporelles' },
    { nom: 'Maîtrise', description: 'Application experte' },
    { nom: 'Excellence', description: 'Approche parfaite' }
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

  const theme = "IC-10 Rang B - Expertise approches transversales";

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: true,
    expertiseLevel: 'advanced'
  };
};
