/**
 * Service métier contenu - Gestion EDN, ECOS, modules
 * Génération, progression, évaluation, personnalisation
 */

import { supabase } from '@/integrations/supabase/client';
import { cacheService } from '@/services/core/CacheService';
import { errorService } from '@/services/core/ErrorService';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  type: 'edn' | 'ecos' | 'interactive' | 'video' | 'quiz';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // minutes
  prerequisites: string[];
  objectives: string[];
  content: ModuleContent;
  metadata: ModuleMetadata;
  analytics: ModuleAnalytics;
}

export interface ModuleContent {
  sections: ContentSection[];
  resources: Resource[];
  assessments: Assessment[];
  interactive: InteractiveElement[];
}

export interface ContentSection {
  id: string;
  title: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'simulation';
  content: any;
  order: number;
  estimated_time: number;
}

export interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'audio' | 'link' | 'image';
  url: string;
  description?: string;
  downloadable: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  type: 'quiz' | 'case_study' | 'simulation' | 'essay';
  questions: Question[];
  passingScore: number;
  maxAttempts: number;
  timeLimit?: number;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay' | 'matching';
  question: string;
  options?: string[];
  correctAnswer: any;
  explanation?: string;
  difficulty: number;
  points: number;
}

export interface InteractiveElement {
  id: string;
  type: 'simulation' | '3d_model' | 'diagram' | 'calculator' | 'timeline';
  config: any;
  data: any;
}

export interface ModuleMetadata {
  author: string;
  created: string;
  updated: string;
  version: string;
  tags: string[];
  reviewStatus: 'draft' | 'review' | 'approved' | 'archived';
  expertValidation: boolean;
}

export interface ModuleAnalytics {
  enrollments: number;
  completions: number;
  avgScore: number;
  avgDuration: number;
  satisfactionRating: number;
  commonMistakes: string[];
}

export interface StudyPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetDate: string;
  modules: PlannedModule[];
  adaptiveSettings: AdaptiveSettings;
  progress: PlanProgress;
}

export interface PlannedModule {
  moduleId: string;
  scheduledDate: string;
  estimatedDuration: number;
  priority: 'low' | 'medium' | 'high';
  prerequisites: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
}

export interface AdaptiveSettings {
  difficultyAdjustment: boolean;
  paceAdjustment: boolean;
  contentPersonalization: boolean;
  reminderFrequency: 'daily' | 'weekly' | 'custom';
}

export interface PlanProgress {
  completedModules: number;
  totalModules: number;
  currentStreak: number;
  estimatedCompletion: string;
  adherenceRate: number;
}

class ContentService {
  private static instance: ContentService;

  private constructor() {}

  static getInstance(): ContentService {
    if (!ContentService.instance) {
      ContentService.instance = new ContentService();
    }
    return ContentService.instance;
  }

  // Récupérer les modules disponibles
  async getAvailableModules(filters?: {
    category?: string;
    difficulty?: string;
    type?: string;
    search?: string;
  }): Promise<LearningModule[]> {
    try {
      const cacheKey = `modules_${JSON.stringify(filters || {})}`;
      const cached = cacheService.get<LearningModule[]>(cacheKey, 'sessionStorage');
      
      if (cached) {
        return cached;
      }

      // Mock implementation - replace with actual schema
      const data: any[] = [];
      const error = null;

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const modules = data.map(this.transformModuleData);

      // Cache pour 30 minutes
      cacheService.set(cacheKey, modules, {
        storage: 'sessionStorage',
        ttl: 30 * 60 * 1000
      });

      return modules;

    } catch (error) {
      errorService.handleError(error, 'api_call');
      return [];
    }
  }

  // Récupérer un module spécifique avec contenu complet
  async getModule(moduleId: string, userId?: string): Promise<LearningModule> {
    try {
      const cacheKey = `module_${moduleId}_${userId || 'guest'}`;
      const cached = cacheService.get<LearningModule>(cacheKey, 'localStorage');
      
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .from('learning_modules')
        .select(`
          *,
          module_content(
            *,
            content_sections(*),
            resources(*),
            assessments(
              *,
              questions(*)
            ),
            interactive_elements(*)
          ),
          module_metadata(*),
          module_analytics(*)
        `)
        .eq('id', moduleId)
        .single();

      if (error) throw error;

      const module = this.transformModuleData(data);

      // Personnaliser le contenu si utilisateur connecté
      if (userId) {
        await this.personalizeContent(module, userId);
      }

      // Cache pour 1 heure
      cacheService.set(cacheKey, module, {
        storage: 'localStorage',
        ttl: 60 * 60 * 1000
      });

      return module;

    } catch (error) {
      errorService.handleError(error, 'api_call');
      throw error;
    }
  }

  // Générer un plan d'étude personnalisé
  async generateStudyPlan(userId: string, goals: {
    targetDate: string;
    focusAreas: string[];
    weeklyHours: number;
    difficulty: string;
  }): Promise<StudyPlan> {
    try {
      const { data, error } = await supabase
        .rpc('generate_study_plan', {
          user_id: userId,
          target_date: goals.targetDate,
          focus_areas: goals.focusAreas,
          weekly_hours: goals.weeklyHours,
          preferred_difficulty: goals.difficulty
        });

      if (error) throw error;

      return this.transformStudyPlanData(data);

    } catch (error) {
      errorService.handleError(error, 'user_action');
      throw error;
    }
  }

  // Enregistrer la progression sur un module
  async recordProgress(userId: string, moduleId: string, progress: {
    sectionId?: string;
    completed: boolean;
    timeSpent: number;
    score?: number;
    answers?: any;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          module_id: moduleId,
          section_id: progress.sectionId,
          completed: progress.completed,
          time_spent: progress.timeSpent,
          score: progress.score,
          answers: progress.answers,
          last_accessed: new Date().toISOString(),
        });

      if (error) throw error;

      // Invalider les caches liés
      cacheService.delete(`module_${moduleId}_${userId}`, 'localStorage');
      cacheService.delete(`user_profile_${userId}`, 'localStorage');

      // Vérifier si des achievements sont débloqués
      await this.checkAchievements(userId, moduleId, progress);

    } catch (error) {
      errorService.handleError(error, 'user_action');
      throw error;
    }
  }

  // Évaluer une réponse automatiquement
  async evaluateResponse(questionId: string, userResponse: any): Promise<{
    correct: boolean;
    score: number;
    feedback: string;
    explanation?: string;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('evaluate_response', {
          question_id: questionId,
          user_response: userResponse
        });

      if (error) throw error;

      return data;

    } catch (error) {
      errorService.handleError(error, 'user_action');
      return {
        correct: false,
        score: 0,
        feedback: 'Erreur lors de l\'évaluation'
      };
    }
  }

  // Obtenir des recommandations de contenu
  async getContentRecommendations(userId: string, limit = 5): Promise<LearningModule[]> {
    try {
      const cacheKey = `recommendations_content_${userId}`;
      const cached = cacheService.get<LearningModule[]>(cacheKey, 'sessionStorage');
      
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .rpc('get_content_recommendations', {
          user_id: userId,
          recommendation_limit: limit
        });

      if (error) throw error;

      const modules = await Promise.all(
        data.map((rec: any) => this.getModule(rec.module_id, userId))
      );

      // Cache pour 2 heures
      cacheService.set(cacheKey, modules, {
        storage: 'sessionStorage',
        ttl: 2 * 60 * 60 * 1000
      });

      return modules;

    } catch (error) {
      errorService.handleError(error, 'api_call');
      return [];
    }
  }

  // Recherche avancée de contenu
  async searchContent(query: string, filters?: {
    type?: string[];
    category?: string[];
    difficulty?: string[];
    duration?: [number, number];
  }): Promise<{
    modules: LearningModule[];
    totalResults: number;
    suggestions: string[];
  }> {
    try {
      const { data, error } = await supabase
        .rpc('search_content', {
          search_query: query,
          content_filters: filters || {}
        });

      if (error) throw error;

      return {
        modules: data.results.map(this.transformModuleData),
        totalResults: data.total_count,
        suggestions: data.suggestions || []
      };

    } catch (error) {
      errorService.handleError(error, 'api_call');
      return {
        modules: [],
        totalResults: 0,
        suggestions: []
      };
    }
  }

  // Générer du contenu avec IA
  async generateContent(type: 'quiz' | 'explanation' | 'case_study', prompt: string, context?: any): Promise<any> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-content', {
        body: {
          type,
          prompt,
          context,
        }
      });

      if (error) throw error;

      return data;

    } catch (error) {
      errorService.handleError(error, 'api_call');
      throw error;
    }
  }

  private async personalizeContent(module: LearningModule, userId: string): Promise<void> {
    try {
      // Récupérer le profil utilisateur pour personnaliser
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('specialty, year_of_study, learning_preferences')
        .eq('id', userId)
        .single();

      if (userProfile) {
        // Ajuster la difficulté selon le niveau
        if (userProfile.year_of_study) {
          module.content.sections = module.content.sections.map(section => ({
            ...section,
            // Personnaliser selon le niveau d'étude
          }));
        }

        // Adapter selon la spécialité
        if (userProfile.specialty) {
          module.content.sections = module.content.sections.filter(section => 
            !section.content.specialtyFilter || 
            section.content.specialtyFilter.includes(userProfile.specialty)
          );
        }
      }

    } catch (error) {
      console.warn('Failed to personalize content:', error);
    }
  }

  private async checkAchievements(userId: string, moduleId: string, progress: any): Promise<void> {
    try {
      await supabase.rpc('check_achievements', {
        user_id: userId,
        module_id: moduleId,
        progress_data: progress
      });
    } catch (error) {
      console.warn('Failed to check achievements:', error);
    }
  }

  private transformModuleData(data: any): LearningModule {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      type: data.type,
      category: data.category,
      difficulty: data.difficulty,
      estimatedDuration: data.estimated_duration,
      prerequisites: data.prerequisites || [],
      objectives: data.objectives || [],
      content: {
        sections: data.module_content?.content_sections || [],
        resources: data.module_content?.resources || [],
        assessments: data.module_content?.assessments || [],
        interactive: data.module_content?.interactive_elements || [],
      },
      metadata: {
        author: data.module_metadata?.author || '',
        created: data.created_at,
        updated: data.updated_at,
        version: data.module_metadata?.version || '1.0',
        tags: data.module_metadata?.tags || [],
        reviewStatus: data.module_metadata?.review_status || 'approved',
        expertValidation: data.module_metadata?.expert_validation || false,
      },
      analytics: {
        enrollments: data.module_analytics?.enrollments || 0,
        completions: data.module_analytics?.completions || 0,
        avgScore: data.module_analytics?.avg_score || 0,
        avgDuration: data.module_analytics?.avg_duration || 0,
        satisfactionRating: data.module_analytics?.satisfaction_rating || 0,
        commonMistakes: data.module_analytics?.common_mistakes || [],
      },
    };
  }

  private transformStudyPlanData(data: any): StudyPlan {
    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      targetDate: data.target_date,
      modules: data.planned_modules || [],
      adaptiveSettings: data.adaptive_settings || {
        difficultyAdjustment: true,
        paceAdjustment: true,
        contentPersonalization: true,
        reminderFrequency: 'daily'
      },
      progress: data.plan_progress || {
        completedModules: 0,
        totalModules: 0,
        currentStreak: 0,
        estimatedCompletion: '',
        adherenceRate: 0
      },
    };
  }
}

export const contentService = ContentService.getInstance();
export default contentService;