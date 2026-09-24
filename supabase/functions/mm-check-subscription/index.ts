// Copie propre à MED MNG : EmotionsCare partage le même projet Supabase et déploie
// sa propre fonction « check-subscription » sous ce nom ; les deux s'écrasaient mutuellement.
//
// Lit l'abonnement MED MNG Premium de l'utilisateur dans public.user_subscriptions
// (alimentée par mm-stripe-webhook). Plus aucune recherche de client Stripe par
// e-mail : le compte Stripe est partagé avec EmotionsCare.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { getCorsHeaders } from "../_shared/cors.ts";

/** Doit rester égal à QUOTA_GENERATIONS_AUDIO_PREMIUM (src/config/offre.ts). */
const QUOTA_PREMIUM = 30;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  const json = (corps: unknown, status = 200) =>
    new Response(JSON.stringify(corps), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Veuillez vous connecter." }, 401);
    const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    const user = userData?.user;
    if (!user) return json({ error: "Veuillez vous connecter." }, 401);

    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("status, current_period_end")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing"])
      .order("current_period_end", { ascending: false, nullsFirst: false })
      .limit(5);
    if (error) throw error;

    const actif = (data ?? []).find(
      (s) => !s.current_period_end || new Date(s.current_period_end).getTime() > Date.now(),
    );

    return json({
      subscribed: Boolean(actif),
      tier: actif ? "premium" : null,
      subscription_end: actif?.current_period_end ?? null,
      generations_limit: actif ? QUOTA_PREMIUM : 0,
    });
  } catch (error) {
    console.error("[MM-CHECK-SUBSCRIPTION]", error instanceof Error ? error.message : error);
    return json({ error: "Vérification momentanément indisponible." }, 500);
  }
});
