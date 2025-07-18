
import { COLONNES_CONFIG } from './TableauRangAConfig';
import { 
  conceptsRangA, 
  piegesSpecifiques, 
  mnemosIntelligents, 
  subtilitesReelles, 
  applicationsConcrates, 
  vigilancesSpecifiques 
} from './TableauRangAData';

// Fonction pour déterminer les colonnes utiles selon le contenu
export function determinerColonnesUtiles(lignes: string[][]): any[] {
  const colonnesUtiles: any[] = [];
  
  for (let colIndex = 0; colIndex < COLONNES_CONFIG.length; colIndex++) {
    const config = COLONNES_CONFIG[colIndex];
    
    // Toujours inclure les colonnes obligatoires
    if (config?.obligatoire) {
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
             !cellule.includes('à fournir') &&
             !cellule.includes('à retenir') &&
             !cellule.includes('à mémoriser') &&
             !cellule.includes('essentiel') &&
             cellule.length > 20; // Contenu substantiel
    });
    
    if (aContenuPertinent && config) {
      colonnesUtiles.push(config);
    }
  }
  
  return colonnesUtiles;
}

// Fonction pour générer les lignes enrichies de manière intelligente
export function generateLignesRangAIntelligent(data: any): string[][] {
  const lignesBase = data.lignes || [];
  
  // Générer les lignes à partir des concepts avec contenu intelligent
  const lignes: string[][] = [];
  
  conceptsRangA.forEach(concept => {
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
    
    // Ne garder que les cellules avec du contenu pertinent
    lignes.push(ligne);
  });

  // Compléter avec les données originales si pertinentes
  if (lignesBase.length > 0) {
    lignesBase.forEach((ligne: string[]) => {
      const ligneComplete = [
        ligne[0] || '',
        ligne[1] || '',
        ligne[2] || '',
        getPiegeSpecifique(ligne[0] || ''),
        getMnemoIntelligent(ligne[0] || ''),
        getSubtiliteReelle(ligne[0] || ''),
        getApplicationConcrete(ligne[0] || ''),
        getVigilanceSpecifique(ligne[0] || '')
      ];
      
      // Vérifier si la ligne apporte de la valeur
      const aContenuPertinent = ligneComplete.some((cellule, index) => {
        if (index < 2) return true; // Toujours garder concept et définition
        return cellule && cellule.length > 20 && !cellule.includes('à définir');
      });
      
      if (aContenuPertinent) {
        lignes.push(ligneComplete);
      }
    });
  }

  return lignes;
}

// Fonctions utilitaires intelligentes qui ne renvoient du contenu que s'il est pertinent
export function getPiegeSpecifique(concept: string): string {
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(piegesSpecifiques)) {
    if (key.includes(k)) return v;
  }
  return '';
}

export function getMnemoIntelligent(concept: string): string {
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(mnemosIntelligents)) {
    if (key.includes(k)) return v;
  }
  return '';
}

export function getSubtiliteReelle(concept: string): string {
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(subtilitesReelles)) {
    if (key.includes(k)) return v;
  }
  return '';
}

export function getApplicationConcrete(concept: string): string {
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(applicationsConcrates)) {
    if (key.includes(k)) return v;
  }
  return '';
}

export function getVigilanceSpecifique(concept: string): string {
  const key = concept.toLowerCase();
  for (const [k, v] of Object.entries(vigilancesSpecifiques)) {
    if (key.includes(k)) return v;
  }
  return '';
}
