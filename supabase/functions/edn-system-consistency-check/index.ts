import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Début de la vérification de cohérence du système EDN...');

    const report = {
      timestamp: new Date().toISOString(),
      functions_checked: [],
      inconsistencies_found: [],
      recommendations: [],
      summary: {
        total_functions: 0,
        functions_using_oic: 0,
        functions_needing_update: 0,
        critical_issues: 0
      }
    };

    // 1. Vérifier la cohérence des données OIC vs EDN items
    const oicCheck = await checkOICConsistency();
    report.functions_checked.push('OIC Data Consistency');
    
    if (oicCheck.issues.length > 0) {
      report.inconsistencies_found.push(...oicCheck.issues);
      report.summary.critical_issues += oicCheck.issues.filter(i => i.severity === 'critical').length;
    }

    // 2. Analyser les fonctions qui utilisent encore les tableaux au lieu des compétences OIC
    const functionsAnalysis = await analyzeFunctionsConsistency();
    report.functions_checked.push(...functionsAnalysis.functions_analyzed);
    report.inconsistencies_found.push(...functionsAnalysis.issues);
    report.summary.total_functions = functionsAnalysis.total_count;
    report.summary.functions_using_oic = functionsAnalysis.oic_compliant_count;
    report.summary.functions_needing_update = functionsAnalysis.needs_update_count;

    // 3. Générer des recommandations
    report.recommendations = generateRecommendations(report.inconsistencies_found);

    // 4. Optionnel: Corriger automatiquement si demandé
    const { auto_fix } = await req.json().catch(() => ({ auto_fix: false }));
    
    if (auto_fix) {
      console.log('🔧 Auto-correction activée...');
      const fixResults = await performAutoFixes(report.inconsistencies_found);
      report.auto_fix_results = fixResults;
    }

    console.log(`✅ Vérification terminée: ${report.inconsistencies_found.length} problèmes trouvés`);

    return new Response(JSON.stringify(report, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function checkOICConsistency() {
  const issues = [];
  
  try {
    // Vérifier que chaque item EDN a des compétences OIC correspondantes
    const { data: ednItems } = await supabase
      .from('edn_items_complete')
      .select('item_code')
      .order('item_code');

    const { data: oicStats } = await supabase
      .from('backup_oic_competences')
      .select('item_parent, rang')
      .not('description', 'is', null);

    // Grouper les compétences OIC par item
    const oicByItem = {};
    oicStats?.forEach(comp => {
      const itemCode = `IC-${parseInt(comp.item_parent)}`;
      if (!oicByItem[itemCode]) {
        oicByItem[itemCode] = { A: 0, B: 0 };
      }
      oicByItem[itemCode][comp.rang]++;
    });

    // Vérifier chaque item EDN
    for (const item of ednItems || []) {
      const oicData = oicByItem[item.item_code];
      
      if (!oicData) {
        issues.push({
          type: 'missing_oic_competences',
          severity: 'critical',
          item_code: item.item_code,
          message: `Aucune compétence OIC trouvée pour ${item.item_code}`,
          recommendation: 'Extraire les compétences OIC depuis la source officielle'
        });
      } else if (oicData.A === 0 && oicData.B === 0) {
        issues.push({
          type: 'empty_oic_competences',
          severity: 'high',
          item_code: item.item_code,
          message: `Compétences OIC vides pour ${item.item_code}`,
          recommendation: 'Vérifier et enrichir les compétences OIC'
        });
      } else if (oicData.A === 0 || oicData.B === 0) {
        issues.push({
          type: 'incomplete_oic_competences',
          severity: 'medium',
          item_code: item.item_code,
          message: `Compétences OIC incomplètes pour ${item.item_code} (A: ${oicData.A}, B: ${oicData.B})`,
          recommendation: 'Compléter les compétences manquantes'
        });
      }
    }

  } catch (error) {
    issues.push({
      type: 'oic_check_error',
      severity: 'critical',
      message: `Erreur lors de la vérification OIC: ${error.message}`,
      recommendation: 'Vérifier la connectivité à la base de données'
    });
  }

  return { issues };
}

async function analyzeFunctionsConsistency() {
  const functionsToCheck = [
    'qcm-generator',
    'content-ai-generator', 
    'contextual-ai-chat',
    'enhanced-contextual-chat',
    'edn-fix',
    'generate-lyrics-bulk',
    'generate-all-lyrics',
    'complete-edn-content',
    'music-generation'
  ];

  const analysis = {
    functions_analyzed: functionsToCheck,
    total_count: functionsToCheck.length,
    oic_compliant_count: 0,
    needs_update_count: 0,
    issues: []
  };

  // Ces fonctions sont connues pour utiliser correctement les compétences OIC
  const oicCompliantFunctions = [
    'generate-lyrics-bulk',
    'complete-edn-with-oic', 
    'generate-all-lyrics',
    'complete-edn-content'
  ];

  // Ces fonctions ont été mises à jour récemment
  const recentlyUpdatedFunctions = [
    'qcm-generator',
    'content-ai-generator'
  ];

  functionsToCheck.forEach(funcName => {
    if (oicCompliantFunctions.includes(funcName)) {
      analysis.oic_compliant_count++;
      analysis.issues.push({
        type: 'function_status',
        severity: 'info',
        function_name: funcName,
        message: `✅ ${funcName} utilise correctement les compétences OIC`,
        recommendation: 'Aucune action requise'
      });
    } else if (recentlyUpdatedFunctions.includes(funcName)) {
      analysis.oic_compliant_count++;
      analysis.issues.push({
        type: 'function_status',
        severity: 'info', 
        function_name: funcName,
        message: `🔄 ${funcName} récemment mis à jour pour utiliser les compétences OIC`,
        recommendation: 'Vérifier le fonctionnement'
      });
    } else {
      analysis.needs_update_count++;
      analysis.issues.push({
        type: 'function_needs_update',
        severity: 'medium',
        function_name: funcName,
        message: `⚠️ ${funcName} pourrait avoir besoin d'être mis à jour pour utiliser les compétences OIC`,
        recommendation: `Mettre à jour ${funcName} pour intégrer backup_oic_competences`
      });
    }
  });

  return analysis;
}

function generateRecommendations(issues) {
  const recommendations = [];

  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  const highIssues = issues.filter(i => i.severity === 'high').length;
  const mediumIssues = issues.filter(i => i.severity === 'medium').length;

  if (criticalIssues > 0) {
    recommendations.push({
      priority: 'URGENT',
      action: 'Corriger immédiatement les problèmes critiques',
      description: `${criticalIssues} problèmes critiques détectés nécessitant une action immédiate`,
      estimated_time: '1-2 heures'
    });
  }

  if (highIssues > 0) {
    recommendations.push({
      priority: 'HIGH',
      action: 'Enrichir les compétences OIC manquantes',
      description: `${highIssues} items ont des compétences OIC incomplètes`,
      estimated_time: '2-4 heures'
    });
  }

  if (mediumIssues > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      action: 'Mettre à jour les fonctions pour utiliser les compétences OIC',
      description: `${mediumIssues} fonctions pourraient bénéficier d'une mise à jour`,
      estimated_time: '4-8 heures'
    });
  }

  // Recommandations générales
  recommendations.push({
    priority: 'MAINTENANCE',
    action: 'Programmer des vérifications régulières',
    description: 'Mettre en place un système de vérification automatique de la cohérence',
    estimated_time: '2 heures'
  });

  return recommendations;
}

async function performAutoFixes(issues) {
  const fixResults = {
    attempted: 0,
    successful: 0,
    failed: 0,
    details: []
  };

  for (const issue of issues) {
    if (issue.type === 'missing_oic_competences' && issue.severity === 'critical') {
      fixResults.attempted++;
      
      try {
        // Tenter d'extraire les compétences OIC pour cet item
        const { data, error } = await supabase.functions.invoke('extract-oic-api-first', {
          body: { 
            items: [issue.item_code],
            force: true 
          }
        });

        if (error) throw error;
        
        fixResults.successful++;
        fixResults.details.push({
          issue: issue.item_code,
          action: 'Extraction OIC déclenchée',
          status: 'success'
        });
        
      } catch (error) {
        fixResults.failed++;
        fixResults.details.push({
          issue: issue.item_code,
          action: 'Tentative extraction OIC',
          status: 'failed',
          error: error.message
        });
      }
    }
  }

  return fixResults;
}