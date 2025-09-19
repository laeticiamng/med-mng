export interface CompetenceSummary {
  intitule?: string | null;
  description?: string | null;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizBuilderOptions {
  itemNumber: string;
  itemTitle: string;
  competencesA: CompetenceSummary[];
  competencesB: CompetenceSummary[];
  random?: () => number;
}

const truncate = (value: string | null | undefined, length: number) => {
  if (!value) return value ?? null;
  return value.length > length ? `${value.substring(0, length)}` : value;
};

export function buildQuizQuestions({
  itemNumber,
  itemTitle,
  competencesA,
  competencesB,
  random = Math.random,
}: QuizBuilderOptions): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  if (competencesA.length > 0) {
    const index = Math.floor(random() * competencesA.length);
    const competence = competencesA[index] ?? competencesA[0];
    const label = truncate(competence.intitule ?? undefined, 80) ?? 'Notion essentielle à maîtriser';
    const explanationDetails = truncate(competence.description ?? undefined, 100);
    questions.push({
      id: 1,
      question: `Concernant ${itemTitle}, quelle est la notion fondamentale de rang A à retenir ?`,
      options: [
        label,
        'Concept secondaire non prioritaire',
        'Détail technique avancé uniquement',
        "Information optionnelle pour l'ECN",
      ],
      correct: 0,
      explanation:
        `${competence.intitule ?? 'Cette compétence'} est une compétence de rang A fondamentale pour l'item ${itemNumber}. ` +
        `${explanationDetails ?? 'Cette notion est essentielle à maîtriser.'}`,
    });
  }

  if (competencesB.length > 0) {
    const index = Math.floor(random() * competencesB.length);
    const competence = competencesB[index] ?? competencesB[0];
    const label = truncate(competence.intitule ?? undefined, 80) ?? 'Expertise spécialisée requise';
    const explanationDetails = truncate(competence.description ?? undefined, 100);
    questions.push({
      id: 2,
      question: `Pour l'expertise approfondie de l'item ${itemNumber}, quelle compétence de rang B est importante ?`,
      options: [
        'Connaissance basique uniquement suffisante',
        label,
        'Aucune compétence particulière nécessaire',
        'Simple mémorisation sans compréhension',
      ],
      correct: 1,
      explanation:
        `${competence.intitule ?? 'Cette compétence avancée'} représente une expertise de rang B cruciale pour maîtriser complètement l'item ${itemNumber}. ` +
        `${explanationDetails ?? 'Cette compétence avancée est indispensable.'}`,
    });
  }

  questions.push({
    id: 3,
    question: `Quelle approche est recommandée pour maîtriser complètement l'item ${itemNumber} ?`,
    options: [
      'Se concentrer uniquement sur le rang A',
      'Ignorer les détails du rang B',
      'Maîtriser progressivement rang A puis rang B selon son niveau',
      'Mémoriser sans comprendre les concepts',
    ],
    correct: 2,
    explanation: `L'item ${itemNumber} nécessite une approche progressive : maîtriser d'abord les compétences de rang A (${competencesA.length} compétences) puis approfondir avec le rang B (${competencesB.length} compétences) selon ses objectifs.`,
  });

  return questions;
}

interface ScenarioBuilderOptions {
  itemNumber: string;
  itemTitle: string;
  competencesA: CompetenceSummary[];
  competencesB: CompetenceSummary[];
}

export interface ScenarioContent {
  theme: string;
  context: string;
  setting: {
    location: string;
    atmosphere: string;
    characters: string[];
  };
  case_presentation: {
    patient_profile: string;
    initial_symptoms: string;
    clinical_challenge: string;
  };
  interactions: Array<
    | {
        type: 'anamnesis';
        content: string;
        responses: string[];
        feedback: {
          rang_a: string;
          rang_b: string;
        };
      }
    | {
        type: 'clinical_reasoning';
        content: string;
        responses: string[];
        learning_objectives: {
          rang_a: string;
          rang_b: string;
        };
      }
  >;
  learning_outcomes: string[];
}

export function buildScenarioContent({
  itemNumber,
  itemTitle,
  competencesA,
  competencesB,
}: ScenarioBuilderOptions): ScenarioContent {
  const initialSymptoms =
    competencesA.length > 0
      ? competencesA
          .slice(0, 2)
          .map((competence) => truncate(competence.intitule ?? undefined, 60) ?? 'Symptôme classique')
          .join(', ')
      : 'Présentation clinique typique';

  const feedbackA = truncate(competencesA[0]?.intitule ?? undefined, 100) ?? 'Éléments de base à explorer';
  const feedbackB = truncate(competencesB[0]?.intitule ?? undefined, 100) ?? 'Approfondissement diagnostique';

  return {
    theme: 'medical_case',
    context: `Cas clinique interactif - Item ${itemNumber}`,
    setting: {
      location: 'Service hospitalier',
      atmosphere: 'Environnement médical réaliste',
      characters: ['Patient', 'Médecin senior', 'Interne'],
    },
    case_presentation: {
      patient_profile: `Patient présentant des signes en lien avec l'item ${itemNumber}`,
      initial_symptoms: initialSymptoms,
      clinical_challenge: `Diagnostic et prise en charge selon les compétences de l'item ${itemNumber}`,
    },
    interactions: [
      {
        type: 'anamnesis',
        content: `Interrogatoire du patient concernant ${itemTitle}`,
        responses: [
          'Poser les questions essentielles de rang A',
          "Approfondir avec les éléments de rang B",
          'Synthétiser les informations collectées',
          "Demander l'avis du médecin senior",
        ],
        feedback: {
          rang_a: feedbackA,
          rang_b: feedbackB,
        },
      },
      {
        type: 'clinical_reasoning',
        content: `Raisonnement clinique pour l'item ${itemNumber}`,
        responses: [
          'Appliquer les connaissances de rang A',
          "Intégrer l'expertise de rang B",
          'Proposer une stratégie thérapeutique',
          'Évaluer le pronostic',
        ],
        learning_objectives: {
          rang_a: `Maîtriser les ${competencesA.length} compétences fondamentales`,
          rang_b: `Développer l'expertise avec les ${competencesB.length} compétences avancées`,
        },
      },
    ],
    learning_outcomes: [
      `Maîtrise des compétences de rang A de l'item ${itemNumber}`,
      'Développement de l\'expertise rang B',
      'Application clinique pratique',
      'Préparation efficace à l\'ECN',
    ],
  };
}
