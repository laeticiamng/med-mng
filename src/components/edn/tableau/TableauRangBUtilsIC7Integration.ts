
interface IC7ConceptB {
  concept?: string;
  definition?: string;
  exemple?: string;
  piege?: string;
  mnemo?: string;
  subtilite?: string;
  application?: string;
  vigilance?: string;
}

interface IC7SectionB {
  concepts?: IC7ConceptB[];
}

interface IC7TableauDataB {
  tableau_rang_b?: {
    sections?: IC7SectionB[];
  };
  sections?: IC7SectionB[];
}

interface ColonneUtile {
  nom: string;
  description: string;
}

// Utilitaires pour l'affichage du Tableau Rang B IC-7
export const processTableauRangBIC7 = (data: IC7TableauDataB) => {
  // Extraire les données des concepts experts
  const tableauData = data.tableau_rang_b || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles: ColonneUtile[] = [
    { nom: 'Concept expert', description: 'Droits appliqués' },
    { nom: 'Analyse juridique', description: 'Cadre légal approfondi' },
    { nom: 'Cas complexe', description: 'Situation experte' },
    { nom: 'Écueil expert', description: 'Piège niveau avancé' },
    { nom: 'Technique avancée', description: 'Méthode spécialisée' },
    { nom: 'Distinction fine', description: 'Nuances juridiques' },
    { nom: 'Maîtrise', description: 'Application experte' },
    { nom: 'Excellence', description: 'Médiation parfaite' }
  ];

  const lignesEnrichies = concepts.map((concept: IC7ConceptB) => [
    concept.concept || '',
    concept.definition || '',
    concept.exemple || '',
    concept.piege || '',
    concept.mnemo || '',
    concept.subtilite || '',
    concept.application || '',
    concept.vigilance || ''
  ]);

  const theme = "IC-7 Rang B - Expertise application des droits";

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: true,
    expertiseLevel: 'advanced'
  };
};
