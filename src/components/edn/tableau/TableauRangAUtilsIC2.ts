
import { conceptsRangAIC2, conceptsRangBIC2, colonnesConfigIC2 } from './TableauRangADataIC2';
import { ColumnConfig, TableauData, TableauGenerationResult } from '@/types/edn';
import { adaptLegacyColumnConfig } from '@/utils/tableauConfigAdapter';

export const generateLignesRangAIntelligentIC2 = (data: TableauData): string[][] => {
  const lignes: string[][] = [];
  
  // Utiliser uniquement les 7 concepts Rang A définis selon E-LiSA
  conceptsRangAIC2.forEach((concept, index) => {
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

  // IC-2 Rang A processing optimized
  return lignes;
};

export const generateLignesRangBIntelligentIC2 = (data: TableauData): string[][] => {
  // IC-2 Rang B processing optimized
  
  const lignes: string[][] = [];
  
  // Utiliser uniquement les 2 concepts Rang B définis selon E-LiSA
  conceptsRangBIC2.forEach((concept, index) => {
    // Processing concept for IC-2 Rang B
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

  // IC-2 Rang B generation completed
  return lignes;
};

export const determinerColonnesUtilesIC2 = (lignes: string[][]): ColumnConfig[] => {
  // IC-2 column configuration optimized
  
  // Toutes les colonnes sont pertinentes selon le format E-LiSA
  return adaptLegacyColumnConfig(colonnesConfigIC2);
};

// Fonction pour enrichir les données IC-2 selon E-LiSA officielle
export const enrichirDonneesIC2 = (data: TableauData): TableauGenerationResult => {
  return {
    lignes: generateLignesRangAIntelligentIC2(data),
    colonnes: adaptLegacyColumnConfig(colonnesConfigIC2),
    metadata: {
      totalConcepts: 9,
      rangACount: 7,
      rangBCount: 2,
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
    }
  };
};
