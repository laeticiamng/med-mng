
import { TableauData, EdnItemData } from '@/types/edn';

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

export const processStandardTableauData = (data: EdnItemData, isRangB: boolean = false) => {
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
    { nom: 'Thème', couleur: 'bg-blue-600', couleurCellule: 'bg-blue-50 border-blue-300', couleurTexte: 'text-blue-900' },
    { nom: 'Contenu', couleur: 'bg-emerald-600', couleurCellule: 'bg-emerald-50 border-emerald-300', couleurTexte: 'text-emerald-900' },
    { nom: 'Mots-clés', couleur: 'bg-amber-600', couleurCellule: 'bg-amber-50 border-amber-300', couleurTexte: 'text-amber-900' },
    { nom: 'Point clé', couleur: 'bg-purple-600', couleurCellule: 'bg-purple-50 border-purple-300', couleurTexte: 'text-purple-900' },
    { nom: 'À retenir', couleur: 'bg-indigo-600', couleurCellule: 'bg-indigo-50 border-indigo-300', couleurTexte: 'text-indigo-900' },
    { nom: 'Attention', couleur: 'bg-red-600', couleurCellule: 'bg-red-50 border-red-300', couleurTexte: 'text-red-900' },
    { nom: 'Application', couleur: 'bg-teal-600', couleurCellule: 'bg-teal-50 border-teal-300', couleurTexte: 'text-teal-900' },
    { nom: 'Vigilance', couleur: 'bg-slate-600', couleurCellule: 'bg-slate-50 border-slate-300', couleurTexte: 'text-slate-900' }
  ];

  return {
    lignesEnrichies: lignes,
    colonnesUtiles: colonnes,
    theme: parsedData.title || `${isRangB ? 'Rang B' : 'Rang A'} - Connaissances`,
    isRangB,
    isComplete: lignes.length > 0
  };
};
