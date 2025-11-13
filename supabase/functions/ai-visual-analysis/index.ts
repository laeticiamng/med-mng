import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VisualAnalysisResult {
  hasRegressions: boolean;
  changes: Array<{
    component: string;
    severity: "minor" | "major" | "critical";
    description: string;
    recommendation: string;
  }>;
  accessibilityIssues: Array<{
    type: string;
    severity: string;
    description: string;
  }>;
  designConsistency: number; // 0-100
  overallScore: number; // 0-100
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

    const { screenshotBase64, previousScreenshotBase64, componentName } = await req.json();

    const prompt = `Compare ces deux captures d'écran du composant "${componentName}" et fournis une analyse au format JSON:
{
  "hasRegressions": true/false,
  "changes": [
    {
      "component": "nom du composant",
      "severity": "minor" | "major" | "critical",
      "description": "description du changement",
      "recommendation": "recommandation"
    }
  ],
  "accessibilityIssues": [
    {
      "type": "contrast" | "layout" | "navigation",
      "severity": "minor" | "major" | "critical",
      "description": "description du problème"
    }
  ],
  "designConsistency": score 0-100,
  "overallScore": score 0-100
}

Analyse:
- Changements visuels non intentionnels
- Problèmes d'accessibilité (contraste, taille, espacement)
- Cohérence du design
- Responsive design

${previousScreenshotBase64 ? "Image précédente et nouvelle image fournies pour comparaison." : "Analyse d'une nouvelle image uniquement."}`;

    const messages: any[] = [
      {
        role: "system",
        content: "Tu es un expert en design UI/UX et accessibilité. Tu détectes les régressions visuelles et problèmes d'accessibilité."
      },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${screenshotBase64}`
            }
          }
        ]
      }
    ];

    if (previousScreenshotBase64) {
      messages[1].content.push({
        type: "image_url",
        image_url: {
          url: `data:image/png;base64,${previousScreenshotBase64}`
        }
      });
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const analysis: VisualAnalysisResult = JSON.parse(openaiData.choices[0].message.content);

    // Stocker le résultat dans Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const regressionCount = analysis.changes?.length || 0;
    
    await supabase.from("visual_quality_reports").insert({
      component_name: componentName,
      has_regressions: analysis.hasRegressions,
      regression_count: regressionCount,
      changes: analysis.changes,
      accessibility_issues: analysis.accessibilityIssues,
      design_consistency: analysis.designConsistency,
      overall_score: analysis.overallScore,
      screenshot: screenshotBase64,
      analyzed_at: new Date().toISOString(),
    });

    // Envoyer une notification si régressions visuelles détectées
    if (analysis.hasRegressions && regressionCount > 0) {
      const severity = regressionCount > 5 ? "high" : regressionCount > 2 ? "medium" : "low";
      
      // Notification dans la base de données
      await supabase.functions.invoke("ai-notifications", {
        body: {
          type: "visual_regression",
          severity,
          summary: `${regressionCount} régressions visuelles détectées sur ${componentName}`,
          details: { component: componentName, analysis }
        }
      });

      // Email d'alerte pour les cas high
      if (severity === "high") {
        const alertEmail = Deno.env.get("ALERT_EMAIL");
        if (alertEmail) {
          try {
            await supabase.functions.invoke("send-quality-alert", {
              body: {
                type: "visual_regression",
                severity,
                summary: `${regressionCount} régressions visuelles détectées sur ${componentName}`,
                details: { component: componentName, analysis },
                recipientEmail: alertEmail
              }
            });
            console.log(`Alert email sent to ${alertEmail}`);
          } catch (emailError) {
            console.error("Failed to send alert email:", emailError);
          }
        }
      }
    }

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Visual analysis error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
