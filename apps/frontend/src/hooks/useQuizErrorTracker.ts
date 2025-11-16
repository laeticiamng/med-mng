import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

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
    console.log('🎯 QUIZ SESSION DÉMARRÉE:', session);
  }, []);

  const addQuizError = useCallback((error: Omit<QuizError, 'timestamp'>) => {
    if (!currentSession) {
      console.warn('⚠️ Tentative d\'ajout d\'erreur sans session active');
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

    console.log('❌ ERREUR AJOUTÉE:', fullError);
  }, [currentSession]);

  const endQuizSession = useCallback((finalScore: number) => {
    if (!currentSession) {
      console.warn('⚠️ Tentative de fin de session sans session active');
      return null;
    }

    const completedSession: QuizSession = {
      ...currentSession,
      endTime: new Date(),
      score: finalScore
    };

    setAllSessions(prev => [...prev, completedSession]);
    
    // Sauvegarder dans le localStorage
    try {
      const savedSessions = localStorage.getItem('quiz_sessions');
      const sessions = savedSessions ? JSON.parse(savedSessions) : [];
      sessions.push(completedSession);
      localStorage.setItem('quiz_sessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('❌ Erreur sauvegarde session:', error);
    }

    console.log('✅ QUIZ SESSION TERMINÉE:', completedSession);
    
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

  const loadSavedSessions = useCallback(() => {
    try {
      const savedSessions = localStorage.getItem('quiz_sessions');
      if (savedSessions) {
        const sessions = JSON.parse(savedSessions);
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