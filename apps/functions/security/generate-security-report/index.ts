import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("📊 Generating security report PDF...");

    // Fetch latest security data
    const { data: latestMetrics } = await supabase
      .from("security_metrics_snapshots")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(1)
      .single();

    const { data: recentAlerts } = await supabase
      .from("security_alerts")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(10);

    const { data: historicalMetrics } = await supabase
      .from("security_metrics_snapshots")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(30);

    // Generate HTML report
    const html = generateHTMLReport(latestMetrics, recentAlerts, historicalMetrics);

    // Return HTML for PDF generation (client-side with jsPDF)
    return new Response(
      JSON.stringify({
        success: true,
        html,
        metrics: latestMetrics,
        alerts: recentAlerts,
        historical: historicalMetrics,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("❌ Error generating report:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

function generateHTMLReport(
  metrics: any,
  alerts: any[],
  historical: any[]
): string {
  const date = new Date().toLocaleDateString("fr-FR");
  const criticalAlerts = alerts?.filter(a => a.severity === "critical").length || 0;
  const highAlerts = alerts?.filter(a => a.severity === "high").length || 0;
  const openAlerts = alerts?.filter(a => a.status === "open").length || 0;

  // Calculate trend
  const previousScore = historical?.[1]?.security_score || metrics?.security_score || 0;
  const currentScore = metrics?.security_score || 0;
  const trend = currentScore - previousScore;
  const trendIcon = trend > 0 ? "↗" : trend < 0 ? "↘" : "→";
  const trendColor = trend > 0 ? "#16a34a" : trend < 0 ? "#dc2626" : "#6b7280";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
    .header { text-align: center; margin-bottom: 40px; }
    .header h1 { color: #3b82f6; margin: 0; font-size: 32px; }
    .header p { color: #64748b; margin: 10px 0; }
    .score-card { 
      background: linear-gradient(135deg, #3b82f6 0%, #16a34a 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      margin: 30px 0;
    }
    .score-number { font-size: 72px; font-weight: bold; margin: 20px 0; }
    .score-grade { font-size: 36px; font-weight: bold; }
    .metrics-grid { 
      display: grid; 
      grid-template-columns: repeat(3, 1fr); 
      gap: 20px; 
      margin: 30px 0; 
    }
    .metric-card {
      border: 1px solid #e2e8f0;
      padding: 20px;
      border-radius: 8px;
      background: #f8fafc;
    }
    .metric-label { color: #64748b; font-size: 14px; margin-bottom: 8px; }
    .metric-value { font-size: 32px; font-weight: bold; color: #1e293b; }
    .alerts-section { margin: 40px 0; }
    .alert-item {
      border-left: 4px solid #dc2626;
      padding: 15px;
      margin: 10px 0;
      background: #fef2f2;
      border-radius: 4px;
    }
    .alert-item.high { border-left-color: #f59e0b; background: #fffbeb; }
    .alert-item.medium { border-left-color: #3b82f6; background: #eff6ff; }
    .alert-title { font-weight: bold; margin-bottom: 5px; }
    .recommendations { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 30px 0; }
    .recommendations h3 { color: #16a34a; margin-top: 0; }
    .recommendations ul { list-style: none; padding: 0; }
    .recommendations li { padding: 8px 0; border-bottom: 1px solid #dcfce7; }
    .recommendations li:before { content: "✓ "; color: #16a34a; font-weight: bold; }
    .trend { display: inline-block; margin-left: 10px; font-size: 24px; }
    .footer { text-align: center; color: #64748b; margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🛡️ Rapport de Sécurité</h1>
    <p>Généré le ${date}</p>
  </div>

  <div class="score-card">
    <div class="score-grade">
      Grade ${getScoreGrade(currentScore)}
      <span class="trend" style="color: ${trendColor}">${trendIcon} ${Math.abs(trend).toFixed(1)}</span>
    </div>
    <div class="score-number">${currentScore}/100</div>
    <p>Score de Sécurité Global</p>
  </div>

  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-label">Tables avec RLS</div>
      <div class="metric-value">${metrics?.tables_with_rls || 0}/${metrics?.total_tables || 0}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Politiques RLS</div>
      <div class="metric-value">${metrics?.total_policies || 0}</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Fonctions Sécurisées</div>
      <div class="metric-value">${metrics?.functions_with_search_path || 0}/${metrics?.total_functions || 0}</div>
    </div>
  </div>

  <div class="alerts-section">
    <h2>⚠️ Alertes Actives (${openAlerts})</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Critiques</div>
        <div class="metric-value" style="color: #dc2626">${criticalAlerts}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Élevées</div>
        <div class="metric-value" style="color: #f59e0b">${highAlerts}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total</div>
        <div class="metric-value">${alerts?.length || 0}</div>
      </div>
    </div>

    ${alerts?.slice(0, 5).map(alert => `
      <div class="alert-item ${alert.severity}">
        <div class="alert-title">${alert.title}</div>
        <div style="color: #64748b; font-size: 14px;">${alert.description}</div>
        <div style="margin-top: 8px; font-size: 12px; color: #64748b;">
          Ressource: ${alert.affected_resource} | 
          Statut: ${alert.status}
        </div>
      </div>
    `).join("") || "<p>Aucune alerte active</p>"}
  </div>

  <div class="recommendations">
    <h3>📋 Recommandations</h3>
    <ul>
      ${generateRecommendations(metrics, alerts).map(rec => `<li>${rec}</li>`).join("")}
    </ul>
  </div>

  <div class="footer">
    <p>Rapport automatique généré par le système de monitoring de sécurité</p>
    <p style="font-size: 12px;">Pour plus d'informations, consultez le tableau de bord de sécurité</p>
  </div>
</body>
</html>
  `;
}

function getScoreGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function generateRecommendations(metrics: any, alerts: any[]): string[] {
  const recommendations: string[] = [];

  if (metrics?.security_score < 90) {
    recommendations.push("Améliorer le score de sécurité global au-dessus de 90%");
  }

  const tablesWithoutRls = (metrics?.total_tables || 0) - (metrics?.tables_with_rls || 0);
  if (tablesWithoutRls > 0) {
    recommendations.push(`Activer RLS sur ${tablesWithoutRls} table(s) supplémentaire(s)`);
  }

  const functionsWithoutSearchPath = (metrics?.total_functions || 0) - (metrics?.functions_with_search_path || 0);
  if (functionsWithoutSearchPath > 0) {
    recommendations.push(`Sécuriser ${functionsWithoutSearchPath} fonction(s) avec search_path`);
  }

  const criticalAlerts = alerts?.filter(a => a.severity === "critical" && a.status === "open").length || 0;
  if (criticalAlerts > 0) {
    recommendations.push(`Résoudre ${criticalAlerts} alerte(s) critique(s) en priorité`);
  }

  if (recommendations.length === 0) {
    recommendations.push("Excellente configuration de sécurité ! Continuez le monitoring régulier");
    recommendations.push("Effectuez des audits de sécurité trimestriels");
    recommendations.push("Maintenez la documentation à jour");
  }

  return recommendations;
}
