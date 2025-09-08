import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsRequest {
  timeframe?: 'week' | 'month' | 'year';
  specialty?: string;
  itemCode?: string;
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

    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { timeframe = 'month', specialty, itemCode }: AnalyticsRequest = 
      req.method === 'POST' ? await req.json() : {};

    // Get user's medical statistics
    const { data: userStats, error: statsError } = await supabase.rpc('get_medical_dashboard_stats', {
      p_user_id: user.id,
      p_timeframe: timeframe
    });

    if (statsError) {
      throw new Error(`Stats error: ${statsError.message}`);
    }

    // Get music generation history
    const { data: musicHistory, error: musicError } = await supabase
      .from('med_mng_music_generations')
      .select(`
        id,
        item_code,
        title,
        rang,
        style,
        status,
        created_at,
        completed_at,
        audio_url
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (musicError) {
      throw new Error(`Music history error: ${musicError.message}`);
    }

    // Get learning progress by specialty
    const specialtyStats = musicHistory?.reduce((acc: any, generation: any) => {
      const itemNum = generation.item_code ? 
        parseInt(generation.item_code.replace('IC-', '')) : 0;
      
      let specialty = 'Général';
      if (itemNum >= 1 && itemNum <= 10) specialty = 'Fondamentaux';
      else if (itemNum >= 23 && itemNum <= 42) specialty = 'Gynéco-Obstétrique';
      else if (itemNum >= 47 && itemNum <= 57) specialty = 'Pédiatrie';
      else if (itemNum >= 60 && itemNum <= 80) specialty = 'Psychiatrie';
      else if (itemNum >= 91 && itemNum <= 110) specialty = 'Neurologie';
      else if (itemNum >= 221 && itemNum <= 239) specialty = 'Cardiologie';
      else if (itemNum >= 290 && itemNum <= 320) specialty = 'Cancérologie';
      else if (itemNum >= 331 && itemNum <= 367) specialty = 'Médecine d\'urgence';

      if (!acc[specialty]) {
        acc[specialty] = { 
          total: 0, 
          completed: 0, 
          rang_a: 0, 
          rang_b: 0,
          recent_activity: []
        };
      }
      
      acc[specialty].total++;
      if (generation.status === 'completed') acc[specialty].completed++;
      if (generation.rang === 'A') acc[specialty].rang_a++;
      if (generation.rang === 'B') acc[specialty].rang_b++;
      
      acc[specialty].recent_activity.push({
        item_code: generation.item_code,
        title: generation.title,
        created_at: generation.created_at,
        status: generation.status
      });

      return acc;
    }, {});

    // Calculate performance metrics
    const totalGenerations = musicHistory?.length || 0;
    const completedGenerations = musicHistory?.filter(g => g.status === 'completed').length || 0;
    const successRate = totalGenerations > 0 ? (completedGenerations / totalGenerations) * 100 : 0;

    // Learning streak calculation
    const today = new Date();
    const recentDays = Array.from({length: 30}, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });

    const activeDays = recentDays.filter(day => 
      musicHistory?.some(g => g.created_at?.startsWith(day))
    );

    const currentStreak = calculateStreak(musicHistory || []);

    // Recommendations based on activity
    const recommendations = generateRecommendations(musicHistory || [], specialtyStats);

    const analytics = {
      user_id: user.id,
      timeframe,
      summary: {
        total_generations: totalGenerations,
        completed_generations: completedGenerations,
        success_rate: Math.round(successRate),
        current_streak: currentStreak,
        active_days_count: activeDays.length,
        favorite_specialty: Object.keys(specialtyStats || {})
          .sort((a, b) => (specialtyStats[b]?.total || 0) - (specialtyStats[a]?.total || 0))[0] || 'N/A'
      },
      specialty_breakdown: specialtyStats || {},
      recent_activity: musicHistory?.slice(0, 10) || [],
      performance_trends: {
        daily_activity: recentDays.slice(0, 7).map(day => ({
          date: day,
          generations: musicHistory?.filter(g => g.created_at?.startsWith(day)).length || 0
        })),
        success_rate_trend: calculateSuccessTrend(musicHistory || [])
      },
      recommendations,
      learning_insights: {
        most_challenging_items: getMostChallenging(musicHistory || []),
        preferred_styles: getPreferredStyles(musicHistory || []),
        optimal_study_times: getOptimalStudyTimes(musicHistory || [])
      }
    };

    console.log(`Analytics generated for user ${user.id} with ${totalGenerations} generations`);

    return new Response(JSON.stringify({
      success: true,
      analytics,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in med-analytics-dashboard:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erreur lors de la génération des analytics'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function calculateStreak(musicHistory: any[]): number {
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    const hasActivity = musicHistory.some(g => g.created_at?.startsWith(dateStr));
    
    if (hasActivity) {
      streak++;
    } else if (i > 0) { // Don't break on first day (today might not have activity yet)
      break;
    }
  }
  
  return streak;
}

function generateRecommendations(musicHistory: any[], specialtyStats: any): string[] {
  const recommendations = [];
  
  // Based on activity patterns
  if (musicHistory.length === 0) {
    recommendations.push("Commencez par générer votre première musique médicale !");
  } else if (musicHistory.length < 5) {
    recommendations.push("Explorez différentes spécialités pour enrichir votre apprentissage");
  }
  
  // Based on specialty distribution
  const specialties = Object.keys(specialtyStats || {});
  if (specialties.length === 1) {
    recommendations.push("Diversifiez vos révisions en explorant d'autres spécialités médicales");
  }
  
  // Based on success rate
  const completionRate = musicHistory.filter(g => g.status === 'completed').length / Math.max(musicHistory.length, 1);
  if (completionRate < 0.8) {
    recommendations.push("Vérifiez vos paramètres de génération pour améliorer le taux de succès");
  }
  
  // Recent activity
  const recentActivity = musicHistory.filter(g => {
    const daysSince = (Date.now() - new Date(g.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  });
  
  if (recentActivity.length === 0) {
    recommendations.push("Il est temps de reprendre vos révisions musicales !");
  } else if (recentActivity.length > 10) {
    recommendations.push("Excellent rythme ! Pensez à réviser vos créations précédentes");
  }
  
  return recommendations.slice(0, 3);
}

function getMostChallenging(musicHistory: any[]): string[] {
  const failures = musicHistory
    .filter(g => g.status === 'failed')
    .map(g => g.item_code)
    .filter(Boolean);
  
  const counts = failures.reduce((acc: any, code) => {
    acc[code] = (acc[code] || 0) + 1;
    return acc;
  }, {});
  
  return Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .slice(0, 3);
}

function getPreferredStyles(musicHistory: any[]): string[] {
  const styles = musicHistory
    .map(g => g.style)
    .filter(Boolean);
  
  const counts = styles.reduce((acc: any, style) => {
    acc[style] = (acc[style] || 0) + 1;
    return acc;
  }, {});
  
  return Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .slice(0, 3);
}

function getOptimalStudyTimes(musicHistory: any[]): string[] {
  const hours = musicHistory
    .map(g => new Date(g.created_at).getHours())
    .filter(h => !isNaN(h));
  
  const counts = hours.reduce((acc: any, hour) => {
    const period = hour < 6 ? 'Nuit' :
                  hour < 12 ? 'Matin' :
                  hour < 18 ? 'Après-midi' : 'Soir';
    acc[period] = (acc[period] || 0) + 1;
    return acc;
  }, {});
  
  return Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a]);
}

function calculateSuccessTrend(musicHistory: any[]): any[] {
  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();
  
  return last7Days.map(day => {
    const dayGenerations = musicHistory.filter(g => g.created_at?.startsWith(day));
    const total = dayGenerations.length;
    const completed = dayGenerations.filter(g => g.status === 'completed').length;
    
    return {
      date: day,
      success_rate: total > 0 ? (completed / total) * 100 : 0,
      total_generations: total
    };
  });
}