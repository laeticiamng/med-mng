import { format } from 'date-fns';

export const TOTAL_ITEM_COUNT = 367;

export type DifficultyLevel = 'Fondamental' | 'Intermédiaire' | 'Avancé';

export interface ItemResource {
  type: 'guide' | 'video' | 'fiche' | 'podcast';
  label: string;
  url: string;
}

export interface ItemData {
  id: string; // 3-digit identifier (001)
  code: string; // IC-001
  title: string;
  summary: string;
  specialty: string;
  domain: string;
  theme: string;
  focus: string;
  scenario: string;
  keywords: string[];
  difficulty: DifficultyLevel;
  estimatedStudyTimeMinutes: number;
  lastUpdated: string; // ISO string
  objectives: string[];
  rankACompetences: string[];
  rankBCompetences: string[];
  clinicalPearls: string[];
  redFlags: string[];
  keySteps: string[];
  evaluation: {
    qcm: number;
    dossiers: number;
    ecos: number;
    successRate: number;
  };
  recommendedResources: ItemResource[];
}

type SpecialtyBlueprint = {
  name: string;
  domain: string;
  focus: string;
  scenario: string;
  keywords: string[];
};

type KnowledgeTheme = {
  title: string;
  summary: string;
  coreObjectives: string[];
  advancedObjectives: string[];
  steps: string[];
};

type PracticeAngle = {
  context: string;
  actions: string[];
  pearls: string[];
  redFlags: string[];
};

type EvaluationProfile = {
  qcm: number;
  dossiers: number;
  ecos: number;
  successRate: number;
  level: DifficultyLevel;
};

const specialties: SpecialtyBlueprint[] = [
  {
    name: 'Cardiologie',
    domain: 'Appareil cardiovasculaire',
    focus: 'insuffisance cardiaque et syndromes coronariens',
    scenario: "Patient de 68 ans consultant pour dyspnée d'effort et douleurs thoraciques atypiques",
    keywords: ['cardiologie', 'ECG', 'insuffisance cardiaque', 'coronaropathie'],
  },
  {
    name: 'Pneumologie',
    domain: 'Appareil respiratoire',
    focus: 'asthme, BPCO et infections respiratoires basses',
    scenario: "Patient de 45 ans avec toux chronique, dyspnée et antécédents tabagiques",
    keywords: ['pneumologie', 'asthme', 'BPCO', 'spirométrie'],
  },
  {
    name: 'Neurologie',
    domain: 'Système nerveux central',
    focus: 'AVC, épilepsie et syndromes neurovasculaires',
    scenario: "Arrivée aux urgences pour déficit moteur brutal et troubles de la parole",
    keywords: ['neurologie', 'AVC', 'IRM', 'urgence neuro'],
  },
  {
    name: 'Gastro-entérologie',
    domain: 'Appareil digestif',
    focus: 'pathologies inflammatoires et hémorragies digestives',
    scenario: "Consultation pour rectorragies récidivantes chez un patient de 52 ans",
    keywords: ['gastro', 'rectorragie', 'endoscopie', 'maladies inflammatoires'],
  },
  {
    name: 'Endocrinologie',
    domain: 'Métabolisme et hormones',
    focus: 'diabète, thyroïde et obésité',
    scenario: "Patiente de 34 ans avec troubles du cycle et prise de poids inexpliquée",
    keywords: ['endocrinologie', 'diabète', 'thyroïde', 'métabolisme'],
  },
  {
    name: 'Infectiologie',
    domain: 'Maladies infectieuses',
    focus: 'sepsis, infections communautaires et nosocomiales',
    scenario: "Fièvre prolongée après un retour de zone tropicale avec signes de choc septique",
    keywords: ['infectiologie', 'sepsis', 'antibiothérapie', 'isolement'],
  },
  {
    name: 'Pédiatrie',
    domain: 'Médecine de l’enfant',
    focus: 'pathologies aiguës du nourrisson et prévention',
    scenario: "Nourrisson de 3 mois présentant fièvre et refus de s'alimenter",
    keywords: ['pédiatrie', 'vaccination', 'urgence pédiatrique', 'développement'],
  },
  {
    name: 'Gynécologie-obstétrique',
    domain: 'Santé de la femme',
    focus: 'grossesse pathologique et urgences gynécologiques',
    scenario: "Suivi d'une grossesse à risque avec douleurs pelviennes et métrorragies",
    keywords: ['gynécologie', 'obstétrique', 'grossesse', 'urgences gynéco'],
  },
  {
    name: 'Dermatologie',
    domain: 'Peau et annexes',
    focus: 'dermatoses inflammatoires et infections cutanées',
    scenario: "Adolescent avec poussée sévère de dermatite atopique et surinfection",
    keywords: ['dermatologie', 'eczéma', 'dermatite', 'infections cutanées'],
  },
  {
    name: 'Néphrologie',
    domain: 'Fonction rénale',
    focus: 'insuffisance rénale et troubles hydro-électrolytiques',
    scenario: "Patient dialysé présentant hyperkaliémie et signes d'instabilité hémodynamique",
    keywords: ['néphrologie', 'dialyse', 'hyperkaliémie', 'fonction rénale'],
  },
  {
    name: 'Rhumatologie',
    domain: 'Appareil locomoteur',
    focus: 'polyarthrite, lombalgies inflammatoires et pathologies microcristallines',
    scenario: "Femme de 56 ans présentant douleurs articulaires matinales et raideur prolongée",
    keywords: ['rhumatologie', 'polyarthrite', 'lombalgie', 'arthrite'],
  },
  {
    name: 'Urgences',
    domain: 'Médecine d’urgence',
    focus: 'triage, gestes vitaux et situations critiques',
    scenario: "Prise en charge initiale d'un polytraumatisé instable après accident de la route",
    keywords: ['urgences', 'polytraumatisme', 'réanimation', 'gestes vitaux'],
  },
];

const knowledgeThemes: KnowledgeTheme[] = [
  {
    title: 'diagnostic initial structuré',
    summary: "Développer une démarche diagnostique exhaustive en intégrant anamnèse, score clinique et examens prioritaires.",
    coreObjectives: [
      "Collecter les éléments sémiologiques discriminants et les facteurs de risque majeurs.",
      "Identifier les diagnostics différentiels incontournables selon le contexte.",
      "Prioriser les examens complémentaires à fort rendement diagnostique.",
      "Adapter l'annonce diagnostique et la communication avec le patient et son entourage.",
    ],
    advancedObjectives: [
      "Utiliser les scores décisionnels ou algorithmes validés pour affiner la stratégie diagnostique.",
      "Coordonner le parcours de soins avec les spécialistes et structures d'urgence.",
      "Interpréter les examens d'imagerie et biologiques complexes en situation instable.",
      "Anticiper les complications précoces nécessitant une surveillance rapprochée.",
    ],
    steps: [
      "Hiérarchiser les hypothèses en fonction de la gravité potentielle.",
      "Valider les examens complémentaires indispensables avant d'initier un traitement.",
      "Documenter la démarche diagnostique et tracer les décisions clés dans le dossier patient.",
    ],
  },
  {
    title: 'stratégie thérapeutique graduée',
    summary: "Structurer une prise en charge médicamenteuse et non médicamenteuse progressive selon les recommandations nationales.",
    coreObjectives: [
      "Évaluer les critères de gravité imposant un traitement immédiat.",
      "Sélectionner les thérapeutiques de première intention adaptées au profil du patient.",
      "Planifier l'escalade thérapeutique en cas de non-réponse ou d'effets indésirables.",
      "Mettre en place une éducation thérapeutique centrée sur l'observance et l'autosurveillance.",
    ],
    advancedObjectives: [
      "Optimiser les posologies chez les sujets âgés, insuffisants rénaux ou femmes enceintes.",
      "Intégrer les innovations thérapeutiques et indications de seconde ligne.",
      "Coordonner la prise en charge avec les réseaux de soins ou équipes spécialisées.",
      "Organiser le suivi biologique et clinique post-initiation du traitement.",
    ],
    steps: [
      "Vérifier les interactions médicamenteuses et contre-indications individuelles.",
      "Documenter les objectifs thérapeutiques et critères d'efficacité.",
      "Programmer le suivi et les consultations de contrôle à court et moyen termes.",
    ],
  },
  {
    title: 'prévention et dépistage ciblé',
    summary: "Mettre en œuvre une stratégie de prévention primaire et secondaire fondée sur les preuves.",
    coreObjectives: [
      "Identifier les populations à haut risque justifiant un dépistage structuré.",
      "Adapter les recommandations vaccinales et mesures hygiéno-diététiques.",
      "Construire un plan de prévention individualisé et évalué.",
      "Mobiliser les ressources communautaires et éducatives.",
    ],
    advancedObjectives: [
      "Évaluer l'impact médico-économique d'un programme de dépistage.",
      "Intégrer la prévention tertiaire dans les parcours de soins chroniques.",
      "Déployer des outils numériques pour le suivi et l'engagement du patient.",
      "Conduire des consultations de prévention complexes (ado, femme enceinte, senior).",
    ],
    steps: [
      "Personnaliser le calendrier de dépistage selon les facteurs génétiques et environnementaux.",
      "Assurer la traçabilité des interventions préventives et leur réévaluation périodique.",
      "Mesurer l'adhésion du patient et lever les freins comportementaux identifiés.",
    ],
  },
  {
    title: 'prise en charge des urgences vitales',
    summary: "Stabiliser un patient en situation critique en appliquant les protocoles de médecine d'urgence.",
    coreObjectives: [
      "Reconnaître immédiatement les détresses vitales et engager les gestes prioritaires.",
      "Initier la sécurisation des voies aériennes, de la ventilation et de la circulation.",
      "Adapter la stratégie thérapeutique aux ressources disponibles sur site.",
      "Organiser le transfert ou la surveillance en unité adaptée.",
    ],
    advancedObjectives: [
      "Superviser une équipe pluridisciplinaire en contexte de choc ou polytraumatisme.",
      "Interpréter les paramètres de monitorage avancé pour guider la thérapeutique.",
      "Mettre en œuvre des protocoles de sédation, analgésie et immobilisation.",
      "Garantir la sécurité du patient lors des transports inter-hospitaliers.",
    ],
    steps: [
      "Appliquer les algorithmes ACLS/ATLS adaptés au contexte clinique.",
      "Tracer les temps clés de prise en charge pour l'analyse qualité.",
      "Débriefer avec l'équipe pour optimiser les procédures d'urgence.",
    ],
  },
  {
    title: 'suivi longitudinal et coordination de soins',
    summary: "Assurer une continuité de prise en charge intégrant médecins spécialistes, ville-hôpital et équipes paramédicales.",
    coreObjectives: [
      "Structurer un plan de soins partagé avec objectifs court, moyen et long termes.",
      "Mettre en place des outils de télésuivi et des indicateurs d'alerte.",
      "Coordonner les acteurs du parcours (médecin traitant, infirmier, spécialiste).",
      "Anticiper les besoins médico-sociaux et aides techniques.",
    ],
    advancedObjectives: [
      "Animer des réunions de concertation pluridisciplinaires orientées patient.",
      "Mesurer l'impact qualité de vie et réadapter le projet thérapeutique.",
      "Initier des programmes de réhabilitation ou de réentrainement adaptés.",
      "Intégrer la dimension éthique et l'accompagnement des aidants.",
    ],
    steps: [
      "Formaliser un plan personnalisé de soins et de coordination.",
      "Suivre les indicateurs d'adhésion thérapeutique et de réhospitalisation.",
      "Evaluer régulièrement les besoins d'éducation thérapeutique complémentaire.",
    ],
  },
  {
    title: 'analyse des complications et iatrogénie',
    summary: "Identifier, prévenir et gérer les complications liées aux traitements ou à la pathologie.",
    coreObjectives: [
      "Mettre en place une surveillance clinique et biologique ciblée.",
      "Reconnaître précocement les complications fréquentes et sévères.",
      "Adapter le traitement en fonction de la tolérance individuelle.",
      "Informer le patient des signes d'alerte nécessitant une consultation urgente.",
    ],
    advancedObjectives: [
      "Analyser un événement indésirable médicamenteux complexe.",
      "Piloter une démarche qualité-sécurité sur le parcours patient concerné.",
      "Coordonner la déclaration réglementaire et la traçabilité institutionnelle.",
      "Mettre en œuvre une stratégie de rattrapage thérapeutique sécurisée.",
    ],
    steps: [
      "Prioriser les examens permettant d'identifier la complication suspectée.",
      "Documenter l'arbre décisionnel ayant conduit à l'événement.",
      "Partager le retour d'expérience avec l'équipe pour prévenir la récidive.",
    ],
  },
  {
    title: 'communication et éducation thérapeutique',
    summary: "Construire un dialogue patient-médecin efficace et engager le patient dans son projet de soins.",
    coreObjectives: [
      "Évaluer les représentations du patient et ses attentes.",
      "Utiliser des outils d'entretien motivationnel adaptés.",
      "Co-construire un plan d'action réaliste et mesurable.",
      "Évaluer la compréhension et l'appropriation du plan de soins.",
    ],
    advancedObjectives: [
      "Animer des ateliers collectifs ou des parcours d'éducation thérapeutique.",
      "Adapter la communication aux situations sensibles (annonce, mauvaise observance, plurilinguisme).",
      "Impliquer les aidants et réseau familial dans la prise en charge.",
      "Mesurer l'impact de l'éducation thérapeutique sur les indicateurs cliniques.",
    ],
    steps: [
      "Choisir les supports pédagogiques adaptés au niveau de littératie du patient.",
      "Définir les indicateurs de suivi partagés (auto-mesures, carnets de bord).",
      "Organiser la réévaluation de l'alliance thérapeutique à chaque étape clé.",
    ],
  },
  {
    title: 'démarche éthique et décision partagée',
    summary: "Intégrer l'éthique clinique et la décision partagée dans les situations médicales complexes.",
    coreObjectives: [
      "Identifier les situations à enjeux éthiques majeurs.",
      "Faciliter la décision partagée en intégrant valeurs et préférences du patient.",
      "Animer une discussion collégiale en cas de désaccord thérapeutique.",
      "Documenter la décision et assurer sa traçabilité.",
    ],
    advancedObjectives: [
      "Mettre en place une consultation d'annonce complexe pluridisciplinaire.",
      "Co-construire un projet de soins anticipé.",
      "Prendre en compte les directives anticipées et la personne de confiance.",
      "Accompagner l'équipe soignante face aux dilemmes éthiques répétés.",
    ],
    steps: [
      "Évaluer l'autonomie décisionnelle et le discernement du patient.",
      "Clarifier les objectifs de soins et le rapport bénéfice/risque.",
      "Planifier un temps de réévaluation de la décision au cours du suivi.",
    ],
  },
];

const practiceAngles: PracticeAngle[] = [
  {
    context: 'stabilisation en urgence',
    actions: [
      "Appliquer l'approche ABCDE pour sécuriser les fonctions vitales.",
      "Mettre en œuvre les protocoles de perfusion, oxygénation et monitorage avancé.",
      "Préparer une stratégie de transfert vers une unité de soins intensifs si nécessaire.",
    ],
    pearls: [
      "Toujours vérifier la réévaluation clinique 10 minutes après chaque geste critique.",
      "Anticiper le besoin d'accès vasculaire difficile avec un plan B.",
      "Préparer les antidotes spécifiques lors de traitements à marge thérapeutique étroite.",
    ],
    redFlags: [
      'Altération rapide de la conscience',
      'Hypotension persistante malgré remplissage',
      'Signes de défaillance multiviscérale',
    ],
  },
  {
    context: 'prise en charge ambulatoire coordonnée',
    actions: [
      "Structurer un plan de suivi partagé avec le médecin traitant.",
      "Programmer les examens de contrôle à distance et téléconsultations.",
      "Mettre en place une surveillance des effets indésirables via un carnet patient.",
    ],
    pearls: [
      "Favoriser l'automesure et l'envoi sécurisé de données par le patient.",
      "Impliquer un éducateur thérapeutique pour consolider les apprentissages.",
      "Valoriser le binôme patient-aidant dans la mise en œuvre du traitement.",
    ],
    redFlags: [
      'Perte de suivi ou observance < 50 %',
      'Apparition de symptômes nouveaux inexpliqués',
      'Détérioration du score d’autonomie ou chutes répétées',
    ],
  },
  {
    context: 'prise en charge hospitalière pluridisciplinaire',
    actions: [
      "Coordonner les avis spécialisés en 24 heures.",
      "Déployer des réunions de concertation pluridisciplinaires rapides.",
      "Organiser la sortie avec un plan de soins anticipé.",
    ],
    pearls: [
      "Documenter systématiquement le plan de soins partagé dans le DPI.",
      "Utiliser des check-lists de transfert pour sécuriser la transition ville-hôpital.",
      "Associer le patient à la réunion d'annonce quand c'est possible.",
    ],
    redFlags: [
      'Manque de référent identifié pour le patient',
      'Absence de plan de sortie clair à J-2',
      'Non réalisation des examens indispensables avant la sortie',
    ],
  },
  {
    context: 'situation de santé publique et dépistage',
    actions: [
      "Organiser une campagne locale de dépistage ciblée.",
      "Mettre en place un suivi des indicateurs populationnels.",
      "Impliquer les partenaires institutionnels et associatifs.",
    ],
    pearls: [
      "Adapter la communication aux populations vulnérables.",
      "Mesurer la satisfaction et l'adhésion via des outils numériques.",
      "Partager les résultats avec les autorités de santé pour ajustements.",
    ],
    redFlags: [
      'Taux de participation < 30 %',
      'Retours négatifs répétés sur l’organisation',
      'Absence de relais pour les cas positifs identifiés',
    ],
  },
  {
    context: 'accompagnement en maladies chroniques',
    actions: [
      "Élaborer un programme d'éducation thérapeutique personnalisé.",
      "Mettre en place des outils de suivi numérique et alertes précoces.",
      "Co-construire des objectifs SMART revisités à chaque consultation.",
    ],
    pearls: [
      "Toujours vérifier la compréhension via la méthode teach-back.",
      "Valoriser les progrès et petits succès pour renforcer l'engagement.",
      "Intégrer les aidants dans l'évaluation des objectifs.",
    ],
    redFlags: [
      'Décrochage dans le suivi > 6 semaines',
      'Non atteinte répétée des objectifs majeurs',
      'Signes de lassitude ou de détresse émotionnelle',
    ],
  },
  {
    context: 'gestion des risques et qualité des soins',
    actions: [
      "Analyser les événements indésirables associés à la prise en charge.",
      "Mettre en œuvre un plan d'amélioration avec indicateurs de suivi.",
      "Former l'équipe aux procédures mises à jour et aux retours d'expérience.",
    ],
    pearls: [
      "Toujours associer un patient partenaire aux revues de morbi-mortalité.",
      "Documenter les mesures correctives dans un plan d'action daté.",
      "Diffuser les enseignements via un format court (infographie, podcast).",
    ],
    redFlags: [
      'Répétition du même événement indésirable',
      'Absence de retour d’expérience partagé à l’équipe',
      'Difficulté à identifier un pilote pour les actions correctives',
    ],
  },
];

const evaluationProfiles: EvaluationProfile[] = [
  { qcm: 12, dossiers: 3, ecos: 1, successRate: 82, level: 'Fondamental' },
  { qcm: 15, dossiers: 4, ecos: 2, successRate: 76, level: 'Intermédiaire' },
  { qcm: 18, dossiers: 5, ecos: 2, successRate: 71, level: 'Avancé' },
  { qcm: 10, dossiers: 2, ecos: 1, successRate: 88, level: 'Fondamental' },
  { qcm: 14, dossiers: 4, ecos: 2, successRate: 79, level: 'Intermédiaire' },
  { qcm: 20, dossiers: 5, ecos: 3, successRate: 68, level: 'Avancé' },
];

const baseUpdatedAt = new Date('2025-01-05T08:00:00Z').getTime();

const selectFrom = <T,>(values: T[], index: number, offset = 0) => {
  return values[(index + offset) % values.length];
};

const formatId = (value: number) => value.toString().padStart(3, '0');

export const getAllItemIds = (): string[] =>
  Array.from({ length: TOTAL_ITEM_COUNT }, (_, i) => formatId(i + 1));

export const getItemById = (id: string): ItemData | null => {
  if (!/^\d{3}$/.test(id)) {
    return null;
  }
  const index = Number.parseInt(id, 10) - 1;
  if (Number.isNaN(index) || index < 0 || index >= TOTAL_ITEM_COUNT) {
    return null;
  }
  return buildItem(index);
};

const buildObjectives = (base: string[], addition: string) => {
  const objectives = [...base];
  objectives.push(addition);
  return objectives;
};

const buildItem = (index: number): ItemData => {
  const id = formatId(index + 1);
  const code = `IC-${id}`;
  const specialty = selectFrom(specialties, index);
  const knowledge = selectFrom(knowledgeThemes, index);
  const practice = selectFrom(practiceAngles, index);
  const evaluation = selectFrom(evaluationProfiles, index);

  const focusKeyword = specialty.focus.split(' ')[0];
  const theme = knowledge.title;

  const summary = [
    `${code} – ${specialty.name}. ${knowledge.summary}`,
    `Contexte privilégié : ${practice.context}.`,
    `Objectif : sécuriser la prise en charge ${specialty.focus}.`,
  ].join(' ');

  const estimatedStudyTimeMinutes = 18 + ((index % 6) * 4);
  const updatedAt = new Date(baseUpdatedAt + index * 86_400_000);

  const objectives = buildObjectives(
    knowledge.coreObjectives,
    `Adapter la stratégie ${theme} aux situations de ${practice.context}.`
  );

  const rankACompetences = [
    ...knowledge.steps,
    `Consolider la communication patient autour du thème « ${theme} ».`,
  ];

  const rankBCompetences = [
    ...knowledge.advancedObjectives.slice(0, 3),
    `Conduire les actions clés : ${practice.actions.join(' / ')}.`,
  ];

  const title = `${specialty.name} · ${theme.charAt(0).toUpperCase()}${theme.slice(1)} (${code})`;

  return {
    id,
    code,
    title,
    summary,
    specialty: specialty.name,
    domain: specialty.domain,
    theme,
    focus: focusKeyword,
    scenario: specialty.scenario,
    keywords: Array.from(new Set([
      code,
      theme,
      focusKeyword,
      ...specialty.keywords,
      ...practice.actions.map((action) => action.split(' ')[0].toLowerCase()),
    ])).slice(0, 10),
    difficulty: evaluation.level,
    estimatedStudyTimeMinutes,
    lastUpdated: updatedAt.toISOString(),
    objectives,
    rankACompetences,
    rankBCompetences,
    clinicalPearls: practice.pearls,
    redFlags: practice.redFlags,
    keySteps: practice.actions,
    evaluation: {
      qcm: evaluation.qcm,
      dossiers: evaluation.dossiers,
      ecos: evaluation.ecos,
      successRate: evaluation.successRate,
    },
    recommendedResources: [
      {
        type: 'guide',
        label: `Guide clinique ${specialty.name}`,
        url: `https://med-mng.com/resources/${id}/guide-clinique`,
      },
      {
        type: 'video',
        label: `Masterclass ${theme}`,
        url: `https://med-mng.com/resources/${id}/masterclass`,
      },
      {
        type: 'fiche',
        label: `Fiche mémo ${practice.context}`,
        url: `https://med-mng.com/resources/${id}/fiche-memo`,
      },
      {
        type: 'podcast',
        label: `Podcast de débrief clinique #${id}`,
        url: `https://med-mng.com/resources/${id}/podcast`,
      },
    ],
  };
};

export const buildItemStructuredData = (item: ItemData) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: `${item.code} – ${item.specialty}`,
  description: item.summary,
  educationalCredentialAwarded: ['Rang A', 'Rang B'],
  inLanguage: 'fr',
  courseCode: item.code,
  provider: {
    '@type': 'Organization',
    name: 'MED‑MNG',
    url: 'https://med-mng.com',
  },
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: item.difficulty,
    startDate: format(new Date(item.lastUpdated), 'yyyy-MM-dd'),
    location: {
      '@type': 'VirtualLocation',
      url: `https://med-mng.com/item/${item.id}`,
    },
  },
  keywords: item.keywords.join(', '),
  timeRequired: `PT${Math.max(item.estimatedStudyTimeMinutes, 15)}M`,
});

