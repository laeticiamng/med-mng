
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
    maxPolls = 18, // Réduit à 18 (3 minutes max au lieu de 5)
    pollInterval = 5000, // Réduit à 5s pour plus de réactivité
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
        
        // Progression plus rapide et réaliste
        let baseProgress;
        if (pollCount <= 3) {
          // Première phase : progression rapide (0-30%)
          baseProgress = Math.min(Math.round((pollCount / 3) * 30), 30);
        } else if (pollCount <= 8) {
          // Deuxième phase : progression normale (30-70%)
          baseProgress = 30 + Math.min(Math.round(((pollCount - 3) / 5) * 40), 40);
        } else if (pollCount <= 15) {
          // Troisième phase : progression modérée (70-95%)
          baseProgress = 70 + Math.min(Math.round(((pollCount - 8) / 7) * 25), 25);
        } else {
          // Phase finale : progression très lente (95-98%)
          baseProgress = 95 + Math.min(Math.round(((pollCount - 15) / 3) * 3), 3);
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
            onError(new Error('La génération prend plus de temps que prévu (2 minutes). Réessayez.'));
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
          onError(new Error('La génération prend plus de temps que prévu. Suno est peut-être occupé. Réessayez dans quelques minutes.'));
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
