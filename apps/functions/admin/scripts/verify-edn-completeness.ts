/**
 * EDN Items - Competencies Completeness Verification
 *
 * This script analyzes the completeness of EDN items and their competency linkages.
 * It generates a comprehensive report with statistics, issues, and recommendations.
 *
 * Usage:
 *   npx tsx verify-edn-completeness.ts [--export-json] [--fix-mode]
 *
 * Options:
 *   --export-json  Export results to JSON file
 *   --fix-mode     Automatically apply fixes where possible
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase connection
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

interface EdnItem {
  id: string;
  item_code: string;
  title: string;
  specialite?: string;
  status: string;
  competences_oic_rang_a: string[] | null;
  competences_oic_rang_b: string[] | null;
  competences_count_rang_a: number;
  competences_count_rang_b: number;
  competences_count_total: number;
  completeness_score: number;
  tableau_rang_a?: any;
  tableau_rang_b?: any;
  quiz_questions?: any;
  scene_immersive?: any;
}

interface CompletenessReport {
  generated_at: string;
  summary: {
    total_items: number;
    items_with_rang_a: number;
    items_with_rang_b: number;
    items_without_competencies: number;
    avg_competencies_per_item: number;
    avg_completeness_score: number;
  };
  issues: {
    critical: EdnItemIssue[];
    high: EdnItemIssue[];
    medium: EdnItemIssue[];
    low: EdnItemIssue[];
  };
  distribution: {
    by_competency_count: Record<string, number>;
    by_completeness_score: Record<string, number>;
    by_specialty: Record<string, SpecialtyStats>;
  };
  recommendations: string[];
}

interface EdnItemIssue {
  item_code: string;
  title: string;
  issue_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  current_state: {
    rang_a_count: number;
    rang_b_count: number;
    total_competencies: number;
    completeness_score: number;
  };
  recommended_action: string;
}

interface SpecialtyStats {
  item_count: number;
  avg_competencies: number;
  avg_completeness: number;
  items_needing_attention: number;
}

async function fetchAllEdnItems(): Promise<EdnItem[]> {
  console.log('📥 Fetching all EDN items...');

  const { data, error } = await supabase
    .from('edn_items_complete')
    .select(`
      id,
      item_code,
      title,
      specialite,
      status,
      competences_oic_rang_a,
      competences_oic_rang_b,
      competences_count_rang_a,
      competences_count_rang_b,
      competences_count_total,
      completeness_score,
      tableau_rang_a,
      tableau_rang_b,
      quiz_questions,
      scene_immersive
    `);

  if (error) {
    throw new Error(`Failed to fetch EDN items: ${error.message}`);
  }

  console.log(`✅ Fetched ${data.length} EDN items`);
  return data as EdnItem[];
}

function analyzeCompleteness(items: EdnItem[]): CompletenessReport {
  console.log('🔍 Analyzing completeness...');

  const issues: EdnItemIssue[] = [];

  // Calculate summary stats
  const itemsWithRangA = items.filter(
    (item) => item.competences_oic_rang_a && item.competences_oic_rang_a.length > 0
  );
  const itemsWithRangB = items.filter(
    (item) => item.competences_oic_rang_b && item.competences_oic_rang_b.length > 0
  );
  const itemsWithoutComp = items.filter(
    (item) =>
      (!item.competences_oic_rang_a || item.competences_oic_rang_a.length === 0) &&
      (!item.competences_oic_rang_b || item.competences_oic_rang_b.length === 0)
  );

  const avgCompetencies =
    items.reduce((sum, item) => sum + (item.competences_count_total || 0), 0) / items.length;
  const avgCompleteness =
    items.reduce((sum, item) => sum + item.completeness_score, 0) / items.length;

  // Identify issues
  items.forEach((item) => {
    const rangACount = item.competences_oic_rang_a?.length || 0;
    const rangBCount = item.competences_oic_rang_b?.length || 0;
    const totalComp = rangACount + rangBCount;
    const hasContent =
      item.tableau_rang_a || item.tableau_rang_b || item.quiz_questions || item.scene_immersive;

    // Critical: Published item with no competencies
    if (item.status === 'published' && totalComp === 0) {
      issues.push({
        item_code: item.item_code,
        title: item.title,
        issue_type: 'no_competencies',
        severity: 'critical',
        description: 'Published item has NO competencies linked',
        current_state: {
          rang_a_count: rangACount,
          rang_b_count: rangBCount,
          total_competencies: totalComp,
          completeness_score: item.completeness_score,
        },
        recommended_action: 'Link appropriate competencies from OIC database or unpublish',
      });
    }

    // Critical: Has content but no competencies
    if (hasContent && totalComp === 0) {
      issues.push({
        item_code: item.item_code,
        title: item.title,
        issue_type: 'content_without_competencies',
        severity: 'critical',
        description: 'Item has pedagogical content but no competencies',
        current_state: {
          rang_a_count: rangACount,
          rang_b_count: rangBCount,
          total_competencies: totalComp,
          completeness_score: item.completeness_score,
        },
        recommended_action: 'Link relevant competencies based on content',
      });
    }

    // High: Very few competencies
    if (totalComp > 0 && totalComp < 5 && item.status === 'published') {
      issues.push({
        item_code: item.item_code,
        title: item.title,
        issue_type: 'insufficient_competencies',
        severity: 'high',
        description: `Only ${totalComp} competencies linked (typically 10-15 expected)`,
        current_state: {
          rang_a_count: rangACount,
          rang_b_count: rangBCount,
          total_competencies: totalComp,
          completeness_score: item.completeness_score,
        },
        recommended_action: 'Review and add more relevant competencies',
      });
    }

    // High: Imbalanced competencies
    if (rangACount > 15 && rangBCount === 0) {
      issues.push({
        item_code: item.item_code,
        title: item.title,
        issue_type: 'imbalanced_competencies',
        severity: 'high',
        description: `High Rang A (${rangACount}) but no Rang B competencies`,
        current_state: {
          rang_a_count: rangACount,
          rang_b_count: rangBCount,
          total_competencies: totalComp,
          completeness_score: item.completeness_score,
        },
        recommended_action: 'Add Rang B (advanced) competencies if appropriate',
      });
    }

    // Medium: Low completeness score
    if (item.completeness_score < 70 && item.status === 'published') {
      issues.push({
        item_code: item.item_code,
        title: item.title,
        issue_type: 'low_completeness',
        severity: 'medium',
        description: `Completeness score is ${item.completeness_score}% (below 70% threshold)`,
        current_state: {
          rang_a_count: rangACount,
          rang_b_count: rangBCount,
          total_competencies: totalComp,
          completeness_score: item.completeness_score,
        },
        recommended_action: 'Complete missing metadata and content fields',
      });
    }
  });

  // Distribution by competency count
  const competencyCountDistribution: Record<string, number> = {
    '0': 0,
    '1-5': 0,
    '6-10': 0,
    '11-15': 0,
    '16-20': 0,
    '20+': 0,
  };

  items.forEach((item) => {
    const total = item.competences_count_total || 0;
    if (total === 0) competencyCountDistribution['0']++;
    else if (total <= 5) competencyCountDistribution['1-5']++;
    else if (total <= 10) competencyCountDistribution['6-10']++;
    else if (total <= 15) competencyCountDistribution['11-15']++;
    else if (total <= 20) competencyCountDistribution['16-20']++;
    else competencyCountDistribution['20+']++;
  });

  // Distribution by completeness score
  const completenessDistribution: Record<string, number> = {
    '90-100%': 0,
    '70-89%': 0,
    '50-69%': 0,
    'Below 50%': 0,
  };

  items.forEach((item) => {
    const score = item.completeness_score;
    if (score >= 90) completenessDistribution['90-100%']++;
    else if (score >= 70) completenessDistribution['70-89%']++;
    else if (score >= 50) completenessDistribution['50-69%']++;
    else completenessDistribution['Below 50%']++;
  });

  // Stats by specialty
  const specialtyStats: Record<string, SpecialtyStats> = {};

  items.forEach((item) => {
    const specialty = item.specialite || 'Unknown';
    if (!specialtyStats[specialty]) {
      specialtyStats[specialty] = {
        item_count: 0,
        avg_competencies: 0,
        avg_completeness: 0,
        items_needing_attention: 0,
      };
    }

    specialtyStats[specialty].item_count++;
    specialtyStats[specialty].avg_competencies += item.competences_count_total || 0;
    specialtyStats[specialty].avg_completeness += item.completeness_score;

    if (
      item.completeness_score < 70 ||
      (item.competences_count_total || 0) < 5
    ) {
      specialtyStats[specialty].items_needing_attention++;
    }
  });

  // Calculate averages
  Object.keys(specialtyStats).forEach((specialty) => {
    const stats = specialtyStats[specialty];
    stats.avg_competencies /= stats.item_count;
    stats.avg_completeness /= stats.item_count;
  });

  // Generate recommendations
  const recommendations: string[] = [];

  if (itemsWithoutComp.length > 0) {
    recommendations.push(
      `⚠️  ${itemsWithoutComp.length} items have NO competencies - these should be prioritized for immediate attention`
    );
  }

  if (avgCompleteness < 80) {
    recommendations.push(
      `⚠️  Average completeness score is ${avgCompleteness.toFixed(1)}% (below 80% target) - consider running enrichment`
    );
  }

  const publishedWithIssues = issues.filter(
    (i) => i.severity === 'critical' || i.severity === 'high'
  );
  if (publishedWithIssues.length > 0) {
    recommendations.push(
      `🔴 ${publishedWithIssues.length} published items have critical/high severity issues - review priority fix list`
    );
  }

  if (avgCompetencies < 10) {
    recommendations.push(
      `📊 Average competencies per item is ${avgCompetencies.toFixed(1)} (typical is 10-15) - review competency linkages`
    );
  }

  recommendations.push(
    '💡 Use the auto-enrichment function: SELECT enrich_edn_item_metadata(item_code) to improve completeness'
  );

  recommendations.push(
    '🔍 Review imbalanced competencies - items should have both Rang A and Rang B where appropriate'
  );

  // Categorize issues by severity
  const categorizedIssues = {
    critical: issues.filter((i) => i.severity === 'critical'),
    high: issues.filter((i) => i.severity === 'high'),
    medium: issues.filter((i) => i.severity === 'medium'),
    low: issues.filter((i) => i.severity === 'low'),
  };

  return {
    generated_at: new Date().toISOString(),
    summary: {
      total_items: items.length,
      items_with_rang_a: itemsWithRangA.length,
      items_with_rang_b: itemsWithRangB.length,
      items_without_competencies: itemsWithoutComp.length,
      avg_competencies_per_item: avgCompetencies,
      avg_completeness_score: avgCompleteness,
    },
    issues: categorizedIssues,
    distribution: {
      by_competency_count: competencyCountDistribution,
      by_completeness_score: completenessDistribution,
      by_specialty: specialtyStats,
    },
    recommendations,
  };
}

function printReport(report: CompletenessReport): void {
  console.log('\n' + '='.repeat(80));
  console.log('EDN ITEMS - COMPETENCIES COMPLETENESS REPORT');
  console.log('='.repeat(80));
  console.log(`Generated: ${new Date(report.generated_at).toLocaleString()}\n`);

  // Summary
  console.log('📊 SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total EDN Items: ${report.summary.total_items}`);
  console.log(`Items with Rang A: ${report.summary.items_with_rang_a} (${((report.summary.items_with_rang_a / report.summary.total_items) * 100).toFixed(1)}%)`);
  console.log(`Items with Rang B: ${report.summary.items_with_rang_b} (${((report.summary.items_with_rang_b / report.summary.total_items) * 100).toFixed(1)}%)`);
  console.log(`Items WITHOUT competencies: ${report.summary.items_without_competencies} (${((report.summary.items_without_competencies / report.summary.total_items) * 100).toFixed(1)}%)`);
  console.log(`Average competencies/item: ${report.summary.avg_competencies_per_item.toFixed(2)}`);
  console.log(`Average completeness score: ${report.summary.avg_completeness_score.toFixed(2)}%`);

  // Issues summary
  console.log('\n🚨 ISSUES SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Critical: ${report.issues.critical.length}`);
  console.log(`High: ${report.issues.high.length}`);
  console.log(`Medium: ${report.issues.medium.length}`);
  console.log(`Low: ${report.issues.low.length}`);
  console.log(`TOTAL: ${report.issues.critical.length + report.issues.high.length + report.issues.medium.length + report.issues.low.length}`);

  // Critical issues (show all)
  if (report.issues.critical.length > 0) {
    console.log('\n🔴 CRITICAL ISSUES (Must Fix)');
    console.log('-'.repeat(80));
    report.issues.critical.forEach((issue, idx) => {
      console.log(`${idx + 1}. ${issue.item_code} - ${issue.title}`);
      console.log(`   Type: ${issue.issue_type}`);
      console.log(`   ${issue.description}`);
      console.log(`   Current: ${issue.current_state.total_competencies} competencies, ${issue.current_state.completeness_score}% complete`);
      console.log(`   Action: ${issue.recommended_action}\n`);
    });
  }

  // High priority issues (show top 10)
  if (report.issues.high.length > 0) {
    console.log('\n🟠 HIGH PRIORITY ISSUES (Top 10)');
    console.log('-'.repeat(80));
    report.issues.high.slice(0, 10).forEach((issue, idx) => {
      console.log(`${idx + 1}. ${issue.item_code} - ${issue.title}`);
      console.log(`   ${issue.description}`);
      console.log(`   Action: ${issue.recommended_action}\n`);
    });
    if (report.issues.high.length > 10) {
      console.log(`   ... and ${report.issues.high.length - 10} more high priority issues\n`);
    }
  }

  // Distributions
  console.log('\n📈 DISTRIBUTION - Competency Count');
  console.log('-'.repeat(80));
  Object.entries(report.distribution.by_competency_count).forEach(([range, count]) => {
    const percentage = ((count / report.summary.total_items) * 100).toFixed(1);
    const bar = '█'.repeat(Math.floor(parseInt(percentage) / 2));
    console.log(`${range.padEnd(10)} ${count.toString().padStart(4)} (${percentage.padStart(5)}%) ${bar}`);
  });

  console.log('\n📈 DISTRIBUTION - Completeness Score');
  console.log('-'.repeat(80));
  Object.entries(report.distribution.by_completeness_score).forEach(([range, count]) => {
    const percentage = ((count / report.summary.total_items) * 100).toFixed(1);
    const bar = '█'.repeat(Math.floor(parseInt(percentage) / 2));
    console.log(`${range.padEnd(15)} ${count.toString().padStart(4)} (${percentage.padStart(5)}%) ${bar}`);
  });

  // Top specialties
  console.log('\n🏥 TOP SPECIALTIES (by avg competencies)');
  console.log('-'.repeat(80));
  const sortedSpecialties = Object.entries(report.distribution.by_specialty)
    .sort((a, b) => b[1].avg_competencies - a[1].avg_competencies)
    .slice(0, 10);

  sortedSpecialties.forEach(([specialty, stats]) => {
    console.log(`${specialty.padEnd(30)} ${stats.item_count.toString().padStart(3)} items, avg: ${stats.avg_competencies.toFixed(1)} comp, ${stats.avg_completeness.toFixed(1)}% complete`);
  });

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS');
  console.log('-'.repeat(80));
  report.recommendations.forEach((rec, idx) => {
    console.log(`${idx + 1}. ${rec}`);
  });

  console.log('\n' + '='.repeat(80));
  console.log('Report complete. Use --export-json to save results to file.');
  console.log('='.repeat(80) + '\n');
}

async function main() {
  const args = process.argv.slice(2);
  const exportJson = args.includes('--export-json');

  try {
    // Fetch all items
    const items = await fetchAllEdnItems();

    // Analyze completeness
    const report = analyzeCompleteness(items);

    // Print report to console
    printReport(report);

    // Export to JSON if requested
    if (exportJson) {
      const outputPath = path.join(process.cwd(), 'edn-completeness-report.json');
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
      console.log(`\n✅ Report exported to: ${outputPath}`);
    }

    // Exit with error code if critical issues found
    if (report.issues.critical.length > 0) {
      console.error(`\n⚠️  ${report.issues.critical.length} critical issues found!`);
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error running completeness verification:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { analyzeCompleteness, fetchAllEdnItems, type CompletenessReport, type EdnItemIssue };
