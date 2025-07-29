import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: tracks, error } = await supabase
      .from('generated_music_tracks')
      .select('*')
      .not('audio_url', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Analyser les performances de génération
    const currentTime = Date.now();
    const last24h = currentTime - (24 * 60 * 60 * 1000);
    const lastWeek = currentTime - (7 * 24 * 60 * 60 * 1000);

    const recentTracks = tracks?.filter(track => 
      new Date(track.created_at).getTime() > last24h
    ) || [];

    const weeklyTracks = tracks?.filter(track => 
      new Date(track.created_at).getTime() > lastWeek
    ) || [];

    // Calculer métriques de performance
    const completedTracks = recentTracks.filter(track => 
      track.generation_status === 'completed' && track.audio_url
    );

    const failedTracks = recentTracks.filter(track => 
      track.generation_status === 'failed'
    );

    const pendingTracks = recentTracks.filter(track => 
      track.generation_status === 'pending' || track.generation_status === 'processing'
    );

    // Analyser les temps de génération
    const generationTimes = completedTracks
      .map(track => {
        const created = new Date(track.created_at).getTime();
        const updated = new Date(track.updated_at).getTime();
        return Math.round((updated - created) / 1000); // en secondes
      })
      .filter(time => time > 0 && time < 600); // Entre 0 et 10 minutes

    const avgGenerationTime = generationTimes.length > 0 
      ? Math.round(generationTimes.reduce((a, b) => a + b, 0) / generationTimes.length)
      : 0;

    const slowGenerations = generationTimes.filter(time => time > 120).length; // > 2 minutes
    const failureRate = recentTracks.length > 0 
      ? Math.round((failedTracks.length / recentTracks.length) * 100)
      : 0;

    // Calculer les taux de succès
    const successRate = recentTracks.length > 0 
      ? Math.round((completedTracks.length / recentTracks.length) * 100)
      : 0;

    // Alertes automatiques
    const alerts = [];
    
    // Alerte temps de génération élevé
    if (avgGenerationTime > 90) {
      alerts.push({
        type: 'slow_generation',
        severity: avgGenerationTime > 180 ? 'critical' : 'warning',
        message: `Temps de génération moyen élevé: ${avgGenerationTime}s`,
        value: avgGenerationTime,
        threshold: 90
      });
    }

    // Alerte taux d'échec élevé
    if (failureRate > 5) {
      alerts.push({
        type: 'high_failure_rate',
        severity: failureRate > 15 ? 'critical' : 'warning',
        message: `Taux d'échec élevé: ${failureRate}%`,
        value: failureRate,
        threshold: 5
      });
    }

    // Alerte générations lentes
    if (slowGenerations > 0 && recentTracks.length > 0) {
      const slowPercentage = Math.round((slowGenerations / recentTracks.length) * 100);
      if (slowPercentage > 10) {
        alerts.push({
          type: 'slow_generations',
          severity: slowPercentage > 25 ? 'critical' : 'warning',
          message: `${slowPercentage}% des générations dépassent 2 minutes`,
          value: slowPercentage,
          threshold: 10
        });
      }
    }

    // Alerte générations en attente
    if (pendingTracks.length > 5) {
      alerts.push({
        type: 'pending_overflow',
        severity: pendingTracks.length > 10 ? 'critical' : 'warning',
        message: `${pendingTracks.length} générations en attente`,
        value: pendingTracks.length,
        threshold: 5
      });
    }

    // Analyser les styles musicaux les plus utilisés
    const styleStats = weeklyTracks.reduce((acc: Record<string, number>, track) => {
      const style = track.metadata?.tags || 'unknown';
      acc[style] = (acc[style] || 0) + 1;
      return acc;
    }, {});

    const topStyles = Object.entries(styleStats)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([style, count]) => ({ style, count }));

    // Statistiques détaillées
    const stats = {
      overview: {
        totalTracks: tracks?.length || 0,
        recent24h: recentTracks.length,
        weeklyTracks: weeklyTracks.length,
        successRate,
        failureRate,
        avgGenerationTime
      },
      performance: {
        completed: completedTracks.length,
        failed: failedTracks.length,
        pending: pendingTracks.length,
        slowGenerations,
        generationTimes: {
          min: Math.min(...generationTimes) || 0,
          max: Math.max(...generationTimes) || 0,
          avg: avgGenerationTime,
          p95: generationTimes.length > 0 
            ? generationTimes.sort((a, b) => a - b)[Math.floor(generationTimes.length * 0.95)] 
            : 0
        }
      },
      styles: {
        topStyles,
        totalStyles: Object.keys(styleStats).length
      },
      alerts,
      health: {
        status: alerts.some(a => a.severity === 'critical') ? 'critical' : 
                alerts.some(a => a.severity === 'warning') ? 'warning' : 'healthy',
        timestamp: new Date().toISOString()
      }
    };

    // Sauvegarder les alertes critiques en base
    if (alerts.filter(a => a.severity === 'critical').length > 0) {
      try {
        const criticalAlerts = alerts
          .filter(a => a.severity === 'critical')
          .map(alert => ({
            alert_type: 'music_generation_performance',
            severity: 'critical',
            item_code: 'SYSTEM',
            message: alert.message,
            metadata: {
              alert_data: alert,
              timestamp: new Date().toISOString()
            },
            resolved: false
          }));

        await supabase
          .from('completeness_alerts')
          .insert(criticalAlerts);

        console.log(`🚨 ${criticalAlerts.length} alertes critiques sauvegardées`);
      } catch (alertError) {
        console.error('❌ Erreur sauvegarde alertes:', alertError);
      }
    }

    console.log(`📊 Music monitoring: ${stats.overview.recent24h} générations 24h, ${stats.overview.successRate}% succès, ${avgGenerationTime}s moyen`);

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('❌ Erreur monitoring musique:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});