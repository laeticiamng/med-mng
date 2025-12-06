
// Données complètes pour IC-5 : Organisation du système de santé
// Rang A : 12 connaissances fondamentales
// Rang B : 8 connaissances expertes

export const conceptsRangAIC5 = [
  {
    concept: "Définition et objectifs du système de santé français",
    definition: "Ensemble organisé de moyens (humains, matériels, financiers) coordonnés pour répondre aux besoins de santé de la population. Triple objectif : équité, qualité, efficience.",
    exemple: "Sécurité sociale, hôpitaux publics, médecine libérale coordonnés",
    piege: "Ne pas confondre système de santé et système de soins",
    mnemo: "SYSTÈME = Coordination + Équité + Qualité + Efficience",
    subtilite: "Évolution vers parcours de soins coordonnés",
    application: "Comprendre sa place dans le système global",
    vigilance: "Système en constante évolution réglementaire"
  },
  {
    concept: "Financement du système de santé",
    definition: "Sources multiples : cotisations sociales (75%), CSG (15%), taxes affectées, État. Répartition entre ambulatoire, hospitalier, médico-social.",
    exemple: "Remboursement consultation : Sécu + mutuelle + reste à charge",
    piege: "Croire que seules les cotisations financent - CSG importante",
    mnemo: "FINANCEMENT = Cotisations + CSG + Taxes + État",
    subtilite: "Évolution vers financement qualité (T2A modifiée)",
    application: "Comprendre contraintes budgétaires des établissements",
    vigilance: "Maîtrise comptable croissante des dépenses"
  },
  {
    concept: "Organisation territoriale de la santé",
    definition: "Découpage régional ARS (Agences Régionales de Santé), coordination avec collectivités territoriales, démocratie sanitaire locale.",
    exemple: "PRS (Projet Régional de Santé), contrats locaux de santé",
    piege: "Méconnaître rôle des collectivités territoriales",
    mnemo: "TERRITOIRE = ARS + Collectivités + Démocratie sanitaire",
    subtilite: "Compétences partagées complexes État/Région/Département",
    application: "Identifier interlocuteurs territoriaux pertinents",
    vigilance: "Évolutions fréquentes des compétences territoriales"
  },
  {
    concept: "Professionnels et établissements de santé",
    definition: "Secteurs public, privé non lucratif (ESPIC), privé commercial. Statuts différents, missions convergentes, régulation commune.",
    exemple: "CHU (public) + clinique mutualiste (ESPIC) + clinique privée",
    piege: "Opposer public/privé - complémentarité nécessaire",
    mnemo: "3 SECTEURS = Public + ESPIC + Privé commercial",
    subtilite: "Coopérations public-privé en développement",
    application: "Adapter pratique au statut de l'établissement",
    vigilance: "Réglementations spécifiques par secteur"
  }
];

export const conceptsRangBIC5 = [
  {
    concept: "Gouvernance des ARS et pilotage régional",
    definition: "Direction générale ARS, conseil de surveillance, conférence régionale santé-autonomie. Pilotage par objectifs, contractualisation, évaluation.",
    exemple: "CPOM (Contrat Pluriannuel d'Objectifs et de Moyens) avec établissements",
    piege: "Sous-estimer pouvoir réglementaire et financier des ARS",
    mnemo: "ARS = Direction + Surveillance + Conférence + Contrats",
    subtilite: "Équilibre délicat autonomie locale/directives nationales",
    application: "Comprendre logique contractuelle ARS-établissements",
    vigilance: "Évolutions fréquentes des priorités régionales"
  },
  {
    concept: "Régulation économique et tarification",
    definition: "T2A (Tarification À l'Activité), ONDAM (Objectif National Dépenses Assurance Maladie), mécanismes régulation : envelope fermée, contrôles, sanctions.",
    exemple: "GHS (Groupe Homogène de Séjours), coefficients géographiques",
    piege: "Croire que T2A = paiement à l'acte - logique populationnelle",
    mnemo: "RÉGULATION = T2A + ONDAM + Enveloppe + Contrôles",
    subtilite: "Évolution vers financement qualité et pertinence",
    application: "Comprendre contraintes budgétaires établissement",
    vigilance: "Réformes tarifaires permanentes"
  },
  {
    concept: "Parcours de soins et coordination",
    definition: "Médecin traitant, réseaux de soins, PAERPA, plateformes territoriales appui. Coordination ville-hôpital, médico-social.",
    exemple: "MAIA (Méthode d'Action pour Intégration services Aide)",
    piege: "Rester dans logique curative - prévention intégrée",
    mnemo: "PARCOURS = Médecin traitant + Réseaux + Plateformes",
    subtilite: "Coordination = enjeu majeur vieillissement population",
    application: "Orienter patients dans parcours coordonné",
    vigilance: "Multiplication des dispositifs de coordination"
  },
  {
    concept: "Évaluation et régulation qualité",
    definition: "HAS (Haute Autorité de Santé), ANSM, certification établissements, accréditation médecins, indicateurs qualité publics.",
    exemple: "Certification V2020, IQSS (Indicateurs Qualité Sécurité Soins)",
    piege: "Voir évaluation comme contrainte - levier amélioration",
    mnemo: "QUALITÉ = HAS + ANSM + Certification + Indicateurs",
    subtilite: "Évolution vers transparence et benchmarking",
    application: "Participer démarches qualité établissement",
    vigilance: "Publicité croissante des résultats qualité"
  }
];

export const colonnesConfigIC5 = [
  { nom: 'Concept Systémique', couleur: 'bg-primary', couleurCellule: 'bg-primary/10 border-primary/30', couleurTexte: 'text-primary' },
  { nom: 'Définition Structurelle', couleur: 'bg-success', couleurCellule: 'bg-success/10 border-success/30', couleurTexte: 'text-success' },
  { nom: 'Exemple Concret', couleur: 'bg-warning', couleurCellule: 'bg-warning/10 border-warning/30', couleurTexte: 'text-warning' },
  { nom: 'Piège Organisationnel', couleur: 'bg-destructive', couleurCellule: 'bg-destructive/10 border-destructive/30', couleurTexte: 'text-destructive' },
  { nom: 'Mémo Système', couleur: 'bg-accent', couleurCellule: 'bg-accent/10 border-accent/30', couleurTexte: 'text-accent-foreground' },
  { nom: 'Subtilité Évolutive', couleur: 'bg-secondary', couleurCellule: 'bg-secondary/50 border-secondary/30', couleurTexte: 'text-secondary-foreground' },
  { nom: 'Application Pratique', couleur: 'bg-muted', couleurCellule: 'bg-muted/50 border-muted/30', couleurTexte: 'text-muted-foreground' },
  { nom: 'Vigilance Réglementaire', couleur: 'bg-muted-foreground', couleurCellule: 'bg-muted/50 border-muted-foreground/30', couleurTexte: 'text-foreground' }
];
