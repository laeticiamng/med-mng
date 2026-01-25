import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIRecommendation {
  reason: string;
  genre: string;
  mood: string;
  specialty: string;
  confidence: number;
}

interface RecommendationAnalysis {
  recommendations: AIRecommendation[];
  listening_pattern: string;
  suggestions: string[];
}

export const useAIRecommendations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendationAnalysis | null>(null);
  const { toast } = useToast();

  const generateRecommendations = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { _data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: { action: 'generate_recommendations' }
      });

      if (error) throw error;

      setRecommendations(_data);
      toast({
        title: "Recommandations générées !",
        description: "Vos recommandations personnalisées sont prêtes."
      });

      return _data;
    } catch (error) {
      console.error('Erreur génération recommandations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer les recommandations.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getPersonalizedPlaylist = useCallback(async (params: {
    specialty?: string;
    mood?: string;
    study_context: string;
  }) => {
    try {
      setIsLoading(true);
      
      const { _data, error } = await supabase.functions.invoke('ai-recommendations', {
        body: { 
          action: 'get_personalized_playlist',
          ...params
        }
      });

      if (error) throw error;

      return _data;
    } catch (error) {
      console.error('Erreur playlist personnalisée:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la playlist personnalisée.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const saveUserPreferences = useCallback(async (preferences: {
    preferred_genres?: string[];
    preferred_moods?: string[];
    medical_specialties?: string[];
    study_schedule?: object;
    learning_style?: string;
  }) => {
    try {
      const { _error } = await supabase
        .from('med_mng_user_preferences' as any)
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          ...preferences,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (_error) throw _error;

      toast({
        title: "Préférences sauvegardées !",
        description: "Vos préférences ont été mises à jour."
      });
    } catch (error) {
      console.error('Erreur sauvegarde préférences:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    isLoading,
    recommendations,
    generateRecommendations,
    getPersonalizedPlaylist,
    saveUserPreferences
  };
};