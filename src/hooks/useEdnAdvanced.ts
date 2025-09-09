/**
 * Hook avancé pour la gestion des données EDN en production
 * Connexion directe aux APIs Supabase pour mise en production
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EdnAdvancedItem {
  id: string;
  item_code: string;
  title: string;
  slug: string;
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  scene_immersive?: any;
  quiz_questions?: any;
  paroles_musicales?: string[];
  competences_oic_rang_a?: any;
  competences_oic_rang_b?: any;
  interaction_config?: any;
  audio_ambiance?: any;
  visual_ambiance?: any;
  payload_v2?: any;
}

export interface MusicGenerationResponse {
  audioUrl?: string;
  trackId?: string;
  status: string;
  error?: string;
}

export const useEdnAdvanced = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Génération musicale via Suno API (production)
   */
  const generateMusic = useCallback(async (
    item: EdnAdvancedItem,
    options: {
      style?: string;
      duration?: number;
      rang?: 'A' | 'B';
    } = {}
  ): Promise<MusicGenerationResponse | null> => {
    if (!item.paroles_musicales || item.paroles_musicales.length === 0) {
      setError('Paroles manquantes pour la génération musicale');
      toast({
        title: "Erreur",
        description: "Aucunes paroles disponibles pour cet item",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase.functions.invoke('suno-music-optimized', {
        body: {
          lyrics: item.paroles_musicales.join('\n'),
          title: `${item.item_code} - ${item.title}`,
          style: options.style || 'medical ambient educational',
          duration: options.duration || 120,
          rang: options.rang || 'A',
          fastMode: true,
          optimized: true
        }
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      toast({
        title: "Génération réussie",
        description: "La musique a été générée avec succès",
        variant: "default"
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      toast({
        title: "Erreur de génération",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Chargement d'un item EDN complet (production)
   */
  const loadEdnItem = useCallback(async (slug: string): Promise<EdnAdvancedItem | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('edn_items_complete')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (!data) {
        setError('Item EDN non trouvé');
        return null;
      }

      return data as EdnAdvancedItem;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement';
      setError(errorMessage);
      toast({
        title: "Erreur de chargement",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Sauvegarde des progrès utilisateur (production)
   */
  const saveProgress = useCallback(async (
    itemId: string,
    section: string,
    progress: any
  ): Promise<boolean> => {
    try {
      // Use existing user sessions table or similar for progress tracking
      const { error } = await supabase
        .from('user_sessions')
        .upsert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          session_data: {
            item_id: itemId,
            section,
            progress_data: progress,
            completed_at: progress.completed ? new Date().toISOString() : null
          },
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (err) {
      console.error('Erreur sauvegarde progrès:', err);
      return false;
    }
  }, []);

  /**
   * Génération de contenu IA via OpenAI (production)
   */
  const generateAIContent = useCallback(async (
    type: 'scene' | 'quiz' | 'bd',
    item: EdnAdvancedItem,
    prompt?: string
  ): Promise<any> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase.functions.invoke('openai-content-generator', {
        body: {
          type,
          itemCode: item.item_code,
          title: item.title,
          tableauA: item.tableau_rang_a,
          tableauB: item.tableau_rang_b,
          customPrompt: prompt
        }
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur génération IA';
      setError(errorMessage);
      toast({
        title: "Erreur génération IA",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    error,
    generateMusic,
    loadEdnItem,
    saveProgress,
    generateAIContent,
    clearError: () => setError(null)
  };
};