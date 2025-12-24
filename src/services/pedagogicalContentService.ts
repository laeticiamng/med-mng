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
  averageGenerationTime: number;
  successRate: number;
  popularItems: string[];
  trendsThisWeek: {
    generated: number;
    viewed: number;
    shared: number;
  };
}

export interface ContentQualityMetrics {
  contentId: string;
  readabilityScore: number;
  accuracyScore: number;
  engagementScore: number;
  overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
  suggestions: string[];
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
      console.error('Error fetching pedagogical content:', error);
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
      console.error('Error generating missing content:', error);
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
      console.error('Error fetching content analytics:', error);
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
        console.error('Error fetching item content:', error);
        return null;
      }

      return data;
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
      const { data, error } = await supabase
        .from('med_mng_content_ai')
        .select('*')
        .or(`title.ilike.%${query}%,item_id.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching content:', error);
      return [];
    }
  }

  async deleteContent(contentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('med_mng_content_ai')
        .delete()
        .eq('id', contentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting content:', error);
      return false;
    }
  }

  async getRecentGenerations(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('med_mng_content_ai')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
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

  // Get content quality metrics
  async getContentQuality(contentId: string): Promise<ContentQualityMetrics | null> {
    try {
      const { data, error } = await supabase
        .from('med_mng_content_ai')
        .select('*')
        .eq('id', contentId)
        .maybeSingle();

      if (error || !data) return null;

      // Calculate basic quality metrics
      const content = data.content || '';
      const wordCount = content.split(/\s+/).length;

      const readabilityScore = Math.min(100, Math.max(0, wordCount > 100 ? 80 : wordCount * 0.8));
      const accuracyScore = data.status === 'completed' ? 85 : 50;
      const engagementScore = Math.random() * 20 + 70; // Placeholder

      const overallScore = (readabilityScore + accuracyScore + engagementScore) / 3;
      const overallQuality: ContentQualityMetrics['overallQuality'] =
        overallScore >= 80 ? 'excellent' :
        overallScore >= 65 ? 'good' :
        overallScore >= 50 ? 'fair' : 'poor';

      const suggestions: string[] = [];
      if (wordCount < 200) suggestions.push('Enrichir le contenu avec plus de détails');
      if (readabilityScore < 70) suggestions.push('Améliorer la lisibilité du texte');
      if (!data.images || data.images.length === 0) suggestions.push('Ajouter des illustrations');

      return {
        contentId,
        readabilityScore: Math.round(readabilityScore),
        accuracyScore: Math.round(accuracyScore),
        engagementScore: Math.round(engagementScore),
        overallQuality,
        suggestions
      };
    } catch (error) {
      console.error('Error getting content quality:', error);
      return null;
    }
  }

  // Batch generate content for multiple items
  async batchGenerateContent(itemCodes: string[], contentType: 'comic' | 'novel' | 'poem'): Promise<{
    success: number;
    failed: number;
    results: Array<{ itemCode: string; success: boolean; error?: string }>;
  }> {
    const results: Array<{ itemCode: string; success: boolean; error?: string }> = [];
    let success = 0;
    let failed = 0;

    for (const itemCode of itemCodes) {
      try {
        await this.generateMissingContent(itemCode);
        results.push({ itemCode, success: true });
        success++;
      } catch (error) {
        results.push({ itemCode, success: false, error: String(error) });
        failed++;
      }
    }

    return { success, failed, results };
  }

  // Get content statistics by specialty
  async getContentBySpecialty(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('med_mng_content_ai')
        .select('item_id');

      if (error) throw error;

      const bySpecialty: Record<string, number> = {};
      (data || []).forEach((item: any) => {
        // Extract specialty from item_id pattern (e.g., IC-001 -> IC)
        const specialty = item.item_id?.split('-')[0] || 'Unknown';
        bySpecialty[specialty] = (bySpecialty[specialty] || 0) + 1;
      });

      return bySpecialty;
    } catch (error) {
      console.error('Error getting content by specialty:', error);
      return {};
    }
  }

  // Get trending content
  async getTrendingContent(limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('med_mng_content_ai')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting trending content:', error);
      return [];
    }
  }

  // Export content to different formats
  async exportContent(contentId: string, format: 'json' | 'markdown' | 'pdf'): Promise<string | Blob | null> {
    try {
      const { data, error } = await supabase
        .from('med_mng_content_ai')
        .select('*')
        .eq('id', contentId)
        .maybeSingle();

      if (error || !data) return null;

      switch (format) {
        case 'json':
          return JSON.stringify(data, null, 2);
        case 'markdown':
          return `# ${data.title || 'Content'}\n\n${data.content || ''}\n\n---\n*Generated on ${new Date(data.created_at).toLocaleDateString()}*`;
        case 'pdf':
          // Return markdown for PDF generation (would need external library)
          return `# ${data.title || 'Content'}\n\n${data.content || ''}`;
        default:
          return null;
      }
    } catch (error) {
      console.error('Error exporting content:', error);
      return null;
    }
  }

  // Validate content before saving
  validateContent(content: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!content.item_id) errors.push('Item ID is required');
    if (!content.content_type) errors.push('Content type is required');
    if (!content.content || content.content.length < 50) {
      errors.push('Content must be at least 50 characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const pedagogicalContentService = new PedagogicalContentService();