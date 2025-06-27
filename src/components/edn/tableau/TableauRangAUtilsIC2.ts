
import { conceptsRangAIC2, conceptsRangBIC2, colonnesConfigIC2 } from './TableauRangADataIC2';

export const generateLignesRangAIntelligentIC2 = (data: any): string[][] => {
  console.log('Génération IC-2 : 7 connaissances Rang A exactement');
  
  const lignes: string[][] = [];
  
  // Utiliser uniquement les 7 concepts Rang A attendus
  conceptsRangAIC2.forEach(concept => {
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

  console.log(`IC-2 Rang A: ${lignes.length} lignes générées (attendu: 7)`);
  return lignes;
};

export const generateLignesRangBIntelligentIC2 = (data: any): string[][] => {
  console.log('Génération IC-2 : 2 connaissances Rang B exactement');
  
  const lignes: string[][] = [];
  
  // Utiliser uniquement les 2 concepts Rang B attendus
  conceptsRangBIC2.forEach(concept => {
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

  console.log(`IC-2 Rang B: ${lignes.length} lignes générées (attendu: 2)`);
  return lignes;
};

export const determinerColonnesUtilesIC2 = (lignes: string[][]): any[] => {
  console.log('IC-2: Colonnes optimisées pour les 9 connaissances attendues');
  
  // Toutes les colonnes sont pertinentes pour ces concepts précis
  return colonnesConfigIC2;
};

// Fonction pour enrichir les données IC-2 avec contenu pédagogique ciblé
export const enrichirDonneesIC2 = (data: any) => {
  return {
    ...data,
    theme: "Valeurs professionnelles - 9 connaissances essentielles",
    objectifs: [
      "Maîtriser les 7 connaissances fondamentales du rang A",
      "Approfondir les 2 connaissances spécialisées du rang B",
      "Intégrer valeurs et normes dans la pratique",
      "Comprendre l'évolution de la régulation médicale"
    ],
    competences: [
      "Identifier les professionnels de santé et leurs rôles",
      "Définir précisément la pratique médicale",
      "Appliquer l'éthique médicale au quotidien",
      "Respecter valeurs et normes professionnelles"
    ]
  };
};
