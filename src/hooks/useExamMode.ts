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

    // Save to local storage for history (no DB table yet)
    const history = JSON.parse(localStorage.getItem('exam_history') || '[]');
    history.push({
      ...completedSession,
      questions: questions.map(q => ({
        ...q,
        userAnswer: currentSession.answers[q.id]
      }))
    });
    localStorage.setItem('exam_history', JSON.stringify(history.slice(-50)));

    return completedSession;
  }, [currentSession, questions]);

  // Get exam statistics
  const getStats = useCallback((userId: string): ExamStats => {
    const history = JSON.parse(localStorage.getItem('exam_history') || '[]')
      .filter((e: any) => e.user_id === userId);

    if (history.length === 0) {
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

    const scores = history.map((e: ExamSession) => e.score || 0);
    const totalQuestions = history.reduce((sum: number, e: any) => 
      sum + (e.questions?.length || 0), 0);
    const correctAnswers = history.reduce((sum: number, e: any) => 
      sum + Object.values(e.answers || {}).filter((a: any) => a.correct).length, 0);

    // Calculate weak topics
    const errorsByItem: Record<string, { errors: number; total: number; title: string }> = {};
    history.forEach((exam: any) => {
      exam.questions?.forEach((q: any) => {
        const answer = exam.answers?.[q.id];
        if (!errorsByItem[q.item_code]) {
          errorsByItem[q.item_code] = { errors: 0, total: 0, title: q.question_text.split('"')[1] || q.item_code };
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
      recentExams: history.slice(-5).map((e: any) => ({
        date: e.completed_at || e.started_at,
        score: e.score || 0,
        duration: e.time_limit_minutes || 30
      })),
      weakTopics
    };
  }, []);

  // Reset exam
  const resetExam = useCallback(() => {
    setCurrentSession(null);
    setQuestions([]);
  }, []);

  return {
    loading,
    currentSession,
    questions,
    startExam,
    submitAnswer,
    completeExam,
    getStats,
    resetExam
  };
};
