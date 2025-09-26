// ==========================================
// MED-MNG ADVANCED MUSIC GENERATION - Hook avancé avec IA
// ==========================================

import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { errorService } from '@/services/core/ErrorService';
import { supabase } from '@/integrations/supabase/client';
import { generateOptimizedLyrics, generateRangAB } from '@/utils/lyrics/generateOptimizedLyrics';
import type { MusicTrack, GenerationRequest } from '@/types';

interface AdvancedGenerationConfig {
  itemCode: string;
  useAI: boolean;
  voiceGeneration: boolean;
  imageGeneration: boolean;
  preferredModel: 'gpt-5' | 'gpt-4.1' | 'o3';
  qualityLevel: 'high' | 'medium' | 'fast';
}

export const useAdvancedMusicGeneration = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Génération complète avec IA avancée
  const generateAdvancedMusic = useCallback(async (
    config: AdvancedGenerationConfig,
    rang: 'A' | 'B' | 'AB',
    style: string = 'clinical-hip-hop'
  ): Promise<MusicTrack | null> => {
    setIsGenerating(true);
    setProgress(0);
    setCurrentStage('Initialisation IA...');

    // Annuler génération précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // Étape 1: Génération des paroles IA optimisées
      setCurrentStage('Génération paroles IA...');
      setProgress(20);
      
      let lyrics: string[];
      if (rang === 'AB') {
        lyrics = await generateRangAB(config.itemCode);
      } else {
        lyrics = await generateOptimizedLyrics(config.itemCode, rang);
      }

      console.log(`✅ ${lyrics.length} paroles générées par IA`);

      // Étape 2: Amélioration des paroles avec modèle avancé
      if (config.useAI) {
        setCurrentStage('Amélioration IA avancée...');
        setProgress(40);
        
        lyrics = await enhanceLyricsWithAI(lyrics, config);
      }

      // Étape 3: Génération musicale
      setCurrentStage('Génération musicale...');
      setProgress(60);

      const generationRequest: GenerationRequest = {
        type: 'music',
        prompt: `Génération musicale pour ${config.itemCode} - Rang ${rang}`,
        parameters: {
          item_code: config.itemCode,
          rang,
          style,
          duration: 240,
          lyrics,
          language: 'fr',
          fast_mode: config.qualityLevel === 'fast',
          priority: config.qualityLevel === 'high' ? 'high' : 'normal'
        },
        user_id: 'current-user'
      };

      const { data, error } = await supabase.functions.invoke('generate-music-v2', {
        body: generationRequest
      });

      if (error) throw error;

      const taskId = data.task_id;
      
      // Étape 4: Polling avec progress avancé
      setCurrentStage('Traitement audio...');
      setProgress(80);

      const track = await pollGenerationWithEnhancement(taskId, config);

      // Étape 5: Post-processing optionnel
      if (config.voiceGeneration || config.imageGeneration) {
        setCurrentStage('Génération contenu additionnel...');
        setProgress(90);
        
        await addMultimediaContent(track, config);
      }

      setProgress(100);
      setCurrentStage('Terminé !');

      toast({
        title: `🎉 Génération ${rang} réussie !`,
        description: `${config.itemCode} - Musique IA avancée créée`,
      });

      return track;

    } catch (error) {
      errorService.handleError(error as Error, 'user_action', true);
      
      toast({
        title: "Erreur génération avancée",
        description: error.message,
        variant: "destructive"
      });

      return null;
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setCurrentStage('');
    }
  }, [toast]);

  // Amélioration des paroles avec IA
  const enhanceLyricsWithAI = async (
    lyrics: string[], 
    config: AdvancedGenerationConfig
  ): Promise<string[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('enhance-lyrics-ai', {
        body: {
          lyrics,
          itemCode: config.itemCode,
          model: config.preferredModel,
          quality: config.qualityLevel
        }
      });

      if (error) throw error;
      
      return data.enhancedLyrics || lyrics;
    } catch (error) {
      console.warn('⚠️ Amélioration IA échouée, utilisation paroles originales');
      return lyrics;
    }
  };

  // Polling avec amélioration
  const pollGenerationWithEnhancement = async (
    taskId: string,
    config: AdvancedGenerationConfig
  ): Promise<MusicTrack> => {
    return new Promise((resolve, reject) => {
      const maxAttempts = 60; // 5 minutes max
      let attempts = 0;

      const poll = async () => {
        try {
          attempts++;
          
          if (attempts > maxAttempts) {
            reject(new Error('Timeout de génération'));
            return;
          }

          const { data, error } = await supabase.functions.invoke('get-generation-status', {
            method: 'POST',
            body: { task_id: taskId }
          });

          if (error) throw error;

          const progressValue = 80 + (data.progress || 0) * 0.1;
          setProgress(progressValue);

          if (data.status === 'completed' && data.track) {
            resolve(data.track);
            return;
          }

          if (data.status === 'failed') {
            reject(new Error(data.error_message || 'Génération échouée'));
            return;
          }

          // Continue polling
          setTimeout(poll, 5000);
          
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  };

  // Ajout de contenu multimédia
  const addMultimediaContent = async (
    track: MusicTrack,
    config: AdvancedGenerationConfig
  ): Promise<void> => {
    try {
      const promises = [];

      // Génération de voix si demandée
      if (config.voiceGeneration) {
        promises.push(generateVoiceNarration(track, config));
      }

      // Génération d'image si demandée
      if (config.imageGeneration) {
        promises.push(generateTrackImage(track, config));
      }

      await Promise.all(promises);
      
    } catch (error) {
      console.warn('⚠️ Génération contenu additionnel échouée:', error);
    }
  };

  // Génération de narration vocale
  const generateVoiceNarration = async (
    track: MusicTrack,
    config: AdvancedGenerationConfig
  ): Promise<void> => {
    try {
      const narrationText = `Apprentissage médical: ${track.metadata?.item_code}. 
        Cette composition musicale vous accompagne dans l'étude de ce concept médical important.`;

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: {
          text: narrationText,
          voice: 'alloy' // Voix OpenAI
        }
      });

      if (error) throw error;

      // Sauvegarder l'URL de la narration dans les métadonnées
      await supabase
        .from('generated_music_tracks')
        .update({
          metadata: {
            ...track.metadata,
            narration_url: data.audioUrl
          }
        })
        .eq('id', track.id);

    } catch (error) {
      console.error('❌ Erreur génération voix:', error);
    }
  };

  // Génération d'image pour le track
  const generateTrackImage = async (
    track: MusicTrack,
    config: AdvancedGenerationConfig
  ): Promise<void> => {
    try {
      const imagePrompt = `Medical education illustration for ${track.metadata?.item_code}: 
        Professional, modern medical learning environment with musical elements, 
        soft lighting, educational atmosphere, high quality medical illustration style`;

      const { data, error } = await supabase.functions.invoke('generate-image-openai', {
        body: {
          prompt: imagePrompt,
          model: 'gpt-image-1',
          size: '1024x1024',
          quality: config.qualityLevel === 'high' ? 'high' : 'medium'
        }
      });

      if (error) throw error;

      // Sauvegarder l'URL de l'image dans les métadonnées
      await supabase
        .from('generated_music_tracks')
        .update({
          metadata: {
            ...track.metadata,
            cover_image_url: data.imageUrl
          }
        })
        .eq('id', track.id);

    } catch (error) {
      console.error('❌ Erreur génération image:', error);
    }
  };

  // Annulation de génération
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setIsGenerating(false);
    setProgress(0);
    setCurrentStage('');

    toast({
      title: "Génération annulée",
      description: "La génération avancée a été interrompue"
    });
  }, [toast]);

  return {
    isGenerating,
    progress,
    currentStage,
    generateAdvancedMusic,
    cancelGeneration
  };
};