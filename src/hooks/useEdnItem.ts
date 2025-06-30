
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
}

export const useEdnItem = (slug: string | undefined) => {
  const [item, setItem] = useState<EdnItemData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      if (!slug) return;
      
      try {
        const { data, error } = await supabase
          .from('edn_items_immersive')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          console.error('Erreur lors du chargement de l\'item:', error);
          return;
        }

        if (data) {
          const mappedData: EdnItemData = {
            id: data.id,
            item_code: data.item_code,
            title: data.title,
            subtitle: data.subtitle,
            slug: data.slug,
            paroles_musicales: data.paroles_musicales,
            tableau_rang_a: data.tableau_rang_a,
            tableau_rang_b: data.tableau_rang_b,
            scene_immersive: data.scene_immersive,
            quiz_questions: data.quiz_questions,
            created_at: data.created_at,
            updated_at: data.updated_at
          };
          setItem(mappedData);
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [slug]);

  return { item, loading };
};
