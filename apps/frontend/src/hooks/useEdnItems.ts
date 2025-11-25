/**
 * Hook React Query pour la gestion des items EDN
 * Fournit cache intelligent, refetch automatique et optimistic updates
 */

import logger from '@/lib/logger';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys } from '@/lib/queryClient';
import { EdnItem, EdnItemUnified } from '@shared/types/edn';
import type { Database } from '@/integrations/supabase/types';

const ITEMS_PER_PAGE = 50;

type EdnCompleteRow = Database['public']['Tables']['edn_items_complete']['Row'];

function mapCompleteRowToUnified(row: EdnCompleteRow): EdnItemUnified {
  return {
    id: row.id,
    item_code: row.item_code,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    specialite: row.specialite ?? undefined,
    domaine_medical: row.domaine_medical ?? undefined,
    niveau_complexite: row.niveau_complexite ?? undefined,
    mots_cles: row.mots_cles ?? undefined,
    tags_medicaux: row.tags_medicaux ?? undefined,
    status: row.status ?? undefined,
    completeness_score: row.completeness_score ?? undefined,
    is_validated: row.is_validated ?? undefined,
    validation_date: row.validation_date ?? undefined,
    competences_count_rang_a: row.competences_count_rang_a ?? 0,
    competences_count_rang_b: row.competences_count_rang_b ?? 0,
    competences_count_total: row.competences_count_total ?? 0,
    has_tableau_rang_a: Boolean(row.tableau_rang_a),
    has_tableau_rang_b: Boolean(row.tableau_rang_b),
    has_paroles_musicales: Array.isArray(row.paroles_musicales) && row.paroles_musicales.length > 0,
    has_paroles_rang_a: Array.isArray(row.paroles_rang_a) && row.paroles_rang_a.length > 0,
    has_paroles_rang_b: Array.isArray(row.paroles_rang_b) && row.paroles_rang_b.length > 0,
    has_paroles_rang_ab: Array.isArray(row.paroles_rang_ab) && row.paroles_rang_ab.length > 0,
    has_scene_immersive: Boolean(row.scene_immersive),
    has_quiz_questions: Boolean(row.quiz_questions),
    has_audio_ambiance: Boolean(row.audio_ambiance),
    has_visual_ambiance: Boolean(row.visual_ambiance),
    competences_oic_rang_a: row.competences_oic_rang_a as unknown as EdnItemUnified['competences_oic_rang_a'],
    competences_oic_rang_b: row.competences_oic_rang_b as unknown as EdnItemUnified['competences_oic_rang_b'],
  };
}

async function fetchFromCompleteTable(page: number): Promise<{ items: EdnItemUnified[]; count: number }> {
  const from = page * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data, error, count } = await supabase
    .from('edn_items_complete')
    .select('*', { count: 'exact' })
    .range(from, to);

  if (error) {
    logger.error('[React Query] Fallback fetch from edn_items_complete failed', error);
    throw new Error(`Erreur lors du chargement des items: ${error.message}`);
  }

  return {
    items: (data || []).map(mapCompleteRowToUnified),
    count: count || 0,
  };
}

/**
 * Fetcher pour les items unifiés (vue matérialisée)
 */
async function fetchUnifiedItems(page: number): Promise<{ items: EdnItemUnified[]; count: number }> {
  const from = page * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  
  logger.debug('[React Query] Fetching unified items, page:', page);
  
  // Cast nécessaire car les types générés ne connaissent pas encore la vue matérialisée
  const { data, error, count } = await supabase
    .from('edn_items_unified' as any)
    .select('*', { count: 'exact' })
    .range(from, to);

  if (error) {
    logger.warn('[React Query] Error fetching unified items, using fallback table', error);
    return fetchFromCompleteTable(page);
  }

  if (!data || data.length === 0) {
    logger.warn('[React Query] Unified view is empty, falling back to edn_items_complete');
    return fetchFromCompleteTable(page);
  }

  logger.debug('[React Query] Fetched', data.length, 'items (total:', count, ')');

  return {
    items: data as unknown as EdnItemUnified[],
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
      logger.debug('[React Query] Fetching full item:', itemCode);
      
      const { data, error } = await supabase
        .from('edn_items_immersive')
        .select('*')
        .eq('item_code', itemCode)
        .single();
      
      if (error) {
        logger.error('[React Query] Error fetching full item:', error);
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
      logger.debug('[React Query] Refreshing materialized view...');
      
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
      logger.debug('[React Query] Materialized view refreshed, cache invalidated');
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
