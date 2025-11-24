
import logger from '@/lib/logger';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EdnItemLyrics {
  // Anciennes paroles (pour compatibilité)
  paroles_musicales?: string[];

  // Nouvelles paroles séparées par rang (migration 20251116220000)
  paroles_rang_a?: string[];
  paroles_rang_b?: string[];
  paroles_rang_ab?: string[];

  item_code: string;
  title: string;
  specialite?: string;
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
        logger.debug('🔍 Récupération des paroles pour l\'item:', itemCode);

        // Essayer d'abord edn_items_complete (table principale avec nouvelles colonnes)
        const { data: completeData, error: completeError } = await supabase
          .from('edn_items_complete')
          .select('item_code, title, specialite, paroles_musicales, paroles_rang_a, paroles_rang_b, paroles_rang_ab')
          .eq('item_code', itemCode)
          .single();

        if (!completeError && completeData) {
          logger.debug('✅ Paroles récupérées depuis edn_items_complete:', {
            item_code: completeData.item_code,
            title: completeData.title,
            has_paroles_rang_a: !!completeData.paroles_rang_a,
            has_paroles_rang_b: !!completeData.paroles_rang_b,
            has_paroles_rang_ab: !!completeData.paroles_rang_ab,
            has_paroles_musicales: !!completeData.paroles_musicales
          });

          setLyrics({
            item_code: completeData.item_code,
            title: completeData.title,
            specialite: completeData.specialite,
            paroles_musicales: completeData.paroles_musicales || [],
            paroles_rang_a: completeData.paroles_rang_a || [],
            paroles_rang_b: completeData.paroles_rang_b || [],
            paroles_rang_ab: completeData.paroles_rang_ab || []
          });
          return;
        }

        // Fallback sur edn_items_immersive (ancienne table)
        const { data, error: supabaseError } = await supabase
          .from('edn_items_immersive')
          .select('item_code, title, paroles_musicales')
          .eq('item_code', itemCode)
          .single();

        if (supabaseError) {
          logger.error('❌ Erreur Supabase lors de la récupération des paroles:', supabaseError);
          setError('Item non trouvé');
          return;
        }

        if (data) {
          logger.debug('✅ Paroles récupérées depuis edn_items_immersive (fallback):', {
            item_code: data.item_code,
            title: data.title,
            paroles_count: data.paroles_musicales?.length || 0
          });

          setLyrics({
            item_code: data.item_code,
            title: data.title,
            paroles_musicales: data.paroles_musicales || [],
            paroles_rang_a: [],
            paroles_rang_b: [],
            paroles_rang_ab: data.paroles_musicales || [] // Fallback vers paroles_musicales
          });
        } else {
          setError('Aucune donnée trouvée');
        }
      } catch (err) {
        logger.error('❌ Erreur lors de la récupération des paroles:', err);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchLyrics();
  }, [itemCode]);

  return { lyrics, loading, error };
};
