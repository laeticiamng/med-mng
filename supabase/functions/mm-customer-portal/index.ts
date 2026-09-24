// Copie propre à MED MNG : EmotionsCare partage le même projet Supabase et déploie
// sa propre fonction « customer-portal » sous ce nom ; les deux s'écrasaient mutuellement.
//
// Ouvre le portail client Stripe (gérer / résilier l'abonnement, factures).
// Le client est retrouvé par metadata (app=medmng, supabase_user_id) — jamais
// par e-mail seul, le compte Stripe étant partagé avec EmotionsCare.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { clientMedMng } from "../_shared/mm-stripe-catalog.ts";

const ORIGINE_PAR_DEFAUT = "https://medmng.com";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[MM-CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

const origineSure = (origine: string | null): string => {
  if (!origine) return ORIGINE_PAR_DEFAUT;
  try {
    const u = new URL(origine);
    const hote = u.hostname;
    if (
      hote === "medmng.com" || hote.endsWith(".medmng.com") ||
      hote.endsWith(".lovable.app") || hote.endsWith(".lovableproject.com") ||
      hote === "localhost" || hote === "127.0.0.1"
    ) {
      return `${u.protocol}//${u.host}`;
    }
  } catch (_e) { /* origine invalide */ }
  return ORIGINE_PAR_DEFAUT;
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  const json = (corps: unknown, status = 200) =>
    new Response(JSON.stringify(corps), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY manquante");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Veuillez vous connecter." }, 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    const user = userData?.user;
    if (userError || !user) return json({ error: "Veuillez vous connecter." }, 401);
    logStep("Utilisateur authentifié", { userId: user.id });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    let customerId = await clientMedMng(stripe, user.id, user.email ?? undefined, false);

    // Abonnés antérieurs (clients créés sans metadata) : on remonte au client
    // depuis l'abonnement enregistré pour CET utilisateur, ce qui reste sans ambiguïté.
    if (!customerId) {
      const { data: lignes } = await supabaseClient
        .from("user_subscriptions")
        .select("stripe_subscription_id")
        .eq("user_id", user.id)
        .not("stripe_subscription_id", "is", null)
        .order("updated_at", { ascending: false })
        .limit(1);
      const subId = lignes?.[0]?.stripe_subscription_id;
      if (subId) {
        try {
          const sub = await stripe.subscriptions.retrieve(subId);
          customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
        } catch (_e) { /* abonnement introuvable côté Stripe */ }
      }
    }

    if (!customerId) {
      return json({
        error: "Aucun abonnement MED MNG n'est associé à votre compte.",
        code: "AUCUN_CLIENT",
      }, 404);
    }

    const origin = origineSure(req.headers.get("origin"));
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/med-mng/profile`,
      locale: "fr",
    });

    logStep("Session du portail créée", { sessionId: portalSession.id });
    return json({ url: portalSession.url });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERREUR", { message: errorMessage });
    return json({ error: "Le portail de gestion est momentanément indisponible. Réessayez plus tard." }, 500);
  }
});
