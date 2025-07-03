import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    
    if (!token) {
      throw new Error("Missing webhook token");
    }

    // Récupérer l'intégration Google Sheets
    const { data: integration, error: integrationError } = await supabaseClient
      .from("google_sheets_integrations")
      .select("*")
      .eq("webhook_token", token)
      .eq("is_active", true)
      .single();

    if (integrationError || !integration) {
      throw new Error("Invalid webhook token or inactive integration");
    }

    // Récupérer les données du webhook
    let webhookData;
    if (req.method === "POST") {
      webhookData = await req.json();
    } else {
      // Pour les tests GET
      webhookData = { test: true };
    }

    console.log("Webhook received for sheet:", integration.sheet_id, webhookData);

    // Si c'est un test, retourner succès
    if (webhookData.test) {
      return new Response(JSON.stringify({
        success: true,
        message: "Webhook test successful",
        sheetId: integration.sheet_id
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Créer un nouveau batch d'import automatique
    const { data: batch, error: batchError } = await supabaseClient
      .from("import_batches")
      .insert({
        user_id: integration.user_id,
        filename: `google-sheets-auto-import-${integration.sheet_name}-${Date.now()}`,
        status: "pending",
        mapping_config: integration.mapping_config
      })
      .select()
      .single();

    if (batchError || !batch) {
      throw new Error("Failed to create import batch");
    }

    // Mettre à jour la date de dernière sync
    await supabaseClient
      .from("google_sheets_integrations")
      .update({ last_sync: new Date().toISOString() })
      .eq("id", integration.id);

    // Déclencher l'import en appelant l'autre edge function
    // Note: Dans un vrai environnement, vous pourriez vouloir récupérer les données depuis Google Sheets API
    // Pour l'instant, on simule avec les données du webhook
    
    const importUrl = `${req.headers.get("origin") || "https://yaincoxihiqdksxgrsrk.supabase.co"}/functions/v1/import-edn-data`;
    
    // Simuler des données CSV pour le test (en production, récupérer depuis Google Sheets)
    const mockCsvData = `item_code,title,subtitle,slug
IC-1,Test Item 1,Test Subtitle 1,test-item-1
IC-2,Test Item 2,Test Subtitle 2,test-item-2`;

    const importResponse = await fetch(importUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
      },
      body: JSON.stringify({
        batchId: batch.id,
        csvData: mockCsvData,
        mappingConfig: integration.mapping_config
      })
    });

    const importResult = await importResponse.json();

    return new Response(JSON.stringify({
      success: true,
      message: "Google Sheets webhook processed successfully",
      batchId: batch.id,
      importResult
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Google Sheets webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});