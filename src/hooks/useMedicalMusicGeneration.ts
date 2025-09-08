import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MusicGenerationRequest {
  lyrics: string[];
  style: string;
  duration: number;
  rang: 'A' | 'B' | 'AB';
  itemCode?: string;
  title?: string;
}

export interface MusicGenerationResult {
  success: boolean;
  generationId?: string;
  audioUrl?: string;
  imageUrl?: string;
  trackId?: string;
  enhancedLyrics?: string;
  error?: string;
}

export interface QuotaInfo {
  can_generate: boolean;
  current_usage: number;
  quota_limit: number;
  plan_name: string;
}

export const useMedicalMusicGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<MusicGenerationResult | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  
  const { toast } = useToast();

  const checkQuota = useCallback(async (): Promise<QuotaInfo | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('check_music_generation_quota', {
        user_uuid: user.id
      });

      if (error) throw error;
      
      const quota = data?.[0];
      setQuotaInfo(quota);
      return quota;
    } catch (error) {
      console.error('Quota check error:', error);
      toast({
        title: "Erreur quota",
        description: "Impossible de vérifier le quota",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  const generateMusic = useCallback(async (request: MusicGenerationRequest): Promise<MusicGenerationResult> => {
    setIsGenerating(true);
    setGenerationResult(null);

    try {
      // Validate request
      if (!request.style || request.lyrics.filter(l => l.trim()).length === 0) {
        throw new Error('Style et paroles requis');
      }

      // Check quota first
      const quota = await checkQuota();
      if (!quota?.can_generate) {
        throw new Error(`Quota dépassé (${quota?.current_usage}/${quota?.quota_limit})`);
      }

      // Call secure generation function
      const { data, error } = await supabase.functions.invoke('secure-music-generation', {
        body: {
          lyrics: request.lyrics.filter(l => l.trim()),
          style: request.style,
          duration: request.duration,
          rang: request.rang,
          itemCode: request.itemCode || undefined,
          title: request.title || undefined
        }
      });

      if (error) throw error;

      const result: MusicGenerationResult = data;
      setGenerationResult(result);

      if (result.success) {
        toast({
          title: "Musique générée !",
          description: "Votre musique médicale est prête",
        });
        
        // Refresh quota
        await checkQuota();
      } else {
        throw new Error(result.error || 'Erreur de génération');
      }

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      const errorResult: MusicGenerationResult = {
        success: false,
        error: errorMessage
      };
      
      setGenerationResult(errorResult);
      
      toast({
        title: "Erreur de génération",
        description: errorMessage,
        variant: "destructive"
      });

      return errorResult;
    } finally {
      setIsGenerating(false);
    }
  }, [checkQuota, toast]);

  const getGenerationHistory = useCallback(async (limit: number = 20) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('med_mng_music_generations' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('History fetch error:', error);
      toast({
        title: "Erreur historique",
        description: "Impossible de charger l'historique",
        variant: "destructive"
      });
      return [];
    }
  }, [toast]);

  const deleteGeneration = useCallback(async (generationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('med_mng_music_generations' as any)
        .delete()
        .eq('id', generationId);

      if (error) throw error;

      toast({
        title: "Suppression réussie",
        description: "La génération a été supprimée"
      });

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Erreur suppression",
        description: "Impossible de supprimer la génération",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  return {
    // State
    isGenerating,
    generationResult,
    quotaInfo,
    
    // Actions
    generateMusic,
    checkQuota,
    getGenerationHistory,
    deleteGeneration,
    
    // Utilities
    clearResult: () => setGenerationResult(null)
  };
};