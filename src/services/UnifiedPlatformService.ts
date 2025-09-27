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
        logger.error('Failed to fetch EDN items', { context: { error: error.message } });
        return { success: false, error: error.message };
      }

      return { success: true, data: data as EdnItem[] };
    } catch (error) {
      logger.error('Critical error fetching EDN items', { context: { error } });
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
        logger.error('Failed to fetch EDN item', { context: { itemCode, error: error.message } });
        return { success: false, error: error.message };
      }

      return { success: true, data: data as EdnItem };
    } catch (error) {
      logger.error('Critical error fetching EDN item', { context: { itemCode, error } });
      return { success: false, error: 'Une erreur inattendue s\'est produite' };
    }
  }

  // Music Generation Management
  async generateMusic(request: GenerationRequest): Promise<ApiResponse<GenerationResponse>> {
    try {
      logger.info('Starting music generation', { 
        context: { 
          type: request.type, 
          itemCode: request.item_code,
          userId: request.user_id 
        } 
      });

      const { data, error } = await supabase.functions.invoke('med-mng-api', {
        body: {
          action: 'generate-music',
          ...request
        }
      });

      if (error) {
        logger.error('Music generation failed', { context: { error: error.message, request } });
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      logger.error('Critical error in music generation', { context: { error, request } });
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
        logger.error('Failed to fetch music tracks', { context: { userId, error: error.message } });
        return { success: false, error: error.message };
      }

      return { success: true, data: data as MusicTrack[] };
    } catch (error) {
      logger.error('Critical error fetching music tracks', { context: { userId, error } });
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
        logger.error('Failed to fetch user profile', { context: { userId, error: error.message } });
        return { success: false, error: error.message };
      }

      return { success: true, data: data as User };
    } catch (error) {
      logger.error('Critical error fetching user profile', { context: { userId, error } });
      return { success: false, error: 'Une erreur inattendue s\'est produite' };
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update user profile', { context: { userId, error: error.message } });
        return { success: false, error: error.message };
      }

      logger.info('User profile updated successfully', { context: { userId } });
      return { success: true, data: data as User };
    } catch (error) {
      logger.error('Critical error updating user profile', { context: { userId, error } });
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
        context: { 
          action, 
          userId, 
          metadata 
        } 
      });
    } catch (error) {
      logger.error('Failed to track user action', { context: { action, userId, error } });
    }
  }
}

// Export singleton instance
export const platformService = UnifiedPlatformService.getInstance();