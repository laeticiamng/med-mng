
// Données spécifiques pour l'item IC-2 : Les valeurs professionnelles du médecin et des autres professions de santé
// Basé sur la fiche E-LiSA officielle - 11 connaissances exactement (9 Rang A + 2 Rang B)

// RANG A : 9 connaissances attendues exactement selon E-LiSA
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
    concept: "Connaître la définition de la pratique médicale",
    definition: "Activité professionnelle du médecin intégrant diagnostic, traitement, prévention dans un cadre scientifique et relationnel structuré",
    exemple: "Consultation médicale, établissement du diagnostic, prescription thérapeutique, suivi des patients, prévention des maladies",
    piege: "Réduire la pratique médicale à la dimension technique seule en négligeant l'aspect relationnel",
    mnemo: "PRATIQUE = Prévention + Relation + Actes + Thérapeutique + Intégration + Qualité + Utilisée + Évaluation",
    subtilite: "La pratique médicale combine excellence technique et dimension humaine",
    application: "Exercice médical global intégrant tous les aspects de la prise en charge",
    vigilance: "Maintenir l'équilibre entre compétence technique et approche humaine"
  },
  {
    concept: "Connaître la signification de l'éthique",
    definition: "Réflexion philosophique sur l'action juste et appropriée, questionnement moral face aux dilemmes de la pratique médicale",
    exemple: "Questionnement éthique face aux dilemmes cliniques : acharnement thérapeutique, fin de vie, conflits d'intérêts",
    piege: "Confondre éthique personnelle et éthique professionnelle ou séparer éthique et pratique",
    mnemo: "ÉTHIQUE = Évaluation + Théorie + Humanité + Intégrité + Questionnement + Utilisée + Ensemble",
    subtilite: "L'éthique guide la réflexion mais ne donne pas de réponses toutes faites",
    application: "Intégration systématique de la réflexion éthique dans chaque décision médicale",
    vigilance: "Ne pas instrumentaliser l'éthique mais en faire un véritable outil de réflexion"
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
    concept: "Connaître les principes de la médecine fondés sur les preuves",
    definition: "Evidence-Based Medicine : approche médicale basée sur les meilleures preuves scientifiques disponibles, intégrée à l'expertise clinique",
    exemple: "Utilisation de méta-analyses, essais randomisés contrôlés, guidelines basées sur les preuves pour les décisions thérapeutiques",
    piege: "Opposer EBM et médecine humaniste ou appliquer les preuves sans discernement clinique",
    mnemo: "EBM = Evidence + Basée + Médecine + preuves scientifiques + expertise + patient",
    subtilite: "L'EBM combine rigueur scientifique et adaptation individuelle",
    application: "Décisions thérapeutiques basées sur les meilleures preuves disponibles",
    vigilance: "Adapter les preuves générales au cas particulier de chaque patient"
  },
  {
    concept: "Connaître les principes de la médecine basés sur la responsabilité et l'expérience du malade",
    definition: "Approche médicale intégrant l'expérience vécue du patient, ses préférences et sa responsabilité dans les décisions de santé",
    exemple: "Prise en compte du vécu de la maladie, des préférences thérapeutiques, de l'autonomie décisionnelle du patient",
    piege: "Négliger l'expérience subjective du patient ou imposer une vision purement technique",
    mnemo: "RESPONSABILITÉ = Respect + Expérience + Souffrance + Personnalisée + Optimale + Nuancée + Sensible + Adaptée + Bienveillante + Individualisée + Libre + Intégrée + Totale + Éclairée",
    subtilite: "Équilibre entre expertise médicale et autonomie du patient",
    application: "Décisions partagées intégrant l'expérience et les préférences du patient",
    vigilance: "Respecter l'autonomie sans abandonner la responsabilité médicale"
  },
  {
    concept: "Connaître les principes de déontologie médicale",
    definition: "Ensemble des devoirs professionnels codifiés régissant l'exercice médical : code de déontologie, obligations envers patients et confrères",
    exemple: "Code de déontologie médicale, secret professionnel, obligation de soins, respect de la dignité, confraternité",
    piege: "Confondre déontologie et éthique ou méconnaître les obligations déontologiques",
    mnemo: "DÉONTOLOGIE = Devoirs + Éthique + Officiels + Normatifs + Textes + Obligatoires + Légaux + Officiels + Gestion + Intégrité + Équilibre",
    subtilite: "La déontologie fixe le cadre légal et professionnel minimum",
    application: "Respect strict du code déontologique dans l'exercice quotidien",
    vigilance: "Connaître et appliquer toutes les obligations déontologiques"
  },
  {
    concept: "Connaître les différents acteurs de la santé et leurs interactions",
    definition: "Écosystème complexe d'acteurs : professionnels de santé, établissements, institutions, patients, familles, associations avec interactions multiples",
    exemple: "Hôpitaux, cliniques, médecine de ville, EHPAD, HAD, associations de patients, tutelles, ARS, CPAM, mutuelles",
    piege: "Vision restrictive des acteurs ou méconnaissance des interactions systémiques",
    mnemo: "ACTEURS-INTERACTIONS = Acteurs + Complexes + Territoires + Établissements + Utilités + Réseaux + Santé + Institutions + Nombreux + Patients + Échanges + Relations + Associations + Coordinations + Territoires + Intégrés + Organisés + Nombreuses + Synergies",
    subtilite: "Approche systémique nécessaire pour comprendre la complexité des interactions",
    application: "Coordination efficace avec tous les acteurs du parcours patient",
    vigilance: "Prendre en compte la dimension systémique dans chaque décision"
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
    concept: "Connaître le rôle des ordres professionnels",
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
