import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-github-event, x-hub-signature-256",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;

interface GitHubPushEvent {
  repository: {
    name: string;
    full_name: string;
    html_url: string;
  };
  pusher: {
    name: string;
    email: string;
  };
  commits: Array<{
    id: string;
    message: string;
    added: string[];
    modified: string[];
    removed: string[];
  }>;
  ref: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const event = req.headers.get("x-github-event");
    
    console.log('📥 Webhook reçu:', event);

    if (event !== "push" && event !== "pull_request") {
      return new Response(
        JSON.stringify({ message: "Event not supported" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const payload: GitHubPushEvent = await req.json();
    
    console.log('📦 Payload:', {
      repo: payload.repository.full_name,
      ref: payload.ref,
      commits: payload.commits?.length,
    });

    // Extraire les fichiers modifiés
    const allFiles = new Set<string>();
    payload.commits?.forEach(commit => {
      commit.added?.forEach(f => allFiles.add(f));
      commit.modified?.forEach(f => allFiles.add(f));
    });

    const changedFiles = Array.from(allFiles);
    const codeFiles = changedFiles.filter(f => 
      f.endsWith('.ts') || 
      f.endsWith('.tsx') || 
      f.endsWith('.js') || 
      f.endsWith('.jsx')
    );

    console.log('📄 Fichiers de code modifiés:', codeFiles.length);

    // Déclencher l'analyse de code si des fichiers de code ont changé
    if (codeFiles.length > 0) {
      console.log('🔍 Déclenchement analyse de code...');
      
      // Appeler l'API OpenAI pour analyser les changements
      const codeAnalysisPrompt = `Analyse les modifications suivantes dans le repository ${payload.repository.full_name}:

Fichiers modifiés:
${codeFiles.map(f => `- ${f}`).join('\n')}

Commits récents:
${payload.commits?.slice(0, 3).map(c => `- ${c.message}`).join('\n')}

Évalue:
1. Les risques de bugs introduits
2. Les problèmes de sécurité potentiels
3. Les anti-patterns de code
4. Les opportunités d'amélioration

Réponds au format JSON:
{
  "risk_level": "low|medium|high|critical",
  "bugs": number,
  "vulnerabilities": number,
  "code_smells": number,
  "recommendations": ["recommendation1", "recommendation2"],
  "summary": "résumé de l'analyse"
}`;

      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en analyse de qualité de code. Analyse les changements et fournis des recommandations précises.'
            },
            {
              role: 'user',
              content: codeAnalysisPrompt
            }
          ],
          temperature: 0.3,
        }),
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const openaiData = await openaiResponse.json();
      const analysis = JSON.parse(openaiData.choices[0].message.content);

      console.log('✅ Analyse terminée:', analysis.risk_level);

      // Enregistrer le rapport d'analyse
      const { error: reportError } = await supabase
        .from('code_quality_reports')
        .insert({
          project_name: payload.repository.name,
          analyzed_at: new Date().toISOString(),
          metrics: {
            bugs: analysis.bugs,
            vulnerabilities: analysis.vulnerabilities,
            code_smells: analysis.code_smells,
            files_analyzed: codeFiles.length,
          },
          recommendations: analysis.recommendations,
          summary: analysis.summary,
        });

      if (reportError) {
        console.error('Erreur insertion rapport:', reportError);
      }

      // Créer une notification si critique ou élevé
      if (analysis.risk_level === 'high' || analysis.risk_level === 'critical') {
        console.log('🚨 Création notification de risque');

        const { error: notifError } = await supabase
          .from('quality_notifications')
          .insert({
            severity: analysis.risk_level,
            source: 'github_webhook',
            title: `Risques détectés dans ${payload.repository.name}`,
            message: analysis.summary,
            metadata: {
              repository: payload.repository.full_name,
              ref: payload.ref,
              files_changed: codeFiles.length,
              commits: payload.commits?.length,
            },
          });

        if (notifError) {
          console.error('Erreur création notification:', notifError);
        }

        // Invoquer la fonction d'alerte email si critique
        if (analysis.risk_level === 'critical' && analysis.vulnerabilities > 0) {
          console.log('📧 Envoi alerte email...');
          
          await supabase.functions.invoke('send-quality-alert', {
            body: {
              severity: 'critical',
              title: `Vulnérabilités critiques dans ${payload.repository.name}`,
              description: analysis.summary,
              recommendations: analysis.recommendations,
              metadata: {
                vulnerabilities: analysis.vulnerabilities,
                bugs: analysis.bugs,
                repository: payload.repository.full_name,
              },
            },
          });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Analyse terminée',
          analysis: {
            risk_level: analysis.risk_level,
            bugs: analysis.bugs,
            vulnerabilities: analysis.vulnerabilities,
            code_smells: analysis.code_smells,
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Aucun fichier de code modifié',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("❌ Erreur webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
