import logger from '@/lib/logger';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MasterContent {
  id: string;
  item_id: string;
  comic_data?: any;
  novel_data?: any;
  poem_data?: any;
  images_data?: any;
  generated_at: string;
  generation_version: string;
  approved_by?: string;
  approved_at?: string;
  views_count: number;
  unique_viewers_count: number;
  avg_reading_time: number;
  quality_score: number;
  has_lyrics_sync: boolean;
  content_size_kb: number;
}

export interface ContentStats {
  total_views: number;
  unique_items: number;
  avg_duration: number;
  completion_rate: number;
  by_content_type: Record<string, number>;
  by_item: Record<string, number>;
  timeframe: string;
  period: string;
}

export const useContentMaster = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMasterContent = async (itemId: string, contentType?: string): Promise<MasterContent | null> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ item_id: itemId });
      if (contentType) params.append('content_type', contentType);

      const { data, error } = await supabase.functions.invoke('content-master-api/get-master-content', {
        method: 'GET'
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erreur récupération contenu');
      }

      return data.content;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMsg);
      logger.error('❌ Erreur getMasterContent:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const trackContentView = async (
    itemId: string, 
    contentType: string, 
    viewDuration = 0, 
    completed = false, 
    completionPercentage = 0
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('content-master-api/track-view', {
        body: {
          item_id: itemId,
          content_type: contentType,
          view_duration: viewDuration,
          completed,
          completion_percentage: completionPercentage
        }
      });

      if (error) throw error;
      return data.success;
    } catch (err) {
      logger.error('❌ Erreur trackContentView:', err);
      return false;
    }
  };

  const generateMasterContent = async (
    itemId: string, 
    contentTypes: string[], 
    regenerate = false
  ): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('content-master-api/generate-content', {
        body: {
          item_id: itemId,
          content_types: contentTypes,
          regenerate
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erreur génération contenu');
      }

      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMsg);
      logger.error('❌ Erreur generateMasterContent:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getContentStats = async (itemId?: string, timeframe = '7d'): Promise<ContentStats | null> => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ timeframe });
      if (itemId) params.append('item_id', itemId);

      const { data, error } = await supabase.functions.invoke('content-master-api/get-stats', {
        method: 'GET'
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erreur récupération stats');
      }

      return data.stats;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMsg);
      logger.error('❌ Erreur getContentStats:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getMasterContent,
    trackContentView,
    generateMasterContent,
    getContentStats
  };
};