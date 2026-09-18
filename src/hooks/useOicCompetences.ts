import { useState, useEffect, useCallback, useRef } from 'react';
import { SUPABASE_URL, getSupabaseHeaders } from '@/lib/supabaseConstants';
import { estCompetenceOICReelle } from '@/utils/tableauTransformations';

/**
 * LECTURE EN REST DIRECT — corrigé le 18/09/2026.
 *
 * Ce hook interrogeait `oic_competences` via supabase-js. Constaté en ligne sur
 * medmng.com : le verrou d'authentification de supabase-js
 * (`lock:sb-yaincoxihiqdksxgrsrk-auth-token`, Web Locks API) reste pris et
 * n'est jamais relâché — 18 acquisitions en attente derrière lui. Toute requête
 * supabase-js attend donc indéfiniment : aucune requête HTTP n'est même émise,
 * et les blocs « Compétences UNESS (OIC) » et « Validation des compétences » de
 * la fiche item restaient bloqués sur « Chargement… » sans jamais afficher un
 * seul objectif.
 *
 * On lit donc en REST direct, comme le fait déjà
 * TableauCompetencesOICWithRealData — qui, lui, s'affiche correctement. La
 * cause racine du verrou (appels Supabase à l'intérieur du callback
 * `onAuthStateChange` de AuthProvider, et dépendance non mémoïsée
 * `sendWelcomeEmail` qui réabonne à chaque rendu) reste à traiter à part.
 */

export interface OicCompetence {
  objectif_id: string;
  intitule: string;
  description: string;
  rubrique: string;
  rang: string;
  item_parent: string;
  titre_complet?: string;
  sommaire?: string;
  mecanismes?: string;
  indications?: string;
  effets_indesirables?: string;
  interactions?: string;
  modalites_surveillance?: string;
  causes_echec?: string;
  contributeurs?: string;
  ordre_affichage?: number;
}

// Cache global pour éviter les re-fetches
const competencesCache = new Map<string, OicCompetence[]>();

// Function to invalidate cache
export function invalidateOicCache(itemCode?: string, rang?: 'A' | 'B') {
  if (itemCode && rang) {
    const cacheKey = `${itemCode}-${rang}`;
    competencesCache.delete(cacheKey);
  } else if (itemCode) {
    competencesCache.delete(`${itemCode}-A`);
    competencesCache.delete(`${itemCode}-B`);
  } else {
    competencesCache.clear();
  }
}

export function useOicCompetences(itemCode: string, rang: 'A' | 'B') {
  const [competences, setCompetences] = useState<OicCompetence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchCountRef = useRef(0);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Skip if no itemCode
    if (!itemCode || itemCode.trim() === '') {
      if (import.meta.env.DEV) console.log('[useOicCompetences] No itemCode provided, skipping fetch');
      setCompetences([]);
      setLoading(false);
      setError(null);
      return;
    }
    
    if (import.meta.env.DEV) console.log(`[useOicCompetences] Fetching for itemCode: ${itemCode}, rang: ${rang}`);

    // Normalize itemCode - extract numeric part and pad to 3 digits
    const normalizedCode = itemCode.trim().toUpperCase();
    let numericPart = normalizedCode;
    if (normalizedCode.startsWith('IC-')) {
      numericPart = normalizedCode.replace('IC-', '');
    } else if (normalizedCode.startsWith('OIC-')) {
      numericPart = normalizedCode.replace('OIC-', '').split('-')[0];
    }
    // Pad to 3 digits for database lookup
    const paddedItemParent = numericPart.replace(/^0+/, '').padStart(3, '0');

    const cacheKey = `${paddedItemParent}-${rang}`;
    
    // Check cache first (unless force refresh)
    if (!forceRefresh && competencesCache.has(cacheKey)) {
      const cached = competencesCache.get(cacheKey)!;
      setCompetences(cached);
      setLoading(false);
      setError(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const currentFetch = ++fetchCountRef.current;

    try {
      // Use direct padded item_parent for more reliable matching
      const url =
        `${SUPABASE_URL}/rest/v1/oic_competences` +
        `?select=objectif_id,intitule,description,rang,item_parent,rubrique` +
        `&item_parent=eq.${paddedItemParent}&rang=eq.${rang}&order=objectif_id`;

      const response = await fetch(url, { headers: getSupabaseHeaders() });

      // Ignore if a newer fetch was triggered
      if (currentFetch !== fetchCountRef.current) return;

      if (!response.ok) {
        const message = `Erreur ${response.status}`;
        if (import.meta.env.DEV) console.warn(`[useOicCompetences] ${message}`);
        setError(message);
        setCompetences([]);
        setLoading(false);
        return;
      }

      const data = (await response.json()) as Array<Record<string, string | null>>;
      if (currentFetch !== fetchCountRef.current) return;

      if (!Array.isArray(data)) {
        setError('Format de réponse inattendu');
        setCompetences([]);
        setLoading(false);
        return;
      }

      const realCompetences = data
        // On écarte les lignes d'en-tête `IC-<n>-<rang>` : ce ne sont pas des
        // compétences du référentiel, et elles faussaient le décompte affiché.
        .filter(comp => Boolean(comp.objectif_id && comp.intitule) && estCompetenceOICReelle(comp.objectif_id))
        .map(comp => ({
          objectif_id: comp.objectif_id as string,
          intitule: comp.intitule as string,
          description: comp.description || comp.intitule,
          rubrique: comp.rubrique || '',
          rang: comp.rang || rang,
          item_parent: comp.item_parent || paddedItemParent
        })) as OicCompetence[];

      // Cache results
      competencesCache.set(cacheKey, realCompetences);
      setCompetences(realCompetences);
      setError(null);
      setLoading(false);
    } catch (err) {
      if (currentFetch !== fetchCountRef.current) return;
      if (import.meta.env.DEV) console.warn(`[useOicCompetences] Exception:`, err);
      setError(String(err));
      setCompetences([]);
      setLoading(false);
    }
  }, [itemCode, rang]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Manual refetch function
  const refetch = useCallback(() => {
    invalidateOicCache(itemCode, rang);
    fetchData(true);
  }, [itemCode, rang, fetchData]);

  return { competences, loading, error, refetch };
}
