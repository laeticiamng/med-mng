import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

interface FieldAnalysis {
  fieldName: string;
  status: 'empty' | 'incomplete' | 'partial' | 'complete';
  currentLength?: number;
  expectedLength?: number;
  details?: string;
}

interface CompletenessResult {
  itemId: string;
  itemCode: string;
  title: string;
  completenessScore: number; // 0-100
  status: 'complete' | 'incomplete' | 'critical';
  missingFields: string[];
  partialFields: string[];
  fieldAnalysis: FieldAnalysis[];
  lastChecked: string;
}

interface CompletenessReport {
  summary: {
    totalItems: number;
    completeItems: number;
    incompleteItems: number;
    criticalItems: number;
    averageCompleteness: number;
  };
  items: CompletenessResult[];
  recommendations: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const itemId = url.searchParams.get('itemId');
    const action = url.searchParams.get('action') || 'check';

    console.log(`🔍 Vérification complétude - Action: ${action}, ItemId: ${itemId}`);

    if (itemId) {
      // Vérification d'un item spécifique
      const result = await checkSingleItemCompleteness(supabase, itemId);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Vérification de tous les items
      const report = await checkAllItemsCompleteness(supabase);
      return new Response(JSON.stringify(report), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('❌ Erreur vérification complétude:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      type: 'completeness_check_error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function checkSingleItemCompleteness(supabase: any, itemId: string): Promise<CompletenessResult> {
  console.log(`🔍 Vérification item individuel: ${itemId}`);
  
  const { data: item, error } = await supabase
    .from('edn_items_immersive')
    .select('*')
    .eq('id', itemId)
    .single();

  if (error || !item) {
    throw new Error(`Item non trouvé: ${itemId}`);
  }

  return analyzeItemCompleteness(item);
}

async function checkAllItemsCompleteness(supabase: any): Promise<CompletenessReport> {
  console.log('🔍 Vérification complétude de tous les items');
  
  const { data: items, error } = await supabase
    .from('edn_items_immersive')
    .select('*')
    .order('item_code');

  if (error) {
    throw new Error(`Erreur récupération items: ${error.message}`);
  }

  const results: CompletenessResult[] = [];
  let totalCompleteness = 0;
  let completeCount = 0;
  let incompleteCount = 0;
  let criticalCount = 0;

  for (const item of items) {
    const result = analyzeItemCompleteness(item);
    results.push(result);
    
    totalCompleteness += result.completenessScore;
    
    if (result.status === 'complete') {
      completeCount++;
    } else if (result.status === 'critical') {
      criticalCount++;
    } else {
      incompleteCount++;
    }
  }

  const averageCompleteness = items.length > 0 ? totalCompleteness / items.length : 0;

  // Générer des recommandations
  const recommendations = generateRecommendations(results);

  return {
    summary: {
      totalItems: items.length,
      completeItems: completeCount,
      incompleteItems: incompleteCount,
      criticalItems: criticalCount,
      averageCompleteness: Math.round(averageCompleteness)
    },
    items: results,
    recommendations
  };
}

function analyzeItemCompleteness(item: any): CompletenessResult {
  const requiredFields = [
    'title',
    'subtitle', 
    'item_code',
    'slug',
    'tableau_rang_a',
    'tableau_rang_b',
    'quiz_questions',
    'scene_immersive',
    'pitch_intro',
    'paroles_musicales'
  ];

  const fieldAnalysis: FieldAnalysis[] = [];
  const missingFields: string[] = [];
  const partialFields: string[] = [];
  let completedFields = 0;

  for (const field of requiredFields) {
    const analysis = analyzeField(field, item[field]);
    fieldAnalysis.push(analysis);

    switch (analysis.status) {
      case 'complete':
        completedFields++;
        break;
      case 'empty':
        missingFields.push(field);
        break;
      case 'incomplete':
      case 'partial':
        partialFields.push(field);
        break;
    }
  }

  const completenessScore = Math.round((completedFields / requiredFields.length) * 100);
  
  let status: 'complete' | 'incomplete' | 'critical';
  if (completenessScore >= 90) {
    status = 'complete';
  } else if (completenessScore < 50) {
    status = 'critical';
  } else {
    status = 'incomplete';
  }

  return {
    itemId: item.id,
    itemCode: item.item_code || 'N/A',
    title: item.title || 'Titre manquant',
    completenessScore,
    status,
    missingFields,
    partialFields,
    fieldAnalysis,
    lastChecked: new Date().toISOString()
  };
}

function analyzeField(fieldName: string, value: any): FieldAnalysis {
  const analysis: FieldAnalysis = {
    fieldName,
    status: 'empty'
  };

  if (value === null || value === undefined) {
    analysis.status = 'empty';
    analysis.details = 'Champ vide';
    return analysis;
  }

  switch (fieldName) {
    case 'title':
    case 'subtitle':
    case 'item_code':
    case 'slug':
    case 'pitch_intro':
      if (typeof value === 'string') {
        analysis.currentLength = value.length;
        if (value.length === 0) {
          analysis.status = 'empty';
        } else if (value.length < 10) {
          analysis.status = 'incomplete';
          analysis.expectedLength = 10;
          analysis.details = 'Trop court';
        } else {
          analysis.status = 'complete';
        }
      } else {
        analysis.status = 'empty';
        analysis.details = 'Type incorrect';
      }
      break;

    case 'paroles_musicales':
      if (Array.isArray(value)) {
        analysis.currentLength = value.length;
        if (value.length === 0) {
          analysis.status = 'empty';
        } else if (value.length < 2) {
          analysis.status = 'partial';
          analysis.expectedLength = 2;
          analysis.details = 'Insuffisant de paroles';
        } else {
          analysis.status = 'complete';
        }
      } else {
        analysis.status = 'empty';
        analysis.details = 'Doit être un tableau';
      }
      break;

    case 'tableau_rang_a':
    case 'tableau_rang_b':
    case 'quiz_questions':
    case 'scene_immersive':
      if (typeof value === 'object' && value !== null) {
        const jsonString = JSON.stringify(value);
        analysis.currentLength = jsonString.length;
        
        if (jsonString === '{}' || jsonString === '[]') {
          analysis.status = 'empty';
        } else if (jsonString.length < 50) {
          analysis.status = 'incomplete';
          analysis.expectedLength = 50;
          analysis.details = 'Contenu insuffisant';
        } else {
          // Vérifications spécifiques par type
          if (fieldName.includes('tableau_rang')) {
            const hasTitle = value.title && value.title.length > 0;
            const hasSections = value.sections && Array.isArray(value.sections) && value.sections.length > 0;
            
            if (hasTitle && hasSections) {
              analysis.status = 'complete';
            } else {
              analysis.status = 'partial';
              analysis.details = 'Structure incomplète';
            }
          } else if (fieldName === 'quiz_questions') {
            const isArray = Array.isArray(value);
            const hasQuestions = isArray && value.length > 0;
            
            if (hasQuestions) {
              analysis.status = 'complete';
            } else {
              analysis.status = 'partial';
              analysis.details = 'Pas de questions';
            }
          } else {
            analysis.status = 'complete';
          }
        }
      } else {
        analysis.status = 'empty';
        analysis.details = 'Doit être un objet JSON';
      }
      break;

    default:
      analysis.status = 'complete';
  }

  return analysis;
}

function generateRecommendations(results: CompletenessResult[]): string[] {
  const recommendations: string[] = [];
  
  const criticalItems = results.filter(r => r.status === 'critical');
  const incompleteItems = results.filter(r => r.status === 'incomplete');
  
  if (criticalItems.length > 0) {
    recommendations.push(`🚨 URGENT: ${criticalItems.length} items critiques nécessitent une attention immédiate`);
    recommendations.push(`Items critiques: ${criticalItems.map(i => i.itemCode).join(', ')}`);
  }
  
  if (incompleteItems.length > 0) {
    recommendations.push(`⚠️ ${incompleteItems.length} items incomplets à compléter`);
  }
  
  // Analyser les champs les plus souvent manquants
  const fieldCounts: Record<string, number> = {};
  results.forEach(result => {
    result.missingFields.forEach(field => {
      fieldCounts[field] = (fieldCounts[field] || 0) + 1;
    });
    result.partialFields.forEach(field => {
      fieldCounts[field] = (fieldCounts[field] || 0) + 1;
    });
  });
  
  const commonMissingFields = Object.entries(fieldCounts)
    .filter(([_, count]) => count > results.length * 0.1) // Plus de 10% des items
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 3);
  
  if (commonMissingFields.length > 0) {
    recommendations.push(`🔧 Champs fréquemment manquants: ${commonMissingFields.map(([field]) => field).join(', ')}`);
  }
  
  const averageScore = results.reduce((sum, r) => sum + r.completenessScore, 0) / results.length;
  if (averageScore < 80) {
    recommendations.push('📈 Recommandation: Lancer une campagne de complétion automatique des contenus');
  }
  
  return recommendations;
}