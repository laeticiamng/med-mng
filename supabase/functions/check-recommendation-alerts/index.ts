import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔔 Starting recommendation alerts check...");

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Exécuter la fonction de vérification des alertes
    const { error: checkError } = await supabaseAdmin.rpc("check_recommendation_alerts");

    if (checkError) {
      console.error("Error checking alerts:", checkError);
      throw checkError;
    }

    // Récupérer les alertes déclenchées
    const { data: triggeredAlerts, error: alertsError } = await supabaseAdmin
      .from("recommendation_alerts")
      .select("*")
      .eq("alert_triggered", true)
      .eq("dismissed", false);

    if (alertsError) throw alertsError;

    console.log(`✅ Alert check completed. ${triggeredAlerts?.length || 0} active alerts.`);

    return new Response(
      JSON.stringify({
        success: true,
        triggeredAlerts: triggeredAlerts?.length || 0,
        message: "Alert check completed successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("❌ Error in alert check:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
