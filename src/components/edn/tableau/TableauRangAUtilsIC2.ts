
import { conceptsRangAIC2, conceptsRangBIC2, colonnesConfigIC2 } from './TableauRangADataIC2';
import { ColumnConfig, TableauData, TableauGenerationResult } from '@/types/edn';
import { adaptLegacyColumnConfig } from '@/utils/tableauConfigAdapter';

export const generateLignesRangAIntelligentIC2 = (data: TableauData): string[][] => {
  console.log('🎯 IC-2 Génération Rang A : 7 connaissances selon E-LiSA exactement');
  
  const lignes: string[][] = [];
  
  // Utiliser uniquement les 7 concepts Rang A définis selon E-LiSA
  conceptsRangAIC2.forEach((concept, index) => {
    console.log(`📝 Ajout concept IC-2 Rang A ${index + 1}/7: ${concept.concept.substring(0, 50)}...`);
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

  console.log(`✅ IC-2 Rang A: ${lignes.length}/7 connaissances E-LiSA générées`);
  return lignes;
};

export const generateLignesRangBIntelligentIC2 = (data: TableauData): string[][] => {
  console.log('🎯 IC-2 Génération Rang B : 2 connaissances selon E-LiSA exactement');
  
  const lignes: string[][] = [];
  
  // Utiliser uniquement les 2 concepts Rang B définis selon E-LiSA
  conceptsRangBIC2.forEach((concept, index) => {
    console.log(`📝 Ajout concept IC-2 Rang B ${index + 1}/2: ${concept.concept.substring(0, 50)}...`);
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

  console.log(`✅ IC-2 Rang B: ${lignes.length}/2 connaissances E-LiSA générées`);
  return lignes;
};

export const determinerColonnesUtilesIC2 = (lignes: string[][]): ColumnConfig[] => {
  console.log('🏗️ IC-2: Configuration colonnes optimisée pour les connaissances E-LiSA');
  
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
