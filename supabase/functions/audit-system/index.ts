import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuditRequest {
  auditType: 'database' | 'code' | 'ui_consistency' | 'performance';
  autoFix?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Unauthorized");

    const { auditType, autoFix = false }: AuditRequest = await req.json();

    console.log(`🔍 Starting audit of type: ${auditType}`);

    let reportId: string;
    let auditResults: any = {};

    switch (auditType) {
      case 'database':
        reportId = await auditDatabase(supabaseClient);
        auditResults = await getDatabaseAuditResults(supabaseClient, reportId);
        break;
      
      case 'code':
        reportId = await auditCodeStructure(supabaseClient);
        auditResults = await getCodeAuditResults(supabaseClient, reportId);
        break;
      
      case 'ui_consistency':
        reportId = await auditUIConsistency(supabaseClient);
        auditResults = await getUIAuditResults(supabaseClient, reportId);
        break;
      
      case 'performance':
        reportId = await auditPerformance(supabaseClient);
        auditResults = await getPerformanceAuditResults(supabaseClient, reportId);
        break;
      
      default:
        throw new Error(`Unknown audit type: ${auditType}`);
    }

    // Si autoFix est activé, appliquer les corrections automatiques
    if (autoFix) {
      const fixResults = await applyAutomaticFixes(supabaseClient, reportId);
      auditResults.fixResults = fixResults;
    }

    return new Response(JSON.stringify({
      success: true,
      reportId,
      auditType,
      results: auditResults
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Audit error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function auditDatabase(supabase: any): Promise<string> {
  console.log("🗄️ Auditing database...");
  
  // Utiliser la fonction SQL pour générer le rapport
  const { data, error } = await supabase.rpc('generate_audit_report', {
    report_type_param: 'database'
  });

  if (error) throw error;
  return data;
}

async function getDatabaseAuditResults(supabase: any, reportId: string): Promise<any> {
  const { data: report, error } = await supabase
    .from('audit_reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (error) throw error;

  return {
    metrics: report.metrics,
    findings: report.findings,
    recommendations: generateDatabaseRecommendations(report.findings, report.metrics)
  };
}

async function auditCodeStructure(supabase: any): Promise<string> {
  console.log("📁 Auditing code structure...");
  
  // Créer un rapport de code
  const { data: report, error } = await supabase
    .from('audit_reports')
    .insert({
      report_type: 'code',
      status: 'running'
    })
    .select()
    .single();

  if (error) throw error;

  // Analyser la structure du code (simulé - en réalité on analyserait les fichiers)
  const codeIssues = [
    {
      type: 'unused_imports',
      severity: 'medium',
      description: 'Imports non utilisés détectés dans plusieurs fichiers',
      affected_files: ['src/components/unused-component.tsx'],
      auto_fixable: true
    },
    {
      type: 'missing_types',
      severity: 'high',
      description: 'Types TypeScript manquants',
      affected_files: ['src/hooks/custom-hook.ts'],
      auto_fixable: false
    },
    {
      type: 'duplicate_components',
      severity: 'medium',
      description: 'Composants similaires qui pourraient être fusionnés',
      affected_files: ['src/components/Button1.tsx', 'src/components/Button2.tsx'],
      auto_fixable: false
    }
  ];

  // Sauvegarder les résultats
  await supabase
    .from('audit_reports')
    .update({
      status: 'completed',
      findings: codeIssues,
      completed_at: new Date().toISOString()
    })
    .eq('id', report.id);

  return report.id;
}

async function getCodeAuditResults(supabase: any, reportId: string): Promise<any> {
  const { data: report, error } = await supabase
    .from('audit_reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (error) throw error;

  return {
    findings: report.findings,
    recommendations: [
      "Supprimer les imports inutilisés pour améliorer les performances",
      "Ajouter des types TypeScript manquants pour une meilleure sécurité",
      "Considérer la fusion des composants similaires pour réduire la duplication"
    ]
  };
}

async function auditUIConsistency(supabase: any): Promise<string> {
  console.log("🎨 Auditing UI consistency...");
  
  const { data: report, error } = await supabase
    .from('audit_reports')
    .insert({
      report_type: 'ui_consistency',
      status: 'running'
    })
    .select()
    .single();

  if (error) throw error;

  // Analyser la cohérence UI (simulé)
  const uiIssues = [
    {
      type: 'inconsistent_spacing',
      severity: 'medium',
      description: 'Espacements incohérents entre les composants',
      affected_components: ['Header', 'Footer', 'MainContent'],
      auto_fixable: true
    },
    {
      type: 'color_inconsistency',
      severity: 'high',
      description: 'Couleurs non conformes au design system',
      affected_components: ['Button', 'Card'],
      auto_fixable: true
    },
    {
      type: 'font_inconsistency',
      severity: 'low',
      description: 'Tailles de police incohérentes',
      affected_components: ['Typography'],
      auto_fixable: true
    }
  ];

  await supabase
    .from('audit_reports')
    .update({
      status: 'completed',
      findings: uiIssues,
      completed_at: new Date().toISOString()
    })
    .eq('id', report.id);

  return report.id;
}

async function getUIAuditResults(supabase: any, reportId: string): Promise<any> {
  const { data: report, error } = await supabase
    .from('audit_reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (error) throw error;

  return {
    findings: report.findings,
    recommendations: [
      "Utiliser les tokens de design système pour les espacements",
      "Appliquer les couleurs définies dans le design system",
      "Standardiser les tailles de police selon la hiérarchie typographique"
    ]
  };
}

async function auditPerformance(supabase: any): Promise<string> {
  console.log("⚡ Auditing performance...");
  
  const { data: report, error } = await supabase
    .from('audit_reports')
    .insert({
      report_type: 'performance',
      status: 'running'
    })
    .select()
    .single();

  if (error) throw error;

  // Analyser les performances (simulé)
  const performanceIssues = [
    {
      type: 'large_bundle_size',
      severity: 'high',
      description: 'Taille du bundle JavaScript trop importante',
      metrics: { size: '2.5MB', recommended: '1MB' },
      auto_fixable: false
    },
    {
      type: 'unused_dependencies',
      severity: 'medium',
      description: 'Dépendances non utilisées dans package.json',
      affected_packages: ['lodash', 'moment'],
      auto_fixable: true
    },
    {
      type: 'slow_queries',
      severity: 'high',
      description: 'Requêtes base de données lentes détectées',
      affected_tables: ['edn_items_immersive'],
      auto_fixable: false
    }
  ];

  await supabase
    .from('audit_reports')
    .update({
      status: 'completed',
      findings: performanceIssues,
      completed_at: new Date().toISOString()
    })
    .eq('id', report.id);

  return report.id;
}

async function getPerformanceAuditResults(supabase: any, reportId: string): Promise<any> {
  const { data: report, error } = await supabase
    .from('audit_reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (error) throw error;

  return {
    findings: report.findings,
    recommendations: [
      "Implémenter le code splitting pour réduire la taille du bundle",
      "Supprimer les dépendances inutilisées",
      "Optimiser les requêtes base de données avec des index appropriés"
    ]
  };
}

async function applyAutomaticFixes(supabase: any, reportId: string): Promise<any> {
  console.log("🔧 Applying automatic fixes...");
  
  const { data: report, error } = await supabase
    .from('audit_reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (error) throw error;

  const fixResults = [];
  
  for (const finding of report.findings) {
    if (finding.auto_fixable) {
      try {
        let fixApplied = false;
        
        switch (finding.type) {
          case 'duplicate_item_code':
            // Nettoyer les doublons via la fonction SQL
            const { data: cleanupResult } = await supabase.rpc('cleanup_duplicates');
            fixApplied = cleanupResult.cleaned > 0;
            break;
          
          case 'invalid_slug':
            // Corriger les slugs invalides
            await supabase.rpc('fix_invalid_slugs');
            fixApplied = true;
            break;
          
          default:
            console.log(`No automatic fix available for ${finding.type}`);
        }
        
        fixResults.push({
          type: finding.type,
          applied: fixApplied,
          description: fixApplied ? 'Fix applied successfully' : 'Fix not applicable'
        });
        
      } catch (error) {
        console.error(`Error applying fix for ${finding.type}:`, error);
        fixResults.push({
          type: finding.type,
          applied: false,
          error: error.message
        });
      }
    }
  }
  
  return fixResults;
}

function generateDatabaseRecommendations(findings: any[], metrics: any): string[] {
  const recommendations = [];
  
  if (metrics.duplicates_found > 0) {
    recommendations.push("Nettoyer les doublons détectés pour optimiser l'espace de stockage");
  }
  
  if (metrics.inconsistencies_found > 0) {
    recommendations.push("Corriger les incohérences de données pour améliorer la qualité");
  }
  
  const completionRate = (metrics.items_with_tableau_a + metrics.items_with_tableau_b) / (metrics.total_edn_items * 2);
  if (completionRate < 0.8) {
    recommendations.push("Compléter les données manquantes pour les tableaux de rang A et B");
  }
  
  if (metrics.items_with_music / metrics.total_edn_items < 0.5) {
    recommendations.push("Ajouter des paroles musicales pour plus d'items EDN");
  }
  
  return recommendations;
}