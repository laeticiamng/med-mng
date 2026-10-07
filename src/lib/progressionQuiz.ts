/**
 * Fin d'un quiz d'item → données lues par /edn-complete (useProgressionEdn).
 *
 * Deux écritures, toutes deux protégées par RLS « auth.uid() = user_id » :
 *  - `revision_history` : une ligne par quiz terminé (« Items travaillés »,
 *    « dernier item commencé ») ;
 *  - `user_item_progress` : carte de répétition espacée SM-2 via
 *    `useSRS.recordReview` (« À revoir aujourd'hui », « maîtrisés »).
 *
 * Le code d'item est normalisé (« IC-007 » → « IC-7 ») : c'est le format de
 * `edn_items_immersive.item_code` et de la contrainte UNIQUE (user_id, item_code).
 */
import { normaliserCodeItem } from '@/config/offre';
import { jourLocal } from '@/lib/jourLocal';
import type { ReviewQuality } from '@/hooks/useSRS';

/**
 * Score du quiz (%) → qualité SM-2 (0-5). Sous 60 %, la révision est un échec
 * (qualité < 3) : la carte repasse en réapprentissage et redevient à revoir
 * aujourd'hui.
 */
export function qualiteDepuisPourcentage(pourcentage: number): ReviewQuality {
  if (!Number.isFinite(pourcentage) || pourcentage <= 0) return 0;
  if (pourcentage >= 100) return 5;
  if (pourcentage >= 80) return 4;
  if (pourcentage >= 60) return 3;
  if (pourcentage >= 40) return 2;
  return 1;
}

/**
 * Faut-il faire avancer la carte de répétition espacée ?
 * - pas encore de carte : oui (création) ;
 * - échec : oui (la carte repasse en réapprentissage) ;
 * - réussite alors que la révision n'est pas encore due : non. Refaire le même
 *   quiz cinq fois d'affilée ne doit pas rendre un item « maîtrisé ».
 */
export function doitAvancerCarte(
  carte: { next_review_date: string | null } | null,
  qualite: ReviewQuality,
  maintenant: Date,
): boolean {
  if (!carte || qualite < 3 || !carte.next_review_date) return true;
  const echeance = new Date(carte.next_review_date);
  return Number.isNaN(echeance.getTime()) || echeance.getTime() <= maintenant.getTime();
}

type ResultatSupabase = { data?: unknown; error: { message?: string } | null };

/** Sous-ensemble du client Supabase utilisé ici (injecté pour les tests). */
export interface ClientProgression {
  from(table: string): {
    insert(valeurs: Record<string, unknown>): PromiseLike<ResultatSupabase>;
    select(colonnes: string): {
      eq(col: string, val: string): {
        eq(col: string, val: string): { maybeSingle(): PromiseLike<ResultatSupabase> };
      };
    };
  };
}

export type EnregistrerRevision = (
  userId: string,
  itemCode: string,
  quality: ReviewQuality,
) => Promise<{ success: boolean }>;

export interface ResultatEnregistrement {
  historique: boolean;
  /** true si la carte a été écrite, false si l'écriture a échoué, null si non due. */
  carte: boolean | null;
}

export async function enregistrerProgressionQuiz(
  client: ClientProgression,
  recordReview: EnregistrerRevision,
  { userId, itemCode, pourcentage, maintenant = new Date() }: {
    userId: string;
    itemCode: string;
    pourcentage: number;
    maintenant?: Date;
  },
): Promise<ResultatEnregistrement> {
  const code = normaliserCodeItem(itemCode);
  const qualite = qualiteDepuisPourcentage(pourcentage);

  const { error: erreurHistorique } = await client.from('revision_history').insert({
    user_id: userId,
    item_code: code,
    score: Math.max(0, Math.min(100, Math.round(pourcentage))),
    session_date: jourLocal(maintenant),
  });
  if (erreurHistorique) console.error('revision_history non enregistré :', erreurHistorique);

  const { data: carte, error: erreurCarte } = await client
    .from('user_item_progress')
    .select('next_review_date')
    .eq('user_id', userId)
    .eq('item_code', code)
    .maybeSingle();
  if (erreurCarte) console.error('Lecture de la carte de révision impossible :', erreurCarte);

  let carteEcrite: boolean | null = null;
  if (doitAvancerCarte((carte as { next_review_date: string | null } | null) ?? null, qualite, maintenant)) {
    const { success } = await recordReview(userId, code, qualite);
    carteEcrite = success;
  }

  return { historique: !erreurHistorique, carte: carteEcrite };
}
