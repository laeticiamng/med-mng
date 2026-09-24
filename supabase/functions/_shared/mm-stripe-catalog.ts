// Catalogue Stripe de MED MNG.
//
// Le compte Stripe est PARTAGÉ avec EmotionsCare : tout objet créé ici porte
// metadata.app = "medmng" et les prix sont retrouvés par lookup_key, jamais par
// un identifiant codé en dur (les anciens price IDs 19/29/39 € sont abandonnés).
import type Stripe from "https://esm.sh/stripe@18.5.0";

export const MM_APP = "medmng";

export type MmFormule = "annual" | "monthly";

export const MM_PRIX: Record<MmFormule, {
  lookup_key: string;
  unit_amount: number;
  interval: "year" | "month";
  nickname: string;
}> = {
  annual: {
    lookup_key: "medmng_premium_annual",
    unit_amount: 6900, // 69 € TTC / an
    interval: "year",
    nickname: "MED MNG Premium — annuel",
  },
  monthly: {
    lookup_key: "medmng_premium_monthly",
    unit_amount: 990, // 9,90 € TTC / mois
    interval: "month",
    nickname: "MED MNG Premium — mensuel",
  },
};

/** Identifiant du plan dans public.subscription_plans (clé étrangère de user_subscriptions.plan_id). */
export const MM_PLAN_ID = "premium";

const NOM_PRODUIT = "MED MNG Premium";

/** Retrouve le produit MED MNG Premium (metadata app=medmng) ou le crée. */
async function produitPremium(stripe: Stripe): Promise<string> {
  try {
    const recherche = await stripe.products.search({
      query: `metadata['app']:'${MM_APP}' AND metadata['offre']:'premium' AND active:'true'`,
      limit: 1,
    });
    if (recherche.data.length > 0) return recherche.data[0].id;
  } catch (_e) {
    // La recherche Stripe n'est pas disponible partout : on crée le produit.
  }
  const produit = await stripe.products.create({
    name: NOM_PRODUIT,
    description: "Contenu immersif des 367 items EDN et génération audio.",
    metadata: { app: MM_APP, offre: "premium" },
  });
  return produit.id;
}

/**
 * Retourne l'identifiant du prix Stripe de la formule, en le créant (produit
 * compris) s'il n'existe pas encore. Idempotent grâce au lookup_key.
 */
export async function prixMedMng(stripe: Stripe, formule: MmFormule): Promise<string> {
  const def = MM_PRIX[formule];
  const existants = await stripe.prices.list({ lookup_keys: [def.lookup_key], active: true, limit: 1 });
  if (existants.data.length > 0) return existants.data[0].id;

  const produit = await produitPremium(stripe);
  const prix = await stripe.prices.create({
    product: produit,
    currency: "eur",
    unit_amount: def.unit_amount,
    recurring: { interval: def.interval },
    lookup_key: def.lookup_key,
    nickname: def.nickname,
    tax_behavior: "inclusive",
    metadata: { app: MM_APP, formule },
  });
  return prix.id;
}

/**
 * Client Stripe MED MNG de l'utilisateur : recherché par metadata
 * (app=medmng ET supabase_user_id), jamais par e-mail seul — un client
 * EmotionsCare avec la même adresse ne doit pas être réutilisé.
 */
export async function clientMedMng(
  stripe: Stripe,
  userId: string,
  email: string | undefined,
  creerSiAbsent = true,
): Promise<string | null> {
  try {
    const recherche = await stripe.customers.search({
      query: `metadata['app']:'${MM_APP}' AND metadata['supabase_user_id']:'${userId}'`,
      limit: 1,
    });
    if (recherche.data.length > 0) return recherche.data[0].id;
  } catch (_e) {
    // Repli si l'API de recherche est indisponible : parcours par e-mail en
    // filtrant strictement sur les metadata.
    if (email) {
      const liste = await stripe.customers.list({ email, limit: 20 });
      const trouve = liste.data.find(
        (c) => c.metadata?.app === MM_APP && c.metadata?.supabase_user_id === userId,
      );
      if (trouve) return trouve.id;
    }
  }
  if (!creerSiAbsent) return null;
  const client = await stripe.customers.create({
    email,
    metadata: { app: MM_APP, supabase_user_id: userId },
  });
  return client.id;
}
