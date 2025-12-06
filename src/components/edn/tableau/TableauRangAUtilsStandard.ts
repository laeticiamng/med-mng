
// Utilitaires pour traiter les données JSON standard stockées en base
export interface StandardSection {
  title: string;
  content: string;
  keywords?: string[];
}

export interface StandardTableauData {
  title: string;
  sections: StandardSection[];
}

export const processStandardTableauData = (data: any, isRangB: boolean = false) => {
  console.log('🔍 Processing standard tableau data:', data);
  
  // Extraire les données selon le format JSON de la base
  const tableauData = isRangB ? data.tableau_rang_b : data.tableau_rang_a;
  
  if (!tableauData) {
    console.log('❌ No tableau data found');
    return null;
  }

  // Si c'est déjà un objet, l'utiliser directement
  const parsedData: StandardTableauData = typeof tableauData === 'string' 
    ? JSON.parse(tableauData) 
    : tableauData;

  console.log('📊 Parsed tableau data:', parsedData);

  // Générer les lignes pour le tableau
  const lignes: string[][] = [];
  
  if (parsedData.sections && Array.isArray(parsedData.sections)) {
    parsedData.sections.forEach((section, index) => {
      const ligne = [
        section.title || `Section ${index + 1}`,
        section.content || '',
        section.keywords ? section.keywords.join(', ') : '',
        `Point clé ${index + 1}`,
        'À retenir',
        'Attention particulière',
        'Application pratique',
        'Vigilance requise'
      ];
      lignes.push(ligne);
    });
  }

  // Configuration des colonnes standard
  const colonnes = [
    { nom: 'Thème', couleur: 'bg-primary', couleurCellule: 'bg-primary/10 border-primary/30', couleurTexte: 'text-primary' },
    { nom: 'Contenu', couleur: 'bg-success', couleurCellule: 'bg-success/10 border-success/30', couleurTexte: 'text-success' },
    { nom: 'Mots-clés', couleur: 'bg-warning', couleurCellule: 'bg-warning/10 border-warning/30', couleurTexte: 'text-warning' },
    { nom: 'Point clé', couleur: 'bg-accent', couleurCellule: 'bg-accent/10 border-accent/30', couleurTexte: 'text-accent-foreground' },
    { nom: 'À retenir', couleur: 'bg-secondary', couleurCellule: 'bg-secondary/50 border-secondary/30', couleurTexte: 'text-secondary-foreground' },
    { nom: 'Attention', couleur: 'bg-destructive', couleurCellule: 'bg-destructive/10 border-destructive/30', couleurTexte: 'text-destructive' },
    { nom: 'Application', couleur: 'bg-muted', couleurCellule: 'bg-muted/50 border-muted/30', couleurTexte: 'text-muted-foreground' },
    { nom: 'Vigilance', couleur: 'bg-muted-foreground', couleurCellule: 'bg-muted/50 border-muted-foreground/30', couleurTexte: 'text-foreground' }
  ];

  return {
    lignesEnrichies: lignes,
    colonnesUtiles: colonnes,
    theme: parsedData.title || `${isRangB ? 'Rang B' : 'Rang A'} - Connaissances`,
    isRangB,
    isComplete: lignes.length > 0
  };
};
