
// Connaissances attendues selon E-LiSA officiel
export const EXPECTED_IC2_RANG_A = [
  'Identifier les professionnels, compétences et ressources liés à un rôle particulier dans une organisation de santé',
  'Connaître la définition de la pratique médicale et connaître la signification de l\'éthique',
  'Connaître les définitions de normes et de valeurs professionnelles',
  'Connaître l\'organisation sociale et politique de la profession médicale et sa régulation étatique',
  'Connaître les principes de la médecine fondée sur les preuves et de la médecine basée sur la responsabilité et l\'expérience du malade',
  'Connaître les principes de déontologie médicale, connaître la notion de conflit de valeurs et de conflit d\'intérêts'
];

export const EXPECTED_IC2_RANG_B = [
  'Connaître l\'organisation de l\'exercice des professionnels de santé en France et leurs statuts',
  'Connaître le rôle des ordres professionnels',
  'Connaître les différents acteurs de la santé et leurs interactions'
];

// Mapping des mots-clés pour la détection des concepts
export const KEYWORD_MAP: { [key: string]: string[] } = {
  'Identifier les professionnels': ['professionnels', 'compétences', 'ressources', 'organisation', 'santé', 'acteurs'],
  'définition de la pratique médicale': ['pratique médicale', 'éthique', 'définition', 'médecine'],
  'normes et de valeurs professionnelles': ['normes', 'valeurs', 'professionnelles', 'déontologie'],
  'organisation sociale et politique': ['organisation', 'politique', 'régulation', 'étatique', 'profession'],
  'médecine fondée sur les preuves': ['evidence', 'preuves', 'ebm', 'scientifique', 'responsabilité'],
  'déontologie médicale': ['déontologie', 'conflit', 'valeurs', 'intérêts', 'code'],
  'exercice des professionnels': ['exercice', 'statuts', 'professionnels', 'france'],
  'ordres professionnels': ['ordres', 'professionnels', 'régulation', 'cnom'],
  'acteurs de la santé': ['acteurs', 'santé', 'interactions', 'collaboration']
};
