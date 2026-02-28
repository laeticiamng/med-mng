import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getErrorMessage } from '../_shared/error-utils.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY")!;
    const alertEmail = Deno.env.get("ALERT_EMAIL") || "security@example.com";

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendKey);

    const { reportType } = await req.json();
    console.log(`📊 Generating ${reportType} security report...`);

    // Get date range based on report type
    const now = new Date();
    let startDate: Date;
    let periodLabel: string;

    switch (reportType) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        periodLabel = 'Quotidien';
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        periodLabel = 'Hebdomadaire';
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        periodLabel = 'Mensuel';
        break;
      default:
        throw new Error('Invalid report type');
    }

    // Fetch latest metrics
    const { data: latestMetrics } = await supabase
      .from("security_metrics_snapshots")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(1)
      .single();

    // Fetch metrics for the period
    const { data: periodMetrics } = await supabase
      .from("security_metrics_snapshots")
      .select("*")
      .gte("recorded_at", startDate.toISOString())
      .order("recorded_at", { ascending: true });

    // Fetch recent alerts
    const { data: recentAlerts } = await supabase
      .from("security_alerts")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });

    // Fetch CVSS assessments
    const { data: cvssAssessments } = await supabase
      .from("cvss_assessments")
      .select("*")
      .eq("patched", false)
      .order("base_score", { ascending: false });

    // Calculate trends
    const firstMetrics = periodMetrics?.[0];
    const scoreTrend = latestMetrics && firstMetrics 
      ? latestMetrics.security_score - firstMetrics.security_score 
      : 0;

    const openAlerts = recentAlerts?.filter(a => a.status === 'open').length || 0;
    const criticalAlerts = recentAlerts?.filter(a => a.severity === 'critical').length || 0;
    const criticalVulns = cvssAssessments?.filter(a => a.base_severity === 'Critical').length || 0;

    // Generate HTML email
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #16a34a 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
    .score { font-size: 48px; font-weight: bold; margin: 20px 0; }
    .trend { display: inline-block; padding: 8px 16px; border-radius: 20px; font-size: 14px; margin-top: 10px; }
    .trend.positive { background: #dcfce7; color: #16a34a; }
    .trend.negative { background: #fee2e2; color: #dc2626; }
    .section { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .section h2 { margin-top: 0; color: #1e293b; }
    .metric { display: inline-block; margin: 10px 20px 10px 0; }
    .metric-value { font-size: 32px; font-weight: bold; color: #3b82f6; }
    .metric-label { font-size: 14px; color: #64748b; }
    .alert-item { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #dc2626; border-radius: 4px; }
    .alert-item.high { border-left-color: #f59e0b; }
    .vuln-item { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #dc2626; border-radius: 4px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
    .badge.critical { background: #fef2f2; color: #dc2626; }
    .badge.high { background: #fffbeb; color: #f59e0b; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🛡️ Rapport de Sécurité ${periodLabel}</h1>
    <p>${startDate.toLocaleDateString('fr-FR')} - ${now.toLocaleDateString('fr-FR')}</p>
    <div class="score">${latestMetrics?.security_score || 0}/100</div>
    <div class="trend ${scoreTrend >= 0 ? 'positive' : 'negative'}">
      ${scoreTrend >= 0 ? '↗' : '↘'} ${Math.abs(scoreTrend).toFixed(1)} points
    </div>
  </div>

  <div class="section">
    <h2>📊 Métriques Clés</h2>
    <div class="metric">
      <div class="metric-value">${latestMetrics?.tables_with_rls || 0}/${latestMetrics?.total_tables || 0}</div>
      <div class="metric-label">Tables avec RLS</div>
    </div>
    <div class="metric">
      <div class="metric-value">${latestMetrics?.total_policies || 0}</div>
      <div class="metric-label">Politiques RLS</div>
    </div>
    <div class="metric">
      <div class="metric-value">${openAlerts}</div>
      <div class="metric-label">Alertes Ouvertes</div>
    </div>
    <div class="metric">
      <div class="metric-value">${criticalVulns}</div>
      <div class="metric-label">Vulnérabilités Critiques</div>
    </div>
  </div>

  ${criticalAlerts > 0 ? `
  <div class="section">
    <h2>⚠️ Alertes Critiques (${criticalAlerts})</h2>
    ${recentAlerts?.filter(a => a.severity === 'critical').slice(0, 5).map(alert => `
      <div class="alert-item">
        <strong>${alert.title}</strong>
        <p style="margin: 8px 0; color: #64748b;">${alert.description}</p>
        <small>Ressource: ${alert.affected_resource}</small>
      </div>
    `).join('') || ''}
  </div>
  ` : ''}

  ${criticalVulns > 0 ? `
  <div class="section">
    <h2>🔥 Vulnérabilités Critiques (${criticalVulns})</h2>
    ${cvssAssessments?.filter(v => v.base_severity === 'Critical').slice(0, 5).map(vuln => `
      <div class="vuln-item">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong>${vuln.vulnerability_name}</strong>
          <span class="badge critical">CVSS ${vuln.base_score}</span>
        </div>
        <p style="margin: 8px 0; color: #64748b;">${vuln.description || 'Aucune description'}</p>
        ${vuln.cve_id ? `<small>CVE: ${vuln.cve_id}</small>` : ''}
      </div>
    `).join('') || ''}
  </div>
  ` : ''}

  <div class="section">
    <h2>📈 Analyse de Tendance</h2>
    <p>Score de sécurité sur la période:</p>
    <ul>
      <li>Maximum: ${Math.max(...(periodMetrics?.map(m => m.security_score) || [0]))}</li>
      <li>Minimum: ${Math.min(...(periodMetrics?.map(m => m.security_score) || [100]))}</li>
      <li>Moyenne: ${Math.round((periodMetrics?.reduce((sum, m) => sum + m.security_score, 0) || 0) / (periodMetrics?.length || 1))}</li>
    </ul>
  </div>

  ${scoreTrend < 0 ? `
  <div class="section" style="background: #fef2f2; border: 1px solid #fecaca;">
    <h2 style="color: #dc2626;">⚠️ Actions Recommandées</h2>
    <ul>
      <li>Le score de sécurité a diminué de ${Math.abs(scoreTrend).toFixed(1)} points</li>
      ${criticalAlerts > 0 ? `<li>Résoudre les ${criticalAlerts} alertes critiques en priorité</li>` : ''}
      ${criticalVulns > 0 ? `<li>Patcher les ${criticalVulns} vulnérabilités critiques immédiatement</li>` : ''}
      <li>Effectuer un audit de sécurité complet</li>
    </ul>
  </div>
  ` : ''}

  <div class="footer">
    <p>Rapport automatique généré par le système de monitoring de sécurité</p>
    <p>Pour plus de détails, consultez le tableau de bord de sécurité</p>
  </div>
</body>
</html>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Security Report <onboarding@resend.dev>",
      to: [alertEmail],
      subject: `Rapport de Sécurité ${periodLabel} - ${now.toLocaleDateString('fr-FR')}`,
      html,
    });

    console.log("✅ Report sent:", emailResponse);

    // Update scheduled report record
    await supabase
      .from("scheduled_reports")
      .update({
        last_sent_at: now.toISOString(),
        next_scheduled_at: getNextScheduledDate(reportType).toISOString(),
      })
      .eq("report_type", reportType);

    return new Response(
      JSON.stringify({ success: true, emailResponse }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("❌ Error sending report:", error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function getNextScheduledDate(reportType: string): Date {
  const now = new Date();
  switch (reportType) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      return now;
  }
}
