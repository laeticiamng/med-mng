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
    const { items, count = 5, difficulty = "medium" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Validation des items - évite l'erreur .map() sur undefined
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ 
        error: "Le paramètre 'items' est requis et doit être un tableau non vide",
        questions: [] 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const itemsContext = items.map((item: any) => `
Item ${item.item_code || 'N/A'}: ${item.title || 'Sans titre'}
Compétences Rang A: ${item.competences_a?.slice(0, 5).join(', ') || 'Non disponibles'}
Compétences Rang B: ${item.competences_b?.slice(0, 3).join(', ') || 'Non disponibles'}
`).join('\n');

    const difficultyInstructions = {
      easy: "Questions simples sur les définitions et concepts de base",
      medium: "Questions sur les mécanismes, diagnostics et traitements principaux",
      hard: "Questions pièges sur les diagnostics différentiels, contre-indications et cas complexes"
    };

    const systemPrompt = `Tu es un générateur de QCM pour les EDN. Génère exactement ${count} questions QCM basées sur les items suivants.

${itemsContext}

Niveau de difficulté: ${difficultyInstructions[difficulty as keyof typeof difficultyInstructions]}

Chaque question doit avoir:
- Un énoncé clair et précis
- 5 propositions (A, B, C, D, E)
- Au moins 1 et au maximum 3 bonnes réponses
- Une explication pédagogique`;

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
          { role: "user", content: `Génère ${count} QCM de niveau ${difficulty}. Retourne uniquement le JSON.` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_qcm",
              description: "Génère des questions QCM pour les EDN",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        item_code: { type: "string" },
                        question_text: { type: "string" },
                        options: {
                          type: "array",
                          items: { type: "string" },
                          minItems: 5,
                          maxItems: 5
                        },
                        correct_answers: {
                          type: "array",
                          items: { type: "number" }
                        },
                        explanation: { type: "string" },
                        difficulty: { type: "string", enum: ["easy", "medium", "hard"] }
                      },
                      required: ["id", "item_code", "question_text", "options", "correct_answers", "explanation", "difficulty"]
                    }
                  }
                },
                required: ["questions"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_qcm" } }
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
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ questions: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate QCM error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
