
import { conceptsRangAIC2, colonnesConfigIC2 } from './TableauRangADataIC2';

export const generateLignesRangAIntelligentIC2 = (data: any): string[][] => {
  console.log('Génération intelligente des lignes IC-2 avec concepts professionnels optimisés');
  
  const lignes: string[][] = [];
  
  // Utiliser les concepts spécifiques IC-2 optimisés
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

  console.log(`IC-2: Généré ${lignes.length} lignes optimisées pour les valeurs professionnelles`);
  return lignes;
};

export const determinerColonnesUtilesIC2 = (lignes: string[][]): any[] => {
  console.log('Détermination des colonnes utiles spécifiques IC-2');
  
  // Pour IC-2, toutes les colonnes sont pertinentes car elles couvrent
  // les aspects déontologiques, éthiques et réglementaires essentiels
  return colonnesConfigIC2;
};

// Fonction pour enrichir les données IC-2 avec contenu pédagogique
export const enrichirDonneesIC2 = (data: any) => {
  return {
    ...data,
    theme: "Valeurs professionnelles et déontologie médicale - Concepts fondamentaux",
    objectifs: [
      "Maîtriser les principes déontologiques fondamentaux",
      "Comprendre l'organisation des ordres professionnels", 
      "Intégrer l'éthique médicale dans la pratique",
      "Connaître les modalités de régulation professionnelle"
    ],
    competences: [
      "Appliquer les règles déontologiques au quotidien",
      "Collaborer efficacement avec les autres professions de santé",
      "Résoudre les conflits éthiques professionnels",
      "Respecter les obligations de formation continue"
    ]
  };
};
