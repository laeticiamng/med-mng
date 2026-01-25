import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  category: string;
  tags: string[];
  views: number;
  replies_count: number;
  likes_count: number;
  is_pinned: boolean;
  is_solved: boolean;
  created_at: string;
  last_activity_at: string;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  content: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  likes_count: number;
  is_accepted: boolean;
  created_at: string;
}

export function useForumThreads() {
  const { toast } = useToast();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [currentThread, setCurrentThread] = useState<ForumThread | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  // Load all threads
  const loadThreads = useCallback(async (category?: string) => {
    setLoading(true);
    try {
      // Use community_posts as forum threads
      let query = (supabase as any)
        .from('community_posts')
        .select('*, community_post_likes(count)')
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      // Get profiles for authors
      const userIds: string[] = [...new Set((data || []).map((p: any) => p.user_id as string))] as string[];
      const { _data: profiles } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000']);

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      const formattedThreads: ForumThread[] = (data || []).map((post: any) => {
        const profile = profileMap.get(post.user_id) as { id: string; name: string | null; avatar_url: string | null } | undefined;
        return {
          id: post.id,
          title: post.content.split('\n')[0].slice(0, 100) || 'Discussion',
          content: post.content,
          author_id: post.user_id,
          author_name: profile?.name || 'Utilisateur',
          author_avatar: profile?.avatar_url,
          category: post.category || 'Général',
          tags: post.tags || [],
          views: post.views_count || 0,
          replies_count: post.comments_count || 0,
          likes_count: post.likes_count || 0,
          is_pinned: post.is_pinned || false,
          is_solved: post.is_solved || false,
          created_at: post.created_at,
          last_activity_at: post.updated_at || post.created_at
        };
      });

      setThreads(formattedThreads);
    } catch (error) {
      console.error('Error loading threads:', error);
      // Return empty array on error - no mock data
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load thread with replies
  const loadThread = useCallback(async (threadId: string) => {
    setLoading(true);
    try {
      // Load thread
      const { data: thread, error: threadError } = await (supabase as any)
        .from('community_posts')
        .select('*')
        .eq('id', threadId)
        .single();

      if (threadError) throw threadError;

      // Increment views
      await (supabase as any)
        .from('community_posts')
        .update({ views_count: (thread.views_count || 0) + 1 })
        .eq('id', threadId);

      // Get author profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .eq('id', thread.user_id)
        .maybeSingle() as { data: { id: string; name: string | null; avatar_url: string | null } | null };

      const formattedThread: ForumThread = {
        id: thread.id,
        title: thread.content.split('\n')[0].slice(0, 100) || 'Discussion',
        content: thread.content,
        author_id: thread.user_id,
        author_name: profile?.name || 'Utilisateur',
        author_avatar: profile?.avatar_url,
        category: thread.category || 'Général',
        tags: thread.tags || [],
        views: (thread.views_count || 0) + 1,
        replies_count: thread.comments_count || 0,
        likes_count: thread.likes_count || 0,
        is_pinned: thread.is_pinned || false,
        is_solved: thread.is_solved || false,
        created_at: thread.created_at,
        last_activity_at: thread.updated_at || thread.created_at
      };

      setCurrentThread(formattedThread);

      // Load replies (comments on the thread)
      // For now, use mock replies since we don't have a dedicated comments table
      setReplies([]);
    } catch (error) {
      console.error('Error loading thread:', error);
      setCurrentThread(threads.find(t => t.id === threadId) || null);
    } finally {
      setLoading(false);
    }
  }, [threads]);

  // Create new thread
  const createThread = useCallback(async (title: string, content: string, category: string, tags: string[] = []) => {
    if (!currentUser) {
      toast({ title: "Connexion requise", variant: "destructive" });
      return null;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('community_posts')
        .insert({
          user_id: currentUser.id,
          content: `${title}\n\n${content}`,
          post_type: 'discussion',
          category,
          tags
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Discussion créée !" });
      await loadThreads();
      return data;
    } catch (error) {
      console.error('Error creating thread:', error);
      toast({ title: "Erreur", description: "Impossible de créer la discussion", variant: "destructive" });
      return null;
    }
  }, [currentUser, toast, loadThreads]);

  // Add reply
  const addReply = useCallback(async (threadId: string, content: string) => {
    if (!currentUser) {
      toast({ title: "Connexion requise", variant: "destructive" });
      return null;
    }

    try {
      // Update comments count on thread
      const thread = threads.find(t => t.id === threadId);
      if (thread) {
        await (supabase as any)
          .from('community_posts')
          .update({ 
            comments_count: (thread.replies_count || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', threadId);
      }

      // For now, add reply locally
      const newReply: ForumReply = {
        id: `reply-${Date.now()}`,
        thread_id: threadId,
        content,
        author_id: currentUser.id,
        author_name: 'Vous',
        likes_count: 0,
        is_accepted: false,
        created_at: new Date().toISOString()
      };

      setReplies(prev => [...prev, newReply]);
      toast({ title: "Réponse ajoutée !" });
      
      return newReply;
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({ title: "Erreur", description: "Impossible d'ajouter la réponse", variant: "destructive" });
      return null;
    }
  }, [currentUser, threads, toast]);

  // Like thread
  const likeThread = useCallback(async (threadId: string) => {
    if (!currentUser) return;

    try {
      // Toggle like
      const { data: existing } = await (supabase as any)
        .from('community_post_likes')
        .select('id')
        .eq('post_id', threadId)
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (existing) {
        await (supabase as any)
          .from('community_post_likes')
          .delete()
          .eq('id', existing.id);
      } else {
        await (supabase as any)
          .from('community_post_likes')
          .insert({ post_id: threadId, user_id: currentUser.id });
      }

      // Update local state
      setThreads(prev => prev.map(t => 
        t.id === threadId 
          ? { ...t, likes_count: existing ? t.likes_count - 1 : t.likes_count + 1 }
          : t
      ));

      if (currentThread?.id === threadId) {
        setCurrentThread(prev => prev 
          ? { ...prev, likes_count: existing ? prev.likes_count - 1 : prev.likes_count + 1 }
          : null
        );
      }
    } catch (error) {
      console.error('Error liking thread:', error);
    }
  }, [currentUser, currentThread]);

  // Initial load
  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  return {
    threads,
    currentThread,
    replies,
    loading,
    loadThreads,
    loadThread,
    createThread,
    addReply,
    likeThread
  };
}
