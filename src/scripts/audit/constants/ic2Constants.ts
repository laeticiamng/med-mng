
// Connaissances attendues selon E-LiSA officiel - EXACTEMENT 9 Rang A + 2 Rang B
export const EXPECTED_IC2_RANG_A = [
  'Identifier les professionnels, compétences et ressources liés à un rôle particulier dans une organisation de santé',
  'Connaître la définition de la pratique médicale et connaître la signification de l\'éthique',
  'Connaître les définitions de normes et de valeurs professionnelles', 
  'Connaître l\'organisation sociale et politique de la profession médicale et sa régulation étatique',
  'Connaître les principes de la médecine fondée sur les preuves et de la médecine basée sur la responsabilité et l\'expérience du malade',
  'Connaître les principes de déontologie médicale, connaître la notion de conflit de valeurs et de conflit d\'intérêts',
  'Connaître le concept de médecine basée sur la responsabilité et l\'expérience du patient',
  'Connaître les interactions professionnelles et la collaboration interprofessionnelle',
  'Connaître les différents acteurs de la santé et leurs interactions spécifiques'
];

export const EXPECTED_IC2_RANG_B = [
  'Connaître l\'organisation de l\'exercice des professionnels de santé en France et leurs statuts',
  'Connaître le rôle des ordres professionnels et leur fonctionnement'
];

// Mapping des mots-clés pour la détection des concepts - VERSION ÉTENDUE
export const KEYWORD_MAP: { [key: string]: string[] } = {
  'Identifier les professionnels': ['professionnels', 'compétences', 'ressources', 'organisation', 'santé', 'acteurs', 'rôles', 'équipe'],
  'définition de la pratique médicale': ['pratique médicale', 'éthique', 'définition', 'médecine', 'soins', 'diagnostic'],
  'normes et de valeurs professionnelles': ['normes', 'valeurs', 'professionnelles', 'déontologie', 'principes', 'règles'],
  'organisation sociale et politique': ['organisation', 'politique', 'régulation', 'étatique', 'profession', 'contrôle'],
  'médecine fondée sur les preuves': ['evidence', 'preuves', 'ebm', 'scientifique', 'responsabilité', 'expérience'],
  'déontologie médicale': ['déontologie', 'conflit', 'valeurs', 'intérêts', 'code', 'éthique'],
  'médecine basée sur la responsabilité': ['responsabilité', 'patient', 'expérience', 'autonomie', 'décision'],
  'interactions professionnelles': ['interactions', 'collaboration', 'interprofessionnelle', 'équipe', 'coordination'],
  'exercice des professionnels': ['exercice', 'statuts', 'professionnels', 'france', 'organisation'],
  'ordres professionnels': ['ordres', 'professionnels', 'régulation', 'cnom', 'fonctionnement']
};
