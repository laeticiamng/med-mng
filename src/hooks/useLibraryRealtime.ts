import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseLibraryRealtimeOptions {
  userId: string | undefined;
  onNewSong?: (song: any) => void;
  onSongUpdated?: (song: any) => void;
  onSongDeleted?: (songId: string) => void;
  refetch?: () => void;
}

export const useLibraryRealtime = ({
  userId,
  onNewSong,
  onSongUpdated,
  onSongDeleted,
  refetch,
}: UseLibraryRealtimeOptions) => {
  
  useEffect(() => {
    if (!userId) return;

    // Écouter les changements sur user_generated_music
    const userMusicChannel = supabase
      .channel(`user_music_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_generated_music',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🎵 Nouvelle chanson ajoutée:', payload.new);
          onNewSong?.(payload.new);
          refetch?.();
          toast.success('🎵 Nouvelle chanson ajoutée à votre bibliothèque !');
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_generated_music',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('📝 Chanson mise à jour:', payload.new);
          onSongUpdated?.(payload.new);
          refetch?.();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'user_generated_music',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🗑️ Chanson supprimée:', payload.old);
          onSongDeleted?.(payload.old?.id);
          refetch?.();
        }
      )
      .subscribe();

    // Écouter aussi generated_music_tracks pour les nouvelles générations
    const generatedTracksChannel = supabase
      .channel(`generated_tracks_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generated_music_tracks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new?.generation_status === 'completed' && payload.new?.audio_url) {
            console.log('✅ Génération terminée:', payload.new);
            refetch?.();
            toast.success('🎉 Votre musique est prête !', {
              description: payload.new?.title || 'Nouvelle chanson disponible',
            });
          }
        }
      )
      .subscribe();

    return () => {
      userMusicChannel.unsubscribe();
      generatedTracksChannel.unsubscribe();
    };
  }, [userId, onNewSong, onSongUpdated, onSongDeleted, refetch]);
};
