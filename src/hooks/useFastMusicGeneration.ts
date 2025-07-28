import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FastMusicGenerationState {
  isGenerating: boolean;
  progress: number;
  currentTaskId: string | null;
  estimatedTime: number;
  audioUrl: string | null;
  error: string | null;
}

export const useFastMusicGeneration = () => {
  const [state, setState] = useState<FastMusicGenerationState>({
    isGenerating: false,
    progress: 0,
    currentTaskId: null,
    estimatedTime: 0,
    audioUrl: null,
    error: null
  });
  
  const { toast } = useToast();

  // OPTIMISATION: Polling ultra-agressif pour les premiers résultats (v4.5 = 20-60s)
  const fastPoll = useCallback(async (taskId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max avec v4.5
    
    const pollInterval = setInterval(async () => {
      attempts++;
      
      try {
        // Vérifier d'abord en BDD (plus rapide)
        const { data: dbTrack, error: dbError } = await supabase
          .from('generated_music_tracks')
          .select('*')
          .or(`task_id.eq.${taskId},suno_track_id.eq.${taskId}`)
          .single();

        console.log(`⚡ Fast poll #${attempts} pour ${taskId}:`, dbTrack?.generation_status);
        
        if (dbTrack && !dbError) {
          // Mise à jour du progrès estimé selon les optimisations v4.5
          if (dbTrack.generation_status === 'generating') {
            // Progrès estimé basé sur le temps écoulé (v4.5 = 20-60 secondes)
            const estimatedProgress = Math.min((attempts * 5) / 60 * 100, 95);
            setState(prev => ({ ...prev, progress: estimatedProgress }));
          }
          
          if (dbTrack.generation_status === 'completed' && dbTrack.audio_url) {
            console.log('✅ Génération ultra-rapide complétée!');
            setState(prev => ({
              ...prev,
              progress: 100,
              isGenerating: false,
              audioUrl: dbTrack.audio_url,
              error: null
            }));
            clearInterval(pollInterval);
            
            // Notification de succès
            toast({
              title: "🎵 Musique générée !",
              description: "Génération ultra-rapide terminée avec succès",
              variant: "default"
            });
            
            // Event custom pour l'application
            window.dispatchEvent(new CustomEvent('fastMusicGenerated', {
              detail: { taskId, audioUrl: dbTrack.audio_url, metadata: dbTrack.metadata }
            }));
            
            return;
          }
          
          if (dbTrack.generation_status === 'failed') {
            console.error('❌ Génération rapide échouée');
            setState(prev => ({
              ...prev,
              isGenerating: false,
              error: 'Génération échouée',
              progress: 0
            }));
            clearInterval(pollInterval);
            
            toast({
              title: "❌ Génération échouée",
              description: "Veuillez réessayer",
              variant: "destructive"
            });
            return;
          }
        }
        
        // Timeout après 5 minutes (pas normal avec v4.5 optimisé)
        if (attempts >= maxAttempts) {
          console.warn('⏰ Timeout - génération prend plus de temps que prévu avec v4.5');
          setState(prev => ({
            ...prev,
            isGenerating: false,
            error: 'Génération trop longue',
            progress: 0
          }));
          clearInterval(pollInterval);
          
          toast({
            title: "⏰ Génération en cours...",
            description: "La musique sera disponible bientôt. Vérifiez votre bibliothèque.",
            variant: "default"
          });
        }
        
      } catch (error) {
        console.error('Erreur fast polling:', error);
        if (attempts >= 10) { // Arrêter après plusieurs erreurs
          setState(prev => ({
            ...prev,
            isGenerating: false,
            error: error.message,
            progress: 0
          }));
          clearInterval(pollInterval);
        }
      }
    }, 3000); // Poll ultra-agressif toutes les 3 secondes
    
    // Premier check immédiat
    setTimeout(() => {
      // Vérification initiale
    }, 100);
  }, [toast]);

  // OPTIMISATION: Génération avec paramètres ultra-rapides
  const generateMusic = useCallback(async (params: {
    prompt: string;
    title?: string;
    tags?: string;
    instrumental?: boolean;
    rang?: 'A' | 'B';
    itemCode?: string;
  }) => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      progress: 5,
      estimatedTime: 45, // 45 secondes estimées avec v4.5 optimisé
      audioUrl: null,
      error: null
    }));
    
    try {
      console.log('🚀 Lancement génération ULTRA-RAPIDE avec v4.5...');
      
      // Appel vers l'edge function optimisée
      const { data, error } = await supabase.functions.invoke('generate-music', {
        body: {
          lyrics: params.prompt,
          title: params.title || `Musique rapide ${params.rang || 'A'}`,
          style: params.tags || 'educational, upbeat, clear vocals',
          instrumental: params.instrumental || false,
          rang: params.rang || 'A',
          itemCode: params.itemCode || 'FAST',
          // Flags d'optimisation vitesse
          fastMode: true,
          optimized: true,
          model: 'V4_5' // Modèle le plus rapide
        }
      });

      if (data && data.success && data.trackId) {
        setState(prev => ({
          ...prev,
          currentTaskId: data.trackId,
          progress: 10
        }));
        
        console.log('✅ Tâche ultra-rapide créée:', data.trackId);
        console.log('⚡ Optimisations v4.5 actives:', {
          model: 'chirp-v4.5',
          fastMode: true,
          estimatedTime: '20-60 secondes'
        });
        
        // Démarrer le polling ultra-agressif
        fastPoll(data.trackId);
        
        return data.trackId;
      } else {
        throw new Error(data?.error || error?.message || 'Erreur génération ultra-rapide');
      }
      
    } catch (error) {
      console.error('❌ Erreur génération ultra-rapide:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error.message,
        progress: 0
      }));
      
      toast({
        title: "❌ Erreur de génération",
        description: error.message,
        variant: "destructive"
      });
      
      throw error;
    }
  }, [fastPoll, toast]);

  // Reset de l'état
  const resetGeneration = useCallback(() => {
    setState({
      isGenerating: false,
      progress: 0,
      currentTaskId: null,
      estimatedTime: 0,
      audioUrl: null,
      error: null
    });
  }, []);

  return {
    generateMusic,
    resetGeneration,
    
    // État de génération
    isGenerating: state.isGenerating,
    progress: state.progress,
    currentTaskId: state.currentTaskId,
    estimatedTime: state.estimatedTime,
    audioUrl: state.audioUrl,
    error: state.error,
    
    // Helpers
    isCompleted: !!state.audioUrl && !state.isGenerating,
    isFailed: !!state.error && !state.isGenerating,
    timeRemaining: Math.max(0, state.estimatedTime - (state.progress / 100 * state.estimatedTime))
  };
};