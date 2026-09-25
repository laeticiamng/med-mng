// Webhook Stripe de MED MNG (API 2025-08-27.basil).
//
// Le compte Stripe est PARTAGÉ avec EmotionsCare : cet endpoint reçoit aussi
// leurs événements. On ne traite un événement que s'il appartient à MED MNG
// (metadata.app = "medmng") ou, pour les abonnements antérieurs sans metadata,
// s'il correspond à un abonnement déjà enregistré pour un utilisateur MED MNG.
// Tout le reste est ignoré (réponse 200 pour que Stripe n'insiste pas).
//
// Table écrite : public.user_subscriptions. Contrainte d'unicité réelle :
// UNIQUE(stripe_subscription_id) (migration 20251216120024). La table a été
// créée par 20250705102758 ; le CREATE TABLE IF NOT EXISTS de 20250729163226
// (qui déclarait UNIQUE(user_id)) n'a donc jamais été appliqué — d'où
// onConflict: "stripe_subscription_id".
//
// Erreur d'écriture en base → 500 : Stripe renverra l'événement.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { MM_APP, MM_PLAN_ID } from "../_shared/mm-stripe-catalog.ts";

const ANCIENS_PLANS = ["standard", "pro", "premium"];

const log = (msg: string, details?: unknown) =>
  console.log(`[MM-STRIPE-WEBHOOK] ${msg}${details ? ` - ${JSON.stringify(details)}` : ""}`);

class ErreurEcriture extends Error {}

/** Horodatage Stripe (secondes) → ISO, ou null si absent/invalide (jamais new Date(NaN)). */
const versIso = (secondes: unknown): string | null => {
  if (typeof secondes !== "number" || !Number.isFinite(secondes) || secondes <= 0) return null;
  const d = new Date(secondes * 1000);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

// deno-lint-ignore no-explicit-any
type SansType = any;

/** Période courante : depuis 2025-03-31.basil elle est portée par les items. */
const periodeAbonnement = (sub: Stripe.Subscription) => {
  const item = (sub.items?.data?.[0] ?? {}) as SansType;
  const s = sub as SansType;
  return {
    debut: versIso(item.current_period_start ?? s.current_period_start),
    fin: versIso(item.current_period_end ?? s.current_period_end),
  };
};

/** Identifiant d'abonnement d'une facture (nouveau champ parent, repli ancien champ). */
const abonnementDeFacture = (invoice: Stripe.Invoice): string | null => {
  const inv = invoice as SansType;
  const valeur = inv.parent?.subscription_details?.subscription ?? inv.subscription ?? null;
  if (!valeur) return null;
  return typeof valeur === "string" ? valeur : valeur.id ?? null;
};

/** Utilisateur déjà associé à cet abonnement en base (abonnements antérieurs sans metadata). */
async function utilisateurConnu(supabase: SupabaseClient, subscriptionId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("user_id")
    .eq("stripe_subscription_id", subscriptionId)
    .limit(1);
  if (error) throw new ErreurEcriture(`Lecture user_subscriptions : ${error.message}`);
  return data?.[0]?.user_id ?? null;
}

/** Utilisateur MED MNG d'un abonnement Stripe, ou null si l'événement n'est pas pour nous. */
async function utilisateurAbonnement(supabase: SupabaseClient, sub: Stripe.Subscription): Promise<string | null> {
  const app = sub.metadata?.app;
  if (app && app !== MM_APP) return null; // EmotionsCare ou autre application
  if (app === MM_APP && sub.metadata?.supabase_user_id) return sub.metadata.supabase_user_id;
  return await utilisateurConnu(supabase, sub.id);
}

async function enregistrerAbonnement(
  supabase: SupabaseClient,
  userId: string,
  sub: Stripe.Subscription,
  planId: string,
) {
  const { debut, fin } = periodeAbonnement(sub);
  const ligne: Record<string, unknown> = {
    user_id: userId,
    plan_id: planId,
    stripe_subscription_id: sub.id,
    status: sub.status, // orthographe Stripe : 'canceled'
  };
  if (debut) ligne.current_period_start = debut;
  if (fin) ligne.current_period_end = fin;

  const { error } = await supabase
    .from("user_subscriptions")
    .upsert(ligne, { onConflict: "stripe_subscription_id" });
  if (error) throw new ErreurEcriture(`Upsert user_subscriptions : ${error.message}`);
  log("Abonnement enregistré", { userId, subscriptionId: sub.id, status: sub.status, fin });
}

async function majStatut(supabase: SupabaseClient, subscriptionId: string, status: string) {
  const { error } = await supabase
    .from("user_subscriptions")
    .update({ status })
    .eq("stripe_subscription_id", subscriptionId);
  if (error) throw new ErreurEcriture(`Mise à jour du statut : ${error.message}`);
  log("Statut mis à jour", { subscriptionId, status });
}

/** Archivage des factures : utile mais non critique (la table peut ne pas exister). */
async function archiverFacture(supabase: SupabaseClient, invoice: Stripe.Invoice, subscriptionId: string, statut: string) {
  const { error } = await supabase.from("subscription_invoices").upsert({
    stripe_invoice_id: invoice.id,
    stripe_subscription_id: subscriptionId,
    amount: statut === "paid" ? invoice.amount_paid : invoice.amount_due,
    currency: invoice.currency,
    status: statut,
    invoice_url: invoice.hosted_invoice_url,
    created_at: versIso(invoice.created) ?? new Date().toISOString(),
  }, { onConflict: "stripe_invoice_id" });
  if (error) console.warn("[MM-STRIPE-WEBHOOK] Facture non archivée (non bloquant) :", error.message);
}

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();
  if (!signature) return new Response("Signature absente", { status: 400 });

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  // Compte Stripe partagé avec EmotionsCare : chaque point de terminaison webhook a sa propre
  // clé de signature. MED MNG lit MM_STRIPE_WEBHOOK_SECRET, avec repli sur STRIPE_WEBHOOK_SECRET.
  const webhookSecret = Deno.env.get("MM_STRIPE_WEBHOOK_SECRET") ?? Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    console.error("[MM-STRIPE-WEBHOOK] Configuration Stripe manquante");
    return new Response("Configuration manquante", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error("[MM-STRIPE-WEBHOOK] Signature invalide :", err instanceof Error ? err.message : err);
    return new Response("Signature invalide", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const ignorer = (raison: string) => {
    log(`Événement ignoré (${raison})`, { type: event.type, id: event.id });
    return new Response(JSON.stringify({ received: true, ignored: raison }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  };

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") return ignorer("pas un abonnement");

        const app = session.metadata?.app;
        if (app && app !== MM_APP) return ignorer("autre application");

        let userId: string | null = null;
        let planId = MM_PLAN_ID;
        if (app === MM_APP) {
          userId = session.client_reference_id || session.metadata?.supabase_user_id || null;
        } else {
          // Sessions antérieures à la refonte : metadata { user_id, plan }.
          const ancienPlan = session.metadata?.plan || session.metadata?.plan_id;
          if (session.metadata?.user_id && ancienPlan && ANCIENS_PLANS.includes(ancienPlan)) {
            userId = session.metadata.user_id;
            planId = ancienPlan;
          }
        }
        if (!userId) return ignorer("utilisateur non identifiable");

        const subscriptionId = typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
        if (!subscriptionId) return ignorer("session sans abonnement");

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        await enregistrerAbonnement(supabase, userId, sub, planId);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await utilisateurAbonnement(supabase, sub);
        if (!userId) return ignorer("abonnement hors MED MNG");

        // On conserve le plan déjà enregistré (abonnés des anciennes formules).
        const { data: existant, error } = await supabase
          .from("user_subscriptions")
          .select("plan_id")
          .eq("stripe_subscription_id", sub.id)
          .limit(1);
        if (error) throw new ErreurEcriture(`Lecture user_subscriptions : ${error.message}`);
        await enregistrerAbonnement(supabase, userId, sub, existant?.[0]?.plan_id ?? MM_PLAN_ID);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await utilisateurAbonnement(supabase, sub);
        if (!userId) return ignorer("abonnement hors MED MNG");
        await majStatut(supabase, sub.id, "canceled");
        break;
      }

      case "invoice.payment_succeeded":
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = abonnementDeFacture(invoice);
        if (!subscriptionId) return ignorer("facture sans abonnement");
        const userId = await utilisateurConnu(supabase, subscriptionId);
        if (!userId) return ignorer("facture hors MED MNG");
        await archiverFacture(supabase, invoice, subscriptionId, "paid");
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = abonnementDeFacture(invoice);
        if (!subscriptionId) return ignorer("facture sans abonnement");
        const userId = await utilisateurConnu(supabase, subscriptionId);
        if (!userId) return ignorer("facture hors MED MNG");
        await majStatut(supabase, subscriptionId, "past_due");
        await archiverFacture(supabase, invoice, subscriptionId, "failed");
        break;
      }

      default:
        return ignorer("type non géré");
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[MM-STRIPE-WEBHOOK] Erreur de traitement :", message);
    // 500 : Stripe réessaiera (écriture en base ou appel Stripe en échec).
    return new Response(JSON.stringify({ error: "Traitement impossible" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
