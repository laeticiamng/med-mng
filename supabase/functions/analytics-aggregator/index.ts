import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  filters?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { startDate, endDate, filters = {} }: AnalyticsQuery = await req.json();

    console.log('📊 Aggregating analytics from', startDate, 'to', endDate);

    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 jours par défaut
    const end = endDate ? new Date(endDate) : now;

    // 1. Métriques d'activité utilisateur
    const { data: activityData } = await supabase
      .from('user_activity_logs')
      .select('activity_type, created_at, user_id, activity_details')
      .gte('timestamp', start.toISOString())
      .lte('timestamp', end.toISOString());

    // 2. Métriques de contenu (musiques générées)
    const { data: musicData } = await supabase
      .from('emotionscare_songs')
      .select('id, title, meta, created_at')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    // 3. Métriques d'erreurs
    const { data: errorData } = await supabase
      .from('error_logs')
      .select('severity, created_at, resolved')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString());

    // Analyser les données d'activité
    const userActivity = analyzeUserActivity(activityData || []);
    const contentMetrics = analyzeContentMetrics(musicData || []);
    const errorMetrics = analyzeErrorMetrics(errorData || []);
    const performanceMetrics = analyzePerformanceMetrics(activityData || []);

    // Calculer les métriques de revenus (simulé)
    const revenueMetrics = {
      totalRevenue: Math.floor(Math.random() * 10000) + 5000,
      activeSubscriptions: Math.floor(Math.random() * 500) + 100,
      churnRate: Math.random() * 10 + 2, // 2-12%
      conversionRate: Math.random() * 5 + 1 // 1-6%
    };

    const analyticsData = {
      userActivity,
      contentMetrics,
      performanceMetrics,
      revenueMetrics,
      errorMetrics,
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
        durationDays: Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
      }
    };

    return new Response(
      JSON.stringify(analyticsData),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('❌ Analytics aggregation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Analytics aggregation failed',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
})

function analyzeUserActivity(data: any[]) {
  const uniqueSessions = new Set(data.map(d => d.user_id || d.session_id)).size;
  const totalEvents = data.length;
  
  // Calculer les sessions par utilisateur
  const userSessions = data.reduce((acc, d) => {
    const userId = d.user_id || 'anonymous';
    acc[userId] = (acc[userId] || 0) + 1;
    return acc;
  }, {});

  const uniqueUsers = Object.keys(userSessions).length;
  const returningUsers = Object.values(userSessions).filter((count: number) => count > 1).length;
  const newUsers = uniqueUsers - returningUsers;
  
  // Simuler durée moyenne de session
  const averageSessionDuration = Math.floor(Math.random() * 20 + 10); // 10-30 minutes
  const bounceRate = Math.random() * 30 + 20; // 20-50%

  return {
    totalSessions: uniqueSessions,
    averageSessionDuration,
    bounceRate,
    newUsers,
    returningUsers,
    totalEvents
  };
}

function analyzeContentMetrics(data: any[]) {
  const totalGenerations = data.length;
  const successfulGenerations = data.filter(d => d.meta?.status === 'success' || !d.meta?.status).length;
  
  // Analyser les styles populaires
  const styles = data.map(d => d.meta?.style || 'unknown');
  const styleCount = styles.reduce((acc, style) => {
    acc[style] = (acc[style] || 0) + 1;
    return acc;
  }, {});
  
  const popularStyles = Object.entries(styleCount)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .map(([style]) => style);

  // Note moyenne simulée
  const averageRating = Math.random() * 2 + 3; // 3-5 étoiles

  return {
    totalGenerations,
    successfulGenerations,
    popularStyles,
    averageRating: Math.round(averageRating * 10) / 10
  };
}

function analyzeErrorMetrics(data: any[]) {
  const totalErrors = data.length;
  const criticalErrors = data.filter(d => d.severity === 'critical').length;
  const resolvedErrors = data.filter(d => d.resolved).length;
  const unresolvedErrors = totalErrors - resolvedErrors;
  
  return {
    totalErrors,
    criticalErrors,
    resolvedErrors,
    unresolvedErrors,
    resolutionRate: totalErrors > 0 ? Math.round((resolvedErrors / totalErrors) * 100) : 0
  };
}

function analyzePerformanceMetrics(data: any[]) {
  // Extraire métriques de performance des logs d'activité
  const performanceData = data
    .map(d => d.activity_details?.performance)
    .filter(p => p);

  const avgLoadTime = performanceData.length > 0 
    ? performanceData.reduce((sum, p) => sum + (p.loadTime || 0), 0) / performanceData.length
    : Math.random() * 2000 + 1000; // 1-3 secondes

  const errorRate = Math.random() * 2 + 0.5; // 0.5-2.5%
  const apiResponseTime = Math.random() * 200 + 100; // 100-300ms

  return {
    averageLoadTime: Math.round(avgLoadTime),
    errorRate: Math.round(errorRate * 100) / 100,
    apiResponseTime: Math.round(apiResponseTime)
  };
}