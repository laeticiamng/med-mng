import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ClinicalStep {
  id: string;
  title: string;
  description: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
    nextStepId?: string;
  }>;
}

export interface ClinicalCase {
  id: string;
  title: string;
  specialty: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  patientPresentation: string;
  steps: ClinicalStep[];
  relatedItems: string[];
  estimatedTime: number;
  learningObjectives: string[];
}

export interface CaseProgress {
  caseId: string;
  currentStepIndex: number;
  completedSteps: string[];
  correctAnswers: number;
  totalAnswers: number;
  startedAt: string;
  completedAt?: string;
  decisions: Array<{
    stepId: string;
    selectedOption: string;
    wasCorrect: boolean;
    timeSpent: number;
  }>;
}

export interface ClinicalStats {
  totalCasesStarted: number;
  totalCasesCompleted: number;
  averageScore: number;
  bySpecialty: Record<string, { completed: number; score: number }>;
  recentCases: Array<{ caseId: string; title: string; score: number; date: string }>;
}

// Sample clinical cases with MULTI-PATH decision trees
const SAMPLE_CASES: ClinicalCase[] = [
  {
    id: 'case-1',
    title: 'Douleur thoracique aiguë',
    specialty: 'Cardiologie',
    difficulty: 'intermediate',
    description: 'Patient de 55 ans présentant une douleur thoracique aiguë',
    patientPresentation: 'M. Dupont, 55 ans, arrive aux urgences pour une douleur thoracique rétrosternale constrictive évoluant depuis 2 heures, irradiant vers le bras gauche. Il est diabétique de type 2, hypertendu et fumeur.',
    estimatedTime: 15,
    learningObjectives: [
      'Reconnaître les signes de syndrome coronarien aigu',
      'Hiérarchiser les examens complémentaires',
      'Initier la prise en charge adaptée'
    ],
    relatedItems: ['228', '229', '230'],
    steps: [
      {
        id: 'step-1',
        title: 'Évaluation initiale',
        description: 'Le patient présente une douleur thoracique typique avec des facteurs de risque cardiovasculaire.',
        question: 'Quelle est votre première action ?',
        options: [
          {
            id: 'opt-1a',
            text: 'Réaliser un ECG 12 dérivations',
            isCorrect: true,
            feedback: 'Excellent ! L\'ECG est l\'examen clé à réaliser en urgence devant une douleur thoracique suspecte de SCA.',
            nextStepId: 'step-2-ecg'
          },
          {
            id: 'opt-1b',
            text: 'Demander une radiographie thoracique',
            isCorrect: false,
            feedback: 'La radiographie thoracique n\'est pas la priorité. L\'ECG doit être réalisé dans les 10 minutes.',
            nextStepId: 'step-1b-radiologue'
          },
          {
            id: 'opt-1c',
            text: 'Administrer de la morphine',
            isCorrect: false,
            feedback: 'L\'antalgie est importante mais pas avant d\'avoir un diagnostic ECG.',
            nextStepId: 'step-1c-morphine'
          },
          {
            id: 'opt-1d',
            text: 'Attendre les résultats biologiques',
            isCorrect: false,
            feedback: 'Attendre les troponines retarderait dangereusement la prise en charge.',
            nextStepId: 'step-1d-bio'
          }
        ]
      },
      // MULTI-PATH BRANCH: Alternative path if radiology chosen
      {
        id: 'step-1b-radiologue',
        title: 'Résultat radiologique',
        description: 'La radiographie montre un médiastin normal. Pendant ce temps, le patient se plaint de douleur croissante.',
        question: 'Le temps a passé. Quelle est maintenant votre priorité ?',
        options: [
          {
            id: 'opt-1b-1',
            text: 'Réaliser un ECG en urgence',
            isCorrect: true,
            feedback: 'Bon rattrapage ! L\'ECG aurait dû être fait en premier mais mieux vaut tard que jamais.',
            nextStepId: 'step-2-ecg'
          },
          {
            id: 'opt-1b-2',
            text: 'Demander un scanner thoracique',
            isCorrect: false,
            feedback: 'Le scanner n\'est pas indiqué en première intention pour un SCA.',
            nextStepId: 'step-1-retry'
          }
        ]
      },
      // MULTI-PATH BRANCH: If morphine given first
      {
        id: 'step-1c-morphine',
        title: 'Post-analgésie',
        description: 'La douleur est soulagée mais vous n\'avez toujours pas de diagnostic. Le patient reste à risque.',
        question: 'Quelle est votre prochaine étape ?',
        options: [
          {
            id: 'opt-1c-1',
            text: 'ECG 12 dérivations maintenant',
            isCorrect: true,
            feedback: 'Correct ! Même si la douleur est soulagée, l\'ECG reste essentiel pour le diagnostic.',
            nextStepId: 'step-2-ecg'
          },
          {
            id: 'opt-1c-2',
            text: 'Observation clinique',
            isCorrect: false,
            feedback: 'L\'observation seule est dangereuse - un SCA peut évoluer rapidement.',
            nextStepId: 'step-1-retry'
          }
        ]
      },
      // MULTI-PATH BRANCH: If waiting for biology
      {
        id: 'step-1d-bio',
        title: 'Résultats biologiques',
        description: 'Troponine T : 0,8 ng/mL (N < 0,04). Résultat très élevé ! Le patient devient instable.',
        question: 'Face à cette troponine très élevée, que faites-vous ?',
        options: [
          {
            id: 'opt-1d-1',
            text: 'ECG urgent + appel cardiologue',
            isCorrect: true,
            feedback: 'Enfin ! La troponine confirme la nécrose myocardique. L\'ECG va préciser le type de SCA.',
            nextStepId: 'step-2-ecg'
          },
          {
            id: 'opt-1d-2',
            text: 'Recontrôler la troponine dans 3h',
            isCorrect: false,
            feedback: 'La troponine est déjà très élevée, pas besoin de recontrôle. Action urgente requise !',
            nextStepId: 'step-1-retry'
          }
        ]
      },
      // Main ECG interpretation path
      {
        id: 'step-2-ecg',
        title: 'Interprétation ECG',
        description: 'L\'ECG montre un sus-décalage du segment ST en V1-V4 avec miroir en D2, D3, aVF.',
        question: 'Quel est votre diagnostic ?',
        options: [
          {
            id: 'opt-2a',
            text: 'STEMI antérieur',
            isCorrect: true,
            feedback: 'Correct ! Le sus-décalage ST en V1-V4 est typique d\'un STEMI antérieur (territoire IVA).',
            nextStepId: 'step-3-stemi'
          },
          {
            id: 'opt-2b',
            text: 'NSTEMI',
            isCorrect: false,
            feedback: 'Non, un NSTEMI ne présente pas de sus-décalage ST persistant.',
            nextStepId: 'step-2-nstemi-path'
          },
          {
            id: 'opt-2c',
            text: 'Péricardite aiguë',
            isCorrect: false,
            feedback: 'La péricardite donne un sus-décalage diffus, concave vers le haut.',
            nextStepId: 'step-2-pericardite-path'
          },
          {
            id: 'opt-2d',
            text: 'Angor stable',
            isCorrect: false,
            feedback: 'L\'angor stable ne modifie pas l\'ECG de repos.',
            nextStepId: 'step-2-retry'
          }
        ]
      },
      // MULTI-PATH: NSTEMI interpretation path
      {
        id: 'step-2-nstemi-path',
        title: 'Diagnostic NSTEMI',
        description: 'Vous avez diagnostiqué un NSTEMI mais les modifications ECG suggèrent un STEMI.',
        question: 'Un collègue vous fait remarquer le sus-décalage. Que faites-vous ?',
        options: [
          {
            id: 'opt-2n-1',
            text: 'Réviser mon diagnostic : STEMI',
            isCorrect: true,
            feedback: 'Excellente humilité ! La réévaluation confirme le STEMI antérieur.',
            nextStepId: 'step-3-stemi'
          },
          {
            id: 'opt-2n-2',
            text: 'Maintenir le diagnostic NSTEMI',
            isCorrect: false,
            feedback: 'Le sus-décalage ST persistant définit un STEMI, pas un NSTEMI.',
            nextStepId: 'step-2-retry'
          }
        ]
      },
      // MULTI-PATH: Péricardite path
      {
        id: 'step-2-pericardite-path',
        title: 'Hypothèse péricardite',
        description: 'Vous avez évoqué une péricardite mais le patient a des facteurs de risque cardiovasculaire majeurs.',
        question: 'Reconsidérez-vous votre diagnostic ?',
        options: [
          {
            id: 'opt-2p-1',
            text: 'Oui, c\'est plus probablement un STEMI',
            isCorrect: true,
            feedback: 'Correct ! Le contexte clinique et l\'aspect ECG sont typiques d\'un STEMI.',
            nextStepId: 'step-3-stemi'
          },
          {
            id: 'opt-2p-2',
            text: 'Non, je traite une péricardite',
            isCorrect: false,
            feedback: 'Attention ! Un traitement inapproprié pourrait être fatal.',
            nextStepId: 'step-2-retry'
          }
        ]
      },
      // Main STEMI treatment path
      {
        id: 'step-3-stemi',
        title: 'Prise en charge STEMI',
        description: 'Vous avez diagnostiqué un STEMI antérieur. Le patient est stable hémodynamiquement.',
        question: 'Quelle est la stratégie de reperfusion à privilégier ?',
        options: [
          {
            id: 'opt-3a',
            text: 'Angioplastie primaire si < 120 min',
            isCorrect: true,
            feedback: 'Excellent ! L\'angioplastie primaire est le gold standard si réalisable dans les 120 minutes.',
            nextStepId: 'step-4-success'
          },
          {
            id: 'opt-3b',
            text: 'Thrombolyse systématique',
            isCorrect: false,
            feedback: 'La thrombolyse n\'est indiquée que si l\'angioplastie n\'est pas accessible dans les délais.',
            nextStepId: 'step-3-thrombolyse'
          },
          {
            id: 'opt-3c',
            text: 'Traitement médical seul',
            isCorrect: false,
            feedback: 'Le STEMI nécessite une reperfusion urgente.',
            nextStepId: 'step-3-medical'
          },
          {
            id: 'opt-3d',
            text: 'Attendre le cardiologue de garde',
            isCorrect: false,
            feedback: 'Le temps est critique dans le STEMI. Chaque minute compte.',
            nextStepId: 'step-3-attente'
          }
        ]
      },
      // Alternative treatment paths
      {
        id: 'step-3-thrombolyse',
        title: 'Thrombolyse initiée',
        description: 'Vous avez choisi la thrombolyse. Le centre d\'angioplastie est à 45 minutes.',
        question: 'Le délai vers l\'angioplastie est inférieur à 120 min. Que faites-vous ?',
        options: [
          {
            id: 'opt-3t-1',
            text: 'Stopper et transférer pour angioplastie',
            isCorrect: true,
            feedback: 'Correct ! L\'angioplastie reste préférable si accessible dans les délais.',
            nextStepId: 'step-4-success'
          },
          {
            id: 'opt-3t-2',
            text: 'Poursuivre la thrombolyse',
            isCorrect: false,
            feedback: 'La thrombolyse est moins efficace et plus risquée que l\'angioplastie primaire.',
            nextStepId: 'step-4-partial'
          }
        ]
      },
      {
        id: 'step-3-medical',
        title: 'Traitement médical seul',
        description: 'Sans reperfusion, le myocarde continue de nécroser. L\'état du patient se dégrade.',
        question: 'Face à la dégradation, que décidez-vous ?',
        options: [
          {
            id: 'opt-3m-1',
            text: 'Appeler pour angioplastie urgente',
            isCorrect: true,
            feedback: 'Enfin ! Mieux vaut tard que jamais pour sauver du myocarde.',
            nextStepId: 'step-4-partial'
          }
        ]
      },
      {
        id: 'step-3-attente',
        title: 'Attente du cardiologue',
        description: 'Le cardiologue arrive 30 minutes plus tard. Temps précieux perdu.',
        question: 'Le cardiologue confirme le STEMI. Il vous demande pourquoi avoir attendu.',
        options: [
          {
            id: 'opt-3a-1',
            text: 'Admettre l\'erreur et agir maintenant',
            isCorrect: true,
            feedback: 'Leçon apprise : dans le STEMI, chaque minute de retard = myocarde perdu.',
            nextStepId: 'step-4-partial'
          }
        ]
      },
      // Final outcomes
      {
        id: 'step-4-success',
        title: 'Reperfusion réussie',
        description: 'Le patient a bénéficié d\'une angioplastie primaire dans les délais optimaux. L\'artère IVA a été revascularisée avec succès.',
        question: 'Félicitations ! Prise en charge optimale. Quelle est la suite ?',
        options: [
          {
            id: 'opt-4s',
            text: 'Surveillance USIC et prévention secondaire',
            isCorrect: true,
            feedback: 'Parfait ! Le patient est sauvé grâce à une prise en charge rapide et appropriée.',
            nextStepId: 'complete'
          }
        ]
      },
      {
        id: 'step-4-partial',
        title: 'Reperfusion tardive',
        description: 'Le patient a finalement bénéficié d\'une revascularisation mais avec un délai sous-optimal. Une partie du myocarde est nécrosée.',
        question: 'Le patient survit mais avec des séquelles. Que retenez-vous ?',
        options: [
          {
            id: 'opt-4p',
            text: 'Le temps est crucial dans le STEMI',
            isCorrect: true,
            feedback: 'Exactement. "Time is muscle" - chaque minute compte pour sauver le myocarde.',
            nextStepId: 'complete'
          }
        ]
      }
    ]
  },
  {
    id: 'case-2',
    title: 'Détresse respiratoire du nourrisson',
    specialty: 'Pédiatrie',
    difficulty: 'beginner',
    description: 'Nourrisson de 6 mois avec détresse respiratoire',
    patientPresentation: 'Un nourrisson de 6 mois est amené aux urgences par ses parents pour difficultés respiratoires. Il tousse depuis 3 jours, a de la fièvre (38.5°C) et refuse de s\'alimenter depuis ce matin.',
    estimatedTime: 10,
    learningObjectives: [
      'Évaluer la gravité d\'une détresse respiratoire',
      'Reconnaître une bronchiolite',
      'Connaître les critères d\'hospitalisation'
    ],
    relatedItems: ['151', '160', '184'],
    steps: [
      {
        id: 'step-1',
        title: 'Évaluation clinique',
        description: 'Le nourrisson présente un tirage intercostal, un battement des ailes du nez et une saturation à 92% en air ambiant.',
        question: 'Comment évaluez-vous cette détresse respiratoire ?',
        options: [
          {
            id: 'opt-1a',
            text: 'Détresse respiratoire modérée à sévère',
            isCorrect: true,
            feedback: 'Correct ! La présence de signes de lutte et une SpO2 < 94% indiquent une détresse significative.',
            nextStepId: 'step-2'
          },
          {
            id: 'opt-1b',
            text: 'Détresse respiratoire légère',
            isCorrect: false,
            feedback: 'Les signes de lutte multiples et la désaturation indiquent une forme plus sévère.',
            nextStepId: 'step-1-reassess'
          },
          {
            id: 'opt-1c',
            text: 'Pas de détresse respiratoire',
            isCorrect: false,
            feedback: 'Le tirage et le battement des ailes du nez sont des signes de lutte respiratoire.',
            nextStepId: 'step-1-reassess'
          },
          {
            id: 'opt-1d',
            text: 'Détresse respiratoire avec épuisement',
            isCorrect: false,
            feedback: 'L\'épuisement se manifeste par une disparition des signes de lutte, ce qui n\'est pas le cas ici.',
            nextStepId: 'step-1-reassess'
          }
        ]
      },
      {
        id: 'step-1-reassess',
        title: 'Réévaluation',
        description: 'Reconsidérez les signes cliniques : tirage, BAN, SpO2 à 92%.',
        question: 'Ces signes indiquent quel niveau de détresse ?',
        options: [
          {
            id: 'opt-1r-1',
            text: 'Détresse modérée à sévère',
            isCorrect: true,
            feedback: 'Exact ! Passons au diagnostic étiologique.',
            nextStepId: 'step-2'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Diagnostic étiologique',
        description: 'L\'auscultation révèle des râles sibilants et crépitants bilatéraux. Le premier épisode de ce type.',
        question: 'Quel est le diagnostic le plus probable ?',
        options: [
          {
            id: 'opt-2a',
            text: 'Bronchiolite aiguë',
            isCorrect: true,
            feedback: 'Exact ! Premier épisode de wheezing chez un nourrisson < 1 an avec contexte viral = bronchiolite.',
            nextStepId: 'step-3'
          },
          {
            id: 'opt-2b',
            text: 'Asthme du nourrisson',
            isCorrect: false,
            feedback: 'L\'asthme du nourrisson est défini par au moins 3 épisodes de wheezing.',
            nextStepId: 'step-2-asthme'
          },
          {
            id: 'opt-2c',
            text: 'Pneumonie bactérienne',
            isCorrect: false,
            feedback: 'La pneumonie donne plutôt un foyer auscultatoire localisé.',
            nextStepId: 'step-2-pneumo'
          },
          {
            id: 'opt-2d',
            text: 'Coqueluche',
            isCorrect: false,
            feedback: 'La coqueluche donne des quintes de toux avec reprise inspiratoire.',
            nextStepId: 'step-2-coqueluche'
          }
        ]
      },
      {
        id: 'step-2-asthme',
        title: 'Hypothèse asthme',
        description: 'C\'est le premier épisode. L\'asthme nécessite au moins 3 épisodes de wheezing.',
        question: 'Reconsidérez votre diagnostic.',
        options: [
          {
            id: 'opt-2a-1',
            text: 'Bronchiolite aiguë (1er épisode)',
            isCorrect: true,
            feedback: 'Correct ! Par définition, c\'est une bronchiolite au premier épisode.',
            nextStepId: 'step-3'
          }
        ]
      },
      {
        id: 'step-2-pneumo',
        title: 'Hypothèse pneumonie',
        description: 'L\'auscultation bilatérale avec sibilants n\'est pas typique d\'une pneumonie bactérienne.',
        question: 'Quel diagnostic viral est plus probable ?',
        options: [
          {
            id: 'opt-2p-1',
            text: 'Bronchiolite aiguë à VRS',
            isCorrect: true,
            feedback: 'Exact ! L\'aspect bilatéral et viral est typique de la bronchiolite.',
            nextStepId: 'step-3'
          }
        ]
      },
      {
        id: 'step-2-coqueluche',
        title: 'Hypothèse coqueluche',
        description: 'La coqueluche donne des quintes caractéristiques, pas de sibilants.',
        question: 'Le tableau clinique est plus compatible avec ?',
        options: [
          {
            id: 'opt-2c-1',
            text: 'Bronchiolite aiguë',
            isCorrect: true,
            feedback: 'Oui ! Les sibilants bilatéraux chez un nourrisson = bronchiolite.',
            nextStepId: 'step-3'
          }
        ]
      },
      {
        id: 'step-3',
        title: 'Décision thérapeutique',
        description: 'Bronchiolite aiguë modérée chez un nourrisson de 6 mois.',
        question: 'Quelle est votre décision ?',
        options: [
          {
            id: 'opt-3a',
            text: 'Hospitalisation pour surveillance et O2',
            isCorrect: true,
            feedback: 'Correct ! SpO2 < 94%, troubles alimentaires et âge < 6 semaines sont des critères d\'hospitalisation.',
            nextStepId: 'complete'
          },
          {
            id: 'opt-3b',
            text: 'Retour à domicile avec Ventoline',
            isCorrect: false,
            feedback: 'Les bronchodilatateurs ne sont pas recommandés dans la bronchiolite du nourrisson.',
            nextStepId: 'step-3-ventoline'
          },
          {
            id: 'opt-3c',
            text: 'Antibiotique et retour à domicile',
            isCorrect: false,
            feedback: 'La bronchiolite est virale. Les antibiotiques ne sont pas indiqués en l\'absence de surinfection.',
            nextStepId: 'step-3-atb'
          },
          {
            id: 'opt-3d',
            text: 'Corticoïdes oraux et surveillance',
            isCorrect: false,
            feedback: 'Les corticoïdes n\'ont pas d\'efficacité démontrée dans la bronchiolite.',
            nextStepId: 'step-3-cortico'
          }
        ]
      },
      {
        id: 'step-3-ventoline',
        title: 'Essai bronchodilatateur',
        description: 'La Ventoline n\'a pas d\'effet. La SpO2 reste basse.',
        question: 'Que faites-vous maintenant ?',
        options: [
          {
            id: 'opt-3v-1',
            text: 'Hospitalisation',
            isCorrect: true,
            feedback: 'Bonne décision. Les critères d\'hospitalisation sont présents.',
            nextStepId: 'complete'
          }
        ]
      },
      {
        id: 'step-3-atb',
        title: 'Antibiothérapie prescrite',
        description: 'L\'antibiothérapie n\'aura pas d\'effet sur une infection virale. L\'enfant reste symptomatique.',
        question: 'Face à l\'absence d\'amélioration, que décidez-vous ?',
        options: [
          {
            id: 'opt-3a-1',
            text: 'Hospitalisation pour oxygénothérapie',
            isCorrect: true,
            feedback: 'Correct. La bronchiolite nécessite un support respiratoire, pas des antibiotiques.',
            nextStepId: 'complete'
          }
        ]
      },
      {
        id: 'step-3-cortico',
        title: 'Corticothérapie',
        description: 'Les corticoïdes sont inefficaces dans la bronchiolite. L\'état ne s\'améliore pas.',
        question: 'Quelle est la bonne prise en charge ?',
        options: [
          {
            id: 'opt-3c-1',
            text: 'Hospitalisation et oxygène',
            isCorrect: true,
            feedback: 'Exact ! Le traitement de la bronchiolite est symptomatique : O2, hydratation, DRP.',
            nextStepId: 'complete'
          }
        ]
      }
    ]
  }
];

export const useClinicalCases = () => {
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState<ClinicalCase[]>(SAMPLE_CASES);
  const [currentProgress, setCurrentProgress] = useState<CaseProgress | null>(null);
  const { toast } = useToast();

  // Get all available cases - load from Supabase first, fallback to sample
  const getCases = useCallback(async (specialty?: string, difficulty?: string) => {
    setLoading(true);
    try {
      // Try to load from Supabase
      const { data: dbCases } = await (supabase as any)
        .from('clinical_cases')
        .select('*')
        .eq('is_active', true);
      
      let allCases: ClinicalCase[] = dbCases?.length > 0 
        ? dbCases.map((c: any) => ({
            id: c.id,
            title: c.title,
            specialty: c.specialty,
            difficulty: c.difficulty as ClinicalCase['difficulty'],
            description: c.description || '',
            patientPresentation: c.patient_presentation,
            steps: c.steps || [],
            relatedItems: c.related_items || [],
            estimatedTime: c.estimated_time || 15,
            learningObjectives: c.learning_objectives || []
          }))
        : SAMPLE_CASES;
      
      let filtered = [...allCases];
      if (specialty) {
        filtered = filtered.filter(c => c.specialty === specialty);
      }
      if (difficulty) {
        filtered = filtered.filter(c => c.difficulty === difficulty);
      }
      setCases(filtered);
      return filtered;
    } catch (e) {
      console.error('Error loading cases:', e);
      setCases(SAMPLE_CASES);
      return SAMPLE_CASES;
    } finally {
      setLoading(false);
    }
  }, []);

  // Start a clinical case
  const startCase = useCallback((caseId: string): CaseProgress | null => {
    const clinicalCase = cases.find(c => c.id === caseId);
    if (!clinicalCase) return null;

    const progress: CaseProgress = {
      caseId,
      currentStepIndex: 0,
      completedSteps: [],
      correctAnswers: 0,
      totalAnswers: 0,
      startedAt: new Date().toISOString(),
      decisions: []
    };

    setCurrentProgress(progress);
    return progress;
  }, [cases]);

  // Submit decision for current step
  const submitDecision = useCallback((
    optionId: string,
    timeSpent: number
  ): { isCorrect: boolean; feedback: string; nextStepId?: string } | null => {
    if (!currentProgress) return null;

    const clinicalCase = cases.find(c => c.id === currentProgress.caseId);
    if (!clinicalCase) return null;

    const currentStep = clinicalCase.steps[currentProgress.currentStepIndex];
    if (!currentStep) return null;

    const selectedOption = currentStep.options.find(o => o.id === optionId);
    if (!selectedOption) return null;

    const newDecision = {
      stepId: currentStep.id,
      selectedOption: optionId,
      wasCorrect: selectedOption.isCorrect,
      timeSpent
    };

    setCurrentProgress(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        completedSteps: [...prev.completedSteps, currentStep.id],
        correctAnswers: prev.correctAnswers + (selectedOption.isCorrect ? 1 : 0),
        totalAnswers: prev.totalAnswers + 1,
        currentStepIndex: selectedOption.isCorrect ? prev.currentStepIndex + 1 : prev.currentStepIndex,
        decisions: [...prev.decisions, newDecision]
      };
    });

    return {
      isCorrect: selectedOption.isCorrect,
      feedback: selectedOption.feedback,
      nextStepId: selectedOption.nextStepId
    };
  }, [currentProgress, cases]);

  // Complete the case
  const completeCase = useCallback(async (userId: string) => {
    if (!currentProgress) return null;

    const completedProgress = {
      ...currentProgress,
      completedAt: new Date().toISOString()
    };

    // Save to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase as any)
          .from('clinical_cases_history')
          .insert({
            user_id: user.id,
            case_id: currentProgress.caseId,
            completed_steps: completedProgress.completedSteps,
            correct_answers: completedProgress.correctAnswers,
            total_answers: completedProgress.totalAnswers,
            decisions: completedProgress.decisions,
            started_at: completedProgress.startedAt,
            completed_at: completedProgress.completedAt
          });
      }
    } catch (e) {
      console.error('Error saving clinical history:', e);
    }

    const score = Math.round((currentProgress.correctAnswers / currentProgress.totalAnswers) * 100);
    
    toast({
      title: "Cas clinique terminé !",
      description: `Score: ${score}% (${currentProgress.correctAnswers}/${currentProgress.totalAnswers})`,
    });

    setCurrentProgress(null);
    return completedProgress;
  }, [currentProgress, toast]);

  // Get statistics from Supabase
  const getStats = useCallback(async (userId: string): Promise<ClinicalStats> => {
    try {
      const { data: history } = await (supabase as any)
        .from('clinical_cases_history')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (!history || history.length === 0) {
        return {
          totalCasesStarted: 0,
          totalCasesCompleted: 0,
          averageScore: 0,
          bySpecialty: {},
          recentCases: []
        };
      }

      const completed = history.filter((h: any) => h.completed_at);
      const scores = completed.map((h: any) => 
        h.total_answers > 0 ? (h.correct_answers / h.total_answers) * 100 : 0
      );

      const bySpecialty: Record<string, { completed: number; score: number }> = {};
      completed.forEach((h: any) => {
        const clinicalCase = SAMPLE_CASES.find(c => c.id === h.case_id);
        if (clinicalCase) {
          if (!bySpecialty[clinicalCase.specialty]) {
            bySpecialty[clinicalCase.specialty] = { completed: 0, score: 0 };
          }
          bySpecialty[clinicalCase.specialty].completed++;
          bySpecialty[clinicalCase.specialty].score += 
            h.total_answers > 0 ? (h.correct_answers / h.total_answers) * 100 : 0;
        }
      });

      // Average scores by specialty
      Object.keys(bySpecialty).forEach(spec => {
        bySpecialty[spec].score = Math.round(bySpecialty[spec].score / bySpecialty[spec].completed);
      });

      return {
        totalCasesStarted: history.length,
        totalCasesCompleted: completed.length,
        averageScore: scores.length > 0 
          ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) 
          : 0,
        bySpecialty,
        recentCases: completed.slice(-5).map((h: any) => ({
          caseId: h.case_id,
          title: SAMPLE_CASES.find(c => c.id === h.case_id)?.title || 'Cas inconnu',
          score: h.total_answers > 0 ? Math.round((h.correct_answers / h.total_answers) * 100) : 0,
          date: h.completed_at || h.created_at
        }))
      };
    } catch (error) {
      console.error('Error fetching clinical stats:', error);
      return {
        totalCasesStarted: 0, totalCasesCompleted: 0, averageScore: 0, bySpecialty: {}, recentCases: []
      };
    }
  }, []);

  // Get current case
  const getCurrentCase = useCallback((): ClinicalCase | null => {
    if (!currentProgress) return null;
    return cases.find(c => c.id === currentProgress.caseId) || null;
  }, [currentProgress, cases]);

  // Get case by ID
  const getCaseById = useCallback((caseId: string): ClinicalCase | undefined => {
    return cases.find(c => c.id === caseId);
  }, [cases]);

  // Get available specialties
  const getSpecialties = useCallback((): string[] => {
    return [...new Set(cases.map(c => c.specialty))];
  }, [cases]);

  // Get cases by specialty
  const getCasesBySpecialty = useCallback((specialty: string): ClinicalCase[] => {
    return cases.filter(c => c.specialty === specialty);
  }, [cases]);

  // Get cases by difficulty
  const getCasesByDifficulty = useCallback((difficulty: ClinicalCase['difficulty']): ClinicalCase[] => {
    return cases.filter(c => c.difficulty === difficulty);
  }, [cases]);

  // Get related items for a case
  const getRelatedItems = useCallback((caseId: string): string[] => {
    const clinicalCase = cases.find(c => c.id === caseId);
    return clinicalCase?.relatedItems || [];
  }, [cases]);

  // Get current step
  const getCurrentStep = useCallback((): ClinicalStep | null => {
    if (!currentProgress) return null;
    const clinicalCase = cases.find(c => c.id === currentProgress.caseId);
    if (!clinicalCase) return null;
    return clinicalCase.steps[currentProgress.currentStepIndex] || null;
  }, [currentProgress, cases]);

  // Get progress percentage
  const getProgressPercentage = useCallback((): number => {
    if (!currentProgress) return 0;
    const clinicalCase = cases.find(c => c.id === currentProgress.caseId);
    if (!clinicalCase || clinicalCase.steps.length === 0) return 0;
    return Math.round((currentProgress.currentStepIndex / clinicalCase.steps.length) * 100);
  }, [currentProgress, cases]);

  // Get current score
  const getCurrentScore = useCallback((): number => {
    if (!currentProgress || currentProgress.totalAnswers === 0) return 0;
    return Math.round((currentProgress.correctAnswers / currentProgress.totalAnswers) * 100);
  }, [currentProgress]);

  // Is case completed
  const isCaseCompleted = useCallback((): boolean => {
    if (!currentProgress) return false;
    const clinicalCase = cases.find(c => c.id === currentProgress.caseId);
    if (!clinicalCase) return false;
    return currentProgress.currentStepIndex >= clinicalCase.steps.length;
  }, [currentProgress, cases]);

  // Reset current progress
  const resetProgress = useCallback(() => {
    setCurrentProgress(null);
  }, []);

  // Get time spent on current case
  const getTimeSpent = useCallback((): number => {
    if (!currentProgress) return 0;
    return currentProgress.decisions.reduce((sum, d) => sum + d.timeSpent, 0);
  }, [currentProgress]);

  // Get average time per step
  const getAverageTimePerStep = useCallback((): number => {
    if (!currentProgress || currentProgress.decisions.length === 0) return 0;
    const totalTime = currentProgress.decisions.reduce((sum, d) => sum + d.timeSpent, 0);
    return Math.round(totalTime / currentProgress.decisions.length);
  }, [currentProgress]);

  // Search cases
  const searchCases = useCallback((query: string): ClinicalCase[] => {
    if (!query.trim()) return cases;
    const queryLower = query.toLowerCase();
    return cases.filter(c =>
      c.title.toLowerCase().includes(queryLower) ||
      c.description.toLowerCase().includes(queryLower) ||
      c.specialty.toLowerCase().includes(queryLower) ||
      c.learningObjectives.some(obj => obj.toLowerCase().includes(queryLower))
    );
  }, [cases]);

  // Get recommended cases based on user stats (synchronous version using default)
  const getRecommendedCases = useCallback((userId: string): ClinicalCase[] => {
    // For sync use, recommend based on diversity of specialties
    const specialtyCounts = new Map<string, number>();
    cases.forEach(c => {
      specialtyCounts.set(c.specialty, (specialtyCounts.get(c.specialty) || 0) + 1);
    });

    return cases
      .sort((a, b) => {
        const countA = specialtyCounts.get(a.specialty) ?? 0;
        const countB = specialtyCounts.get(b.specialty) ?? 0;
        return countB - countA; // More diverse first
      })
      .slice(0, 5);
  }, [cases]);

  // Get case difficulty color (using semantic tokens)
  const getDifficultyColor = useCallback((difficulty: ClinicalCase['difficulty']): string => {
    switch (difficulty) {
      case 'beginner': return 'text-success bg-success/10';
      case 'intermediate': return 'text-warning bg-warning/10';
      case 'advanced': return 'text-destructive bg-destructive/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  }, []);

  // Get estimated time display
  const getEstimatedTimeDisplay = useCallback((minutes: number): string => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }, []);

  // Export case history
  const exportHistory = useCallback(async (userId: string): Promise<string> => {
    const { data: history } = await (supabase as any)
      .from('clinical_cases_history')
      .select('*')
      .eq('user_id', userId);

    return JSON.stringify({
      exportDate: new Date().toISOString(),
      userId,
      totalCases: history?.length || 0,
      history: history || []
    }, null, 2);
  }, []);

  // Clear user history
  const clearHistory = useCallback(async (userId: string) => {
    await (supabase as any)
      .from('clinical_cases_history')
      .delete()
      .eq('user_id', userId);
  }, []);

  // Get total cases count
  const getTotalCasesCount = useCallback((): number => {
    return cases.length;
  }, [cases]);

  // Check if case was completed by user
  const wasCaseCompleted = useCallback(async (userId: string, caseId: string): Promise<boolean> => {
    const { data } = await (supabase as any)
      .from('clinical_cases_history')
      .select('id')
      .eq('user_id', userId)
      .eq('case_id', caseId)
      .not('completed_at', 'is', null)
      .limit(1);
    return (data?.length || 0) > 0;
  }, []);

  // Get best score for a case
  const getBestScore = useCallback(async (userId: string, caseId: string): Promise<number> => {
    const { data: history } = await (supabase as any)
      .from('clinical_cases_history')
      .select('score')
      .eq('user_id', userId)
      .eq('case_id', caseId)
      .not('completed_at', 'is', null);

    if (!history || history.length === 0) return 0;
    return Math.max(...history.map((h: any) => h.score || 0));
  }, []);

  return {
    loading,
    cases,
    currentProgress,
    getCases,
    startCase,
    submitDecision,
    completeCase,
    getStats,
    getCurrentCase,
    getCaseById,
    getSpecialties,
    getCasesBySpecialty,
    getCasesByDifficulty,
    getRelatedItems,
    getCurrentStep,
    getProgressPercentage,
    getCurrentScore,
    isCaseCompleted,
    resetProgress,
    getTimeSpent,
    getAverageTimePerStep,
    searchCases,
    getRecommendedCases,
    getDifficultyColor,
    getEstimatedTimeDisplay,
    exportHistory,
    clearHistory,
    getTotalCasesCount,
    wasCaseCompleted,
    getBestScore
  };
};
