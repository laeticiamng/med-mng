import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const ALLOWED_ORIGINS = [
  Deno.env.get("ALLOWED_ORIGIN") || "https://med-mng.com",
  "https://staging.med-mng.com",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { specialty, difficulty = "intermediate", relatedItems = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Tu es un expert en création de cas cliniques pédagogiques pour les EDN.

Crée un cas clinique interactif en français avec:
- Une présentation patient réaliste et détaillée
- 3-4 étapes décisionnelles
- Chaque étape avec 4 options (1 correcte, 3 distracteurs plausibles)
- Des feedbacks pédagogiques pour chaque option
- Des liens avec les items EDN pertinents

Spécialité demandée: ${specialty || 'Médecine générale'}
Niveau de difficulté: ${difficulty}
${relatedItems.length > 0 ? `Items EDN à intégrer: ${relatedItems.join(', ')}` : ''}`;

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
          { role: "user", content: "Génère un cas clinique complet avec tous les éléments demandés." }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_clinical_case",
              description: "Génère un cas clinique interactif complet",
              parameters: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  specialty: { type: "string" },
                  difficulty: { type: "string", enum: ["beginner", "intermediate", "advanced"] },
                  description: { type: "string" },
                  patientPresentation: { type: "string" },
                  estimatedTime: { type: "number" },
                  learningObjectives: {
                    type: "array",
                    items: { type: "string" }
                  },
                  relatedItems: {
                    type: "array",
                    items: { type: "string" }
                  },
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        title: { type: "string" },
                        description: { type: "string" },
                        question: { type: "string" },
                        options: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              text: { type: "string" },
                              isCorrect: { type: "boolean" },
                              feedback: { type: "string" }
                            },
                            required: ["id", "text", "isCorrect", "feedback"]
                          }
                        }
                      },
                      required: ["id", "title", "description", "question", "options"]
                    }
                  }
                },
                required: ["id", "title", "specialty", "difficulty", "description", "patientPresentation", "estimatedTime", "learningObjectives", "relatedItems", "steps"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_clinical_case" } }
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
      const clinicalCase = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(clinicalCase), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Impossible de générer le cas clinique" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate clinical case error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
