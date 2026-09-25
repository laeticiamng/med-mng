import { supabase } from '@/integrations/supabase/client';
import type {
  ItemDetail,
  ItemNote,
  ItemStatus,
  ItemSummary,
  ProgressOverview,
  ProgressItem,
} from '@/types/medMngItems';

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

/**
 * SOURCE DES DONNÉES — corrigé le 18/09/2026.
 *
 * Ce service interrogeait `items`, `specialties`, `item_tags`, `tags`,
 * `audios` et `fiches`. AUCUNE de ces six tables n'existe en base : la
 * bibliothèque d'items et les favoris ne pouvaient donc rien afficher.
 *
 * Les données existent, mais dans une seule table dénormalisée :
 * `edn_items_complete` (367 lignes — les 367 items annoncés sur l'accueil),
 * qui porte déjà la spécialité, les mots-clés, les tags et les tableaux de
 * rang A/B. Les favoris vivent dans `user_edn_favorites`, indexés par
 * `item_code`. On branche donc sur ces tables plutôt que de recréer un
 * schéma parallèle qui dupliquerait les mêmes informations.
 */

// Colonnes publiques uniquement (src/lib/colonnesEdnPubliques.ts) :
// `paroles_musicales` n'est plus lue ici — contenu Premium réservé à la RPC
// mm_contenu_immersif_item, et `hasAudio` ne dépend plus d'elle.
const COLONNES_ITEM =
  'id, item_code, title, subtitle, slug, specialite, domaine_medical, mots_cles, ' +
  'tags_medicaux, competences_count_rang_a, competences_count_rang_b, created_at';

/** Rang déduit du nombre de compétences OIC de chaque rang. */
const deduireRang = (rangA?: number | null, rangB?: number | null): 'A' | 'B' | 'AB' | null => {
  const a = (rangA ?? 0) > 0;
  const b = (rangB ?? 0) > 0;
  if (a && b) return 'AB';
  if (a) return 'A';
  if (b) return 'B';
  return null;
};

const versTableauDeTextes = (valeur: unknown): string[] =>
  Array.isArray(valeur) ? valeur.filter((v): v is string => typeof v === 'string') : [];

const construireResume = (
  ligne: any,
  favoris: Set<string>,
  progression: Map<string, any>,
  itemsAvecAudio: Set<string>,
): ItemSummary => {
  const p = progression.get(ligne.id);
  return {
    id: ligne.id,
    code: ligne.item_code,
    title: ligne.title,
    specialty: ligne.specialite ?? ligne.domaine_medical ?? null,
    specialtyCode: ligne.domaine_medical ?? null,
    itemType: 'EDN',
    rang: deduireRang(ligne.competences_count_rang_a, ligne.competences_count_rang_b),
    createdAt: ligne.created_at,
    keywords: versTableauDeTextes(ligne.mots_cles),
    tags: versTableauDeTextes(ligne.tags_medicaux),
    status: mapStatus(p?.mastery_level),
    lastSeenAt: p?.last_accessed ?? null,
    isFavorite: favoris.has(ligne.item_code),
    revisionCount: p?.attempts_count ?? 0,
    score: p?.best_score ?? 0,
    // `hasAudio` pilote la pastille « note de musique » de la bibliothèque.
    // Elle était vraie dès qu'il existait un champ TEXTE `paroles_musicales`,
    // donc sur 367 items sur 367, alors qu'aucun fichier audio n'existe.
    // On la fait dépendre des pistes réellement générées.
    hasAudio: itemsAvecAudio.has(ligne.item_code),
    popularityScore: p?.attempts_count ?? 0,
  };
};

/** Items pour lesquels une piste audio a réellement été générée. */
const chargerItemsAvecAudio = async (): Promise<Set<string>> => {
  const { data } = await (supabase as any)
    .from('generated_music_tracks')
    .select('metadata')
    .eq('generation_status', 'completed')
    .not('audio_url', 'is', null);

  return new Set<string>(
    (data ?? [])
      .map((piste: any) => piste?.metadata?.itemCode)
      .filter((code: unknown): code is string => typeof code === 'string' && code.length > 0),
  );
};

/** Favoris et progression de la personne, en une passe. */
const chargerContexteUtilisateur = async (userId?: string) => {
  if (!userId) return { favoris: new Set<string>(), progression: new Map<string, any>() };

  const [favorisRep, progressionRep] = await Promise.all([
    (supabase as any).from('user_edn_favorites').select('item_code').eq('user_id', userId),
    (supabase as any)
      .from('user_progress')
      .select('content_id, mastery_level, last_accessed, attempts_count, best_score')
      .eq('user_id', userId)
      .eq('content_type', 'item'),
  ]);

  return {
    favoris: new Set<string>((favorisRep.data ?? []).map((f: any) => f.item_code)),
    progression: new Map<string, any>((progressionRep.data ?? []).map((p: any) => [p.content_id, p])),
  };
};

export const fetchItemsWithMeta = async (userId?: string): Promise<ItemSummary[]> => {
  const { data: lignes, error } = await (supabase as any)
    .from('edn_items_complete')
    .select(COLONNES_ITEM)
    .eq('status', 'active')
    .order('item_code', { ascending: true });

  if (error) {
    throw error;
  }

  const [{ favoris, progression }, itemsAvecAudio] = await Promise.all([
    chargerContexteUtilisateur(userId),
    chargerItemsAvecAudio(),
  ]);
  return (lignes ?? []).map((ligne: any) => construireResume(ligne, favoris, progression, itemsAvecAudio));
};

/** Un tableau de rang devient une « fiche » affichable. */
const tableauVersFiche = (
  tableau: any,
  rang: 'A' | 'B',
  itemCode: string,
): ItemNote | null => {
  if (!tableau) return null;
  return {
    id: `${itemCode}-rang-${rang.toLowerCase()}`,
    title: tableau.title ?? `${itemCode} — Rang ${rang}`,
    content: tableau,
    contentType: 'table',
    rang,
  };
};

export const fetchItemDetail = async (
  itemCode: string,
  userId?: string
): Promise<ItemDetail> => {
  const { data: ligne, error } = await (supabase as any)
    .from('edn_items_complete')
    .select(`${COLONNES_ITEM}, tableau_rang_a, tableau_rang_b`)
    .eq('item_code', itemCode)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!ligne) {
    throw new Error(`Item introuvable : ${itemCode}`);
  }

  const [{ favoris, progression }, itemsAvecAudio] = await Promise.all([
    chargerContexteUtilisateur(userId),
    chargerItemsAvecAudio(),
  ]);
  const resume = construireResume(ligne, favoris, progression, itemsAvecAudio);

  // Les « fiches » ne sont pas une table : ce sont les tableaux de rang A et B
  // portés par l'item lui-même.
  const notes = [
    tableauVersFiche(ligne.tableau_rang_a, 'A', ligne.item_code),
    tableauVersFiche(ligne.tableau_rang_b, 'B', ligne.item_code),
  ].filter((n): n is ItemNote => n !== null);

  // Aucune table ne relie aujourd'hui un item à ses enregistrements audio :
  // `med_mng_songs` ne contient que les chansons générées par les
  // utilisateurs, sans référence à l'item. La liste reste donc vide tant que
  // ce lien n'existe pas — plutôt que d'inventer une correspondance fausse.
  return { ...resume, notes, audios: [] };
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
  itemCode,
  itemTitle,
  isFavorite,
}: {
  userId: string;
  itemCode: string;
  itemTitle?: string;
  isFavorite: boolean;
}) => {
  // `favorites` n'existe pas en base. La table réelle est
  // `user_edn_favorites`, indexée par `item_code` (et non par un identifiant).
  if (isFavorite) {
    const { error } = await (supabase as any)
      .from('user_edn_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('item_code', itemCode);

    if (error) throw error;
    return false;
  }

  const { error } = await (supabase as any).from('user_edn_favorites').insert({
    user_id: userId,
    item_code: itemCode,
    item_title: itemTitle ?? itemCode,
  });

  if (error) throw error;
  return true;
};

export const fetchProgressOverview = async (
  userId: string
): Promise<ProgressOverview> => {
  const [itemsCountResponse, progressResponse, profileResponse, sessionsResponse] =
    await Promise.all([
      (supabase as any)
        .from('edn_items_complete')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active'),
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

  if (profileResponse.error) {
    throw profileResponse.error;
  }

  if (sessionsResponse.error) {
    throw sessionsResponse.error;
  }

  // Get item details for progress items
  const contentIds = (progressResponse.data ?? []).map((row: any) => row.content_id);
  let itemsMap = new Map<string, any>();
  
  if (contentIds.length > 0) {
    const { data: itemsData } = await (supabase as any)
      .from('edn_items_complete')
      .select('id, item_code, title, specialite, domaine_medical')
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
      code: item.item_code,
      title: item.title,
      specialty: item.specialite ?? item.domaine_medical ?? null,
      specialtyCode: item.domaine_medical ?? null,
      itemType: 'EDN',
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
    if (import.meta.env.DEV) {
      console.warn(
        `[medMngItemsService] ${deletedItemsCount} of ${totalProgressItems} progress items ` +
          'reference deleted content. Progress overview stats are based only on existing items.'
      );
    }
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
  const profileData = profileResponse.data as any;
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
