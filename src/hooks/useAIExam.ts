import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useActivityTracking } from '@/hooks/useActivityTracking';

export interface AIQuestion {
  id: string;
  item_code: string;
  question_text: string;
  options: string[];
  correct_answers: number[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AIExamSession {
  id: string;
  userId: string;
  examType: string;
  questions: AIQuestion[];
  answers: Record<string, { selected: number[]; correct: boolean; timeSpent: number }>;
  totalQuestions: number;
  timeLimitMinutes: number;
  startedAt: string;
  completedAt?: string;
  score?: number;
  aiGenerated: boolean;
}

export const useAIExam = () => {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [session, setSession] = useState<AIExamSession | null>(null);
  const { toast } = useToast();
  const { logActivity } = useActivityTracking();

  // Generate AI questions via edge function
  const generateAIQuestions = useCallback(async (
    itemCodes: string[],
    count: number = 10,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<AIQuestion[]> => {
    setGenerating(true);
    try {
      // Fetch item details first
      const { data: items, error: itemsError } = await supabase
        .from('edn_items_immersive')
        .select('item_code, title, tableau_rang_a, tableau_rang_b')
        .in('item_code', itemCodes);

      if (itemsError || !items || items.length === 0) {
        console.error('Error fetching items:', itemsError);
        return [];
      }

      // Prepare items data for the edge function
      const preparedItems = items.map(item => {
        const tableauA = item.tableau_rang_a as any;
        const tableauB = item.tableau_rang_b as any;
        
        return {
          item_code: item.item_code,
          title: item.title,
          competences_a: tableauA?.competences_cles?.map((c: any) => c.intitule).filter(Boolean) || [],
          competences_b: tableauB?.competences_cles?.map((c: any) => c.intitule).filter(Boolean) || []
        };
      });

      // Call edge function
      const { data, error } = await supabase.functions.invoke('generate-qcm', {
        body: { 
          items: preparedItems,
          count,
          difficulty
        }
      });

      if (error) {
        console.error('Error generating QCM:', error);
        toast({
          title: "Erreur de génération",
          description: "Impossible de générer les QCM. Veuillez réessayer.",
          variant: "destructive"
        });
        return [];
      }

      return data?.questions || [];
    } catch (error) {
      console.error('Error in generateAIQuestions:', error);
      return [];
    } finally {
      setGenerating(false);
    }
  }, [toast]);

  // Start an AI-powered exam
  const startAIExam = useCallback(async (
    userId: string,
    examType: string = 'ai_generated',
    questionCount: number = 10,
    timeLimitMinutes: number = 20,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    specificItems?: string[]
  ): Promise<AIExamSession | null> => {
    setLoading(true);
    try {
      // Get items to use
      let itemCodes = specificItems;
      
      if (!itemCodes || itemCodes.length === 0) {
        // Get random items
        const { data: allItems } = await supabase
          .from('edn_items_immersive')
          .select('item_code')
          .limit(50);

        if (!allItems || allItems.length === 0) {
          throw new Error('No items available');
        }

        // Shuffle and pick
        const shuffled = allItems.sort(() => Math.random() - 0.5);
        itemCodes = shuffled.slice(0, Math.min(questionCount * 2, 20)).map(i => i.item_code);
      }

      // Generate AI questions
      const questions = await generateAIQuestions(itemCodes, questionCount, difficulty);

      if (questions.length === 0) {
        toast({
          title: "Erreur",
          description: "Impossible de générer les questions. Veuillez réessayer.",
          variant: "destructive"
        });
        return null;
      }

      // Create session
      const newSession: AIExamSession = {
        id: crypto.randomUUID(),
        userId,
        examType,
        questions,
        answers: {},
        totalQuestions: questions.length,
        timeLimitMinutes,
        startedAt: new Date().toISOString(),
        aiGenerated: true
      };

      setSession(newSession);

      toast({
        title: "Examen IA démarré",
        description: `${questions.length} questions générées par l'IA`,
      });

      return newSession;
    } catch (error) {
      console.error('Error starting AI exam:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'examen",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [generateAIQuestions, toast]);

  // Submit answer (supports multiple correct answers)
  const submitAnswer = useCallback((
    questionId: string,
    selectedAnswers: number[],
    timeSpent: number
  ): boolean => {
    if (!session) return false;

    const question = session.questions.find(q => q.id === questionId);
    if (!question) return false;

    // Check if all correct answers are selected and no incorrect ones
    const correctSet = new Set(question.correct_answers);
    const selectedSet = new Set(selectedAnswers);
    
    const isCorrect = 
      correctSet.size === selectedSet.size &&
      [...correctSet].every(c => selectedSet.has(c));

    setSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        answers: {
          ...prev.answers,
          [questionId]: {
            selected: selectedAnswers,
            correct: isCorrect,
            timeSpent
          }
        }
      };
    });

    return isCorrect;
  }, [session]);

  // Complete exam
  const completeExam = useCallback(async (): Promise<AIExamSession | null> => {
    if (!session) return null;

    const totalCorrect = Object.values(session.answers).filter(a => a.correct).length;
    const score = Math.round((totalCorrect / session.totalQuestions) * 100);

    const completedSession: AIExamSession = {
      ...session,
      completedAt: new Date().toISOString(),
      score
    };

    setSession(completedSession);

    // Log activity
    const totalTime = Object.values(session.answers).reduce((sum, a) => sum + a.timeSpent, 0);
    await logActivity({
      activity_type: 'exam',
      count: 1,
      duration_seconds: Math.round(totalTime / 1000),
      score,
      metadata: {
        exam_type: session.examType,
        questions_count: session.totalQuestions,
        ai_generated: true
      }
    });

    // Save to local storage
    const history = JSON.parse(localStorage.getItem('ai_exam_history') || '[]');
    history.push(completedSession);
    localStorage.setItem('ai_exam_history', JSON.stringify(history.slice(-50)));

    return completedSession;
  }, [session, logActivity]);

  // Get exam history
  const getExamHistory = useCallback((userId: string) => {
    const history = JSON.parse(localStorage.getItem('ai_exam_history') || '[]');
    return history.filter((e: AIExamSession) => e.userId === userId);
  }, []);

  // Reset
  const resetExam = useCallback(() => {
    setSession(null);
  }, []);

  return {
    loading,
    generating,
    session,
    startAIExam,
    submitAnswer,
    completeExam,
    getExamHistory,
    resetExam,
    generateAIQuestions
  };
};
