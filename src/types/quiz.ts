/**
 * Types pour le système de quiz interactif
 */

export interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'text' | 'matching';
  options?: string[];
  correct: number | string | string[];
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // en secondes
  points: number;
  category?: string;
  tags?: string[];
  multimedia?: {
    image?: string;
    video?: string;
    audio?: string;
  };
}

export interface QuizSession {
  id: string;
  userId: string;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, any>;
  startTime: Date;
  endTime?: Date;
  score?: number;
  timeSpent: number;
  completed: boolean;
}

export interface QuizResult {
  sessionId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  passed: boolean;
  feedback: string;
  detailedResults: QuestionResult[];
}

export interface QuestionResult {
  questionId: string;
  userAnswer: any;
  correctAnswer: any;
  isCorrect: boolean;
  points: number;
  timeSpent: number;
  explanation?: string;
}

export interface QuizConfig {
  timeLimit?: number;
  questionsCount?: number;
  passingScore?: number;
  randomOrder?: boolean;
  showExplanations?: boolean;
  allowRetry?: boolean;
}