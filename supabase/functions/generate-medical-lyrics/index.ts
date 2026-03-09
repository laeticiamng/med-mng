import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, specialty, style, tempo } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Tu es un auteur-compositeur médical expert. Tu crées des paroles de chansons éducatives pour aider les étudiants en médecine à mémoriser des concepts médicaux complexes grâce à la musique.

Règles :
- Les paroles doivent être médicalement exactes
- Utilise des mnémoniques musicaux (rimes, rythme, répétitions)
- Structure : 2 couplets + 1 refrain + 1 pont
- Inclus les termes médicaux clés de la spécialité
- Le style musical doit influencer le rythme des paroles
- Réponds UNIQUEMENT avec les paroles, pas d'explications
- Utilise des emojis 🎵 🎶 pour marquer les sections`;

    const userPrompt = `Génère des paroles de chanson médicale avec ces paramètres :
- Sujet/Fichier source : "${fileName}"
- Spécialité : ${specialty}
- Style musical : ${style}
- Tempo : ${tempo} BPM

Génère un titre créatif et les paroles complètes.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_song",
              description: "Generate a medical educational song with title and lyrics",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Creative song title" },
                  lyrics: { type: "string", description: "Full song lyrics with section markers (🎵 Couplet, 🎶 Refrain, etc.)" },
                },
                required: ["title", "lyrics"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_song" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, réessayez dans quelques instants." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA insuffisants." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ title: parsed.title, lyrics: parsed.lyrics }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: use content directly
    const content = data.choices?.[0]?.message?.content || "";
    const lines = content.split("\n");
    const title = lines[0]?.replace(/^#\s*/, "").trim() || `${fileName} — Chanson Médicale`;
    const lyrics = lines.slice(1).join("\n").trim() || content;

    return new Response(JSON.stringify({ title, lyrics }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-medical-lyrics error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
