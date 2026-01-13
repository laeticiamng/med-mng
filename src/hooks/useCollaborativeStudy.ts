import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface StudySession {
  id: string;
  session_name: string;
  description: string;
  subject_areas: string[];
  max_participants: number;
  current_participants: number;
  session_type: 'collaborative' | 'video_call' | 'text_chat' | 'silent_study';
  scheduled_start: string;
  duration_minutes: number;
  is_active: boolean;
  is_public: boolean;
  creator_id: string;
  created_at: string;
}

export interface SessionParticipant {
  id: string;
  session_id: string;
  user_id: string;
  role: 'host' | 'participant';
  joined_at: string;
}

export function useCollaborativeStudy() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [mySessions, setMySessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user.id);
      }
    };
    getUser();
  }, []);

  // Load all public sessions
  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      // Use study_groups table as base for collaborative sessions
      const { data, error } = await (supabase as any)
        .from('study_groups')
        .select('*')
        .eq('is_public', true)
        .order('last_activity_at', { ascending: false });

      if (error) throw error;

      const formattedSessions: StudySession[] = (data || []).map((g: any) => ({
        id: g.id,
        session_name: g.name,
        description: g.description || '',
        subject_areas: g.category ? [g.category] : [],
        max_participants: g.max_members || 10,
        current_participants: g.member_count || 0,
        session_type: 'collaborative' as const,
        scheduled_start: g.last_activity_at || new Date().toISOString(),
        duration_minutes: 60,
        is_active: true,
        is_public: g.is_public,
        creator_id: g.created_by || '',
        created_at: g.created_at
      }));

      setSessions(formattedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      // Fallback mock data
      setSessions([
        {
          id: 'mock-1',
          session_name: 'Révision Cardiologie',
          description: 'Session intensive ECG et insuffisance cardiaque',
          subject_areas: ['Cardiologie', 'ECG'],
          max_participants: 6,
          current_participants: 3,
          session_type: 'collaborative',
          scheduled_start: new Date(Date.now() + 3600000).toISOString(),
          duration_minutes: 90,
          is_active: false,
          is_public: true,
          creator_id: 'user-1',
          created_at: new Date().toISOString()
        },
        {
          id: 'mock-2',
          session_name: 'Quiz Pneumologie',
          description: 'QCM collaboratif sur les pathologies respiratoires',
          subject_areas: ['Pneumologie'],
          max_participants: 8,
          current_participants: 5,
          session_type: 'collaborative',
          scheduled_start: new Date(Date.now() + 7200000).toISOString(),
          duration_minutes: 60,
          is_active: false,
          is_public: true,
          creator_id: 'user-2',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user's own sessions
  const loadMySessions = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await (supabase as any)
        .from('study_groups')
        .select('*')
        .eq('created_by', currentUser);

      if (error) throw error;

      const formattedSessions: StudySession[] = (data || []).map((g: any) => ({
        id: g.id,
        session_name: g.name,
        description: g.description || '',
        subject_areas: g.category ? [g.category] : [],
        max_participants: g.max_members || 10,
        current_participants: g.member_count || 0,
        session_type: 'collaborative' as const,
        scheduled_start: g.last_activity_at || new Date().toISOString(),
        duration_minutes: 60,
        is_active: true,
        is_public: g.is_public,
        creator_id: g.created_by || '',
        created_at: g.created_at
      }));

      setMySessions(formattedSessions);
    } catch (error) {
      console.error('Error loading my sessions:', error);
    }
  }, [currentUser]);

  // Create a new session
  const createSession = useCallback(async (sessionData: Partial<StudySession>) => {
    if (!currentUser) {
      toast({ title: "Connexion requise", variant: "destructive" });
      return null;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('study_groups')
        .insert({
          name: sessionData.session_name,
          description: sessionData.description,
          category: sessionData.subject_areas?.[0] || 'Général',
          max_members: sessionData.max_participants || 10,
          is_public: sessionData.is_public ?? true,
          created_by: currentUser,
          member_count: 1
        })
        .select()
        .single();

      if (error) throw error;

      // Join as host
      await (supabase as any)
        .from('study_group_members')
        .insert({
          group_id: data.id,
          user_id: currentUser,
          role: 'admin'
        });

      toast({ title: "Session créée !", description: "Votre session d'étude est prête" });
      
      await loadSessions();
      await loadMySessions();
      
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      toast({ title: "Erreur", description: "Impossible de créer la session", variant: "destructive" });
      return null;
    }
  }, [currentUser, toast, loadSessions, loadMySessions]);

  // Join a session
  const joinSession = useCallback(async (sessionId: string) => {
    if (!currentUser) {
      toast({ title: "Connexion requise", variant: "destructive" });
      return false;
    }

    try {
      // Check if already member
      const { data: existing } = await (supabase as any)
        .from('study_group_members')
        .select('id')
        .eq('group_id', sessionId)
        .eq('user_id', currentUser)
        .maybeSingle();

      if (existing) {
        toast({ title: "Déjà membre", description: "Vous êtes déjà dans cette session" });
        return true;
      }

      // Join
      await (supabase as any)
        .from('study_group_members')
        .insert({
          group_id: sessionId,
          user_id: currentUser,
          role: 'member'
        });

      // Update member count
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        await (supabase as any)
          .from('study_groups')
          .update({ member_count: session.current_participants + 1 })
          .eq('id', sessionId);
      }

      toast({ title: "Session rejointe !", description: "Vous avez rejoint la session d'étude" });
      await loadSessions();
      return true;
    } catch (error) {
      console.error('Error joining session:', error);
      toast({ title: "Erreur", description: "Impossible de rejoindre la session", variant: "destructive" });
      return false;
    }
  }, [currentUser, sessions, toast, loadSessions]);

  // Leave a session
  const leaveSession = useCallback(async (sessionId: string) => {
    if (!currentUser) return false;

    try {
      await (supabase as any)
        .from('study_group_members')
        .delete()
        .eq('group_id', sessionId)
        .eq('user_id', currentUser);

      // Update member count
      const session = sessions.find(s => s.id === sessionId);
      if (session && session.current_participants > 0) {
        await (supabase as any)
          .from('study_groups')
          .update({ member_count: session.current_participants - 1 })
          .eq('id', sessionId);
      }

      toast({ title: "Session quittée" });
      await loadSessions();
      return true;
    } catch (error) {
      console.error('Error leaving session:', error);
      return false;
    }
  }, [currentUser, sessions, toast, loadSessions]);

  // Setup realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('study_groups_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'study_groups' },
        () => {
          loadSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadSessions]);

  // Initial load
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (currentUser) {
      loadMySessions();
    }
  }, [currentUser, loadMySessions]);

  return {
    sessions,
    mySessions,
    loading,
    loadSessions,
    loadMySessions,
    createSession,
    joinSession,
    leaveSession
  };
}
