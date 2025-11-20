import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QualityAlertRequest {
  type: "code_quality" | "visual_regression";
  severity: "low" | "medium" | "high" | "critical";
  summary: string;
  details: any;
  recipientEmail: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification JWT + Vérification Admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.warn('❌ Tentative accès send-quality-alert sans authentification');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Créer client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.50.3');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier le token JWT
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.warn('❌ Token invalide pour send-quality-alert');
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
      console.warn(`❌ Non-admin tentative send-quality-alert par user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ send-quality-alert autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    const { type, severity, summary, details, recipientEmail }: QualityAlertRequest = await req.json();

    const severityEmoji = {
      low: "ℹ️",
      medium: "⚠️",
      high: "🚨",
      critical: "🔴"
    };

    const typeLabel = type === "code_quality" ? "Qualité du Code" : "Régression Visuelle";
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .alert-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-weight: bold;
              margin: 10px 0;
            }
            .critical { background: #ef4444; color: white; }
            .high { background: #f59e0b; color: white; }
            .medium { background: #eab308; color: white; }
            .low { background: #3b82f6; color: white; }
            .summary {
              background: white;
              padding: 20px;
              border-left: 4px solid #667eea;
              margin: 20px 0;
              border-radius: 4px;
            }
            .details {
              background: white;
              padding: 15px;
              border-radius: 4px;
              margin-top: 15px;
              font-size: 14px;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
            .cta-button {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${severityEmoji[severity]} Alerte de Qualité</h1>
            <p>Détection automatique par IA</p>
          </div>
          <div class="content">
            <div class="alert-badge ${severity}">
              ${severity.toUpperCase()} - ${typeLabel}
            </div>
            
            <div class="summary">
              <h2>Résumé</h2>
              <p>${summary}</p>
            </div>

            ${details ? `
              <div class="details">
                <h3>Détails</h3>
                ${type === "code_quality" && details.analysis ? `
                  <ul>
                    <li><strong>Bugs:</strong> ${details.analysis.bugs || 0}</li>
                    <li><strong>Vulnérabilités:</strong> ${details.analysis.vulnerabilities || 0}</li>
                    <li><strong>Code Smells:</strong> ${details.analysis.codeSmells || 0}</li>
                    <li><strong>Note de Maintenabilité:</strong> ${details.analysis.maintainabilityRating || "N/A"}</li>
                    <li><strong>Note de Sécurité:</strong> ${details.analysis.securityRating || "N/A"}</li>
                  </ul>
                ` : ''}
                ${type === "visual_regression" && details.analysis ? `
                  <ul>
                    <li><strong>Nombre de régressions:</strong> ${details.analysis.regressionCount || 0}</li>
                    <li><strong>Problèmes d'accessibilité:</strong> ${details.analysis.accessibilityIssues?.length || 0}</li>
                    <li><strong>Score global:</strong> ${details.analysis.overallScore || 0}/100</li>
                  </ul>
                ` : ''}
              </div>
            ` : ''}

            <div style="text-align: center;">
              <a href="${Deno.env.get("SITE_URL") || "http://localhost:8080"}/quality-dashboard" class="cta-button">
                Voir le Dashboard
              </a>
            </div>
          </div>
          <div class="footer">
            <p>Cette alerte a été générée automatiquement par votre système d'analyse de qualité IA</p>
            <p>Pour désactiver ces notifications, contactez votre administrateur</p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Quality Alert <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `${severityEmoji[severity]} Alerte ${severity.toUpperCase()}: ${summary}`,
      html: emailHtml,
    });

    console.log("Quality alert email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending quality alert email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
