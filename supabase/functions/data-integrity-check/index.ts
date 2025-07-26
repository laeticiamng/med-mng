// ✅ DATA INTEGRITY CHECK - Automatisation check intégrité post-import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IntegrityCheckRequest {
  action: 'run_check' | 'get_status' | 'get_latest_reports';
  check_type?: 'post_import' | 'scheduled' | 'manual';
  batch_id?: string;
  tables?: string[];
}

interface CheckResult {
  table: string;
  total_records: number;
  issues: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    count: number;
    sample_records?: string[];
    description: string;
  }[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, check_type = 'manual', batch_id, tables = [] } = await req.json() as IntegrityCheckRequest;

    switch (action) {
      case 'run_check': {
        const checkId = crypto.randomUUID();
        const tablesToCheck = tables.length > 0 ? tables : [
          'edn_items_immersive',
          'ecos_situations_complete', 
          'oic_competences',
          'extraction_logs'
        ];

        // 1. Créer l'entrée de check
        const { error: createError } = await supabase
          .from('data_integrity_checks')
          .insert({
            id: checkId,
            check_type,
            batch_id: batch_id || `manual-${Date.now()}`,
            status: 'running',
            tables_checked: tablesToCheck
          });

        if (createError) throw createError;

        const results: CheckResult[] = [];
        let totalIssues = 0;
        let criticalIssues = 0;

        // 2. Vérifier chaque table
        for (const table of tablesToCheck) {
          const checkResult = await performTableCheck(supabase, table);
          results.push(checkResult);

          totalIssues += checkResult.issues.reduce((sum, issue) => sum + issue.count, 0);
          criticalIssues += checkResult.issues
            .filter(issue => issue.severity === 'critical')
            .reduce((sum, issue) => sum + issue.count, 0);
        }

        // 3. Déterminer si on doit bloquer
        const shouldBlock = criticalIssues > 0;

        // 4. Mettre à jour le statut
        const finalStatus = shouldBlock ? 'blocked' : 'completed';
        
        const { error: updateError } = await supabase
          .from('data_integrity_checks')
          .update({
            status: finalStatus,
            issues_found: totalIssues,
            critical_issues: criticalIssues,
            should_block: shouldBlock,
            results: { checks: results },
            completed_at: new Date().toISOString()
          })
          .eq('id', checkId);

        if (updateError) throw updateError;

        // 5. Alertes si critique
        if (shouldBlock) {
          console.error(`🚨 BLOCAGE INTÉGRITÉ: ${criticalIssues} problèmes critiques détectés`);
          
          // Log dans operation_logs
          await supabase.from('operation_logs').insert({
            type: 'integrity_check_blocked',
            message: `Check d'intégrité BLOQUÉ: ${criticalIssues} problèmes critiques`,
            meta: {
              check_id: checkId,
              critical_issues: criticalIssues,
              total_issues: totalIssues,
              tables_checked: tablesToCheck,
              batch_id: batch_id
            }
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            check_id: checkId,
            status: finalStatus,
            should_block: shouldBlock,
            summary: {
              total_issues: totalIssues,
              critical_issues: criticalIssues,
              tables_checked: tablesToCheck.length
            },
            results
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_status': {
        const { data, error } = await supabase
          .from('data_integrity_checks')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get_latest_reports': {
        const { data, error } = await supabase
          .from('data_integrity_checks')
          .select('*')
          .eq('status', 'completed')
          .order('completed_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Action non supportée: ${action}`);
    }

  } catch (error) {
    console.error('Erreur integrity check:', error);
    return new Response(
      JSON.stringify({
        error: 'Erreur lors du check d\'intégrité',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function performTableCheck(supabase: any, tableName: string): Promise<CheckResult> {
  const result: CheckResult = {
    table: tableName,
    total_records: 0,
    issues: []
  };

  try {
    // Compter les enregistrements totaux
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;
    result.total_records = count || 0;

    // Checks spécifiques par table
    switch (tableName) {
      case 'edn_items_immersive':
        await checkEdnItems(supabase, result);
        break;
      case 'ecos_situations_complete':
        await checkEcosSituations(supabase, result);
        break;
      case 'oic_competences':
        await checkOicCompetences(supabase, result);
        break;
      case 'extraction_logs':
        await checkExtractionLogs(supabase, result);
        break;
      default:
        await performGenericChecks(supabase, tableName, result);
    }

  } catch (error) {
    result.issues.push({
      type: 'check_failed',
      severity: 'critical',
      count: 1,
      description: `Échec du check pour ${tableName}: ${error.message}`
    });
  }

  return result;
}

async function checkEdnItems(supabase: any, result: CheckResult) {
  // 1. Items sans title
  const { data: noTitle } = await supabase
    .from('edn_items_immersive')
    .select('id')
    .or('title.is.null,title.eq.')
    .limit(10);

  if (noTitle?.length > 0) {
    result.issues.push({
      type: 'missing_title',
      severity: 'critical',
      count: noTitle.length,
      sample_records: noTitle.map((r: any) => r.id),
      description: 'Items EDN sans titre'
    });
  }

  // 2. Items sans item_code
  const { data: noCode } = await supabase
    .from('edn_items_immersive')
    .select('id')
    .or('item_code.is.null,item_code.eq.')
    .limit(10);

  if (noCode?.length > 0) {
    result.issues.push({
      type: 'missing_item_code',
      severity: 'critical',
      count: noCode.length,
      description: 'Items EDN sans code'
    });
  }

  // 3. Tableaux vides
  const { data: emptyTableaux } = await supabase
    .from('edn_items_immersive')
    .select('id, item_code')
    .or('tableau_rang_a.is.null,tableau_rang_b.is.null')
    .limit(5);

  if (emptyTableaux?.length > 0) {
    result.issues.push({
      type: 'empty_tableaux',
      severity: 'high',
      count: emptyTableaux.length,
      description: 'Items avec tableaux Rang A ou B vides'
    });
  }
}

async function checkEcosSituations(supabase: any, result: CheckResult) {
  // Situations sans contenu
  const { data: noContent } = await supabase
    .from('ecos_situations_complete')
    .select('id')
    .or('content.is.null,title.is.null')
    .limit(10);

  if (noContent?.length > 0) {
    result.issues.push({
      type: 'missing_content',
      severity: 'critical',
      count: noContent.length,
      description: 'Situations ECOS sans contenu ou titre'
    });
  }
}

async function checkOicCompetences(supabase: any, result: CheckResult) {
  // Compétences sans intitulé
  const { data: noIntitule } = await supabase
    .from('oic_competences')
    .select('objectif_id')
    .or('intitule.is.null,intitule.eq.')
    .limit(10);

  if (noIntitule?.length > 0) {
    result.issues.push({
      type: 'missing_intitule',
      severity: 'high',
      count: noIntitule.length,
      description: 'Compétences OIC sans intitulé'
    });
  }
}

async function checkExtractionLogs(supabase: any, result: CheckResult) {
  // Logs d'extraction en erreur
  const { data: failed } = await supabase
    .from('extraction_logs')
    .select('id')
    .eq('status', 'failed')
    .gte('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(5);

  if (failed?.length > 0) {
    result.issues.push({
      type: 'recent_failures',
      severity: 'medium',
      count: failed.length,
      description: 'Extractions échouées dans les 24h'
    });
  }
}

async function performGenericChecks(supabase: any, tableName: string, result: CheckResult) {
  // Check générique pour les tables inconnues
  const { data: sample } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  if (!sample || sample.length === 0) {
    result.issues.push({
      type: 'empty_table',
      severity: 'medium',
      count: 0,
      description: `Table ${tableName} vide`
    });
  }
}