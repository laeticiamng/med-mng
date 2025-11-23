/**
 * Hooks React Query pour la recherche et découverte d'items EDN
 * Recherche full-text, items similaires, etc.
 */

import logger from '@/lib/logger';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { EdnSearchResult, EdnSimilarItem } from '@shared/types/edn';

/**
 * Hook pour rechercher des items EDN avec full-text search
 *
 * @param searchTerm - Terme de recherche
 * @param options - Options de recherche et React Query
 *
 * @example
 * ```tsx
 * const { data: results, isLoading } = useEdnSearch('cardiologie', {
 *   limit: 10,
 *   offset: 0,
 * });
 *
 * results.forEach(item => {
 *   logger.debug(item.item_code, item.title, item.rank);
 * });
 * ```
 */
export function useEdnSearch(
  searchTerm: string,
  options?: {
    limit?: number;
    offset?: number;
    enabled?: boolean;
    staleTime?: number;
  }
) {
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  return useQuery({
    queryKey: ['edn-search', searchTerm, limit, offset],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) {
        return [];
      }

      const { data, error } = await supabase.rpc('search_edn_items', {
        p_search_term: searchTerm,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) throw error;
      return (data || []) as EdnSearchResult[];
    },
    enabled: searchTerm.length >= 2 && (options?.enabled !== false),
    staleTime: options?.staleTime ?? 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour obtenir des items EDN similaires à un item donné
 *
 * @param itemCode - Code de l'item de référence
 * @param options - Options de recherche
 *
 * @example
 * ```tsx
 * const { data: similar } = useEdnSimilarItems('IC-1', { limit: 5 });
 *
 * similar.forEach(item => {
 *   logger.debug(item.item_code, item.similarity_score, item.shared_tags);
 * });
 * ```
 */
export function useEdnSimilarItems(
  itemCode: string | undefined,
  options?: {
    limit?: number;
    enabled?: boolean;
    staleTime?: number;
  }
) {
  const limit = options?.limit ?? 5;

  return useQuery({
    queryKey: ['edn-similar-items', itemCode, limit],
    queryFn: async () => {
      if (!itemCode) throw new Error('Item code is required');

      const { data, error } = await supabase.rpc('get_similar_edn_items', {
        p_item_code: itemCode,
        p_limit: limit,
      });

      if (error) throw error;
      return (data || []) as EdnSimilarItem[];
    },
    enabled: !!itemCode && (options?.enabled !== false),
    staleTime: options?.staleTime ?? 1000 * 60 * 15, // 15 minutes
  });
}

/**
 * Hook pour rechercher des items EDN par spécialité
 *
 * @param specialite - Nom de la spécialité
 * @param options - Options de recherche
 *
 * @example
 * ```tsx
 * const { data: cardioItems } = useEdnItemsBySpecialite('Cardiologie');
 * ```
 */
export function useEdnItemsBySpecialite(
  specialite: string | undefined,
  options?: {
    limit?: number;
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: ['edn-items-specialite', specialite, options?.limit],
    queryFn: async () => {
      if (!specialite) throw new Error('Specialite is required');

      const query = supabase
        .from('edn_items_complete')
        .select('item_code, title, subtitle, specialite, completeness_score, is_validated')
        .eq('specialite', specialite)
        .order('completeness_score', { ascending: false });

      if (options?.limit) {
        query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!specialite && (options?.enabled !== false),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook pour filtrer les items EDN par niveau de complexité
 *
 * @param niveauComplexite - 'debutant' | 'intermediaire' | 'avance' | 'expert'
 *
 * @example
 * ```tsx
 * const { data: expertItems } = useEdnItemsByComplexite('expert');
 * ```
 */
export function useEdnItemsByComplexite(
  niveauComplexite: 'debutant' | 'intermediaire' | 'avance' | 'expert' | undefined,
  options?: {
    limit?: number;
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: ['edn-items-complexite', niveauComplexite, options?.limit],
    queryFn: async () => {
      if (!niveauComplexite) throw new Error('Niveau complexite is required');

      const query = supabase
        .from('edn_items_complete')
        .select('item_code, title, subtitle, niveau_complexite, completeness_score')
        .eq('niveau_complexite', niveauComplexite)
        .order('item_code');

      if (options?.limit) {
        query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!niveauComplexite && (options?.enabled !== false),
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook pour obtenir les items EDN incomplets (nécessitant enrichissement)
 *
 * @param threshold - Score minimum de complétude (défaut: 60)
 *
 * @example
 * ```tsx
 * const { data: incompleteItems } = useEdnIncompleteItems(60);
 * // Retourne tous les items avec score < 60
 * ```
 */
export function useEdnIncompleteItems(
  threshold: number = 60,
  options?: {
    limit?: number;
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: ['edn-incomplete-items', threshold, options?.limit],
    queryFn: async () => {
      const query = supabase
        .from('edn_items_complete')
        .select('item_code, title, completeness_score, specialite, domaine_medical')
        .lt('completeness_score', threshold)
        .order('completeness_score', { ascending: true });

      if (options?.limit) {
        query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook pour obtenir les meilleurs items EDN (score le plus élevé)
 *
 * @param limit - Nombre d'items à retourner (défaut: 10)
 *
 * @example
 * ```tsx
 * const { data: topItems } = useEdnTopItems(10);
 * ```
 */
export function useEdnTopItems(
  limit: number = 10,
  options?: {
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: ['edn-top-items', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('edn_items_complete')
        .select('item_code, title, completeness_score, specialite, is_validated')
        .order('completeness_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: options?.enabled !== false,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook pour rechercher avec filtres avancés
 *
 * @example
 * ```tsx
 * const { data } = useEdnAdvancedSearch({
 *   searchTerm: 'cœur',
 *   specialite: 'Cardiologie',
 *   minScore: 70,
 *   validated: true,
 * });
 * ```
 */
export function useEdnAdvancedSearch(params: {
  searchTerm?: string;
  specialite?: string;
  minScore?: number;
  maxScore?: number;
  validated?: boolean;
  limit?: number;
  offset?: number;
}) {
  const queryKey = ['edn-advanced-search', JSON.stringify(params)];

  return useQuery({
    queryKey,
    queryFn: async () => {
      let query = supabase
        .from('edn_items_complete')
        .select('item_code, title, subtitle, specialite, completeness_score, is_validated');

      // Filtre par terme de recherche
      if (params.searchTerm && params.searchTerm.length >= 2) {
        query = query.or(
          `title.ilike.%${params.searchTerm}%,subtitle.ilike.%${params.searchTerm}%,item_code.ilike.%${params.searchTerm}%`
        );
      }

      // Filtre par spécialité
      if (params.specialite) {
        query = query.eq('specialite', params.specialite);
      }

      // Filtre par score minimum
      if (params.minScore !== undefined) {
        query = query.gte('completeness_score', params.minScore);
      }

      // Filtre par score maximum
      if (params.maxScore !== undefined) {
        query = query.lte('completeness_score', params.maxScore);
      }

      // Filtre par validation
      if (params.validated !== undefined) {
        query = query.eq('is_validated', params.validated);
      }

      // Pagination
      if (params.offset !== undefined) {
        query = query.range(
          params.offset,
          params.offset + (params.limit || 20) - 1
        );
      } else if (params.limit) {
        query = query.limit(params.limit);
      }

      // Tri par pertinence (score)
      query = query.order('completeness_score', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !!(params.searchTerm || params.specialite || params.minScore !== undefined),
    staleTime: 1000 * 60 * 5,
  });
}
