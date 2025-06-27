
import { determinerColonnesUtilesIC1, generateLignesRangAIC1 } from './TableauRangAUtilsIC1';

// Fonction principale pour traiter les données IC-1
export function processTableauRangAIC1(data: any) {
  console.log('Processing IC-1 data:', data);
  
  // Générer les lignes enrichies spécifiquement pour IC-1
  const lignesEnrichies = generateLignesRangAIC1(data);
  
  // Déterminer les colonnes utiles
  const colonnesUtiles = determinerColonnesUtilesIC1(lignesEnrichies);
  
  return {
    lignesEnrichies,
    colonnesUtiles,
    theme: data?.theme || 'Relation médecin-malade - Concepts fondamentaux'
  };
}

// Fonction pour vérifier si c'est l'item IC-1
export function isIC1Item(data: any): boolean {
  if (!data) return false;
  
  const theme = data.theme?.toLowerCase() || '';
  const title = data.title?.toLowerCase() || '';
  
  return theme.includes('relation médecin-malade') || 
         theme.includes('relation medecin-malade') ||
         title.includes('relation médecin-malade') ||
         title.includes('relation medecin-malade');
}
