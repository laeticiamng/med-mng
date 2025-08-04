import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.5');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseServiceKey) {
      throw new Error('Service role key required');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('🚀 Démarrage complétion intelligente OIC...');
    
    // Vérifier l'état actuel des compétences
    const { data: stats, error: statsError } = await supabase
      .from('backup_oic_competences')
      .select('objectif_id, description')
      .limit(1000);

    if (statsError) {
      throw new Error(`Erreur récupération stats: ${statsError.message}`);
    }

    if (!stats || stats.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Aucune compétence OIC trouvée dans la base',
        recommendation: 'Veuillez d\'abord exécuter l\'extraction OIC via GitHub Actions',
        github_workflow: '.github/workflows/extract-oic-completion.yml'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Analyser les descriptions manquantes ou courtes
    const emptyDescriptions = stats.filter(c => !c.description || c.description.trim() === '');
    const shortDescriptions = stats.filter(c => c.description && c.description.trim().length > 0 && c.description.length < 100);
    const completeDescriptions = stats.filter(c => c.description && c.description.length >= 100);

    console.log(`📊 Analyse des compétences:`);
    console.log(`  - Descriptions vides: ${emptyDescriptions.length}`);
    console.log(`  - Descriptions courtes (<100 car): ${shortDescriptions.length}`);
    console.log(`  - Descriptions complètes (≥100 car): ${completeDescriptions.length}`);

    const totalIncomplete = emptyDescriptions.length + shortDescriptions.length;
    const completionRate = Math.round((completeDescriptions.length / stats.length) * 100);

    // Si l'extraction initiale n'a pas été faite ou très peu de données
    if (stats.length < 100) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Extraction OIC incomplète - Données insuffisantes',
        current_count: stats.length,
        expected_count: '4000+',
        recommendation: 'Exécutez d\'abord l\'extraction complète via GitHub Actions',
        action_required: 'Trigger le workflow extract-oic-completion.yml'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Si déjà bien complété
    if (completionRate >= 90) {
      return new Response(JSON.stringify({
        success: true,
        message: `Compétences OIC déjà bien complétées (${completionRate}%)`,
        stats: {
          total: stats.length,
          empty: emptyDescriptions.length,
          short: shortDescriptions.length,
          complete: completeDescriptions.length,
          completion_rate: `${completionRate}%`
        },
        recommendation: totalIncomplete > 0 ? 
          'Quelques descriptions peuvent encore être améliorées via GitHub Actions' :
          'Toutes les compétences sont maintenant complètes'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Pour une complétion massive, rediriger vers GitHub Actions
    return new Response(JSON.stringify({
      success: false,
      message: 'Complétion automatique recommandée via GitHub Actions',
      current_status: {
        total_competences: stats.length,
        incomplete_count: totalIncomplete,
        completion_rate: `${completionRate}%`,
        empty_descriptions: emptyDescriptions.length,
        short_descriptions: shortDescriptions.length
      },
      recommendation: {
        action: 'Utiliser l\'extraction GitHub Actions pour complétion massive',
        workflow: 'extract-oic-completion.yml',
        benefits: [
          'Authentification CAS automatique',
          'Traitement par batches optimisé',
          'Gestion des timeouts et retry',
          'Rapports détaillés'
        ]
      },
      quick_samples: totalIncomplete > 0 ? emptyDescriptions.slice(0, 3).map(c => c.objectif_id) : []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('💥 Erreur critique:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      recommendation: 'Utiliser l\'extraction GitHub Actions pour une complétion fiable'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});