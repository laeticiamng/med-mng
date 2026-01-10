/**
 * Orchestrateur de génération musicale
 * Gère le cycle complet: démarrage, polling, succès/erreur
 */

import { useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMusicPolling } from './useMusicPolling';
import { useRetryWithBackoff, isRetryableError } from '@/hooks/useRetryWithBackoff';

interface GenerationConfig {
  rang: 'A' | 'B' | 'AB';
  translatedLyrics: string;
  selectedStyle: string;
  duration: number;
  currentLanguage: string;
  itemCode?: string;
  model?: 'V4' | 'V4_5' | 'V4_5ALL' | 'V4_5PLUS' | 'V5';
  onProgress: (rang: 'A' | 'B' | 'AB', progress: any) => void;
  onSuccess: (rang: 'A' | 'B' | 'AB', audioUrl: string) => void;
  onError: (error: Error) => void;
  validateAndNormalizeAudioUrl: (url: string) => string;
}

export const useMusicGenerationOrchestrator = () => {
  const { toast } = useToast();
  const { startPolling, stopPolling, stopAllPolling } = useMusicPolling();
  const activeTasksRef = useRef<Set<string>>(new Set());
  
  const { executeWithRetry, isRetrying, retryCount, abort: abortRetry } = useRetryWithBackoff({
    maxRetries: 2,
    initialDelay: 2000,
    backoffFactor: 1.5,
    shouldRetry: isRetryableError,
    onRetry: (attempt, error) => {
      toast({
        title: `Tentative ${attempt}/2...`,
        description: `Erreur: ${error.message}. Nouvelle tentative en cours.`,
      });
    }
  });

  const startGeneration = useCallback(async ({
    rang,
    translatedLyrics,
    selectedStyle,
    duration,
    currentLanguage,
    itemCode = 'EDN',
    model = 'V4_5ALL',
    onProgress,
    onSuccess,
    onError,
    validateAndNormalizeAudioUrl
  }: GenerationConfig) => {
    try {
      const requestBody = {
        lyrics: translatedLyrics,
        style: selectedStyle,
        rang,
        duration,
        language: currentLanguage,
        fastMode: true,
        itemCode,
        model,
        customMode: true,
        instrumental: false
      };

      // Démarrer la génération avec retry automatique
      const initialData = await executeWithRetry(async () => {
        const { data, error } = await supabase.functions.invoke('generate-music', {
          body: requestBody
        });
        
        if (error) {
          throw new Error(error.message || 'Erreur lors du démarrage de la génération');
        }
        
        return data;
      });

      // Si c'est déjà un succès (peu probable), on termine
      if (initialData?.status === 'success' && initialData?.audioUrl) {
        const validatedAudioUrl = validateAndNormalizeAudioUrl(initialData.audioUrl);
        
        toast({
          title: "Génération réussie",
          description: `Musique générée avec succès pour le Rang ${rang}`,
        });
        
        onSuccess(rang, validatedAudioUrl);
        return validatedAudioUrl;
      }

      // Récupérer le trackId pour le polling
      const taskId = initialData?.trackId;
      if (!taskId) {
        throw new Error('Aucun trackId reçu de l\'API - impossible de suivre la génération');
      }

      // Ajouter aux tâches actives
      activeTasksRef.current.add(taskId);

      // Afficher un message informatif
      toast({
        title: "Génération démarrée",
        description: `Suno AI traite votre demande pour le Rang ${rang}. Cela peut prendre 2-3 minutes...`,
      });

      // Commencer le polling adaptatif
      startPolling({
        taskId,
        rang,
        onProgress,
        onSuccess: (rangPolling, audioUrl) => {
          activeTasksRef.current.delete(taskId);
          const validatedAudioUrl = validateAndNormalizeAudioUrl(audioUrl);
          
          toast({
            title: "🎵 Génération réussie !",
            description: `Musique générée avec succès pour le Rang ${rangPolling}`,
          });
          
          onSuccess(rangPolling, validatedAudioUrl);
        },
        onError: (error) => {
          activeTasksRef.current.delete(taskId);
          let errorMessage = error.message;
          let toastTitle = "Erreur de génération Suno";
          
          // Messages plus informatifs selon le type d'erreur
          if (errorMessage.includes('Timeout')) {
            toastTitle = "⏰ Génération trop longue";
            errorMessage = "L'API Suno est peut-être occupée. Réessayez dans quelques minutes.";
          } else if (errorMessage.includes('réseau') || errorMessage.includes('consécutives')) {
            toastTitle = "🌐 Problème de connexion";
            errorMessage = "Vérifiez votre connexion et réessayez.";
          } else if (errorMessage.includes('429') || errorMessage.includes('rate')) {
            toastTitle = "⏳ Limite de taux";
            errorMessage = "Trop de requêtes. Attendez quelques secondes.";
          }
          
          toast({
            title: toastTitle,
            description: errorMessage,
            variant: "destructive"
          });
          
          onError(error);
        }
      });

      return taskId;
      
    } catch (error) {
      const errorMessage = (error as Error).message || "Impossible de générer la musique. Veuillez réessayer.";
      toast({
        title: "Erreur de génération",
        description: errorMessage,
        variant: "destructive"
      });
      
      onError(error as Error);
    }
  }, [toast, startPolling, executeWithRetry]);

  // Annuler une génération spécifique
  const cancelGeneration = useCallback((taskId: string) => {
    stopPolling(taskId);
    activeTasksRef.current.delete(taskId);
    abortRetry();
  }, [stopPolling, abortRetry]);

  // Annuler toutes les générations
  const cancelAllGenerations = useCallback(() => {
    stopAllPolling();
    activeTasksRef.current.clear();
    abortRetry();
  }, [stopAllPolling, abortRetry]);

  // Obtenir les tâches actives
  const getActiveTasks = useCallback(() => {
    return Array.from(activeTasksRef.current);
  }, []);

  return {
    startGeneration,
    cancelGeneration,
    cancelAllGenerations,
    getActiveTasks,
    isRetrying,
    retryCount
  };
};
