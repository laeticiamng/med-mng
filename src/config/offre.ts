import { GENERATION_AUDIO_DISPONIBLE as AUDIO_OUVERT } from '../../supabase/functions/_shared/mm-disponibilite.ts';

/**
 * Offre commerciale Med MNG — source de vérité UNIQUE côté front.
 *
 * Décision produit : une offre simple, pensée pour les DFASM1-DFASM2 qui préparent
 * les EDN 2028 et 2029 (sessions d'octobre 2027 et 2028).
 *  - Gratuit : fiches officielles (compétences du référentiel LiSA 2026, rang A
 *    et rang B) pour les 367 items + contenu immersif complet (paroles, récit,
 *    planches, quiz) pour les 10 items d'essai listés dans `ITEMS_GRATUITS` :
 *    IC-1 (relation médecin-malade) et 9 items cliniques à fort poids
 *    d'appariement (décision DC5, 06.10.2026 ; critère : nombre de groupes de
 *    DES pondérant le rang B, arrêté du 19.04.2022, annexe 1). Liste à tenir
 *    alignée avec la fonction SQL `public.mm_items_gratuits()`
 *    (supabase/migrations/20261006071535_mm_items_essai_cliniques.sql).
 *  - Med MNG Premium : contenu immersif des 367 items + génération audio
 *    (quota mensuel `QUOTA_GENERATIONS_AUDIO_PREMIUM`).
 *
 * Toute évolution du prix doit être répercutée : Stripe (lookup_key,
 * supabase/functions/_shared/mm-stripe-catalog.ts), CGV/CGU, FAQ, JSON-LD,
 * public/llms.txt. Le quota audio est dupliqué côté serveur dans
 * supabase/functions/mm-generate-music/index.ts (le front ne fait pas foi).
 */

/**
 * Les 10 items d'essai dont le contenu immersif est accessible sans abonnement.
 * IC-1 Relation médecin-malade, IC-161 Infections urinaires, IC-154 Infections
 * broncho-pulmonaires communautaires, IC-27 Prévention des risques fœtaux,
 * IC-247 Diabète de type 1 et 2, IC-359 Détresse respiratoire aiguë, IC-224 HTA,
 * IC-340 AVC, IC-356 Appendicite, IC-66 Troubles dépressifs et anxieux.
 * Identique à `public.mm_items_gratuits()` côté serveur (qui fait foi).
 */
export const ITEMS_GRATUITS: readonly string[] = [
  'IC-1', 'IC-161', 'IC-154', 'IC-27', 'IC-247',
  'IC-359', 'IC-224', 'IC-340', 'IC-356', 'IC-66',
] as const;

export const NOMBRE_ITEMS_TOTAL = 367;
export const NOMBRE_ITEMS_GRATUITS = ITEMS_GRATUITS.length;

/** Générations audio incluses par mois dans Med MNG Premium. */
export const QUOTA_GENERATIONS_AUDIO_PREMIUM = 30;

export {
  GENERATION_AUDIO_DISPONIBLE,
  MESSAGE_GENERATION_SUSPENDUE,
} from '../../supabase/functions/_shared/mm-disponibilite.ts';

/**
 * Ce que l'offre promet pour l'audio, selon la disponibilité réelle (jamais de promesse
 * d'une génération immédiatement disponible pendant la suspension du 09.10.2026).
 */
export const PROMESSE_AUDIO = AUDIO_OUVERT
  ? `${QUOTA_GENERATIONS_AUDIO_PREMIUM} générations audio de chansons par mois`
  : 'génération audio des chansons : bientôt disponible (incluse dans Premium dès sa réouverture)';
/** Forme courte, dans une énumération (« paroles, récits, planches, quiz et … »). */
export const PROMESSE_AUDIO_COURTE = AUDIO_OUVERT ? 'génération audio' : 'génération audio (bientôt disponible)';

export const NOM_OFFRE_PREMIUM = 'Med MNG Premium';

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
