
// Données spécifiques pour l'item IC-2 : Valeurs professionnelles
// RANG A : 7 connaissances attendues exactement
export const conceptsRangAIC2 = [
  {
    concept: "Professionnels de santé et autres acteurs",
    definition: "Ensemble des professionnels règlementés (médecins, pharmaciens, infirmiers, etc.) et autres acteurs indispensables du système de santé",
    exemple: "Médecins, chirurgiens-dentistes, sages-femmes, pharmaciens, infirmiers, masseurs-kinésithérapeutes, pédicures-podologues",
    piege: "Ne pas confondre professionnels de santé règlementés et autres acteurs de santé",
    mnemo: "PROF-SANTÉ = Professionnels + Règlementés + Ordres + Formation + Statuts",
    subtilite: "Chaque profession a son statut spécifique et ses compétences définies",
    application: "Collaboration interprofessionnelle organisée dans les établissements de santé",
    vigilance: "Respecter les compétences spécifiques de chaque profession"
  },
  {
    concept: "Définition de la pratique médicale",
    definition: "Activité à la fois technique et relationnelle répondant aux besoins de santé individuels et de population",
    exemple: "Diagnostic, traitement, prévention, éducation thérapeutique du patient",
    piege: "Réduire la médecine à son aspect purement technique sans dimension relationnelle",
    mnemo: "MÉDECINE = Technique + Relationnel + Individuel + Population",
    subtilite: "Double dimension : compétences techniques spécifiques ET relation humaine",
    application: "Prise en charge globale intégrant technique et humanisme",
    vigilance: "Équilibrer efficacité technique et qualité relationnelle"
  },
  {
    concept: "Éthique médicale",
    definition: "Réflexion sur l'action médicale : comment agir au mieux dans une situation donnée, indissociable de la technique",
    exemple: "Réflexion éthique face à un conflit entre autonomie du patient et bienfaisance",
    piege: "Opposer éthique et technique - elles sont indissociables",
    mnemo: "ÉTHIQUE = Réflexion + Action + Situation + Indissociable technique",
    subtilite: "L'éthique n'est pas externe à la médecine, elle en fait partie intégrante",
    application: "Questionnement éthique systématique dans chaque décision médicale",
    vigilance: "Ne pas dissocier réflexion éthique et pratique technique"
  },
  {
    concept: "Valeurs et normes",
    definition: "Valeurs = ce qui est digne d'estime, souhaitable, recommandé. Normes = principes et règles concrètes traduisant ces valeurs",
    exemple: "Valeur : respect de la personne → Norme : obligation d'information du patient",
    piege: "Confondre valeurs abstraites et normes concrètes d'application",
    mnemo: "VALEURS-NORMES = Estime + Souhaitable → Principes + Règles",
    subtilite: "Les valeurs cardinales : responsabilité, dévouement, compassion, respect autonomie",
    application: "Traduction des valeurs en obligations déontologiques précises",
    vigilance: "Articuler valeurs personnelles et normes professionnelles"
  },
  {
    concept: "Régulation étatique de la médecine",
    definition: "Contrôle croissant de l'État : régulation dépenses, remise en question autonomie, évaluation qualité, efficience",
    exemple: "Contrôle des prescriptions, évaluation des pratiques, régulation tarifaire",
    piege: "Ignorer l'évolution vers plus de régulation et de contrôle étatique",
    mnemo: "RÉGULATION = Dépenses + Autonomie + Qualité + Efficience + Contrôle",
    subtilite: "Équilibre difficile entre intérêt individuel et collectif",
    application: "Exercice médical dans un cadre réglementaire de plus en plus strict",
    vigilance: "Concilier liberté médicale et contraintes de santé publique"
  },
  {
    concept: "Médecine fondée sur les preuves (EBM)",
    definition: "Evidence Based Medicine = preuves scientifiques actuelles + expérience personnelle + préférences patient + compétences pratiques",
    exemple: "Décision thérapeutique intégrant études cliniques + expérience + choix patient",
    piege: "Réduire l'EBM aux seules données scientifiques sans dimension humaine",
    mnemo: "EBM = Evidence + Expérience + Écoute + Efficience patient",
    subtilite: "Médecine de responsabilité incluant l'expérience quotidienne de la maladie",
    application: "Approche décisionnelle structurée et personnalisée",
    vigilance: "Intégrer harmonieusement science et préférences du patient"
  },
  {
    concept: "Déontologie médicale",
    definition: "Ensemble des règles et devoirs régissant la profession médicale, distinct de l'éthique (réflexion sur l'action)",
    exemple: "Code de déontologie médicale : articles précis sur devoirs et obligations",
    piege: "Confondre déontologie (règles profession) et éthique (réflexion action)",
    mnemo: "DÉONTO = Devoirs + Éthique distincte + ONM + Textes + Obligations",
    subtilite: "Code rédigé par l'ONM, soumis au Conseil d'État, voté par le Parlement",
    application: "Respect strict des articles du code dans la pratique quotidienne",
    vigilance: "Distinguer obligations déontologiques et réflexion éthique personnelle"
  }
];

// RANG B : 2 connaissances attendues exactement
export const conceptsRangBIC2 = [
  {
    concept: "Organisation de l'exercice professionnel",
    definition: "Exercice de plus en plus codifié et régulé, collaboration plus organisée au sein des établissements",
    exemple: "Maisons de santé pluridisciplinaires, protocoles de collaboration, délégation d'actes",
    piege: "Croire que l'exercice médical reste totalement libre et non organisé",
    mnemo: "ORGANISATION = Codifié + Régulé + Collaboration + Établissements",
    subtilite: "Évolution vers plus de structuration et de coordination",
    application: "Pratique en équipe pluridisciplinaire coordonnée",
    vigilance: "S'adapter aux nouvelles formes d'organisation professionnelle"
  },
  {
    concept: "Ordres professionnels",
    definition: "Instances de régulation des professions règlementées veillant au maintien des principes de moralité, probité et compétence",
    exemple: "Ordre des médecins, pharmaciens, infirmiers : inscription, discipline, surveillance déontologie",
    piege: "Méconnaître le rôle et l'organisation des ordres professionnels",
    mnemo: "ORDRES = Régulation + Moralité + Probité + Compétence + Surveillance",
    subtilite: "3 niveaux : départemental, régional, national avec compétences spécifiques",
    application: "Respect des obligations ordinales et procédures disciplinaires",
    vigilance: "Connaître ses droits et devoirs vis-à-vis de l'ordre professionnel"
  }
];

export const colonnesConfigIC2 = [
  { nom: 'Concept Professionnel', couleur: 'bg-blue-700', couleurCellule: 'bg-blue-50', couleurTexte: 'text-blue-900 font-bold' },
  { nom: 'Définition Précise', couleur: 'bg-green-700', couleurCellule: 'bg-green-50', couleurTexte: 'text-green-800' },
  { nom: 'Exemple Concret', couleur: 'bg-purple-600', couleurCellule: 'bg-purple-50', couleurTexte: 'text-purple-800' },
  { nom: 'Piège à Éviter', couleur: 'bg-red-600', couleurCellule: 'bg-red-50', couleurTexte: 'text-red-800 font-semibold' },
  { nom: 'Moyen Mnémotechnique', couleur: 'bg-yellow-600', couleurCellule: 'bg-yellow-50', couleurTexte: 'text-yellow-800 italic' },
  { nom: 'Subtilité Importante', couleur: 'bg-indigo-600', couleurCellule: 'bg-indigo-50', couleurTexte: 'text-indigo-800 font-medium' },
  { nom: 'Application Pratique', couleur: 'bg-teal-600', couleurCellule: 'bg-teal-50', couleurTexte: 'text-teal-800' },
  { nom: 'Point de Vigilance', couleur: 'bg-orange-600', couleurCellule: 'bg-orange-50', couleurTexte: 'text-orange-800 font-medium' }
];
