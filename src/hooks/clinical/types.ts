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
