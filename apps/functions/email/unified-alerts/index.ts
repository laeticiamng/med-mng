import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { RedisCache } from "../_shared/redisCache.ts";
import { AlertPersistence, UnifiedAlert } from "../_shared/alertPersistence.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SÉCURITÉ CRITIQUE: Authentification requise pour unified-alerts
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

    // ✅ SÉCURITÉ: Vérifier rôle ADMIN pour unified-alerts
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

    console.log(`✅ unified-alerts autorisé pour admin ${user.id}`);

    // Code original de la fonction
    
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "combined";
    const forceRefresh = searchParams.get("force") === "true";

    console.log(`[unified-alerts] Mode: ${mode}, Force refresh: ${forceRefresh}`);

    // Récupération des secrets depuis l'environnement Supabase
    const PAGERDUTY_API_KEY = Deno.env.get("PAGERDUTY_API_KEY");
    const PAGERDUTY_INTEGRATION_KEY = Deno.env.get("PAGERDUTY_INTEGRATION_KEY");
    const NVD_API_KEY = Deno.env.get("NVD_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const cache = new RedisCache(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const persistence = new AlertPersistence(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let alerts: UnifiedAlert[] = [];
    let fromCache = false;

    // Vérifier le cache si pas de force refresh
    if (!forceRefresh) {
      const cacheKey = `alerts:${mode}`;
      const cached = await cache.get<UnifiedAlert[]>(cacheKey);
      if (cached && Array.isArray(cached)) {
        alerts = cached;
        fromCache = true;
        console.log(`[unified-alerts] Loaded ${alerts.length} alerts from cache`);
      }
    }

    // Si pas en cache, récupérer depuis les APIs
    if (alerts.length === 0) {

      // Récupération des incidents PagerDuty
      if ((mode === "pagerduty" || mode === "combined") && PAGERDUTY_API_KEY) {
      console.log("[unified-alerts] Fetching PagerDuty incidents...");
      try {
        const pagerdutyResp = await fetch("https://api.pagerduty.com/incidents?limit=10&statuses[]=triggered&statuses[]=acknowledged", {
          headers: {
            Authorization: `Token token=${PAGERDUTY_API_KEY}`,
            Accept: "application/vnd.pagerduty+json;version=2",
          },
        });

        if (pagerdutyResp.ok) {
          const pagerdutyData = await pagerdutyResp.json();
          const incidents = pagerdutyData.incidents || [];
          
          console.log(`[unified-alerts] Found ${incidents.length} PagerDuty incidents`);

          incidents.forEach((incident: any) => {
            alerts.push({
              external_id: `pd-${incident.id}`,
              source: 'pagerduty',
              severity: incident.urgency === 'high' ? 'critical' : 'high',
              title: incident.title || incident.summary,
              description: incident.description || '',
              created_at: incident.created_at,
              url: incident.html_url,
              status: incident.status,
            });
          });
        } else {
          console.error(`[unified-alerts] PagerDuty API error: ${pagerdutyResp.status}`);
        }
      } catch (error) {
        console.error("[unified-alerts] PagerDuty fetch error:", error);
      }
    }

      // Récupération des CVE depuis NVD
      if ((mode === "nvd" || mode === "combined") && NVD_API_KEY) {
      console.log("[unified-alerts] Fetching NVD CVEs...");
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7); // Derniers 7 jours

        const nvdResp = await fetch(
          `https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=10&pubStartDate=${startDate.toISOString()}&pubEndDate=${endDate.toISOString()}`,
          {
            headers: {
              'apiKey': NVD_API_KEY,
            },
          }
        );

        if (nvdResp.ok) {
          const nvdData = await nvdResp.json();
          const vulnerabilities = nvdData.vulnerabilities || [];
          
          console.log(`[unified-alerts] Found ${vulnerabilities.length} NVD CVEs`);

          vulnerabilities.forEach((vuln: any) => {
            const cve = vuln.cve;
            const cvssScore = cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || 
                            cve.metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore || 0;
            
            let severity: 'critical' | 'high' | 'medium' | 'low' = 'low';
            if (cvssScore >= 9.0) severity = 'critical';
            else if (cvssScore >= 7.0) severity = 'high';
            else if (cvssScore >= 4.0) severity = 'medium';

            alerts.push({
              external_id: `nvd-${cve.id}`,
              source: 'nvd',
              severity,
              title: cve.id,
              description: cve.descriptions?.[0]?.value || '',
              created_at: cve.published,
              cvss_score: cvssScore,
              url: `https://nvd.nist.gov/vuln/detail/${cve.id}`,
            });
          });
        } else {
          console.error(`[unified-alerts] NVD API error: ${nvdResp.status}`);
        }
      } catch (error) {
        console.error("[unified-alerts] NVD fetch error:", error);
      }
    }

      // Persister et calculer le scoring
      console.log(`[unified-alerts] Persisting ${alerts.length} alerts...`);
      const persistedAlerts = await persistence.upsertAlerts(alerts);
      
      // Mettre en cache
      const cacheKey = `alerts:${mode}`;
      await cache.set(cacheKey, persistedAlerts);
      
      alerts = persistedAlerts;
    }

    // Trier par score unifié (déjà calculé par le système de scoring)
    alerts.sort((a, b) => {
      const scoreA = a.unified_score || 0;
      const scoreB = b.unified_score || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Envoi en temps réel via Supabase Broadcast
    const channel = supabase.channel('unified-alerts-broadcast');
    await channel.send({
      type: 'broadcast',
      event: 'alerts-updated',
      payload: {
        timestamp: new Date().toISOString(),
        count: alerts.length,
        critical_count: alerts.filter(a => a.severity === 'critical').length,
        high_count: alerts.filter(a => a.severity === 'high').length,
        alerts: alerts.slice(0, 5), // Envoyer seulement les 5 premières
      },
    });

    console.log(`[unified-alerts] Broadcast sent with ${alerts.length} alerts`);

    // Statistiques de cache
    const cacheKey = `alerts:${mode}`;
    const cacheStats = await cache.getStats(cacheKey);

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      mode,
      from_cache: fromCache,
      cache_stats: cacheStats,
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length,
      avg_unified_score: alerts.length > 0 
        ? Math.round((alerts.reduce((sum, a) => sum + (a.unified_score || 0), 0) / alerts.length) * 100) / 100
        : 0,
      alerts,
    };

    return new Response(JSON.stringify(response, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[unified-alerts] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
