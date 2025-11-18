import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AccessibilityMetrics {
  totalPRs: number;
  passedPRs: number;
  failedPRs: number;
  conformityRate: number;
  avgFixTime: number;
  blockedPRsCount: number;
  violations: Array<{
    type: string;
    count: number;
    severity: string;
  }>;
  topDevelopers: Array<{
    login: string;
    conformityRate: number;
    totalPRs: number;
  }>;
}

const GITHUB_API_URL = 'https://api.github.com/graphql';
const REPO_OWNER = 'med-mng';
const REPO_NAME = 'med-mng';

// Requête GraphQL simplifiée pour récupérer les métriques
const PULL_REQUESTS_QUERY = `
  query($owner: String!, $name: String!, $first: Int!) {
    repository(owner: $owner, name: $name) {
      pullRequests(first: $first, orderBy: {field: CREATED_AT, direction: DESC}) {
        nodes {
          number
          title
          author { login }
          createdAt
          closedAt
          merged
          commits(last: 1) {
            nodes {
              commit {
                statusCheckRollup {
                  state
                  contexts(first: 20) {
                    nodes {
                      ... on StatusContext {
                        context
                        state
                      }
                      ... on CheckRun {
                        name
                        conclusion
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

async function fetchGitHubMetrics(githubToken: string): Promise<AccessibilityMetrics> {
  const response = await fetch(GITHUB_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${githubToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: PULL_REQUESTS_QUERY,
      variables: {
        owner: REPO_OWNER,
        name: REPO_NAME,
        first: 50
      }
    })
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const result = await response.json();
  const prs = result.data?.repository?.pullRequests?.nodes || [];

  // Calculer les métriques basiques
  let passedCount = 0;
  let failedCount = 0;
  let blockedCount = 0;
  const devMap = new Map<string, { passed: number; total: number }>();
  const violationMap = new Map<string, number>();

  prs.forEach((pr: any) => {
    const contexts = pr.commits?.nodes?.[0]?.commit?.statusCheckRollup?.contexts?.nodes || [];
    const accessibilityTests = contexts.filter((c: any) => {
      const name = c.context || c.name;
      return name?.includes('accessibilit') || name?.includes('axe') || name?.includes('Lighthouse');
    });

    if (accessibilityTests.length > 0) {
      const hasFailed = accessibilityTests.some((c: any) => {
        const state = c.state || c.conclusion;
        return state === 'FAILURE' || state === 'ERROR';
      });

      if (hasFailed) {
        failedCount++;
        if (!pr.merged && !pr.closedAt) blockedCount++;
        
        // Compter les violations
        accessibilityTests.forEach((test: any) => {
          const name = test.context || test.name;
          violationMap.set(name, (violationMap.get(name) || 0) + 1);
        });
      } else {
        passedCount++;
      }

      // Métriques par développeur
      const login = pr.author?.login || 'Unknown';
      const dev = devMap.get(login) || { passed: 0, total: 0 };
      dev.total++;
      if (!hasFailed) dev.passed++;
      devMap.set(login, dev);
    }
  });

  const totalPRs = passedCount + failedCount;
  const conformityRate = totalPRs > 0 ? (passedCount / totalPRs) * 100 : 0;

  // Top violations
  const violations = Array.from(violationMap.entries())
    .map(([type, count]) => ({
      type,
      count,
      severity: type.includes('color') || type.includes('contrast') ? 'serious' : 'moderate'
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top développeurs
  const topDevelopers = Array.from(devMap.entries())
    .map(([login, stats]) => ({
      login,
      conformityRate: (stats.passed / stats.total) * 100,
      totalPRs: stats.total
    }))
    .sort((a, b) => b.conformityRate - a.conformityRate)
    .slice(0, 5);

  return {
    totalPRs,
    passedPRs: passedCount,
    failedPRs: failedCount,
    conformityRate,
    avgFixTime: 0, // Simplifiée pour cette version
    blockedPRsCount: blockedCount,
    violations,
    topDevelopers
  };
}

function generateEmailHTML(metrics: AccessibilityMetrics): string {
  const statusColor = metrics.conformityRate >= 80 ? '#22c55e' : 
                      metrics.conformityRate >= 60 ? '#eab308' : '#ef4444';
  const statusText = metrics.conformityRate >= 80 ? 'Excellent' :
                     metrics.conformityRate >= 60 ? 'Acceptable' : 'À améliorer';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rapport d'Accessibilité</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h1 style="color: #1e293b; margin-bottom: 10px; font-size: 28px;">📊 Rapport d'Accessibilité</h1>
        <p style="color: #64748b; margin-bottom: 30px;">MED-MNG • ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        
        <div style="background: linear-gradient(135deg, ${statusColor}15, ${statusColor}05); border-left: 4px solid ${statusColor}; padding: 20px; border-radius: 6px; margin-bottom: 30px;">
          <h2 style="margin: 0 0 10px 0; color: #1e293b; font-size: 18px;">Taux de Conformité Global</h2>
          <div style="font-size: 48px; font-weight: bold; color: ${statusColor}; margin: 10px 0;">
            ${metrics.conformityRate.toFixed(1)}%
          </div>
          <p style="margin: 0; color: #64748b; font-weight: 600;">${statusText}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
          <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
            <div style="color: #22c55e; font-size: 24px; font-weight: bold;">${metrics.passedPRs}</div>
            <div style="color: #64748b; font-size: 14px;">PRs conformes</div>
          </div>
          <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
            <div style="color: #ef4444; font-size: 24px; font-weight: bold;">${metrics.blockedPRsCount}</div>
            <div style="color: #64748b; font-size: 14px;">PRs bloquées</div>
          </div>
        </div>

        ${metrics.violations.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1e293b; margin-bottom: 15px; font-size: 18px;">🔍 Top Violations Détectées</h3>
          ${metrics.violations.map((v, i) => `
            <div style="display: flex; align-items: center; padding: 12px; background: #f8fafc; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid ${v.severity === 'serious' ? '#f97316' : '#eab308'};">
              <div style="flex: 1;">
                <div style="font-weight: 600; color: #1e293b; font-size: 14px;">${i + 1}. ${v.type}</div>
                <div style="color: #64748b; font-size: 12px;">${v.count} occurrence${v.count > 1 ? 's' : ''}</div>
              </div>
              <div style="background: ${v.severity === 'serious' ? '#f97316' : '#eab308'}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                ${v.severity === 'serious' ? 'Sérieux' : 'Modéré'}
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${metrics.topDevelopers.length > 0 ? `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1e293b; margin-bottom: 15px; font-size: 18px;">🏆 Top Contributeurs</h3>
          ${metrics.topDevelopers.map((dev, i) => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #f8fafc; border-radius: 6px; margin-bottom: 8px;">
              <div>
                <div style="font-weight: 600; color: #1e293b;">${i + 1}. ${dev.login}</div>
                <div style="color: #64748b; font-size: 12px;">${dev.totalPRs} PR${dev.totalPRs > 1 ? 's' : ''}</div>
              </div>
              <div style="font-weight: bold; color: ${dev.conformityRate >= 90 ? '#22c55e' : dev.conformityRate >= 70 ? '#eab308' : '#ef4444'}; font-size: 18px;">
                ${dev.conformityRate.toFixed(0)}%
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 6px; padding: 15px; margin-top: 30px;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            <strong>💡 Recommandations:</strong><br>
            ${metrics.conformityRate < 80 ? '• Le taux de conformité est sous l\'objectif de 80%, une formation WCAG/RGAA est recommandée<br>' : ''}
            ${metrics.blockedPRsCount > 5 ? `• ${metrics.blockedPRsCount} PRs sont bloquées, une revue urgente est nécessaire<br>` : ''}
            ${metrics.violations.length > 0 ? `• Focus sur les ${metrics.violations.length} types de violations les plus fréquents` : ''}
            ${metrics.conformityRate >= 80 && metrics.blockedPRsCount <= 5 ? '• Excellent travail ! Continuez à maintenir ce niveau de qualité 🎉' : ''}
          </p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            Rapport généré automatiquement par MED-MNG Dashboard Accessibilité<br>
            <a href="https://votre-app.lovableproject.com/accessibility-dashboard" style="color: #3b82f6; text-decoration: none;">Voir le dashboard complet →</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification JWT + Vérification Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès send-accessibility-report sans authentification');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.warn('❌ Token invalide pour send-accessibility-report');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { data: userRoles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some((r) => r.role === 'admin');
    if (!isAdmin) {
      console.warn(`❌ Non-admin tentative send-accessibility-report par user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ send-accessibility-report autorisé pour admin ${user.id}`);
    console.log("📧 Starting accessibility report email function");

    // Récupérer la configuration
    const { data: config, error: configError } = await supabaseClient
      .from("accessibility_report_config")
      .select("*")
      .eq("enabled", true)
      .single();

    // Vérifier s'il y a un test A/B actif
    const { data: activeABTest } = await supabaseClient
      .from("email_ab_tests" as any)
      .select("*, template_a:email_templates!template_a_id(*), template_b:email_templates!template_b_id(*)")
      .eq("status", "active")
      .gte("end_date", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let templateToUse: any = null;
    let variantUsed: 'A' | 'B' | null = null;

    if (activeABTest) {
      // Alterner entre A et B (basé sur le nombre total d'envois)
      const totalSent = activeABTest.total_sent_a + activeABTest.total_sent_b;
      const useVariantA = totalSent % 2 === 0;
      
      if (useVariantA) {
        templateToUse = activeABTest.template_a;
        variantUsed = 'A';
        
        // Incrémenter le compteur A
        await supabaseClient
          .from("email_ab_tests" as any)
          .update({ total_sent_a: activeABTest.total_sent_a + 1 })
          .eq("id", activeABTest.id);
      } else {
        templateToUse = activeABTest.template_b;
        variantUsed = 'B';
        
        // Incrémenter le compteur B
        await supabaseClient
          .from("email_ab_tests" as any)
          .update({ total_sent_b: activeABTest.total_sent_b + 1 })
          .eq("id", activeABTest.id);
      }

      console.log(`🧪 Using A/B test variant ${variantUsed} for test: ${activeABTest.name}`);
    } else {
      // Utiliser le template par défaut
      const { data: defaultTemplate } = await supabaseClient
        .from("email_templates")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      templateToUse = defaultTemplate;
    }

    if (configError || !config) {
      console.error("Config error:", configError);
      throw new Error("No enabled configuration found");
    }

    if (!config.recipients || config.recipients.length === 0) {
      throw new Error("No recipients configured");
    }

    if (!config.github_token) {
      throw new Error("GitHub token not configured");
    }

    console.log(`📊 Fetching metrics for ${config.recipients.length} recipients`);

    // Récupérer les métriques GitHub
    const metrics = await fetchGitHubMetrics(config.github_token);

    console.log(`✅ Metrics fetched - Conformity: ${metrics.conformityRate.toFixed(1)}%`);

    // Préparer le contenu de l'email
    let emailSubject = `📊 Rapport Accessibilité - ${metrics.conformityRate.toFixed(1)}% de conformité`;
    let emailHTML = "";

    if (templateToUse) {
      emailSubject = templateToUse.subject || emailSubject;
      emailHTML = templateToUse.html_content || "";
      
      // Remplacer les variables dans le template
      const variables = {
        conformityRate: metrics.conformityRate.toFixed(1),
        totalPRs: metrics.totalPRs.toString(),
        passedPRs: metrics.passedPRs.toString(),
        failedPRs: metrics.failedPRs.toString(),
        blockedPRsCount: metrics.blockedPRsCount.toString(),
        date: new Date().toLocaleDateString("fr-FR"),
      };

      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        emailHTML = emailHTML.replace(regex, value);
        emailSubject = emailSubject.replace(regex, value);
      });
    } else {
      // HTML par défaut si pas de template
      emailHTML = generateEmailHTML(metrics);
    }

    // Envoyer l'email à chaque destinataire
    const emailPromises = config.recipients.map(async (recipient: string) => {
      const { data: emailResult, error: emailError } = await resend.emails.send({
        from: "MED-MNG <onboarding@resend.dev>",
        to: [recipient],
        subject: emailSubject,
        html: emailHTML,
      });

      if (emailError) {
        throw emailError;
      }

      // Si c'est un test A/B, enregistrer le résultat
      if (activeABTest && variantUsed && emailResult?.id) {
        // Créer d'abord une entrée dans email_statistics
        const { data: emailStat } = await supabaseClient
          .from("email_statistics")
          .insert({
            email_id: emailResult.id,
            recipient,
            subject: emailSubject,
            sent_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (emailStat) {
          // Ensuite créer l'entrée dans email_ab_results
          await supabaseClient
            .from("email_ab_results" as any)
            .insert({
              ab_test_id: activeABTest.id,
              email_stat_id: emailStat.id,
              template_variant: variantUsed,
            });
        }
      }

      return emailResult;
    });

    const emailResults = await Promise.all(emailPromises);

    console.log("✅ Emails sent successfully to all recipients");

    // Enregistrer dans l'historique
    await supabaseClient
      .from("accessibility_report_history")
      .insert({
        config_id: config.id,
        recipients: config.recipients,
        status: "success",
        report_data: metrics,
      });

    // Mettre à jour last_sent_at
    await supabaseClient
      .from("accessibility_report_config")
      .update({ last_sent_at: new Date().toISOString() })
      .eq("id", config.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Report sent successfully",
        metrics 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Error in send-accessibility-report function:", error);

    // Essayer d'enregistrer l'erreur dans l'historique
    try {
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const { data: config } = await supabaseClient
        .from("accessibility_report_config")
        .select("id, recipients")
        .eq("enabled", true)
        .single();

      if (config) {
        await supabaseClient
          .from("accessibility_report_history")
          .insert({
            config_id: config.id,
            recipients: config.recipients || [],
            status: "failed",
            error_message: error.message,
          });
      }
    } catch (historyError) {
      console.error("Failed to save error to history:", historyError);
    }

    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
