
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EdnItemLyrics {
  paroles_musicales?: string[];
  item_code: string;
  title: string;
}

export const useEdnItemLyrics = (itemCode: string | null) => {
  const [lyrics, setLyrics] = useState<EdnItemLyrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLyrics = async () => {
      if (!itemCode) {
        setLyrics(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Récupération des paroles pour l\'item:', itemCode);
        
        const { data, error: supabaseError } = await supabase
          .from('edn_items_complete')
          .select('item_code, title, paroles_musicales')
          .eq('item_code', itemCode)
          .single();

        if (supabaseError) {
          console.error('❌ Erreur Supabase lors de la récupération des paroles:', supabaseError);
          setError('Item non trouvé');
          return;
        }

        if (data) {
          console.log('✅ Paroles récupérées:', {
            item_code: data.item_code,
            title: data.title,
            paroles_count: data.paroles_musicales?.length || 0
          });
          
          setLyrics({
            item_code: data.item_code,
            title: data.title,
            paroles_musicales: data.paroles_musicales || []
          });
        } else {
          setError('Aucune donnée trouvée');
        }
      } catch (err) {
        console.error('❌ Erreur lors de la récupération des paroles:', err);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  }, [itemCode]);

  return { lyrics, loading, error };
};
