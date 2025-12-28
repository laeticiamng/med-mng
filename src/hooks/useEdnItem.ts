
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEdnItemV2Process } from './useEdnItemV2Process';

interface EdnItemData {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  paroles_musicales?: string[];
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  scene_immersive?: any;
  quiz_questions?: any;
  created_at: string;
  updated_at: string;
  payload_v2?: any;
  category?: string;
  has_music?: boolean;
  has_lyrics?: boolean;
  competences_count?: number;
}

interface EdnItemStats {
  hasRangA: boolean;
  hasRangB: boolean;
  hasScene: boolean;
  hasQuiz: boolean;
  hasLyrics: boolean;
  completenessScore: number;
  quizQuestionsCount: number;
}

export const useEdnItem = (slug: string | undefined) => {
  const [rawItem, setRawItem] = useState<EdnItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<EdnItemStats | null>(null);

  // Process the item with V2 compatibility
  const item = useEdnItemV2Process(rawItem);

  const calculateStats = useCallback((data: EdnItemData): EdnItemStats => {
    const hasRangA = Boolean(data.tableau_rang_a && Object.keys(data.tableau_rang_a).length > 0);
    const hasRangB = Boolean(data.tableau_rang_b && Object.keys(data.tableau_rang_b).length > 0);
    const hasScene = Boolean(data.scene_immersive && Object.keys(data.scene_immersive).length > 0);
    const hasQuiz = Boolean(data.quiz_questions && Array.isArray(data.quiz_questions) && data.quiz_questions.length > 0);
    const hasLyrics = Boolean(data.paroles_musicales && data.paroles_musicales.length > 0);

    const completedFeatures = [hasRangA, hasRangB, hasScene, hasQuiz, hasLyrics].filter(Boolean).length;
    const completenessScore = Math.round((completedFeatures / 5) * 100);
    const quizQuestionsCount = data.quiz_questions?.length || 0;

    return {
      hasRangA,
      hasRangB,
      hasScene,
      hasQuiz,
      hasLyrics,
      completenessScore,
      quizQuestionsCount
    };
  }, []);

  const fetchItem = useCallback(async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      if (data) {
        const mappedData: EdnItemData = {
          id: data.id,
          item_code: data.item_code,
          title: data.title,
          subtitle: data.subtitle,
          slug: data.slug,
          paroles_musicales: data.paroles_musicales as string[] | undefined,
          tableau_rang_a: data.tableau_rang_a,
          tableau_rang_b: data.tableau_rang_b,
          scene_immersive: data.scene_immersive,
          quiz_questions: data.quiz_questions,
          created_at: data.created_at,
          updated_at: data.updated_at,
          payload_v2: 'payload_v2' in data ? (data as Record<string, unknown>).payload_v2 : undefined,
          // Computed fields from existing data
          category: 'EDN',
          has_music: Boolean(data.paroles_musicales),
          has_lyrics: Boolean(data.paroles_musicales),
          competences_count: data.competences_count_total || 0
        };
        setRawItem(mappedData);
        setStats(calculateStats(mappedData));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [slug, calculateStats]);

  const refetch = useCallback(() => {
    fetchItem();
  }, [fetchItem]);

  // Récupérer l'item par code (alternative au slug)
  const fetchByCode = useCallback(async (itemCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .eq('item_code', itemCode)
        .maybeSingle();

      if (fetchError) {
        setError(fetchError.message);
        return null;
      }

      if (data) {
        const mappedData: EdnItemData = {
          id: data.id,
          item_code: data.item_code,
          title: data.title,
          subtitle: data.subtitle,
          slug: data.slug,
          paroles_musicales: data.paroles_musicales as string[] | undefined,
          tableau_rang_a: data.tableau_rang_a,
          tableau_rang_b: data.tableau_rang_b,
          scene_immersive: data.scene_immersive,
          quiz_questions: data.quiz_questions,
          created_at: data.created_at,
          updated_at: data.updated_at,
          payload_v2: 'payload_v2' in data ? (data as Record<string, unknown>).payload_v2 : undefined,
          category: 'EDN',
          has_music: Boolean(data.paroles_musicales),
          has_lyrics: Boolean(data.paroles_musicales),
          competences_count: data.competences_count_total || 0
        };
        setRawItem(mappedData);
        setStats(calculateStats(mappedData));
        return mappedData;
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      return null;
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return {
    item,
    rawItem,
    loading,
    error,
    stats,
    refetch,
    fetchByCode
  };
};
