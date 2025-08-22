import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MusicGenerationStatus {
  taskId: string;
  status: 'generating' | 'text_complete' | 'completed' | 'failed' | 'timeout';
  audioUrl?: string;
  streamUrl?: string;
  imageUrl?: string;
  progress?: number;
  metadata?: any;
  error?: string;
  startTime?: number;
  elapsedTime?: number;
}

export const useMusicGenerationStatus = (taskId: string | null) => {
  const [status, setStatus] = useState<MusicGenerationStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Timeout de 5 minutes (300 secondes)
  const GENERATION_TIMEOUT = 5 * 60 * 1000;

  const checkStatus = useCallback(async () => {
    if (!taskId) return;

    // Vérifier le timeout
    const currentTime = Date.now();
    const elapsed = startTime ? currentTime - startTime : 0;
    
    if (startTime && elapsed > GENERATION_TIMEOUT) {
      console.log('⏱️ Timeout atteint pour la génération:', elapsed / 1000, 'secondes');
      setTimeoutReached(true);
      setStatus(prev => prev ? {
        ...prev,
        status: 'timeout',
        error: 'La génération prend plus de temps que prévu. Vous pouvez annuler et relancer.',
        elapsedTime: elapsed
      } : null);
      setIsPolling(false);
      return;
    }

    try {
      console.log('🔍 Vérification statut pour taskId:', taskId, `(${Math.round(elapsed / 1000)}s écoulées)`);
      
      // Vérifier d'abord en base de données
      const { data: dbTracks, error: dbError } = await supabase
        .from('generated_music_tracks')
        .select('*')
        .or(`task_id.eq.${taskId},suno_track_id.eq.${taskId}`);

      // Prendre le premier track avec audio_url ou le plus récent
      const dbTrack = dbTracks?.find(track => track.audio_url && track.audio_url.trim() !== '') || 
                      dbTracks?.[0];

      if (dbTrack && !dbError) {
        console.log('✅ Statut trouvé en BDD:', dbTrack.generation_status, 'avec audio:', !!dbTrack.audio_url);
        
        const metadata = dbTrack.metadata as any;
        
        const statusData: MusicGenerationStatus = {
          taskId: taskId,
          status: dbTrack.generation_status as MusicGenerationStatus['status'],
          audioUrl: dbTrack.audio_url,
          streamUrl: dbTrack.stream_url || metadata?.stream_url,
          imageUrl: dbTrack.image_url || metadata?.image_url,
          progress: getProgressFromStatus(dbTrack.generation_status, metadata?.progress),
          metadata: metadata,
          startTime: startTime || undefined,
          elapsedTime: elapsed
        };

        setStatus(statusData);

        // Arrêter le polling si terminé ou si on a une URL audio/stream
        if (dbTrack.generation_status === 'completed' || 
            dbTrack.generation_status === 'failed' ||
            dbTrack.audio_url || 
            dbTrack.stream_url) {
          setIsPolling(false);
          console.log('🏁 Génération terminée, arrêt du polling');
        }

        return statusData;
      }

      // Si pas trouvé en BDD ou pas complété, vérifier via l'API de statut
      console.log('📡 Vérification via API de statut...');
      const { data, error } = await supabase.functions.invoke('music-status', {
        body: { taskId }
      });

      if (data && !error) {
        console.log('📊 Statut reçu via API:', data);
        
        const statusData: MusicGenerationStatus = {
          taskId: taskId,
          status: data.status,
          audioUrl: data.audioUrl,
          streamUrl: data.streamUrl,
          imageUrl: data.imageUrl,
          progress: getProgressFromStatus(data.status, data.metadata?.progress),
          metadata: data.metadata,
          startTime: startTime || undefined,
          elapsedTime: elapsed
        };
        
        setStatus(statusData);
        
        if (data.status === 'completed' || data.status === 'failed') {
          setIsPolling(false);
          console.log('🏁 Génération terminée via API, arrêt du polling');
        }
        
        return statusData;
      } else {
        console.error('❌ Erreur lors de l\'appel API de statut:', error);
        // Continuer le polling même en cas d'erreur temporaire
      }

    } catch (error) {
      console.error('❌ Erreur vérification statut:', error);
      setStatus({
        taskId: taskId,
        status: 'failed',
        error: error.message,
        progress: 0
      });
      setIsPolling(false);
    }
  }, [taskId]);

  // Démarrer le polling
  const startPolling = useCallback(() => {
    if (!taskId) return;
    
    console.log('🔄 Démarrage polling pour taskId:', taskId);
    setIsPolling(true);
    setStartTime(Date.now());
    setTimeoutReached(false);
    
    // Vérification immédiate
    checkStatus();
  }, [taskId, checkStatus]);

  // Arrêter le polling
  const stopPolling = useCallback(() => {
    console.log('⏹️ Arrêt du polling');
    setIsPolling(false);
    setStartTime(null);
    setTimeoutReached(false);
  }, []);

  // Annuler la génération
  const cancelGeneration = useCallback(() => {
    console.log('❌ Annulation de la génération');
    setIsPolling(false);
    setStartTime(null);
    setTimeoutReached(false);
    setStatus(null);
  }, []);

  // Effect pour le polling automatique
  useEffect(() => {
    if (!isPolling || !taskId) return;

    const interval = setInterval(() => {
      console.log('⏰ Polling check automatique...');
      checkStatus();
    }, 10000); // Vérification toutes les 10 secondes (réduit la fréquence)

    return () => {
      clearInterval(interval);
    };
  }, [isPolling, taskId, checkStatus]);

  // Nettoyage au démontage
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
    cancelGeneration,
    checkStatus,
    timeoutReached,
    // Helpers
    isGenerating: (status?.status === 'generating' || status?.status === 'text_complete') && !status?.audioUrl && !status?.streamUrl,
    isCompleted: status?.status === 'completed' || !!(status?.audioUrl || status?.streamUrl),
    isFailed: status?.status === 'failed',
    isTimeout: status?.status === 'timeout',
    progress: status?.progress || 0,
    audioUrl: status?.audioUrl,
    streamUrl: status?.streamUrl,
    imageUrl: status?.imageUrl,
    elapsedTime: status?.elapsedTime || 0
  };
};

// Helper pour calculer le progrès selon le statut
function getProgressFromStatus(status: string, metadataProgress?: number): number {
  if (metadataProgress) return metadataProgress;
  
  switch (status) {
    case 'generating': return 25;
    case 'text_complete': return 75;
    case 'completed': return 100;
    case 'failed': return 0;
    case 'timeout': return 0;
    default: return 0;
  }
}