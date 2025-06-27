
import { generateLignesRangAIntelligentIC2, determinerColonnesUtilesIC2, enrichirDonneesIC2 } from './TableauRangAUtilsIC2';

// Fonction pour détecter si c'est l'item IC-2
export const isIC2Item = (data: any): boolean => {
  if (!data || !data.theme) return false;
  
  const theme = data.theme.toLowerCase();
  return theme.includes('valeurs') && theme.includes('professionnelles') && 
         (theme.includes('médecin') || theme.includes('professions') || theme.includes('santé'));
};

// Fonction principale pour traiter les données IC-2
export function processTableauRangAIC2(data: any) {
  console.log('Processing IC-2 data:', data);
  
  // Enrichir les données avec le contenu pédagogique
  const donneesEnrichies = enrichirDonneesIC2(data);
  
  // Générer les lignes enrichies spécifiquement pour IC-2
  const lignesEnrichies = generateLignesRangAIntelligentIC2(donneesEnrichies);
  
  // Déterminer les colonnes utiles
  const colonnesUtiles = determinerColonnesUtilesIC2(lignesEnrichies);
  
  return {
    lignesEnrichies,
    colonnesUtiles,
    theme: donneesEnrichies.theme
  };
}
