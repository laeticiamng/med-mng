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

const mapTags = (itemTags?: { tags: { name: string } }[] | null): string[] => {
  const names = (itemTags ?? []).map(tag => tag.tags.name).filter(Boolean);
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
  const { data: itemsData, error } = await supabase
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
      ? supabase.from('favorites').select('item_id').eq('user_id', userId)
      : Promise.resolve({ data: [] as { item_id: string }[] }),
    userId
      ? supabase
          .from('user_progress')
          .select('item_id, status, last_seen_at, revision_count, score')
          .eq('user_id', userId)
      : Promise.resolve({
          data: [] as {
            item_id: string;
            status: ItemStatus;
            last_seen_at: string | null;
            revision_count: number | null;
            score: number | null;
          }[],
        }),
  ]);

  const favoriteIds = new Set((favoritesResponse.data ?? []).map(item => item.item_id));
  const progressMap = new Map(
    (progressResponse.data ?? []).map(item => [item.item_id, item])
  );

  return parsedItems.data.map(item => {
    const progress = progressMap.get(item.id);

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
      status: mapStatus(progress?.status),
      lastSeenAt: progress?.last_seen_at ?? null,
      isFavorite: favoriteIds.has(item.id),
      revisionCount: progress?.revision_count ?? 0,
      score: progress?.score ?? 0,
      hasAudio: Boolean(item.audios && item.audios.length > 0),
      popularityScore: progress?.revision_count ?? 0,
    };
  });
};

export const fetchItemDetail = async (
  itemCode: string,
  userId?: string
): Promise<ItemDetail> => {
  const { data, error } = await supabase
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
      ? supabase
          .from('favorites')
          .select('item_id')
          .eq('user_id', userId)
          .eq('item_id', data?.id ?? '')
          .maybeSingle()
      : Promise.resolve({ data: null as { item_id: string } | null }),
    userId
      ? supabase
          .from('user_progress')
          .select('status, last_seen_at, revision_count, score')
          .eq('user_id', userId)
          .eq('item_id', data?.id ?? '')
          .maybeSingle()
      : Promise.resolve({
          data: null as {
            status: ItemStatus;
            last_seen_at: string | null;
            revision_count: number | null;
            score: number | null;
          } | null,
        }),
  ]);

  const progress = progressResponse.data;

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
    status: mapStatus(progress?.status),
    lastSeenAt: progress?.last_seen_at ?? null,
    isFavorite: Boolean(favoritesResponse.data),
    revisionCount: progress?.revision_count ?? 0,
    score: progress?.score ?? 0,
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
  const { error } = await supabase.from('user_progress').upsert(
    {
      user_id: userId,
      item_id: itemId,
      status,
      last_seen_at: lastSeenAt,
      revision_count: revisionCount,
      score,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,item_id' }
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
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('item_id', itemId);

    if (error) {
      throw error;
    }

    return false;
  }

  const { error } = await supabase.from('favorites').insert({
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
      supabase.from('items').select('id', { count: 'exact', head: true }),
      supabase
        .from('user_progress')
        .select('item_id, status, last_seen_at, revision_count, items(id, code, title, type, specialties(name, code))')
        .eq('user_id', userId),
      supabase
        .from('profiles')
        .select('streak_current, streak_best, weekly_goal')
        .eq('id', userId)
        .maybeSingle(),
      supabase
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

  if (profileResponse.error) {
    throw profileResponse.error;
  }

  if (sessionsResponse.error) {
    throw sessionsResponse.error;
  }

  const progressItems = (progressResponse.data ?? []).map(row => {
    const item = row.items as {
      id: string;
      code: string;
      title: string;
      type: 'EDN' | 'ECOS' | 'SD';
      specialties?: { name: string; code: string } | null;
    } | null;

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
      status: mapStatus(row.status as ItemStatus | null),
      lastSeenAt: row.last_seen_at ?? null,
      revisionCount: row.revision_count ?? 0,
    } satisfies ProgressItem;
  });

  const deletedItemsCount = progressItems.filter(item => item === null).length;
  const totalProgressItems = progressItems.length;
  const deletedItemsRatio =
    totalProgressItems > 0 ? deletedItemsCount / totalProgressItems : 0;

  if (deletedItemsCount > 0 && deletedItemsRatio >= 0.5) {
    // A significant portion of the user's progress references deleted items.
    // Stats below are computed only on existing items.
    console.warn(
      `[medMngItemsService] ${deletedItemsCount} of ${totalProgressItems} progress items ` +
        'reference deleted content. Progress overview stats are based only on existing items.'
    );
  }
  const validProgressItems = progressItems.filter(
    (item): item is ProgressItem => Boolean(item)
  );

  const revisedCount = validProgressItems.filter(item => item.status === 'revised')
    .length;
  const inProgressCount = validProgressItems.filter(
    item => item.status === 'in_progress'
  ).length;
  const notStartedCount = validProgressItems.filter(item => item.status === 'not_started')
    .length;
  const streakCurrent = profileResponse.data?.streak_current ?? 0;
  const streakBest = profileResponse.data?.streak_best ?? 0;
  const weeklyGoal = profileResponse.data?.weekly_goal ?? 10;
  const weeklyRevisedCount = (sessionsResponse.data ?? []).reduce(
    (sum, session) => sum + (session.items_revised ?? 0),
    0
  );

  const specialtyStats = validProgressItems.reduce<Record<string, { total: number; revised: number }>>(
    (acc, item) => {
      const specialtyLabel = item.specialty ?? 'Sans spécialité';
      acc[specialtyLabel] = acc[specialtyLabel] ?? { total: 0, revised: 0 };
      acc[specialtyLabel].total += 1;
      if (item.status === 'revised') {
        acc[specialtyLabel].revised += 1;
      }
      return acc;
    },
    {}
  );

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
    recentActivity: (sessionsResponse.data ?? []).map(session => ({
      date: session.date,
      revisedCount: session.items_revised ?? 0,
    })),
    itemsToReview: validProgressItems
      .filter(item => item.status !== 'revised')
      .sort((a, b) => {
        const aTime = a.lastSeenAt ? new Date(a.lastSeenAt).getTime() : 0;
        const bTime = b.lastSeenAt ? new Date(b.lastSeenAt).getTime() : 0;
        return aTime - bTime;
      }),
  };
};
