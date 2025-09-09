/**
 * Service de contenu simplifié - compatible avec Supabase existant
 */

import { supabase } from '@/integrations/supabase/client';
import { cacheService } from '@/services/core/CacheService';
import { errorService } from '@/services/core/ErrorService';
import type { ApiResponse } from '@/types/hooks';

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
  category?: string;
  difficulty?: string;
  type?: string;
  search?: string;
}

class SimpleContentService {
  private static instance: SimpleContentService;
  private readonly CACHE_PREFIX = 'content_service';
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

  static getInstance(): SimpleContentService {
    if (!SimpleContentService.instance) {
      SimpleContentService.instance = new SimpleContentService();
    }
    return SimpleContentService.instance;
  }

  /**
   * Récupère les modules de contenu depuis les tables existantes
   */
  async getModules(filters?: ContentFilters): Promise<ApiResponse<ContentModule[]>> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}_modules_${JSON.stringify(filters || {})}`;
      const cached = cacheService.get<ContentModule[]>(cacheKey);
      
      if (cached) {
        return { success: true, data: cached };
      }

      // Utiliser edn_items_immersive comme source de contenu
      let query = supabase
        .from('edn_items_immersive')
        .select('*');

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,item_code.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;

      const modules = data?.map(item => ({
        id: item.id,
        title: item.title || item.item_code,
        description: item.subtitle || `Module ${item.item_code}`,
        content: item.tableau_rang_a || item.tableau_rang_b,
        difficulty: 'medium' as const,
        category: this.getCategoryFromItemCode(item.item_code),
        type: 'interactive' as const,
        estimatedTime: 30,
        tags: [item.item_code],
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      })) || [];

      cacheService.set(cacheKey, modules, { ttl: this.DEFAULT_TTL });

      return { success: true, data: modules };
    } catch (error) {
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

      const module: ContentModule = {
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
      };

      return { success: true, data: module };
    } catch (error) {
      errorService.handleError(error as Error, 'api_call');
      return { 
        success: false, 
        error: 'Erreur lors de la récupération du module',
        data: null
      };
    }
  }

  /**
   * Enregistre le progrès utilisateur
   */
  async saveProgress(moduleId: string, progress: number): Promise<ApiResponse<boolean>> {
    try {
      // Utiliser user_progress existant ou créer nouvelle entrée
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('id')
        .eq('content_id', moduleId)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      const progressData = {
        content_id: moduleId,
        content_type: 'module',
        progress_percentage: progress,
        user_id: (await supabase.auth.getUser()).data.user?.id
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
          .insert(progressData);
        
        if (error) throw error;
      }

      return { success: true, data: true };
    } catch (error) {
      errorService.handleError(error as Error, 'api_call');
      return { 
        success: false, 
        error: 'Erreur lors de la sauvegarde du progrès',
        data: false
      };
    }
  }

  /**
   * Génère un plan d'étude personnalisé
   */
  async generateStudyPlan(preferences: any): Promise<ApiResponse<StudyPlan>> {
    try {
      // Récupérer des modules pertinents
      const modulesResponse = await this.getModules({ 
        category: preferences.focusArea 
      });
      
      if (!modulesResponse.success || !modulesResponse.data) {
        throw new Error('Impossible de récupérer les modules');
      }

      const studyPlan: StudyPlan = {
        id: crypto.randomUUID(),
        title: `Plan d'étude personnalisé - ${preferences.focusArea}`,
        modules: modulesResponse.data.slice(0, 10).map(m => m.id),
        estimatedDuration: modulesResponse.data.slice(0, 10).reduce((acc, m) => acc + m.estimatedTime, 0),
        difficulty: preferences.difficulty || 'medium',
        progress: 0
      };

      return { success: true, data: studyPlan };
    } catch (error) {
      errorService.handleError(error as Error, 'api_call');
      return { 
        success: false, 
        error: 'Erreur lors de la génération du plan d\'étude',
        data: {
          id: '',
          title: 'Plan d\'étude par défaut',
          modules: [],
          estimatedDuration: 0,
          difficulty: 'medium',
          progress: 0
        }
      };
    }
  }

  /**
   * Recherche de contenu
   */
  async searchContent(query: string): Promise<ApiResponse<ContentModule[]>> {
    return this.getModules({ search: query });
  }

  /**
   * Détermine la catégorie depuis le code item
   */
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
}

export const contentService = SimpleContentService.getInstance();