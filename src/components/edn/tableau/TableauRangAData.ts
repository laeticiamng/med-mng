
export const conceptsRangA = [
  {
    concept: "Colloque Singulier",
    definition: "Relation exclusive médecin-patient caractérisée par la confidentialité, le respect mutuel et l'individualisation des soins",
    exemple: "Consultation privée où le médecin adapte son approche selon l'âge, la culture et les besoins spécifiques du patient",
    piege: "Ne pas confondre avec colloque dual - le singulier implique l'unicité de la relation thérapeutique",
    mnemo: "SINGULIER = 'Seul Individu Nécessite Générosité Unique Liaison Individualisée Empathique Respectueuse'",
    subtilite: "Le colloque reste singulier même en présence de la famille - c'est l'attention portée au patient qui compte",
    application: "Personnaliser chaque consultation selon les caractéristiques bio-psycho-sociales du patient",
    vigilance: "Maintenir la confidentialité absolue même avec les proches du patient"
  },
  {
    concept: "Personne de Confiance",
    definition: "Personne majeure désignée par écrit par le patient pour l'accompagner dans ses démarches et faire valoir sa volonté",
    exemple: "Patient hospitalisé qui désigne par écrit son conjoint comme personne de confiance pour les décisions médicales",
    piege: "Ne pas confondre avec le tuteur légal - la personne de confiance n'a pas de pouvoir décisionnel légal",
    mnemo: "PC = 'Personne Choisie' par le patient, 'Parole Compte' en cas d'inconscience",
    subtilite: "Son témoignage sur la volonté du patient prévaut sur tous les autres avis de l'entourage",
    application: "Solliciter systématiquement la désignation lors de toute hospitalisation ou consultation importante",
    vigilance: "Vérifier l'identité et la désignation écrite formelle avant toute consultation"
  },
  {
    concept: "Démarche Éthique Médicale",
    definition: "Processus de réflexion structuré pour résoudre les dilemmes moraux en médecine, intégrant principes éthiques et contexte clinique",
    exemple: "Face à un refus de transfusion chez un Témoin de Jéhovah : respecter l'autonomie tout en évaluant les alternatives thérapeutiques",
    piege: "Ne pas appliquer automatiquement les principes - chaque situation nécessite une analyse contextuelle",
    mnemo: "ÉTHIQUE = 'Examiner Toutes Hypothèses Intelligemment Questionner Utilement Équilibrer'",
    subtilite: "L'éthique médicale n'est pas que déontologique - elle intègre aussi l'éthique du care et de la vertu",
    application: "Utiliser la grille des 4 principes (autonomie, bienfaisance, non-malfaisance, justice) pour analyser chaque dilemme",
    vigilance: "Ne jamais imposer ses propres valeurs morales au patient"
  },
  {
    concept: "Organisation des Soins",
    definition: "Structuration coordonnée des ressources humaines, matérielles et organisationnelles pour optimiser la prise en charge des patients",
    exemple: "Mise en place d'un parcours de soins coordonné entre médecin traitant, spécialistes et hôpital pour un patient diabétique",
    piege: "Ne pas confondre efficience organisationnelle et qualité des soins - l'une ne garantit pas l'autre",
    mnemo: "ORGANISATION = 'Organisation Rationnelle Garantit Amélioration Noteworthy Individuelle Soins Appropriés Totalement Intégrés Optimisés Nécessaires'",
    subtilite: "L'organisation doit s'adapter au patient et non l'inverse - personnalisation dans la standardisation",
    application: "Coordonner les interventions multiprofessionnelles en maintenant la continuité des soins",
    vigilance: "Éviter la fragmentation des soins par excès de spécialisation"
  }
];

export const piegesSpecifiques = {
  'colloque singulier': 'Ne pas confondre avec colloque dual - le singulier implique l'unicité de la relation',
  'personne de confiance': 'Ne pas confondre avec tuteur légal - pas de pouvoir décisionnel légal',
  'démarche éthique': 'Ne pas appliquer automatiquement les principes - analyse contextuelle nécessaire',
  'organisation des soins': 'Ne pas confondre efficience organisationnelle et qualité des soins'
};

export const mnemosIntelligents = {
  'colloque singulier': 'SINGULIER = "Seul Individu Nécessite Générosité Unique Liaison Individualisée Empathique Respectueuse"',
  'personne de confiance': 'PC = "Personne Choisie" + "Parole Compte" en cas d\'inconscience',
  'démarche éthique': 'ÉTHIQUE = "Examiner Toutes Hypothèses Intelligemment Questionner Utilement Équilibrer"'
};

export const subtilitesReelles = {
  'colloque singulier': 'Reste singulier même en présence de la famille - c\'est l\'attention au patient qui compte',
  'personne de confiance': 'Son témoignage sur la volonté du patient prévaut sur tous les autres avis',
  'démarche éthique': 'N\'est pas que déontologique - intègre aussi éthique du care et de la vertu',
  'organisation des soins': 'Doit s\'adapter au patient et non l\'inverse - personnalisation dans la standardisation'
};

export const applicationsConcrates = {
  'colloque singulier': 'Personnaliser chaque consultation selon les caractéristiques bio-psycho-sociales',
  'personne de confiance': 'Solliciter systématiquement la désignation lors de toute hospitalisation importante',
  'démarche éthique': 'Utiliser la grille des 4 principes pour analyser chaque dilemme moral',
  'organisation des soins': 'Coordonner les interventions multiprofessionnelles en maintenant la continuité'
};

export const vigilancesSpecifiques = {
  'colloque singulier': 'Maintenir la confidentialité absolue même avec les proches du patient',
  'personne de confiance': 'Vérifier l\'identité et la désignation écrite formelle avant consultation',
  'démarche éthique': 'Ne jamais imposer ses propres valeurs morales au patient',
  'organisation des soins': 'Éviter la fragmentation des soins par excès de spécialisation'
};
