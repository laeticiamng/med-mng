
import { supabase } from '@/integrations/supabase/client';

interface PollingConfig {
  rang: 'A' | 'B';
  requestBody: any;
  maxPolls?: number;
  pollInterval?: number;
  onProgress: (rang: 'A' | 'B', progress: {
    progress: number;
    attempts: number;
    maxAttempts: number;
    estimatedTimeRemaining: number;
  }) => void;
  onSuccess: (rang: 'A' | 'B', audioUrl: string) => void;
  onError: (error: Error) => void;
}

export const useMusicPolling = () => {
  const startPolling = ({ 
    rang, 
    requestBody, 
    maxPolls = 48, 
    pollInterval = 5000,
    onProgress,
    onSuccess,
    onError
  }: PollingConfig) => {
    let pollCount = 0;
    
    const intervalId = setInterval(async () => {
      try {
        pollCount++;
        
        // Progression visuelle basée sur le temps écoulé
        const baseProgress = Math.min(Math.round((pollCount / maxPolls) * 85), 85);
        const estimatedTimeRemaining = Math.max(Math.round(((maxPolls - pollCount) * pollInterval) / 60000), 0);
        
        console.log(`🔄 Polling ${pollCount}/${maxPolls} pour Rang ${rang} - Progress: ${baseProgress}%`);
        
        onProgress(rang, {
          progress: baseProgress,
          attempts: pollCount,
          maxAttempts: maxPolls,
          estimatedTimeRemaining
        });

        // Faire un nouvel appel pour vérifier le statut
        const { data: pollData, error: pollError } = await supabase.functions.invoke('generate-music', {
          body: requestBody
        });

        if (pollError) {
          console.warn(`⚠️ Erreur lors du polling ${pollCount}:`, pollError);
          // Continue le polling même en cas d'erreur
          if (pollCount >= maxPolls) {
            clearInterval(intervalId);
            onError(new Error('Délai d\'attente dépassé pour la génération musicale'));
          }
          return;
        }

        console.log(`📥 Données du polling ${pollCount}:`, pollData);

        // Vérifier si la génération est terminée avec succès
        if (pollData?.status === 'success' && pollData?.audioUrl) {
          console.log('✅ GÉNÉRATION TERMINÉE:', pollData.audioUrl);
          clearInterval(intervalId);
          
          // Progression à 100%
          onProgress(rang, {
            progress: 100,
            attempts: pollCount,
            maxAttempts: maxPolls,
            estimatedTimeRemaining: 0
          });
          
          onSuccess(rang, pollData.audioUrl);
          return;
        }

        // Vérifier si il y a une erreur
        if (pollData?.status === 'error') {
          clearInterval(intervalId);
          onError(new Error(pollData.message || 'Erreur lors de la génération'));
          return;
        }

        // Timeout atteint
        if (pollCount >= maxPolls) {
          clearInterval(intervalId);
          onError(new Error('La génération prend plus de temps que prévu. Veuillez réessayer.'));
          return;
        }
        
      } catch (pollError) {
        console.error(`❌ Erreur lors du polling ${pollCount}:`, pollError);
        clearInterval(intervalId);
        onError(pollError as Error);
      }
    }, pollInterval);

    return intervalId;
  };

  return {
    startPolling
  };
};
