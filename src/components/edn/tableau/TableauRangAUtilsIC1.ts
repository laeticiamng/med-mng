
import { conceptsRangAIC1, colonnesConfigIC1 } from './TableauRangADataIC1';

interface ColonneConfig {
  nom: string;
  couleur: string;
  couleurCellule: string;
  couleurTexte: string;
}

// Fonction pour déterminer les colonnes utiles selon le contenu IC-1
export function determinerColonnesUtilesIC1(_lignes: string[][]): ColonneConfig[] {
  // Utiliser la configuration spécifique à IC-1
  return colonnesConfigIC1;
}

// Fonction pour générer les lignes enrichies spécifiquement pour IC-1
export function generateLignesRangAIC1(_data: unknown): string[][] {
  const lignes: string[][] = [];
  
  // Utiliser uniquement les 15 concepts Rang A définis selon E-LiSA
  conceptsRangAIC1.forEach(concept => {
    const ligne = [
      concept.concept,
      concept.definition,
      concept.exemple,
      concept.piege,
      concept.mnemo,
      concept.subtilite,
      concept.application,
      concept.vigilance
    ];
    lignes.push(ligne);
  });

  return lignes;
}
