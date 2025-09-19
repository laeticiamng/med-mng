import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { toRateLimitError } from '@/utils/errors/rateLimit';

export interface QuizSessionData {
  id: string;
  user_id: string;
  item_code: string;
  rang: 'A' | 'B' | 'mix';
  score: number;
  questions_count: number;
  correct_answers: number;
  time_spent_seconds: number | null;
  session_data: any;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizSessionStats {
  totalSessions: number;
  completedSessions: number;
  averageScore: number;
  averageTimeSpent: number;
  bestScore: number;
  worstScore: number;
  totalTimeSpent: number;
  sessionsByItem: Record<string, number>;
  sessionsByRang: Record<string, number>;
  recentSessions: QuizSessionData[];
}

export const useQuizSessions = () => {
  const [sessions, setSessions] = useState<QuizSessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les sessions de l'utilisateur
  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('quiz_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setSessions((data || []) as QuizSessionData[]);
    } catch (err) {
      const rateLimitError = toRateLimitError(err, 'Historique des quiz temporairement indisponible.', 'quiz');
      if (rateLimitError) {
        setError(rateLimitError.message);
        toast.warning(rateLimitError.message);
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des sessions';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Charger les sessions pour un item spécifique
  const loadSessionsForItem = async (itemCode: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('item_code', itemCode)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setSessions((data || []) as QuizSessionData[]);
    } catch (err) {
      const rateLimitError = toRateLimitError(err, 'Historique des quiz temporairement indisponible.', 'quiz');
      if (rateLimitError) {
        setError(rateLimitError.message);
        toast.warning(rateLimitError.message);
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des sessions';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder une nouvelle session
  const saveSession = async (sessionData: Omit<QuizSessionData, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error: insertError } = await supabase
        .from('quiz_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Ajouter la nouvelle session à la liste
      setSessions(prev => [data as QuizSessionData, ...prev]);
      toast.success('Session de quiz sauvegardée avec succès');
      
      return data;
    } catch (err) {
      const rateLimitError = toRateLimitError(err, 'Limite atteinte pour la sauvegarde des résultats de quiz.', 'quiz');
      if (rateLimitError) {
        setError(rateLimitError.message);
        toast.warning(rateLimitError.message);
        throw rateLimitError;
      }

      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err instanceof Error ? err : new Error(errorMessage);
    }
  };

  // Mettre à jour une session existante
  const updateSession = async (sessionId: string, updates: Partial<QuizSessionData>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('quiz_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Mettre à jour la session dans la liste
      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId ? { ...session, ...(data as QuizSessionData) } : session
        )
      );

      toast.success('Session mise à jour avec succès');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Supprimer une session
  const deleteSession = async (sessionId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('quiz_sessions')
        .delete()
        .eq('id', sessionId);

      if (deleteError) {
        throw deleteError;
      }

      // Retirer la session de la liste
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Session supprimée avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    }
  };

  // Calculer les statistiques
  const getStats = (): QuizSessionStats => {
    const completedSessions = sessions.filter(s => s.completed);
    const scores = completedSessions.map(s => s.score);
    const timeSpents = completedSessions
      .map(s => s.time_spent_seconds)
      .filter((time): time is number => time !== null);

    const sessionsByItem = sessions.reduce((acc, session) => {
      acc[session.item_code] = (acc[session.item_code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sessionsByRang = sessions.reduce((acc, session) => {
      acc[session.rang] = (acc[session.rang] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      averageTimeSpent: timeSpents.length > 0 ? timeSpents.reduce((a, b) => a + b, 0) / timeSpents.length : 0,
      bestScore: scores.length > 0 ? Math.max(...scores) : 0,
      worstScore: scores.length > 0 ? Math.min(...scores) : 0,
      totalTimeSpent: timeSpents.reduce((a, b) => a + b, 0),
      sessionsByItem,
      sessionsByRang,
      recentSessions: sessions.slice(0, 10)
    };
  };

  // Obtenir la meilleure session pour un item
  const getBestSessionForItem = (itemCode: string, rang?: string) => {
    const itemSessions = sessions.filter(s => 
      s.item_code === itemCode && 
      s.completed &&
      (rang ? s.rang === rang : true)
    );
    
    if (itemSessions.length === 0) return null;
    
    return itemSessions.reduce((best, current) => 
      current.score > best.score ? current : best
    );
  };

  // Obtenir l'historique des tentatives pour un item
  const getItemHistory = (itemCode: string) => {
    return sessions
      .filter(s => s.item_code === itemCode)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  // Vérifier si l'utilisateur s'améliore
  const getProgressTrend = (itemCode: string) => {
    const history = getItemHistory(itemCode).filter(s => s.completed);
    if (history.length < 2) return 'insufficient_data';

    const recent = history.slice(0, 3);
    const older = history.slice(3, 6);

    if (recent.length === 0 || older.length === 0) return 'insufficient_data';

    const recentAverage = recent.reduce((sum, s) => sum + s.score, 0) / recent.length;
    const olderAverage = older.reduce((sum, s) => sum + s.score, 0) / older.length;

    if (recentAverage > olderAverage * 1.1) return 'improving';
    if (recentAverage < olderAverage * 0.9) return 'declining';
    return 'stable';
  };

  // Charger les sessions au montage du composant
  useEffect(() => {
    loadSessions();
  }, []);

  return {
    sessions,
    loading,
    error,
    loadSessions,
    loadSessionsForItem,
    saveSession,
    updateSession,
    deleteSession,
    getStats,
    getBestSessionForItem,
    getItemHistory,
    getProgressTrend
  };
};