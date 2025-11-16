import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "code_quality" | "visual_regression";
  severity: "low" | "medium" | "high" | "critical";
  summary: string;
  details: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const { type, severity, summary, details } = await req.json() as NotificationRequest;

    // Générer une notification intelligente avec OpenAI
    const prompt = `Tu es un assistant qui génère des notifications d'équipe pour des régressions de qualité de code.

Type de problème: ${type === "code_quality" ? "Qualité du code" : "Régression visuelle"}
Sévérité: ${severity}
Résumé: ${summary}

Détails:
${JSON.stringify(details, null, 2)}

Génère une notification courte et actionnable (2-3 phrases) qui:
1. Explique le problème de manière claire
2. Indique l'impact sur le projet
3. Suggère une action prioritaire

Reste professionnel et concis.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Tu es un assistant qui génère des notifications claires et actionnables pour les équipes de développement."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 200,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const notification = openaiData.choices[0].message.content;

    // Stocker la notification dans Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("quality_notifications").insert({
      type,
      severity,
      message: notification,
      summary,
      details,
      created_at: new Date().toISOString(),
    });

    console.log(`Notification created: ${severity} - ${summary}`);

    return new Response(
      JSON.stringify({ notification, severity }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
