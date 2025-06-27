
export const conceptsRangAIC1 = [
  {
    concept: "Relation médecin-malade",
    definition: "Relation asymétrique où le médecin détient les connaissances et le malade est diminué par sa maladie. Fondement de la pratique médicale moderne.",
    exemple: "Consultation où le médecin utilise son expertise pour diagnostiquer et traiter, tout en respectant l'autonomie du patient",
    piege: "Ne pas confondre relation asymétrique avec relation paternaliste - l'asymétrie est factuelle, le paternalisme est un choix",
    mnemo: "RELATION = Respect + Écoute + Loyauté + Adaptation + Transparence + Information + Objectivité + Neutralité",
    subtilite: "La relation oscille entre modèle paternaliste (urgences) et modèle autonomiste (maladies chroniques) selon le contexte",
    application: "Adapter son approche selon la situation : directive en urgence, collaborative en chronique",
    vigilance: "Éviter le paternalisme systématique tout en gardant l'expertise médicale nécessaire"
  },
  {
    concept: "Modèle paternaliste",
    definition: "Le médecin décide de tout pour le patient. Utile dans les situations d'urgence, à éviter pour les maladies chroniques.",
    exemple: "Réanimation d'urgence où les décisions doivent être prises rapidement sans consultation prolongée",
    piege: "Ne pas généraliser - utile en urgence mais inadapté pour le suivi chronique",
    mnemo: "PATERNALISME = Père + Autorité + Temps limité + Expertise + Responsabilité + Nécessité + Adaptation + Limites + Intervention + Sécurité + Médical + Exceptionnel",
    subtilite: "Modèle encore nécessaire dans certaines situations d'urgence vitale",
    application: "Réserver aux urgences vitales où le temps manque pour la concertation",
    vigilance: "Ne pas maintenir ce modèle une fois l'urgence passée"
  },
  {
    concept: "Modèle autonomiste",
    definition: "Discussion des possibilités entre patient et médecin, décision prise conjointement avec participation du patient dans le projet de soins.",
    exemple: "Choix thérapeutique en oncologie où patient et médecin discutent des options de traitement",
    piege: "Ne pas abandonner l'expertise médicale - l'autonomie ne signifie pas absence de conseil médical",
    mnemo: "AUTONOMIE = Autonomie + Utilité + Temps + Objectifs + Négociation + Options + Médecin + Information + Écoute",
    subtilite: "Deux types : décision médicale partagée et modèle informatif selon le degré d'implication souhaité",
    application: "Privilégier pour les maladies chroniques et les choix thérapeutiques complexes",
    vigilance: "S'assurer que le patient souhaite réellement cette autonomie - certains préfèrent déléguer"
  },
  {
    concept: "Annonce diagnostique",
    definition: "Information loyale, claire et appropriée de l'état de santé. Processus en 3 phases : avant, pendant, après.",
    exemple: "Annonce d'un cancer : préparation du cadre, information progressive, vérification de la compréhension",
    piege: "Ne pas tout dire d'un coup - l'information doit être dosée et adaptée à la capacité de réception",
    mnemo: "ANNONCE = Avant + Nécessité + Neutralité + Objectivité + Nuances + Compréhension + Empathie",
    subtilite: "Communication en 3 phases : avant (préparation), pendant (information), après (vérification)",
    application: "Préparer le cadre, informer progressivement, vérifier la compréhension et proposer un suivi",
    vigilance: "Éviter les mécanismes de défense contre-productifs (mensonge, projection, rationalisation)"
  },
  {
    concept: "Éducation thérapeutique",
    definition: "Processus individuel, continu et intégré visant à délivrer informations, connaissances et soutien psychologique.",
    exemple: "Programme d'éducation pour diabétique : formation sur la maladie, l'auto-surveillance, l'adaptation du mode de vie",
    piege: "Ne pas confondre avec simple information - c'est un processus structuré en 4 étapes",
    mnemo: "ETP = Évaluer + Établir + Éduquer + Évaluer (les 4 étapes du processus)",
    subtilite: "Particulièrement utile dans les maladies chroniques pour gagner en autonomie",
    application: "Structurer en 4 étapes : diagnostic éducatif, programme personnalisé, séances ETP, évaluation",
    vigilance: "Adapter le programme aux capacités d'apprentissage et aux priorités du patient"
  },
  {
    concept: "Processus de changement",
    definition: "Modèle de Prochaska et DiClemente en 6 stades pour accompagner le changement de comportement de santé.",
    exemple: "Sevrage tabagique : identifier le stade du patient pour adapter l'intervention thérapeutique",
    piege: "Ne pas forcer le passage d'un stade à l'autre - respecter le rythme du patient",
    mnemo: "CHANGEMENT = Contemplation + Hésitation + Action + Nouveauté + Gestion + Évolution + Maintien + Éviter + Nouveau + Temps",
    subtilite: "6 stades : pré-contemplation, contemplation, détermination, action, maintien, rechute (normale)",
    application: "Identifier le stade du patient pour adapter l'intervention motivationnelle",
    vigilance: "La rechute fait partie du processus normal - ne pas la considérer comme un échec"
  }
];

export const piegesSpecifiquesIC1 = {
  'relation médecin-malade': 'Ne pas confondre relation asymétrique avec relation paternaliste - l\'asymétrie est factuelle',
  'modèle paternaliste': 'Ne pas généraliser - utile en urgence mais inadapté pour le suivi chronique',
  'modèle autonomiste': 'Ne pas abandonner l\'expertise médicale - l\'autonomie ne signifie pas absence de conseil',
  'annonce diagnostique': 'Ne pas tout dire d\'un coup - l\'information doit être dosée et adaptée',
  'éducation thérapeutique': 'Ne pas confondre avec simple information - c\'est un processus structuré',
  'processus de changement': 'Ne pas forcer le passage d\'un stade à l\'autre - respecter le rythme'
};

export const mnemosIntellignetsIC1 = {
  'relation médecin-malade': 'RELATION = Respect + Écoute + Loyauté + Adaptation + Transparence + Information + Objectivité + Neutralité',
  'modèle paternaliste': 'PATERNALISME = Père + Autorité + Temps limité + Expertise + Responsabilité + Nécessité',
  'modèle autonomiste': 'AUTONOMIE = Autonomie + Utilité + Temps + Objectifs + Négociation + Options + Médecin + Information',
  'annonce diagnostique': 'ANNONCE = Avant + Nécessité + Neutralité + Objectivité + Nuances + Compréhension + Empathie',
  'éducation thérapeutique': 'ETP = Évaluer + Établir + Éduquer + Évaluer (les 4 étapes)',
  'processus de changement': 'CHANGEMENT = Contemplation + Hésitation + Action + Nouveauté + Gestion + Évolution + Maintien'
};

export const subtilitesReellesIC1 = {
  'relation médecin-malade': 'La relation oscille entre modèle paternaliste et autonomiste selon le contexte',
  'modèle paternaliste': 'Modèle encore nécessaire dans certaines situations d\'urgence vitale',
  'modèle autonomiste': 'Deux types : décision médicale partagée et modèle informatif selon le degré d\'implication',
  'annonce diagnostique': 'Communication en 3 phases : avant (préparation), pendant (information), après (vérification)',
  'éducation thérapeutique': 'Particulièrement utile dans les maladies chroniques pour gagner en autonomie',
  'processus de changement': '6 stades : pré-contemplation, contemplation, détermination, action, maintien, rechute'
};

export const applicationsConcratesIC1 = {
  'relation médecin-malade': 'Adapter son approche selon la situation : directive en urgence, collaborative en chronique',
  'modèle paternaliste': 'Réserver aux urgences vitales où le temps manque pour la concertation',
  'modèle autonomiste': 'Privilégier pour les maladies chroniques et les choix thérapeutiques complexes',
  'annonce diagnostique': 'Préparer le cadre, informer progressivement, vérifier la compréhension et proposer un suivi',
  'éducation thérapeutique': 'Structurer en 4 étapes : diagnostic éducatif, programme personnalisé, séances ETP, évaluation',
  'processus de changement': 'Identifier le stade du patient pour adapter l\'intervention motivationnelle'
};

export const vigilancesSpecifiquesIC1 = {
  'relation médecin-malade': 'Éviter le paternalisme systématique tout en gardant l\'expertise médicale nécessaire',
  'modèle paternaliste': 'Ne pas maintenir ce modèle une fois l\'urgence passée',
  'modèle autonomiste': 'S\'assurer que le patient souhaite réellement cette autonomie - certains préfèrent déléguer',
  'annonce diagnostique': 'Éviter les mécanismes de défense contre-productifs (mensonge, projection, rationalisation)',
  'éducation thérapeutique': 'Adapter le programme aux capacités d\'apprentissage et aux priorités du patient',
  'processus de changement': 'La rechute fait partie du processus normal - ne pas la considérer comme un échec'
};
