
export const conceptsRangA = [
  {
    concept: "Colloque Singulier",
    definition: "Relation exclusive médecin-patient caractérisée par la confidentialité, le respect mutuel et l'individualisation des soins selon les besoins spécifiques du patient",
    exemple: "Consultation privée où le médecin adapte son approche selon l'âge, la culture et les besoins spécifiques du patient, en maintenant la confidentialité absolue",
    piege: "Ne pas confondre avec colloque dual - le singulier implique l'unicité de la relation thérapeutique et l'attention exclusive portée au patient",
    mnemo: "SINGULIER = 'Seul Individu Nécessite Générosité Unique Liaison Individualisée Empathique Respectueuse'",
    subtilite: "Le colloque reste singulier même en présence de la famille - c'est l'attention portée au patient qui compte, pas le nombre de personnes présentes",
    application: "Personnaliser chaque consultation selon les caractéristiques bio-psycho-sociales du patient et adapter la communication",
    vigilance: "Maintenir la confidentialité absolue même avec les proches du patient - seul le patient peut autoriser le partage d'informations"
  },
  {
    concept: "Personne de Confiance",
    definition: "Personne majeure désignée par écrit par le patient pour l'accompagner dans ses démarches et faire valoir sa volonté si celui-ci ne peut s'exprimer",
    exemple: "Patient hospitalisé qui désigne par écrit son conjoint comme personne de confiance pour les décisions médicales en cas d'inconscience",
    piege: "Ne pas confondre avec le tuteur légal - la personne de confiance n'a pas de pouvoir décisionnel légal direct mais témoigne de la volonté du patient",
    mnemo: "PC = 'Personne Choisie' par le patient dont la 'Parole Compte' en cas d'inconscience du patient",
    subtilite: "Son témoignage sur la volonté du patient prévaut sur tous les autres avis de l'entourage en cas de conflit d'interprétation",
    application: "Solliciter systématiquement la désignation lors de toute hospitalisation ou consultation importante et vérifier la validité",
    vigilance: "Vérifier l'identité et la désignation écrite formelle avant toute consultation - la désignation orale n'est pas suffisante"
  },
  {
    concept: "Démarche Éthique Médicale",
    definition: "Processus de réflexion structuré pour résoudre les dilemmes moraux en médecine, intégrant principes éthiques et contexte clinique spécifique",
    exemple: "Face à un refus de transfusion chez un Témoin de Jéhovah : respecter l'autonomie tout en évaluant les alternatives thérapeutiques possibles",
    piege: "Ne pas appliquer automatiquement les principes éthiques - chaque situation nécessite une analyse contextuelle approfondie et personnalisée",
    mnemo: "ÉTHIQUE = 'Examiner Toutes Hypothèses Intelligemment Questionner Utilement Équilibrer'",
    subtilite: "L'éthique médicale n'est pas que déontologique - elle intègre aussi l'éthique du care et de la vertu selon les situations",
    application: "Utiliser la grille des 4 principes (autonomie, bienfaisance, non-malfaisance, justice) pour analyser chaque dilemme moral",
    vigilance: "Ne jamais imposer ses propres valeurs morales au patient - respecter ses choix même s'ils diffèrent des nôtres"
  },
  {
    concept: "Organisation des Soins",
    definition: "Structuration coordonnée des ressources humaines, matérielles et organisationnelles pour optimiser la prise en charge globale des patients",
    exemple: "Mise en place d'un parcours de soins coordonné entre médecin traitant, spécialistes et hôpital pour un patient diabétique complexe",
    piege: "Ne pas confondre efficience organisationnelle et qualité des soins - l'une ne garantit pas automatiquement l'autre",
    mnemo: "ORGANISATION = 'Optimiser Ressources Garantir Amélioration Noteworthy Individuelle Soins Appropriés Totalement Intégrés Optimisés Nécessaires'",
    subtilite: "L'organisation doit s'adapter au patient et non l'inverse - personnalisation dans la standardisation des processus",
    application: "Coordonner les interventions multiprofessionnelles en maintenant la continuité et la cohérence des soins",
    vigilance: "Éviter la fragmentation des soins par excès de spécialisation - maintenir une vision globale du patient"
  },
  {
    concept: "Régulation des Pratiques",
    definition: "Ensemble des mécanismes d'évaluation et d'amélioration continue des pratiques professionnelles pour garantir la qualité et la sécurité des soins",
    exemple: "Mise en place de revues de morbi-mortalité (RMM) pour analyser les événements indésirables et améliorer les pratiques",
    piege: "Ne pas transformer la régulation en contrôle punitif - l'objectif est l'amélioration continue, pas la sanction",
    mnemo: "RÉGULATION = 'Réviser Évaluer Garantir Uniformiser Limiter Améliorer Transformer Intégrer Optimiser Normaliser'",
    subtilite: "La régulation peut être interne (professionnelle) ou externe (institutionnelle) - les deux sont complémentaires",
    application: "Participer activement aux démarches qualité et aux évaluations des pratiques professionnelles",
    vigilance: "Maintenir l'équilibre entre standardisation nécessaire et adaptation au contexte clinique individuel"
  }
];

export const piegesSpecifiques = {
  'colloque singulier': 'Ne pas confondre avec colloque dual - le singulier implique l\'unicité de la relation thérapeutique',
  'personne de confiance': 'Ne pas confondre avec tuteur légal - pas de pouvoir décisionnel légal direct',
  'démarche éthique': 'Ne pas appliquer automatiquement les principes - analyse contextuelle nécessaire',
  'organisation des soins': 'Ne pas confondre efficience organisationnelle et qualité des soins',
  'régulation des pratiques': 'Ne pas transformer la régulation en contrôle punitif - viser l\'amélioration continue'
};

export const mnemosIntelligents = {
  'colloque singulier': 'SINGULIER = "Seul Individu Nécessite Générosité Unique Liaison Individualisée Empathique Respectueuse"',
  'personne de confiance': 'PC = "Personne Choisie" dont la "Parole Compte" en cas d\'inconscience',
  'démarche éthique': 'ÉTHIQUE = "Examiner Toutes Hypothèses Intelligemment Questionner Utilement Équilibrer"',
  'organisation des soins': 'ORGANISATION = "Optimiser Ressources Garantir Amélioration Noteworthy Individuelle Soins Appropriés"',
  'régulation des pratiques': 'RÉGULATION = "Réviser Évaluer Garantir Uniformiser Limiter Améliorer Transformer Intégrer"'
};

export const subtilitesReelles = {
  'colloque singulier': 'Reste singulier même en présence de la famille - c\'est l\'attention au patient qui compte',
  'personne de confiance': 'Son témoignage sur la volonté du patient prévaut sur tous les autres avis',
  'démarche éthique': 'N\'est pas que déontologique - intègre aussi éthique du care et de la vertu',
  'organisation des soins': 'Doit s\'adapter au patient et non l\'inverse - personnalisation dans la standardisation',
  'régulation des pratiques': 'Peut être interne (professionnelle) ou externe (institutionnelle) - complémentaires'
};

export const applicationsConcrates = {
  'colloque singulier': 'Personnaliser chaque consultation selon les caractéristiques bio-psycho-sociales',
  'personne de confiance': 'Solliciter systématiquement la désignation lors de toute hospitalisation importante',
  'démarche éthique': 'Utiliser la grille des 4 principes pour analyser chaque dilemme moral',
  'organisation des soins': 'Coordonner les interventions multiprofessionnelles en maintenant la continuité',
  'régulation des pratiques': 'Participer activement aux démarches qualité et évaluations des pratiques'
};

export const vigilancesSpecifiques = {
  'colloque singulier': 'Maintenir la confidentialité absolue même avec les proches du patient',
  'personne de confiance': 'Vérifier l\'identité et la désignation écrite formelle avant consultation',
  'démarche éthique': 'Ne jamais imposer ses propres valeurs morales au patient',
  'organisation des soins': 'Éviter la fragmentation des soins par excès de spécialisation',
  'régulation des pratiques': 'Maintenir l\'équilibre entre standardisation et adaptation au contexte'
};
