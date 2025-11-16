
import { determinerColonnesUtilesIC1, generateLignesRangAIC1 } from './TableauRangAUtilsIC1';

// Fonction principale pour traiter les données IC-1 selon E-LiSA officielle
export function processTableauRangAIC1(data: any) {
  console.log('Processing IC-1 selon fiche E-LiSA officielle:', data);
  
  // Générer les lignes enrichies spécifiquement pour IC-1 (15 connaissances)
  const lignesEnrichies = generateLignesRangAIC1(data);
  
  // Déterminer les colonnes utiles
  const colonnesUtiles = determinerColonnesUtilesIC1(lignesEnrichies);
  
  const expectedCount = 15;
  const actualCount = lignesEnrichies.length;
  
  console.log(`IC-1 E-LiSA : ${actualCount}/${expectedCount} connaissances`);
  
  return {
    lignesEnrichies,
    colonnesUtiles,
    theme: "IC-1 : La relation médecin-malade - 15 connaissances E-LiSA",
    isComplete: actualCount === expectedCount
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
         title.includes('relation medecin-malade') ||
         theme.includes('ic-1') || theme.includes('ic1');
}
