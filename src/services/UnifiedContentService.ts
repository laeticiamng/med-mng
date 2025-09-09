/**
 * Service de contenu unifié - Version simplifiée sans références circulaires
 */

import { supabase } from '@/integrations/supabase/client';
import { analyticsService } from './UnifiedAnalyticsService';
import { cacheService } from './core/CacheService';
import { errorService } from './core/ErrorService';
import { logger } from '@/lib/logger';

// Types locaux pour éviter les références circulaires
interface EdnItemData {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  paroles_musicales?: string[];
  quiz_questions?: any;
  scene_immersive?: any;
  is_premium?: boolean;
  content_status?: 'draft' | 'published' | 'archived';
  theme?: string;
  created_at: string;
  updated_at: string;
}

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
  name: string;
  description: string;
  modules: string[];
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  objectives: string[];
  createdAt: Date;
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

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
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

  // ========== MODULES DE CONTENU ==========

  async getModules(filters?: ContentFilters): Promise<ServiceResponse<ContentModule[]>> {
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
        const categoryRange = this.getCategoryRange(filters.category);
        if (categoryRange) {
          query = query.gte('item_code', categoryRange.min).lte('item_code', categoryRange.max);
        }
      }

      const { data, error } = await query.limit(filters?.limit || 50);

      if (error) throw error;

      const modules = (data || []).map(this.mapToContentModule);

      cacheService.set(cacheKey, modules, { ttl: this.DEFAULT_TTL });

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

  async getModule(id: string): Promise<ServiceResponse<ContentModule | null>> {
    try {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return { success: true, data: null };

      const module = this.mapToContentModule(data);

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

  async saveProgress(moduleId: string, progress: number): Promise<ServiceResponse<boolean>> {
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

  async generateStudyPlan(preferences: any): Promise<ServiceResponse<StudyPlan>> {
    try {
      const studyPlan: StudyPlan = {
        id: crypto.randomUUID(),
        name: `Plan d'étude personnalisé`,
        description: 'Plan généré selon vos préférences',
        modules: [],
        estimatedDuration: 30,
        difficulty: preferences.difficulty || 'intermediate',
        objectives: preferences.objectives || [],
        createdAt: new Date()
      };

      analyticsService.trackUserAction('content', 'study_plan_generated', {
        difficulty: studyPlan.difficulty,
        estimatedDuration: studyPlan.estimatedDuration
      });

      return { success: true, data: studyPlan };
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'generate_study_plan' });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur génération plan d\'étude' 
      };
    }
  }

  async searchContent(
    query: string, 
    filters?: { content_type?: string; limit?: number }
  ): Promise<ServiceResponse<ContentModule[]>> {
    try {
      const searchFilters: ContentFilters = {
        search: query,
        limit: filters?.limit || 50
      };

      const modulesResponse = await this.getModules(searchFilters);
      
      if (modulesResponse.success) {
        analyticsService.trackUserAction('content', 'content_searched', {
          query,
          resultsCount: modulesResponse.data?.length || 0
        });

        return { success: true, data: modulesResponse.data || [] };
      }

      return { success: false, error: modulesResponse.error || 'Erreur recherche', data: [] };
    } catch (error) {
      analyticsService.trackError(error as Error, { action: 'search_content', query });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur recherche contenu',
        data: []
      };
    }
  }

  // ========== MÉTHODES PRIVÉES ==========

  private mapToContentModule = (data: EdnItemData): ContentModule => ({
    id: data.id,
    title: data.title || data.item_code,
    description: data.subtitle || `Module ${data.item_code}`,
    content: data.tableau_rang_a || data.tableau_rang_b,
    difficulty: 'medium' as const,
    category: this.getCategoryFromItemCode(data.item_code),
    type: 'interactive' as const,
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

// Export singleton instance
export const contentService = UnifiedContentService.getInstance();