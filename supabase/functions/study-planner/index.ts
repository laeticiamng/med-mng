import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      userProgress, 
      examDate, 
      availableHoursPerDay = 4,
      weakTopics = [],
      preferences = {}
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const daysUntilExam = examDate 
      ? Math.ceil((new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 90;

    const systemPrompt = `Tu es un planificateur d'études expert pour les EDN.

Contexte de l'étudiant:
- Jours avant l'examen: ${daysUntilExam}
- Heures disponibles par jour: ${availableHoursPerDay}
- Items maîtrisés: ${userProgress?.masteredCount || 0}
- Items en apprentissage: ${userProgress?.learningCount || 0}
- Items à réviser: ${userProgress?.dueCount || 0}
- Points faibles identifiés: ${weakTopics.join(', ') || 'Non identifiés'}

Crée un planning de révision optimal sur les 7 prochains jours avec:
- Répartition équilibrée des matières
- Priorité aux items en difficulté
- Sessions de révision espacée intégrées
- Pauses et récupération`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Génère un planning de révision personnalisé pour les 7 prochains jours." }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_study_plan",
              description: "Génère un planning d'études personnalisé",
              parameters: {
                type: "object",
                properties: {
                  weekPlan: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        day: { type: "number" },
                        date: { type: "string" },
                        sessions: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              startTime: { type: "string" },
                              duration: { type: "number" },
                              type: { type: "string", enum: ["new_learning", "srs_review", "exam_practice", "clinical_cases", "break"] },
                              topic: { type: "string" },
                              itemCodes: { type: "array", items: { type: "string" } },
                              priority: { type: "string", enum: ["low", "medium", "high"] }
                            },
                            required: ["startTime", "duration", "type", "topic", "priority"]
                          }
                        },
                        totalHours: { type: "number" },
                        focusAreas: { type: "array", items: { type: "string" } }
                      },
                      required: ["day", "date", "sessions", "totalHours", "focusAreas"]
                    }
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" }
                  },
                  priorityItems: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["weekPlan", "recommendations", "priorityItems"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_study_plan" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits insuffisants" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const plan = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(plan), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Impossible de générer le planning" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Study planner error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
