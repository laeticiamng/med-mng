// ============================================================================
// CONTROLLER: EDN - Orchestration UI ↔ Services ↔ Core
// ============================================================================

import { EdnService } from '@/services/EdnService';
import { AnalyticsService } from '@/services/AnalyticsService';
import { EDNItemDTO, UserProgressDTO, APIResponse, EdnOperationResult } from '../types/temp-types';

export class EdnController {
  private ednService: EdnService;
  
  constructor() {
    this.ednService = new EdnService(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY!
    );
  }

  // ============================================================================
  // ACTIONS PUBLIQUES (utilisées par les hooks/components)
  // ============================================================================

  /**
   * Récupère tous les items EDN avec filtres
   */
  async getItems(filters?: {
    category?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<EdnOperationResult> {
    try {
      const response = await this.ednService.getItems(filters);
      
      // Track analytics
      AnalyticsService.trackFeatureUsage('edn', 'items_viewed', {
        filters,
        resultCount: response.data?.length || 0
      });
      
      return {
        success: response.success,
        data: response.data,
        totalItems: response.data?.length || 0,
        error: response.error
      };
    } catch (error) {
      console.error('EdnController.getItems error:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ITEMS_ERROR',
          message: 'Impossible de charger les items EDN'
        }
      };
    }
  }

  /**
   * Récupère un item EDN spécifique
   */
  async getItem(itemId: string): Promise<APIResponse<EDNItemDTO>> {
    try {
      const response = await this.ednService.getItem(itemId);
      
      if (response.success && response.data) {
        // Track item access
        AnalyticsService.trackFeatureUsage('edn', 'item_accessed', {
          itemId,
          category: response.data.category
        });
      }
      
      return response;
    } catch (error) {
      console.error('EdnController.getItem error:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ITEM_ERROR',
          message: 'Impossible de charger l\'item EDN'
        }
      };
    }
  }

  /**
   * Récupère la progression utilisateur
   */
  async getUserProgress(userId: string): Promise<APIResponse<UserProgressDTO[]>> {
    try {
      const response = await this.ednService.getUserProgress(userId);
      return response;
    } catch (error) {
      console.error('EdnController.getUserProgress error:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_PROGRESS_ERROR',
          message: 'Impossible de charger la progression'
        }
      };
    }
  }

  /**
   * Démarre l'étude d'un item
   */
  async startStudySession(userId: string, itemId: string): Promise<APIResponse<{ sessionId: string }>> {
    try {
      // 1. Créer session d'étude
      const sessionResponse = await this.ednService.createStudySession({
        userId,
        itemIds: [itemId],
        startTime: new Date().toISOString(),
        focusMode: true
      });

      if (!sessionResponse.success) {
        return sessionResponse;
      }

      // 2. Mettre à jour progression
      await this.ednService.updateProgress(userId, itemId, {
        status: 'in-progress',
        lastAccessed: new Date().toISOString()
      });

      // 3. Analytics
      AnalyticsService.trackFeatureUsage('edn', 'study_started', {
        userId,
        itemId,
        sessionId: sessionResponse.data?.sessionId
      });

      return sessionResponse;
    } catch (error) {
      console.error('EdnController.startStudySession error:', error);
      return {
        success: false,
        error: {
          code: 'START_STUDY_ERROR',
          message: 'Impossible de démarrer la session d\'étude'
        }
      };
    }
  }

  /**
   * Termine une session d'étude avec score
   */
  async completeStudySession(
    userId: string, 
    itemId: string, 
    sessionId: string,
    results: {
      score: number;
      timeSpent: number; // minutes
      completionRate: number;
      notes?: string;
    }
  ): Promise<APIResponse<void>> {
    try {
      // 1. Finaliser session
      await this.ednService.updateStudySession(sessionId, {
        endTime: new Date().toISOString(),
        score: results.score,
        notes: results.notes
      });

      // 2. Mettre à jour progression utilisateur
      const currentProgress = await this.ednService.getUserProgressForItem(userId, itemId);
      
      let newStatus: 'in-progress' | 'completed' | 'mastered' = 'in-progress';
      if (results.completionRate >= 100) {
        newStatus = results.score >= 85 ? 'mastered' : 'completed';
      }

      await this.ednService.updateProgress(userId, itemId, {
        status: newStatus,
        timeSpent: (currentProgress.data?.timeSpent || 0) + results.timeSpent,
        lastAccessed: new Date().toISOString(),
        attempts: (currentProgress.data?.attempts || 0) + 1,
        bestScore: Math.max(currentProgress.data?.bestScore || 0, results.score)
      });

      // 3. Analytics
      AnalyticsService.trackFeatureUsage('edn', 'study_completed', {
        userId,
        itemId,
        sessionId,
        score: results.score,
        timeSpent: results.timeSpent,
        status: newStatus
      });

      return { success: true };
    } catch (error) {
      console.error('EdnController.completeStudySession error:', error);
      return {
        success: false,
        error: {
          code: 'COMPLETE_STUDY_ERROR',
          message: 'Impossible de finaliser la session d\'étude'
        }
      };
    }
  }

  /**
   * Bookmark/Unbookmark un item
   */
  async toggleBookmark(userId: string, itemId: string): Promise<APIResponse<{ isBookmarked: boolean }>> {
    try {
      const response = await this.ednService.toggleBookmark(userId, itemId);
      
      // Analytics
      AnalyticsService.trackFeatureUsage('edn', 'item_bookmarked', {
        userId,
        itemId,
        isBookmarked: response.data?.isBookmarked
      });
      
      return response;
    } catch (error) {
      console.error('EdnController.toggleBookmark error:', error);
      return {
        success: false,
        error: {
          code: 'BOOKMARK_ERROR',
          message: 'Impossible de mettre à jour le bookmark'
        }
      };
    }
  }

  // ============================================================================
  // LOGIQUE MÉTIER (utilise packages/core)
  // ============================================================================

  /**
   * Calcule les recommandations personnalisées
   */
  async getPersonalizedRecommendations(userId: string): Promise<APIResponse<EDNItemDTO[]>> {
    try {
      // 1. Récupérer données utilisateur
      const [itemsResponse, progressResponse] = await Promise.all([
        this.ednService.getItems({ limit: 367 }), // Tous les items
        this.ednService.getUserProgress(userId)
      ]);

      if (!itemsResponse.success || !progressResponse.success) {
        return {
          success: false,
          error: {
            code: 'RECOMMENDATIONS_ERROR',
            message: 'Impossible de calculer les recommandations'
          }
        };
      }

      // 2. Utiliser la logique métier du core (simulée)
      const userLevel = 'intermediate';
      const recommendations = itemsResponse.data?.slice(0, 10) || []; // Mock recommendations

      // 3. Convertir back en DTOs
      const recommendedDTOs = itemsResponse.data?.filter(item => 
        recommendations.some(rec => rec.id === item.id)
      ) || [];

      // 4. Analytics
      AnalyticsService.trackFeatureUsage('edn', 'recommendations_generated', {
        userId,
        userLevel,
        recommendationCount: recommendedDTOs.length
      });

      return {
        success: true,
        data: recommendedDTOs
      };
    } catch (error) {
      console.error('EdnController.getPersonalizedRecommendations error:', error);
      return {
        success: false,
        error: {
          code: 'RECOMMENDATIONS_ERROR',
          message: 'Impossible de générer les recommandations'
        }
      };
    }
  }

  /**
   * Calcule les statistiques de progression
   */
  async getProgressStatistics(userId: string): Promise<APIResponse<{
    completionRate: number;
    totalTimeSpent: number;
    masteredItems: number;
    totalItems: number;
    knowledgeGaps: { category: string; itemsCount: number; avgScore: number }[];
    userLevel: string;
  }>> {
    try {
      const [itemsResponse, progressResponse] = await Promise.all([
        this.ednService.getItems({ limit: 367 }),
        this.ednService.getUserProgress(userId)
      ]);

      if (!itemsResponse.success || !progressResponse.success) {
        return {
          success: false,
          error: {
            code: 'STATS_ERROR',
            message: 'Impossible de calculer les statistiques'
          }
        };
      }

      // Utiliser logique core (simulée)
      const overallProgress = {
        completionRate: 75,
        totalTimeSpent: 3600,
        masteredItems: 30,
        totalItems: 367
      };
      const userLevel = 'intermediate';
      const knowledgeGaps: { category: string; itemsCount: number; avgScore: number }[] = [];

      return {
        success: true,
        data: {
          ...overallProgress,
          knowledgeGaps,
          userLevel
        }
      };
    } catch (error) {
      console.error('EdnController.getProgressStatistics error:', error);
      return {
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: 'Impossible de calculer les statistiques'
        }
      };
    }
  }
}

export default EdnController;