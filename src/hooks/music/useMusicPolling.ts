
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
    maxPolls = 6, // Optimisé selon la doc officielle (20 secondes)
    pollInterval = 3000, // 3s d'intervalle pour laisser du temps à Suno
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
        
        // Progression optimisée pour 6 polls max (18 secondes selon doc officielle)
        let baseProgress;
        if (pollCount <= 1) {
          // Première phase : démarrage (0-30%)
          baseProgress = Math.min(Math.round((pollCount / 1) * 30), 30);
        } else if (pollCount <= 3) {
          // Deuxième phase : progression (30-70%)
          baseProgress = 30 + Math.min(Math.round(((pollCount - 1) / 2) * 40), 40);
        } else if (pollCount <= 5) {
          // Troisième phase : finalisation (70-95%)
          baseProgress = 70 + Math.min(Math.round(((pollCount - 3) / 2) * 25), 25);
        } else {
          // Phase finale : 95%
          baseProgress = 95;
        }
        
        const estimatedTimeRemaining = Math.max(Math.round(((maxPolls - pollCount) * pollInterval) / 60000), 0);
        
        console.log(`🔄 Polling optimisé ${pollCount}/${maxPolls} pour Rang ${rang} - Progress: ${baseProgress}%`);
        
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
            onError(new Error('Génération optimisée: timeout après 18s. Réessayez.'));
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

        // Timeout atteint selon doc officielle
        if (pollCount >= maxPolls) {
          clearInterval(intervalId);
          onError(new Error('Génération optimisée: timeout après 18s selon doc Suno. Réessayez.'));
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
