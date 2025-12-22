import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ExamQuestion {
  id: string;
  item_code: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ExamSession {
  id: string;
  user_id: string;
  exam_type: string;
  total_questions: number;
  time_limit_minutes: number;
  started_at: string;
  completed_at?: string;
  score?: number;
  answers: Record<string, { selected: number; correct: boolean; timeSpent: number }>;
}

export interface ExamStats {
  totalExams: number;
  averageScore: number;
  bestScore: number;
  totalQuestions: number;
  correctAnswers: number;
  byDifficulty: { easy: number; medium: number; hard: number };
  recentExams: Array<{ date: string; score: number; duration: number }>;
  weakTopics: Array<{ item_code: string; title: string; errorRate: number }>;
}

export const useExamMode = () => {
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<ExamSession | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const { toast } = useToast();

  // Generate exam questions from items
  const generateQuestions = useCallback(async (
    itemCodes: string[],
    count: number = 20
  ): Promise<ExamQuestion[]> => {
    try {
      const { data: items } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title, tableau_rang_a, tableau_rang_b')
        .in('item_code', itemCodes)
        .limit(count);

      if (!items) return [];

      const questions: ExamQuestion[] = items.map((item, index) => {
        const competences: string[] = [];
        const tableauA = item.tableau_rang_a as any;
        
        if (tableauA?.competences_cles) {
          tableauA.competences_cles.forEach((c: any) => {
            if (c.intitule) competences.push(c.intitule);
          });
        }

        // Generate a QCM from competences
        const correctAnswer = Math.floor(Math.random() * 4);
        const options = Array(4).fill('').map((_, i) => {
          if (i === correctAnswer) {
            return competences[0] || `Compétence principale de ${item.title}`;
          }
          return `Option ${String.fromCharCode(65 + i)} - Distractor`;
        });

        return {
          id: `q-${item.item_code}-${index}`,
          item_code: item.item_code,
          question_text: `Quelle est la compétence principale de l'item "${item.title}" ?`,
          options,
          correct_answer: correctAnswer,
          explanation: competences.slice(0, 3).join(', ') || 'Voir le référentiel EDN',
          difficulty: index % 3 === 0 ? 'easy' : index % 3 === 1 ? 'medium' : 'hard'
        };
      });

      return questions;
    } catch (error) {
      console.error('Error generating questions:', error);
      return [];
    }
  }, []);

  // Start a new exam
  const startExam = useCallback(async (
    userId: string,
    examType: string = 'standard',
    questionCount: number = 20,
    timeLimitMinutes: number = 30
  ) => {
    setLoading(true);
    try {
      // Get random items for the exam
      const { data: allItems } = await supabase
        .from('edn_items_immersive')
        .select('item_code')
        .limit(100);

      if (!allItems || allItems.length === 0) {
        throw new Error('No items available');
      }

      // Shuffle and pick items
      const shuffled = allItems.sort(() => Math.random() - 0.5);
      const selectedCodes = shuffled.slice(0, questionCount).map(i => i.item_code);

      // Generate questions
      const examQuestions = await generateQuestions(selectedCodes, questionCount);
      setQuestions(examQuestions);

      // Create session
      const session: ExamSession = {
        id: crypto.randomUUID(),
        user_id: userId,
        exam_type: examType,
        total_questions: examQuestions.length,
        time_limit_minutes: timeLimitMinutes,
        started_at: new Date().toISOString(),
        answers: {}
      };

      setCurrentSession(session);
      return session;
    } catch (error) {
      console.error('Error starting exam:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'examen",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [generateQuestions, toast]);

  // Submit an answer
  const submitAnswer = useCallback((
    questionId: string,
    selectedAnswer: number,
    timeSpent: number
  ) => {
    if (!currentSession) return;

    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const isCorrect = selectedAnswer === question.correct_answer;

    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: {
            selected: selectedAnswer,
            correct: isCorrect,
            timeSpent
          }
        }
      };
    });

    return isCorrect;
  }, [currentSession, questions]);

  // Complete the exam
  const completeExam = useCallback(async () => {
    if (!currentSession) return null;

    const totalCorrect = Object.values(currentSession.answers).filter(a => a.correct).length;
    const score = Math.round((totalCorrect / currentSession.total_questions) * 100);

    const completedSession = {
      ...currentSession,
      completed_at: new Date().toISOString(),
      score
    };

    setCurrentSession(completedSession);

    // Save to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase as any)
          .from('exam_history')
          .insert({
            user_id: user.id,
            exam_type: 'standard',
            questions: questions.map(q => ({ ...q, userAnswer: currentSession.answers[q.id] })),
            answers: currentSession.answers,
            total_questions: questions.length,
            score: completedSession.score,
            time_limit_minutes: currentSession.time_limit_minutes,
            started_at: currentSession.started_at,
            completed_at: completedSession.completed_at
          });
      }
    } catch (e) {
      console.error('Error saving exam history:', e);
    }

    return completedSession;
  }, [currentSession, questions]);

  // Get exam statistics from Supabase
  const getStats = useCallback(async (userId: string): Promise<ExamStats> => {
    try {
      const { data: history } = await (supabase as any)
        .from('exam_history')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(50);

      if (!history || history.length === 0) {
        return {
          totalExams: 0,
          averageScore: 0,
          bestScore: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          byDifficulty: { easy: 0, medium: 0, hard: 0 },
          recentExams: [],
          weakTopics: []
        };
      }

      const scores = history.map((e: any) => e.score || 0);
      const totalQuestions = history.reduce((sum: number, e: any) => 
        sum + (e.questions?.length || 0), 0);
      const correctAnswers = history.reduce((sum: number, e: any) => 
        sum + Object.values(e.answers || {}).filter((a: any) => a.correct).length, 0);

      const errorsByItem: Record<string, { errors: number; total: number; title: string }> = {};
      history.forEach((exam: any) => {
        exam.questions?.forEach((q: any) => {
          const answer = exam.answers?.[q.id];
          if (!errorsByItem[q.item_code]) {
            errorsByItem[q.item_code] = { errors: 0, total: 0, title: q.question_text?.split('"')[1] || q.item_code };
          }
          errorsByItem[q.item_code].total++;
          if (answer && !answer.correct) {
            errorsByItem[q.item_code].errors++;
          }
        });
      });

      const weakTopics = Object.entries(errorsByItem)
        .map(([item_code, data]) => ({
          item_code,
          title: data.title,
          errorRate: data.total > 0 ? data.errors / data.total : 0
        }))
        .filter(t => t.errorRate > 0.3)
        .sort((a, b) => b.errorRate - a.errorRate)
        .slice(0, 5);

      return {
        totalExams: history.length,
        averageScore: Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length),
        bestScore: Math.max(...scores),
        totalQuestions,
        correctAnswers,
        byDifficulty: { easy: 0, medium: 0, hard: 0 },
        recentExams: history.slice(0, 5).map((e: any) => ({
          date: e.completed_at || e.started_at,
          score: e.score || 0,
          duration: e.time_limit_minutes || 30
        })),
        weakTopics
      };
    } catch (error) {
      console.error('Error fetching exam stats:', error);
      return {
        totalExams: 0, averageScore: 0, bestScore: 0, totalQuestions: 0, correctAnswers: 0,
        byDifficulty: { easy: 0, medium: 0, hard: 0 }, recentExams: [], weakTopics: []
      };
    }
  }, []);

  // Reset exam
  const resetExam = useCallback(() => {
    setCurrentSession(null);
    setQuestions([]);
  }, []);

  // Get current question
  const getCurrentQuestion = useCallback((index: number): ExamQuestion | null => {
    return questions[index] || null;
  }, [questions]);

  // Get answered questions count
  const getAnsweredCount = useCallback((): number => {
    return currentSession ? Object.keys(currentSession.answers).length : 0;
  }, [currentSession]);

  // Get remaining time
  const getRemainingTime = useCallback((): number => {
    if (!currentSession) return 0;
    const startTime = new Date(currentSession.started_at).getTime();
    const elapsed = Date.now() - startTime;
    const limitMs = currentSession.time_limit_minutes * 60 * 1000;
    return Math.max(0, limitMs - elapsed);
  }, [currentSession]);

  // Check if time is up
  const isTimeUp = useCallback((): boolean => {
    return getRemainingTime() === 0;
  }, [getRemainingTime]);

  // Get progress percentage
  const getProgress = useCallback((): number => {
    if (!currentSession || questions.length === 0) return 0;
    return Math.round((getAnsweredCount() / questions.length) * 100);
  }, [currentSession, questions, getAnsweredCount]);

  // Get current score (during exam)
  const getCurrentScore = useCallback((): number => {
    if (!currentSession) return 0;
    const correct = Object.values(currentSession.answers).filter(a => a.correct).length;
    const total = Object.keys(currentSession.answers).length;
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  }, [currentSession]);

  // Get average time per question
  const getAverageTimePerQuestion = useCallback((): number => {
    if (!currentSession) return 0;
    const answers = Object.values(currentSession.answers);
    if (answers.length === 0) return 0;
    const totalTime = answers.reduce((sum, a) => sum + a.timeSpent, 0);
    return Math.round(totalTime / answers.length);
  }, [currentSession]);

  // Get questions by difficulty
  const getQuestionsByDifficulty = useCallback((difficulty: ExamQuestion['difficulty']): ExamQuestion[] => {
    return questions.filter(q => q.difficulty === difficulty);
  }, [questions]);

  // Check if question is answered
  const isQuestionAnswered = useCallback((questionId: string): boolean => {
    return currentSession ? !!currentSession.answers[questionId] : false;
  }, [currentSession]);

  // Get answer for a question
  const getAnswer = useCallback((questionId: string) => {
    return currentSession?.answers[questionId] || null;
  }, [currentSession]);

  // Get unanswered questions
  const getUnansweredQuestions = useCallback((): ExamQuestion[] => {
    return questions.filter(q => !isQuestionAnswered(q.id));
  }, [questions, isQuestionAnswered]);

  // Skip to next unanswered
  const getNextUnansweredIndex = useCallback((currentIndex: number): number => {
    for (let i = currentIndex + 1; i < questions.length; i++) {
      if (!isQuestionAnswered(questions[i].id)) return i;
    }
    for (let i = 0; i < currentIndex; i++) {
      if (!isQuestionAnswered(questions[i].id)) return i;
    }
    return currentIndex;
  }, [questions, isQuestionAnswered]);

  // Pause exam (save state to Supabase)
  const pauseExam = useCallback(async () => {
    if (currentSession) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await (supabase as any)
            .from('exam_paused_sessions')
            .upsert({
              user_id: user.id,
              session_data: currentSession,
              questions: questions,
              paused_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
        }
      } catch (e) {
        console.error('Error pausing exam:', e);
      }
    }
  }, [currentSession, questions]);

  // Resume paused exam from Supabase
  const resumeExam = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await (supabase as any)
        .from('exam_paused_sessions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setCurrentSession(data.session_data);
        setQuestions(data.questions);
        await (supabase as any)
          .from('exam_paused_sessions')
          .delete()
          .eq('user_id', user.id);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  // Check if has paused exam in Supabase
  const hasPausedExam = useCallback(async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await (supabase as any)
        .from('exam_paused_sessions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      return !!data;
    } catch (error) {
      return false;
    }
  }, []);

  // Export exam results
  const exportResults = useCallback((): string => {
    if (!currentSession) return '{}';

    return JSON.stringify({
      exportDate: new Date().toISOString(),
      session: {
        ...currentSession,
        questions: questions.map(q => ({
          ...q,
          userAnswer: currentSession.answers[q.id]
        }))
      }
    }, null, 2);
  }, [currentSession, questions]);

  // Get exam types available
  const getExamTypes = useCallback((): { id: string; name: string; description: string }[] => {
    return [
      { id: 'standard', name: 'Examen Standard', description: '20 questions, 30 minutes' },
      { id: 'quick', name: 'Quiz Rapide', description: '10 questions, 15 minutes' },
      { id: 'intensive', name: 'Examen Intensif', description: '40 questions, 60 minutes' },
      { id: 'difficulty_progressive', name: 'Progressif', description: 'Difficulté croissante' },
      { id: 'rang_a_only', name: 'Rang A uniquement', description: 'Focus rang A' },
      { id: 'rang_b_only', name: 'Rang B uniquement', description: 'Focus rang B' }
    ];
  }, []);

  // Get difficulty distribution
  const getDifficultyDistribution = useCallback((): { easy: number; medium: number; hard: number } => {
    return {
      easy: questions.filter(q => q.difficulty === 'easy').length,
      medium: questions.filter(q => q.difficulty === 'medium').length,
      hard: questions.filter(q => q.difficulty === 'hard').length
    };
  }, [questions]);

  // Check if exam is in progress
  const isExamInProgress = useCallback((): boolean => {
    return !!currentSession && !currentSession.completed_at;
  }, [currentSession]);

  // Get total time spent
  const getTotalTimeSpent = useCallback((): number => {
    if (!currentSession) return 0;
    return Object.values(currentSession.answers).reduce((sum, a) => sum + a.timeSpent, 0);
  }, [currentSession]);

  return {
    loading,
    currentSession,
    questions,
    startExam,
    submitAnswer,
    completeExam,
    getStats,
    resetExam,
    getCurrentQuestion,
    getAnsweredCount,
    getRemainingTime,
    isTimeUp,
    getProgress,
    getCurrentScore,
    getAverageTimePerQuestion,
    getQuestionsByDifficulty,
    isQuestionAnswered,
    getAnswer,
    getUnansweredQuestions,
    getNextUnansweredIndex,
    pauseExam,
    resumeExam,
    hasPausedExam,
    exportResults,
    getExamTypes,
    getDifficultyDistribution,
    isExamInProgress,
    getTotalTimeSpent
  };
};
