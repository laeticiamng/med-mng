
// Compétences attendues pour IC-1 selon le référentiel LiSA
export const EXPECTED_IC1_COMPETENCES = {
  rangA: [
    'Définition de la relation médecin-malade',
    'Déterminants de la relation',
    'Corrélats cliniques',
    'Approche centrée patient',
    'Représentation de la maladie',
    'Information au patient',
    'Ajustement au stress',
    'Mécanismes de défense',
    'Empathie clinique',
    'Alliance thérapeutique',
    'Processus de changement',
    'Entretien motivationnel',
    'Communication empathique',
    'Communication adaptée',
    'Annonce mauvaise nouvelle'
  ],
  rangB: [
    'Outils de communication',
    'Techniques d\'entretien',
    'Gestion des émotions',
    'Évaluation de la relation'
  ]
};

// Seuils d'évaluation pour IC-1
export const IC1_EVALUATION_THRESHOLDS = {
  minRangACompetences: 10, // Au moins 10/15 concepts attendus
  minRangBCompetences: 0,  // Rang B optionnel pour IC-1
  minMedicalContentScore: 0.75, // 75% du contenu médical requis
  minGlobalScore: 0.80 // 80% pour être considéré comme complet
};
