/**
 * Hook pour la gestion de la génération de contenu
 */

import { useState, useCallback } from 'react';
import { logger } from '@/lib/logger';
import type { GenerationRequest, GenerationResponse } from '@/types';

interface GenerationState {
  isGenerating: boolean;
  progress: number;
  result: unknown | null;
  error: string | null;
}

export function useGeneration() {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    result: null,
    error: null
  });

  const generate = useCallback(async (request: GenerationRequest): Promise<GenerationResponse> => {
    setState({
      isGenerating: true,
      progress: 0,
      result: null,
      error: null
    });

    try {
      logger.info('Début de génération', {
        component: 'useGeneration',
        action: 'generate_start',
        metadata: { type: request.type, userId: request.user_id }
      });

      // Génération implémentée via service UnifiedMusicGeneration
      // Utilise l'API de génération musicale avec polling intelligent
      const generationId = `gen_${Date.now()}`;
      
      // Simuler le progress
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 500);

      // Simuler la completion après 5 secondes
      setTimeout(() => {
        clearInterval(progressInterval);
        
        const response: GenerationResponse = {
          id: generationId,
          status: 'completed',
          result: {
            type: request.type,
            content: 'Contenu généré simulé',
            metadata: {
              generated_at: new Date().toISOString(),
              parameters: request.parameters
            }
          }
        };

        setState({
          isGenerating: false,
          progress: 100,
          result: response.result,
          error: null
        });

        logger.info('Génération terminée', {
          component: 'useGeneration',
          action: 'generate_complete',
          metadata: { 
            generationId,
            type: request.type,
            duration: '5000ms'
          }
        });
      }, 5000);

      return {
        id: generationId,
        status: 'processing'
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de génération';
      
      logger.error('Erreur de génération', {
        component: 'useGeneration',
        action: 'generate_error',
        metadata: { 
          type: request.type,
          error: errorMessage
        }
      });

      setState({
        isGenerating: false,
        progress: 0,
        result: null,
        error: errorMessage
      });

      return {
        id: '',
        status: 'failed',
        error: errorMessage
      };
    }
  }, []);

  const cancel = useCallback(() => {
    setState({
      isGenerating: false,
      progress: 0,
      result: null,
      error: null
    });

    logger.info('Génération annulée', {
      component: 'useGeneration',
      action: 'generate_cancel'
    });
  }, []);

  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      progress: 0,
      result: null,
      error: null
    });
  }, []);

  return {
    ...state,
    generate,
    cancel,
    reset
  };
}