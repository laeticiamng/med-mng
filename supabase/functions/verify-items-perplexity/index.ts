import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const offset = body.offset ?? 0;
    const batchSize = body.batch_size ?? 5;
    const batchId = body.batch_id ?? `verify-${Date.now()}`;

    // Fetch items to verify
    const { data: items, error: fetchErr } = await supabase
      .from("edn_items_immersive")
      .select("item_code, title, competences_oic_rang_a, competences_oic_rang_b, competences_count_rang_a, competences_count_rang_b")
      .order("item_code")
      .range(offset, offset + batchSize - 1);

    if (fetchErr) throw new Error(`Fetch error: ${fetchErr.message}`);
    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ done: true, message: "All items verified", batch_id: batchId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = [];

    for (const item of items) {
      const rangA = item.competences_oic_rang_a || [];
      const rangB = item.competences_oic_rang_b || [];

      // Build a concise summary of OIC objectives for verification
      const rangASummary = rangA.slice(0, 10).map((c: any, i: number) =>
        `A${i + 1}: ${c.intitule || "?"}`
      ).join("\n");
      const rangBSummary = rangB.slice(0, 10).map((c: any, i: number) =>
        `B${i + 1}: ${c.intitule || "?"}`
      ).join("\n");

      const prompt = `Tu es un expert en médecine et en pédagogie médicale française (ECN/EDN/R2C 2025).

Vérifie l'item suivant du référentiel des Épreuves Dématérialisées Nationales (EDN) de médecine française :

**Item ${item.item_code}** : "${item.title}"

**Objectifs Rang A (${item.competences_count_rang_a} total, premiers affichés) :**
${rangASummary || "Aucun"}

**Objectifs Rang B (${item.competences_count_rang_b} total, premiers affichés) :**
${rangBSummary || "Aucun"}

Réponds STRICTEMENT en JSON avec ce format :
{
  "title_correct": true/false,
  "title_official": "titre officiel exact si différent, sinon null",
  "title_notes": "commentaire si le titre est approximatif",
  "rang_a_accuracy": 0-100,
  "rang_a_issues": ["liste des problèmes détectés dans les objectifs Rang A"],
  "rang_b_accuracy": 0-100,
  "rang_b_issues": ["liste des problèmes détectés dans les objectifs Rang B"],
  "missing_key_objectives": ["objectifs importants manquants"],
  "overall_score": 0-10,
  "summary": "résumé court de la vérification"
}`;

      try {
        const response = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar",
            messages: [
              { role: "system", content: "Tu es un vérificateur médical expert. Réponds uniquement en JSON valide." },
              { role: "user", content: prompt },
            ],
            temperature: 0.1,
            search_domain_filter: [
              "campus.cerimes.fr",
              "www.sfmu.org",
              "www.has-sante.fr",
              "sides.uness.fr",
              "www.em-consulte.com",
              "www.vidal.fr",
            ],
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(`Perplexity error for ${item.item_code}: ${response.status} ${errText}`);
          results.push({ item_code: item.item_code, error: `API ${response.status}` });
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        const citations = data.citations || [];

        // Parse JSON from response
        let parsed: any = {};
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          }
        } catch {
          console.error(`JSON parse error for ${item.item_code}`);
          parsed = { overall_score: null, summary: content.slice(0, 500) };
        }

        const allIssues = [
          ...(parsed.rang_a_issues || []).map((i: string) => ({ type: "rang_a", issue: i })),
          ...(parsed.rang_b_issues || []).map((i: string) => ({ type: "rang_b", issue: i })),
          ...(parsed.missing_key_objectives || []).map((i: string) => ({ type: "missing", issue: i })),
        ];

        const verificationResult = {
          item_code: item.item_code,
          item_title: item.title,
          verification_type: "full",
          title_match: parsed.title_correct ?? null,
          title_official: parsed.title_official ?? null,
          title_notes: parsed.title_notes ?? null,
          rang_a_verified: item.competences_count_rang_a || 0,
          rang_a_issues: (parsed.rang_a_issues || []).length,
          rang_b_verified: item.competences_count_rang_b || 0,
          rang_b_issues: (parsed.rang_b_issues || []).length,
          issues: allIssues,
          sources: citations,
          overall_score: parsed.overall_score ?? null,
          batch_id: batchId,
          raw_response: content.slice(0, 5000),
        };

        const { error: insertErr } = await supabase
          .from("verification_results")
          .insert(verificationResult);

        if (insertErr) {
          console.error(`Insert error for ${item.item_code}: ${insertErr.message}`);
        }

        results.push({
          item_code: item.item_code,
          title_match: parsed.title_correct,
          overall_score: parsed.overall_score,
          rang_a_issues: (parsed.rang_a_issues || []).length,
          rang_b_issues: (parsed.rang_b_issues || []).length,
          summary: parsed.summary,
        });

        // Rate limiting - wait between requests
        await new Promise((r) => setTimeout(r, 1500));
      } catch (itemErr) {
        console.error(`Error verifying ${item.item_code}: ${getErrorMessage(itemErr)}`);
        results.push({ item_code: item.item_code, error: getErrorMessage(itemErr) });
      }
    }

    const nextOffset = offset + batchSize;
    const hasMore = items.length === batchSize;

    return new Response(
      JSON.stringify({
        batch_id: batchId,
        verified: results,
        next_offset: hasMore ? nextOffset : null,
        done: !hasMore,
        total_in_batch: results.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", getErrorMessage(error));
    return new Response(
      JSON.stringify({ success: false, error: getErrorMessage(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
