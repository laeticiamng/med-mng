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
  pitch_intro?: string;
  created_at: string;
  updated_at: string;
}

export const useEdnItemsComplete = () => {
  const [items, setItems] = useState<EdnItemComplete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('edn_items_complete')
        .select('*')
        .order('item_code');

      if (error) throw error;
      setItems((data || []).map(item => ({
        ...item,
        subtitle: item.subtitle || undefined,
        specialite: item.specialite || undefined,
        domaine_medical: item.domaine_medical || undefined,
        niveau_complexite: item.niveau_complexite || undefined,
        pitch_intro: item.pitch_intro || undefined,
        validation_date: item.validation_date || undefined,
        mots_cles: item.mots_cles || undefined,
        tags_medicaux: item.tags_medicaux || undefined,
        paroles_musicales: item.paroles_musicales || undefined,
        status: item.status || undefined
      }) as EdnItemComplete));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return { items, loading, error, refetch: fetchItems };
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
        setItem(data ? {
          ...data,
          subtitle: data.subtitle || undefined,
          specialite: data.specialite || undefined,
          domaine_medical: data.domaine_medical || undefined,
          niveau_complexite: data.niveau_complexite || undefined,
          pitch_intro: data.pitch_intro || undefined,
          validation_date: data.validation_date || undefined,
          mots_cles: data.mots_cles || undefined,
          tags_medicaux: data.tags_medicaux || undefined,
          paroles_musicales: data.paroles_musicales || undefined,
          status: data.status || undefined
        } as EdnItemComplete : null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Item non trouvé');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [slug]);

  return { item, loading, error };
};