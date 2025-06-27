
import { conceptsRangAIC4 } from './TableauRangADataIC4';
import { generateLignesRangAIntelligentIC4, determinerColonnesUtilesIC4 } from './TableauRangAUtilsIC4';

// Fonction pour détecter si c'est l'item IC-4 et utiliser les données spécifiques
export const isIC4Item = (data: any): boolean => {
  if (!data || !data.theme) return false;
  
  const theme = data.theme.toLowerCase();
  return theme.includes('qualité') && theme.includes('sécurité') && theme.includes('soins');
};

// Fonction pour générer les lignes IC-4 optimisées
export const generateLignesRangAWithIC4 = (data: any): string[][] => {
  if (isIC4Item(data)) {
    console.log('Utilisation des données spécifiques IC-4');
    return generateLignesRangAIntelligentIC4(data);
  }
  
  // Retombe sur la génération standard pour les autres items
  return data.lignes || [];
};

// Fonction pour déterminer les colonnes IC-4 optimisées
export const determinerColonnesUtilesWithIC4 = (lignes: string[][], data: any): any[] => {
  if (isIC4Item(data)) {
    console.log('Utilisation des colonnes spécifiques IC-4');
    return determinerColonnesUtilesIC4(lignes);
  }
  
  // Retombe sur la détermination standard pour les autres items
  return [
    { nom: 'Concept', couleur: 'bg-blue-600', couleurCellule: 'bg-blue-50', couleurTexte: 'text-blue-800' },
    { nom: 'Définition', couleur: 'bg-green-600', couleurCellule: 'bg-green-50', couleurTexte: 'text-green-800' }
  ];
};
