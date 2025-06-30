
import { 
  generateLignesRangAIntelligentIC2, 
  generateLignesRangBIntelligentIC2,
  determinerColonnesUtilesIC2, 
  enrichirDonneesIC2 
} from './TableauRangAUtilsIC2';

// Fonction pour détecter si c'est l'item IC-2 selon E-LiSA
export const isIC2Item = (data: any): boolean => {
  if (!data) return false;
  
  // Vérifier le code d'item directement
  if (data.item_code === 'IC-2') return true;
  
  // Vérifier le titre
  if (data.title && data.title.toLowerCase().includes('valeurs professionnelles')) return true;
  
  // Vérifier le thème
  if (data.theme) {
    const theme = data.theme.toLowerCase();
    return (theme.includes('valeurs') && theme.includes('professionnelles')) || 
           (theme.includes('ic-2') || theme.includes('ic2')) ||
           (theme.includes('médecin') && theme.includes('professions') && theme.includes('santé'));
  }
  
  return false;
};

// Fonction pour détecter si c'est le rang B selon E-LiSA
export const isRangBIC2 = (data: any): boolean => {
  if (!data) return false;
  const theme = (data.theme || '').toLowerCase();
  return theme.includes('rang b') || theme.includes('approfondissement') || 
         theme.includes('organisation') || theme.includes('ordres') ||
         theme.includes('statuts');
};

// Fonction principale pour traiter les données IC-2 selon E-LiSA officielle
export function processTableauRangAIC2(data: any) {
  console.log('🔍 Processing IC-2 selon fiche E-LiSA officielle:', data);
  
  const isRangB = isRangBIC2(data);
  console.log('📊 IC-2 - Est-ce Rang B ?', isRangB);
  
  // Enrichir les données selon E-LiSA
  const donneesEnrichies = enrichirDonneesIC2(data);
  console.log('📈 IC-2 - Données enrichies:', donneesEnrichies);
  
  // Générer les lignes selon le rang E-LiSA
  const lignesEnrichies = isRangB 
    ? generateLignesRangBIntelligentIC2(donneesEnrichies)
    : generateLignesRangAIntelligentIC2(donneesEnrichies);
  
  console.log('📋 IC-2 - Lignes générées:', lignesEnrichies.length);
  
  // Déterminer les colonnes selon E-LiSA
  const colonnesUtiles = determinerColonnesUtilesIC2(lignesEnrichies);
  
  const expectedCount = isRangB ? 2 : 7; // Correction : IC-2 a 7 compétences Rang A selon E-LiSA
  const actualCount = lignesEnrichies.length;
  
  console.log(`✅ IC-2 E-LiSA ${isRangB ? 'Rang B' : 'Rang A'}: ${actualCount}/${expectedCount} connaissances`);
  
  return {
    lignesEnrichies,
    colonnesUtiles,
    theme: `${donneesEnrichies.theme} - ${isRangB ? 'Rang B (2 connaissances E-LiSA)' : 'Rang A (7 connaissances E-LiSA)'}`,
    isRangB,
    isComplete: actualCount === expectedCount
  };
}
