import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type EdnItemRow = Database['public']['Tables']['edn_items_complete']['Row'];
type CompetenceViewRow = Database['public']['Views']['item_with_competences']['Row'];
type CompletenessReportRow = Database['public']['Tables']['items_completeness_reports']['Row'];

type ItemStatus = 'complete' | 'incomplete' | 'critical';

type BadgeVariant = 'default' | 'secondary' | 'destructive';

type RawCompletenessResult = {
  item_code: string;
  completeness_score?: number | null;
  tableau_a_present?: boolean | null;
  tableau_b_present?: boolean | null;
  quiz_present?: boolean | null;
  alerts?: string[] | null;
  status?: ItemStatus | null;
};

export interface ItemWithCompleteness {
  id: string;
  itemCode: string;
  itemNumber: number;
  title: string;
  specialite: string;
  tableauAPresent: boolean;
  tableauBPresent: boolean;
  completenessScore: number;
  status: ItemStatus;
  statusLabel: 'Complet' | 'Partiel' | 'Manquant';
  badgeVariant: BadgeVariant;
  alertsCount: number;
  totalCompetences: number;
  competenceCountA: number;
  competenceCountB: number;
}

export interface ItemsCompletenessStats {
  total: number;
  complete: number;
  partial: number;
  missing: number;
  averageScore: number;
}

const statusLabelMap: Record<ItemStatus, ItemWithCompleteness['statusLabel']> = {
  complete: 'Complet',
  incomplete: 'Partiel',
  critical: 'Manquant',
};

const badgeVariantMap: Record<ItemStatus, BadgeVariant> = {
  complete: 'default',
  incomplete: 'secondary',
  critical: 'destructive',
};

const normalizeSpecialite = (value: string | null) => value?.trim() || 'Non renseignée';

const extractItemNumber = (itemCode: string): number => {
  const match = itemCode.match(/\d+/);
  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER;
};

const resolveStatusFromScore = (score: number): ItemStatus => {
  if (score >= 80) return 'complete';
  if (score >= 40) return 'incomplete';
  return 'critical';
};

const parseReportResults = (results: CompletenessReportRow['results']) => {
  const entries: RawCompletenessResult[] = [];

  if (!results) {
    return entries;
  }

  if (Array.isArray(results)) {
    for (const value of results) {
      if (value && typeof value === 'object' && 'item_code' in value && typeof value.item_code === 'string') {
        entries.push(value as RawCompletenessResult);
      }
    }
    return entries;
  }

  if (typeof results === 'object') {
    for (const value of Object.values(results as Record<string, unknown>)) {
      if (value && typeof value === 'object' && 'item_code' in value && typeof (value as any).item_code === 'string') {
        entries.push(value as RawCompletenessResult);
      }
    }
  }

  return entries;
};

const buildCompetenceMap = (rows: CompetenceViewRow[] | null) => {
  const map = new Map<string, { total: number; rangA: number; rangB: number }>();

  if (!rows) {
    return map;
  }

  for (const row of rows) {
    if (!row?.item_code) continue;
    const current = map.get(row.item_code) ?? { total: 0, rangA: 0, rangB: 0 };
    current.total += 1;
    if ((row as any).competences) (row as any).competences += 1;
    if ((row as any).competences === 'A') current.rangA += 1;
    if ((row as any).competences === 'B') current.rangB += 1;
    map.set(row.item_code, current);
  }

  return map;
};

const mergeItemsWithCompleteness = (
  items: EdnItemRow[] | null,
  results: RawCompletenessResult[],
  competenceMap: Map<string, { total: number; rangA: number; rangB: number }>,
): ItemWithCompleteness[] => {
  if (!items) return [];

  const resultMap = new Map<string, RawCompletenessResult>();
  for (const entry of results) {
    if (entry?.item_code) {
      resultMap.set(entry.item_code, entry);
    }
  }

  return items
    .map<ItemWithCompleteness | null>((item) => {
      if (!item?.id || !item.item_code || !item.title) {
        return null;
      }

      const completeness = resultMap.get(item.item_code);
      const score = Math.round(
        completeness?.completeness_score ?? item.completeness_score ?? 0,
      );
      const status = completeness?.status ?? resolveStatusFromScore(score);
      const competenceCounts = competenceMap.get(item.item_code) ?? { total: 0, rangA: 0, rangB: 0 };

      return {
        id: item.id,
        itemCode: item.item_code,
        itemNumber: extractItemNumber(item.item_code),
        title: item.title,
        specialite: normalizeSpecialite(item.specialite),
        tableauAPresent: Boolean(
          completeness?.tableau_a_present ?? item.tableau_rang_a,
        ),
        tableauBPresent: Boolean(
          completeness?.tableau_b_present ?? item.tableau_rang_b,
        ),
        completenessScore: Math.min(100, Math.max(0, score)),
        status,
        statusLabel: statusLabelMap[status],
        badgeVariant: badgeVariantMap[status],
        alertsCount: completeness?.alerts?.length ?? 0,
        totalCompetences: competenceCounts.total,
        competenceCountA: competenceCounts.rangA,
        competenceCountB: competenceCounts.rangB,
      };
    })
    .filter((item): item is ItemWithCompleteness => item !== null)
    .sort((a, b) => a.itemNumber - b.itemNumber);
};

const computeStats = (items: ItemWithCompleteness[]): ItemsCompletenessStats => {
  if (items.length === 0) {
    return { total: 0, complete: 0, partial: 0, missing: 0, averageScore: 0 };
  }

  const complete = items.filter((item) => item.status === 'complete').length;
  const partial = items.filter((item) => item.status === 'incomplete').length;
  const missing = items.filter((item) => item.status === 'critical').length;
  const averageScore = Math.round(
    items.reduce((sum, item) => sum + item.completenessScore, 0) / items.length,
  );

  return {
    total: items.length,
    complete,
    partial,
    missing,
    averageScore,
  };
};

export const useItemsWithCompleteness = () => {
  const [items, setItems] = useState<ItemWithCompleteness[]>([]);
  const [stats, setStats] = useState<ItemsCompletenessStats>({
    total: 0,
    complete: 0,
    partial: 0,
    missing: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [itemsResponse, reportResponse, competencesResponse] = await Promise.all([
        supabase
          .from('edn_items_complete')
          .select(
            'id, item_code, title, specialite, tableau_rang_a, tableau_rang_b, completeness_score',
          )
          .order('item_code', { ascending: true }),
        supabase
          .from('items_completeness_reports')
          .select('id, created_at, results')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('item_with_competences')
          .select('item_code, competence_rang')
          .limit(6000),
      ]);

      if (itemsResponse.error) throw itemsResponse.error;

      // When there is no report yet, Supabase returns null data without error.
      const reportData = reportResponse.data ?? null;
      if (reportResponse.error && reportResponse.error.code !== 'PGRST116') {
        throw reportResponse.error;
      }

      if (competencesResponse.error) throw competencesResponse.error;

      const competenceMap = buildCompetenceMap(competencesResponse.data as any ?? null);
      const reportResults = parseReportResults(reportData?.results as any ?? null);
      const merged = mergeItemsWithCompleteness(itemsResponse.data as any ?? null, reportResults, competenceMap);

      setItems(merged);
      setStats(computeStats(merged));
      setLastUpdated(reportData?.created_at ?? null);
    } catch (err) {
      console.error('❌ Failed to load items completeness data', err);
      setError(err instanceof Error ? err.message : 'Impossible de charger les données');
      setItems([]);
      setStats({ total: 0, complete: 0, partial: 0, missing: 0, averageScore: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return useMemo(
    () => ({
      items,
      stats,
      loading,
      error,
      lastUpdated,
      refetch: fetchData,
    }),
    [items, stats, loading, error, lastUpdated, fetchData],
  );
};

