
import { 
  generateLignesRangAIntelligentIC2, 
  generateLignesRangBIntelligentIC2,
  determinerColonnesUtilesIC2, 
  enrichirDonneesIC2 
} from './TableauRangAUtilsIC2';
interface IC2ItemData {
  item_code?: string;
  title?: string;
  theme?: string;
  [key: string]: unknown;
}

// Fonction pour détecter si c'est l'item IC-2 selon E-LiSA (et pas IC-20, IC-21, etc.)
export const isIC2Item = (data: IC2ItemData | null): boolean => {
  if (!data) return false;
  
  // Vérifier le code d'item directement
  if (data.item_code === 'IC-2') return true;
  
  // Vérifier le titre spécifique
  if (data.title && data.title.toLowerCase().includes('valeurs professionnelles')) return true;
  
  // Vérifier le thème avec regex pour éviter les faux positifs
  if (data.theme) {
    const theme = data.theme.toLowerCase();
    const hasValeursProf = (theme.includes('valeurs') && theme.includes('professionnelles'));
    const codeMatch = /\bic-2\b/i.test(theme);
    return hasValeursProf || codeMatch;
  }
  
  return false;
};

// Fonction pour détecter si c'est le rang B selon E-LiSA
export const isRangBIC2 = (data: IC2ItemData | null): boolean => {
  if (!data) return false;
  
  // Forcer le rang B pour IC-2 quand le thème contient "Rang B"
  const theme = (data.theme || '').toLowerCase();
  const isExplicitRangB = theme.includes('rang b') || theme.includes('approfondissement');
  
  return isExplicitRangB;
};

// Fonction principale pour traiter les données IC-2 selon E-LiSA officielle
export function processTableauRangAIC2(data: IC2ItemData) {
  const isRangB = isRangBIC2(data);
  
  // Enrichir les données selon E-LiSA
  const donneesEnrichies = enrichirDonneesIC2(data);
  
  // Générer les lignes selon le rang E-LiSA
  const lignesEnrichies = isRangB 
    ? generateLignesRangBIntelligentIC2(donneesEnrichies)
    : generateLignesRangAIntelligentIC2(donneesEnrichies);
  
  // Déterminer les colonnes selon E-LiSA
  const colonnesUtiles = determinerColonnesUtilesIC2(lignesEnrichies);
  
  const expectedCount = isRangB ? 2 : 7; // IC-2 a 7 compétences Rang A et 2 Rang B selon E-LiSA
  const actualCount = lignesEnrichies.length;
  
  return {
    lignesEnrichies,
    colonnesUtiles,
    theme: `${donneesEnrichies.theme} - ${isRangB ? 'Rang B (2 connaissances E-LiSA)' : 'Rang A (7 connaissances E-LiSA)'}`,
    isRangB,
    isComplete: actualCount === expectedCount
  };
}
