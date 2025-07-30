
import { supabase } from '@/integrations/supabase/client';
import { EXPECTED_IC2_RANG_A, EXPECTED_IC2_RANG_B } from './constants/ic2Constants';
import { analyzeContentForConcepts } from './analyzers/ic2ContentAnalyzer';
import { generateRecommendations, calculateCompleteness } from './generators/ic2ReportGenerator';
import { IC2Report } from './types/ic2Types';

export async function checkIC2Completeness(): Promise<IC2Report> {
  console.log('🔍 Vérification de la complétude IC-2...');
  
  try {
    // Récupération de l'item IC-2
    const { data: item, error } = await supabase
      .from('edn_items_complete')
      .select('*')
      .eq('item_code', 'IC-2')
      .single();

    if (error || !item) {
      console.log('❌ Item IC-2 non trouvé');
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

    console.log(`✅ Item IC-2 trouvé: ${item.item_code} - ${item.title}`);

    // Analyse du contenu pour Rang A
    const rangAAnalysis = analyzeContentForConcepts(item, EXPECTED_IC2_RANG_A);

    // Analyse du contenu pour Rang B  
    const rangBAnalysis = analyzeContentForConcepts(item, EXPECTED_IC2_RANG_B);

    // Calcul de la complétude
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

    // Génération des recommandations
    report.recommendations = generateRecommendations(report);

    return report;

  } catch (error) {
    console.error('❌ Erreur lors de la vérification IC-2:', error);
    throw error;
  }
}
