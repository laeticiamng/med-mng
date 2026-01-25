import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EdnFavorite {
  id: string;
  item_code: string;
  item_title: string;
  created_at: string;
}

export interface MusicFavorite {
  id: string;
  track_id: string;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface FavoriteStats {
  totalEdnFavorites: number;
  totalMusicFavorites: number;
  recentlyAdded: number;
}

export function useFavorites() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [ednFavorites, setEdnFavorites] = useState<EdnFavorite[]>([]);
  const [musicFavorites, setMusicFavorites] = useState<MusicFavorite[]>([]);
  const [stats, setStats] = useState<FavoriteStats | null>(null);

  // Charger les favoris EDN
  const loadEdnFavorites = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const { _data, _error } = await supabase
        .from('user_edn_favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (_error) throw _error;
      setEdnFavorites(_data || []);
      return _data || [];
    } catch (error: any) {
      console.error('Erreur chargement favoris EDN:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les favoris musique
  const loadMusicFavorites = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const { _data, _error } = await supabase
        .from('music_favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (_error) throw _error;
      const mapped: MusicFavorite[] = (_data || []).map(d => ({
        id: d.id,
        track_id: d.track_id,
        meta: d.meta as Record<string, unknown> | null,
        created_at: d.created_at
      }));
      setMusicFavorites(mapped);
      return mapped;
    } catch (error: any) {
      console.error('Erreur chargement favoris musique:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger tous les favoris
  const loadAllFavorites = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const [edn, music] = await Promise.all([
        loadEdnFavorites(userId),
        loadMusicFavorites(userId)
      ]);

      // Calculer les stats
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentEdn = edn.filter(f => new Date(f.created_at) > oneWeekAgo).length;
      const recentMusic = music.filter(f => new Date(f.created_at) > oneWeekAgo).length;

      setStats({
        totalEdnFavorites: edn.length,
        totalMusicFavorites: music.length,
        recentlyAdded: recentEdn + recentMusic
      });

      return { edn, music };
    } finally {
      setLoading(false);
    }
  }, [loadEdnFavorites, loadMusicFavorites]);

  // Ajouter un favori EDN
  const addEdnFavorite = useCallback(async (userId: string, itemCode: string, itemTitle: string) => {
    try {
      // Vérifier si déjà en favori
      const { _data: existing } = await supabase
        .from('user_edn_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('item_code', itemCode)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Déjà en favoris",
          description: "Cet item est déjà dans vos favoris"
        });
        return false;
      }

      const { _error } = await supabase
        .from('user_edn_favorites')
        .insert({
          user_id: userId,
          item_code: itemCode,
          item_title: itemTitle
        });

      if (_error) throw _error;

      toast({
        title: "Ajouté aux favoris",
        description: `${itemTitle} a été ajouté à vos favoris`
      });

      await loadEdnFavorites(userId);
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter aux favoris",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, loadEdnFavorites]);

  // Supprimer un favori EDN
  const removeEdnFavorite = useCallback(async (userId: string, itemCode: string) => {
    try {
      const { _error } = await supabase
        .from('user_edn_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('item_code', itemCode);

      if (_error) throw _error;

      toast({
        title: "Retiré des favoris",
        description: "L'item a été retiré de vos favoris"
      });

      await loadEdnFavorites(userId);
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de retirer des favoris",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, loadEdnFavorites]);

  // Ajouter un favori musique
  const addMusicFavorite = useCallback(async (userId: string, trackId: string, meta?: { title?: string; artist?: string; duration?: number }) => {
    try {
      const { _data: existing } = await supabase
        .from('music_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('track_id', trackId)
        .maybeSingle();

      if (existing) {
        toast({
          title: "Déjà en favoris",
          description: "Cette piste est déjà dans vos favoris"
        });
        return false;
      }

      const { _error } = await supabase
        .from('music_favorites')
        .insert({
          user_id: userId,
          track_id: trackId,
          meta: meta || null
        });

      if (_error) throw _error;

      toast({
        title: "Ajouté aux favoris",
        description: "La piste a été ajoutée à vos favoris"
      });

      await loadMusicFavorites(userId);
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter aux favoris",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, loadMusicFavorites]);

  // Supprimer un favori musique
  const removeMusicFavorite = useCallback(async (userId: string, trackId: string) => {
    try {
      const { _error } = await supabase
        .from('music_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('track_id', trackId);

      if (_error) throw _error;

      toast({
        title: "Retiré des favoris",
        description: "La piste a été retirée de vos favoris"
      });

      await loadMusicFavorites(userId);
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de retirer des favoris",
        variant: "destructive"
      });
      return false;
    }
  }, [toast, loadMusicFavorites]);

  // Vérifier si un item est en favori
  const isEdnFavorite = useCallback((itemCode: string) => {
    return ednFavorites.some(f => f.item_code === itemCode);
  }, [ednFavorites]);

  const isMusicFavorite = useCallback((trackId: string) => {
    return musicFavorites.some(f => f.track_id === trackId);
  }, [musicFavorites]);

  return {
    loading,
    ednFavorites,
    musicFavorites,
    stats,
    loadEdnFavorites,
    loadMusicFavorites,
    loadAllFavorites,
    addEdnFavorite,
    removeEdnFavorite,
    addMusicFavorite,
    removeMusicFavorite,
    isEdnFavorite,
    isMusicFavorite
  };
}
