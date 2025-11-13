import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PageNote {
  id: string;
  user_id: string;
  page_path: string;
  title?: string;
  content: string;
  color: string;
  tags: string[];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export function usePageNotes(pagePath?: string) {
  const [notes, setNotes] = useState<PageNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Vérifier l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Charger les notes
  const loadNotes = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('page_notes' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (pagePath) {
        query = query.eq('page_path', pagePath) as any;
      }

      const { data, error } = await query;

      if (error) throw error;
      setNotes(data as any || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast({
        title: 'Erreur de chargement',
        description: 'Impossible de charger les notes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, pagePath, toast]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('page-notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'page_notes',
        },
        () => {
          loadNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, loadNotes]);

  // Créer une note
  const createNote = useCallback(async (data: {
    page_path: string;
    title?: string;
    content: string;
    color?: string;
    tags?: string[];
  }) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentification requise',
        description: 'Connectez-vous pour créer des notes',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { data: note, error } = await supabase
        .from('page_notes' as any)
        .insert({
          user_id: user.id,
          page_path: data.page_path,
          title: data.title,
          content: data.content,
          color: data.color || '#3b82f6',
          tags: data.tags || [],
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '✓ Note créée',
        description: 'Votre note a été enregistrée avec succès',
      });

      return note;
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la note',
        variant: 'destructive',
      });
      return null;
    }
  }, [isAuthenticated, toast]);

  // Mettre à jour une note
  const updateNote = useCallback(async (id: string, updates: Partial<PageNote>) => {
    try {
      const { error } = await supabase
        .from('page_notes' as any)
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: '✓ Note mise à jour',
        description: 'Vos modifications ont été enregistrées',
      });

      return true;
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la note',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  // Supprimer une note
  const deleteNote = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('page_notes' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: '✓ Note supprimée',
        description: 'La note a été supprimée avec succès',
      });

      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la note',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  // Toggle pin status
  const togglePin = useCallback(async (id: string, isPinned: boolean) => {
    return updateNote(id, { is_pinned: !isPinned });
  }, [updateNote]);

  // Obtenir les notes d'une page spécifique
  const getNotesForPage = useCallback((path: string) => {
    return notes.filter(note => note.page_path === path);
  }, [notes]);

  // Obtenir le nombre de notes par page
  const getNoteCountForPage = useCallback((path: string) => {
    return notes.filter(note => note.page_path === path).length;
  }, [notes]);

  return {
    notes,
    loading,
    isAuthenticated,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    getNotesForPage,
    getNoteCountForPage,
    refresh: loadNotes,
  };
}
