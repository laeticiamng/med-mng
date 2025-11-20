import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertsReport {
  period: string;
  totalAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  avgScore: number;
  topAlerts: any[];
  severityDistribution: Record<string, number>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification requise pour send-weekly-alerts-report
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Créer client Supabase si nécessaire
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.3');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier le token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // ✅ SÉCURITÉ: Vérifier rôle ADMIN pour send-weekly-alerts-report
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some((r) => r.role === 'admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ send-weekly-alerts-report autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Récupérer les alertes des 7 derniers jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: alerts, error } = await supabase
      .from('unified_alerts')
      .select('*')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('unified_score', { ascending: false });

    if (error) throw error;

    // Générer le rapport
    const report: AlertsReport = {
      period: '7 derniers jours',
      totalAlerts: alerts?.length || 0,
      criticalAlerts: alerts?.filter(a => a.severity === 'critical').length || 0,
      highAlerts: alerts?.filter(a => a.severity === 'high').length || 0,
      avgScore: alerts?.reduce((sum, a) => sum + (a.unified_score || 0), 0) / (alerts?.length || 1),
      topAlerts: alerts?.slice(0, 10) || [],
      severityDistribution: {
        critical: alerts?.filter(a => a.severity === 'critical').length || 0,
        high: alerts?.filter(a => a.severity === 'high').length || 0,
        medium: alerts?.filter(a => a.severity === 'medium').length || 0,
        low: alerts?.filter(a => a.severity === 'low').length || 0,
      },
    };

    // Générer le HTML de l'email
    const emailHtml = generateEmailHtml(report);

    // Récupérer les destinataires (admin emails)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('email')
      .eq('is_admin', true);

    const recipients = profiles?.map(p => p.email).filter(Boolean) || ['admin@example.com'];

    // Envoyer l'email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Alertes MED-MNG <noreply@medmng.com>',
        to: recipients,
        subject: `📊 Rapport Hebdomadaire Alertes - ${report.totalAlerts} alertes`,
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errorData = await resendResponse.text();
      throw new Error(`Resend API error: ${errorData}`);
    }

    const resendData = await resendResponse.json();

    // Enregistrer l'envoi dans la base
    await supabase.from('email_logs').insert({
      type: 'weekly_alerts_report',
      recipients,
      report_data: report,
      sent_at: new Date().toISOString(),
      resend_id: resendData.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        report,
        recipients,
        resend_id: resendData.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending weekly report:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateEmailHtml(report: AlertsReport): string {
  const criticalBadge = report.criticalAlerts > 0 
    ? `<span style="background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${report.criticalAlerts} CRITIQUES</span>`
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .content { padding: 30px; }
    .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; color: #667eea; }
    .stat-label { color: #666; font-size: 14px; margin-top: 5px; }
    .alert-item { border-left: 4px solid #667eea; padding: 12px; margin: 10px 0; background: #f8f9fa; border-radius: 4px; }
    .alert-item.critical { border-color: #ef4444; }
    .alert-item.high { border-color: #f97316; }
    .severity-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .severity-critical { background: #ef4444; color: white; }
    .severity-high { background: #f97316; color: white; }
    .severity-medium { background: #eab308; color: white; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">📊 Rapport Hebdomadaire</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">Alertes Unifiées - ${report.period}</p>
      ${criticalBadge}
    </div>
    
    <div class="content">
      <div class="stats">
        <div class="stat-card">
          <div class="stat-value">${report.totalAlerts}</div>
          <div class="stat-label">Total Alertes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${report.avgScore.toFixed(1)}</div>
          <div class="stat-label">Score Moyen</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #ef4444;">${report.criticalAlerts}</div>
          <div class="stat-label">Critiques</div>
        </div>
        <div class="stat-card">
          <div class="stat-value" style="color: #f97316;">${report.highAlerts}</div>
          <div class="stat-label">Élevées</div>
        </div>
      </div>

      <h3>Distribution par Sévérité</h3>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
        <div style="margin: 8px 0;">
          <span class="severity-badge severity-critical">Critique</span>
          <span style="margin-left: 10px;">${report.severityDistribution.critical} alertes</span>
        </div>
        <div style="margin: 8px 0;">
          <span class="severity-badge severity-high">Élevée</span>
          <span style="margin-left: 10px;">${report.severityDistribution.high} alertes</span>
        </div>
        <div style="margin: 8px 0;">
          <span class="severity-badge severity-medium">Moyenne</span>
          <span style="margin-left: 10px;">${report.severityDistribution.medium} alertes</span>
        </div>
      </div>

      <h3 style="margin-top: 30px;">Top 10 Alertes Prioritaires</h3>
      ${report.topAlerts.map(alert => `
        <div class="alert-item ${alert.severity}">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div style="flex: 1;">
              <strong>${alert.title}</strong>
              <div style="font-size: 12px; color: #666; margin-top: 4px;">
                ${alert.source} • Score: ${alert.unified_score?.toFixed(1)}
              </div>
            </div>
            <span class="severity-badge severity-${alert.severity}">${alert.severity.toUpperCase()}</span>
          </div>
          ${alert.description ? `<p style="margin: 8px 0 0 0; font-size: 14px;">${alert.description}</p>` : ''}
        </div>
      `).join('')}

      <div style="margin-top: 30px; padding: 15px; background: #e0e7ff; border-radius: 8px; text-align: center;">
        <p style="margin: 0;">
          📈 <strong>Consulter le dashboard complet</strong><br>
          <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/admin/security" 
             style="color: #667eea; text-decoration: none; font-weight: bold;">
            Accéder au Dashboard Analytics
          </a>
        </p>
      </div>
    </div>

    <div class="footer">
      <p>Ce rapport est généré automatiquement chaque semaine.</p>
      <p style="margin: 5px 0;">MED-MNG Security Monitoring System</p>
    </div>
  </div>
</body>
</html>
  `;
}
