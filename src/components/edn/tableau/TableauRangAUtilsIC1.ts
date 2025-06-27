
import { COLONNES_CONFIG } from './TableauRangAConfig';
import { 
  conceptsRangAIC1, 
  piegesSpecifiquesIC1, 
  mnemosIntellignetsIC1, 
  subtilitesReellesIC1, 
  applicationsConcratesIC1, 
  vigilancesSpecifiquesIC1 
} from './TableauRangADataIC1';

// Fonction pour déterminer les colonnes utiles selon le contenu
export function determinerColonnesUtilesIC1(lignes: string[][]): any[] {
  const colonnesUtiles = [];
  
  for (let colIndex = 0; colIndex < COLONNES_CONFIG.length; colIndex++) {
    const config = COLONNES_CONFIG[colIndex];
    
    // Toujours inclure les colonnes obligatoires
    if (config.obligatoire) {
      colonnesUtiles.push(config);
      continue;
    }
    
    // Pour les autres colonnes, vérifier s'il y a du contenu pertinent
    const aContenuPertinent = lignes.some(ligne => {
      const cellule = ligne[colIndex];
      return cellule && 
             cellule.trim() !== '' && 
             !cellule.includes('à définir') &&
             !cellule.includes('à compléter') &&
             cellule.length > 20;
    });
    
    if (aContenuPertinent) {
      colonnesUtiles.push(config);
    }
  }
  
  return colonnesUtiles;
}

// Fonction pour générer les lignes enrichies spécifiquement pour IC-1
export function generateLignesRangAIC1(data: any): string[][] {
  const lignes: string[][] = [];
  
  // Utiliser les concepts spécifiques à IC-1
  conceptsRangAIC1.forEach(concept => {
    const ligne = [
      concept.concept,
      concept.definition,
      concept.exemple || '',
      concept.piege || '',
      concept.mnemo || '',
      concept.subtilite || '',
      concept.application || '',
      concept.vigilance || ''
    ];
    
    lignes.push(ligne);
  });

  return lignes;
}

// Fonctions utilitaires spécifiques à IC-1
export function getPiegeSpecifiqueIC1(concept: string): string {
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(piegesSpecifiquesIC1)) {
    if (key.includes(k)) return v;
  }
  return '';
}

export function getMnemoIntelligentIC1(concept: string): string {
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(mnemosIntellignetsIC1)) {
    if (key.includes(k)) return v;
  }
  return '';
}

export function getSubtiliteReelleIC1(concept: string): string {
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(subtilitesReellesIC1)) {
    if (key.includes(k)) return v;
  }
  return '';
}

export function getApplicationConcreteIC1(concept: string): string {
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(applicationsConcratesIC1)) {
    if (key.includes(k)) return v;
  }
  return '';
}

export function getVigilanceSpecifiqueIC1(concept: string): string {
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(vigilancesSpecifiquesIC1)) {
    if (key.includes(k)) return v;
  }
  return '';
}
