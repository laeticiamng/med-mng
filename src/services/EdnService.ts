// ============================================================================
// SERVICE: EDN - Accès aux données (API/Supabase)
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  EDNItemDTO, 
  UserProgressDTO, 
  APIResponse, 
  PaginatedResponse, 
  PaginationParams 
} from '@med-mng/types';
import { SchemaValidators } from '@med-mng/shared';

export class EdnService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // ============================================================================
  // ITEMS EDN
  // ============================================================================

  /**
   * Récupère la liste des items EDN avec filtres et pagination
   */
  async getItems(params?: {
    category?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<EDNItemDTO>> {
    try {
      let query = this.supabase
        .from('edn_items')
        .select('*', { count: 'exact' });

      // Filtres
      if (params?.category) {
        query = query.eq('category', params.category);
      }
      
      if (params?.difficulty) {
        query = query.eq('difficulty', params.difficulty);
      }
      
      if (params?.search) {
        query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%,number.eq.${parseInt(params.search) || 0}`);
      }

      // Pagination
      const page = params?.page || 1;
      const limit = Math.min(params?.limit || 20, 100); // Max 100
      const offset = (page - 1) * limit;

      query = query
        .range(offset, offset + limit - 1)
        .order('number', { ascending: true });

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        success: true,
        data: data as EDNItemDTO[],
        meta: {
          total: count || 0,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('EdnService.getItems error:', error);
      return {
        success: false,
        data: [],
        error: {
          code: 'FETCH_ITEMS_ERROR',
          message: 'Impossible de récupérer les items EDN'
        },
        meta: {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Récupère un item EDN spécifique
   */
  async getItem(itemId: string): Promise<APIResponse<EDNItemDTO>> {
    try {
      const { data, error } = await this.supabase
        .from('edn_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        return {
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Item EDN introuvable'
          }
        };
      }

      return {
        success: true,
        data: data as EDNItemDTO
      };
    } catch (error) {
      console.error('EdnService.getItem error:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ITEM_ERROR',
          message: 'Impossible de récupérer l\'item EDN'
        }
      };
    }
  }

  // ============================================================================
  // PROGRESSION UTILISATEUR
  // ============================================================================

  /**
   * Récupère la progression d'un utilisateur
   */
  async getUserProgress(userId: string): Promise<APIResponse<UserProgressDTO[]>> {
    try {
      const { data, error } = await this.supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .order('last_accessed', { ascending: false });

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      return {
        success: true,
        data: (data || []).map(this.mapUserProgressFromDB)
      };
    } catch (error) {
      console.error('EdnService.getUserProgress error:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_PROGRESS_ERROR',
          message: 'Impossible de récupérer la progression'
        }
      };
    }
  }

  /**
   * Récupère la progression pour un item spécifique
   */
  async getUserProgressForItem(userId: string, itemId: string): Promise<APIResponse<UserProgressDTO>> {
    try {
      const { data, error } = await this.supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is OK
        throw new Error(`Supabase error: ${error.message}`);
      }

      return {
        success: true,
        data: data ? this.mapUserProgressFromDB(data) : null
      };
    } catch (error) {
      console.error('EdnService.getUserProgressForItem error:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_PROGRESS_ERROR',
          message: 'Impossible de récupérer la progression de l\'item'
        }
      };
    }
  }

  /**
   * Met à jour la progression d'un utilisateur
   */
  async updateProgress(
    userId: string, 
    itemId: string, 
    progressData: Partial<UserProgressDTO>
  ): Promise<APIResponse<UserProgressDTO>> {
    try {
      // Validation
      const validationErrors = SchemaValidators.validateStudySession({
        userId,
        itemIds: [itemId],
        ...progressData
      });

      if (validationErrors.length > 0) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Données de progression invalides',
            details: validationErrors
          }
        };
      }

      const updateData = {
        user_id: userId,
        item_id: itemId,
        status: progressData.status,
        completion_rate: progressData.completionRate,
        time_spent: progressData.timeSpent,
        last_accessed: progressData.lastAccessed,
        attempts: progressData.attempts,
        best_score: progressData.bestScore,
        notes: progressData.notes,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('user_progress')
        .upsert(updateData, { 
          onConflict: 'user_id,item_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      return {
        success: true,
        data: this.mapUserProgressFromDB(data)
      };
    } catch (error) {
      console.error('EdnService.updateProgress error:', error);
      return {
        success: false,
        error: {
          code: 'UPDATE_PROGRESS_ERROR',
          message: 'Impossible de mettre à jour la progression'
        }
      };
    }
  }

  // ============================================================================
  // SESSIONS D'ÉTUDE
  // ============================================================================

  /**
   * Crée une nouvelle session d'étude
   */
  async createStudySession(sessionData: {
    userId: string;
    itemIds: string[];
    startTime: string;
    focusMode: boolean;
  }): Promise<APIResponse<{ sessionId: string }>> {
    try {
      const { data, error } = await this.supabase
        .from('study_sessions')
        .insert({
          user_id: sessionData.userId,
          item_ids: sessionData.itemIds,
          start_time: sessionData.startTime,
          focus_mode: sessionData.focusMode,
          status: 'in-progress'
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      return {
        success: true,
        data: { sessionId: data.id }
      };
    } catch (error) {
      console.error('EdnService.createStudySession error:', error);
      return {
        success: false,
        error: {
          code: 'CREATE_SESSION_ERROR',
          message: 'Impossible de créer la session d\'étude'
        }
      };
    }
  }

  /**
   * Met à jour une session d'étude
   */
  async updateStudySession(
    sessionId: string, 
    updates: {
      endTime?: string;
      score?: number;
      notes?: string;
    }
  ): Promise<APIResponse<void>> {
    try {
      const { error } = await this.supabase
        .from('study_sessions')
        .update({
          end_time: updates.endTime,
          score: updates.score,
          notes: updates.notes,
          status: updates.endTime ? 'completed' : 'in-progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      return { success: true };
    } catch (error) {
      console.error('EdnService.updateStudySession error:', error);
      return {
        success: false,
        error: {
          code: 'UPDATE_SESSION_ERROR',
          message: 'Impossible de mettre à jour la session d\'étude'
        }
      };
    }
  }

  // ============================================================================
  // BOOKMARKS
  // ============================================================================

  /**
   * Toggle bookmark d'un item
   */
  async toggleBookmark(userId: string, itemId: string): Promise<APIResponse<{ isBookmarked: boolean }>> {
    try {
      // Vérifier si bookmark existe
      const { data: existing } = await this.supabase
        .from('user_bookmarks')
        .select('id')
        .eq('user_id', userId)
        .eq('item_id', itemId)
        .single();

      if (existing) {
        // Supprimer bookmark
        const { error } = await this.supabase
          .from('user_bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('item_id', itemId);

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }

        return {
          success: true,
          data: { isBookmarked: false }
        };
      } else {
        // Créer bookmark
        const { error } = await this.supabase
          .from('user_bookmarks')
          .insert({
            user_id: userId,
            item_id: itemId,
            created_at: new Date().toISOString()
          });

        if (error) {
          throw new Error(`Supabase error: ${error.message}`);
        }

        return {
          success: true,
          data: { isBookmarked: true }
        };
      }
    } catch (error) {
      console.error('EdnService.toggleBookmark error:', error);
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
  // HELPERS PRIVÉS
  // ============================================================================

  /**
   * Mappe les données DB vers DTO
   */
  private mapUserProgressFromDB(dbData: any): UserProgressDTO {
    return {
      userId: dbData.user_id,
      itemId: dbData.item_id,
      status: dbData.status,
      completionRate: dbData.completion_rate,
      timeSpent: dbData.time_spent,
      lastAccessed: dbData.last_accessed,
      attempts: dbData.attempts,
      bestScore: dbData.best_score,
      notes: dbData.notes,
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at
    };
  }
}

export default EdnService;