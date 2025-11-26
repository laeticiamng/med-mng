import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

import { getErrorMessage } from '../../_shared/error-utils.ts';
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface DigestData {
  period: '7d' | '30d' | '90d';
  codeQuality: {
    totalBugs: number;
    totalVulnerabilities: number;
    totalCodeSmells: number;
    trend: 'up' | 'down' | 'stable';
  };
  visualQuality: {
    totalRegressions: number;
    totalAccessibilityIssues: number;
    trend: 'up' | 'down' | 'stable';
  };
  notifications: Array<{
    severity: string;
    message: string;
    created_at: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification JWT + Vérification Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès send-quality-digest sans authentification');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier le token JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.warn('❌ Token invalide pour send-quality-digest');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // ✅ SÉCURITÉ: Vérifier rôle ADMIN
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some((r) => r.role === 'admin');
    if (!isAdmin) {
      console.warn(`❌ Non-admin tentative send-quality-digest par user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ send-quality-digest autorisé pour admin ${user.id}`);
    console.log('📊 Génération du digest qualité...');

    // Récupérer les configurations actives
    const { data: configs, error: configError } = await supabase
      .from('quality_alert_config')
      .select('*')
      .eq('digest_enabled', true);

    if (configError) throw configError;

    if (!configs || configs.length === 0) {
      console.log('Aucune configuration de digest active');
      return new Response(
        JSON.stringify({ message: 'No active digest configurations' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Pour chaque configuration, générer et envoyer le digest
    const results = [];
    
    for (const config of configs) {
      try {
        // Période par défaut : 7 jours
        const period = '7d';
        const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 90;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);

        // Récupérer les métriques de code
        const { data: codeReports, error: codeError } = await supabase
          .from('code_quality_reports')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false });

        if (codeError) throw codeError;

        // Récupérer les métriques visuelles
        const { data: visualReports, error: visualError } = await supabase
          .from('visual_quality_reports')
          .select('*')
          .gte('created_at', visualError.toISOString())
          .order('created_at', { ascending: false });

        if (visualError) throw visualError;

        // Récupérer les notifications récentes
        const { data: notifications, error: notifError } = await supabase
          .from('quality_notifications')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        if (notifError) throw notifError;

        // Calculer les statistiques
        const totalBugs = codeReports?.reduce((sum, r) => sum + (r.metrics?.bugs || 0), 0) || 0;
        const totalVulnerabilities = codeReports?.reduce((sum, r) => sum + (r.metrics?.vulnerabilities || 0), 0) || 0;
        const totalCodeSmells = codeReports?.reduce((sum, r) => sum + (r.metrics?.code_smells || 0), 0) || 0;
        const totalRegressions = visualReports?.reduce((sum, r) => sum + (r.regressions_detected || 0), 0) || 0;
        const totalAccessibilityIssues = visualReports?.reduce((sum, r) => sum + (r.accessibility_issues?.length || 0), 0) || 0;

        // Générer le HTML de l'email
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .section { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; }
                .metric { display: inline-block; margin: 10px 20px; text-align: center; }
                .metric-value { font-size: 32px; font-weight: bold; color: #667eea; }
                .metric-label { font-size: 14px; color: #666; }
                .notification { padding: 10px; margin: 10px 0; border-left: 4px solid #667eea; background: white; }
                .severity-critical { border-left-color: #ef4444; }
                .severity-high { border-left-color: #f59e0b; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📊 Digest Qualité - ${period === '7d' ? '7 jours' : period === '30d' ? '30 jours' : '90 jours'}</h1>
                  <p>Rapport généré le ${new Date().toLocaleDateString('fr-FR')}</p>
                </div>

                <div class="section">
                  <h2>🐛 Qualité du Code</h2>
                  <div>
                    <div class="metric">
                      <div class="metric-value">${totalBugs}</div>
                      <div class="metric-label">Bugs détectés</div>
                    </div>
                    <div class="metric">
                      <div class="metric-value">${totalVulnerabilities}</div>
                      <div class="metric-label">Vulnérabilités</div>
                    </div>
                    <div class="metric">
                      <div class="metric-value">${totalCodeSmells}</div>
                      <div class="metric-label">Code Smells</div>
                    </div>
                  </div>
                </div>

                <div class="section">
                  <h2>👁️ Qualité Visuelle</h2>
                  <div>
                    <div class="metric">
                      <div class="metric-value">${totalRegressions}</div>
                      <div class="metric-label">Régressions visuelles</div>
                    </div>
                    <div class="metric">
                      <div class="metric-value">${totalAccessibilityIssues}</div>
                      <div class="metric-label">Problèmes d'accessibilité</div>
                    </div>
                  </div>
                </div>

                ${notifications && notifications.length > 0 ? `
                  <div class="section">
                    <h2>🔔 Notifications Récentes</h2>
                    ${notifications.slice(0, 5).map(n => `
                      <div class="notification severity-${n.severity}">
                        <strong>${n.severity.toUpperCase()}</strong>: ${n.message}
                        <br><small>${new Date(n.created_at).toLocaleDateString('fr-FR')}</small>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}

                <div class="footer">
                  <p>Ce rapport a été généré automatiquement par votre système de qualité.</p>
                  <p>Pour modifier vos préférences, accédez à la page de configuration des alertes.</p>
                </div>
              </div>
            </body>
          </html>
        `;

        // Envoyer l'email à tous les destinataires
        for (const recipient of config.email_recipients) {
          const emailResult = await resend.emails.send({
            from: "Quality System <onboarding@resend.dev>",
            to: [recipient],
            subject: `📊 Digest Qualité - ${period === '7d' ? '7 jours' : period === '30d' ? '30 jours' : '90 jours'}`,
            html: emailHtml,
          });

          console.log(`Email envoyé à ${recipient}:`, emailResult);
        }

        results.push({
          user_id: config.user_id,
          recipients: config.email_recipients,
          status: 'sent',
        });

      } catch (error: unknown) {
        console.error(`Erreur pour l'utilisateur ${config.user_id}:`, error);
        results.push({
          user_id: config.user_id,
          status: 'error',
          error: getErrorMessage(error),
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Digests envoyés',
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Erreur dans send-quality-digest:", error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
