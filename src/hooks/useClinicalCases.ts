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

// Sample clinical cases
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
            nextStepId: 'step-2'
          },
          {
            id: 'opt-1b',
            text: 'Demander une radiographie thoracique',
            isCorrect: false,
            feedback: 'La radiographie thoracique n\'est pas la priorité. L\'ECG doit être réalisé dans les 10 minutes.',
            nextStepId: 'step-1-retry'
          },
          {
            id: 'opt-1c',
            text: 'Administrer de la morphine',
            isCorrect: false,
            feedback: 'L\'antalgie est importante mais pas avant d\'avoir un diagnostic ECG.',
            nextStepId: 'step-1-retry'
          },
          {
            id: 'opt-1d',
            text: 'Attendre les résultats biologiques',
            isCorrect: false,
            feedback: 'Attendre les troponines retarderait dangereusement la prise en charge.',
            nextStepId: 'step-1-retry'
          }
        ]
      },
      {
        id: 'step-2',
        title: 'Interprétation ECG',
        description: 'L\'ECG montre un sus-décalage du segment ST en V1-V4 avec miroir en D2, D3, aVF.',
        question: 'Quel est votre diagnostic ?',
        options: [
          {
            id: 'opt-2a',
            text: 'STEMI antérieur',
            isCorrect: true,
            feedback: 'Correct ! Le sus-décalage ST en V1-V4 est typique d\'un STEMI antérieur (territoire IVA).',
            nextStepId: 'step-3'
          },
          {
            id: 'opt-2b',
            text: 'NSTEMI',
            isCorrect: false,
            feedback: 'Non, un NSTEMI ne présente pas de sus-décalage ST persistant.',
            nextStepId: 'step-2-retry'
          },
          {
            id: 'opt-2c',
            text: 'Péricardite aiguë',
            isCorrect: false,
            feedback: 'La péricardite donne un sus-décalage diffus, concave vers le haut.',
            nextStepId: 'step-2-retry'
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
      {
        id: 'step-3',
        title: 'Prise en charge',
        description: 'Vous avez diagnostiqué un STEMI antérieur. Le patient est stable hémodynamiquement.',
        question: 'Quelle est la stratégie de reperfusion à privilégier ?',
        options: [
          {
            id: 'opt-3a',
            text: 'Angioplastie primaire si < 120 min',
            isCorrect: true,
            feedback: 'Excellent ! L\'angioplastie primaire est le gold standard si réalisable dans les 120 minutes.',
            nextStepId: 'complete'
          },
          {
            id: 'opt-3b',
            text: 'Thrombolyse systématique',
            isCorrect: false,
            feedback: 'La thrombolyse n\'est indiquée que si l\'angioplastie n\'est pas accessible dans les délais.',
            nextStepId: 'step-3-retry'
          },
          {
            id: 'opt-3c',
            text: 'Traitement médical seul',
            isCorrect: false,
            feedback: 'Le STEMI nécessite une reperfusion urgente.',
            nextStepId: 'step-3-retry'
          },
          {
            id: 'opt-3d',
            text: 'Attendre le cardiologue de garde',
            isCorrect: false,
            feedback: 'Le temps est critique dans le STEMI. Chaque minute compte.',
            nextStepId: 'step-3-retry'
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
            nextStepId: 'step-1-retry'
          },
          {
            id: 'opt-1c',
            text: 'Pas de détresse respiratoire',
            isCorrect: false,
            feedback: 'Le tirage et le battement des ailes du nez sont des signes de lutte respiratoire.',
            nextStepId: 'step-1-retry'
          },
          {
            id: 'opt-1d',
            text: 'Détresse respiratoire avec épuisement',
            isCorrect: false,
            feedback: 'L\'épuisement se manifeste par une disparition des signes de lutte, ce qui n\'est pas le cas ici.',
            nextStepId: 'step-1-retry'
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
            nextStepId: 'step-2-retry'
          },
          {
            id: 'opt-2c',
            text: 'Pneumonie bactérienne',
            isCorrect: false,
            feedback: 'La pneumonie donne plutôt un foyer auscultatoire localisé.',
            nextStepId: 'step-2-retry'
          },
          {
            id: 'opt-2d',
            text: 'Coqueluche',
            isCorrect: false,
            feedback: 'La coqueluche donne des quintes de toux avec reprise inspiratoire.',
            nextStepId: 'step-2-retry'
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
            nextStepId: 'step-3-retry'
          },
          {
            id: 'opt-3c',
            text: 'Antibiotique et retour à domicile',
            isCorrect: false,
            feedback: 'La bronchiolite est virale. Les antibiotiques ne sont pas indiqués en l\'absence de surinfection.',
            nextStepId: 'step-3-retry'
          },
          {
            id: 'opt-3d',
            text: 'Corticoïdes oraux et surveillance',
            isCorrect: false,
            feedback: 'Les corticoïdes n\'ont pas d\'efficacité démontrée dans la bronchiolite.',
            nextStepId: 'step-3-retry'
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

  // Get all available cases
  const getCases = useCallback(async (specialty?: string, difficulty?: string) => {
    setLoading(true);
    try {
      let filtered = [...SAMPLE_CASES];
      if (specialty) {
        filtered = filtered.filter(c => c.specialty === specialty);
      }
      if (difficulty) {
        filtered = filtered.filter(c => c.difficulty === difficulty);
      }
      setCases(filtered);
      return filtered;
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

  // Get recommended cases based on user stats
  const getRecommendedCases = useCallback((userId: string): ClinicalCase[] => {
    const stats = getStats(userId);

    // Prioritize specialties with low scores or not attempted
    const specialtyScores = new Map(
      Object.entries(stats.bySpecialty).map(([spec, data]) => [spec, data.score])
    );

    return cases
      .sort((a, b) => {
        const scoreA = specialtyScores.get(a.specialty) ?? 0;
        const scoreB = specialtyScores.get(b.specialty) ?? 0;
        return scoreA - scoreB; // Lower scores first
      })
      .slice(0, 5);
  }, [cases, getStats]);

  // Get case difficulty color
  const getDifficultyColor = useCallback((difficulty: ClinicalCase['difficulty']): string => {
    switch (difficulty) {
      case 'beginner': return 'text-green-500 bg-green-500/10';
      case 'intermediate': return 'text-yellow-500 bg-yellow-500/10';
      case 'advanced': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
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
  const exportHistory = useCallback((userId: string): string => {
    const history = JSON.parse(localStorage.getItem('clinical_cases_history') || '[]')
      .filter((h: any) => h.userId === userId);

    return JSON.stringify({
      exportDate: new Date().toISOString(),
      userId,
      totalCases: history.length,
      history
    }, null, 2);
  }, []);

  // Clear user history
  const clearHistory = useCallback((userId: string) => {
    const history = JSON.parse(localStorage.getItem('clinical_cases_history') || '[]')
      .filter((h: any) => h.userId !== userId);
    localStorage.setItem('clinical_cases_history', JSON.stringify(history));
  }, []);

  // Get total cases count
  const getTotalCasesCount = useCallback((): number => {
    return cases.length;
  }, [cases]);

  // Check if case was completed by user
  const wasCaseCompleted = useCallback((userId: string, caseId: string): boolean => {
    const history = JSON.parse(localStorage.getItem('clinical_cases_history') || '[]');
    return history.some((h: any) => h.userId === userId && h.caseId === caseId && h.completedAt);
  }, []);

  // Get best score for a case
  const getBestScore = useCallback((userId: string, caseId: string): number => {
    const history = JSON.parse(localStorage.getItem('clinical_cases_history') || '[]')
      .filter((h: CaseProgress) => h.caseId === caseId && h.completedAt);

    if (history.length === 0) return 0;

    return Math.max(...history.map((h: CaseProgress) =>
      h.totalAnswers > 0 ? Math.round((h.correctAnswers / h.totalAnswers) * 100) : 0
    ));
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
