/**
 * Hook React Query pour la gestion des items EDN
 * Fournit cache intelligent, refetch automatique et optimistic updates
 */

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryClient';
import { EdnItem, EdnItemUnified } from '@/types/edn';

const ITEMS_PER_PAGE = 50;

/**
 * Fetcher pour les items unifiés (vue matérialisée)
 */
async function fetchUnifiedItems(page: number): Promise<{ items: EdnItemUnified[]; count: number }> {
  const from = page * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  
  console.log('[React Query] Fetching unified items, page:', page);
  
  // Cast nécessaire car les types générés ne connaissent pas encore la vue matérialisée
  const { data, error, count } = await supabase
    .from('edn_items_unified' as any)
    .select('*', { count: 'exact' })
    .range(from, to);
  
  if (error) {
    console.error('[React Query] Error fetching unified items:', error);
    throw new Error(`Erreur lors du chargement des items: ${error.message}`);
  }
  
  console.log('[React Query] Fetched', data?.length, 'items (total:', count, ')');
  
  return {
    items: (data || []) as unknown as EdnItemUnified[],
    count: count || 0,
  };
}

/**
 * Hook principal pour charger les items EDN avec pagination
 */
export function useEdnItems(page: number) {
  return useQuery({
    queryKey: queryKeys.ednItems.unified(page),
    queryFn: () => fetchUnifiedItems(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData, // Garde les données précédentes pendant le chargement
  });
}

/**
 * Hook pour le scroll infini (alternative à la pagination manuelle)
 */
export function useEdnItemsInfinite() {
  return useInfiniteQuery({
    queryKey: queryKeys.ednItems.all,
    queryFn: ({ pageParam = 0 }) => fetchUnifiedItems(pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const nextPage = allPages.length;
      return lastPage.items.length === ITEMS_PER_PAGE ? nextPage : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook pour charger un item complet (avec tous les contenus)
 */
export function useFullEdnItem(itemCode: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.ednItems.fullItem(itemCode),
    queryFn: async (): Promise<EdnItem> => {
      console.log('[React Query] Fetching full item:', itemCode);
      
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .eq('item_code', itemCode)
        .single();
      
      if (error) {
        console.error('[React Query] Error fetching full item:', error);
        throw new Error(`Erreur lors du chargement de l'item: ${error.message}`);
      }
      
      return data as unknown as EdnItem;
    },
    enabled, // Permet de désactiver la query
    staleTime: 10 * 60 * 1000, // 10 minutes (les items complets changent rarement)
  });
}

/**
 * Hook pour rafraîchir la vue matérialisée
 * Utile après des modifications importantes en base
 */
export function useRefreshEdnView() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      console.log('[React Query] Refreshing materialized view...');
      
      // Cast nécessaire car la fonction n'est pas dans les types générés
      const { error } = await (supabase as any).rpc('refresh_edn_items_unified');
      
      if (error) {
        throw new Error(`Erreur lors du rafraîchissement: ${error.message}`);
      }
      
      return true;
    },
    onSuccess: () => {
      // Invalider toutes les queries d'items EDN pour forcer un refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.ednItems.all });
      console.log('[React Query] Materialized view refreshed, cache invalidated');
    },
  });
}

/**
 * Hook pour précharger un item (optimisation UX)
 */
export function usePrefetchFullItem() {
  const queryClient = useQueryClient();
  
  return (itemCode: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.ednItems.fullItem(itemCode),
      queryFn: async (): Promise<EdnItem> => {
        const { data, error } = await supabase
          .from('edn_items_immersive')
          .select('*')
          .eq('item_code', itemCode)
          .single();
        
        if (error) throw new Error(error.message);
        return data as unknown as EdnItem;
      },
    });
  };
}

/**
 * Hook pour les statistiques globales (derived data)
 */
export function useEdnStats() {
  const { data: page0 } = useEdnItems(0);
  
  return useQuery({
    queryKey: queryKeys.ednItems.stats(),
    queryFn: async () => {
      // Utiliser les données du cache si disponibles
      if (!page0) {
        return {
          total: 0,
          complete: 0,
          validated: 0,
          avgScore: 0,
        };
      }
      
      const items = page0.items;
      const total = page0.count;
      const complete = items.filter(i => 
        (i.competences_count_rang_a || 0) > 0 && (i.competences_count_rang_b || 0) > 0
      ).length;
      const validated = items.filter(i => i.is_validated).length;
      const avgScore = items.length > 0 
        ? Math.round(items.reduce((sum, i) => sum + (i.completeness_score || 0), 0) / items.length)
        : 0;
      
      return { total, complete, validated, avgScore };
    },
    enabled: !!page0, // Seulement si page 0 est chargée
    staleTime: 5 * 60 * 1000,
  });
}
