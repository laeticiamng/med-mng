
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PollingState {
  trackId: string;
  rang: 'A' | 'B' | 'AB';
  itemCode: string;
  startTime: number;
}

export const useSunoPolling = () => {
  const [pollingTracks, setPollingTracks] = useState<PollingState[]>([]);
  const [completedAudio, setCompletedAudio] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  const startPolling = useCallback((trackId: string, rang: 'A' | 'B' | 'AB', itemCode: string) => {
    const newPolling: PollingState = {
      trackId,
      rang,
      itemCode,
      startTime: Date.now()
    };
    
    setPollingTracks(prev => [...prev.filter(p => p.trackId !== trackId), newPolling]);
  }, []);

  const stopPolling = useCallback((trackId: string) => {
    setPollingTracks(prev => prev.filter(p => p.trackId !== trackId));
  }, []);

  const checkTrackStatus = useCallback(async (track: PollingState) => {
    try {
      // 1. D'abord vérifier en BDD locale avec plusieurs critères
      const { data: dbTracks } = await supabase
        .from('generated_music_tracks')
        .select('*')
        .or(`task_id.eq.${track.trackId},suno_track_id.eq.${track.trackId},original_task_id.eq.${track.trackId}`);
        
      if (dbTracks && dbTracks.length > 0) {
        const completedTrack = dbTracks.find(t => t.generation_status === 'completed' && t.audio_url);
        if (completedTrack) {
          setCompletedAudio(prev => ({
            ...prev,
            [track.rang]: completedTrack.audio_url
          }));

          toast({
            title: `🎉 ${track.itemCode} Rang ${track.rang} prêt !`,
            description: `🎵 Votre musique est maintenant disponible`,
            duration: 5000,
          });

          return true;
        } else {
          // Vérifier si on a des tracks récents avec le même rang et item_code
          const recentCompletedTrack = dbTracks.find(t => 
            t.generation_status === 'completed' && 
            t.audio_url && 
            new Date(t.created_at).getTime() > Date.now() - 10 * 60 * 1000 // 10 minutes
          );
          if (recentCompletedTrack) {
            setCompletedAudio(prev => ({
              ...prev,
              [track.rang]: recentCompletedTrack.audio_url
            }));

            toast({
              title: `🎉 ${track.itemCode} Rang ${track.rang} prêt !`,
              description: `🎵 Votre musique est maintenant disponible`,
              duration: 5000,
            });

            return true;
          }
        }
      } else {
        // Chercher des tracks récents du même item_code et rang
        const { data: recentTracks } = await supabase
          .from('generated_music_tracks')
          .select('*')
          .eq('generation_status', 'completed')
          .not('audio_url', 'is', null)
          .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (recentTracks && recentTracks.length > 0) {
          const matchingTrack = recentTracks.find(t => {
            const metadata = t.metadata as Record<string, unknown> | null;
            return (metadata?.rang as string) === track.rang || (metadata?.title as string)?.includes(`Rang ${track.rang}`);
          });
          
          if (matchingTrack) {
            setCompletedAudio(prev => ({
              ...prev,
              [track.rang]: matchingTrack.audio_url
            }));

            toast({
              title: `🎉 ${track.itemCode} Rang ${track.rang} prêt !`,
              description: `🎵 Votre musique est maintenant disponible`,
              duration: 5000,
            });

            return true;
          }
        }
      }

      // 2. Les callbacks Suno gèrent la détection
      return false; // Continue le polling un moment au cas où
      
    } catch {
      return false;
    }
  }, [toast]);

  // Polling automatique toutes les 3 secondes
  useEffect(() => {
    if (pollingTracks.length === 0) return;

    const interval = setInterval(async () => {
      for (const track of pollingTracks) {
        const elapsed = Date.now() - track.startTime;
        const maxWait = 5 * 60 * 1000; // 5 minutes max
        
        if (elapsed > maxWait) {
          stopPolling(track.trackId);
          toast({
            title: "⏰ Génération en cours...",
            description: `${track.itemCode} Rang ${track.rang} prend plus de temps que prévu. La musique sera disponible dans votre bibliothèque dès qu'elle sera terminée.`,
            variant: "default"
          });
          continue;
        }

        const isCompleted = await checkTrackStatus(track);
        if (isCompleted) {
          stopPolling(track.trackId);
        }
      }
    }, 3000); // Check toutes les 3 secondes

    return () => clearInterval(interval);
  }, [pollingTracks, checkTrackStatus, stopPolling, toast]);

  return {
    startPolling,
    stopPolling,
    completedAudio,
    pollingTracks: pollingTracks.length
  };
};
