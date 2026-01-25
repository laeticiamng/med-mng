import { supabase } from "@/integrations/supabase/client";

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
  async getContent(_itemCode: string): Promise<PedagogicalContent> {
    const { _data, error } = await supabase.functions.invoke('pedagogical-content-api', {
      body: null,
      method: 'GET',
    });

    if (error) {
      console.error('Error fetching pedagogical content:', error);
      throw new Error('Failed to fetch content');
    }

    return _data;
  }

  async generateMissingContent(itemCode: string): Promise<GenerationResult> {
    const { _data, error } = await supabase.functions.invoke('pedagogical-content-api', {
      body: { itemCode },
      method: 'POST',
    });

    if (error) {
      console.error('Error generating missing content:', error);
      throw new Error('Failed to generate content');
    }

    return _data;
  }

  async getContentAnalytics(): Promise<ContentAnalytics> {
    const { _data, error } = await supabase.functions.invoke('pedagogical-content-api', {
      body: null,
      method: 'GET',
    });

    if (error) {
      console.error('Error fetching content analytics:', error);
      throw new Error('Failed to fetch analytics');
    }

    return _data;
  }

  async getItemContent(itemCode: string): Promise<any> {
    try {
      const { _data, _error } = await supabase
        .from('med_mng_content_ai')
        .select('*')
        .eq('item_id', itemCode);

      if (_error) {
        console.error('Error fetching item content:', _error);
        return null;
      }

      return _data;
    } catch (error) {
      console.error('Exception fetching item content:', error);
      return null;
    }
  }

  async updateContentProgress(itemId: string, contentType: string, progress: number): Promise<void> {
    try {
      const { data: existing, error: fetchError } = await (supabase as any)
        .from('med_mng_content_ai')
        .select('id, generation_status')
        .eq('item_id', itemId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      const updatedData = {
        progress,
        last_progress_update: new Date().toISOString()
      };

      if (existing) {
        await (supabase as any)
          .from('med_mng_content_ai')
          .update({ generation_status: JSON.stringify(updatedData) })
          .eq('id', existing.id);
      }

      console.log('Progress updated:', { itemId, contentType, progress });
    } catch (error) {
      console.error('Error updating content progress:', error);
    }
  }

  async getContentByType(contentType: 'comic' | 'novel' | 'poem', limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('med_mng_content_ai')
        .select('*')
        .eq('content_type', contentType)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching content by type:', error);
      return [];
    }
  }

  async searchContent(query: string, limit: number = 20): Promise<any[]> {
    try {
      const { _data, _error } = await supabase
        .from('med_mng_content_ai')
        .select('*')
        .or(`title.ilike.%${query}%,item_id.ilike.%${query}%`)
        .limit(limit);

      if (_error) throw _error;
      return _data || [];
    } catch (error) {
      console.error('Error searching content:', error);
      return [];
    }
  }

  async deleteContent(contentId: string): Promise<boolean> {
    try {
      const { _error } = await supabase
        .from('med_mng_content_ai')
        .delete()
        .eq('id', contentId);

      if (_error) throw _error;
      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      return false;
    }
  }

  async getRecentGenerations(limit: number = 10): Promise<any[]> {
    try {
      const { _data, _error } = await supabase
        .from('med_mng_content_ai')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (_error) throw _error;
      return _data || [];
    } catch (error) {
      console.error('Error fetching recent generations:', error);
      return [];
    }
  }

  getContentTypeColor(type: string) {
    const colors = {
      comic: 'bg-primary',
      novel: 'bg-success', 
      poem: 'bg-accent'
    };
    return colors[type as keyof typeof colors] || 'bg-muted';
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