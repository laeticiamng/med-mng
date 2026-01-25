import { supabase } from '@/integrations/supabase/client';
import {
  itemDetailSchema,
  itemSummariesSchema,
} from '@/schemas/medMngItemSchema';
import type {
  ItemDetail,
  ItemStatus,
  ItemSummary,
  ProgressOverview,
  ProgressItem,
} from '@/types/medMngItems';

const mapTags = (itemTags?: { tags?: { name?: string } }[] | null): string[] => {
  const names = (itemTags ?? []).map(tag => tag.tags?.name).filter((n): n is string => Boolean(n));
  return Array.from(new Set(names));
};

const mapStatus = (status?: string | ItemStatus | null): ItemStatus => {
  if (status === 'in_progress' || status === 'revised') {
    return status;
  }
  if (status === 'done') {
    return 'revised';
  }
  if (status === 'todo') {
    return 'not_started';
  }
  return 'not_started';
};

export const fetchItemsWithMeta = async (userId?: string): Promise<ItemSummary[]> => {
  const { data: itemsData, error } = await (supabase as any)
    .from('items')
    .select(
      'id, code, title, type, rang, created_at, keywords, specialties(name, code), item_tags(tags(name)), audios(id)'
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const parsedItems = itemSummariesSchema.safeParse(itemsData ?? []);
  if (!parsedItems.success) {
    console.error('Invalid items payload', parsedItems.error.flatten());
    return [];
  }

  const [favoritesResponse, progressResponse] = await Promise.all([
    userId
      ? (supabase as any).from('favorites').select('item_id').eq('user_id', userId)
      : Promise.resolve({ data: [] as { item_id: string }[] }),
    userId
      ? (supabase as any)
          .from('user_progress')
          .select('content_id, mastery_level, last_accessed, attempts_count, best_score')
          .eq('user_id', userId)
          .eq('content_type', 'item')
      : Promise.resolve({
          data: [] as {
            content_id: string;
            mastery_level: string | null;
            last_accessed: string | null;
            attempts_count: number | null;
            best_score: number | null;
          }[],
        }),
  ]);

  const favoriteIds = new Set((favoritesResponse.data ?? []).map((item: any) => item.item_id));
  const progressMap = new Map(
    (progressResponse.data ?? []).map((item: any) => [item.content_id, item])
  );

  return parsedItems.data.map(item => {
    const progress = progressMap.get(item.id) as any;

    return {
      id: item.id,
      code: item.code,
      title: item.title,
      specialty: item.specialties?.name ?? null,
      specialtyCode: item.specialties?.code ?? null,
      itemType: item.type,
      rang: item.rang ?? null,
      createdAt: item.created_at,
      keywords: item.keywords ?? [],
      tags: mapTags(item.item_tags),
      status: mapStatus(progress?.mastery_level),
      lastSeenAt: progress?.last_accessed ?? null,
      isFavorite: favoriteIds.has(item.id),
      revisionCount: progress?.attempts_count ?? 0,
      score: progress?.best_score ?? 0,
      hasAudio: Boolean(item.audios && item.audios.length > 0),
      popularityScore: progress?.attempts_count ?? 0,
    };
  });
};

export const fetchItemDetail = async (
  itemCode: string,
  userId?: string
): Promise<ItemDetail> => {
  const { data, error } = await (supabase as any)
    .from('items')
    .select(
      'id, code, title, type, rang, created_at, keywords, specialties(name, code), fiches(id, title, content, type, rang), audios(id, title, url, stream_url, duration, rang, bpm, style), item_tags(tags(name))'
    )
    .eq('code', itemCode)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Item not found');
  }

  const parsed = itemDetailSchema.safeParse(data);
  if (!parsed.success) {
    console.error('Invalid item detail payload', parsed.error.flatten());
    throw new Error('Invalid item detail payload');
  }

  const [favoritesResponse, progressResponse] = await Promise.all([
    userId
      ? (supabase as any)
          .from('favorites')
          .select('item_id')
          .eq('user_id', userId)
          .eq('item_id', data?.id ?? '')
          .maybeSingle()
      : Promise.resolve({ data: null as { item_id: string } | null }),
    userId
      ? (supabase as any)
          .from('user_progress')
          .select('mastery_level, last_accessed, attempts_count, best_score')
          .eq('user_id', userId)
          .eq('content_type', 'item')
          .eq('content_id', data?.id ?? '')
          .maybeSingle()
      : Promise.resolve({
          data: null as {
            mastery_level: string | null;
            last_accessed: string | null;
            attempts_count: number | null;
            best_score: number | null;
          } | null,
        }),
  ]);

  const progress = progressResponse.data as any;

  return {
    id: parsed.data.id,
    code: parsed.data.code,
    title: parsed.data.title,
    specialty: parsed.data.specialties?.name ?? null,
    specialtyCode: parsed.data.specialties?.code ?? null,
    itemType: parsed.data.type,
    rang: parsed.data.rang ?? null,
    createdAt: parsed.data.created_at,
    keywords: parsed.data.keywords ?? [],
    tags: mapTags(parsed.data.item_tags),
    notes: (parsed.data.fiches ?? []).map(note => ({
      id: note.id,
      title: note.title,
      content: note.content,
      contentType: note.type ?? 'text',
      rang: note.rang ?? null,
    })),
    audios: (parsed.data.audios ?? []).map(audio => ({
      id: audio.id,
      title: audio.title,
      audioUrl: audio.url,
      streamUrl: audio.stream_url ?? null,
      durationSeconds: audio.duration ?? null,
      rang: audio.rang,
      bpm: audio.bpm ?? null,
      style: audio.style ?? null,
    })),
    status: mapStatus(progress?.mastery_level),
    lastSeenAt: progress?.last_accessed ?? null,
    isFavorite: Boolean(favoritesResponse.data),
    revisionCount: progress?.attempts_count ?? 0,
    score: progress?.best_score ?? 0,
    hasAudio: Boolean(parsed.data.audios && parsed.data.audios.length > 0),
    popularityScore: progress?.attempts_count ?? 0,
  };
};

export const upsertItemProgress = async ({
  userId,
  itemId,
  status,
  lastSeenAt,
  revisionCount,
  score,
}: {
  userId: string;
  itemId: string;
  status: ItemStatus;
  lastSeenAt: string | null;
  revisionCount: number;
  score: number;
}) => {
  // Map status to progress_percentage
  const progressPercentage = status === 'revised' ? 100 : status === 'in_progress' ? 50 : 0;
  
  const { error } = await (supabase as any).from('user_progress').upsert(
    {
      user_id: userId,
      content_type: 'item',
      content_id: itemId,
      progress_percentage: progressPercentage,
      best_score: score,
      attempts_count: revisionCount,
      last_accessed: lastSeenAt,
      mastery_level: status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,content_type,content_id' }
  );

  if (error) {
    throw error;
  }
};

export const toggleFavoriteItem = async ({
  userId,
  itemId,
  isFavorite,
}: {
  userId: string;
  itemId: string;
  isFavorite: boolean;
}) => {
  if (isFavorite) {
    const { error } = await (supabase as any)
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId);

    if (error) {
      throw error;
    }

    return false;
  }

  const { error } = await (supabase as any).from('favorites').insert({
    user_id: userId,
    item_id: itemId,
  });

  if (error) {
    throw error;
  }

  return true;
};

export const fetchProgressOverview = async (
  userId: string
): Promise<ProgressOverview> => {
  const [itemsCountResponse, progressResponse, profileResponse, sessionsResponse] =
    await Promise.all([
      (supabase as any).from('items').select('id', { count: 'exact', head: true }),
      (supabase as any)
        .from('user_progress')
        .select('content_id, mastery_level, last_accessed, attempts_count')
        .eq('user_id', userId)
        .eq('content_type', 'item'),
      supabase
        .from('profiles')
        .select('streak_current, streak_best, weekly_goal')
        .eq('id', userId)
        .maybeSingle(),
      (supabase as any)
        .from('study_sessions')
        .select('date, items_revised')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(7),
    ]);

  if (itemsCountResponse.error) {
    throw itemsCountResponse.error;
  }

  if (progressResponse.error) {
    throw progressResponse.error;
  }

  if (profileResponse._error) {
    throw profileResponse._error;
  }

  if (sessionsResponse.error) {
    throw sessionsResponse.error;
  }

  // Get item details for progress items
  const contentIds = (progressResponse.data ?? []).map((row: any) => row.content_id);
  let itemsMap = new Map<string, any>();
  
  if (contentIds.length > 0) {
    const { data: itemsData } = await (supabase as any)
      .from('items')
      .select('id, code, title, type, specialties(name, code)')
      .in('id', contentIds);
    
    if (itemsData) {
      itemsMap = new Map(itemsData.map((item: any) => [item.id, item]));
    }
  }

  const progressItems = (progressResponse.data ?? []).map((row: any) => {
    const item = itemsMap.get(row.content_id);

    if (!item) {
      return null;
    }

    return {
      id: item.id,
      code: item.code,
      title: item.title,
      specialty: item.specialties?.name ?? null,
      specialtyCode: item.specialties?.code ?? null,
      itemType: item.type,
      status: mapStatus(row.mastery_level),
      lastSeenAt: row.last_accessed ?? null,
      revisionCount: row.attempts_count ?? 0,
    } satisfies ProgressItem;
  });

  const deletedItemsCount = progressItems.filter((item: any) => item === null).length;
  const totalProgressItems = progressItems.length;
  const deletedItemsRatio =
    totalProgressItems > 0 ? deletedItemsCount / totalProgressItems : 0;

  if (deletedItemsCount > 0 && deletedItemsRatio >= 0.5) {
    console.warn(
      `[medMngItemsService] ${deletedItemsCount} of ${totalProgressItems} progress items ` +
        'reference deleted content. Progress overview stats are based only on existing items.'
    );
  }
  const validProgressItems = progressItems.filter(
    (item: any): item is ProgressItem => Boolean(item)
  );

  const revisedCount = validProgressItems.filter((item: any) => item.status === 'revised')
    .length;
  const inProgressCount = validProgressItems.filter(
    (item: any) => item.status === 'in_progress'
  ).length;
  const notStartedCount = validProgressItems.filter((item: any) => item.status === 'not_started')
    .length;
  const profileData = profileResponse._data as any;
  const streakCurrent = profileData?.streak_current ?? 0;
  const streakBest = profileData?.streak_best ?? 0;
  const weeklyGoal = profileData?.weekly_goal ?? 10;
  const weeklyRevisedCount = (sessionsResponse.data ?? []).reduce(
    (sum: number, session: any) => sum + (session.items_revised ?? 0),
    0
  );

  const specialtyStats: Record<string, { total: number; revised: number }> = {};
  validProgressItems.forEach((item: any) => {
    const specialtyLabel = item.specialty ?? 'Sans spécialité';
    if (!specialtyStats[specialtyLabel]) {
      specialtyStats[specialtyLabel] = { total: 0, revised: 0 };
    }
    specialtyStats[specialtyLabel].total += 1;
    if (item.status === 'revised') {
      specialtyStats[specialtyLabel].revised += 1;
    }
  });

  return {
    totalItems: itemsCountResponse.count ?? 0,
    revisedCount,
    inProgressCount,
    notStartedCount,
    streakCurrent,
    streakBest,
    weeklyGoal,
    weeklyRevisedCount,
    specialtyStats: Object.entries(specialtyStats).map(([specialty, values]) => ({
      specialty,
      total: values.total,
      revised: values.revised,
    })),
    recentActivity: (sessionsResponse.data ?? []).map((session: any) => ({
      date: session.date,
      revisedCount: session.items_revised ?? 0,
    })),
    itemsToReview: validProgressItems
      .filter((item: any) => item.status !== 'revised')
      .sort((a: any, b: any) => {
        const aTime = a.lastSeenAt ? new Date(a.lastSeenAt).getTime() : 0;
        const bTime = b.lastSeenAt ? new Date(b.lastSeenAt).getTime() : 0;
        return aTime - bTime;
      }),
  };
};
