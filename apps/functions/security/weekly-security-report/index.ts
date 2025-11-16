import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecurityStats {
  totalLogs: number;
  uniqueUsers: number;
  actionsByType: { action: string; count: number }[];
  topResources: { resource_type: string; count: number }[];
  suspiciousActivity: number;
  trendComparison: {
    currentWeek: number;
    previousWeek: number;
    percentChange: number;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    const adminEmail = Deno.env.get("ADMIN_EMAIL")!;

    if (!resendApiKey || !adminEmail) {
      throw new Error("Missing RESEND_API_KEY or ADMIN_EMAIL configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    console.log("📊 Generating weekly security report...");

    // Get date ranges
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Fetch current week logs
    const { data: currentWeekLogs, error: currentError } = await supabase
      .from("share_audit_logs")
      .select("*")
      .gte("created_at", oneWeekAgo.toISOString())
      .lte("created_at", now.toISOString());

    if (currentError) throw currentError;

    // Fetch previous week logs for comparison
    const { data: previousWeekLogs, error: previousError } = await supabase
      .from("share_audit_logs")
      .select("*")
      .gte("created_at", twoWeeksAgo.toISOString())
      .lt("created_at", oneWeekAgo.toISOString());

    if (previousError) throw previousError;

    // Calculate statistics
    const stats: SecurityStats = {
      totalLogs: currentWeekLogs?.length || 0,
      uniqueUsers: new Set(currentWeekLogs?.map((log: any) => log.user_id).filter(Boolean)).size,
      actionsByType: [],
      topResources: [],
      suspiciousActivity: 0,
      trendComparison: {
        currentWeek: currentWeekLogs?.length || 0,
        previousWeek: previousWeekLogs?.length || 0,
        percentChange: 0,
      },
    };

    // Calculate percent change
    if (stats.trendComparison.previousWeek > 0) {
      stats.trendComparison.percentChange = 
        ((stats.trendComparison.currentWeek - stats.trendComparison.previousWeek) / 
        stats.trendComparison.previousWeek) * 100;
    }

    // Group by action type
    const actionCounts: Record<string, number> = {};
    currentWeekLogs?.forEach((log: any) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });
    stats.actionsByType = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count);

    // Group by resource type
    const resourceCounts: Record<string, number> = {};
    currentWeekLogs?.forEach((log: any) => {
      resourceCounts[log.resource_type] = (resourceCounts[log.resource_type] || 0) + 1;
    });
    stats.topResources = Object.entries(resourceCounts)
      .map(([resource_type, count]) => ({ resource_type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Detect suspicious activity (deletions, unusual patterns)
    stats.suspiciousActivity = currentWeekLogs?.filter((log: any) => 
      log.action === 'delete' || 
      (log.details && log.details.suspicious === true)
    ).length || 0;

    // Generate HTML email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
            .stat-card { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .stat-value { font-size: 32px; font-weight: bold; color: #667eea; }
            .stat-label { color: #666; font-size: 14px; text-transform: uppercase; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .trend-up { color: #28a745; }
            .trend-down { color: #dc3545; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f8f9fa; font-weight: 600; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Rapport Hebdomadaire de Sécurité</h1>
              <p>Période: ${oneWeekAgo.toLocaleDateString('fr-FR')} - ${now.toLocaleDateString('fr-FR')}</p>
            </div>

            <div class="stat-card">
              <div class="stat-label">Total d'événements</div>
              <div class="stat-value">${stats.totalLogs.toLocaleString()}</div>
              <p>
                ${stats.trendComparison.percentChange > 0 ? '📈' : '📉'}
                <span class="${stats.trendComparison.percentChange > 0 ? 'trend-up' : 'trend-down'}">
                  ${Math.abs(stats.trendComparison.percentChange).toFixed(1)}% 
                  ${stats.trendComparison.percentChange > 0 ? 'augmentation' : 'diminution'}
                </span>
                par rapport à la semaine dernière (${stats.trendComparison.previousWeek})
              </p>
            </div>

            <div class="stat-card">
              <div class="stat-label">Utilisateurs actifs</div>
              <div class="stat-value">${stats.uniqueUsers}</div>
            </div>

            ${stats.suspiciousActivity > 0 ? `
              <div class="warning">
                <strong>⚠️ Activité suspecte détectée</strong><br>
                ${stats.suspiciousActivity} événement(s) suspect(s) identifié(s) cette semaine.
                Vérifiez les logs d'audit pour plus de détails.
              </div>
            ` : ''}

            <h2>Actions par Type</h2>
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Nombre d'occurrences</th>
                </tr>
              </thead>
              <tbody>
                ${stats.actionsByType.map(item => `
                  <tr>
                    <td><strong>${item.action}</strong></td>
                    <td>${item.count}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <h2>Top 5 des Ressources Accédées</h2>
            <table>
              <thead>
                <tr>
                  <th>Type de ressource</th>
                  <th>Nombre d'accès</th>
                </tr>
              </thead>
              <tbody>
                ${stats.topResources.map(item => `
                  <tr>
                    <td><strong>${item.resource_type}</strong></td>
                    <td>${item.count}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer">
              <p>Ce rapport est généré automatiquement chaque semaine.</p>
              <p>Pour consulter les logs détaillés, connectez-vous à la plateforme d'administration.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    const emailResult = await resend.emails.send({
      from: "Security Team <security@resend.dev>",
      to: [adminEmail],
      subject: `📊 Rapport Hebdomadaire de Sécurité - ${now.toLocaleDateString('fr-FR')}`,
      html: htmlContent,
    });

    console.log("✅ Weekly report sent successfully:", emailResult);

    return new Response(
      JSON.stringify({
        success: true,
        stats,
        emailSent: true,
        emailId: emailResult.data?.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("❌ Error generating weekly report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
