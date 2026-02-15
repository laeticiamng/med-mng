import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecurityAlertRequest {
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  affected_resource: string;
  recommendation: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const slackWebhook = Deno.env.get("SLACK_WEBHOOK_URL");
    const alertEmail = Deno.env.get("ALERT_EMAIL") || "admin@example.com";

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is required");
    }

    const alert: SecurityAlertRequest = await req.json();
    console.log(`🚨 Processing security alert: ${alert.title}`);

    const resend = new Resend(resendApiKey);

    // Determine if alert is critical (high or critical severity)
    const isCritical = alert.severity === "critical" || alert.severity === "high";

    // Send email notification
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .alert-header { 
            padding: 20px; 
            background: ${alert.severity === "critical" ? "#ef4444" : alert.severity === "high" ? "#f59e0b" : "#3b82f6"};
            color: white;
            border-radius: 8px 8px 0 0;
          }
          .alert-body { 
            padding: 20px; 
            background: #f9fafb; 
            border: 1px solid #e5e7eb;
            border-radius: 0 0 8px 8px;
          }
          .severity { 
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
          }
          .severity-critical { background: #fef2f2; color: #dc2626; }
          .severity-high { background: #fffbeb; color: #d97706; }
          .severity-medium { background: #eff6ff; color: #2563eb; }
          .metadata { 
            background: white; 
            padding: 15px; 
            border-radius: 6px; 
            margin-top: 15px;
            border-left: 4px solid #3b82f6;
          }
          .recommendation {
            background: #f0fdf4;
            padding: 15px;
            border-radius: 6px;
            margin-top: 15px;
            border-left: 4px solid #22c55e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="alert-header">
            <h1 style="margin: 0; font-size: 24px;">🔒 Alerte de Sécurité MED-MNG</h1>
          </div>
          <div class="alert-body">
            <p>
              <span class="severity severity-${alert.severity}">${alert.severity}</span>
            </p>
            
            <h2 style="color: #1f2937; margin-top: 20px;">${alert.title}</h2>
            
            <p style="color: #4b5563; font-size: 16px;">
              ${alert.description}
            </p>

            <div class="metadata">
              <p style="margin: 0;"><strong>Type d'alerte:</strong> ${alert.alert_type}</p>
              <p style="margin: 10px 0 0 0;"><strong>Ressource affectée:</strong> ${alert.affected_resource}</p>
              ${alert.metadata ? `<p style="margin: 10px 0 0 0;"><strong>Détails:</strong> ${JSON.stringify(alert.metadata, null, 2)}</p>` : ""}
            </div>

            <div class="recommendation">
              <h3 style="margin: 0 0 10px 0; color: #166534;">💡 Recommandation</h3>
              <p style="margin: 0; color: #166534;">${alert.recommendation}</p>
            </div>

            <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
              Cette alerte a été générée automatiquement par le système de monitoring de sécurité MED-MNG.
              <br>
              Consultez le <a href="https://yaincoxihiqdksxgrsrk.supabase.co" style="color: #3b82f6;">dashboard de sécurité</a> pour plus de détails.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResult = await resend.emails.send({
      from: "MED-MNG Security <security@resend.dev>",
      to: [alertEmail],
      subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
      html: emailHtml,
    });

    console.log("✅ Email sent:", emailResult);

    // Send Slack notification if webhook is configured and alert is critical
    let slackResult = null;
    if (slackWebhook && isCritical) {
      const slackPayload = {
        text: `🚨 *Alerte de Sécurité Critique*`,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `🔒 ${alert.title}`,
              emoji: true,
            },
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Sévérité:*\n${alert.severity.toUpperCase()}`,
              },
              {
                type: "mrkdwn",
                text: `*Type:*\n${alert.alert_type}`,
              },
            ],
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Description:*\n${alert.description}`,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Recommandation:*\n${alert.recommendation}`,
            },
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Ressource: ${alert.affected_resource} | ${new Date().toLocaleString("fr-FR")}`,
              },
            ],
          },
        ],
      };

      const slackResponse = await fetch(slackWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slackPayload),
      });

      if (slackResponse.ok) {
        console.log("✅ Slack notification sent");
        slackResult = { success: true };
      } else {
        console.error("❌ Slack notification failed:", await slackResponse.text());
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        email: emailResult,
        slack: slackResult,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error sending security alert:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});