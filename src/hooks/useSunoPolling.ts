
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
      console.log('🔍 Vérification statut pour trackId:', track.trackId);
      
      // 1. D'abord vérifier en BDD locale
      const { data: dbTrack, error: dbError } = await supabase
        .from('generated_music_tracks')
        .select('*')
        .eq('task_id', track.trackId)
        .single();

      if (dbTrack && dbTrack.audio_url && dbTrack.generation_status === 'completed') {
        console.log('✅ Track complété trouvé en BDD:', track.trackId, 'URL:', dbTrack.audio_url);
        
        setCompletedAudio(prev => ({
          ...prev,
          [track.rang]: dbTrack.audio_url
        }));

        toast({
          title: `🎉 ${track.itemCode} Rang ${track.rang} prêt !`,
          description: `🎵 Votre musique est maintenant disponible`,
          duration: 5000,
        });

        return true;
      }

      // 2. Si pas trouvé en BDD, vérifier directement via l'API Suno
      console.log('📡 Vérification directe via API Suno pour:', track.trackId);
      
      const { data: statusData, error: statusError } = await supabase.functions.invoke('music-status', {
        body: { taskId: track.trackId }
      });

      if (statusData && !statusError) {
        console.log('📊 Statut API Suno:', statusData);
        
        if (statusData.status === 'completed' && statusData.audioUrl) {
          console.log('✅ Track complété via API Suno:', track.trackId, 'URL:', statusData.audioUrl);
          
          // Mettre à jour la BDD avec le résultat
          await supabase
            .from('generated_music_tracks')
            .update({
              generation_status: 'completed',
              audio_url: statusData.audioUrl,
              metadata: {
                ...dbTrack?.metadata,
                stream_url: statusData.streamUrl,
                image_url: statusData.imageUrl,
                completed_at: new Date().toISOString()
              }
            })
            .eq('task_id', track.trackId);

          setCompletedAudio(prev => ({
            ...prev,
            [track.rang]: statusData.audioUrl
          }));

          toast({
            title: `🎉 ${track.itemCode} Rang ${track.rang} prêt !`,
            description: `🎵 Votre musique est maintenant disponible`,
            duration: 5000,
          });

          return true;
        } else if (statusData.status === 'failed') {
          console.error('❌ Génération échouée pour:', track.trackId);
          
          toast({
            title: `❌ ${track.itemCode} Rang ${track.rang} échoué`,
            description: `La génération a échoué. Veuillez réessayer.`,
            variant: "destructive",
            duration: 5000,
          });

          return true; // Arrêter le polling
        }
      }

      console.log('⏳ Track pas encore prêt:', track.trackId);
      return false;
      
    } catch (error) {
      console.error('❌ Erreur polling:', error);
      return false;
    }
  }, [toast]);

  // Polling automatique toutes les 5 secondes (plus rapide)
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
        const maxWait = 5 * 60 * 1000; // 5 minutes max (réduit de 10 min)
        
        if (elapsed > maxWait) {
          console.log('⏰ Timeout pour track:', track.trackId);
          stopPolling(track.trackId);
          toast({
            title: "⏰ Timeout de génération",
            description: `${track.itemCode} Rang ${track.rang} prend trop de temps. Réessayez.`,
            variant: "destructive"
          });
          continue;
        }

        const isCompleted = await checkTrackStatus(track);
        if (isCompleted) {
          stopPolling(track.trackId);
        }
      }
    }, 5000); // Check toutes les 5 secondes (plus rapide)

    return () => clearInterval(interval);
  }, [pollingTracks, checkTrackStatus, stopPolling, toast]);

  return {
    startPolling,
    stopPolling,
    completedAudio,
    pollingTracks: pollingTracks.length
  };
};
