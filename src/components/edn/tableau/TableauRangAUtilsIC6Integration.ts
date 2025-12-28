
interface TableauDataIC6 {
  tableau_rang_a?: {
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
  item_code?: string;
  title?: string;
  theme?: string;
}

interface ColonneConfigIC6 {
  nom: string;
  description: string;
}

interface ProcessedTableauResultIC6 {
  lignesEnrichies: string[][];
  colonnesUtiles: ColonneConfigIC6[];
  theme: string;
  isRangB: boolean;
}

// Utilitaires pour l'intégration des données IC-6
export const processTableauRangAIC6 = (data: TableauDataIC6): ProcessedTableauResultIC6 => {
  const tableauData = data.tableau_rang_a || data;
  const concepts = (tableauData as TableauDataIC6['tableau_rang_a'])?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles: ColonneConfigIC6[] = [
    { nom: 'Concept', description: 'Notion clé organisation' },
    { nom: 'Définition', description: 'Explication précise' },
    { nom: 'Exemple', description: 'Cas concret pratique' },
    { nom: 'Piège', description: 'Erreur à éviter' },
    { nom: 'Mnémotechnique', description: 'Aide-mémoire' },
    { nom: 'Subtilité', description: 'Nuance importante' },
    { nom: 'Application', description: 'Mise en pratique' },
    { nom: 'Vigilance', description: 'Point d\'attention' }
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

  const theme = "IC-6 - Organisation de l'exercice clinique et sécurisation du parcours patient";

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: false
  };
};

export const isIC6Item = (data: TableauDataIC6 | null): boolean => {
  if (!data) return false;
  return data.item_code === 'IC-6' || 
         data.title?.includes('Organisation de l\'exercice clinique') === true ||
         data.theme?.includes('IC-6') === true;
};
