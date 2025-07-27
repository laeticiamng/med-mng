import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MusicGenerationStatus {
  taskId: string;
  status: 'generating' | 'text_complete' | 'completed' | 'failed';
  audioUrl?: string;
  streamUrl?: string;
  imageUrl?: string;
  progress?: number;
  metadata?: any;
  error?: string;
}

export const useMusicGenerationStatus = (taskId: string | null) => {
  const [status, setStatus] = useState<MusicGenerationStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!taskId) return;

    try {
      console.log('🔍 Vérification statut pour taskId:', taskId);
      
      // Vérifier d'abord en base de données
      const { data: dbTrack, error: dbError } = await supabase
        .from('generated_music_tracks')
        .select('*')
        .or(`task_id.eq.${taskId},suno_track_id.eq.${taskId}`)
        .single();

      if (dbTrack && !dbError) {
        console.log('✅ Statut trouvé en BDD:', dbTrack.generation_status);
        
        const metadata = dbTrack.metadata as any;
        
        const statusData: MusicGenerationStatus = {
          taskId: taskId,
          status: dbTrack.generation_status as MusicGenerationStatus['status'],
          audioUrl: dbTrack.audio_url,
          streamUrl: metadata?.stream_url,
          imageUrl: metadata?.image_url,
          progress: getProgressFromStatus(dbTrack.generation_status, metadata?.progress),
          metadata: metadata
        };

        setStatus(statusData);

        // Arrêter le polling si terminé
        if (dbTrack.generation_status === 'completed' || dbTrack.generation_status === 'failed') {
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

  // Effect pour le polling automatique
  useEffect(() => {
    if (!isPolling || !taskId) return;

    const interval = setInterval(() => {
      console.log('⏰ Polling check automatique...');
      checkStatus();
    }, 5000); // Vérification toutes les 5 secondes

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