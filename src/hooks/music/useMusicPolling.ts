
import { supabase } from '@/integrations/supabase/client';
import { MusicTrack } from '@/types';
import { errorService } from '@/services/core/ErrorService';

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
    maxPolls = 18, // Augmenté pour couvrir 2-3 minutes
    pollInterval = 5000, // Réduit à 5s - plus agressif
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
        
        // Progression ultra-rapide sur 18 polls (90 secondes max)
        let baseProgress;
        if (pollCount <= 1) {
          // Démarrage immédiat : 0-15%
          baseProgress = Math.round((pollCount / 1) * 15);
        } else if (pollCount <= 4) {
          // Phase rapide : 15-50%
          baseProgress = 15 + Math.round(((pollCount - 1) / 3) * 35);
        } else if (pollCount <= 10) {
          // Phase principale : 50-85%
          baseProgress = 50 + Math.round(((pollCount - 4) / 6) * 35);
        } else if (pollCount <= 16) {
          // Phase finale : 85-95%
          baseProgress = 85 + Math.round(((pollCount - 10) / 6) * 10);
        } else {
          // Dernière ligne : 95-99%
          baseProgress = 95 + Math.min(Math.round(((pollCount - 16) / 2) * 4), 4);
        }
        
        const estimatedTimeRemaining = Math.max(Math.round(((maxPolls - pollCount) * pollInterval) / 1000), 0);
        
        console.log(`🚀 Polling ultra-rapide ${pollCount}/${maxPolls} pour Rang ${rang} - Progress: ${baseProgress}% - ETA: ${estimatedTimeRemaining}s`);
        
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
          errorService.handleWarning(`⚠️ Erreur polling ${pollCount} (${consecutiveErrors}/${maxConsecutiveErrors})`, 'user_action');
          
          // Si trop d'erreurs consécutives, on arrête plus rapidement
          if (consecutiveErrors >= maxConsecutiveErrors) {
            clearInterval(intervalId);
            onError(new Error(`Trop d'erreurs consécutives lors du polling (${consecutiveErrors})`));
            return;
          }
          
          // Sinon on continue mais on vérifie si on a atteint le maximum de tentatives
          if (pollCount >= maxPolls) {
            clearInterval(intervalId);
            onError(new Error('Temps d\'attente dépassé après 90s. Suno est peut-être surchargé.'));
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
          onError(new Error('Génération terminée après 90s. Essayez de rafraîchir si votre musique n\'apparaît pas.'));
          return;
        }
        
      } catch (pollError) {
        consecutiveErrors++;
        errorService.handleError(pollError, 'user_action', true);
        
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
