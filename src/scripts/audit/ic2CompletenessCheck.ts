
import { supabase } from '@/integrations/supabase/client';
import { EXPECTED_IC2_RANG_A, EXPECTED_IC2_RANG_B } from './constants/ic2Constants';
import { analyzeContentForConcepts } from './analyzers/ic2ContentAnalyzer';
import { generateRecommendations, calculateCompleteness } from './generators/ic2ReportGenerator';
import { IC2Report } from './types/ic2Types';

const log = (...args: any[]) => { if (import.meta.env.DEV) console.log(...args); };

export async function checkIC2Completeness(): Promise<IC2Report> {
  log('🔍 Vérification de la complétude IC-2...');
  
  try {
    const { data: item, error } = await supabase
      .from('edn_items_immersive')
      .select('*')
      .eq('item_code', 'IC-2')
      .maybeSingle();

    if (error || !item) {
      log('❌ Item IC-2 non trouvé');
      return {
        exists: false,
        rangA: {
          expected: EXPECTED_IC2_RANG_A.length,
          found: 0,
          concepts: [],
          missingConcepts: EXPECTED_IC2_RANG_A
        },
        rangB: {
          expected: EXPECTED_IC2_RANG_B.length,
          found: 0,
          concepts: [],
          missingConcepts: EXPECTED_IC2_RANG_B
        },
        completeness: 0,
        recommendations: ['Item IC-2 introuvable - Création nécessaire']
      };
    }

    log(`✅ Item IC-2 trouvé: ${item.item_code} - ${item.title}`);

    const rangAAnalysis = analyzeContentForConcepts(item, EXPECTED_IC2_RANG_A);
    const rangBAnalysis = analyzeContentForConcepts(item, EXPECTED_IC2_RANG_B);

    const totalExpected = EXPECTED_IC2_RANG_A.length + EXPECTED_IC2_RANG_B.length;
    const completeness = calculateCompleteness(
      rangAAnalysis.found.length,
      rangBAnalysis.found.length,
      totalExpected
    );

    const report: IC2Report = {
      exists: true,
      itemCode: item.item_code,
      title: item.title,
      slug: item.slug,
      rangA: {
        expected: EXPECTED_IC2_RANG_A.length,
        found: rangAAnalysis.found.length,
        concepts: rangAAnalysis.found,
        missingConcepts: rangAAnalysis.missing
      },
      rangB: {
        expected: EXPECTED_IC2_RANG_B.length,
        found: rangBAnalysis.found.length,
        concepts: rangBAnalysis.found,
        missingConcepts: rangBAnalysis.missing
      },
      completeness,
      recommendations: []
    };

    report.recommendations = generateRecommendations(report);

    return report;

  } catch (error) {
    console.error('❌ Erreur lors de la vérification IC-2:', error);
    throw error;
  }
}
