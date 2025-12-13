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
        toast({
          title: "Erreur",
          description: "Aucun item EDN trouvé pour générer les questions.",
          variant: "destructive"
        });
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

  // Specialty mapping for filtering
  const SPECIALTY_KEYWORDS: Record<string, string[]> = {
    'Cardiologie': ['cardio', 'coeur', 'coronar', 'infarctus', 'arythmie', 'hypertension', 'valv'],
    'Pneumologie': ['pneumo', 'poumon', 'respirat', 'bronch', 'asthme', 'bpco', 'pleural'],
    'Neurologie': ['neuro', 'cerveau', 'AVC', 'épilepsie', 'parkinson', 'alzheimer', 'céphalée'],
    'Gastro-entérologie': ['gastro', 'digest', 'foie', 'pancréas', 'intestin', 'colon', 'hépatite'],
    'Néphrologie': ['néphro', 'rein', 'dialyse', 'créatinine', 'glomérul', 'protéinurie'],
    'Endocrinologie': ['endocrino', 'diabète', 'thyroïde', 'surrénale', 'hypophyse'],
    'Rhumatologie': ['rhumato', 'arthr', 'arthrite', 'polyarthrite', 'goutte', 'ostéoporose'],
    'Dermatologie': ['dermato', 'peau', 'cutané', 'eczéma', 'psoriasis', 'mélanome'],
    'Pédiatrie': ['pédia', 'enfant', 'nourrisson', 'néonat', 'vaccin'],
    'Gynécologie': ['gynéco', 'obstétrique', 'grossesse', 'accouchement', 'utérus', 'ovaire'],
    'Psychiatrie': ['psychia', 'dépression', 'anxiété', 'schizophrénie', 'bipol'],
    'Urgences': ['urgence', 'réanimation', 'choc', 'arrêt cardiaque', 'polytrauma']
  };

  // Start an AI-powered exam with specialty filters and adaptive difficulty
  const startAIExam = useCallback(async (
    userId: string,
    examType: string = 'ai_generated',
    questionCount: number = 10,
    timeLimitMinutes: number = 20,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    specificItems?: string[],
    specialty?: string
  ): Promise<AIExamSession | null> => {
    setLoading(true);
    try {
      // Get items to use
      let itemCodes = specificItems;
      
      if (!itemCodes || itemCodes.length === 0) {
        // Get all items first
        const { data: allItems } = await supabase
          .from('edn_items_immersive')
          .select('item_code, title')
          .limit(500);

        if (!allItems || allItems.length === 0) {
          throw new Error('No items available');
        }

        let filteredItems = allItems;

        // Filter by specialty if provided
        if (specialty && SPECIALTY_KEYWORDS[specialty]) {
          const keywords = SPECIALTY_KEYWORDS[specialty];
          filteredItems = allItems.filter(item => {
            const titleLower = (item.title || '').toLowerCase();
            return keywords.some(kw => titleLower.includes(kw.toLowerCase()));
          });
          
          // Fallback to all items if filter returns too few
          if (filteredItems.length < 5) {
            filteredItems = allItems;
            toast({
              title: "Filtre élargi",
              description: `Pas assez d'items pour ${specialty}, sélection élargie.`,
            });
          }
        }

        // Shuffle and pick
        const shuffled = filteredItems.sort(() => Math.random() - 0.5);
        itemCodes = shuffled.slice(0, Math.min(questionCount * 2, 20)).map(i => i.item_code);
      }

      // Adaptive difficulty: adjust based on user's past performance
      let adaptedDifficulty = difficulty;
      try {
        const { data: history } = await (supabase as any)
          .from('ai_exam_history')
          .select('score')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(5);
        
        if (history && history.length >= 3) {
          const avgScore = history.reduce((sum: number, h: any) => sum + (h.score || 0), 0) / history.length;
          if (avgScore >= 85 && difficulty !== 'hard') {
            adaptedDifficulty = 'hard';
            toast({
              title: "Difficulté adaptée",
              description: "Niveau augmenté suite à vos excellentes performances !",
            });
          } else if (avgScore < 50 && difficulty !== 'easy') {
            adaptedDifficulty = 'easy';
            toast({
              title: "Difficulté adaptée",
              description: "Niveau ajusté pour vous aider à progresser.",
            });
          }
        }
      } catch (e) {
        console.log('Could not adapt difficulty:', e);
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

    // Save to Supabase
    try {
      await (supabase as any)
        .from('ai_exam_history')
        .insert({
          user_id: session.userId,
          exam_type: session.examType,
          questions: session.questions,
          answers: session.answers,
          total_questions: session.totalQuestions,
          time_limit_minutes: session.timeLimitMinutes,
          score,
          started_at: session.startedAt,
          completed_at: completedSession.completedAt,
          ai_generated: session.aiGenerated
        });
    } catch (e) {
      console.error('Error saving exam history:', e);
    }

    return completedSession;
  }, [session, logActivity]);

  // Get exam history from Supabase
  const getExamHistory = useCallback(async (userId: string): Promise<AIExamSession[]> => {
    try {
      const { data } = await (supabase as any)
        .from('ai_exam_history')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(50);

      return (data || []).map((e: any) => ({
        id: e.id,
        userId: e.user_id,
        examType: e.exam_type,
        questions: e.questions,
        answers: e.answers,
        totalQuestions: e.total_questions,
        timeLimitMinutes: e.time_limit_minutes,
        startedAt: e.started_at,
        completedAt: e.completed_at,
        score: e.score,
        aiGenerated: e.ai_generated
      }));
    } catch (error) {
      console.error('Error fetching exam history:', error);
      return [];
    }
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
