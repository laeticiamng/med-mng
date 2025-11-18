import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface QualityHistoryQuery {
  project_name?: string;
  start_date?: string;
  end_date?: string;
  risk_levels?: string[];
  limit?: number;
  offset?: number;
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
      console.warn('❌ Tentative accès get-quality-history sans authentification');
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
      console.warn('❌ Token invalide pour get-quality-history');
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
      console.warn(`❌ Non-admin tentative get-quality-history par user ${user.id}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Admin role required' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`✅ get-quality-history autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const url = new URL(req.url);
    
    // Extraire les paramètres de requête
    const query: QualityHistoryQuery = {
      project_name: url.searchParams.get("project_name") || undefined,
      start_date: url.searchParams.get("start_date") || undefined,
      end_date: url.searchParams.get("end_date") || undefined,
      risk_levels: url.searchParams.get("risk_levels")?.split(",") || undefined,
      limit: parseInt(url.searchParams.get("limit") || "50"),
      offset: parseInt(url.searchParams.get("offset") || "0"),
    };

    console.log("📊 Récupération historique qualité:", query);

    // Construction de la requête Supabase
    let dbQuery = supabase
      .from("code_quality_reports")
      .select("*", { count: "exact" })
      .order("analyzed_at", { ascending: false });

    // Appliquer les filtres
    if (query.project_name) {
      dbQuery = dbQuery.eq("project_name", query.project_name);
    }

    if (query.start_date) {
      dbQuery = dbQuery.gte("analyzed_at", query.start_date);
    }

    if (query.end_date) {
      dbQuery = dbQuery.lte("analyzed_at", query.end_date);
    }

    // Pagination
    dbQuery = dbQuery.range(query.offset, query.offset + query.limit - 1);

    const { data: reports, error, count } = await dbQuery;

    if (error) {
      console.error("Erreur récupération historique:", error);
      throw error;
    }

    // Filtrer par risk_level si spécifié (pas directement dans la DB)
    let filteredReports = reports || [];
    if (query.risk_levels && query.risk_levels.length > 0) {
      filteredReports = filteredReports.filter((report: any) => {
        // Le risk_level pourrait être dans metadata ou summary
        const summary = report.summary?.toLowerCase() || "";
        return query.risk_levels?.some((level) =>
          summary.includes(level.toLowerCase())
        );
      });
    }

    // Calculer des statistiques agrégées
    const stats = {
      total_reports: count || 0,
      total_bugs: filteredReports.reduce(
        (sum: number, r: any) => sum + (r.metrics?.bugs || 0),
        0
      ),
      total_vulnerabilities: filteredReports.reduce(
        (sum: number, r: any) => sum + (r.metrics?.vulnerabilities || 0),
        0
      ),
      total_code_smells: filteredReports.reduce(
        (sum: number, r: any) => sum + (r.metrics?.code_smells || 0),
        0
      ),
      avg_bugs:
        filteredReports.length > 0
          ? (
              filteredReports.reduce(
                (sum: number, r: any) => sum + (r.metrics?.bugs || 0),
                0
              ) / filteredReports.length
            ).toFixed(2)
          : 0,
      avg_vulnerabilities:
        filteredReports.length > 0
          ? (
              filteredReports.reduce(
                (sum: number, r: any) => sum + (r.metrics?.vulnerabilities || 0),
                0
              ) / filteredReports.length
            ).toFixed(2)
          : 0,
    };

    // Données pour graphiques temporels
    const timeSeriesData = filteredReports.map((report: any) => ({
      date: report.analyzed_at,
      bugs: report.metrics?.bugs || 0,
      vulnerabilities: report.metrics?.vulnerabilities || 0,
      code_smells: report.metrics?.code_smells || 0,
      files_analyzed: report.metrics?.files_analyzed || 0,
      project_name: report.project_name,
    }));

    console.log(`✅ ${filteredReports.length} rapports récupérés`);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          reports: filteredReports,
          stats,
          timeSeries: timeSeriesData,
          pagination: {
            total: count || 0,
            limit: query.limit,
            offset: query.offset,
            hasMore: (query.offset + query.limit) < (count || 0),
          },
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("❌ Erreur get-quality-history:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
