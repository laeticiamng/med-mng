import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SupabaseMusicTrack {
  id: string;
  title: string;
  audio_url: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  suno_track_id?: string;
  task_id?: string;
}

export const useSupabaseMusicTracks = () => {
  const [tracks, setTracks] = useState<SupabaseMusicTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Charger toutes les musiques disponibles depuis Supabase
  const loadTracks = async () => {
    try {
      setLoading(true);
      
      const { _data, _error } = await supabase
        .from('generated_music_tracks')
        .select('*')
        .not('audio_url', 'is', null)
        .neq('audio_url', '')
        .order('updated_at', { ascending: false })
        .limit(50);

      if (_error) throw _error;
      
      setTracks(_data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les musiques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Écouter les nouveaux tracks en temps réel
  useEffect(() => {
    loadTracks();

    // Subscription aux changements en temps réel
    const subscription = supabase
      .channel('supabase_music_tracks_realtime')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'generated_music_tracks'
      }, (payload) => {
        if (payload.new?.audio_url) {
          loadTracks(); // Recharger la liste
          toast({
            title: "🎉 Musique mise à jour !",
            description: payload.new.title || "Une musique a été mise à jour",
            duration: 5000,
          });
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'generated_music_tracks'
      }, (payload) => {
        if (payload.new?.audio_url) {
          loadTracks();
          toast({
            title: "🎵 Nouvelle musique !",
            description: payload.new.title || "Une nouvelle musique est disponible",
            duration: 5000,
          });
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  // Test de connectivité amélioré
  const testDatabaseConnectivity = async () => {
    try {
      // Test: Utiliser la fonction debug SQL créée
      const { _data: allTracks } = await supabase
        .rpc('get_all_music_tracks');

      // Test alternatif: Compter tous les tracks
      const { count: totalCount } = await supabase
        .from('generated_music_tracks')
        .select('*', { count: 'exact', head: true });

      toast({
        title: "Test connectivité",
        description: `RPC: ${allTracks?.length || 0} tracks, Total: ${totalCount || 0}`,
        duration: 3000,
      });

    } catch {
      toast({
        title: "Erreur test",
        description: "Problème de connectivité base de données",
        variant: "destructive",
      });
    }
  };

  return {
    tracks,
    loading,
    error,
    reload: loadTracks,
    testConnectivity: testDatabaseConnectivity
  };
};
