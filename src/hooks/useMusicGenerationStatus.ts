import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MusicGenerationStatus, MusicGenerationMetadata } from '@/types/music';

export const useMusicGenerationStatus = (taskId: string | null) => {
  const [status, setStatus] = useState<MusicGenerationStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!taskId) return;

    try {
      // Vérifier d'abord en base de données
      const { _data: dbTracks, _error: dbError } = await supabase
        .from('generated_music_tracks')
        .select('*')
        .or(`task_id.eq.${taskId},suno_track_id.eq.${taskId}`);

      if (dbTracks && dbTracks.length > 0 && !dbError) {
        // Prioriser les tracks avec audio_url valide
        const completedTrack = dbTracks.find(t => 
          t.audio_url && 
          t.audio_url !== '' && 
          t.audio_url !== taskId && 
          t.audio_url.startsWith('http')
        );
        const dbTrack = completedTrack || dbTracks[0];
        
        const metadata = dbTrack.metadata as MusicGenerationMetadata | null;
        
        const hasValidAudio = dbTrack.audio_url && 
                             dbTrack.audio_url !== '' && 
                             dbTrack.audio_url !== taskId && 
                             dbTrack.audio_url.startsWith('http');
        
        const finalStatus = hasValidAudio
          ? 'completed' 
          : (dbTrack.generation_status as MusicGenerationStatus['status']);
        
        const statusData: MusicGenerationStatus = {
          taskId: taskId,
          status: finalStatus,
          audioUrl: hasValidAudio ? dbTrack.audio_url : undefined,
          streamUrl: dbTrack.stream_url || metadata?.stream_url,
          imageUrl: dbTrack.image_url || metadata?.image_url,
          progress: getProgressFromStatus(finalStatus, metadata?.progress),
          metadata: metadata
        };

        setStatus(statusData);

        if (finalStatus === 'completed' || finalStatus === 'failed') {
          setIsPolling(false);
        }

        return statusData;
      }

      // Si pas trouvé en BDD, vérifier via l'API de statut
      const { _data, error } = await supabase.functions.invoke('music-status', {
        body: { taskId }
      });

      if (_data && !error) {
        const statusData: MusicGenerationStatus = {
          taskId: taskId,
          status: _data.status,
          audioUrl: _data.audioUrl,
          streamUrl: _data.streamUrl,
          imageUrl: _data.imageUrl,
          progress: getProgressFromStatus(_data.status, _data.metadata?.progress),
          metadata: _data.metadata
        };
        
        setStatus(statusData);
        
        if (_data.status === 'completed' || _data.status === 'failed') {
          setIsPolling(false);
        }
        
        return statusData;
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setStatus({
        taskId: taskId,
        status: 'failed',
        error: errorMessage,
        progress: 0
      });
      setIsPolling(false);
    }
  }, [taskId]);

  const startPolling = useCallback(() => {
    if (!taskId) return;
    setIsPolling(true);
    checkStatus();
  }, [taskId, checkStatus]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  // Effect pour le polling automatique avec fréquence adaptative
  useEffect(() => {
    if (!isPolling || !taskId) return;

    const startTime = Date.now();
    let timeoutId: NodeJS.Timeout;
    let safetyTimeoutId: NodeJS.Timeout;
    let isCancelled = false;

    const doPoll = async () => {
      if (isCancelled) return;

      await checkStatus();

      if (isCancelled) return;

      // Intervalle adaptatif : 3s au début, 8s après 30s
      const elapsed = Date.now() - startTime;
      const pollInterval = elapsed > 30000 ? 8000 : 3000;
      
      timeoutId = setTimeout(doPoll, pollInterval);
    };

    doPoll();

    // Timeout de sécurité : arrêter après 5 minutes
    safetyTimeoutId = setTimeout(() => {
      isCancelled = true;
      setIsPolling(false);
      setStatus(prev => prev ? { ...prev, status: 'failed', error: 'Timeout de génération' } : null);
    }, 300000);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      clearTimeout(safetyTimeoutId);
    };
  }, [isPolling, taskId, checkStatus]);

  useEffect(() => {
    return () => {
      setIsPolling(false);
    };
  }, []);

  return {
    status,
    isPolling,
    startPolling,
    stopPolling,
    checkStatus,
    isGenerating: status?.status === 'generating' || status?.status === 'text_complete',
    isCompleted: status?.status === 'completed',
    isFailed: status?.status === 'failed',
    progress: status?.progress || 0,
    audioUrl: status?.audioUrl,
    streamUrl: status?.streamUrl,
    imageUrl: status?.imageUrl
  };
};

function getProgressFromStatus(status: string, metadataProgress?: number): number {
  if (metadataProgress) return metadataProgress;
  
  switch (status) {
    case 'generating': return 25;
    case 'text_complete': return 75;
    case 'completed': return 100;
    case 'failed': return 0;
    default: return 0;
  }
}
