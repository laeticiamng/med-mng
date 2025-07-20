
import { COLONNES_CONFIG } from './TableauRangAConfig';
import { conceptsRangAIC1, colonnesConfigIC1 } from './TableauRangADataIC1';

// Fonction pour déterminer les colonnes utiles selon le contenu IC-1
export function determinerColonnesUtilesIC1(lignes: string[][]): any[] {
  // Utiliser la configuration spécifique à IC-1
  return colonnesConfigIC1;
}

// Fonction pour générer les lignes enrichies spécifiquement pour IC-1
export function generateLignesRangAIC1(data: any): string[][] {
  console.log('IC-1 Génération : 15 connaissances selon E-LiSA exactement');
  
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

  console.log(`IC-1: ${lignes.length}/15 connaissances E-LiSA générées`);
  return lignes;
}
