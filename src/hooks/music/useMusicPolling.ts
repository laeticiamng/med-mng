
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
    maxPolls = 60, // Augmenté de 48 à 60 pour plus de patience
    pollInterval = 8000, // Augmenté de 5s à 8s pour réduire la charge
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
        
        // Progression plus réaliste : lente au début, puis plus rapide
        let baseProgress;
        if (pollCount <= 10) {
          // Première phase : progression très lente (0-15%)
          baseProgress = Math.min(Math.round((pollCount / 10) * 15), 15);
        } else if (pollCount <= 30) {
          // Deuxième phase : progression modérée (15-50%)
          baseProgress = 15 + Math.min(Math.round(((pollCount - 10) / 20) * 35), 35);
        } else if (pollCount <= 50) {
          // Troisième phase : progression normale (50-80%)
          baseProgress = 50 + Math.min(Math.round(((pollCount - 30) / 20) * 30), 30);
        } else {
          // Phase finale : progression ralentie (80-95%)
          baseProgress = 80 + Math.min(Math.round(((pollCount - 50) / 10) * 15), 15);
        }
        
        const estimatedTimeRemaining = Math.max(Math.round(((maxPolls - pollCount) * pollInterval) / 60000), 0);
        
        console.log(`🔄 Polling amélioré ${pollCount}/${maxPolls} pour Rang ${rang} - Progress: ${baseProgress}%`);
        
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
          
          // Si trop d'erreurs consécutives, on arrête
          if (consecutiveErrors >= maxConsecutiveErrors) {
            clearInterval(intervalId);
            onError(new Error(`Trop d'erreurs consécutives lors du polling (${consecutiveErrors})`));
            return;
          }
          
          // Sinon on continue mais on vérifie si on a atteint le maximum de tentatives
          if (pollCount >= maxPolls) {
            clearInterval(intervalId);
            onError(new Error('Délai d\'attente dépassé pour la génération musicale'));
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

        // Timeout atteint
        if (pollCount >= maxPolls) {
          clearInterval(intervalId);
          onError(new Error('La génération prend exceptionnellement beaucoup de temps. L\'API Suno est peut-être surchargée. Veuillez réessayer dans quelques minutes.'));
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
