import { supabase } from "@/integrations/supabase/client";
import { toRateLimitError } from "@/utils/errors/rateLimit";
import { errorService } from '@/services/core/ErrorService';

export interface ContentMetadata {
  total_contents: number;
  last_generated: number | null;
  generation_stats: {
    comic: number;
    novel: number;
    poem: number;
  };
}

export interface PedagogicalContent {
  bande_dessinee: any | null;
  roman: any | null;
  poeme: any | null;
  metadata: ContentMetadata;
}

export interface ContentAnalytics {
  total_content: number;
  by_type: {
    comic: number;
    novel: number;
    poem: number;
  };
  by_status: {
    completed: number;
    generating: number;
    error: number;
  };
  recent_generations: Array<{
    content_type: string;
    status: string;
    created_at: string;
    item_id: string;
  }>;
  unique_items: number;
}

export interface GenerationResult {
  generated: Array<{
    type: string;
    success: boolean;
    data?: any;
    error?: string;
  }>;
  missing_count: number;
  success_count: number;
}

class PedagogicalContentService {
  async getContent(itemCode: string): Promise<PedagogicalContent> {
    const { data, error } = await supabase.functions.invoke('pedagogical-content-api', {
      body: null,
      method: 'GET',
    });

    if (error) {
      errorService.handleError(error instanceof Error ? error : new Error('Error fetching pedagogical content'), 'api_call');
      const rateLimitError = toRateLimitError(error, 'Contenu temporairement indisponible.', 'comic');
      if (rateLimitError) {
        throw rateLimitError;
      }
      throw new Error('Failed to fetch content');
    }

    return data;
  }

  async generateMissingContent(itemCode: string): Promise<GenerationResult> {
    const { data, error } = await supabase.functions.invoke('pedagogical-content-api', {
      body: { itemCode },
      method: 'POST',
    });

    if (error) {
      errorService.handleError(error instanceof Error ? error : new Error('Error generating missing content'), 'api_call');
      const rateLimitError = toRateLimitError(error, 'Trop de générations de bande dessinée. Réessayez plus tard.', 'comic');
      if (rateLimitError) {
        throw rateLimitError;
      }
      throw new Error('Failed to generate content');
    }

    return data;
  }

  async getContentAnalytics(): Promise<ContentAnalytics> {
    const { data, error } = await supabase.functions.invoke('pedagogical-content-api', {
      body: null,
      method: 'GET',
    });

    if (error) {
      errorService.handleError(error instanceof Error ? error : new Error('Error fetching content analytics'), 'api_call');
      const rateLimitError = toRateLimitError(error, 'Analytics temporairement indisponibles.', 'comic');
      if (rateLimitError) {
        throw rateLimitError;
      }
      throw new Error('Failed to fetch analytics');
    }

    return data;
  }

  async getItemContent(itemCode: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('med_mng_content_ai')
        .select('*')
        .eq('item_id', itemCode);

      if (error) {
        errorService.handleError(error instanceof Error ? error : new Error('Error fetching item content'), 'api_call');
        return null;
      }

      return data;
    } catch (error) {
      errorService.handleError(error instanceof Error ? error : new Error('Exception fetching item content'), 'api_call');
      return null;
    }
  }

  async updateContentProgress(itemId: string, contentType: string, progress: number): Promise<void> {
    // Simplified implementation without direct Supabase calls to avoid type issues
    if (import.meta.env.DEV) {
      errorService.handleInfo('Progress updated', 'system', { itemId, contentType, progress });
    }
  }

  getContentTypeColor(type: string) {
    const colors = {
      comic: 'bg-blue-500',
      novel: 'bg-green-500', 
      poem: 'bg-purple-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  }

  getContentTypeIcon(type: string) {
    const icons = {
      comic: '🎨',
      novel: '📚',
      poem: '✨'
    };
    return icons[type as keyof typeof icons] || '📄';
  }

  formatContentTitle(type: string) {
    const titles = {
      comic: 'Bande Dessinée',
      novel: 'Roman',
      poem: 'Poème'
    };
    return titles[type as keyof typeof titles] || 'Contenu';
  }
}

export const pedagogicalContentService = new PedagogicalContentService();