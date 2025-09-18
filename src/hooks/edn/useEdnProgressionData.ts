import { useEffect, useMemo, useState } from 'react';
import { addDays, differenceInCalendarDays, isBefore, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { ednProgressService, type EdnUnifiedRow, type UserProgressRow } from '@/services/EdnProgressService';
import { isTestEnvironment } from '@/utils/environment';

export interface ThemeProgressMetrics {
  theme: string;
  totalItems: number;
  mastered: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  rankACount: number;
  rankBCount: number;
  masteryRate: number;
}

export interface ProgressHistoryEntry {
  itemCode: string;
  title: string;
  theme: string;
  updatedAt: string;
  progressPercentage: number;
  masteryLevel?: string | null;
}

export interface SpacedRepetitionItem {
  itemCode: string;
  title: string;
  theme: string;
  rankFocus: 'A' | 'B';
  nextReview: string;
  intervalDays: number;
  overdue: boolean;
  priority: 'high' | 'medium' | 'low';
  progressPercentage: number;
}

interface EdnProgressionState {
  loading: boolean;
  error: string | null;
  items: EdnUnifiedRow[];
  themeProgress: ThemeProgressMetrics[];
  history: ProgressHistoryEntry[];
  repetitionPlan: SpacedRepetitionItem[];
  suggestions: SpacedRepetitionItem[];
  refresh: () => void;
}

const computeIntervalDays = (progress?: UserProgressRow | null): number => {
  if (!progress) return 1;

  const mastery = progress.mastery_level?.toLowerCase();
  const percentage = progress.progress_percentage ?? 0;

  if (mastery === 'mastered' || percentage >= 90) return 21;
  if (mastery === 'completed' || percentage >= 75) return 14;
  if (percentage >= 50) return 7;
  if (percentage > 0) return 3;
  return 1;
};

const parseDateOrNull = (value?: string | null): Date | null => {
  if (!value) return null;
  try {
    const parsed = parseISO(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
  } catch (error) {
    console.warn('Impossible de parser la date', value, error);
    return null;
  }
};

const resolveProgressForItem = (item: EdnUnifiedRow, progress: UserProgressRow[]): UserProgressRow | null => {
  const candidates = [item.item_code, item.slug ?? undefined, item.item_id ?? undefined].filter(Boolean);
  return progress.find((entry) => candidates.includes(entry.content_id)) ?? null;
};

const buildThemeProgress = (items: EdnUnifiedRow[], progress: UserProgressRow[]): ThemeProgressMetrics[] => {
  const themeMap = new Map<string, ThemeProgressMetrics>();

  items.forEach((item) => {
    const theme = item.specialite ?? item.domaine_medical ?? 'Général';
    const record = resolveProgressForItem(item, progress);
    const themeEntry = themeMap.get(theme) ?? {
      theme,
      totalItems: 0,
      mastered: 0,
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      rankACount: 0,
      rankBCount: 0,
      masteryRate: 0,
    };

    themeEntry.totalItems += 1;
    themeEntry.rankACount += item.rang_a_competence_count ?? 0;
    themeEntry.rankBCount += item.rang_b_competence_count ?? 0;

    const percentage = record?.progress_percentage ?? 0;
    const mastery = record?.mastery_level?.toLowerCase();

    if (mastery === 'mastered' || percentage >= 95) {
      themeEntry.mastered += 1;
    } else if (mastery === 'completed' || percentage >= 75) {
      themeEntry.completed += 1;
    } else if (percentage > 0) {
      themeEntry.inProgress += 1;
    } else {
      themeEntry.notStarted += 1;
    }

    themeMap.set(theme, themeEntry);
  });

  return Array.from(themeMap.values()).map((entry) => {
    const masteredWeight = entry.mastered;
    const completedWeight = entry.completed * 0.75;
    const inProgressWeight = entry.inProgress * 0.4;
    const masteryRate = entry.totalItems > 0
      ? Math.round(((masteredWeight + completedWeight + inProgressWeight) / entry.totalItems) * 100)
      : 0;

    return { ...entry, masteryRate };
  }).sort((a, b) => b.masteryRate - a.masteryRate);
};

const buildHistory = (items: EdnUnifiedRow[], progress: UserProgressRow[]): ProgressHistoryEntry[] => {
  const history: ProgressHistoryEntry[] = [];

  items.forEach((item) => {
    const record = resolveProgressForItem(item, progress);
    if (!record?.updated_at) return;

    history.push({
      itemCode: item.item_code,
      title: item.title ?? '',
      theme: item.specialite ?? item.domaine_medical ?? 'Général',
      updatedAt: record.updated_at,
      progressPercentage: record.progress_percentage ?? 0,
      masteryLevel: record.mastery_level,
    });
  });

  return history.sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));
};

const buildRepetitionPlan = (items: EdnUnifiedRow[], progress: UserProgressRow[]): SpacedRepetitionItem[] => {
  const now = new Date();
  const plan: SpacedRepetitionItem[] = [];

  items.forEach((item) => {
    const record = resolveProgressForItem(item, progress);
    const fallbackDate = parseDateOrNull(item.updated_at ?? item.created_at ?? null) ?? now;
    const lastAccess = parseDateOrNull(record?.last_accessed) ?? parseDateOrNull(record?.updated_at) ?? fallbackDate;
    const interval = computeIntervalDays(record);
    const nextReviewDate = addDays(lastAccess, interval);
    const overdue = isBefore(nextReviewDate, now);
    const daysUntil = differenceInCalendarDays(nextReviewDate, now);

    let priority: 'high' | 'medium' | 'low' = 'low';
    if (overdue || daysUntil <= 0) {
      priority = 'high';
    } else if (daysUntil <= 2) {
      priority = 'medium';
    }

    const rankFocus = (item.rang_a_competence_count ?? 0) >= (item.rang_b_competence_count ?? 0) ? 'A' : 'B';

    plan.push({
      itemCode: item.item_code,
      title: item.title ?? '',
      theme: item.specialite ?? item.domaine_medical ?? 'Général',
      rankFocus,
      nextReview: nextReviewDate.toISOString(),
      intervalDays: interval,
      overdue,
      priority,
      progressPercentage: record?.progress_percentage ?? 0,
    });
  });

  return plan.sort((a, b) => (a.nextReview < b.nextReview ? -1 : 1));
};

export const useEdnProgressionData = (): EdnProgressionState => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<EdnUnifiedRow[]>([]);
  const [progressRecords, setProgressRecords] = useState<UserProgressRow[]>([]);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const testEnvironment = isTestEnvironment();

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        let userId: string | undefined;

        if (testEnvironment) {
          userId = 'test-edn-user';
        } else {
          const { data: authData } = await supabase.auth.getUser();
          userId = authData.user?.id;
        }

        const [unified, progress] = await Promise.all([
          ednProgressService.fetchUnifiedItems(),
          userId ? ednProgressService.fetchUserProgress(userId) : Promise.resolve([]),
        ]);

        if (!isMounted) return;

        setItems(unified);
        setProgressRecords(progress);
      } catch (err) {
        console.error('Erreur chargement progression EDN:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erreur inconnue');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [reloadKey]);

  const themeProgress = useMemo(() => buildThemeProgress(items, progressRecords), [items, progressRecords]);
  const history = useMemo(() => buildHistory(items, progressRecords), [items, progressRecords]);
  const repetitionPlan = useMemo(() => buildRepetitionPlan(items, progressRecords), [items, progressRecords]);
  const suggestions = useMemo(() => repetitionPlan.slice(0, 5), [repetitionPlan]);

  const refresh = () => setReloadKey((key) => key + 1);

  return {
    loading,
    error,
    items,
    themeProgress,
    history,
    repetitionPlan,
    suggestions,
    refresh,
  };
};
