/**
 * Service pour la génération de contenu
 */

import { logger } from '@/lib/logger';
import { apiService } from '../core/ApiService';
import type { ApiResponse } from '@/types';

export interface ExtendedGenerationRequest {
  type: 'music' | 'lyrics' | 'quiz' | 'content';
  prompt: string;
  parameters: Record<string, unknown>;
  user_id: string;
  item_code?: string;
  rang?: 'A' | 'B';
  lyrics?: string[];
  style?: string;
  duration?: number;
  fast_mode?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

export interface ExtendedGenerationResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
  progress?: number;
  estimated_time?: number;
}

class GenerationService {
  private pollingIntervals = new Map<string, NodeJS.Timeout>();

  async startGeneration(request: ExtendedGenerationRequest): Promise<ApiResponse<ExtendedGenerationResponse>> {
    try {
      logger.info('Démarrage génération', {
        component: 'GenerationService',
        action: 'start_generation',
        metadata: { 
          type: request.type,
          userId: request.user_id
        }
      });

      const response = await apiService.post<ExtendedGenerationResponse>('/api/generation/start', request);
      
      if (response.success && response.data) {
        // Démarrer le polling automatique pour suivre le statut
        this.startPolling(response.data.id);
      }

      return response;
    } catch (error) {
      logger.error('Erreur démarrage génération', {
        component: 'GenerationService',
        action: 'start_generation',
        metadata: { 
          error,
          type: request.type,
          userId: request.user_id
        }
      });
      throw error;
    }
  }

  async getGenerationStatus(generationId: string): Promise<ApiResponse<ExtendedGenerationResponse>> {
    try {
      return await apiService.get<ExtendedGenerationResponse>(`/api/generation/${generationId}/status`);
    } catch (error) {
      logger.error('Erreur récupération statut génération', {
        component: 'GenerationService',
        action: 'get_status',
        metadata: { error, generationId }
      });
      throw error;
    }
  }

  async cancelGeneration(generationId: string): Promise<ApiResponse<void>> {
    try {
      logger.info('Annulation génération', {
        component: 'GenerationService',
        action: 'cancel_generation',
        metadata: { generationId }
      });

      // Arrêter le polling
      this.stopPolling(generationId);

      return await apiService.post<void>(`/api/generation/${generationId}/cancel`);
    } catch (error) {
      logger.error('Erreur annulation génération', {
        component: 'GenerationService',
        action: 'cancel_generation',
        metadata: { error, generationId }
      });
      throw error;
    }
  }

  async getGenerationHistory(userId: string, limit = 20): Promise<ApiResponse<ExtendedGenerationResponse[]>> {
    try {
      return await apiService.getPaginated<ExtendedGenerationResponse>('/api/generation/history', {
        user_id: userId,
        limit
      });
    } catch (error) {
      logger.error('Erreur récupération historique', {
        component: 'GenerationService',
        action: 'get_history',
        metadata: { error, userId }
      });
      throw error;
    }
  }

  private startPolling(generationId: string, interval = 2000): void {
    // Éviter les doublons
    if (this.pollingIntervals.has(generationId)) {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await this.getGenerationStatus(generationId);
        
        if (response.success && response.data) {
          const status = response.data.status;
          
          // Arrêter le polling si terminé
          if (status === 'completed' || status === 'failed') {
            this.stopPolling(generationId);
            
            logger.info('Génération terminée', {
              component: 'GenerationService',
              action: 'polling_complete',
              metadata: { generationId, status }
            });
          }
        }
      } catch (error) {
        logger.error('Erreur polling génération', {
          component: 'GenerationService',
          action: 'polling_error',
          metadata: { error, generationId }
        });
        
        // Arrêter le polling en cas d'erreur persistante
        this.stopPolling(generationId);
      }
    }, interval);

    this.pollingIntervals.set(generationId, pollInterval);
    
    logger.debug('Polling démarré', {
      component: 'GenerationService',
      action: 'start_polling',
      metadata: { generationId, interval }
    });
  }

  private stopPolling(generationId: string): void {
    const interval = this.pollingIntervals.get(generationId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(generationId);
      
      logger.debug('Polling arrêté', {
        component: 'GenerationService',
        action: 'stop_polling',
        metadata: { generationId }
      });
    }
  }

  // Nettoyer tous les polling en cours
  cleanup(): void {
    for (const [generationId, interval] of this.pollingIntervals) {
      clearInterval(interval);
      logger.debug('Nettoyage polling', {
        component: 'GenerationService',
        action: 'cleanup',
        metadata: { generationId }
      });
    }
    this.pollingIntervals.clear();
  }
}

export const generationService = new GenerationService();