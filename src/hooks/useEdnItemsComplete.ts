import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EdnItemComplete {
  id: string;
  item_code: string;
  title: string;
  subtitle?: string;
  slug: string;
  specialite?: string;
  domaine_medical?: string;
  niveau_complexite?: string;
  mots_cles?: string[];
  tags_medicaux?: string[];
  status?: string;
  competences_oic_rang_a?: any;
  competences_oic_rang_b?: any;
  competences_count_total?: number;
  competences_count_rang_a?: number;
  competences_count_rang_b?: number;
  completeness_score?: number;
  is_validated?: boolean;
  validation_date?: string;
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  quiz_questions?: any;
  scene_immersive?: any;
  paroles_musicales?: string[];
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];
  pitch_intro?: string;
  created_at: string;
  updated_at: string;
}

export const useEdnItemsComplete = () => {
  const [items, setItems] = useState<EdnItemComplete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('edn_items_complete')
          .select('*')
          .order('item_code');

        if (error) throw error;
        setItems(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return { items, loading, error, refetch: () => window.location.reload() };
};

export const useEdnItemComplete = (slug: string) => {
  const [item, setItem] = useState<EdnItemComplete | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('edn_items_complete')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setItem(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Item non trouvé');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchItem();
    }
  }, [slug]);

  return { item, loading, error };
};