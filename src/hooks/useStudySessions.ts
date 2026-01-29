/**
 * 📚 Study Sessions Hook
 * Tracks and persists study sessions for analytics
 */

import { supabase } from '@/integrations/supabase/client';
import { useCallback, useRef, useState } from 'react';

export type SessionType = 'srs' | 'exam' | 'flashcard' | 'clinical' | 'music' | 'ai_chat';

export interface StudySession {
  id: string;
  sessionType: SessionType;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds?: number;
  itemsReviewed: number;
  correctAnswers: number;
  score?: number;
  metadata: Record<string, any>;
}

export function useStudySessions() {
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [loading, setLoading] = useState(false);
  const sessionIdRef = useRef<string | null>(null);

  // Start a new study session
  const startSession = useCallback(async (
    userId: string,
    sessionType: SessionType,
    metadata: Record<string, any> = {}
  ): Promise<StudySession | null> => {
    if (!userId) return null;
    setLoading(true);

    try {
      const now = new Date();
      const sessionData = {
        user_id: userId,
        session_type: sessionType,
        started_at: now.toISOString(),
        items_reviewed: 0,
        correct_answers: 0,
        metadata,
      };

      const { data, error } = await supabase
        .from('study_sessions')
        .insert(sessionData as any)
        .select()
        .single();

      if (error) throw error;

      const session: StudySession = {
        id: data.id,
        sessionType,
        startedAt: now,
        itemsReviewed: 0,
        correctAnswers: 0,
        metadata,
      };

      sessionIdRef.current = data.id;
      setCurrentSession(session);
      return session;
    } catch (error) {
      console.error('Error starting session:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update session progress
  const updateSession = useCallback(async (
    updates: Partial<Pick<StudySession, 'itemsReviewed' | 'correctAnswers' | 'score' | 'metadata'>>
  ) => {
    if (!sessionIdRef.current || !currentSession) return;

    const updatedSession = {
      ...currentSession,
      ...updates,
    };
    setCurrentSession(updatedSession);

    try {
      await supabase
        .from('study_sessions')
        .update({
          items_reviewed: updatedSession.itemsReviewed,
          correct_answers: updatedSession.correctAnswers,
          score: updatedSession.score,
          metadata: updatedSession.metadata,
        } as any)
        .eq('id', sessionIdRef.current);
    } catch (error) {
      console.debug('Error updating session:', error);
    }
  }, [currentSession]);

  // End the current session
  const endSession = useCallback(async (
    finalScore?: number
  ): Promise<StudySession | null> => {
    if (!sessionIdRef.current || !currentSession) return null;

    const now = new Date();
    const durationSeconds = Math.floor((now.getTime() - currentSession.startedAt.getTime()) / 1000);
    const score = finalScore ?? (
      currentSession.itemsReviewed > 0
        ? Math.round((currentSession.correctAnswers / currentSession.itemsReviewed) * 100)
        : undefined
    );

    const completedSession: StudySession = {
      ...currentSession,
      endedAt: now,
      durationSeconds,
      score,
    };

    try {
      await supabase
        .from('study_sessions')
        .update({
          ended_at: now.toISOString(),
          duration_seconds: durationSeconds,
          score,
          items_reviewed: completedSession.itemsReviewed,
          correct_answers: completedSession.correctAnswers,
        } as any)
        .eq('id', sessionIdRef.current);

      sessionIdRef.current = null;
      setCurrentSession(null);
      return completedSession;
    } catch (error) {
      console.error('Error ending session:', error);
      return completedSession;
    }
  }, [currentSession]);

  // Get session history
  const getSessionHistory = useCallback(async (
    userId: string,
    options?: {
      sessionType?: SessionType;
      limit?: number;
      offset?: number;
    }
  ): Promise<StudySession[]> => {
    if (!userId) return [];

    try {
      let query = supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(options?.limit || 20);

      if (options?.sessionType) {
        query = query.eq('session_type', options.sessionType);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(s => ({
        id: s.id,
        sessionType: s.session_type as SessionType,
        startedAt: new Date(s.started_at),
        endedAt: s.completed_at ? new Date(s.completed_at) : undefined,
        durationSeconds: s.duration_minutes ? s.duration_minutes * 60 : undefined,
        itemsReviewed: 0, // Not stored in current schema
        correctAnswers: 0, // Not stored in current schema
        score: s.score,
        metadata: s.session_data as Record<string, any> || {},
      }));
    } catch (error) {
      console.error('Error getting session history:', error);
      return [];
    }
  }, []);

  // Get session stats
  const getSessionStats = useCallback(async (
    userId: string,
    days: number = 30
  ) => {
    if (!userId) return null;

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('study_sessions')
        .select('session_type, duration_minutes, score')
        .eq('user_id', userId)
        .gte('started_at', startDate.toISOString())
        .eq('completed', true);

      if (error) throw error;

      const byType: Record<SessionType, {
        count: number;
        totalTime: number;
        averageScore: number;
      }> = {
        srs: { count: 0, totalTime: 0, averageScore: 0 },
        exam: { count: 0, totalTime: 0, averageScore: 0 },
        flashcard: { count: 0, totalTime: 0, averageScore: 0 },
        clinical: { count: 0, totalTime: 0, averageScore: 0 },
        music: { count: 0, totalTime: 0, averageScore: 0 },
        ai_chat: { count: 0, totalTime: 0, averageScore: 0 },
      };

      let totalSessions = 0;
      let totalTime = 0;
      let totalScores = 0;
      let scoredSessions = 0;

      (data || []).forEach(s => {
        const type = s.session_type as SessionType;
        byType[type].count++;
        byType[type].totalTime += (s.duration_minutes || 0) * 60;
        
        if (s.score !== null) {
          byType[type].averageScore += s.score;
          totalScores += s.score;
          scoredSessions++;
        }

        totalSessions++;
        totalTime += (s.duration_minutes || 0) * 60;
      });

      // Calculate averages
      Object.keys(byType).forEach(type => {
        const t = byType[type as SessionType];
        if (t.count > 0 && t.averageScore > 0) {
          t.averageScore = Math.round(t.averageScore / t.count);
        }
      });

      return {
        totalSessions,
        totalTime,
        averageScore: scoredSessions > 0 ? Math.round(totalScores / scoredSessions) : 0,
        averageSessionLength: totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0,
        byType,
      };
    } catch (error) {
      console.error('Error getting session stats:', error);
      return null;
    }
  }, []);

  return {
    currentSession,
    loading,
    startSession,
    updateSession,
    endSession,
    getSessionHistory,
    getSessionStats,
  };
}
