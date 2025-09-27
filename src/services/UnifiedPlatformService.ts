/**
 * Service unifié pour la plateforme MED-MNG
 * Remplace les services dupliqués et centralise la logique métier
 */

import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';
import { 
  EdnItem, 
  MusicTrack, 
  GenerationRequest, 
  GenerationResponse,
  User,
  ApiResponse 
} from '@/types';

export class UnifiedPlatformService {
  private static instance: UnifiedPlatformService;

  static getInstance(): UnifiedPlatformService {
    if (!UnifiedPlatformService.instance) {
      UnifiedPlatformService.instance = new UnifiedPlatformService();
    }
    return UnifiedPlatformService.instance;
  }

  // EDN Items Management
  async getEdnItems(): Promise<ApiResponse<EdnItem[]>> {
    try {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch EDN items', { component: 'UnifiedPlatformService', action: 'getEdnItems', metadata: { error: error.message } });
        return { success: false, error: error.message };
      }

      // Map database fields to our EdnItem type
      const mappedData: EdnItem[] = data.map(item => ({
        id: item.id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        item_code: item.item_code || '',
        title: item.title || '',
        description: item.subtitle || undefined,
        tableau_rang_a: (item.tableau_rang_a as Record<string, unknown>) || undefined,
        tableau_rang_b: (item.tableau_rang_b as Record<string, unknown>) || undefined,
        paroles_musicales: item.paroles_musicales || undefined,
        quiz_questions: (item.quiz_questions as Record<string, unknown>) || undefined,
        scene_immersive: (item.scene_immersive as Record<string, unknown>) || undefined,
        is_premium: false, // Default value since field doesn't exist in DB
        content_status: 'published' as const, // Default value since field doesn't exist in DB
        theme: item.slug || undefined
      }));

      return { success: true, data: mappedData };
    } catch (error) {
      logger.error('Critical error fetching EDN items', { component: 'UnifiedPlatformService', action: 'getEdnItems', metadata: { error } });
      return { success: false, error: 'Une erreur inattendue s\'est produite' };
    }
  }

  async getEdnItem(itemCode: string): Promise<ApiResponse<EdnItem>> {
    try {
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .eq('item_code', itemCode)
        .single();

      if (error) {
        logger.error('Failed to fetch EDN item', { component: 'UnifiedPlatformService', action: 'getEdnItem', itemCode, metadata: { error: error.message } });
        return { success: false, error: error.message };
      }

      // Map database fields to our EdnItem type
      const mappedData: EdnItem = {
        id: data.id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        item_code: data.item_code || '',
        title: data.title || '',
        description: data.subtitle || undefined,
        tableau_rang_a: (data.tableau_rang_a as Record<string, unknown>) || undefined,
        tableau_rang_b: (data.tableau_rang_b as Record<string, unknown>) || undefined,
        paroles_musicales: data.paroles_musicales || undefined,
        quiz_questions: (data.quiz_questions as Record<string, unknown>) || undefined,
        scene_immersive: (data.scene_immersive as Record<string, unknown>) || undefined,
        is_premium: false, // Default value since field doesn't exist in DB
        content_status: 'published' as const, // Default value since field doesn't exist in DB
        theme: data.slug || undefined
      };

      return { success: true, data: mappedData };
    } catch (error) {
      logger.error('Critical error fetching EDN item', { component: 'UnifiedPlatformService', action: 'getEdnItem', itemCode, metadata: { error } });
      return { success: false, error: 'Une erreur inattendue s\'est produite' };
    }
  }

  // Music Generation Management
  async generateMusic(request: GenerationRequest): Promise<ApiResponse<GenerationResponse>> {
    try {
      logger.info('Starting music generation', { 
        component: 'UnifiedPlatformService',
        action: 'generateMusic',
        itemCode: request.item_code,
        userId: request.user_id,
        metadata: { type: request.type }
      });

      const { data, error } = await supabase.functions.invoke('med-mng-api', {
        body: {
          action: 'generate-music',
          ...request
        }
      });

      if (error) {
        logger.error('Music generation failed', { component: 'UnifiedPlatformService', action: 'generateMusic', metadata: { error: error.message, request } });
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      logger.error('Critical error in music generation', { component: 'UnifiedPlatformService', action: 'generateMusic', metadata: { error, request } });
      return { success: false, error: 'Erreur lors de la génération musicale' };
    }
  }

  async getMusicTracks(userId: string): Promise<ApiResponse<MusicTrack[]>> {
    try {
      const { data, error } = await supabase
        .from('generated_music_tracks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Failed to fetch music tracks', { component: 'UnifiedPlatformService', action: 'getMusicTracks', userId, metadata: { error: error.message } });
        return { success: false, error: error.message };
      }

      // Map database fields to our MusicTrack type
      const mappedData: MusicTrack[] = data.map(track => ({
        id: track.id,
        created_at: track.created_at,
        updated_at: track.updated_at,
        title: track.title || 'Untitled',
        artist: undefined,
        duration: track.duration || 0,
        audio_url: track.audio_url,
        lyrics: undefined,
        genre: 'Generated',
        is_generated: true,
        generation_status: (track.generation_status as 'pending' | 'processing' | 'completed' | 'failed') || 'completed',
        metadata: (track.metadata as Record<string, unknown>) || {},
        rang: undefined
      }));

      return { success: true, data: mappedData };
    } catch (error) {
      logger.error('Critical error fetching music tracks', { component: 'UnifiedPlatformService', action: 'getMusicTracks', userId, metadata: { error } });
      return { success: false, error: 'Une erreur inattendue s\'est produite' };
    }
  }

  // User Management
  async getUserProfile(userId: string): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('Failed to fetch user profile', { component: 'UnifiedPlatformService', action: 'getUserProfile', userId, metadata: { error: error.message } });
        return { success: false, error: error.message };
      }

      // Map database fields to our User type
      const mappedData: User = {
        id: data.id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        email: data.email || '',
        name: data.name,
        role: (data.role as 'admin' | 'user' | 'moderator') || 'user',
        subscription_status: (data.subscription_plan as 'active' | 'inactive' | 'trial') || 'inactive',
        preferences: data.preferences ? data.preferences as any : {
          theme: 'system' as const,
          language: 'fr' as const,
          notifications: true,
          auto_play: false,
          volume: 0.8
        }
      };

      return { success: true, data: mappedData };
    } catch (error) {
      logger.error('Critical error fetching user profile', { component: 'UnifiedPlatformService', action: 'getUserProfile', userId, metadata: { error } });
      return { success: false, error: 'Une erreur inattendue s\'est produite' };
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      // Convert User updates to database format
      const dbUpdates: any = { ...updates };
      if (updates.preferences) {
        dbUpdates.preferences = updates.preferences as any;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update user profile', { component: 'UnifiedPlatformService', action: 'updateUserProfile', userId, metadata: { error: error.message } });
        return { success: false, error: error.message };
      }

      logger.info('User profile updated successfully', { component: 'UnifiedPlatformService', action: 'updateUserProfile', userId });
      
      // Map database response to our User type
      const mappedData: User = {
        id: data.id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        email: data.email || '',
        name: data.name,
        role: (data.role as 'admin' | 'user' | 'moderator') || 'user',
        subscription_status: (data.subscription_plan as 'active' | 'inactive' | 'trial') || 'inactive',
        preferences: data.preferences ? data.preferences as any : {
          theme: 'system' as const,
          language: 'fr' as const,
          notifications: true,
          auto_play: false,
          volume: 0.8
        }
      };

      return { success: true, data: mappedData };
    } catch (error) {
      logger.error('Critical error updating user profile', { component: 'UnifiedPlatformService', action: 'updateUserProfile', userId, metadata: { error } });
      return { success: false, error: 'Une erreur inattendue s\'est produite' };
    }
  }

  // Analytics and Monitoring
  async trackUserAction(action: string, userId: string, metadata?: Record<string, unknown>): Promise<void> {
    try {
      await supabase.functions.invoke('med-mng-api', {
        body: {
          action: 'track-user-action',
          userId,
          actionType: action,
          metadata
        }
      });

      logger.info('User action tracked', { 
        component: 'UnifiedPlatformService',
        action: 'trackUserAction',
        userId,
        metadata: { actionType: action, data: metadata }
      });
    } catch (error) {
      logger.error('Failed to track user action', { component: 'UnifiedPlatformService', action: 'trackUserAction', userId, metadata: { actionType: action, error } });
    }
  }
}

// Export singleton instance
export const platformService = UnifiedPlatformService.getInstance();