import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

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
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    const adminEmail = Deno.env.get("ADMIN_EMAIL")!;

    if (!resendApiKey || !adminEmail) {
      throw new Error("Missing RESEND_API_KEY or ADMIN_EMAIL configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    // Get report type from request (daily, weekly, monthly)
    const { reportType = 'daily' } = await req.json().catch(() => ({}));

    console.log(`📊 Generating ${reportType} PDF report...`);

    // Calculate date range based on report type
    const now = new Date();
    let startDate: Date;

    switch (reportType) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Fetch notifications within the date range
    const { data: notifications, error: fetchError } = await supabase
      .from("security_notifications")
      .select("*")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", now.toISOString())
      .order("created_at", { ascending: false });

    if (fetchError) throw fetchError;

    if (!notifications || notifications.length === 0) {
      console.log(`No notifications found for ${reportType} report`);
      return new Response(
        JSON.stringify({
          success: true,
          message: `No notifications to report for ${reportType} period`,
          count: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Calculate statistics
    const stats = {
      total: notifications.length,
      critical: notifications.filter(n => n.severity === 'critical').length,
      warning: notifications.filter(n => n.severity === 'warning').length,
      info: notifications.filter(n => n.severity === 'info').length,
      byType: {
        mass_deletion: notifications.filter(n => n.type === 'mass_deletion').length,
        unauthorized_access: notifications.filter(n => n.type === 'unauthorized_access').length,
        suspicious_activity: notifications.filter(n => n.type === 'suspicious_activity').length,
        system_alert: notifications.filter(n => n.type === 'system_alert').length,
      },
    };

    // Generate HTML email with embedded data
    const emailHtml = generateReportEmailHTML(reportType, stats, startDate, now, notifications);

    // Send email
    const emailResult = await resend.emails.send({
      from: "Security Team <security@resend.dev>",
      to: [adminEmail],
      subject: `📊 Rapport ${getReportTypeLabel(reportType)} de Sécurité - ${now.toLocaleDateString('fr-FR')}`,
      html: emailHtml,
    });

    console.log("✅ Scheduled report sent successfully:", emailResult);

    return new Response(
      JSON.stringify({
        success: true,
        stats,
        reportType,
        emailSent: true,
        emailId: emailResult.data?.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("❌ Error generating scheduled report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function getReportTypeLabel(type: string): string {
  switch (type) {
    case 'daily':
      return 'Quotidien';
    case 'weekly':
      return 'Hebdomadaire';
    case 'monthly':
      return 'Mensuel';
    default:
      return type;
  }
}

function generateReportEmailHTML(
  reportType: string,
  stats: any,
  startDate: Date,
  endDate: Date,
  notifications: any[]
): string {
  const typeLabels: Record<string, string> = {
    mass_deletion: '🗑️ Suppression massive',
    unauthorized_access: '🚫 Accès non autorisé',
    suspicious_activity: '⚠️ Activité suspecte',
    system_alert: '🔔 Alerte système',
  };

  return `
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
          .critical-badge { background: #dc2626; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
          .warning-badge { background: #ea580c; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
          .info-badge { background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f8f9fa; font-weight: 600; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Rapport ${getReportTypeLabel(reportType)} de Sécurité</h1>
            <p>Période: ${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')}</p>
          </div>

          <div class="stat-card">
            <div class="stat-label">Total de notifications</div>
            <div class="stat-value">${stats.total}</div>
          </div>

          <h2>Répartition par Sévérité</h2>
          <table>
            <tr>
              <td><span class="critical-badge">Critique</span></td>
              <td><strong>${stats.critical}</strong> notification${stats.critical > 1 ? 's' : ''}</td>
            </tr>
            <tr>
              <td><span class="warning-badge">Warning</span></td>
              <td><strong>${stats.warning}</strong> notification${stats.warning > 1 ? 's' : ''}</td>
            </tr>
            <tr>
              <td><span class="info-badge">Info</span></td>
              <td><strong>${stats.info}</strong> notification${stats.info > 1 ? 's' : ''}</td>
            </tr>
          </table>

          <h2>Répartition par Type</h2>
          <table>
            ${Object.entries(stats.byType).map(([type, count]) => `
              <tr>
                <td>${typeLabels[type] || type}</td>
                <td><strong>${count}</strong></td>
              </tr>
            `).join('')}
          </table>

          ${stats.critical > 0 || stats.warning > 5 ? `
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <strong>⚠️ Attention requise</strong><br>
              ${stats.critical > 0 ? `${stats.critical} alerte(s) critique(s) détectée(s). ` : ''}
              ${stats.warning > 5 ? `Nombre élevé d'avertissements (${stats.warning}).` : ''}
              Consultez le dashboard pour plus de détails.
            </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'supabase.co')}/project/_/audit-security" 
               style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Voir le Dashboard Complet
            </a>
          </div>

          <div class="footer">
            <p>Ce rapport a été généré automatiquement par le système de surveillance de sécurité.</p>
            <p>Pour toute question, contactez votre administrateur système.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
