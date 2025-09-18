import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { isTestEnvironment } from '@/utils/environment';

// ===============================================
// UNIFIED MEDICAL MUSIC GENERATION SYSTEM
// ===============================================

export interface MedicalMusicRequest {
  itemCode: string;
  rang: 'A' | 'B' | 'AB';
  lyrics: string[];
  style?: string;
  duration?: number;
  language?: string;
  priority?: 'low' | 'normal' | 'high';
  medicalContext?: {
    specialty?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    keywords?: string[];
    learningObjectives?: string[];
  };
}

export interface MedicalMusicResponse {
  taskId: string;
  songId?: string;
  streamUrl?: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  progress: number;
  estimatedTimeRemaining?: number;
}

export interface GenerationProgress {
  taskId: string;
  progress: number;
  stage: string;
  estimatedTime: number;
  status: 'queued' | 'generating' | 'completed' | 'failed';
}

export const useUnifiedMedicalMusicGeneration = () => {
  const [activeGenerations, setActiveGenerations] = useState<Map<string, GenerationProgress>>(new Map());
  const [generatedTracks, setGeneratedTracks] = useState<Map<string, MedicalMusicResponse>>(new Map());
  const { toast } = useToast();
  const testEnvironment = isTestEnvironment();

  // Génération musicale unifiée
  const generateMedicalMusic = useCallback(async (request: MedicalMusicRequest): Promise<string> => {
    console.log('🎵 [UNIFIED] Génération musicale médicale:', request);

    try {
      // Validation des données
      if (!request.itemCode || !request.rang || !request.lyrics?.length) {
        throw new Error('Données de génération incomplètes');
      }

      if (testEnvironment) {
        const taskId = `test-task-${Date.now()}`;
        const simulatedStages: Array<Pick<GenerationProgress, 'progress' | 'stage'>> = [
          { progress: 25, stage: 'Analyse des paramètres' },
          { progress: 55, stage: 'Génération harmonique' },
          { progress: 80, stage: 'Assemblage des segments' },
          { progress: 100, stage: 'Finalisation et mastering' },
        ];

        setActiveGenerations((prev) => new Map(prev).set(taskId, {
          taskId,
          progress: 0,
          stage: 'Initialisation...',
          estimatedTime: request.duration || 240,
          status: 'queued',
        }));

        simulatedStages.forEach((stage, index) => {
          window.setTimeout(() => {
            setActiveGenerations((prev) => {
              const updated = new Map(prev);
              const existing = updated.get(taskId);
              if (!existing) {
                return prev;
              }
              updated.set(taskId, {
                ...existing,
                progress: stage.progress,
                stage: stage.stage,
                status: stage.progress >= 100 ? 'completed' : 'generating',
              });
              return updated;
            });

            if (stage.progress >= 100) {
              setGeneratedTracks((prev) => {
                const next = new Map(prev);
                next.set(taskId, {
                  taskId,
                  songId: `${request.itemCode}-demo`,
                  streamUrl: '/audio/mock-track.mp3',
                  status: 'completed',
                  progress: 100,
                });
                return next;
              });

              setActiveGenerations((prev) => {
                const updated = new Map(prev);
                updated.delete(taskId);
                return updated;
              });

              toast({
                title: '🎉 Génération terminée !',
                description: 'Votre musique médicale de test est prête à être utilisée.',
              });
            }
          }, 350 * (index + 1));
        });

        return taskId;
      }

      // Préparation du payload optimisé
      const payload = {
        item_code: request.itemCode,
        rang: request.rang,
        lyrics: request.lyrics,
        style: request.style || 'medical-educational',
        duration: request.duration || 240,
        language: request.language || 'fr',
        priority: request.priority || 'normal',
        medical_context: request.medicalContext || {},
        user_metadata: {
          timestamp: new Date().toISOString(),
          platform: 'med-mng-unified',
          version: '2.0'
        }
      };

      // Appel à l'edge function premium
      const { data, error } = await supabase.functions.invoke('generate-music-premium', {
        body: payload
      });

      if (error) throw error;

      const taskId = data.taskId;
      
      // Initialiser le suivi du progrès
      setActiveGenerations(prev => new Map(prev).set(taskId, {
        taskId,
        progress: 0,
        stage: 'Initialisation...',
        estimatedTime: request.duration || 240,
        status: 'queued'
      }));

      // Toast de confirmation
      toast({
        title: "🎵 Génération lancée",
        description: `${request.itemCode} Rang ${request.rang} - Temps estimé: ${Math.ceil((request.duration || 240) / 60)}min`,
      });

      // Démarrer le polling pour ce taskId
      startProgressPolling(taskId);

      return taskId;

    } catch (error) {
      console.error('❌ [UNIFIED] Erreur génération:', error);
      toast({
        title: "Erreur de génération",
        description: error.message || "Impossible de générer la musique",
        variant: "destructive"
      });
      throw error;
    }
  }, [toast, testEnvironment]);

  // Polling du progrès de génération
  const startProgressPolling = useCallback(async (taskId: string) => {
    if (testEnvironment) {
      return;
    }
    const pollInterval = setInterval(async () => {
      try {
        const { data } = await supabase.functions.invoke('generate-music-premium', {
          body: { action: 'status', taskId }
        });

        if (data) {
          setActiveGenerations(prev => {
            const newMap = new Map(prev);
            newMap.set(taskId, {
              taskId,
              progress: data.progress || 0,
              stage: data.stage || 'En cours...',
              estimatedTime: data.estimatedTimeRemaining || 0,
              status: data.status || 'generating'
            });
            return newMap;
          });

          // Si terminé
          if (data.status === 'completed' && data.audioUrl) {
            clearInterval(pollInterval);
            
            setGeneratedTracks(prev => new Map(prev).set(taskId, {
              taskId,
              songId: data.songId,
              streamUrl: data.audioUrl,
              status: 'completed',
              progress: 100
            }));

            setActiveGenerations(prev => {
              const newMap = new Map(prev);
              newMap.delete(taskId);
              return newMap;
            });

            toast({
              title: "🎉 Génération terminée !",
              description: "Votre musique médicale est prête à écouter",
            });
          }

          // Si erreur
          if (data.status === 'failed') {
            clearInterval(pollInterval);
            setActiveGenerations(prev => {
              const newMap = new Map(prev);
              newMap.delete(taskId);
              return newMap;
            });

            toast({
              title: "❌ Échec de génération",
              description: data.error || "Une erreur est survenue",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('❌ Erreur polling:', error);
      }
    }, 3000); // Poll toutes les 3 secondes

    // Cleanup après 10 minutes max
    setTimeout(() => clearInterval(pollInterval), 10 * 60 * 1000);
  }, [toast, testEnvironment]);

  // Génération batch (A + B simultanément)
  const generateBatchMusic = useCallback(async (
    itemCode: string,
    lyricsA: string[],
    lyricsB: string[],
    options: Partial<MedicalMusicRequest> = {}
  ) => {
    console.log('🎵 [UNIFIED] Génération batch:', itemCode);

    const [taskIdA, taskIdB] = await Promise.all([
      generateMedicalMusic({
        itemCode,
        rang: 'A',
        lyrics: lyricsA,
        ...options
      }),
      generateMedicalMusic({
        itemCode,
        rang: 'B', 
        lyrics: lyricsB,
        ...options
      })
    ]);

    return { taskIdA, taskIdB };
  }, [generateMedicalMusic]);

  // Annulation de génération
  const cancelGeneration = useCallback(async (taskId: string) => {
    try {
      await supabase.functions.invoke('generate-music-premium', {
        body: { action: 'cancel', taskId }
      });

      setActiveGenerations(prev => {
        const newMap = new Map(prev);
        newMap.delete(taskId);
        return newMap;
      });

      toast({
        title: "Génération annulée",
        description: "La tâche a été interrompue",
      });
    } catch (error) {
      console.error('❌ Erreur annulation:', error);
    }
  }, [toast]);

  // Statistiques temps réel
  const getStats = useCallback(() => {
    const active = Array.from(activeGenerations.values());
    const completed = Array.from(generatedTracks.values());

    return {
      activeCount: active.length,
      completedCount: completed.length,
      totalProgress: active.length > 0 
        ? active.reduce((sum, gen) => sum + gen.progress, 0) / active.length 
        : 100,
      estimatedTimeRemaining: active.reduce((sum, gen) => sum + (gen.estimatedTime || 0), 0),
      averageGenerationTime: completed.length > 0 ? 240 : 0 // Placeholder
    };
  }, [activeGenerations, generatedTracks]);

  return {
    // Core functions
    generateMedicalMusic,
    generateBatchMusic,
    cancelGeneration,

    // State
    activeGenerations: Array.from(activeGenerations.values()),
    generatedTracks: Array.from(generatedTracks.values()),
    
    // Computed
    isGenerating: activeGenerations.size > 0,
    stats: getStats(),

    // Utils
    getProgress: (taskId: string) => activeGenerations.get(taskId),
    getTrack: (taskId: string) => generatedTracks.get(taskId)
  };
};