import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EdnItem {
  item_code: string;
  title: string;
  subtitle?: string;
}

export const useAllEdnItems = () => {
  const [items, setItems] = useState<EdnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllItems = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log('🔍 Récupération de tous les items EDN...');
        
        const { data, error: supabaseError } = await supabase
          .from('edn_items_immersive')
          .select('item_code, title, subtitle')
          .order('item_code');

        if (supabaseError) {
          console.error('❌ Erreur Supabase lors de la récupération des items:', supabaseError);
          setError('Erreur lors du chargement des items');
          return;
        }

        if (data) {
          console.log(`✅ ${data.length} items EDN récupérés`);
          setItems(data);
        }
      } catch (err) {
        console.error('❌ Erreur lors de la récupération des items:', err);
        setError('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchAllItems();
  }, []);

  return { items, loading, error };
};