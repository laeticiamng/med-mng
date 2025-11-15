/**
 * Post-Migration Validation Script
 *
 * Validates that all Phase 1 data completion migrations
 * have been successfully applied and data is correct.
 *
 * Usage:
 *   npm run validate-migrations
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface ValidationResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: any;
}

const results: ValidationResult[] = [];

function addResult(test: string, status: 'PASS' | 'FAIL' | 'WARN', message: string, details?: any) {
  results.push({ test, status, message, details });
}

async function validateOICSync() {
  console.log('\n🔍 Validating OIC Synchronization...');

  try {
    const { data, error } = await supabase.rpc('validate_oic_sync', {}, {
      count: 'exact'
    }).single();

    // Fallback: direct query if RPC doesn't exist
    const { data: ednData, error: ednError } = await supabase
      .from('edn_items_complete')
      .select('code_item, oic_rang_a, oic_rang_b')
      .limit(1000);

    if (ednError) {
      addResult('OIC Sync', 'FAIL', `Database error: ${ednError.message}`);
      return;
    }

    const totalItems = ednData?.length || 0;
    const itemsWithRangA = ednData?.filter(item =>
      item.oic_rang_a && Array.isArray(item.oic_rang_a) && item.oic_rang_a.length > 0
    ).length || 0;
    const itemsWithRangB = ednData?.filter(item =>
      item.oic_rang_b && Array.isArray(item.oic_rang_b) && item.oic_rang_b.length > 0
    ).length || 0;

    const pctRangA = totalItems > 0 ? (itemsWithRangA / totalItems) * 100 : 0;
    const pctRangB = totalItems > 0 ? (itemsWithRangB / totalItems) * 100 : 0;

    if (pctRangA >= 90 && pctRangB >= 90) {
      addResult(
        'OIC Sync',
        'PASS',
        `OIC competencies synced successfully`,
        { totalItems, itemsWithRangA, itemsWithRangB, pctRangA: pctRangA.toFixed(1), pctRangB: pctRangB.toFixed(1) }
      );
    } else if (pctRangA >= 70 || pctRangB >= 70) {
      addResult(
        'OIC Sync',
        'WARN',
        `OIC sync partially complete`,
        { totalItems, itemsWithRangA, itemsWithRangB, pctRangA: pctRangA.toFixed(1), pctRangB: pctRangB.toFixed(1) }
      );
    } else {
      addResult(
        'OIC Sync',
        'FAIL',
        `OIC sync incomplete - expected ≥90%, got Rang A: ${pctRangA.toFixed(1)}%, Rang B: ${pctRangB.toFixed(1)}%`,
        { totalItems, itemsWithRangA, itemsWithRangB }
      );
    }
  } catch (error) {
    addResult('OIC Sync', 'FAIL', `Validation error: ${error}`);
  }
}

async function validateQuizGeneration() {
  console.log('\n🔍 Validating Quiz Generation...');

  try {
    const { data: ednData, error } = await supabase
      .from('edn_items_complete')
      .select('code_item, quiz_questions')
      .limit(1000);

    if (error) {
      addResult('Quiz Generation', 'FAIL', `Database error: ${error.message}`);
      return;
    }

    const totalItems = ednData?.length || 0;
    const itemsWithQuiz = ednData?.filter(item =>
      item.quiz_questions && Array.isArray(item.quiz_questions) && item.quiz_questions.length >= 10
    ).length || 0;

    const totalQuestions = ednData?.reduce((sum, item) => {
      if (item.quiz_questions && Array.isArray(item.quiz_questions)) {
        return sum + item.quiz_questions.length;
      }
      return sum;
    }, 0) || 0;

    const pctWithQuiz = totalItems > 0 ? (itemsWithQuiz / totalItems) * 100 : 0;
    const avgQuestionsPerItem = itemsWithQuiz > 0 ? totalQuestions / itemsWithQuiz : 0;

    if (pctWithQuiz >= 80 && avgQuestionsPerItem >= 8) {
      addResult(
        'Quiz Generation',
        'PASS',
        `Quiz questions generated successfully`,
        {
          totalItems,
          itemsWithQuiz,
          totalQuestions,
          pctWithQuiz: pctWithQuiz.toFixed(1),
          avgQuestionsPerItem: avgQuestionsPerItem.toFixed(1)
        }
      );
    } else if (pctWithQuiz >= 50) {
      addResult(
        'Quiz Generation',
        'WARN',
        `Quiz generation partially complete`,
        {
          totalItems,
          itemsWithQuiz,
          totalQuestions,
          pctWithQuiz: pctWithQuiz.toFixed(1),
          avgQuestionsPerItem: avgQuestionsPerItem.toFixed(1)
        }
      );
    } else {
      addResult(
        'Quiz Generation',
        'FAIL',
        `Quiz generation incomplete - expected ≥80%, got ${pctWithQuiz.toFixed(1)}%`,
        { totalItems, itemsWithQuiz, totalQuestions }
      );
    }
  } catch (error) {
    addResult('Quiz Generation', 'FAIL', `Validation error: ${error}`);
  }
}

async function validateImmersiveScenes() {
  console.log('\n🔍 Validating Immersive Scenes...');

  try {
    const { data: ednData, error } = await supabase
      .from('edn_items_complete')
      .select('code_item, scene_immersive')
      .limit(1000);

    if (error) {
      addResult('Immersive Scenes', 'FAIL', `Database error: ${error.message}`);
      return;
    }

    const totalItems = ednData?.length || 0;
    const itemsWithScene = ednData?.filter(item =>
      item.scene_immersive &&
      typeof item.scene_immersive === 'object' &&
      Object.keys(item.scene_immersive).length > 0 &&
      item.scene_immersive.visual
    ).length || 0;

    const pctWithScene = totalItems > 0 ? (itemsWithScene / totalItems) * 100 : 0;

    // Calculate average scene quality
    const scenesWithQuality = ednData?.filter(item =>
      item.scene_immersive?.visual &&
      item.scene_immersive.visual.length > 100
    ) || [];
    const avgVisualLength = scenesWithQuality.length > 0
      ? scenesWithQuality.reduce((sum, item) => sum + (item.scene_immersive?.visual?.length || 0), 0) / scenesWithQuality.length
      : 0;

    if (pctWithScene >= 80 && avgVisualLength >= 200) {
      addResult(
        'Immersive Scenes',
        'PASS',
        `Immersive scenes generated successfully`,
        {
          totalItems,
          itemsWithScene,
          pctWithScene: pctWithScene.toFixed(1),
          avgVisualLength: avgVisualLength.toFixed(0)
        }
      );
    } else if (pctWithScene >= 50) {
      addResult(
        'Immersive Scenes',
        'WARN',
        `Immersive scene generation partially complete`,
        {
          totalItems,
          itemsWithScene,
          pctWithScene: pctWithScene.toFixed(1),
          avgVisualLength: avgVisualLength.toFixed(0)
        }
      );
    } else {
      addResult(
        'Immersive Scenes',
        'FAIL',
        `Scene generation incomplete - expected ≥80%, got ${pctWithScene.toFixed(1)}%`,
        { totalItems, itemsWithScene }
      );
    }
  } catch (error) {
    addResult('Immersive Scenes', 'FAIL', `Validation error: ${error}`);
  }
}

async function validateECOSCriteria() {
  console.log('\n🔍 Validating ECOS Evaluation Criteria...');

  try {
    // Check if ECOS tables exist first
    const { data: criteriaData, error: criteriaError } = await supabase
      .from('ecos_evaluation_criteria')
      .select('situation_id, criterion_name, max_points, category, is_mandatory')
      .limit(2000);

    if (criteriaError) {
      addResult('ECOS Criteria', 'FAIL', `Database error: ${criteriaError.message}`);
      return;
    }

    const { data: situationsData, error: situationsError } = await supabase
      .from('ecos_situations_uness')
      .select('id')
      .limit(100);

    if (situationsError) {
      addResult('ECOS Criteria', 'WARN', `ECOS situations table not accessible: ${situationsError.message}`);
      return;
    }

    const totalSituations = situationsData?.length || 0;
    const uniqueSituationsWithCriteria = new Set(criteriaData?.map(c => c.situation_id)).size;
    const totalCriteria = criteriaData?.length || 0;

    // Calculate total points per scenario
    const pointsBySituation = new Map<string, number>();
    criteriaData?.forEach(criterion => {
      const current = pointsBySituation.get(criterion.situation_id) || 0;
      pointsBySituation.set(criterion.situation_id, current + criterion.max_points);
    });

    const scenariosWithCorrectPoints = Array.from(pointsBySituation.values()).filter(p => p === 100).length;
    const avgCriteriaPerScenario = uniqueSituationsWithCriteria > 0
      ? totalCriteria / uniqueSituationsWithCriteria
      : 0;

    const pctScenariosWithCriteria = totalSituations > 0
      ? (uniqueSituationsWithCriteria / Math.min(totalSituations, 50)) * 100
      : 0;

    if (uniqueSituationsWithCriteria >= 30 && avgCriteriaPerScenario >= 15 && scenariosWithCorrectPoints >= 30) {
      addResult(
        'ECOS Criteria',
        'PASS',
        `ECOS evaluation criteria populated successfully`,
        {
          totalSituations,
          uniqueSituationsWithCriteria,
          totalCriteria,
          avgCriteriaPerScenario: avgCriteriaPerScenario.toFixed(1),
          scenariosWithCorrectPoints,
          pctScenariosWithCriteria: pctScenariosWithCriteria.toFixed(1)
        }
      );
    } else if (uniqueSituationsWithCriteria >= 10) {
      addResult(
        'ECOS Criteria',
        'WARN',
        `ECOS criteria partially populated`,
        {
          totalSituations,
          uniqueSituationsWithCriteria,
          totalCriteria,
          avgCriteriaPerScenario: avgCriteriaPerScenario.toFixed(1)
        }
      );
    } else {
      addResult(
        'ECOS Criteria',
        'FAIL',
        `ECOS criteria population incomplete - expected ≥30 scenarios, got ${uniqueSituationsWithCriteria}`,
        { totalSituations, uniqueSituationsWithCriteria, totalCriteria }
      );
    }
  } catch (error) {
    addResult('ECOS Criteria', 'FAIL', `Validation error: ${error}`);
  }
}

function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 MIGRATION VALIDATION REPORT');
  console.log('='.repeat(80));

  let passCount = 0;
  let warnCount = 0;
  let failCount = 0;

  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
    console.log(`\n${icon} ${result.test}: ${result.status}`);
    console.log(`   ${result.message}`);

    if (result.details) {
      console.log('   Details:', JSON.stringify(result.details, null, 2).split('\n').map(l => '   ' + l).join('\n'));
    }

    if (result.status === 'PASS') passCount++;
    else if (result.status === 'WARN') warnCount++;
    else failCount++;
  });

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ PASS: ${passCount}`);
  console.log(`⚠️  WARN: ${warnCount}`);
  console.log(`❌ FAIL: ${failCount}`);
  console.log(`Total tests: ${results.length}`);

  const successRate = results.length > 0 ? (passCount / results.length) * 100 : 0;
  console.log(`\nSuccess rate: ${successRate.toFixed(1)}%`);

  if (failCount === 0 && warnCount === 0) {
    console.log('\n🎉 All validations passed! Migrations deployed successfully.');
    console.log('🚀 Platform completeness: ~95%+ - Production ready!');
  } else if (failCount === 0) {
    console.log('\n⚠️  Some warnings detected. Review details above.');
    console.log('✅ No critical failures - platform functional.');
  } else {
    console.log('\n❌ Some validations failed. Review errors above.');
    console.log('⚠️  Migrations may not have been applied correctly.');
  }

  console.log('='.repeat(80) + '\n');

  return failCount === 0;
}

async function runValidation() {
  console.log('🔍 Starting post-migration validation...');
  console.log('This will check that all Phase 1 migrations completed successfully.\n');

  await validateOICSync();
  await validateQuizGeneration();
  await validateImmersiveScenes();
  await validateECOSCriteria();

  const success = printResults();

  process.exit(success ? 0 : 1);
}

runValidation().catch(error => {
  console.error('\n💥 Validation script failed:', error);
  process.exit(1);
});
