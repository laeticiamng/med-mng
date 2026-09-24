/**
 * Offre commerciale MED MNG — source de vérité UNIQUE côté front.
 *
 * Décision produit : une offre simple, pensée pour les D2-D3 qui préparent
 * les EDN 2027.
 *  - Gratuit : fiches officielles (compétences du référentiel LiSA 2026, rang A
 *    et rang B) pour les 367 items + contenu immersif complet (paroles, récit,
 *    planches, quiz) pour les 10 items d'essai listés dans `ITEMS_GRATUITS`.
 *  - MED MNG Premium : contenu immersif des 367 items + génération audio
 *    (quota mensuel `QUOTA_GENERATIONS_AUDIO_PREMIUM`).
 *
 * Toute évolution du prix doit être répercutée : Stripe (lookup_key,
 * supabase/functions/_shared/mm-stripe-catalog.ts), CGV/CGU, FAQ, JSON-LD,
 * public/llms.txt. Le quota audio est dupliqué côté serveur dans
 * supabase/functions/mm-generate-music/index.ts (le front ne fait pas foi).
 */

/** Les 10 items d'essai dont le contenu immersif est accessible sans abonnement. */
export const ITEMS_GRATUITS: readonly string[] = [
  'IC-1', 'IC-2', 'IC-3', 'IC-4', 'IC-5',
  'IC-6', 'IC-7', 'IC-8', 'IC-9', 'IC-10',
] as const;

export const NOMBRE_ITEMS_TOTAL = 367;
export const NOMBRE_ITEMS_GRATUITS = ITEMS_GRATUITS.length;

/** Générations audio incluses par mois dans MED MNG Premium. */
export const QUOTA_GENERATIONS_AUDIO_PREMIUM = 30;

export const NOM_OFFRE_PREMIUM = 'MED MNG Premium';

export type FormulePremium = 'annuel' | 'mensuel';

export const FORMULES_PREMIUM: Record<FormulePremium, {
  id: FormulePremium;
  libelle: string;
  /** Prix TTC en euros. */
  prix: number;
  periode: 'an' | 'mois';
  /** Prix affiché, format français. */
  prixAffiche: string;
  /** Équivalent mensuel affiché (formule annuelle uniquement). */
  equivalentMensuel?: string;
  /** Valeur envoyée à mm-create-checkout. */
  planCheckout: 'annual' | 'monthly';
}> = {
  annuel: {
    id: 'annuel',
    libelle: 'Annuel',
    prix: 69,
    periode: 'an',
    prixAffiche: '69 €/an',
    equivalentMensuel: '≈ 5,75 €/mois',
    planCheckout: 'annual',
  },
  mensuel: {
    id: 'mensuel',
    libelle: 'Mensuel',
    prix: 9.9,
    periode: 'mois',
    prixAffiche: '9,90 €/mois',
    planCheckout: 'monthly',
  },
};

/** Normalise un code item (« ic-3 », « IC-3 », « IC-003 ») en « IC-3 ». */
export const normaliserCodeItem = (code: string | null | undefined): string => {
  if (!code) return '';
  const m = /^ic-?0*(\d+)$/i.exec(code.trim());
  return m ? `IC-${parseInt(m[1], 10)}` : code.trim().toUpperCase();
};

/** L'item fait-il partie des 10 items d'essai gratuits ? */
export const estItemGratuit = (code: string | null | undefined): boolean =>
  ITEMS_GRATUITS.includes(normaliserCodeItem(code));

/** Accepte « annuel »/« annual »/« mensuel »/« monthly » (anciens liens compris). */
export const formuleDepuisParametre = (valeur: string | null | undefined): FormulePremium | null => {
  const v = (valeur || '').toLowerCase();
  if (v === 'annuel' || v === 'annual' || v === 'premium') return 'annuel';
  if (v === 'mensuel' || v === 'monthly') return 'mensuel';
  return null;
};
