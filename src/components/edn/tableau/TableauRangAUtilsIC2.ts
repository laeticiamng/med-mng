import { conceptsRangAIC2, conceptsRangBIC2, colonnesConfigIC2 } from './TableauRangADataIC2';

export const generateLignesRangAIntelligentIC2 = (data: any): string[][] => {
  const lignes: string[][] = [];
  
  conceptsRangAIC2.forEach((concept) => {
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
};

export const generateLignesRangBIntelligentIC2 = (data: any): string[][] => {
  const lignes: string[][] = [];
  
  conceptsRangBIC2.forEach((concept) => {
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
};

export const determinerColonnesUtilesIC2 = (lignes: string[][]): any[] => {
  return colonnesConfigIC2;
};

// Fonction pour enrichir les données IC-2 selon E-LiSA officielle
export const enrichirDonneesIC2 = (data: any) => {
  return {
    ...data,
    theme: "IC-2 : Les valeurs professionnelles du médecin et des autres professions de santé",
    objectifs: [
      "Maîtriser les 7 connaissances fondamentales du rang A selon E-LiSA",
      "Approfondir les 2 connaissances spécialisées du rang B selon E-LiSA", 
      "Intégrer valeurs et normes dans la pratique professionnelle",
      "Comprendre l'organisation et la régulation des professions de santé"
    ],
    competences: [
      "Identifier tous les professionnels de santé et leurs rôles spécifiques",
      "Définir précisément pratique médicale et éthique professionnelle",
      "Distinguer valeurs, normes et déontologie dans l'exercice",
      "Maîtriser l'organisation statutaire et ordinale des professions"
    ]
  };
};
