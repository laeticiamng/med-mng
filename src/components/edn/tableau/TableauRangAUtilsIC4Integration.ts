import { TableauProcessingData, ConceptTableau, TableauResult } from '@/types/tableau';

// Utilitaires pour l'intégration des données IC-4 avec structure complexe
export const isIC4Item = (data: TableauProcessingData): boolean => {
  return data?.item_code === 'IC-4' || 
         (typeof data?.title === 'string' && data.title.includes('Qualité et sécurité des soins')) ||
         data?.slug === 'ic4-qualite-securite-soins';
};

export const processTableauRangAIC4 = (data: TableauProcessingData): TableauResult => {
  console.log('🔍 Traitement IC-4 Qualité et sécurité des soins');
  
  // Extraire les données des concepts depuis la nouvelle structure JSON
  const tableauData = data.tableau_rang_a || data;
  const concepts = (tableauData as any)?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles = [
    { nom: 'Concept', description: 'Notion clé à maîtriser' },
    { nom: 'Définition', description: 'Définition précise et complète' },
    { nom: 'Exemple', description: 'Illustration pratique' },
    { nom: 'Piège', description: 'Erreur fréquente à éviter' },
    { nom: 'Mnémo', description: 'Aide-mémoire' },
    { nom: 'Application', description: 'Mise en pratique' },
    { nom: 'Vigilance', description: 'Point de vigilance' }
  ];

  const lignesEnrichies = concepts.map((concept: ConceptTableau) => [
    concept.concept || '',
    concept.definition || '',
    concept.exemple || '',
    concept.piege || '',
    concept.mnemo || '',
    concept.application || '',
    concept.vigilance || ''
  ]);

  const theme = "IC-4 Rang A - Qualité et sécurité des soins (13 concepts)";

  console.log(`✅ IC-4 traité: ${lignesEnrichies.length} concepts`);

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

export const processTableauRangBIC4 = (data: TableauProcessingData): TableauResult => {
  console.log('🔍 Traitement IC-4 Rang B - Expertise qualité et sécurité');
  
  // Extraire les données des concepts experts depuis la nouvelle structure JSON
  const tableauData = data.tableau_rang_b || data;
  const concepts = (tableauData as any)?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles = [
    { nom: 'Concept', description: 'Expertise avancée' },
    { nom: 'Analyse', description: 'Analyse approfondie' },
    { nom: 'Cas complexe', description: 'Situation concrète' },
    { nom: 'Écueil', description: 'Piège d\'expert' },
    { nom: 'Technique', description: 'Méthode spécialisée' },
    { nom: 'Maîtrise', description: 'Niveau de maîtrise requis' },
    { nom: 'Excellence', description: 'Niveau d\'excellence' }
  ];

  const lignesEnrichies = concepts.map((concept: ConceptTableau) => [
    concept.concept || '',
    concept.analyse || '',
    concept.cas || '',
    concept.ecueil || '',
    concept.technique || '',
    concept.maitrise || '',
    concept.excellence || ''
  ]);

  const theme = "IC-4 Rang B - Expertise qualité et sécurité (22 concepts)";

  console.log(`✅ IC-4 Rang B traité: ${lignesEnrichies.length} concepts experts`);

  return {
    lignesEnrichies,
    colonnesUtiles: colonnesUtiles.map(col => ({
      key: col.nom.toLowerCase(),
      label: col.nom,
      obligatoire: true,
      description: col.description || col.nom
    })),
    theme,
    isRangB: true
  };
};