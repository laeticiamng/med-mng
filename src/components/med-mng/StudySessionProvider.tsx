import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthProvider';

interface StudySession {
  id: string;
  started_at: string;
  ended_at?: string;
  duration_minutes?: number;
  songs_played: number;
  completion_rate: number;
  focus_score: number;
  study_mode: string;
}

interface StudySessionContextType {
  currentSession: StudySession | null;
  isStudying: boolean;
  startSession: (mode: string) => Promise<void>;
  endSession: () => Promise<void>;
  logSongPlay: (songId: string) => void;
  updateFocusScore: (score: number) => void;
  getSessionStats: () => Promise<any[]>;
}

const StudySessionContext = createContext<StudySessionContextType | null>(null);

export const StudySessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [isStudying, setIsStudying] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Auto-save session progress every 30 seconds
  useEffect(() => {
    if (!currentSession || !isStudying) return;

    const interval = setInterval(() => {
      if (currentSession) {
        const duration = Math.floor((Date.now() - new Date(currentSession.started_at).getTime()) / 60000);
        setCurrentSession(prev => prev ? { ...prev, duration_minutes: duration } : null);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentSession, isStudying]);

  const startSession = useCallback(async (mode: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('med_mng_study_sessions' as any)
        .insert({
          user_id: user.id,
          study_mode: mode,
          started_at: new Date().toISOString(),
          songs_played: 0,
          completion_rate: 0,
          focus_score: 0
        })
        .select()
        .single();

      if (error) throw error;

      if (data && typeof data === 'object') {
        setCurrentSession(data as StudySession);
      }
      setIsStudying(true);

      toast({
        title: "Session d'étude commencée",
        description: `Mode: ${mode}. Bonne étude !`
      });

    } catch (error) {
      console.error('Failed to start study session:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la session d'étude",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const endSession = useCallback(async () => {
    if (!currentSession || !user) return;

    try {
      const endTime = new Date().toISOString();
      const duration = Math.floor((Date.now() - new Date(currentSession.started_at).getTime()) / 60000);

      const { error } = await supabase
        .from('med_mng_study_sessions' as any)
        .update({
          ended_at: endTime,
          duration_minutes: duration,
          completion_rate: currentSession.completion_rate,
          focus_score: currentSession.focus_score
        })
        .eq('id', currentSession.id);

      if (error) throw error;

      setCurrentSession(null);
      setIsStudying(false);

      toast({
        title: "Session terminée",
        description: `Durée: ${duration} minutes. Bien joué !`
      });

    } catch (error) {
      console.error('Failed to end study session:', error);
      toast({
        title: "Erreur",
        description: "Impossible de terminer la session",
        variant: "destructive"
      });
    }
  }, [currentSession, user, toast]);

  const logSongPlay = useCallback((songId: string) => {
    if (!currentSession) return;

    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        songs_played: prev.songs_played + 1,
        completion_rate: Math.min(100, prev.completion_rate + 5)
      };
    });
  }, []);

  const updateFocusScore = useCallback((score: number) => {
    if (!currentSession) return;

    setCurrentSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        focus_score: Math.round((prev.focus_score + score) / 2)
      };
    });
  }, []);

  const getSessionStats = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('med_mng_study_sessions' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get session stats:', error);
      return [];
    }
  }, [user]);

  return (
    <StudySessionContext.Provider value={{
      currentSession,
      isStudying,
      startSession,
      endSession,
      logSongPlay,
      updateFocusScore,
      getSessionStats
    }}>
      {children}
    </StudySessionContext.Provider>
  );
};

export const useStudySession = () => {
  const context = useContext(StudySessionContext);
  if (!context) {
    throw new Error('useStudySession must be used within StudySessionProvider');
  }
  return context;
};