/**
 * Hook pour gérer les ressources partagées
 * Connecté à la table shared_resources Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SharedResource {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  url: string;
  tags: string[];
  author_id: string;
  author_name?: string;
  likes_count: number;
  downloads_count: number;
  views_count: number;
  comments_count: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export interface ResourceComment {
  id: string;
  resource_id: string;
  user_id: string;
  user_name?: string;
  content: string;
  likes_count: number;
  created_at: string;
}

export function useSharedResources() {
  const [resources, setResources] = useState<SharedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadResources = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Charger les ressources approuvées
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('shared_resources')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (resourcesError) throw resourcesError;

      // Charger les profils des auteurs
      const authorIds = [...new Set(resourcesData?.map(r => r.author_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', authorIds.length > 0 ? authorIds : ['00000000-0000-0000-0000-000000000000']);

      const profileMap = new Map(profiles?.map(p => [p.id, p.name]) || []);

      // Charger les likes et bookmarks de l'utilisateur
      let userLikes: string[] = [];
      let userBookmarks: string[] = [];
      
      if (user) {
        const { data: likes } = await supabase
          .from('resource_likes')
          .select('resource_id')
          .eq('user_id', user.id);
        userLikes = likes?.map(l => l.resource_id) || [];

        const { data: bookmarks } = await supabase
          .from('resource_bookmarks')
          .select('resource_id')
          .eq('user_id', user.id);
        userBookmarks = bookmarks?.map(b => b.resource_id) || [];
      }

      const formattedResources: SharedResource[] = (resourcesData || []).map(r => ({
        ...r,
        author_name: profileMap.get(r.author_id) || 'Utilisateur',
        is_liked: userLikes.includes(r.id),
        is_bookmarked: userBookmarks.includes(r.id),
      }));

      setResources(formattedResources);
    } catch (err) {
      console.error('Erreur chargement ressources:', err);
      setError('Impossible de charger les ressources');
    } finally {
      setLoading(false);
    }
  }, []);

  const createResource = async (resource: {
    title: string;
    description?: string;
    resource_type: string;
    url: string;
    tags?: string[];
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Connexion requise', variant: 'destructive' });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('shared_resources')
        .insert({
          title: resource.title,
          description: resource.description || null,
          resource_type: resource.resource_type,
          url: resource.url,
          tags: resource.tags || [],
          author_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Ressource partagée ✅' });
      await loadResources();
      return data;
    } catch (err) {
      console.error('Erreur création ressource:', err);
      toast({ title: 'Erreur', description: 'Impossible de créer la ressource', variant: 'destructive' });
      return null;
    }
  };

  const likeResource = async (resourceId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Connexion requise', variant: 'destructive' });
      return;
    }

    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;

    try {
      if (resource.is_liked) {
        await supabase.from('resource_likes').delete().eq('user_id', user.id).eq('resource_id', resourceId);
        await supabase.from('shared_resources').update({ likes_count: Math.max(0, resource.likes_count - 1) }).eq('id', resourceId);
      } else {
        await supabase.from('resource_likes').insert({ user_id: user.id, resource_id: resourceId });
        await supabase.from('shared_resources').update({ likes_count: resource.likes_count + 1 }).eq('id', resourceId);
      }

      setResources(prev => prev.map(r =>
        r.id === resourceId
          ? { ...r, is_liked: !r.is_liked, likes_count: r.is_liked ? r.likes_count - 1 : r.likes_count + 1 }
          : r
      ));
    } catch (err) {
      console.error('Erreur like:', err);
    }
  };

  const bookmarkResource = async (resourceId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Connexion requise', variant: 'destructive' });
      return;
    }

    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;

    try {
      if (resource.is_bookmarked) {
        await supabase.from('resource_bookmarks').delete().eq('user_id', user.id).eq('resource_id', resourceId);
        toast({ title: 'Retiré des favoris' });
      } else {
        await supabase.from('resource_bookmarks').insert({ user_id: user.id, resource_id: resourceId });
        toast({ title: 'Ajouté aux favoris ✅' });
      }

      setResources(prev => prev.map(r =>
        r.id === resourceId ? { ...r, is_bookmarked: !r.is_bookmarked } : r
      ));
    } catch (err) {
      console.error('Erreur bookmark:', err);
    }
  };

  const incrementDownloads = async (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) return;

    try {
      await supabase
        .from('shared_resources')
        .update({ downloads_count: resource.downloads_count + 1 })
        .eq('id', resourceId);

      setResources(prev => prev.map(r =>
        r.id === resourceId ? { ...r, downloads_count: r.downloads_count + 1 } : r
      ));
    } catch (err) {
      console.error('Erreur compteur téléchargements:', err);
    }
  };

  const incrementViews = async (resourceId: string) => {
    try {
      const resource = resources.find(r => r.id === resourceId);
      if (!resource) return;

      await supabase
        .from('shared_resources')
        .update({ views_count: resource.views_count + 1 })
        .eq('id', resourceId);

      setResources(prev => prev.map(r =>
        r.id === resourceId ? { ...r, views_count: r.views_count + 1 } : r
      ));
    } catch (err) {
      console.error('Erreur compteur vues:', err);
    }
  };

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  return {
    resources,
    loading,
    error,
    loadResources,
    createResource,
    likeResource,
    bookmarkResource,
    incrementDownloads,
    incrementViews,
  };
}
