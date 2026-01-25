import { supabase } from '@/integrations/supabase/client';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from './use-toast';

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  topic?: string;
  max_members: number;
  member_count: number;
  is_active: boolean;
  is_public: boolean;
  created_by: string;
  created_at: string;
  members?: any[];
}

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
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [mySessions, setMySessions] = useState<StudySession[]>([]);
  const [currentSession, setCurrentSession] = useState<{ id: string } | null>(null);
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

  // Load all study groups
  const loadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('study_groups')
        .select(`
          *,
          members:study_group_members(user_id, role, profiles(name, email))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedGroups: StudyGroup[] = (data || []).map((g: any) => ({
        id: g.id,
        name: g.name,
        description: g.description || '',
        topic: g.category || g.topic,
        max_members: g.max_members || 10,
        member_count: g.member_count || g.members?.length || 0,
        is_active: g.is_active ?? true,
        is_public: g.is_public ?? true,
        created_by: g.created_by || '',
        created_at: g.created_at,
        members: g.members || [],
      }));

      setGroups(formattedGroups);
    } catch (error) {
      console.error('Error loading groups:', error);
      // No mock data - show empty state for real data integrity
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all public sessions (legacy)
  const loadSessions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('study_groups')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

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
      setSessions([]);
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

  // Create a new group
  const createGroup = useCallback(async (name: string, description: string, topic?: string) => {
    if (!currentUser) {
      toast({ title: "Connexion requise", variant: "destructive" });
      return false;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('study_groups')
        .insert({
          name,
          description,
          category: topic || 'Général',
          max_members: 10,
          is_public: true,
          created_by: currentUser,
          member_count: 1,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      // Join as admin
      await (supabase as any)
        .from('study_group_members')
        .insert({
          group_id: data.id,
          user_id: currentUser,
          role: 'admin'
        });

      await loadGroups();
      return true;
    } catch (error) {
      console.error('Error creating group:', error);
      toast({ title: "Erreur", description: "Impossible de créer le groupe", variant: "destructive" });
      return false;
    }
  }, [currentUser, toast, loadGroups]);

  // Create a session (legacy)
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

      await (supabase as any)
        .from('study_group_members')
        .insert({
          group_id: data.id,
          user_id: currentUser,
          role: 'admin'
        });

      toast({ title: "Session créée !" });
      await loadSessions();
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      toast({ title: "Erreur", variant: "destructive" });
      return null;
    }
  }, [currentUser, toast, loadSessions]);

  // Join a group
  const joinGroup = useCallback(async (groupId: string) => {
    if (!currentUser) {
      toast({ title: "Connexion requise", variant: "destructive" });
      return false;
    }

    try {
      const { data: existing } = await (supabase as any)
        .from('study_group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', currentUser)
        .maybeSingle();

      if (existing) {
        toast({ title: "Déjà membre" });
        return true;
      }

      await (supabase as any)
        .from('study_group_members')
        .insert({
          group_id: groupId,
          user_id: currentUser,
          role: 'member'
        });

      const group = groups.find(g => g.id === groupId);
      if (group) {
        await (supabase as any)
          .from('study_groups')
          .update({ member_count: (group.member_count || 0) + 1 })
          .eq('id', groupId);
      }

      await loadGroups();
      return true;
    } catch (error) {
      console.error('Error joining group:', error);
      toast({ title: "Erreur", variant: "destructive" });
      return false;
    }
  }, [currentUser, groups, toast, loadGroups]);

  // Join a session (legacy)
  const joinSession = useCallback(async (sessionId: string) => {
    return joinGroup(sessionId);
  }, [joinGroup]);

  // Leave a group
  const leaveGroup = useCallback(async (groupId: string) => {
    if (!currentUser) return false;

    try {
      await (supabase as any)
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', currentUser);

      const group = groups.find(g => g.id === groupId);
      if (group && group.member_count > 0) {
        await (supabase as any)
          .from('study_groups')
          .update({ member_count: group.member_count - 1 })
          .eq('id', groupId);
      }

      toast({ title: "Groupe quitté" });
      await loadGroups();
      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      return false;
    }
  }, [currentUser, groups, toast, loadGroups]);

  // Leave session (legacy)
  const leaveSession = useCallback(async (sessionId: string) => {
    return leaveGroup(sessionId);
  }, [leaveGroup]);

  // Start a study session
  const startSession = useCallback(async (groupId: string) => {
    setCurrentSession({ id: groupId });
    toast({ title: "Session démarrée", description: "Bonne étude !" });
    return true;
  }, [toast]);

  // End session
  const endSession = useCallback(async (_sessionId: string) => {
    setCurrentSession(null);
    toast({ title: "Session terminée" });
    return true;
  }, [toast]);

  // Setup realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('study_groups_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'study_groups' },
        () => {
          loadGroups();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadGroups]);

  // Initial load
  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (currentUser) {
      loadMySessions();
    }
  }, [currentUser, loadMySessions]);

  return {
    groups,
    sessions,
    mySessions,
    currentSession,
    loading,
    loadGroups,
    loadSessions,
    loadMySessions,
    createGroup,
    createSession,
    joinGroup,
    joinSession,
    leaveGroup,
    leaveSession,
    startSession,
    endSession,
  };
}
