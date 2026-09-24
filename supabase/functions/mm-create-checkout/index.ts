// Copie propre à MED MNG : EmotionsCare partage le même projet Supabase et déploie
// sa propre fonction « create-checkout » sous ce nom ; les deux s'écrasaient mutuellement.
//
// Offre unique : MED MNG Premium, 69 €/an ou 9,90 €/mois, sans période d'essai.
// Les prix sont retrouvés (ou créés) par lookup_key : voir _shared/mm-stripe-catalog.ts.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { MM_APP, clientMedMng, prixMedMng, type MmFormule } from "../_shared/mm-stripe-catalog.ts";

const ORIGINE_PAR_DEFAUT = "https://medmng.com";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[MM-CREATE-CHECKOUT] ${step}${detailsStr}`);
};

/** Accepte les anciens identifiants pour ne pas casser les liens existants. */
const formuleDepuis = (valeur: unknown): MmFormule | null => {
  const v = String(valeur ?? "annual").toLowerCase();
  if (["annual", "annuel", "premium", "year", "yearly"].includes(v)) return "annual";
  if (["monthly", "mensuel", "month"].includes(v)) return "monthly";
  return null;
};

/** N'accepte comme origine de retour que medmng.com, les aperçus Lovable et le local. */
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

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const body = await req.json().catch(() => ({}));
    const formule = formuleDepuis(body.plan);
    if (!formule) {
      return json({ error: "Formule inconnue. Formules disponibles : annual, monthly." }, 400);
    }

    // Renonciation expresse au droit de rétractation (art. L221-28 13° du Code
    // de la consommation) : cochée sur la page d'abonnement avant le paiement.
    if (body.renonciation_retractation !== true) {
      return json({
        error: "Veuillez cocher la case de demande d'accès immédiat avant de poursuivre.",
        code: "RENONCIATION_REQUISE",
      }, 400);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Veuillez vous connecter." }, 401);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    const user = userData?.user;
    if (userError || !user) return json({ error: "Veuillez vous connecter." }, 401);
    logStep("Utilisateur authentifié", { userId: user.id, formule });

    // Déjà abonné : on n'ouvre pas un second abonnement.
    const { data: existant } = await supabaseAdmin
      .from("user_subscriptions")
      .select("id, status, current_period_end")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .order("current_period_end", { ascending: false, nullsFirst: false })
      .limit(1);
    const actif = (existant ?? []).find(
      (s) => !s.current_period_end || new Date(s.current_period_end).getTime() > Date.now(),
    );
    if (actif) {
      return json({
        error: "Vous avez déjà un abonnement MED MNG Premium actif. Vous pouvez le gérer depuis votre profil.",
        code: "DEJA_ABONNE",
      }, 409);
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const priceId = await prixMedMng(stripe, formule);
    const customerId = await clientMedMng(stripe, user.id, user.email ?? undefined, true);
    logStep("Prix et client Stripe", { priceId, customerId });

    const origin = origineSure(req.headers.get("origin"));
    const metadata = {
      app: MM_APP,
      supabase_user_id: user.id,
      formule,
      renonciation_retractation: "oui",
      renonciation_horodatage: new Date().toISOString(),
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId ?? undefined,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      locale: "fr",
      metadata,
      subscription_data: {
        metadata: { app: MM_APP, supabase_user_id: user.id, formule },
      },
      success_url: `${origin}/med-mng/success?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/med-mng/pricing?checkout=cancel`,
    });

    logStep("Session de paiement créée", { sessionId: session.id });
    return json({ url: session.url });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERREUR", { message: errorMessage });
    return json({ error: "Le paiement est momentanément indisponible. Réessayez plus tard." }, 500);
  }
});
