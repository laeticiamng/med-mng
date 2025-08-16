import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EdnItemLight {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  completeness_score?: number;
  updated_at: string;
  specialite?: string;
  competences_count_total?: number;
  is_validated?: boolean;
  // Champs légers seulement pour l'affichage initial
  has_music?: boolean;
  has_scene?: boolean;
  has_quiz?: boolean;
}

export const useEdnItemsPaginated = (page = 1, limit = 20) => {
  const [items, setItems] = useState<EdnItemLight[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      
      const offset = (page - 1) * limit;
      
      // Requête ultra-optimisée avec seulement les champs essentiels
      const { data, error, count } = await supabase
        .from('edn_items_complete')
        .select(`
          id, item_code, title, subtitle, slug, completeness_score, 
          updated_at, specialite, competences_count_total, is_validated,
          paroles_musicales, scene_immersive, quiz_questions
        `, { count: 'exact' })
        .order('item_code', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        setError(error.message);
        return;
      }

      // Transformation légère des données pour optimiser l'affichage
      const lightItems: EdnItemLight[] = (data || []).map(item => ({
        id: item.id,
        item_code: item.item_code,
        title: item.title,
        subtitle: item.subtitle,
        slug: item.slug,
        completeness_score: item.completeness_score || 0,
        updated_at: item.updated_at,
        specialite: item.specialite,
        competences_count_total: item.competences_count_total,
        is_validated: item.is_validated,
        has_music: !!(item.paroles_musicales && item.paroles_musicales.length > 0),
        has_scene: !!item.scene_immersive,
        has_quiz: !!item.quiz_questions
      }));

      setItems(lightItems);
      setTotalCount(count || 0);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { 
    items, 
    totalCount, 
    loading, 
    error, 
    refetch: fetchItems,
    hasMore: items.length + (page - 1) * limit < totalCount,
    totalPages: Math.ceil(totalCount / limit)
  };
};

// Hook optimisé pour les statistiques globales (cache)
export const useEdnStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    complete: 0,
    validated: 0,
    withMusic: 0,
    avgScore: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Requête agrégée optimisée
        const { data, error } = await supabase
          .from('edn_items_complete')
          .select(`
            id,
            completeness_score,
            is_validated,
            paroles_musicales
          `);

        if (error) throw error;

        const total = data?.length || 0;
        const complete = data?.filter(item => (item.completeness_score || 0) >= 100).length || 0;
        const validated = data?.filter(item => item.is_validated).length || 0;
        const withMusic = data?.filter(item => item.paroles_musicales && item.paroles_musicales.length > 0).length || 0;
        const avgScore = total > 0 ? Math.round(data.reduce((sum, item) => sum + (item.completeness_score || 0), 0) / total) : 0;

        setStats({ total, complete, validated, withMusic, avgScore });
      } catch (error) {
        console.error('Erreur stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};