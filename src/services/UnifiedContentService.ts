/**
 * Service de contenu unifié - Consolidation des services de contenu existants
 * Combine ContentService.ts et SimpleContentService.ts
 */

import { supabase } from '@/integrations/supabase/client';
import { analyticsService } from './UnifiedAnalyticsService';
import { cacheService } from './core/CacheService';
import { errorService } from './core/ErrorService';
import { logger } from '@/lib/logger';
import type { EdnItem, ApiResponse, PaginatedResponse } from '@/types';

// Types unifiés pour le service de contenu
export interface ContentModule {
  id: string;
  title: string;
  description: string;
  content: any;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  type: 'text' | 'video' | 'interactive' | 'quiz';
  estimatedTime: number;
  prerequisites?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyPlan {
  id: string;
  title: string;
  modules: string[];
  estimatedDuration: number;
  difficulty: string;
  progress: number;
}

export interface ContentFilters {
  search?: string;
  item_code?: string;
  content_status?: 'draft' | 'published' | 'archived';
  is_premium?: boolean;
  category?: string;
  difficulty?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export interface ContentValidation {
  isValid: boolean;
  issues: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
}

class UnifiedContentService {
  private static instance: UnifiedContentService;
  private readonly CACHE_PREFIX = 'unified_content';
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

  static getInstance(): UnifiedContentService {
    if (!UnifiedContentService.instance) {
      UnifiedContentService.instance = new UnifiedContentService();
    }
    return UnifiedContentService.instance;
  }

  // ========== GESTION DES ITEMS EDN (du ContentService) ==========

  /**
   * Récupère les items EDN avec pagination et filtres
   */
  async getEdnItems(filters?: ContentFilters): Promise<PaginatedResponse<EdnItem>> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}_edn_items_${JSON.stringify(filters || {})}`;
      const cached = cacheService.get<PaginatedResponse<EdnItem>>(cacheKey);
      
      if (cached) {
        return cached;
      }

      let query = supabase
        .from('edn_items_immersive')
        .select('*', { count: 'exact' });

      // Appliquer les filtres
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,item_code.ilike.%${filters.search}%`);
      }

      if (filters?.item_code) {
        query = query.eq('item_code', filters.item_code);
      }

      if (filters?.is_premium !== undefined) {
        query = query.eq('is_premium', filters.is_premium);
      }

      // Pagination
      const limit = filters?.limit || 20;
      const offset = filters?.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const result: PaginatedResponse<EdnItem> = {
        success: true,
        data: (data || []).map(this.mapToEdnItem),
        pagination: {
          total: count || 0,
          page: Math.floor(offset / limit) + 1,
          limit,
          total_pages: Math.ceil((count || 0) / limit)
        }
      };

      cacheService.set(cacheKey, result, { ttl: this.DEFAULT_TTL });

      // Analytics
      analyticsService.trackUserAction('content', 'edn_items_retrieved', {
        count: data?.length || 0,
        filters
      });

      logger.debug('Items EDN récupérés', {
        component: 'UnifiedContentService',
        action: 'get_edn_items',
        metadata: { count: data?.length || 0, filters }
      });

      return result;
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'get_edn_items', filters });
      
      logger.error('Erreur récupération items EDN', {
        component: 'UnifiedContentService',
        action: 'get_edn_items',
        metadata: { filters }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur récupération items EDN',
        data: [],
        pagination: { total: 0, page: 1, limit: 20, total_pages: 0 }
      };
    }
  }

  /**
   * Récupère un item EDN spécifique
   */
  async getEdnItem(itemCode: string): Promise<ApiResponse<EdnItem>> {
    try {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .eq('item_code', itemCode)
        .single();

      if (error) throw error;

      const mappedItem = this.mapToEdnItem(data);

      // Analytics
      analyticsService.trackUserAction('content', 'edn_item_retrieved', { itemCode });

      logger.debug('Item EDN récupéré', {
        component: 'UnifiedContentService',
        action: 'get_edn_item',
        metadata: { itemCode }
      });

      return { success: true, data: mappedItem };
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'get_edn_item', itemCode });
      
      logger.error('Erreur récupération item EDN', {
        component: 'UnifiedContentService',
        action: 'get_edn_item',
        metadata: { itemCode }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur récupération item EDN'
      };
    }
  }

  /**
   * Met à jour un item EDN
   */
  async updateEdnItem(itemCode: string, updates: Partial<EdnItem>): Promise<ApiResponse<EdnItem>> {
    try {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .update({
          title: updates.title,
          subtitle: updates.description,
          tableau_rang_a: updates.tableau_rang_a as any,
          tableau_rang_b: updates.tableau_rang_b as any,
          paroles_musicales: updates.paroles_musicales,
          updated_at: new Date().toISOString()
        })
        .eq('item_code', itemCode)
        .select()
        .single();

      if (error) throw error;

      const mappedItem = this.mapToEdnItem(data);

      // Invalider le cache
      cacheService.delete(`${this.CACHE_PREFIX}_edn_items_`);

      // Analytics
      analyticsService.trackUserAction('content', 'edn_item_updated', {
        itemCode,
        updateFields: Object.keys(updates)
      });

      logger.info('Item EDN mis à jour', {
        component: 'UnifiedContentService',
        action: 'update_edn_item',
        metadata: { itemCode, updateFields: Object.keys(updates) }
      });

      return { success: true, data: mappedItem };
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'update_edn_item', itemCode });
      
      logger.error('Erreur mise à jour item EDN', {
        component: 'UnifiedContentService',
        action: 'update_edn_item',
        metadata: { itemCode }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur mise à jour item EDN'
      };
    }
  }

  // ========== MODULES DE CONTENU (du SimpleContentService) ==========

  /**
   * Récupère les modules de contenu
   */
  async getModules(filters?: ContentFilters): Promise<ApiResponse<ContentModule[]>> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}_modules_${JSON.stringify(filters || {})}`;
      const cached = cacheService.get<ContentModule[]>(cacheKey);
      
      if (cached) {
        return { success: true, data: cached };
      }

      let query = supabase
        .from('edn_items_immersive')
        .select('*');

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,item_code.ilike.%${filters.search}%`);
      }

      if (filters?.category) {
        // Filtrer par catégorie basée sur le code item
        const categoryRange = this.getCategoryRange(filters.category);
        if (categoryRange) {
          query = query.gte('item_code', categoryRange.min).lte('item_code', categoryRange.max);
        }
      }

      const { data, error } = await query.limit(filters?.limit || 50);

      if (error) throw error;

      const modules = (data || []).map(this.mapToContentModule);

      cacheService.set(cacheKey, modules, { ttl: this.DEFAULT_TTL });

      // Analytics
      analyticsService.trackUserAction('content', 'modules_retrieved', {
        count: modules.length,
        filters
      });

      return { success: true, data: modules };
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'get_modules', filters });
      errorService.handleError(error as Error, 'api_call');
      
      return { 
        success: false, 
        error: 'Erreur lors de la récupération des modules',
        data: []
      };
    }
  }

  /**
   * Récupère un module spécifique
   */
  async getModule(id: string): Promise<ApiResponse<ContentModule | null>> {
    try {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { success: true, data: null };

      const module = this.mapToContentModule(data);

      // Analytics
      analyticsService.trackUserAction('content', 'module_retrieved', { moduleId: id });

      return { success: true, data: module };
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'get_module', moduleId: id });
      errorService.handleError(error as Error, 'api_call');
      
      return { 
        success: false, 
        error: 'Erreur lors de la récupération du module',
        data: null
      };
    }
  }

  // ========== GESTION DES PROGRÈS ==========

  /**
   * Enregistre le progrès utilisateur
   */
  async saveProgress(moduleId: string, progress: number): Promise<ApiResponse<boolean>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('id')
        .eq('content_id', moduleId)
        .eq('user_id', user.id)
        .maybeSingle();

      const progressData = {
        content_id: moduleId,
        content_type: 'module',
        progress_percentage: Math.min(100, Math.max(0, progress)),
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      if (existingProgress) {
        const { error } = await supabase
          .from('user_progress')
          .update(progressData)
          .eq('id', existingProgress.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_progress')
          .insert({ ...progressData, created_at: new Date().toISOString() });
        
        if (error) throw error;
      }

      // Analytics
      analyticsService.trackUserAction('content', 'progress_saved', {
        moduleId,
        progress
      }, user.id);

      return { success: true, data: true };
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'save_progress', moduleId });
      errorService.handleError(error as Error, 'api_call');
      
      return { 
        success: false, 
        error: 'Erreur lors de la sauvegarde du progrès',
        data: false
      };
    }
  }

  // ========== GÉNÉRATION ET VALIDATION DE CONTENU ==========

  /**
   * Génère du contenu via edge functions
   */
  async generateContent(
    itemCode: string, 
    contentType: 'tableau_rang_a' | 'tableau_rang_b' | 'paroles_musicales' | 'quiz_questions'
  ): Promise<ApiResponse<{ content: unknown }>> {
    try {
      const { data, error } = await supabase.functions.invoke('content-generator', {
        body: {
          item_code: itemCode,
          content_type: contentType
        }
      });

      if (error) throw error;

      // Analytics
      analyticsService.trackUserAction('content', 'content_generated', {
        itemCode,
        contentType
      });

      logger.info('Contenu généré', {
        component: 'UnifiedContentService',
        action: 'generate_content',
        metadata: { itemCode, contentType }
      });

      return { success: true, data: { content: data.content } };
    } catch (error) {
      analyticsService.trackError(error as Error, { 
        action: 'generate_content', 
        itemCode, 
        contentType 
      });
      
      logger.error('Erreur génération contenu', {
        component: 'UnifiedContentService',
        action: 'generate_content',
        metadata: { itemCode, contentType }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur génération contenu'
      };
    }
  }

  /**
   * Valide le contenu d'un item
   */
  async validateContent(itemCode: string): Promise<ApiResponse<ContentValidation>> {
    try {
      const itemResponse = await this.getEdnItem(itemCode);
      if (!itemResponse.success || !itemResponse.data) {
        throw new Error('Item non trouvé');
      }

      const item = itemResponse.data;
      const issues: ContentValidation['issues'] = [];

      // Validation du titre
      if (!item.title || item.title.trim().length === 0) {
        issues.push({
          field: 'title',
          message: 'Le titre est requis',
          severity: 'error'
        });
      }

      // Validation du contenu
      if (!item.tableau_rang_a && !item.tableau_rang_b) {
        issues.push({
          field: 'content',
          message: 'Au moins un tableau (A ou B) doit être présent',
          severity: 'error'
        });
      }

      // Validation des paroles musicales
      if (!item.paroles_musicales || item.paroles_musicales.length === 0) {
        issues.push({
          field: 'paroles_musicales',
          message: 'Les paroles musicales sont recommandées',
          severity: 'warning'
        });
      }

      const validation: ContentValidation = {
        isValid: issues.filter(i => i.severity === 'error').length === 0,
        issues
      };

      // Analytics
      analyticsService.trackUserAction('content', 'content_validated', {
        itemCode,
        isValid: validation.isValid,
        issuesCount: issues.length
      });

      logger.debug('Contenu validé', {
        component: 'UnifiedContentService',
        action: 'validate_content',
        metadata: { itemCode, isValid: validation.isValid }
      });

      return { success: true, data: validation };
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'validate_content', itemCode });
      
      logger.error('Erreur validation contenu', {
        component: 'UnifiedContentService',
        action: 'validate_content',
        metadata: { itemCode }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur validation contenu'
      };
    }
  }

  // ========== RECHERCHE ==========

  /**
   * Recherche de contenu
   */
  async searchContent(
    query: string, 
    filters?: { content_type?: string; limit?: number }
  ): Promise<ApiResponse<EdnItem[]>> {
    try {
      const searchFilters: ContentFilters = {
        search: query,
        limit: filters?.limit || 50
      };

      const result = await this.getEdnItems(searchFilters);
      
      if (result.success) {
        // Analytics
        analyticsService.trackUserAction('content', 'content_searched', {
          query,
          resultsCount: result.data?.length || 0
        });

        return { success: true, data: result.data || [] };
      }

      return { success: false, error: result.error || 'Erreur recherche', data: [] };
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'search_content', query });
      
      logger.error('Erreur recherche contenu', {
        component: 'UnifiedContentService',
        action: 'search_content',
        metadata: { query }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur recherche contenu',
        data: []
      };
    }
  }

  // ========== GESTION DU STATUT ==========

  /**
   * Publie un contenu
   */
  async publishContent(itemCode: string): Promise<ApiResponse<EdnItem>> {
    try {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .update({ 
          content_status: 'published',
          updated_at: new Date().toISOString()
        })
        .eq('item_code', itemCode)
        .select()
        .single();

      if (error) throw error;

      const mappedItem = this.mapToEdnItem(data);

      // Invalider le cache
      cacheService.delete(`${this.CACHE_PREFIX}_edn_items_`);

      // Analytics
      analyticsService.trackUserAction('content', 'content_published', { itemCode });

      logger.info('Contenu publié', {
        component: 'UnifiedContentService',
        action: 'publish_content',
        metadata: { itemCode }
      });

      return { success: true, data: mappedItem };
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'publish_content', itemCode });
      
      logger.error('Erreur publication contenu', {
        component: 'UnifiedContentService',
        action: 'publish_content',
        metadata: { itemCode }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur publication contenu'
      };
    }
  }

  /**
   * Archive un contenu
   */
  async archiveContent(itemCode: string): Promise<ApiResponse<EdnItem>> {
    try {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .update({ 
          content_status: 'archived',
          updated_at: new Date().toISOString()
        })
        .eq('item_code', itemCode)
        .select()
        .single();

      if (error) throw error;

      const mappedItem = this.mapToEdnItem(data);

      // Invalider le cache
      cacheService.delete(`${this.CACHE_PREFIX}_edn_items_`);

      // Analytics
      analyticsService.trackUserAction('content', 'content_archived', { itemCode });

      logger.info('Contenu archivé', {
        component: 'UnifiedContentService',
        action: 'archive_content',
        metadata: { itemCode }
      });

      return { success: true, data: mappedItem };
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'archive_content', itemCode });
      
      logger.error('Erreur archivage contenu', {
        component: 'UnifiedContentService',
        action: 'archive_content',
        metadata: { itemCode }
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur archivage contenu'
      };
    }
  }

  // ========== MÉTHODES PRIVÉES ==========

  private mapToEdnItem = (data: any): EdnItem => ({
    id: data.id,
    item_code: data.item_code,
    title: data.title || data.item_code,
    description: data.subtitle,
    tableau_rang_a: data.tableau_rang_a,
    tableau_rang_b: data.tableau_rang_b,
    paroles_musicales: data.paroles_musicales || [],
    quiz_questions: data.quiz_questions,
    scene_immersive: data.scene_immersive,
    is_premium: data.is_premium || false,
    content_status: data.content_status || 'draft',
    theme: data.theme,
    created_at: data.created_at,
    updated_at: data.updated_at
  });

  private mapToContentModule = (data: any): ContentModule => ({
    id: data.id,
    title: data.title || data.item_code,
    description: data.subtitle || `Module ${data.item_code}`,
    content: data.tableau_rang_a || data.tableau_rang_b,
    difficulty: 'medium',
    category: this.getCategoryFromItemCode(data.item_code),
    type: 'interactive',
    estimatedTime: 30,
    tags: [data.item_code],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  });

  private getCategoryFromItemCode(itemCode?: string): string {
    if (!itemCode) return 'general';
    
    const num = parseInt(itemCode.replace('IC-', ''));
    
    if (num <= 10) return 'fondamentaux';
    if (num <= 50) return 'gyneco-obstetrique';
    if (num <= 80) return 'psychiatrie';
    if (num <= 150) return 'neurologie';
    if (num <= 250) return 'cardiologie';
    if (num <= 350) return 'urgences';
    
    return 'specialites';
  }

  private getCategoryRange(category: string): { min: string; max: string } | null {
    switch (category) {
      case 'fondamentaux': return { min: 'IC-001', max: 'IC-010' };
      case 'gyneco-obstetrique': return { min: 'IC-011', max: 'IC-050' };
      case 'psychiatrie': return { min: 'IC-051', max: 'IC-080' };
      case 'neurologie': return { min: 'IC-081', max: 'IC-150' };
      case 'cardiologie': return { min: 'IC-151', max: 'IC-250' };
      case 'urgences': return { min: 'IC-251', max: 'IC-350' };
      default: return null;
    }
  }
}

// Export instance et types
export const contentService = UnifiedContentService.getInstance();
export default UnifiedContentService;