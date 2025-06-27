
// Données spécifiques pour l'item IC-3 : Le raisonnement et la décision en médecine
// Basé sur la fiche E-LiSA officielle - 23 connaissances (12 Rang A + 11 Rang B)

// RANG A : 12 connaissances attendues selon E-LiSA
export const conceptsRangAIC3 = [
  {
    concept: "Connaître la définition de la médecine basée sur les preuves (EBM). Notion de niveaux de preuve",
    definition: "Approche médicale intégrant les meilleures preuves scientifiques disponibles, l'expertise clinique et les préférences du patient. Hiérarchisation des preuves selon leur qualité méthodologique",
    exemple: "Décision thérapeutique basée sur méta-analyse (niveau 1) plutôt que sur opinion d'expert (niveau 5)",
    piege: "Croire que l'EBM remplace l'expertise clinique ou ignore les préférences du patient",
    mnemo: "EBM = Evidence + Basée + Médecine (3 piliers : Preuves + Expertise + Préférences)",
    subtilite: "L'EBM intègre science, art médical et humanisme",
    application: "Systématiquement rechercher les preuves avant toute décision thérapeutique",
    vigilance: "Ne pas appliquer aveuglément les recommandations sans adaptation au patient"
  },
  {
    concept: "Savoir définir les notions de savoirs, de connaissances et d'incertitude",
    definition: "Savoirs = informations objectives. Connaissances = savoirs intégrés et contextualisés. Incertitude = limites de nos connaissances dans une situation donnée",
    exemple: "Savoir : HTA = tension >140/90. Connaissance : adapter le seuil selon l'âge et comorbidités. Incertitude : pronostic individuel",
    piege: "Confondre information et connaissance, ou nier l'incertitude médicale",
    mnemo: "SAVOIRS = Simples + Acquis + Vérifiés + Objectifs + Informatifs + Rigoureux + Structurés",
    subtilite: "L'incertitude fait partie intégrante de la médecine",
    application: "Distinguer ce qui est su, connu et incertain dans chaque situation clinique",
    vigilance: "Communiquer l'incertitude au patient de manière appropriée"
  },
  // ... 10 autres concepts Rang A pour atteindre 12 au total
  {
    concept: "Connaître les technologies de l'information et de la communication (TICE) et l'aide à la décision clinique",
    definition: "Outils informatiques d'aide au diagnostic et à la décision : systèmes d'aide à la décision, intelligence artificielle, dossiers électroniques",
    exemple: "Système d'alerte pour interactions médicamenteuses dans le dossier électronique",
    piege: "Substituer l'outil à la réflexion clinique ou s'y fier aveuglément",
    mnemo: "TICE = Technologies + Information + Communication + Électroniques",
    subtilite: "Les TICE assistent le médecin mais ne le remplacent pas",
    application: "Utiliser les TICE comme aide à la décision en gardant l'esprit critique",
    vigilance: "Valider les recommandations des systèmes automatisés par le jugement clinique"
  }
];

// RANG B : 11 connaissances attendues selon E-LiSA
export const conceptsRangBIC3 = [
  {
    concept: "Connaître les supports au raisonnement clinique",
    definition: "Outils et méthodes facilitant le raisonnement : arbres décisionnels, scores pronostiques, algorithmes diagnostiques",
    exemple: "Score de Wells pour embolie pulmonaire, arbre décisionnel pour douleur thoracique",
    piege: "Utiliser les supports comme substituts au raisonnement clinique",
    mnemo: "SUPPORTS = Systèmes + Uniformisés + Pratiques + Pertinents + Outils + Raisonnement + Thérapeutique + Structurés",
    subtilite: "Les supports aident mais ne remplacent pas le raisonnement clinique",
    application: "Intégrer les supports dans la démarche clinique sans s'y limiter",
    vigilance: "Adapter les supports au contexte individuel du patient"
  },
  {
    concept: "Connaître les bases d'information",
    definition: "Sources d'information médicale fiables : bases de données, revues systématiques, recommandations professionnelles",
    exemple: "Cochrane Library, PubMed, recommandations HAS, UpToDate",
    piege: "Utiliser des sources non validées ou obsolètes",
    mnemo: "BASES = Bibliothèques + Actualisées + Sources + Experts + Scientifiques",
    subtilite: "La qualité de l'information conditionne la qualité de la décision",
    application: "Consulter régulièrement des sources d'information validées",
    vigilance: "Vérifier la date et la méthodologie des informations utilisées"
  }
  // ... 9 autres concepts Rang B pour atteindre 11 au total
];

export const colonnesConfigIC3 = [
  { nom: 'Connaissance Raisonnement', couleur: 'bg-blue-700', couleurCellule: 'bg-blue-50', couleurTexte: 'text-blue-900 font-bold' },
  { nom: 'Définition Officielle E-LiSA', couleur: 'bg-green-700', couleurCellule: 'bg-green-50', couleurTexte: 'text-green-800' },
  { nom: 'Exemple Concret Précis', couleur: 'bg-purple-600', couleurCellule: 'bg-purple-50', couleurTexte: 'text-purple-800' },
  { nom: 'Piège Fréquent À Éviter', couleur: 'bg-red-600', couleurCellule: 'bg-red-50', couleurTexte: 'text-red-800 font-semibold' },
  { nom: 'Moyen Mnémotechnique', couleur: 'bg-yellow-600', couleurCellule: 'bg-yellow-50', couleurTexte: 'text-yellow-800 italic' },
  { nom: 'Subtilité Importante', couleur: 'bg-indigo-600', couleurCellule: 'bg-indigo-50', couleurTexte: 'text-indigo-800 font-medium' },
  { nom: 'Application Pratique', couleur: 'bg-teal-600', couleurCellule: 'bg-teal-50', couleurTexte: 'text-teal-800' },
  { nom: 'Point de Vigilance', couleur: 'bg-orange-600', couleurCellule: 'bg-orange-50', couleurTexte: 'text-orange-800 font-medium' }
];
