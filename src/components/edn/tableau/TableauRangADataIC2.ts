
// Données spécifiques pour l'item IC-2 : Valeurs professionnelles
export const conceptsRangAIC2 = [
  {
    concept: "Déontologie médicale",
    definition: "Ensemble des règles et devoirs régissant l'exercice médical, la pratique médicale, et les rapports individuels vis-à-vis des malades et confrères",
    exemple: "Code de déontologie médicale écrit par l'ONM, soumis au Conseil d'État et au Parlement",
    piege: "Ne pas confondre déontologie (règles profession) et éthique (réflexion sur l'action)",
    mnemo: "DÉONTO = Devoirs + Éthique + ONM + Textes + Obligations",
    subtilite: "Contient l'ensemble des articles organisant la déontologie médicale",
    application: "Principes applicables dans toutes les situations professionnelles",
    vigilance: "Éviter conflit entre valeurs personnelles et obligations déontologiques"
  },
  {
    concept: "Principes déontologiques fondamentaux",
    definition: "9 principes essentiels : respect personne/vie humaine, secret professionnel, liberté du malade, porter secours, responsabilité, indépendance, exercice sans discrimination, compétence, confraternité",
    exemple: "Information loyale claire appropriée + consentement éclairé du patient",
    piege: "Ne pas hiérarchiser arbitrairement ces principes - tous sont fondamentaux",
    mnemo: "RESPECT = Responsabilité + Expertise + Secret + Porter secours + Éthique + Compétence + Transparence",
    subtilite: "Même après la mort, ne pas nuire au respect de la personne",
    application: "Chaque acte médical doit respecter ces 9 principes simultanément",
    vigilance: "Attention aux situations où plusieurs principes peuvent entrer en tension"
  },
  {
    concept: "4 grands principes éthiques",
    definition: "1-Ne jamais nuire 2-Bienfaisance (bien-être patients) 3-Autonomie patient (information+choix traitement) 4-Justice (soins équitables selon conditions)",
    exemple: "Respecter l'autonomie = informer le patient pour qu'il choisisse son traitement",
    piege: "Ne pas imposer sa vision du 'bien' au patient - respecter son autonomie",
    mnemo: "BANJ = Bienfaisance + Autonomie + Ne pas Nuire + Justice",
    subtilite: "Veille au maintien des principes de moralité, probité et dévouement",
    application: "Grille d'analyse pour toute décision médicale complexe",
    vigilance: "Équilibrer bienfaisance et autonomie selon la situation clinique"
  },
  {
    concept: "Organisation socio-politique médecine",
    definition: "Liberté du médecin encadrée par dispositifs : financier (tarifs secteur 1/2), contrôle prescriptions, vérification soins, obligation développement professionnel continu",
    exemple: "Contrôle des prescriptions avec ordonnance sécurisée, tarification selon secteur",
    piege: "Croire que la liberté médicale est absolue - elle est encadrée par la régulation",
    mnemo: "RÉGUL = Régulation + Évaluation + Garantie + Uniformisation + Liberté encadrée",
    subtilite: "HAS crée et diffuse recommandations bonnes pratiques + obligations DPC",
    application: "Exercice médical dans le cadre légal et réglementaire français",
    vigilance: "Concilier liberté thérapeutique et respect des recommandations"
  },
  {
    concept: "Autres professions de santé",
    definition: "Confraternité avec autres professionnels : assistance dans l'adversité, recherche conciliation en cas différends, informer médecins traitants, entretenir bons rapports",
    exemple: "Collaboration médecin-pharmacien pour vérification ordonnance douteuse",
    piege: "Négliger l'importance de la collaboration interprofessionnelle",
    mnemo: "COLLAB = Coordination + Ouverture + Liaison + Loyauté + Assistance + Bienveillance",
    subtilite: "Garantir respect indépendance professionnelle des autres professions",
    application: "Travail en équipe pluridisciplinaire coordonnée et respectueuse",
    vigilance: "Éviter les conflits de compétences entre professions"
  },
  {
    concept: "Ordres professionnels",
    definition: "3 niveaux : 1-Départemental (inscription, sanctions, conciliation, surveillance déontologie, information) 2-Régional 3-National (rôle moral consultatif, appel décisions)",
    exemple: "Inscription obligatoire au tableau de l'Ordre pour exercer la médecine",
    piege: "Confondre les niveaux de compétence des différents échelons",
    mnemo: "ORD-DRN = Ordre = Départemental + Régional + National",
    subtilite: "Veillent au maintien principes moralité, probité, compétence indispensables",
    application: "Encadrement et régulation de l'exercice professionnel médical",
    vigilance: "Respecter les procédures disciplinaires et les recours possibles"
  },
  {
    concept: "Médecine fondée sur preuves",
    definition: "EBM = Evidence Based Medicine : preuves scientifiques actuelles + expérience personnelle + préférences/valeurs patient + compétences pratiques patient",
    exemple: "Décision thérapeutique intégrant données science + vécu patient + capacités",
    piege: "Réduire l'EBM aux seules données scientifiques sans dimension humaine",
    mnemo: "EBM-4 = Evidence + Expérience + Écoute + Efficience",
    subtilite: "Médecine de responsabilité intégrant expérience quotidienne maladie",
    application: "Approche décisionnelle structurée pour optimiser les soins",
    vigilance: "Ne pas opposer science et humanisme - les intégrer harmonieusement"
  },
  {
    concept: "Régulation étatique moderne",
    definition: "Régulation dépenses santé, remise en question autonomie, qualité soins évaluation, efficience, équilibre individuel/public, coût/risques traitements",
    exemple: "Évaluation coût-efficacité des traitements par les instances de santé",
    piege: "Ignorer les contraintes économiques de santé publique",
    mnemo: "RÉGUL-ÉCO = Régulation + Évaluation + Coût + Utilité + Limitation",
    subtilite: "Justification de la régulation par les enjeux de santé publique",
    application: "Exercice responsable tenant compte des ressources collectives",
    vigilance: "Concilier intérêt individuel du patient et enjeux collectifs"
  }
];

export const colonnesConfigIC2 = [
  { nom: 'Concept Professionnel', couleur: 'bg-blue-700', couleurCellule: 'bg-blue-50', couleurTexte: 'text-blue-900 font-bold' },
  { nom: 'Définition Déontologique', couleur: 'bg-green-700', couleurCellule: 'bg-green-50', couleurTexte: 'text-green-800' },
  { nom: 'Exemple Pratique', couleur: 'bg-purple-600', couleurCellule: 'bg-purple-50', couleurTexte: 'text-purple-800' },
  { nom: 'Piège Déontologique', couleur: 'bg-red-600', couleurCellule: 'bg-red-50', couleurTexte: 'text-red-800 font-semibold' },
  { nom: 'Moyen Mnémotechnique', couleur: 'bg-yellow-600', couleurCellule: 'bg-yellow-50', couleurTexte: 'text-yellow-800 italic' },
  { nom: 'Subtilité Réglementaire', couleur: 'bg-indigo-600', couleurCellule: 'bg-indigo-50', couleurTexte: 'text-indigo-800 font-medium' },
  { nom: 'Application Professionnelle', couleur: 'bg-teal-600', couleurCellule: 'bg-teal-50', couleurTexte: 'text-teal-800' },
  { nom: 'Point de Vigilance', couleur: 'bg-orange-600', couleurCellule: 'bg-orange-50', couleurTexte: 'text-orange-800 font-medium' }
];
