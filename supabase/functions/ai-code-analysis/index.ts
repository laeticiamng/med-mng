import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisResult {
  bugs: number;
  vulnerabilities: number;
  codeSmells: number;
  coverage: number;
  duplications: number;
  maintainabilityRating: string;
  securityRating: string;
  issues: Array<{
    type: string;
    severity: string;
    file: string;
    line: number;
    message: string;
  }>;
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

    const { code, filePath } = await req.json();

    // Analyse du code avec OpenAI
    const prompt = `Analyse ce code TypeScript/React et fournis un rapport de qualité au format JSON:
{
  "bugs": nombre estimé de bugs,
  "vulnerabilities": nombre de vulnérabilités de sécurité,
  "codeSmells": nombre de code smells,
  "coverage": estimation du coverage (0-100),
  "duplications": pourcentage de duplication (0-100),
  "maintainabilityRating": "A" à "E",
  "securityRating": "A" à "E",
  "issues": [
    {
      "type": "bug" | "vulnerability" | "code_smell",
      "severity": "blocker" | "critical" | "major" | "minor",
      "file": "${filePath}",
      "line": numéro de ligne,
      "message": "description du problème"
    }
  ]
}

Code à analyser:
\`\`\`typescript
${code}
\`\`\`

Sois strict et professionnel. Identifie les vrais problèmes de sécurité, bugs potentiels, et mauvaises pratiques.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Tu es un expert en analyse de code et sécurité. Tu fournis des analyses précises au format JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const analysis: AnalysisResult = JSON.parse(openaiData.choices[0].message.content);

    // Stocker le résultat dans Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("code_quality_reports").insert({
      file_path: filePath,
      bugs: analysis.bugs,
      vulnerabilities: analysis.vulnerabilities,
      code_smells: analysis.codeSmells,
      coverage: analysis.coverage,
      duplications: analysis.duplications,
      maintainability_rating: analysis.maintainabilityRating,
      security_rating: analysis.securityRating,
      issues: analysis.issues,
      analyzed_at: new Date().toISOString(),
    });

    // Envoyer une notification si problèmes critiques détectés
    if (analysis.vulnerabilities > 0 || analysis.bugs > 5) {
      const severity = analysis.vulnerabilities > 2 ? "critical" : analysis.bugs > 10 ? "high" : "medium";
      await supabase.functions.invoke("ai-notifications", {
        body: {
          type: "code_quality",
          severity,
          summary: `${analysis.vulnerabilities} vulnérabilités et ${analysis.bugs} bugs détectés dans ${filePath}`,
          details: { file: filePath, analysis }
        }
      });
    }

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
