
// Données spécifiques pour l'item IC-2 : Les valeurs professionnelles du médecin et des autres professions de santé
// Basé sur la fiche E-LiSA officielle - 7 connaissances Rang A exactement selon E-LiSA

// RANG A : 7 connaissances attendues exactement selon E-LiSA
export const conceptsRangAIC2 = [
  {
    concept: "Identifier les professionnels, compétences et ressources liés à un rôle particulier dans une organisation de santé",
    definition: "Cartographie complète des acteurs de santé : professionnels règlementés (médecins, pharmaciens, infirmiers, etc.) et leurs compétences spécifiques dans l'organisation sanitaire",
    exemple: "Médecins spécialistes, généralistes, chirurgiens-dentistes, sages-femmes, pharmaciens, infirmiers, masseurs-kinésithérapeutes, pédicures-podologues selon leurs rôles organisationnels",
    piege: "Confondre les professionnels de santé règlementés avec les autres acteurs ou méconnaître les compétences spécifiques",
    mnemo: "PROS-SANTÉ = Professionnels + Rôles + Organisation + Spécificités + Santé + Acteurs + Niveaux + Territoires + Équipes",
    subtilite: "Chaque professionnel a des compétences définies par son statut et son rôle dans l'organisation",
    application: "Organisation des équipes de soins en fonction des compétences de chaque professionnel",
    vigilance: "Respecter les périmètres de compétences et les responsabilités de chaque acteur"
  },
  {
    concept: "Connaître la définition de la pratique médicale et connaître la signification de l'éthique",
    definition: "Activité professionnelle du médecin intégrant diagnostic, traitement, prévention dans un cadre scientifique et relationnel structuré + réflexion philosophique sur l'action juste",
    exemple: "Consultation médicale, établissement du diagnostic, prescription thérapeutique combinés à la réflexion éthique face aux dilemmes cliniques",
    piege: "Séparer pratique médicale et éthique ou réduire l'une à la dimension technique",
    mnemo: "PRATIQUE-ÉTHIQUE = Prévention + Relation + Actes + Thérapeutique + Intégrité + Questionnement + Utilisée + Évaluation",
    subtilite: "La pratique médicale et l'éthique sont indissociables dans l'exercice médical",
    application: "Exercice médical global intégrant excellence technique et réflexion éthique",
    vigilance: "Maintenir l'équilibre entre compétence technique, approche humaine et questionnement éthique"
  },
  {
    concept: "Connaître les définitions de normes et de valeurs professionnelles",
    definition: "Valeurs = principes fondamentaux guidant l'action (dignité, respect, bienfaisance). Normes = règles concrètes traduisant ces valeurs en obligations",
    exemple: "Valeur : respect de la personne → Norme : consentement éclairé obligatoire. Valeur : non-malfaisance → Norme : interdiction de nuire",
    piege: "Confondre valeurs abstraites et normes concrètes ou les hiérarchiser incorrectement",
    mnemo: "VALEURS-NORMES = Valeurs + Abstraites + Leur + Enfantent + Utilement + Règles + Spécifiques + Normatives + Obligatoires + Respectueuses + Mesurables + Exigibles + Sanctionnables",
    subtilite: "Les normes découlent des valeurs mais s'imposent différemment selon les contextes",
    application: "Application concrète des valeurs par le respect des normes professionnelles",
    vigilance: "Articuler valeurs personnelles et normes professionnelles sans les opposer"
  },
  {
    concept: "Connaître l'organisation sociale et politique de la profession médicale et sa régulation étatique",
    definition: "Organisation professionnelle sous contrôle étatique croissant : ordres professionnels, régulation des dépenses, évaluation qualité, encadrement juridique",
    exemple: "Conseil de l'Ordre des médecins, CNOM, contrôles CPAM, évaluation HAS, réglementation ministérielle",
    piege: "Sous-estimer l'évolution vers plus de régulation étatique ou ignorer les instances de contrôle",
    mnemo: "RÉGULATION = Règles + Étatiques + Gestion + Uniformisée + Libéralisme + Adapté + Territoire + Institutions + Ordre + Normes",
    subtilite: "Équilibre complexe entre autonomie professionnelle et contrôle sociétal",
    application: "Exercice médical dans le respect des réglementations et contrôles en vigueur",
    vigilance: "Concilier liberté médicale et contraintes de santé publique et économiques"
  },
  {
    concept: "Connaître les principes de la médecine fondée sur les preuves et de la médecine basée sur la responsabilité et l'expérience du malade",
    definition: "Evidence-Based Medicine combinée à l'approche intégrant l'expérience vécue du patient, ses préférences et sa responsabilité dans les décisions de santé",
    exemple: "Utilisation de méta-analyses et essais randomisés + prise en compte du vécu de la maladie et des préférences thérapeutiques du patient",
    piege: "Opposer EBM et médecine humaniste ou négliger l'expérience subjective du patient",
    mnemo: "EBM-RESPONSABILITÉ = Evidence + Basée + Médecine + Responsabilité + Expérience + Souffrance + Personnalisée + Optimale + Nuancée + Sensible + Adaptée + Bienveillante + Individualisée + Libre + Intégrée",
    subtilite: "Équilibre entre rigueur scientifique, expertise médicale et autonomie du patient",
    application: "Décisions thérapeutiques basées sur les preuves ET les préférences du patient",
    vigilance: "Adapter les preuves générales au cas particulier tout en respectant l'autonomie"
  },
  {
    concept: "Connaître les principes de déontologie médicale, connaître la notion de conflit de valeurs et de conflit d'intérêts",
    definition: "Ensemble des devoirs professionnels codifiés + gestion des tensions entre valeurs contradictoires et des situations où intérêts personnels interfèrent avec intérêt du patient",
    exemple: "Code de déontologie médicale, secret professionnel, obligation de soins + gestion conflits valeurs (autonomie vs bienfaisance) et d'intérêts (financiers, personnels)",
    piege: "Confondre déontologie et éthique ou méconnaître la complexité des conflits de valeurs/intérêts",
    mnemo: "DÉONTOLOGIE-CONFLITS = Devoirs + Éthique + Officiels + Normatifs + Textes + Obligatoires + Légaux + Officiels + Gestion + Intégrité + Équilibre + Conflits + Oppositions + Neutralité + Fidélité + Loyauté + Intérêts + Tensions + Solutions",
    subtilite: "La déontologie fixe le cadre mais les conflits nécessitent une analyse cas par cas",
    application: "Respect strict du code déontologique avec gestion éclairée des conflits",
    vigilance: "Identifier et gérer les conflits de valeurs et d'intérêts de manière transparente"
  },
  {
    concept: "Connaître les interactions professionnelles et la collaboration interprofessionnelle",
    definition: "Modes de coopération entre professionnels de santé : coordination, délégation, référence, travail en équipe pluridisciplinaire pour optimiser la prise en charge",
    exemple: "Réunions de concertation pluridisciplinaire, consultations partagées, protocoles de coopération, télémédecine collaborative",
    piege: "Vision hiérarchique rigide ou méconnaissance des compétences des autres professionnels",
    mnemo: "INTERACTIONS-COLLABORATION = Interactions + Nombreuses + Territoires + Équipes + Relations + Acteurs + Coordinations + Territoires + Intégrées + Optimisées + Nombreuses + Synergies + Collaboration + Optimale + Légale + Légitime + Adaptée + Bienveillante + Ouverte + Respectueuse + Adaptée + Territoriale + Intégrée + Optimisée + Nombreuses",
    subtilite: "Chaque professionnel garde son expertise tout en s'intégrant dans une démarche collective",
    application: "Participation active aux équipes pluridisciplinaires et réseaux de soins",
    vigilance: "Respecter les compétences de chaque professionnel dans une logique collaborative"
  }
];

// RANG B : 2 connaissances attendues exactement selon E-LiSA
export const conceptsRangBIC2 = [
  {
    concept: "Connaître l'organisation de l'exercice des professionnels de santé en France et leurs statuts",
    definition: "Organisation statutaire complexe : fonctionnaires (hospitaliers publics), salariés (privé), libéraux, mixtes, avec réglementations spécifiques par statut",
    exemple: "Médecins hospitaliers (PH, MCU-PH, CCA), médecins libéraux (secteur 1/2), salariés cliniques privées, statuts mixtes",
    piege: "Méconnaître la diversité des statuts ou leurs implications juridiques et économiques",
    mnemo: "STATUTS-ORGANISATION = Statuts + Territoires + Administratifs + Textes + Uniformes + Territoires + Spécifiques + Organisation + Réglementée + Gestion + Adaptée + Nombreuses + Intégrée + Systématique + Appliquée + Totale + Intégrative + Optimisée + Normalisée",
    subtilite: "Chaque statut implique des droits, devoirs et contraintes spécifiques",
    application: "Choix de statut professionnel en connaissance des implications",
    vigilance: "Respecter les obligations spécifiques à chaque statut d'exercice"
  },
  {
    concept: "Connaître le rôle des ordres professionnels et leur fonctionnement",
    definition: "Instances de régulation professionnelle : inscription, discipline, surveillance déontologique, organisation territoriale (départemental, régional, national)",
    exemple: "CNOM, conseils départementaux et régionaux, procédures disciplinaires, veille déontologique, missions de service public",
    piege: "Sous-estimer le pouvoir disciplinaire des ordres ou méconnaître leur organisation",
    mnemo: "ORDRES-RÔLES = Ordres + Régulation + Discipline + Règles + Éthique + Surveillance + Responsabilités + Obligations + Légales + Encadrement + Structuration",
    subtilite: "Triple mission : police professionnelle, conseil, représentation",
    application: "Respect des obligations ordinales et procédures en cas de difficultés",
    vigilance: "Connaître ses droits et devoirs vis-à-vis de l'ordre professionnel"
  }
];

export const colonnesConfigIC2 = [
  { nom: 'Connaissance Professionnelle', couleur: 'bg-blue-700', couleurCellule: 'bg-blue-50', couleurTexte: 'text-blue-900 font-bold' },
  { nom: 'Définition Officielle E-LiSA', couleur: 'bg-green-700', couleurCellule: 'bg-green-50', couleurTexte: 'text-green-800' },
  { nom: 'Exemple Concret Précis', couleur: 'bg-purple-600', couleurCellule: 'bg-purple-50', couleurTexte: 'text-purple-800' },
  { nom: 'Piège Fréquent À Éviter', couleur: 'bg-red-600', couleurCellule: 'bg-red-50', couleurTexte: 'text-red-800 font-semibold' },
  { nom: 'Moyen Mnémotechnique', couleur: 'bg-yellow-600', couleurCellule: 'bg-yellow-50', couleurTexte: 'text-yellow-800 italic' },
  { nom: 'Subtilité Importante', couleur: 'bg-indigo-600', couleurCellule: 'bg-indigo-50', couleurTexte: 'text-indigo-800 font-medium' },
  { nom: 'Application Pratique', couleur: 'bg-teal-600', couleurCellule: 'bg-teal-50', couleurTexte: 'text-teal-800' },
  { nom: 'Point de Vigilance', couleur: 'bg-orange-600', couleurCellule: 'bg-orange-50', couleurTexte: 'text-orange-800 font-medium' }
];
