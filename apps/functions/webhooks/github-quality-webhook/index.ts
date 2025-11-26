import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

import { getErrorMessage } from '../../_shared/error-utils.ts';
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-github-event, x-hub-signature-256",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;
const githubWebhookSecret = Deno.env.get("GITHUB_WEBHOOK_SECRET");
const githubToken = Deno.env.get("GITHUB_TOKEN");

// ✅ SÉCURITÉ: Webhook GitHub - Vérification signature HMAC SHA-256
async function verifyGitHubSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  if (!signature || !signature.startsWith('sha256=')) {
    return false;
  }

  const algorithm = { name: 'HMAC', hash: 'SHA-256' };
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    algorithm,
    false,
    ['sign', 'verify']
  );

  const expectedSignature = signature.slice(7); // Remove 'sha256=' prefix
  const actualSignature = await crypto.subtle.sign(
    algorithm.name,
    key,
    encoder.encode(payload)
  );

  const actualHex = Array.from(new Uint8Array(actualSignature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return actualHex === expectedSignature;
}

// Poster un commentaire sur une Pull Request GitHub
async function postPRComment(repoFullName: string, prNumber: number, comment: string): Promise<void> {
  if (!githubToken) {
    console.warn('GITHUB_TOKEN non configuré, impossible de poster le commentaire');
    return;
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repoFullName}/issues/${prNumber}/comments`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: comment }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur lors du post du commentaire: ${response.status}`, errorText);
    } else {
      console.log('✅ Commentaire posté sur la PR');
    }
  } catch (error: unknown) {
    console.error('Erreur post commentaire GitHub:', error);
  }
}

// Formater le rapport d'analyse pour GitHub
function formatAnalysisForGitHub(analysis: any): string {
  const riskEmoji = {
    low: '✅',
    medium: '⚠️',
    high: '🔶',
    critical: '🚨'
  };

  const emoji = riskEmoji[analysis.risk_level as keyof typeof riskEmoji] || '❓';

  let comment = `## ${emoji} Analyse de qualité de code\n\n`;
  comment += `**Niveau de risque:** ${analysis.risk_level}\n\n`;
  comment += `### 📊 Métriques\n\n`;
  comment += `- 🐛 **Bugs potentiels:** ${analysis.bugs}\n`;
  comment += `- 🔒 **Vulnérabilités:** ${analysis.vulnerabilities}\n`;
  comment += `- 💡 **Code smells:** ${analysis.code_smells}\n\n`;
  
  if (analysis.summary) {
    comment += `### 📝 Résumé\n\n${analysis.summary}\n\n`;
  }

  if (analysis.recommendations && analysis.recommendations.length > 0) {
    comment += `### 💡 Recommandations\n\n`;
    analysis.recommendations.forEach((rec: string, index: number) => {
      comment += `${index + 1}. ${rec}\n`;
    });
  }

  comment += `\n---\n*Analyse automatique générée par MED-MNG Quality System*`;

  return comment;
}

interface GitHubRepository {
  name: string;
  full_name: string;
  html_url: string;
}

interface GitHubCommit {
  id: string;
  message: string;
  added: string[];
  modified: string[];
  removed: string[];
}

interface GitHubPushEvent {
  repository: GitHubRepository;
  pusher: {
    name: string;
    email: string;
  };
  commits: GitHubCommit[];
  ref: string;
}

interface GitHubPullRequestEvent {
  action: string;
  number: number;
  pull_request: {
    number: number;
    head: {
      sha: string;
    };
  };
  repository: GitHubRepository;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Vérification de la signature GitHub
    if (githubWebhookSecret) {
      const signature = req.headers.get("x-hub-signature-256");
      const rawBody = await req.text();
      
      if (!signature || !(await verifyGitHubSignature(rawBody, signature, githubWebhookSecret))) {
        console.error('❌ Signature GitHub invalide');
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        );
      }

      console.log('✅ Signature GitHub vérifiée');
      
      // Re-parser le payload après vérification
      const payload = JSON.parse(rawBody) as GitHubPushEvent | GitHubPullRequestEvent;
      return await processWebhook(req, payload);
    } else {
      console.warn('⚠️ GITHUB_WEBHOOK_SECRET non configuré, signature non vérifiée');
      const payload = await req.json();
      return await processWebhook(req, payload);
    }
  } catch (error: any) {
    console.error("❌ Erreur webhook:", error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

const processWebhook = async (req: Request, payload: GitHubPushEvent | GitHubPullRequestEvent): Promise<Response> => {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const event = req.headers.get("x-github-event");
  
  console.log('📥 Webhook reçu:', event);

  if (event !== "push" && event !== "pull_request") {
    return new Response(
      JSON.stringify({ message: "Event not supported" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }

  const isPullRequest = event === "pull_request";
  let prNumber: number | undefined;
  
  if (isPullRequest) {
    const prPayload = payload as GitHubPullRequestEvent;
    prNumber = prPayload.number;
    
    if (prPayload.action !== 'opened' && prPayload.action !== 'synchronize') {
      return new Response(
        JSON.stringify({ message: "PR action not relevant for analysis" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
  }

  const pushPayload = payload as GitHubPushEvent;
    
  console.log('📦 Payload:', {
    repo: pushPayload.repository.full_name,
    ref: pushPayload.ref,
    commits: pushPayload.commits?.length,
    pr: prNumber,
  });

  // Extraire les fichiers modifiés
  const allFiles = new Set<string>();
  pushPayload.commits?.forEach(commit => {
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
    try {
      console.log('🔍 Déclenchement analyse de code...');
      
      // Appeler l'API OpenAI pour analyser les changements
      const codeAnalysisPrompt = `Analyse les modifications suivantes dans le repository ${pushPayload.repository.full_name}:

Fichiers modifiés:
${codeFiles.map(f => `- ${f}`).join('\n')}

Commits récents:
${pushPayload.commits?.slice(0, 3).map(c => `- ${c.message}`).join('\n')}

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

      // Poster un commentaire sur la PR si c'est une PR
      if (isPullRequest && prNumber) {
        console.log(`💬 Création commentaire sur PR #${prNumber}`);
        const comment = formatAnalysisForGitHub(analysis);
        await postPRComment(pushPayload.repository.full_name, prNumber, comment);
      }

      // Enregistrer le rapport d'analyse
      const { error: reportError } = await supabase
        .from('code_quality_reports')
        .insert({
          project_name: pushPayload.repository.name,
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
            title: `Risques détectés dans ${pushPayload.repository.name}`,
            message: analysis.summary,
            metadata: {
              repository: pushPayload.repository.full_name,
              ref: pushPayload.ref,
              files_changed: codeFiles.length,
              commits: pushPayload.commits?.length,
              pr_number: prNumber,
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
              title: `Vulnérabilités critiques dans ${pushPayload.repository.name}`,
              description: analysis.summary,
              recommendations: analysis.recommendations,
              metadata: {
                vulnerabilities: analysis.vulnerabilities,
                bugs: analysis.bugs,
                repository: pushPayload.repository.full_name,
                pr_number: prNumber,
              },
            },
          });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Analyse terminée',
          pr_commented: isPullRequest && prNumber !== undefined,
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
    } catch (analysisError: any) {
      console.error('❌ Erreur lors de l\'analyse:', analysisError);
      return new Response(
        JSON.stringify({ error: `Analysis error: ${analysisError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
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
};

serve(handler);
