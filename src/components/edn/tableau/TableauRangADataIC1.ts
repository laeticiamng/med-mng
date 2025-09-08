
// Données spécifiques pour l'item IC-1 : La relation médecin-malade
// Basé sur la fiche E-LiSA officielle - 15 connaissances exactement (toutes Rang A)

// RANG A : 15 connaissances attendues exactement selon E-LiSA
export const conceptsRangAIC1 = [
  {
    concept: "Définition de la relation médecin-malade",
    definition: "Relation interpersonnelle asymétrique entre médecin et patient, caractérisée par un déséquilibre de connaissances et une vulnérabilité du patient",
    exemple: "Consultation médicale où le médecin détient l'expertise technique tandis que le patient est en situation de vulnérabilité",
    piege: "Ne pas confondre asymétrie factuelle avec paternalisme - l'asymétrie est structurelle",
    mnemo: "RELATION = Respect + Écoute + Loyauté + Adaptation + Transparence + Information + Objectivité + Neutralité",
    subtilite: "L'asymétrie est inhérente à la relation mais ne justifie pas le paternalisme",
    application: "Reconnaître et gérer cette asymétrie dans toute interaction thérapeutique",
    vigilance: "Éviter d'exploiter cette asymétrie au détriment du patient"
  },
  {
    concept: "Principaux déterminants de la relation médecin-malade",
    definition: "Facteurs influençant la qualité de la relation : communication, confiance, compétence, disponibilité, empathie",
    exemple: "Temps accordé, qualité d'écoute, clarté des explications, respect des valeurs du patient",
    piege: "Négliger l'importance des facteurs non-techniques dans la relation",
    mnemo: "DÉTERMINANTS = Disponibilité + Écoute + Transparence + Empathie + Respect + Médical + Information + Neutralité + Adaptation + Nuances + Temps + Soutien",
    subtilite: "Les déterminants techniques et relationnels sont interdépendants",
    application: "Travailler consciemment sur chaque déterminant lors des consultations",
    vigilance: "Ne pas sous-estimer l'impact des facteurs relationnels sur l'efficacité thérapeutique"
  },
  {
    concept: "Principaux corrélats cliniques de la relation médecin-malade",
    definition: "Liens entre qualité de la relation et résultats cliniques : adhésion thérapeutique, satisfaction, guérison",
    exemple: "Meilleure adhésion au traitement quand la relation est de qualité, diminution de l'anxiété du patient",
    piege: "Penser que seule la technique médicale influence les résultats cliniques",
    mnemo: "CORRÉLATS = Compliance + Outcomes + Résultats + Réduction + Évaluation + Liens + Adhésion + Thérapeutique + Satisfaction",
    subtilite: "La qualité relationnelle a un impact mesurable sur les résultats de santé",
    application: "Investir dans la relation comme composante thérapeutique à part entière",
    vigilance: "Évaluer régulièrement la qualité de la relation et son impact"
  },
  {
    concept: "Principes de « l'approche centrée sur le patient »",
    definition: "Approche plaçant le patient au centre des décisions, respectant ses valeurs, préférences et besoins spécifiques",
    exemple: "Adaptation du plan de soins aux priorités du patient, prise en compte de son contexte de vie",
    piege: "Confondre approche centrée patient avec abandon de l'expertise médicale",
    mnemo: "PATIENT-CENTRÉ = Préférences + Adaptation + Transparence + Information + Écoute + Nuances + Temps + Coordination + Empathie + Neutralité + Respect + Émotions",
    subtilite: "Équilibre entre expertise médicale et autonomie du patient",
    application: "Intégrer systématiquement la perspective du patient dans les décisions",
    vigilance: "Maintenir l'expertise médicale tout en respectant l'autonomie du patient"
  },
  {
    concept: "Notion de représentation de la maladie",
    definition: "Perception subjective que le patient a de sa maladie, influençant ses comportements et son vécu",
    exemple: "Patient diabétique considérant sa maladie comme une fatalité versus celui la percevant comme contrôlable",
    piege: "Ignorer les représentations du patient et imposer une vision purement médicale",
    mnemo: "REPRÉSENTATION = Réalité + Émotions + Perceptions + Réactions + Évaluation + Significations + Explications + Nuances + Théories + Adaptation + Transformation + Interprétation + Opinions + Notions",
    subtilite: "Les représentations influencent directement l'adhésion et l'évolution",
    application: "Explorer systématiquement les représentations du patient sur sa maladie",
    vigilance: "Ne pas juger les représentations mais les comprendre et les travailler"
  },
  {
    concept: "Facteurs influençant l'information délivrée au patient",
    definition: "Éléments déterminant le contenu, la forme et le moment de l'information : contexte, capacités, désir de savoir",
    exemple: "Adaptation de l'information selon l'âge, le niveau culturel, l'état émotionnel du patient",
    piege: "Délivrer une information standardisée sans adaptation au patient",
    mnemo: "INFORMATION = Individualisation + Nuances + Facteurs + Objectifs + Respect + Médical + Adaptation + Transparence + Intelligibilité + Occasion + Neutralité",
    subtilite: "L'information doit être personnalisée et progressive",
    application: "Évaluer les facteurs avant de délivrer l'information médicale",
    vigilance: "Vérifier la compréhension et adapter en continu"
  },
  {
    concept: "Notion d'ajustement au stress",
    definition: "Processus d'adaptation psychologique face à la maladie et aux traitements, mobilisant des stratégies de coping",
    exemple: "Patient développant des stratégies d'adaptation face au diagnostic de cancer",
    piege: "Négliger l'impact psychologique de la maladie sur l'ajustement du patient",
    mnemo: "AJUSTEMENT = Adaptation + Jonction + Utilisation + Stratégies + Thérapeutique + Émotions + Médical + Équilibre + Nuances + Temps",
    subtilite: "L'ajustement est un processus dynamique et individuel",
    application: "Identifier et soutenir les stratégies d'ajustement positives",
    vigilance: "Repérer les signes de mauvais ajustement nécessitant un soutien"
  },
  {
    concept: "Principaux mécanismes de défense (patients/proches/soignants) lors de l'annonce d'une mauvaise nouvelle",
    definition: "Mécanismes psychologiques inconscients mobilisés face à l'annonce : déni, projection, rationalisation, régression",
    exemple: "Déni initial du diagnostic, colère dirigée vers l'équipe soignante, négociation pour retarder les soins",
    piege: "Interpréter les mécanismes de défense comme de la résistance ou de l'opposition",
    mnemo: "DÉFENSE = Déni + Émotions + Fuite + Évitement + Négociation + Silence + Explications",
    subtilite: "Les mécanismes de défense sont normaux et transitoires",
    application: "Identifier et respecter les mécanismes de défense sans les forcer",
    vigilance: "Distinguer mécanismes adaptatifs et pathologiques"
  },
  {
    concept: "Notion d'empathie clinique",
    definition: "Capacité à comprendre et ressentir les émotions du patient tout en gardant une distance professionnelle",
    exemple: "Comprendre la souffrance du patient sans être submergé par ses propres émotions",
    piege: "Confondre empathie et sympathie, ou empathie et identification",
    mnemo: "EMPATHIE = Émotions + Médical + Perception + Adaptation + Thérapeutique + Humanité + Intelligence + Équilibre",
    subtilite: "L'empathie clinique nécessite proximité émotionnelle et distance professionnelle",
    application: "Développer une empathie mesurée et thérapeutique",
    vigilance: "Éviter le burn-out par excès d'empathie ou la froideur par manque d'empathie"
  },
  {
    concept: "Notion d'alliance thérapeutique",
    definition: "Collaboration active entre patient et soignant autour d'objectifs partagés de soins",
    exemple: "Patient et médecin s'accordent sur les objectifs thérapeutiques et les moyens d'y parvenir",
    piege: "Croire que l'alliance se crée automatiquement ou qu'elle est définitive",
    mnemo: "ALLIANCE = Accord + Loyauté + Liens + Intérêts + Adaptation + Nuances + Collaboration + Empathie",
    subtilite: "L'alliance thérapeutique se construit et se maintient activement",
    application: "Travailler consciemment à établir et maintenir cette alliance",
    vigilance: "Surveiller les signes de rupture d'alliance et les réparer"
  },
  {
    concept: "Principales étapes du processus de changement",
    definition: "Modèle de Prochaska et DiClemente : pré-contemplation, contemplation, détermination, action, maintien, rechute",
    exemple: "Sevrage tabagique : identifier le stade du patient pour adapter l'intervention",
    piege: "Vouloir faire passer rapidement le patient d'un stade à l'autre",
    mnemo: "CHANGEMENT = Contemplation + Hésitation + Action + Nouveauté + Gestion + Évolution + Maintien + Éviter + Nouveau + Temps",
    subtilite: "Chaque stade nécessite une approche spécifique",
    application: "Identifier le stade du patient et adapter l'intervention motivationnelle",
    vigilance: "Respecter le rythme du patient et accepter les rechutes"
  },
  {
    concept: "Indications et principes de l'entretien motivationnel",
    definition: "Technique d'entretien visant à renforcer la motivation au changement en explorant l'ambivalence",
    exemple: "Aider un patient diabétique à trouver ses propres raisons de modifier son alimentation",
    piege: "Utiliser l'entretien motivationnel comme technique de persuasion",
    mnemo: "MOTIVATIONNEL = Motivation + Objectifs + Techniques + Intrinsèque + Valeurs + Adaptation + Thérapeutique + Information + Occasionnel + Nuances + Neutralité + Empathie + Loyauté",
    subtilite: "L'efficacité repose sur l'émergence de la motivation intrinsèque",
    application: "Utiliser les techniques d'entretien motivationnel pour les changements de comportement",
    vigilance: "Éviter de manipuler ou de forcer la motivation du patient"
  },
  {
    concept: "Comment se montrer empathique à l'égard du patient",
    definition: "Techniques pratiques pour exprimer l'empathie : écoute active, reformulation, validation émotionnelle",
    exemple: "Reformuler les émotions du patient : 'Je comprends que cette annonce vous inquiète beaucoup'",
    piege: "Confondre empathie et conseils ou solutions immédiates",
    mnemo: "EMPATHIQUE = Écoute + Médical + Patience + Adaptation + Thérapeutique + Humanité + Intelligence + Questionnement + Utilité + Émotions",
    subtilite: "L'empathie s'exprime autant par les gestes que par les mots",
    application: "Utiliser les techniques d'expression empathique dans chaque interaction",
    vigilance: "Maintenir l'authenticité de l'empathie sans la théâtraliser"
  },
  {
    concept: "Principes d'une communication adaptée verbale/non verbale avec patient et entourage",
    definition: "Techniques de communication tenant compte du verbal (mots, ton) et non-verbal (gestes, posture, regard)",
    exemple: "Adapter sa posture (assis, penché vers le patient), maintenir le contact visuel, utiliser un vocabulaire accessible",
    piege: "Négliger l'importance de la communication non-verbale",
    mnemo: "COMMUNICATION = Cohérence + Objectifs + Médical + Mots + Uniformité + Nuances + Intelligence + Clarté + Adaptation + Thérapeutique + Information + Occasionnel + Neutralité",
    subtilite: "La cohérence entre verbal et non-verbal est cruciale",
    application: "Travailler consciemment sur tous les aspects de la communication",
    vigilance: "Surveiller ses propres signaux non-verbaux et leur impact"
  },
  {
    concept: "Enjeux et modalités de l'annonce d'une mauvaise nouvelle en santé",
    definition: "Processus structuré d'annonce diagnostique incluant préparation, information progressive, soutien et suivi",
    exemple: "Annonce de cancer selon protocole SPIKES : Setting, Perception, Invitation, Knowledge, Emotions, Strategy",
    piege: "Délivrer l'information d'un seul coup sans préparation ni soutien",
    mnemo: "ANNONCE = Avant + Nécessité + Neutralité + Objectifs + Nuances + Compréhension + Empathie",
    subtilite: "L'annonce est un processus en plusieurs étapes, pas un événement unique",
    application: "Structurer toute annonce difficile selon les étapes validées",
    vigilance: "Adapter le rythme et le contenu aux réactions du patient"
  }
];

// Pas de concepts Rang B pour l'item IC-1 selon E-LiSA
export const conceptsRangBIC1: any[] = [];

export const colonnesConfigIC1 = [
  { nom: 'Connaissance Fondamentale', couleur: 'bg-blue-700', couleurCellule: 'bg-blue-50', couleurTexte: 'text-blue-900 font-bold' },
  { nom: 'Définition Officielle E-LiSA', couleur: 'bg-green-700', couleurCellule: 'bg-green-50', couleurTexte: 'text-green-800' },
  { nom: 'Exemple Concret Précis', couleur: 'bg-purple-600', couleurCellule: 'bg-purple-50', couleurTexte: 'text-purple-800' },
  { nom: 'Piège Fréquent À Éviter', couleur: 'bg-red-600', couleurCellule: 'bg-red-50', couleurTexte: 'text-red-800 font-semibold' },
  { nom: 'Moyen Mnémotechnique', couleur: 'bg-yellow-600', couleurCellule: 'bg-yellow-50', couleurTexte: 'text-yellow-800 italic' },
  { nom: 'Subtilité Importante', couleur: 'bg-indigo-600', couleurCellule: 'bg-indigo-50', couleurTexte: 'text-indigo-800 font-medium' },
  { nom: 'Application Pratique', couleur: 'bg-teal-600', couleurCellule: 'bg-teal-50', couleurTexte: 'text-teal-800' },
  { nom: 'Point de Vigilance', couleur: 'bg-orange-600', couleurCellule: 'bg-orange-50', couleurTexte: 'text-orange-800 font-medium' }
];
