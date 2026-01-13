import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizResult {
  id: string;
  itemId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // seconds
  completedAt: string;
  answers: { questionId: string; selectedIndex: number; correct: boolean }[];
}

interface QuizState {
  currentQuiz: {
    itemId: string;
    questions: QuizQuestion[];
    currentIndex: number;
    answers: { questionId: string; selectedIndex: number }[];
    startTime: string;
  } | null;
  results: QuizResult[];
  stats: {
    totalQuizzes: number;
    totalQuestions: number;
    correctAnswers: number;
    averageScore: number;
    bestScore: number;
  };

  // Actions
  startQuiz: (itemId: string, questions: QuizQuestion[]) => void;
  answerQuestion: (selectedIndex: number) => void;
  nextQuestion: () => void;
  finishQuiz: () => QuizResult | null;
  getResultsByItem: (itemId: string) => QuizResult[];
  reset: () => void;
}

const generateId = () => `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      currentQuiz: null,
      results: [],
      stats: {
        totalQuizzes: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        averageScore: 0,
        bestScore: 0,
      },

      startQuiz: (itemId, questions) => {
        set({
          currentQuiz: {
            itemId,
            questions,
            currentIndex: 0,
            answers: [],
            startTime: new Date().toISOString(),
          },
        });
      },

      answerQuestion: (selectedIndex) => {
        const { currentQuiz } = get();
        if (!currentQuiz) return;

        const currentQuestion = currentQuiz.questions[currentQuiz.currentIndex];
        set({
          currentQuiz: {
            ...currentQuiz,
            answers: [
              ...currentQuiz.answers,
              { questionId: currentQuestion.id, selectedIndex },
            ],
          },
        });
      },

      nextQuestion: () => {
        const { currentQuiz } = get();
        if (!currentQuiz) return;

        set({
          currentQuiz: {
            ...currentQuiz,
            currentIndex: currentQuiz.currentIndex + 1,
          },
        });
      },

      finishQuiz: () => {
        const { currentQuiz, results, stats } = get();
        if (!currentQuiz) return null;

        const endTime = new Date();
        const timeSpent = Math.floor(
          (endTime.getTime() - new Date(currentQuiz.startTime).getTime()) / 1000
        );

        const answersWithCorrect = currentQuiz.answers.map((answer) => {
          const question = currentQuiz.questions.find((q) => q.id === answer.questionId);
          return {
            ...answer,
            correct: question?.correctIndex === answer.selectedIndex,
          };
        });

        const correctAnswers = answersWithCorrect.filter((a) => a.correct).length;
        const totalQuestions = currentQuiz.questions.length;
        const score = Math.round((correctAnswers / totalQuestions) * 100);

        const result: QuizResult = {
          id: generateId(),
          itemId: currentQuiz.itemId,
          score,
          totalQuestions,
          correctAnswers,
          timeSpent,
          completedAt: endTime.toISOString(),
          answers: answersWithCorrect,
        };

        const newTotalQuizzes = stats.totalQuizzes + 1;
        const newTotalQuestions = stats.totalQuestions + totalQuestions;
        const newCorrectAnswers = stats.correctAnswers + correctAnswers;

        set({
          currentQuiz: null,
          results: [...results, result],
          stats: {
            totalQuizzes: newTotalQuizzes,
            totalQuestions: newTotalQuestions,
            correctAnswers: newCorrectAnswers,
            averageScore: Math.round((newCorrectAnswers / newTotalQuestions) * 100),
            bestScore: Math.max(stats.bestScore, score),
          },
        });

        return result;
      },

      getResultsByItem: (itemId) => {
        return get().results.filter((r) => r.itemId === itemId);
      },

      reset: () =>
        set({
          currentQuiz: null,
          results: [],
          stats: {
            totalQuizzes: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            averageScore: 0,
            bestScore: 0,
          },
        }),
    }),
    {
      name: 'medmng-quiz',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
