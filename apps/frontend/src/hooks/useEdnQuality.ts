/**
 * Hooks React Query pour l'analyse de qualité des items EDN
 * Utilise les nouvelles fonctions SQL d'enrichissement
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type {
  EdnQualityReport,
  EdnQualityGlobalReport,
  EdnEnrichmentResult,
} from '@shared/types/edn';

/**
 * Hook pour analyser la qualité d'un item EDN spécifique
 *
 * @param itemCode - Code de l'item (ex: "IC-1")
 * @param options - Options React Query
 *
 * @example
 * ```tsx
 * const { data: quality, isLoading } = useEdnItemQuality('IC-1');
 * console.log(quality.quality_score); // 85
 * console.log(quality.quality_grade); // "Très bon"
 * ```
 */
export function useEdnItemQuality(
  itemCode: string | undefined,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) {
  return useQuery({
    queryKey: ['edn-quality', itemCode],
    queryFn: async () => {
      if (!itemCode) throw new Error('Item code is required');

      const { data, error } = await supabase.rpc('analyze_edn_item_quality', {
        p_item_code: itemCode,
      });

      if (error) throw error;
      return data as EdnQualityReport;
    },
    enabled: !!itemCode && (options?.enabled !== false),
    staleTime: options?.staleTime ?? 1000 * 60 * 15, // 15 minutes par défaut
  });
}

/**
 * Hook pour obtenir le rapport global de qualité de tous les items EDN
 *
 * @example
 * ```tsx
 * const { data: globalReport } = useEdnGlobalQuality();
 * console.log(globalReport.total_items); // 367
 * console.log(globalReport.average_quality_score); // 72.5
 * console.log(globalReport.quality_distribution.excellent); // 45
 * ```
 */
export function useEdnGlobalQuality(options?: {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}) {
  return useQuery({
    queryKey: ['edn-quality-global'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_edn_quality_global_report');

      if (error) throw error;
      return data as EdnQualityGlobalReport;
    },
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime ?? 1000 * 60 * 15, // 15 minutes
    refetchInterval: options?.refetchInterval, // Optionnel: auto-refresh
  });
}

/**
 * Hook pour enrichir un item EDN spécifique (mutation)
 *
 * @example
 * ```tsx
 * const enrichItem = useEnrichEdnItem();
 *
 * await enrichItem.mutateAsync('IC-1');
 * console.log(enrichItem.data.enriched); // true
 * console.log(enrichItem.data.extracted_keywords_count); // 15
 * ```
 */
export function useEnrichEdnItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemCode: string) => {
      const { data, error } = await supabase.rpc('enrich_edn_item_metadata', {
        p_item_code: itemCode,
      });

      if (error) throw error;
      return data as EdnEnrichmentResult;
    },
    onSuccess: (data, itemCode) => {
      // Invalider les caches liés à cet item
      queryClient.invalidateQueries({ queryKey: ['edn-quality', itemCode] });
      queryClient.invalidateQueries({ queryKey: ['edn-quality-global'] });
      queryClient.invalidateQueries({ queryKey: ['edn-items'] });
      queryClient.invalidateQueries({ queryKey: ['edn-stats'] });
    },
  });
}

/**
 * Hook pour enrichir tous les items EDN (mutation)
 * ⚠️ Opération lourde - utiliser avec précaution
 *
 * @example
 * ```tsx
 * const enrichAll = useEnrichAllEdnItems();
 *
 * await enrichAll.mutateAsync();
 * console.log(enrichAll.data.total_enriched); // 367
 * console.log(enrichAll.data.success_rate); // 100.00
 * ```
 */
export function useEnrichAllEdnItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('enrich_all_edn_items');

      if (error) throw error;
      return data as {
        total_processed: number;
        total_enriched: number;
        success_rate: number;
        timestamp: string;
      };
    },
    onSuccess: () => {
      // Invalider tous les caches EDN
      queryClient.invalidateQueries({ queryKey: ['edn-quality'] });
      queryClient.invalidateQueries({ queryKey: ['edn-items'] });
      queryClient.invalidateQueries({ queryKey: ['edn-stats'] });
    },
  });
}

/**
 * Hook pour obtenir les statistiques globales EDN depuis la vue matérialisée
 *
 * @example
 * ```tsx
 * const { data: stats } = useEdnGlobalStats();
 * console.log(stats.total_items); // 367
 * console.log(stats.complete_items); // 250
 * console.log(stats.avg_completeness); // 75.5
 * ```
 */
export function useEdnGlobalStats(options?: {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}) {
  return useQuery({
    queryKey: ['edn-stats-global'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('edn_global_stats')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime ?? 1000 * 60 * 15, // 15 minutes
    refetchInterval: options?.refetchInterval,
  });
}

/**
 * Hook pour obtenir les statistiques par spécialité
 *
 * @example
 * ```tsx
 * const { data: statsBySpecialty } = useEdnStatsBySpecialite();
 * statsBySpecialty.forEach(spec => {
 *   console.log(spec.specialite, spec.item_count, spec.avg_completeness);
 * });
 * ```
 */
export function useEdnStatsBySpecialite(options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  return useQuery({
    queryKey: ['edn-stats-specialite'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('edn_stats_by_specialite')
        .select('*')
        .order('item_count', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: options?.enabled !== false,
    staleTime: options?.staleTime ?? 1000 * 60 * 15,
  });
}

/**
 * Hook pour rafraîchir manuellement les vues matérialisées
 * ⚠️ Requiert privilèges service_role ou admin
 *
 * @example
 * ```tsx
 * const refreshViews = useRefreshEdnViews();
 *
 * await refreshViews.mutateAsync();
 * ```
 */
export function useRefreshEdnViews() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Note: Cette opération nécessite des privilèges élevés
      // Elle peut échouer si l'utilisateur n'est pas admin
      const { error: error1 } = await supabase.rpc('refresh_materialized_view', {
        view_name: 'edn_global_stats',
      });

      const { error: error2 } = await supabase.rpc('refresh_materialized_view', {
        view_name: 'edn_stats_by_specialite',
      });

      if (error1 || error2) {
        throw error1 || error2;
      }

      return { success: true };
    },
    onSuccess: () => {
      // Invalider les caches des vues matérialisées
      queryClient.invalidateQueries({ queryKey: ['edn-stats-global'] });
      queryClient.invalidateQueries({ queryKey: ['edn-stats-specialite'] });
    },
  });
}
