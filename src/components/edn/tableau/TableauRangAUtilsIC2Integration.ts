
import { 
  generateLignesRangAIntelligentIC2, 
  generateLignesRangBIntelligentIC2,
  determinerColonnesUtilesIC2, 
  enrichirDonneesIC2 
} from './TableauRangAUtilsIC2';

// Fonction pour détecter si c'est l'item IC-2
export const isIC2Item = (data: any): boolean => {
  if (!data || !data.theme) return false;
  
  const theme = data.theme.toLowerCase();
  return theme.includes('valeurs') && theme.includes('professionnelles') && 
         (theme.includes('médecin') || theme.includes('professions') || theme.includes('santé'));
};

// Fonction pour détecter si c'est le rang B
export const isRangBIC2 = (data: any): boolean => {
  if (!data) return false;
  const theme = (data.theme || '').toLowerCase();
  return theme.includes('rang b') || theme.includes('approfondissement') || 
         theme.includes('organisation') || theme.includes('ordres');
};

// Fonction principale pour traiter les données IC-2
export function processTableauRangAIC2(data: any) {
  console.log('Processing IC-2 data:', data);
  
  const isRangB = isRangBIC2(data);
  
  // Enrichir les données avec le contenu pédagogique
  const donneesEnrichies = enrichirDonneesIC2(data);
  
  // Générer les lignes selon le rang
  const lignesEnrichies = isRangB 
    ? generateLignesRangBIntelligentIC2(donneesEnrichies)
    : generateLignesRangAIntelligentIC2(donneesEnrichies);
  
  // Déterminer les colonnes utiles
  const colonnesUtiles = determinerColonnesUtilesIC2(lignesEnrichies);
  
  const expectedCount = isRangB ? 2 : 7;
  const actualCount = lignesEnrichies.length;
  
  console.log(`IC-2 ${isRangB ? 'Rang B' : 'Rang A'}: ${actualCount}/${expectedCount} connaissances`);
  
  return {
    lignesEnrichies,
    colonnesUtiles,
    theme: `${donneesEnrichies.theme} - ${isRangB ? 'Rang B (2 connaissances)' : 'Rang A (7 connaissances)'}`,
    isRangB,
    isComplete: actualCount === expectedCount
  };
}
