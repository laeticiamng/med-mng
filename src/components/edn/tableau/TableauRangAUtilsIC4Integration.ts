
interface TableauDataIC4 {
  tableau_rang_a?: {
    sections?: Array<{
      concepts?: Array<{
        concept?: string;
        definition?: string;
        exemple?: string;
        piege?: string;
        mnemo?: string;
        application?: string;
        vigilance?: string;
      }>;
    }>;
  };
  tableau_rang_b?: {
    sections?: Array<{
      concepts?: Array<{
        concept?: string;
        analyse?: string;
        cas?: string;
        ecueil?: string;
        technique?: string;
        maitrise?: string;
        excellence?: string;
      }>;
    }>;
  };
  item_code?: string;
  title?: string;
  slug?: string;
}

interface ColonneConfigIC4 {
  nom: string;
  description: string;
}

interface ProcessedTableauResultIC4 {
  lignesEnrichies: string[][];
  colonnesUtiles: ColonneConfigIC4[];
  theme: string;
  isRangB: boolean;
}

// Utilitaires pour l'intégration des données IC-4 avec structure complexe
export const isIC4Item = (data: TableauDataIC4 | null): boolean => {
  if (!data) return false;
  return data.item_code === 'IC-4' || 
         data.title?.includes('Qualité et sécurité des soins') === true ||
         data.slug === 'ic4-qualite-securite-soins';
};

export const processTableauRangAIC4 = (data: TableauDataIC4): ProcessedTableauResultIC4 => {
  // Extraire les données des concepts depuis la nouvelle structure JSON
  const tableauData = data.tableau_rang_a || data;
  const concepts = (tableauData as TableauDataIC4['tableau_rang_a'])?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles: ColonneConfigIC4[] = [
    { nom: 'Concept', description: 'Notion clé à maîtriser' },
    { nom: 'Définition', description: 'Définition précise et complète' },
    { nom: 'Exemple', description: 'Illustration pratique' },
    { nom: 'Piège', description: 'Erreur fréquente à éviter' },
    { nom: 'Mnémo', description: 'Aide-mémoire' },
    { nom: 'Application', description: 'Mise en pratique' },
    { nom: 'Vigilance', description: 'Point de vigilance' }
  ];

  const lignesEnrichies = concepts.map((concept) => [
    concept.concept || '',
    concept.definition || '',
    concept.exemple || '',
    concept.piege || '',
    concept.mnemo || '',
    concept.application || '',
    concept.vigilance || ''
  ]);

  const theme = "IC-4 Rang A - Qualité et sécurité des soins (13 concepts)";

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: false
  };
};

export const processTableauRangBIC4 = (data: TableauDataIC4): ProcessedTableauResultIC4 => {
  // Extraire les données des concepts experts depuis la nouvelle structure JSON
  const tableauData = data.tableau_rang_b || data;
  const concepts = (tableauData as TableauDataIC4['tableau_rang_b'])?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles: ColonneConfigIC4[] = [
    { nom: 'Concept', description: 'Expertise avancée' },
    { nom: 'Analyse', description: 'Analyse approfondie' },
    { nom: 'Cas complexe', description: 'Situation concrète' },
    { nom: 'Écueil', description: 'Piège d\'expert' },
    { nom: 'Technique', description: 'Méthode spécialisée' },
    { nom: 'Maîtrise', description: 'Niveau de maîtrise requis' },
    { nom: 'Excellence', description: 'Niveau d\'excellence' }
  ];

  const lignesEnrichies = concepts.map((concept) => [
    concept.concept || '',
    concept.analyse || '',
    concept.cas || '',
    concept.ecueil || '',
    concept.technique || '',
    concept.maitrise || '',
    concept.excellence || ''
  ]);

  const theme = "IC-4 Rang B - Expertise qualité et sécurité (22 concepts)";

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: true
  };
};
