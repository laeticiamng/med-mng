import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MusicGenerationStatus, MusicGenerationMetadata } from '@shared/types/music';

export const useMusicGenerationStatus = (taskId: string | null) => {
  const [status, setStatus] = useState<MusicGenerationStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!taskId) return;

    try {
      console.log('🔍 Vérification statut pour taskId:', taskId);
      
      // Vérifier d'abord en base de données - Récupérer TOUS les tracks
      const { data: dbTracks, error: dbError } = await supabase
        .from('generated_music_tracks')
        .select('*')
        .or(`task_id.eq.${taskId},suno_track_id.eq.${taskId}`);

      if (dbTracks && dbTracks.length > 0 && !dbError) {
        console.log(`✅ ${dbTracks.length} track(s) trouvé(s) en BDD`);
        
        // Prioriser les tracks avec audio_url valide (URL HTTP, pas un taskId)
        const completedTrack = dbTracks.find(t => 
          t.audio_url && 
          t.audio_url !== '' && 
          t.audio_url !== taskId && 
          t.audio_url.startsWith('http')
        );
        const dbTrack = completedTrack || dbTracks[0]; // Sinon prendre le premier
        
        console.log('📀 Track sélectionné:', {
          id: dbTrack.id,
          has_audio: !!dbTrack.audio_url,
          is_valid_url: dbTrack.audio_url?.startsWith('http'),
          is_task_id: dbTrack.audio_url === taskId,
          status: dbTrack.generation_status,
          audio_url_preview: dbTrack.audio_url?.substring(0, 60)
        });
        
        const metadata = dbTrack.metadata as MusicGenerationMetadata | null;
        
        // Si on a trouvé un track avec audio valide, marquer comme complété
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

        // Arrêter le polling si terminé
        if (finalStatus === 'completed' || finalStatus === 'failed') {
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
          metadata: data.metadata
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
    
    // Vérification immédiate
    checkStatus();
  }, [taskId, checkStatus]);

  // Arrêter le polling
  const stopPolling = useCallback(() => {
    console.log('⏹️ Arrêt du polling');
    setIsPolling(false);
  }, []);

  // Effect pour le polling automatique avec fréquence adaptative (setTimeout récursif)
  useEffect(() => {
    if (!isPolling || !taskId) return;

    const startTime = Date.now();
    let timeoutId: NodeJS.Timeout;
    let safetyTimeoutId: NodeJS.Timeout;
    let isCancelled = false;

    const doPoll = async () => {
      if (isCancelled) return;

      console.log('⏰ Polling check automatique...');
      await checkStatus();

      if (isCancelled) return;

      // Intervalle adaptatif : 3s au début, 8s après 30s
      const elapsed = Date.now() - startTime;
      const pollInterval = elapsed > 30000 ? 8000 : 3000;
      
      console.log(`⏱️ Prochain polling dans ${pollInterval/1000}s`);
      timeoutId = setTimeout(doPoll, pollInterval);
    };

    // Premier check immédiat
    doPoll();

    // Timeout de sécurité : arrêter après 5 minutes
    safetyTimeoutId = setTimeout(() => {
      console.warn('⏱️ Timeout polling après 5 minutes');
      isCancelled = true;
      setIsPolling(false);
      setStatus(prev => prev ? { ...prev, status: 'failed', error: 'Timeout de génération' } : null);
    }, 300000); // 5 minutes

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      clearTimeout(safetyTimeoutId);
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
    checkStatus,
    // Helpers
    isGenerating: status?.status === 'generating' || status?.status === 'text_complete',
    isCompleted: status?.status === 'completed',
    isFailed: status?.status === 'failed',
    progress: status?.progress || 0,
    audioUrl: status?.audioUrl,
    streamUrl: status?.streamUrl,
    imageUrl: status?.imageUrl
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
    default: return 0;
  }
}