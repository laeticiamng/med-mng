/**
 * Orchestrateur de génération musicale
 * Gère le cycle complet: démarrage, polling, succès/erreur
 * ✅ Enrichi: Meilleure gestion des états, logging, persistance locale
 */

import { useToast } from '@/hooks/use-toast';
import { isRetryableError, useRetryWithBackoff } from '@/hooks/useRetryWithBackoff';
import { supabase } from '@/integrations/supabase/client';
import { useCallback, useRef, useState } from 'react';
import { useMusicPolling } from './useMusicPolling';

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

interface GenerationTask {
  taskId: string;
  rang: 'A' | 'B' | 'AB';
  startTime: number;
  status: 'pending' | 'generating' | 'completed' | 'failed' | 'cancelled';
}

// ✅ Stockage local pour persistance des tâches
const ACTIVE_TASKS_KEY = 'mng_active_generation_tasks';

const saveActiveTasksToStorage = (tasks: Map<string, GenerationTask>) => {
  try {
    const data = Array.from(tasks.entries());
    localStorage.setItem(ACTIVE_TASKS_KEY, JSON.stringify(data));
  } catch {}
};

const loadActiveTasksFromStorage = (): Map<string, GenerationTask> => {
  try {
    const data = localStorage.getItem(ACTIVE_TASKS_KEY);
    if (data) {
      const entries = JSON.parse(data);
      // Filtrer les tâches de plus de 10 minutes (expirées)
      const validEntries = entries.filter(([_, task]: [string, GenerationTask]) => 
        Date.now() - task.startTime < 10 * 60 * 1000
      );
      return new Map(validEntries);
    }
  } catch {}
  return new Map();
};

export const useMusicGenerationOrchestrator = () => {
  const { toast } = useToast();
  const { startPolling, stopPolling, stopAllPolling, _isPolling, _getActivePollingTasks } = useMusicPolling();
  const activeTasksRef = useRef<Map<string, GenerationTask>>(loadActiveTasksFromStorage());
  
  // ✅ État observable pour l'UI
  const [generatingRangs, setGeneratingRangs] = useState<Set<'A' | 'B' | 'AB'>>(new Set());
  
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

  // ✅ Ajouter une tâche active
  const addActiveTask = useCallback((taskId: string, rang: 'A' | 'B' | 'AB') => {
    const task: GenerationTask = {
      taskId,
      rang,
      startTime: Date.now(),
      status: 'generating'
    };
    activeTasksRef.current.set(taskId, task);
    saveActiveTasksToStorage(activeTasksRef.current);
    setGeneratingRangs(prev => new Set([...prev, rang]));
  }, []);

  // ✅ Supprimer une tâche active
  const removeActiveTask = useCallback((taskId: string) => {
    const task = activeTasksRef.current.get(taskId);
    if (task) {
      activeTasksRef.current.delete(taskId);
      saveActiveTasksToStorage(activeTasksRef.current);
      setGeneratingRangs(prev => {
        const next = new Set(prev);
        next.delete(task.rang);
        return next;
      });
    }
  }, []);

  // ✅ Vérifier si un rang est en cours de génération
  const isRangGenerating = useCallback((rang: 'A' | 'B' | 'AB'): boolean => {
    return generatingRangs.has(rang);
  }, [generatingRangs]);

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
    // ✅ Vérifier si déjà en cours
    if (isRangGenerating(rang)) {
      toast({
        title: "Génération en cours",
        description: `Une génération pour le Rang ${rang} est déjà en cours.`,
        variant: "default"
      });
      return null;
    }

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

      console.log(`[Orchestrator] Démarrage génération Rang ${rang}`, { itemCode, model, style: selectedStyle });

      // Démarrer la génération avec retry automatique
      const initialData = await executeWithRetry(async () => {
        const { _data, error } = await supabase.functions.invoke('generate-music', {
          body: requestBody
        });
        
        if (error) {
          console.error(`[Orchestrator] Erreur API:`, error);
          throw new Error(error.message || 'Erreur lors du démarrage de la génération');
        }
        
        return _data;
      });

      // Si c'est déjà un succès (peu probable), on termine
      if (initialData?.status === 'success' && initialData?.audioUrl) {
        const validatedAudioUrl = validateAndNormalizeAudioUrl(initialData.audioUrl);
        
        toast({
          title: "🎵 Génération réussie !",
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

      // ✅ Ajouter aux tâches actives avec persistance
      addActiveTask(taskId, rang);

      // Afficher un message informatif
      toast({
        title: "🎵 Génération démarrée",
        description: `Suno AI traite votre demande pour le Rang ${rang}. Cela peut prendre 2-3 minutes...`,
      });

      // Commencer le polling adaptatif
      startPolling({
        taskId,
        rang,
        onProgress,
        onSuccess: (rangPolling, audioUrl) => {
          removeActiveTask(taskId);
          const validatedAudioUrl = validateAndNormalizeAudioUrl(audioUrl);
          
          toast({
            title: "🎵 Génération réussie !",
            description: `Musique générée avec succès pour le Rang ${rangPolling}`,
          });
          
          onSuccess(rangPolling, validatedAudioUrl);
        },
        onError: (error) => {
          removeActiveTask(taskId);
          let errorMessage = error.message;
          let toastTitle = "Erreur de génération Suno";
          
          // Messages plus informatifs selon le type d'erreur
          if (errorMessage.includes('Timeout') || errorMessage.includes('timeout')) {
            toastTitle = "⏰ Génération trop longue";
            errorMessage = "L'API Suno est peut-être occupée. Réessayez dans quelques minutes.";
          } else if (errorMessage.includes('réseau') || errorMessage.includes('consécutives') || errorMessage.includes('network')) {
            toastTitle = "🌐 Problème de connexion";
            errorMessage = "Vérifiez votre connexion et réessayez.";
          } else if (errorMessage.includes('429') || errorMessage.includes('rate')) {
            toastTitle = "⏳ Limite de taux";
            errorMessage = "Trop de requêtes. Attendez quelques secondes.";
          } else if (errorMessage.includes('annulée') || errorMessage.includes('cancelled')) {
            toastTitle = "🚫 Génération annulée";
            errorMessage = "La génération a été annulée.";
          } else if (errorMessage.includes('crédits') || errorMessage.includes('credits')) {
            toastTitle = "💳 Crédits insuffisants";
            errorMessage = "Vos crédits Suno sont épuisés.";
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
      console.error(`[Orchestrator] Erreur génération:`, error);
      
      toast({
        title: "Erreur de génération",
        description: errorMessage,
        variant: "destructive"
      });
      
      onError(error as Error);
      return null;
    }
  }, [toast, startPolling, executeWithRetry, isRangGenerating, addActiveTask, removeActiveTask]);

  // Annuler une génération spécifique
  const cancelGeneration = useCallback((taskId: string) => {
    console.log(`[Orchestrator] Annulation génération: ${taskId}`);
    stopPolling(taskId);
    removeActiveTask(taskId);
    abortRetry();
  }, [stopPolling, removeActiveTask, abortRetry]);

  // Annuler toutes les générations
  const cancelAllGenerations = useCallback(() => {
    console.log(`[Orchestrator] Annulation de toutes les générations`);
    stopAllPolling();
    activeTasksRef.current.clear();
    saveActiveTasksToStorage(activeTasksRef.current);
    setGeneratingRangs(new Set());
    abortRetry();
  }, [stopAllPolling, abortRetry]);

  // Obtenir les tâches actives
  const getActiveTasks = useCallback(() => {
    return Array.from(activeTasksRef.current.values());
  }, []);

  // ✅ Obtenir une tâche par rang
  const getTaskByRang = useCallback((rang: 'A' | 'B' | 'AB'): GenerationTask | undefined => {
    return Array.from(activeTasksRef.current.values()).find(task => task.rang === rang);
  }, []);

  return {
    startGeneration,
    cancelGeneration,
    cancelAllGenerations,
    getActiveTasks,
    getTaskByRang,
    isRangGenerating,
    isRetrying,
    retryCount,
    generatingRangs: Array.from(generatingRangs)
  };
};
