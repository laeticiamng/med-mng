// ============================================================================
// CONTROLLER: EDN - Orchestration UI ↔ Services ↔ Core
// ============================================================================

// Imports temporaires
const EDNCore = { calculateUserLevel: () => 'intermediate', getRecommendedItems: () => [], calculateOverallProgress: () => ({}), identifyKnowledgeGaps: () => [] };
import { EDNItemDTO, UserProgressDTO, APIResponse } from '../types/temp-types';
const EdnService = class {};
const AnalyticsService = class {};

export class EdnController {
  
  constructor(
    private ednService: EdnService,
    private analyticsService: AnalyticsService
  ) {}

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
  }): Promise<APIResponse<EDNItemDTO[]>> {
    try {
      const response = await this.ednService.getItems(filters);
      
      // Track analytics
      this.analyticsService.track('edn_items_viewed', {
        filters,
        resultCount: response.data?.length || 0
      });
      
      return response;
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
        this.analyticsService.track('edn_item_accessed', {
          itemId,
          itemNumber: response.data.number,
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
      this.analyticsService.track('edn_study_started', {
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
        completionRate: results.completionRate,
        timeSpent: (currentProgress.data?.timeSpent || 0) + results.timeSpent,
        lastAccessed: new Date().toISOString(),
        attempts: (currentProgress.data?.attempts || 0) + 1,
        bestScore: Math.max(currentProgress.data?.bestScore || 0, results.score)
      });

      // 3. Analytics
      this.analyticsService.track('edn_study_completed', {
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
      this.analyticsService.track('edn_item_bookmarked', {
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

      // 2. Utiliser la logique métier du core
      const userLevel = EDNCore.calculateUserLevel(
        progressResponse.data?.map(p => ({
          userId: p.userId,
          itemId: p.itemId,
          status: p.status,
          completionRate: p.completionRate,
          timeSpent: p.timeSpent,
          lastAccessed: new Date(p.lastAccessed),
          attempts: p.attempts,
          bestScore: p.bestScore
        })) || []
      );

      const recommendations = EDNCore.getRecommendedItems(
        itemsResponse.data?.map(item => ({
          id: item.id,
          number: item.number,
          title: item.title,
          category: item.category,
          subcategory: item.subcategory,
          description: item.description,
          objectives: item.objectives,
          keyPoints: item.keyPoints,
          difficulty: item.difficulty,
          estimatedStudyTime: item.estimatedStudyTime,
          prerequisites: item.prerequisites,
          relatedItems: item.relatedItems,
          lastUpdated: new Date(item.lastUpdated)
        })) || [],
        progressResponse.data?.map(p => ({
          userId: p.userId,
          itemId: p.itemId,
          status: p.status,
          completionRate: p.completionRate,
          timeSpent: p.timeSpent,
          lastAccessed: new Date(p.lastAccessed),
          attempts: p.attempts,
          bestScore: p.bestScore
        })) || [],
        userLevel
      );

      // 3. Convertir back en DTOs
      const recommendedDTOs = itemsResponse.data?.filter(item => 
        recommendations.some(rec => rec.id === item.id)
      ) || [];

      // 4. Analytics
      this.analyticsService.track('edn_recommendations_generated', {
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

      // Utiliser logique core
      const progressData = progressResponse.data?.map(p => ({
        userId: p.userId,
        itemId: p.itemId,
        status: p.status,
        completionRate: p.completionRate,
        timeSpent: p.timeSpent,
        lastAccessed: new Date(p.lastAccessed),
        attempts: p.attempts,
        bestScore: p.bestScore
      })) || [];

      const itemsData = itemsResponse.data?.map(item => ({
        id: item.id,
        number: item.number,
        title: item.title,
        category: item.category,
        subcategory: item.subcategory,
        description: item.description,
        objectives: item.objectives,
        keyPoints: item.keyPoints,
        difficulty: item.difficulty,
        estimatedStudyTime: item.estimatedStudyTime,
        prerequisites: item.prerequisites,
        relatedItems: item.relatedItems,
        lastUpdated: new Date(item.lastUpdated)
      })) || [];

      const overallProgress = EDNCore.calculateOverallProgress(progressData);
      const userLevel = EDNCore.calculateUserLevel(progressData);
      const knowledgeGaps = EDNCore.identifyKnowledgeGaps(progressData, itemsData);

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