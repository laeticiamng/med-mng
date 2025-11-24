import logger from '@/lib/logger';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useItemTitle = (itemCode: string | undefined) => {
  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTitle = async () => {
      if (!itemCode) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('edn_items_immersive')
          .select('title')
          .eq('item_code', itemCode)
          .maybeSingle();

        if (error) {
          logger.error('Error fetching item title:', error);
          setTitle(null);
        } else {
          setTitle(data?.title || null);
        }
      } catch (err) {
        logger.error('Error:', err);
        setTitle(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTitle();
  }, [itemCode]);

  return { title, loading };
};
