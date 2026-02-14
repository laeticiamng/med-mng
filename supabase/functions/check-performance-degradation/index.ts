import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const ALLOWED_ORIGINS = [
  Deno.env.get('ALLOWED_ORIGIN') || 'https://med-mng.com',
  'https://staging.med-mng.com',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

interface PeriodScore {
  category: string;
  score: number;
  count: number;
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Starting performance degradation check...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Définir les périodes à comparer
    const now = new Date();
    const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentPeriodStart = new Date(currentPeriodEnd);
    currentPeriodStart.setDate(currentPeriodEnd.getDate() - 7); // 7 derniers jours

    const previousPeriodEnd = new Date(currentPeriodStart);
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1); // Fin de la période précédente
    const previousPeriodStart = new Date(previousPeriodEnd);
    previousPeriodStart.setDate(previousPeriodEnd.getDate() - 7); // 7 jours avant

    console.log('📅 Périodes de comparaison:');
    console.log(`  Période précédente: ${previousPeriodStart.toISOString()} - ${previousPeriodEnd.toISOString()}`);
    console.log(`  Période actuelle: ${currentPeriodStart.toISOString()} - ${currentPeriodEnd.toISOString()}`);

    // Récupérer tous les utilisateurs ayant des recommandations appliquées
    const { data: users, error: usersError } = await supabase
      .from('applied_recommendations')
      .select('user_id')
      .eq('impact_calculated', true);

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      throw usersError;
    }

    const uniqueUserIds = [...new Set(users?.map(u => u.user_id) || [])];
    console.log(`👥 Nombre d'utilisateurs à vérifier: ${uniqueUserIds.length}`);

    let totalAlertsCreated = 0;

    // Pour chaque utilisateur
    for (const userId of uniqueUserIds) {
      console.log(`\n🔍 Vérification pour l'utilisateur: ${userId}`);

      // Récupérer les recommandations de la période précédente
      const { data: prevRecs, error: prevError } = await supabase
        .from('applied_recommendations')
        .select('category, impact_score')
        .eq('user_id', userId)
        .eq('impact_calculated', true)
        .gte('applied_at', previousPeriodStart.toISOString())
        .lte('applied_at', previousPeriodEnd.toISOString());

      if (prevError) {
        console.error('❌ Erreur période précédente:', prevError);
        continue;
      }

      // Récupérer les recommandations de la période actuelle
      const { data: currRecs, error: currError } = await supabase
        .from('applied_recommendations')
        .select('category, impact_score')
        .eq('user_id', userId)
        .eq('impact_calculated', true)
        .gte('applied_at', currentPeriodStart.toISOString())
        .lte('applied_at', currentPeriodEnd.toISOString());

      if (currError) {
        console.error('❌ Erreur période actuelle:', currError);
        continue;
      }

      console.log(`  📊 Recommandations - Période précédente: ${prevRecs?.length || 0}, Période actuelle: ${currRecs?.length || 0}`);

      // Calculer les scores par catégorie pour chaque période
      const prevScores = calculateScoresByCategory(prevRecs || []);
      const currScores = calculateScoresByCategory(currRecs || []);

      // Comparer les scores et détecter les dégradations
      const categories = ['timing', 'platform', 'volume', 'quality'];
      
      for (const category of categories) {
        const prevScore = prevScores.find(s => s.category === category);
        const currScore = currScores.find(s => s.category === category);

        // On a besoin d'au moins un score dans chaque période pour comparer
        if (!prevScore || !currScore || prevScore.count === 0 || currScore.count === 0) {
          continue;
        }

        // Calculer la dégradation en pourcentage
        const degradationPercentage = ((currScore.score - prevScore.score) / prevScore.score) * 100;

        console.log(`  📈 ${category}: ${prevScore.score} → ${currScore.score} (${degradationPercentage.toFixed(1)}%)`);

        // Si la dégradation est supérieure à 10% (négatif car c'est une baisse)
        if (degradationPercentage < -10) {
          const severity = degradationPercentage < -20 ? 'critical' : 'warning';
          
          console.log(`  🚨 Dégradation détectée pour ${category}: ${Math.abs(degradationPercentage).toFixed(1)}% (${severity})`);

          // Vérifier si une alerte similaire n'existe pas déjà (dernières 24h)
          const oneDayAgo = new Date();
          oneDayAgo.setDate(oneDayAgo.getDate() - 1);

          const { data: existingAlert } = await supabase
            .from('performance_degradation_alerts')
            .select('id')
            .eq('user_id', userId)
            .eq('category', category)
            .eq('dismissed', false)
            .gte('created_at', oneDayAgo.toISOString())
            .single();

          if (existingAlert) {
            console.log(`  ℹ️ Alerte déjà existante pour ${category}, ignorée`);
            continue;
          }

          // Créer une nouvelle alerte
          const { error: insertError } = await supabase
            .from('performance_degradation_alerts')
            .insert({
              user_id: userId,
              category,
              previous_period_start: previousPeriodStart.toISOString(),
              previous_period_end: previousPeriodEnd.toISOString(),
              current_period_start: currentPeriodStart.toISOString(),
              current_period_end: currentPeriodEnd.toISOString(),
              previous_score: Math.round(prevScore.score),
              current_score: Math.round(currScore.score),
              degradation_percentage: Math.abs(degradationPercentage),
              severity,
            });

          if (insertError) {
            console.error('❌ Erreur lors de la création de l\'alerte:', insertError);
          } else {
            totalAlertsCreated++;
            console.log(`  ✅ Alerte créée pour ${category}`);
          }
        }
      }
    }

    console.log(`\n✅ Vérification terminée. ${totalAlertsCreated} alertes créées.`);

    return new Response(
      JSON.stringify({
        success: true,
        usersChecked: uniqueUserIds.length,
        alertsCreated: totalAlertsCreated,
        periods: {
          previous: {
            start: previousPeriodStart.toISOString(),
            end: previousPeriodEnd.toISOString(),
          },
          current: {
            start: currentPeriodStart.toISOString(),
            end: currentPeriodEnd.toISOString(),
          },
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function calculateScoresByCategory(recommendations: any[]): PeriodScore[] {
  const scoresByCategory: Record<string, { total: number; count: number }> = {};

  recommendations.forEach((rec) => {
    if (!scoresByCategory[rec.category]) {
      scoresByCategory[rec.category] = { total: 0, count: 0 };
    }
    scoresByCategory[rec.category].total += rec.impact_score || 0;
    scoresByCategory[rec.category].count += 1;
  });

  return Object.entries(scoresByCategory).map(([category, data]) => ({
    category,
    score: data.count > 0 ? data.total / data.count : 0,
    count: data.count,
  }));
}
