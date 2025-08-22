import { MusicGenerationRequest, MusicGenerationResponse, GenerationStatus } from '@med-music/types';
import { createClient } from '@supabase/supabase-js';

export class MusicGenerationService {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Generate music using Suno AI
   */
  async generateMusic(request: MusicGenerationRequest): Promise<MusicGenerationResponse> {
    try {
      const { data, error } = await this.supabase.functions.invoke('generate-music', {
        body: {
          lyrics: request.lyrics,
          style: request.style,
          duration: request.duration,
          rang: request.rang,
          language: request.language || 'fr',
          itemCode: request.itemCode
        }
      });

      if (error) {
        throw new Error(`Music generation failed: ${error.message}`);
      }

      return {
        success: true,
        trackId: data.trackId,
        message: 'Music generation started successfully'
      };
    } catch (error) {
      console.error('Music generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Check generation status
   */
  async checkGenerationStatus(trackId: string): Promise<GenerationStatus> {
    try {
      const { data, error } = await this.supabase.functions.invoke('music-status', {
        body: { taskId: trackId }
      });

      if (error) {
        throw new Error(`Status check failed: ${error.message}`);
      }

      return {
        taskId: trackId,
        status: data.status,
        progress: data.progress || 0,
        audioUrl: data.audioUrl,
        imageUrl: data.imageUrl,
        error: data.error
      };
    } catch (error) {
      console.error('Status check error:', error);
      return {
        taskId,
        status: 'error',
        progress: 0,
        error: error instanceof Error ? error.message : 'Status check failed'
      };
    }
  }

  /**
   * Save generated music to library
   */
  async saveToLibrary(trackId: string, title: string, metadata: Record<string, any> = {}) {
    try {
      const { data, error } = await this.supabase
        .from('user_generated_music')
        .insert({
          track_id: trackId,
          title,
          metadata,
          user_id: (await this.supabase.auth.getUser()).data.user?.id
        });

      if (error) {
        throw new Error(`Failed to save to library: ${error.message}`);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Save to library error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save to library'
      };
    }
  }
}

export { MusicGenerationService as default };