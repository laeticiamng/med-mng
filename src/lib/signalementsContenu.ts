import { supabase } from '@/integrations/supabase/client';
import {
  REFERENCE_SIGNALEMENT_MAX,
  type TypeContenuSignale,
} from '@/config/mentionsContenu';

/**
 * Envoi d'un signalement d'erreur sur un contenu (table
 * public.mm_signalements_contenu, migration 20261006013302).
 *
 * Le serveur renseigne lui-même user_id (auth.uid()), statut et created_at :
 * le client n'a le droit d'écrire que les quatre colonnes ci-dessous. Aucune
 * lecture, modification ni suppression n'est faite ici.
 */
export interface Signalement {
  itemCode: string;
  typeContenu: TypeContenuSignale;
  reference?: string | null;
  message: string;
}

export type ResultatSignalement =
  { ok: true } | { ok: false; raison: 'limite' | 'session' | 'erreur' };

interface ErreurPostgrest {
  message?: string;
  code?: string;
  hint?: string;
}

// La table n'est pas encore dans les types générés (src/integrations/supabase/types.ts).
type ClientInsertion = {
  from: (table: 'mm_signalements_contenu') => {
    insert: (
      ligne: Record<string, string | null>
    ) => PromiseLike<{ error: ErreurPostgrest | null }>;
  };
};

export async function envoyerSignalement(
  s: Signalement
): Promise<ResultatSignalement> {
  const reference =
    s.reference?.trim().slice(0, REFERENCE_SIGNALEMENT_MAX) || null;
  try {
    const { error } = await (supabase as unknown as ClientInsertion)
      .from('mm_signalements_contenu')
      .insert({
        item_code: s.itemCode,
        type_contenu: s.typeContenu,
        reference,
        message: s.message.trim(),
      });
    if (!error) return { ok: true };
    if (
      error.hint === 'mm_signalements_limite' ||
      /limite de \d+ signalements/i.test(error.message ?? '')
    ) {
      return { ok: false, raison: 'limite' };
    }
    if (
      error.code === '42501' ||
      /JWT|row-level security/i.test(error.message ?? '')
    ) {
      return { ok: false, raison: 'session' };
    }
    return { ok: false, raison: 'erreur' };
  } catch {
    return { ok: false, raison: 'erreur' };
  }
}
