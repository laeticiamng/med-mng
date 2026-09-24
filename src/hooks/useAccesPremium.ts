import { useCallback } from 'react';
import { useAuth } from '@/components/med-mng/AuthProvider';
import { useSubscription } from '@/hooks/useSubscription';
import { estItemGratuit } from '@/config/offre';

/**
 * Accès au contenu immersif (paroles, récit, planches, quiz).
 *
 *  - `aAccesPremium` : abonnement MED MNG Premium actif ;
 *  - `peutVoirItem(code)` : item d'essai (ITEMS_GRATUITS) ou accès Premium.
 *
 * Tant que la vérification est en cours (`chargement`), `peutVoirItem`
 * renvoie `true` pour un item gratuit et `false` sinon : l'encart Premium
 * peut apparaître brièvement chez un abonné, jamais l'inverse.
 *
 * Verrouillage d'affichage : la protection serveur est décrite dans
 * supabase/migrations/20260924121000_mm_contenu_premium.sql.
 */
export function useAccesPremium() {
  const { user, loading: chargementAuth } = useAuth();
  const { isSubscriptionActive, loading: chargementAbonnement } = useSubscription();

  const aAccesPremium = Boolean(user) && isSubscriptionActive();
  const chargement = chargementAuth || (Boolean(user) && chargementAbonnement);

  const peutVoirItem = useCallback(
    (itemCode: string | null | undefined) => estItemGratuit(itemCode) || aAccesPremium,
    [aAccesPremium]
  );

  return { aAccesPremium, peutVoirItem, chargement, connecte: Boolean(user) };
}
