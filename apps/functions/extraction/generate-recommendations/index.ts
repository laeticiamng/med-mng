import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Recommendation {
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  category: "timing" | "platform" | "volume" | "quality";
  actionable: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Récupérer les scores historiques envoyés par le client
    const requestBody = await req.json().catch(() => ({}));
    const historicalScores = requestBody.historicalScores || {};

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    console.log("📊 Generating recommendations for user:", user.id);

    // Récupérer les données d'historique (30 derniers jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: history, error: historyError } = await supabaseClient
      .from("notification_history")
      .select("platform, status, sent_at, test_name")
      .eq("user_id", user.id)
      .gte("sent_at", thirtyDaysAgo.toISOString())
      .order("sent_at", { ascending: true });

    if (historyError) throw historyError;

    if (!history || history.length < 10) {
      return new Response(
        JSON.stringify({
          recommendations: [],
          message: "Pas assez de données pour générer des recommandations (minimum 10 notifications requises)",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Analyser les données
    const analysis = analyzeData(history);

    // Générer des recommandations avec l'IA
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Préparer les informations sur les scores historiques
    let historicalContext = "";
    if (Object.keys(historicalScores).length > 0) {
      historicalContext = "\n\nScores d'efficacité historiques par catégorie (0-100):";
      for (const [category, score] of Object.entries(historicalScores)) {
        const scoreData = score as any;
        historicalContext += `\n- ${category}: ${scoreData.effectiveness_score}/100 (${scoreData.total_applied} recommandations appliquées, amélioration moyenne: ${scoreData.avg_success_improvement}%)`;
      }
      historicalContext += "\n\nPRIORISE les catégories avec les meilleurs scores historiques (>60) car elles ont prouvé leur efficacité.";
    }

    const prompt = `Analyse les données de notifications suivantes et génère 5 recommandations d'optimisation concrètes et actionnables.

Données analysées:
- Total de notifications: ${analysis.total}
- Taux de succès global: ${analysis.successRate.toFixed(1)}%
- Performance par plateforme:
  * Slack: ${analysis.slack.total} notifications, ${analysis.slack.successRate.toFixed(1)}% de succès
  * Discord: ${analysis.discord.total} notifications, ${analysis.discord.successRate.toFixed(1)}% de succès
- Tendance du volume: ${analysis.trend}
- Meilleurs horaires (heures): ${analysis.bestHours.join(", ")}
- Pires horaires (heures): ${analysis.worstHours.join(", ")}
- Jours les plus performants: ${analysis.bestDays.join(", ")}${historicalContext}

Génère exactement 5 recommandations qui:
1. Sont spécifiques aux données fournies
2. Sont directement actionnables
3. Ont un impact mesurable sur les performances
4. Couvrent différentes catégories (timing, platform, volume, quality)
5. PRIORISE les catégories avec les meilleurs scores historiques d'efficacité
6. Sont présentées par ordre d'impact (high > medium > low) ET d'efficacité historique

Les recommandations doivent être pratiques et adaptées au contexte des notifications A/B tests.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en optimisation des systèmes de notification. Tu analyses les données et génères des recommandations concrètes et actionnables.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_recommendations",
              description: "Génère 5 recommandations d'optimisation basées sur l'analyse des données",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    minItems: 5,
                    maxItems: 5,
                    items: {
                      type: "object",
                      properties: {
                        title: {
                          type: "string",
                          description: "Titre court de la recommandation (max 60 caractères)",
                        },
                        description: {
                          type: "string",
                          description: "Description détaillée de la recommandation (100-200 caractères)",
                        },
                        impact: {
                          type: "string",
                          enum: ["high", "medium", "low"],
                          description: "Niveau d'impact attendu",
                        },
                        category: {
                          type: "string",
                          enum: ["timing", "platform", "volume", "quality"],
                          description: "Catégorie de la recommandation",
                        },
                        actionable: {
                          type: "string",
                          description: "Action concrète à entreprendre (50-100 caractères)",
                        },
                      },
                      required: ["title", "description", "impact", "category", "actionable"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["recommendations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "generate_recommendations" },
        },
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI response:", JSON.stringify(aiData, null, 2));

    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No recommendations generated by AI");
    }

    const recommendations = JSON.parse(toolCall.function.arguments);

    console.log("✅ Generated recommendations:", recommendations.recommendations.length);

    return new Response(
      JSON.stringify({
        recommendations: recommendations.recommendations,
        analysis: {
          total: analysis.total,
          successRate: analysis.successRate,
          bestHours: analysis.bestHours,
          bestDays: analysis.bestDays,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("❌ Error generating recommendations:", error);
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

function analyzeData(history: any[]) {
  const total = history.length;
  const success = history.filter((h) => h.status === "success").length;
  const successRate = total > 0 ? (success / total) * 100 : 0;

  // Analyse par plateforme
  const slack = history.filter((h) => h.platform === "slack");
  const discord = history.filter((h) => h.platform === "discord");

  const slackSuccess = slack.filter((h) => h.status === "success").length;
  const discordSuccess = discord.filter((h) => h.status === "success").length;

  // Analyse par heure
  const hourStats: Record<number, { total: number; success: number }> = {};
  history.forEach((h) => {
    const hour = new Date(h.sent_at).getHours();
    if (!hourStats[hour]) hourStats[hour] = { total: 0, success: 0 };
    hourStats[hour].total++;
    if (h.status === "success") hourStats[hour].success++;
  });

  const hourRates = Object.entries(hourStats)
    .map(([hour, stats]) => ({
      hour: parseInt(hour),
      rate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0,
      total: stats.total,
    }))
    .filter((h) => h.total >= 3) // Au moins 3 notifications
    .sort((a, b) => b.rate - a.rate);

  const bestHours = hourRates.slice(0, 3).map((h) => `${h.hour}h`);
  const worstHours = hourRates.slice(-3).map((h) => `${h.hour}h`);

  // Analyse par jour de la semaine
  const dayStats: Record<number, { total: number; success: number }> = {};
  history.forEach((h) => {
    const day = new Date(h.sent_at).getDay();
    if (!dayStats[day]) dayStats[day] = { total: 0, success: 0 };
    dayStats[day].total++;
    if (h.status === "success") dayStats[day].success++;
  });

  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const dayRates = Object.entries(dayStats)
    .map(([day, stats]) => ({
      day: dayNames[parseInt(day)],
      rate: stats.total > 0 ? (stats.success / stats.total) * 100 : 0,
      total: stats.total,
    }))
    .filter((d) => d.total >= 3)
    .sort((a, b) => b.rate - a.rate);

  const bestDays = dayRates.slice(0, 2).map((d) => d.day);

  // Tendance
  const mid = Math.floor(history.length / 2);
  const firstHalf = history.slice(0, mid);
  const secondHalf = history.slice(mid);
  const firstAvg = firstHalf.length;
  const secondAvg = secondHalf.length;
  const trend = secondAvg > firstAvg * 1.1 ? "croissante" : secondAvg < firstAvg * 0.9 ? "décroissante" : "stable";

  return {
    total,
    successRate,
    slack: {
      total: slack.length,
      successRate: slack.length > 0 ? (slackSuccess / slack.length) * 100 : 0,
    },
    discord: {
      total: discord.length,
      successRate: discord.length > 0 ? (discordSuccess / discord.length) * 100 : 0,
    },
    bestHours,
    worstHours,
    bestDays,
    trend,
  };
}

serve(handler);
