import { supabase } from '@/integrations/supabase/client';
import { MusicGenerationRequest, PollingProgress } from '@/types/music';

interface PollingConfig {
  rang: 'A' | 'B';
  requestBody: MusicGenerationRequest;
  maxPolls?: number;
  pollInterval?: number;
  onProgress: (rang: 'A' | 'B', progress: PollingProgress) => void;
  onSuccess: (rang: 'A' | 'B', audioUrl: string) => void;
  onError: (error: Error) => void;
}

export const useMusicPolling = () => {
  const startPolling = ({ 
    rang, 
    requestBody, 
    maxPolls = 8, // Drastiquement réduit à 8 (45 secondes max)
    pollInterval = 2000, // Réduit à 2s pour plus de réactivité
    onProgress,
    onSuccess,
    onError
  }: PollingConfig) => {
    let pollCount = 0;
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3; // Réduit à 3 erreurs consécutives
    
    const intervalId = setInterval(async () => {
      try {
        pollCount++;
        
        // Progression optimisée pour 8 polls max (45 secondes)
        let baseProgress;
        if (pollCount <= 1) {
          // Première phase : progression rapide (0-50%)
          baseProgress = Math.min(Math.round((pollCount / 1) * 50), 50);
        } else if (pollCount <= 4) {
          // Deuxième phase : progression normale (50-85%)
          baseProgress = 50 + Math.min(Math.round(((pollCount - 1) / 3) * 35), 35);
        } else if (pollCount <= 7) {
          // Troisième phase : progression finale (85-98%)
          baseProgress = 85 + Math.min(Math.round(((pollCount - 4) / 3) * 13), 13);
        } else {
          // Phase finale : 98%
          baseProgress = 98;
        }
        
        const estimatedTimeRemaining = Math.max(Math.round(((maxPolls - pollCount) * pollInterval) / 60000), 0);
        
        console.log(`🔄 Polling rapide ${pollCount}/${maxPolls} pour Rang ${rang} - Progress: ${baseProgress}%`);
        
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
          consecutiveErrors++;
          console.warn(`⚠️ Erreur polling ${pollCount} (${consecutiveErrors}/${maxConsecutiveErrors}):`, pollError);
          
          // Si trop d'erreurs consécutives, on arrête plus rapidement
          if (consecutiveErrors >= maxConsecutiveErrors) {
            clearInterval(intervalId);
            onError(new Error(`Trop d'erreurs consécutives lors du polling (${consecutiveErrors})`));
            return;
          }
          
          // Sinon on continue mais on vérifie si on a atteint le maximum de tentatives
          if (pollCount >= maxPolls) {
            clearInterval(intervalId);
            onError(new Error('Timeout de génération (16s). Suno est peut-être occupé, réessayez.'));
            return;
          }
          return;
        }

        // Reset du compteur d'erreurs si succès
        consecutiveErrors = 0;
        console.log(`📥 Données du polling ${pollCount}:`, pollData);

        // Vérifier si la génération est terminée avec succès
        if (pollData?.status === 'success' && pollData?.audioUrl) {
          console.log('✅ GÉNÉRATION TERMINÉE:', pollData.audioUrl);
          clearInterval(intervalId);
          
          // Progression finale à 100%
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
        if (pollData?.status === 'error') {
          clearInterval(intervalId);
          onError(new Error(pollData.message || 'Erreur lors de la génération'));
          return;
        }

        // Gestion spéciale pour les timeouts (status 408)
        if (pollData?.status === 'timeout') {
          console.log('⏰ Timeout détecté, on continue le polling...');
          // On ne s'arrête pas, on continue à espérer
        }

        // Timeout atteint plus rapidement
        if (pollCount >= maxPolls) {
          clearInterval(intervalId);
          onError(new Error('Timeout de génération (16s). Suno est peut-être occupé, réessayez.'));
          return;
        }
        
      } catch (pollError) {
        consecutiveErrors++;
        console.error(`❌ Erreur critique lors du polling ${pollCount}:`, pollError);
        
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
