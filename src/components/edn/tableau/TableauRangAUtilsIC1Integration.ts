
import { determinerColonnesUtilesIC1, generateLignesRangAIC1 } from './TableauRangAUtilsIC1';

interface TableauDataIC1 {
  item_code?: string;
  theme?: string;
  title?: string;
}

interface ColonneConfig {
  nom: string;
  couleur: string;
  couleurCellule: string;
  couleurTexte: string;
}

interface ProcessedTableauResultIC1 {
  lignesEnrichies: string[][];
  colonnesUtiles: ColonneConfig[];
  theme: string;
  isComplete: boolean;
}

// Fonction principale pour traiter les données IC-1 selon E-LiSA officielle
export function processTableauRangAIC1(data: TableauDataIC1): ProcessedTableauResultIC1 {
  // Générer les lignes enrichies spécifiquement pour IC-1 (15 connaissances)
  const lignesEnrichies = generateLignesRangAIC1(data);
  
  // Déterminer les colonnes utiles
  const colonnesUtiles = determinerColonnesUtilesIC1(lignesEnrichies);
  
  const expectedCount = 15;
  const actualCount = lignesEnrichies.length;
  
  return {
    lignesEnrichies,
    colonnesUtiles,
    theme: "IC-1 : La relation médecin-malade - 15 connaissances E-LiSA",
    isComplete: actualCount === expectedCount
  };
}

// Fonction pour vérifier si c'est l'item IC-1 (et pas IC-10, IC-11, etc.)
export function isIC1Item(data: TableauDataIC1 | null): boolean {
  if (!data) return false;
  
  // Vérification exacte du code d'item
  if (data.item_code === 'IC-1') return true;
  
  const theme = data.theme?.toLowerCase() || '';
  const title = data.title?.toLowerCase() || '';
  
  // Vérifier le contenu sémantique spécifique à IC-1
  const isRelationMedecin = theme.includes('relation médecin-malade') || 
                            theme.includes('relation medecin-malade') ||
                            title.includes('relation médecin-malade') ||
                            title.includes('relation medecin-malade');
  
  // Vérifier le code avec regex pour éviter les faux positifs (IC-10, IC-11, etc.)
  const codeMatch = /\bic-1\b/i.test(theme) || /\bic-1\b/i.test(title);
  
  return isRelationMedecin || codeMatch;
}
