import { supabase } from '@/integrations/supabase/client';
import { PollingProgress } from '@/types/music';

interface PollingConfig {
  taskId: string; // ✅ Ajouté: on poll avec le taskId, pas requestBody
  rang: 'A' | 'B' | 'AB';
  maxPolls?: number;
  pollInterval?: number;
  onProgress: (rang: 'A' | 'B' | 'AB', progress: PollingProgress) => void;
  onSuccess: (rang: 'A' | 'B' | 'AB', audioUrl: string) => void;
  onError: (error: Error) => void;
}

export const useMusicPolling = () => {
  const startPolling = ({ 
    taskId,
    rang, 
    maxPolls = 60, // 5 minutes max (60 * 5s)
    pollInterval = 5000, // 5s pour plus de stabilité
    onProgress,
    onSuccess,
    onError
  }: PollingConfig) => {
    let pollCount = 0;
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 5;
    
    const intervalId = setInterval(async () => {
      try {
        pollCount++;
        
        // Calculer progression basée sur le temps écoulé
        const elapsedMs = pollCount * pollInterval;
        let baseProgress: number;
        if (elapsedMs < 30000) {
          baseProgress = (elapsedMs / 30000) * 30;
        } else if (elapsedMs < 60000) {
          baseProgress = 30 + ((elapsedMs - 30000) / 30000) * 20;
        } else if (elapsedMs < 120000) {
          baseProgress = 50 + ((elapsedMs - 60000) / 60000) * 30;
        } else {
          baseProgress = 80 + Math.min(((elapsedMs - 120000) / 180000) * 15, 15);
        }
        
        const estimatedTimeRemaining = Math.max(Math.round(((maxPolls - pollCount) * pollInterval) / 60000), 0);
        
        onProgress(rang, {
          progress: Math.round(baseProgress),
          attempts: pollCount,
          maxAttempts: maxPolls,
          estimatedTimeRemaining
        });

        // ✅ CORRECTION CRITIQUE: Appeler music-status au lieu de generate-music
        const { data: pollData, error: pollError } = await supabase.functions.invoke('music-status', {
          body: { taskId }
        });

        if (pollError) {
          consecutiveErrors++;
          console.warn(`[useMusicPolling] Erreur polling (${consecutiveErrors}/${maxConsecutiveErrors}):`, pollError);
          
          if (consecutiveErrors >= maxConsecutiveErrors) {
            clearInterval(intervalId);
            onError(new Error(`Erreur réseau persistante après ${consecutiveErrors} tentatives`));
            return;
          }
          
          if (pollCount >= maxPolls) {
            clearInterval(intervalId);
            onError(new Error('Timeout de génération (5 min). Suno est peut-être occupé, réessayez.'));
            return;
          }
          return;
        }

        consecutiveErrors = 0;

        // Vérifier si la génération est terminée avec succès
        if (pollData?.status === 'completed' && pollData?.audioUrl) {
          clearInterval(intervalId);
          
          onProgress(rang, {
            progress: 100,
            attempts: pollCount,
            maxAttempts: maxPolls,
            estimatedTimeRemaining: 0
          });
          
          onSuccess(rang, pollData.audioUrl);
          return;
        }

        // Vérifier si il y a une erreur définitive
        if (pollData?.status === 'failed') {
          clearInterval(intervalId);
          onError(new Error(pollData.error || 'Génération échouée'));
          return;
        }

        // Timeout atteint
        if (pollCount >= maxPolls) {
          clearInterval(intervalId);
          onError(new Error('Timeout de génération (5 min). Suno est peut-être occupé, réessayez.'));
          return;
        }
        
      } catch (pollError) {
        consecutiveErrors++;
        console.error(`[useMusicPolling] Erreur critique:`, pollError);
        
        if (consecutiveErrors >= maxConsecutiveErrors || pollCount >= maxPolls) {
          clearInterval(intervalId);
          onError(pollError as Error);
        }
      }
    }, pollInterval);

    return intervalId;
  };

  return {
    startPolling
  };
};
