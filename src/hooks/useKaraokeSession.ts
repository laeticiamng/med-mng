import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGamification } from '@/hooks/useGamification';

interface KaraokeQuizData {
  id: string;
  song_id: string;
  item_code: string | null;
  quiz_type: string;
  fill_blank_terms: Array<{ position: number; term: string; hint?: string }>;
  qcm_questions: Array<{ time: number; question: string; options: string[]; correct: number; explanation?: string }>;
  difficulty_level: number;
  medical_concepts: string[];
}

interface SessionResult {
  fill_blank_correct: number;
  fill_blank_total: number;
  qcm_correct: number;
  qcm_total: number;
  time_spent_seconds: number;
}

export const useKaraokeSession = () => {
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const { toast } = useToast();
  const { addPoints } = useGamification();

  const fetchQuizData = useCallback(async (songId: string): Promise<KaraokeQuizData | null> => {
    try {
      const { data, error } = await supabase
        .from('karaoke_quiz_data')
        .select('*')
        .eq('song_id', songId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        return {
          ...data,
          fill_blank_terms: (data.fill_blank_terms as any) || [],
          qcm_questions: (data.qcm_questions as any) || [],
          medical_concepts: data.medical_concepts || []
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      return null;
    }
  }, []);

  const startSession = useCallback(async (
    songId: string, 
    sessionType: 'listen' | 'karaoke' | 'quiz',
    quizDataId?: string
  ): Promise<string | null> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Connexion requise",
          description: "Veuillez vous connecter pour suivre votre progression",
          variant: "destructive"
        });
        return null;
      }

      const { data, error } = await supabase
        .from('karaoke_sessions')
        .insert({
          user_id: user.id,
          song_id: songId,
          quiz_data_id: quizDataId,
          session_type: sessionType
        })
        .select('id')
        .single();

      if (error) throw error;
      
      setCurrentSession(data.id);
      return data.id;
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la session",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const completeSession = useCallback(async (
    sessionId: string,
    result: SessionResult
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const score = result.fill_blank_correct * 10 + result.qcm_correct * 25;
      const maxScore = result.fill_blank_total * 10 + result.qcm_total * 25;

      const { error } = await supabase
        .from('karaoke_sessions')
        .update({
          score,
          max_score: maxScore,
          fill_blank_correct: result.fill_blank_correct,
          fill_blank_total: result.fill_blank_total,
          qcm_correct: result.qcm_correct,
          qcm_total: result.qcm_total,
          time_spent_seconds: result.time_spent_seconds,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Award XP
      const xpEarned = score;
      await addPoints(user.id, xpEarned, 'karaoke_session_completed');

      toast({
        title: "🎵 Session terminée !",
        description: `+${xpEarned} XP gagnés - Score: ${score}/${maxScore}`,
      });

      setCurrentSession(null);
      return true;
    } catch (error) {
      console.error('Error completing session:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [addPoints, toast]);

  const getSessionHistory = useCallback(async (limit = 10) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('karaoke_sessions')
        .select('*')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching session history:', error);
      return [];
    }
  }, []);

  const getSessionStats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('karaoke_sessions')
        .select('score, max_score, session_type, time_spent_seconds')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null);

      if (error) throw error;

      const sessions = data || [];
      const totalSessions = sessions.length;
      const totalScore = sessions.reduce((sum, s) => sum + (s.score || 0), 0);
      const totalMaxScore = sessions.reduce((sum, s) => sum + (s.max_score || 0), 0);
      const totalTime = sessions.reduce((sum, s) => sum + (s.time_spent_seconds || 0), 0);
      const avgAccuracy = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

      return {
        totalSessions,
        totalScore,
        totalTimeMinutes: Math.round(totalTime / 60),
        avgAccuracy: Math.round(avgAccuracy * 10) / 10,
        byType: {
          listen: sessions.filter(s => s.session_type === 'listen').length,
          karaoke: sessions.filter(s => s.session_type === 'karaoke').length,
          quiz: sessions.filter(s => s.session_type === 'quiz').length
        }
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return null;
    }
  }, []);

  return {
    loading,
    currentSession,
    fetchQuizData,
    startSession,
    completeSession,
    getSessionHistory,
    getSessionStats
  };
};
