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
    console.log("🧪 Processing A/B tests");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Récupérer tous les tests actifs
    const { data: activeTests, error: testsError } = await supabaseClient
      .from("email_ab_tests")
      .select("*")
      .eq("status", "active");

    if (testsError) throw testsError;

    console.log(`Found ${activeTests?.length || 0} active tests`);

    for (const test of activeTests || []) {
      // Vérifier si le test est terminé
      const now = new Date();
      const endDate = new Date(test.end_date);

      if (now >= endDate) {
        console.log(`Test ${test.name} has ended, calculating winner...`);

        // Calculer le gagnant
        const { error: calcError } = await supabaseClient.rpc(
          "calculate_ab_test_winner",
          { test_id: test.id }
        );

        if (calcError) {
          console.error(`Error calculating winner for test ${test.id}:`, calcError);
          continue;
        }

        // Récupérer les résultats mis à jour
        const { data: updatedTest } = await supabaseClient
          .from("email_ab_tests")
          .select("*, template_a:email_templates!template_a_id(name), template_b:email_templates!template_b_id(name)")
          .eq("id", test.id)
          .single();

        if (updatedTest?.winner_template_id) {
          console.log(`✅ Test ${test.name} completed`);
          console.log(`Winner: Template ${updatedTest.winner_template_id === updatedTest.template_a_id ? 'A' : 'B'}`);
          console.log(`Open rates - A: ${updatedTest.open_rate_a}%, B: ${updatedTest.open_rate_b}%`);
        } else {
          console.log(`Test ${test.name} ended in a tie`);
        }
      } else {
        // Mettre à jour les statistiques en temps réel
        const { error: calcError } = await supabaseClient.rpc(
          "calculate_ab_test_winner",
          { test_id: test.id }
        );

        if (calcError) {
          console.error(`Error updating stats for test ${test.id}:`, calcError);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: activeTests?.length || 0 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Error processing A/B tests:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
