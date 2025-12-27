
// Utilitaires pour l'affichage du Tableau Rang A IC-10
export const processTableauRangAIC10 = (data: any) => {
  console.log('🔍 Traitement IC-10 Rang A');
  
  // Extraire les données des concepts
  const tableauData = data.tableau_rang_a || data;
  const concepts = tableauData?.sections?.[0]?.concepts || [];
  
  const colonnesUtiles = [
    { nom: 'Concept', description: 'Approche transversale', couleur: 'bg-muted', couleurCellule: 'bg-muted/50', couleurTexte: 'text-muted-foreground' },
    { nom: 'Définition', description: 'Compréhension globale', couleur: 'bg-accent', couleurCellule: 'bg-accent/10', couleurTexte: 'text-accent-foreground' },
    { nom: 'Exemple', description: 'Application clinique', couleur: 'bg-primary', couleurCellule: 'bg-primary/10', couleurTexte: 'text-primary' },
    { nom: 'Piège', description: 'Réductionnisme', couleur: 'bg-destructive', couleurCellule: 'bg-destructive/10', couleurTexte: 'text-destructive' },
    { nom: 'Mnémo', description: 'Mémorisation', couleur: 'bg-warning', couleurCellule: 'bg-warning/10', couleurTexte: 'text-warning' },
    { nom: 'Subtilité', description: 'Nuances importantes', couleur: 'bg-secondary', couleurCellule: 'bg-secondary/10', couleurTexte: 'text-secondary-foreground' },
    { nom: 'Application', description: 'Mise en pratique', couleur: 'bg-success', couleurCellule: 'bg-success/10', couleurTexte: 'text-success' },
    { nom: 'Vigilance', description: 'Points d\'attention', couleur: 'bg-warning', couleurCellule: 'bg-warning/10', couleurTexte: 'text-warning' }
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

  const theme = "IC-10 Rang A - Approches transversales du corps";

  console.log(`✅ IC-10 Rang A traité: ${lignesEnrichies.length} concepts`);

  return {
    lignesEnrichies,
    colonnesUtiles,
    theme,
    isRangB: false
  };
};

// Fonction pour détecter si c'est l'item IC-10 (vérification exacte)
export const isIC10Item = (data: any): boolean => {
  if (!data) return false;
  
  // Vérification exacte du code
  if (data.item_code === 'IC-10') return true;
  
  // Vérifier le titre spécifique
  if (data.title?.includes('Approches transversales du corps')) return true;
  
  // Vérifier le thème avec regex pour correspondance exacte
  const theme = data.theme || '';
  return /\bIC-10\b/i.test(theme);
};
