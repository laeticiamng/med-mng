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
    console.log('🔄 Démarrage polling pour trackId:', trackId, 'rang:', rang);
    
    const newPolling: PollingState = {
      trackId,
      rang,
      itemCode,
      startTime: Date.now()
    };
    
    setPollingTracks(prev => [...prev.filter(p => p.trackId !== trackId), newPolling]);
  }, []);

  const stopPolling = useCallback((trackId: string) => {
    console.log('⏹️ Arrêt polling pour trackId:', trackId);
    setPollingTracks(prev => prev.filter(p => p.trackId !== trackId));
  }, []);

  const checkTrackStatus = useCallback(async (track: PollingState) => {
    try {
      const { data, error } = await supabase
        .from('generated_music_tracks')
        .select('*')
        .eq('task_id', track.trackId)
        .eq('generation_status', 'completed')
        .single();

      if (error) {
        console.log('🔍 Track pas encore prêt:', track.trackId);
        return false;
      }

      if (data?.audio_url) {
        console.log('✅ Track complété trouvé:', track.trackId, 'URL:', data.audio_url);
        
        // Stocker l'URL audio complétée
        setCompletedAudio(prev => ({
          ...prev,
          [`${track.rang}`]: data.audio_url
        }));

        toast({
          title: `🎉 ${track.itemCode} Rang ${track.rang} prêt !`,
          description: `🎵 Votre musique est maintenant disponible pour écoute`,
          duration: 8000, // Durée plus longue pour être sûr de voir le toast
        });

        return true;
      }
    } catch (error) {
      console.error('❌ Erreur polling:', error);
    }
    
    return false;
  }, [toast]);

  // Polling automatique toutes les 10 secondes
  useEffect(() => {
    if (pollingTracks.length === 0) return;

    const interval = setInterval(async () => {
      console.log('🔄 Polling check pour', pollingTracks.length, 'tracks');
      
      // Log l'état actuel du polling
      pollingTracks.forEach(track => {
        const elapsed = Math.floor((Date.now() - track.startTime) / 1000);
        console.log(`⏱️ Track ${track.trackId} - ${track.rang}: ${elapsed}s écoulées`);
      });
      
      for (const track of pollingTracks) {
        const elapsed = Date.now() - track.startTime;
        const maxWait = 10 * 60 * 1000; // 10 minutes max
        
        if (elapsed > maxWait) {
          console.log('⏰ Timeout pour track:', track.trackId);
          stopPolling(track.trackId);
          toast({
            title: "Timeout de génération",
            description: `${track.itemCode} Rang ${track.rang} prend trop de temps`,
            variant: "destructive"
          });
          continue;
        }

        const isCompleted = await checkTrackStatus(track);
        if (isCompleted) {
          stopPolling(track.trackId);
        }
      }
    }, 10000); // Check toutes les 10 secondes

    return () => clearInterval(interval);
  }, [pollingTracks, checkTrackStatus, stopPolling, toast]);

  return {
    startPolling,
    stopPolling,
    completedAudio,
    pollingTracks: pollingTracks.length
  };
};