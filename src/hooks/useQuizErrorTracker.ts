import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface QuizError {
  questionId: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
  theme: string;
  timestamp: Date;
}

export interface QuizSession {
  id: string;
  itemCode: string;
  itemTitle: string;
  startTime: Date;
  endTime?: Date;
  errors: QuizError[];
  totalQuestions: number;
  score: number;
}

export const useQuizErrorTracker = () => {
  const [currentSession, setCurrentSession] = useState<QuizSession | null>(null);
  const [allSessions, setAllSessions] = useState<QuizSession[]>([]);
  const { toast } = useToast();

  const startQuizSession = useCallback((itemCode: string, itemTitle: string, totalQuestions: number) => {
    const session: QuizSession = {
      id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      itemCode,
      itemTitle,
      startTime: new Date(),
      errors: [],
      totalQuestions,
      score: 0
    };
    
    setCurrentSession(session);
  }, []);

  const addQuizError = useCallback((error: Omit<QuizError, 'timestamp'>) => {
    if (!currentSession) {
      return;
    }

    const fullError: QuizError = {
      ...error,
      timestamp: new Date()
    };

    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        errors: [...prev.errors, fullError]
      };
    });
  }, [currentSession]);

  const endQuizSession = useCallback(async (finalScore: number) => {
    if (!currentSession) {
      return null;
    }

    const completedSession: QuizSession = {
      ...currentSession,
      endTime: new Date(),
      score: finalScore
    };

    setAllSessions(prev => [...prev, completedSession]);
    
    // Save to Supabase with correct column names
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const timeSpent = Math.round((completedSession.endTime!.getTime() - completedSession.startTime.getTime()) / 1000);
        const correctAnswers = completedSession.totalQuestions - completedSession.errors.length;
        const scorePercentage = completedSession.totalQuestions > 0 
          ? Math.round((correctAnswers / completedSession.totalQuestions) * 100) 
          : 0;
        
        // Save to quiz_sessions for detailed tracking
        await supabase
          .from('quiz_sessions')
          .insert({
            user_id: user.id,
            item_code: completedSession.itemCode,
            rang: 'A',
            score: finalScore,
            questions_count: completedSession.totalQuestions,
            correct_answers: correctAnswers,
            time_spent_seconds: timeSpent,
            session_data: { errors: completedSession.errors, itemTitle: completedSession.itemTitle } as unknown as Json,
            completed: true
          });
        
        // Also save to quiz_results for leaderboard compatibility
        await supabase
          .from('quiz_results')
          .insert({
            user_id: user.id,
            item_code: completedSession.itemCode,
            item_title: completedSession.itemTitle,
            score: scorePercentage,
            total_questions: completedSession.totalQuestions,
            correct_answers: correctAnswers,
            wrong_answers: completedSession.errors.length,
            time_spent: timeSpent,
            performance: { percentage: scorePercentage },
            answers: completedSession.errors.map(e => ({ question: e.question, userAnswer: e.userAnswer, correct: e.correctAnswer }))
          });
        
        // Also save to revision_history for RevisionDashboard
        await supabase
          .from('revision_history')
          .insert({
            user_id: user.id,
            item_code: completedSession.itemCode,
            score: scorePercentage,
            session_date: new Date().toISOString().split('T')[0]
          });
      }
    } catch {
      // Error saving session handled silently
    }

    
    
    if (completedSession.errors.length > 0) {
      toast({
        title: "Erreurs détectées",
        description: `${completedSession.errors.length} erreur(s) enregistrée(s). Vous pouvez générer une chanson pour les réviser !`,
        variant: "default"
      });
    }

    setCurrentSession(null);
    return completedSession;
  }, [currentSession, toast]);

  const getSessionErrors = useCallback((sessionId?: string): QuizError[] => {
    if (sessionId) {
      const session = allSessions.find(s => s.id === sessionId);
      return session?.errors || [];
    }
    return currentSession?.errors || [];
  }, [currentSession, allSessions]);

  const getErrorsByTheme = useCallback((sessionId?: string): Record<string, QuizError[]> => {
    const errors = getSessionErrors(sessionId);
    return errors.reduce((acc, error) => {
      if (!acc[error.theme]) {
        acc[error.theme] = [];
      }
      acc[error.theme].push(error);
      return acc;
    }, {} as Record<string, QuizError[]>);
  }, [getSessionErrors]);

  const clearCurrentSession = useCallback(() => {
    setCurrentSession(null);
  }, []);

  const loadSavedSessions = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (data) {
        const sessions: QuizSession[] = data.map((s) => {
          const sessionData = s.session_data as { errors?: QuizError[]; itemTitle?: string } | null;
          return {
            id: s.id,
            itemCode: s.item_code || '',
            itemTitle: sessionData?.itemTitle || s.item_code || '',
            startTime: new Date(s.created_at),
            endTime: s.updated_at ? new Date(s.updated_at) : undefined,
            errors: sessionData?.errors || [],
            totalQuestions: s.questions_count || 0,
            score: s.score || 0
          };
        });
        setAllSessions(sessions);
        console.log('📚 SESSIONS CHARGÉES:', sessions.length);
      }
    } catch (error) {
      console.error('❌ Erreur chargement sessions:', error);
    }
  }, []);

  const getRecentErrors = useCallback((days: number = 7): QuizError[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return allSessions
      .filter(session => new Date(session.startTime) >= cutoffDate)
      .flatMap(session => session.errors);
  }, [allSessions]);

  // Load sessions on mount
  useEffect(() => {
    loadSavedSessions();
  }, [loadSavedSessions]);

  return {
    currentSession,
    allSessions,
    startQuizSession,
    addQuizError,
    endQuizSession,
    getSessionErrors,
    getErrorsByTheme,
    clearCurrentSession,
    loadSavedSessions,
    getRecentErrors,
    hasCurrentSession: !!currentSession,
    currentErrors: currentSession?.errors || []
  };
};