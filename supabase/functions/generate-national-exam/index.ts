import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getErrorMessage } from '../_shared/error-utils.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, questionCount = 120 } = await req.json();
    if (!userId) throw new Error("userId requis");

    // 1. Fetch all EDN items with competences
    const { data: items, error: itemsError } = await supabase
      .from('edn_items_complete')
      .select('id, item_code, title, subtitle, specialite, rang, competences_oic_rang_a, competences_oic_rang_b')
      .limit(400);

    if (itemsError || !items || items.length === 0) {
      throw new Error("Impossible de charger les items EDN");
    }

    // 2. Distribute items: 70% Rang A, 30% Rang B (official EDN distribution)
    const rangAItems = items.filter(i => i.rang === 'A' || i.rang === 'AB');
    const rangBItems = items.filter(i => i.rang === 'B' || i.rang === 'AB');

    const rangACount = Math.round(questionCount * 0.7);
    const rangBCount = questionCount - rangACount;

    // Shuffle and pick
    const shuffle = <T,>(arr: T[]): T[] => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const selectedA = shuffle(rangAItems).slice(0, rangACount);
    const selectedB = shuffle(rangBItems).slice(0, rangBCount);
    const selectedItems = shuffle([...selectedA, ...selectedB]);

    // 3. Generate questions in batches via AI
    const batchSize = 15;
    const allQuestions: any[] = [];
    
    for (let i = 0; i < selectedItems.length; i += batchSize) {
      const batch = selectedItems.slice(i, i + batchSize);
      const count = batch.length;
      
      const itemsContext = batch.map((item: any) => {
        const compA = item.competences_oic_rang_a;
        const compB = item.competences_oic_rang_b;
        const compAStr = Array.isArray(compA) ? compA.slice(0, 3).join(', ') : 
          (compA && typeof compA === 'object' ? JSON.stringify(compA).slice(0, 200) : 'N/A');
        const compBStr = Array.isArray(compB) ? compB.slice(0, 3).join(', ') : 
          (compB && typeof compB === 'object' ? JSON.stringify(compB).slice(0, 200) : 'N/A');
        return `Item ${item.item_code}: ${item.title} (Rang ${item.rang || '?'}, ${item.specialite || '?'})\nCompétences A: ${compAStr}\nCompétences B: ${compBStr}`;
      }).join('\n\n');

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `Tu es un générateur de QCM pour l'examen blanc national EDN. Génère exactement ${count} questions QCM réalistes et de niveau examen national.

Chaque question doit :
- Tester une compétence précise du référentiel
- Avoir un énoncé clinique réaliste (vignette clinique courte)
- 5 propositions (A-E) dont 1 à 3 correctes
- Niveau de difficulté adapté au rang de l'item

Items de référence :
${itemsContext}`
            },
            { role: "user", content: `Génère exactement ${count} QCM d'examen national EDN. Format JSON uniquement.` }
          ],
          tools: [{
            type: "function",
            function: {
              name: "generate_exam_questions",
              description: "Génère des questions QCM pour un examen blanc national EDN",
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
                        specialty: { type: "string" },
                        rang: { type: "string", enum: ["A", "B"] },
                        question_text: { type: "string" },
                        options: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 5 },
                        correct_answers: { type: "array", items: { type: "number" } },
                        explanation: { type: "string" },
                        coefficient: { type: "number" }
                      },
                      required: ["id", "item_code", "specialty", "rang", "question_text", "options", "correct_answers", "explanation"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["questions"],
                additionalProperties: false
              }
            }
          }],
          tool_choice: { type: "function", function: { name: "generate_exam_questions" } }
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          // Wait and retry
          await new Promise(r => setTimeout(r, 3000));
          continue;
        }
        console.error(`Batch ${i / batchSize} error:`, response.status);
        continue;
      }

      const data = await response.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        try {
          const result = JSON.parse(toolCall.function.arguments);
          if (result.questions) {
            allQuestions.push(...result.questions.map((q: any, idx: number) => ({
              ...q,
              id: `q-${i + idx}-${Date.now()}`,
              coefficient: q.rang === 'A' ? 1.0 : 0.5,
            })));
          }
        } catch (e) {
          console.error('Parse error for batch:', e);
        }
      }

      // Rate limit protection
      if (i + batchSize < selectedItems.length) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    // 4. Save exam session
    const sessionId = crypto.randomUUID();
    await supabase.from('ai_exam_history').insert({
      id: sessionId,
      user_id: userId,
      exam_type: 'national_simulation',
      total_questions: allQuestions.length,
      questions: allQuestions,
      time_limit_minutes: 180,
      started_at: new Date().toISOString(),
      ai_generated: true,
    });

    return new Response(JSON.stringify({
      sessionId,
      questions: allQuestions,
      totalQuestions: allQuestions.length,
      timeLimitMinutes: 180,
      rangACount: allQuestions.filter(q => q.rang === 'A').length,
      rangBCount: allQuestions.filter(q => q.rang === 'B').length,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("generate-national-exam error:", error);
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
