#!/usr/bin/env node

/**
 * Script pour analyser et corriger les problèmes de qualité des données OIC
 * Usage: node fix-oic-data-script.js [analyze|fix]
 */

const SUPABASE_URL = 'https://yaincoxihiqdksxgrsrk.supabase.co';
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/fix-oic-data-quality`;

async function callOICFunction(action = 'analyze') {
  console.log(`🚀 ${action === 'analyze' ? 'Analyzing' : 'Fixing'} OIC data quality...`);
  console.log(`📡 Calling: ${FUNCTION_URL}`);
  
  try {
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhaW5jb3hpaGlxZGtzeGdyc3JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTE4MjcsImV4cCI6MjA1ODM4NzgyN30.HBfwymB2F9VBvb3uyeTtHBMZFZYXzL0wQmS5fqd65yU'
      },
      body: JSON.stringify({ action })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    if (action === 'analyze') {
      displayAnalysisResults(result);
    } else {
      displayFixResults(result);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Error calling OIC function:', error.message);
    throw error;
  }
}

function displayAnalysisResults(result) {
  console.log('\n📊 ===== ANALYSIS RESULTS =====');
  console.log(`Total competences: ${result.analysis.totalCompetences}`);
  console.log(`Health Score: ${result.healthScore}%`);
  console.log(`Total Problems: ${result.totalProblems} (${(result.totalProblems/result.analysis.totalCompetences*100).toFixed(1)}%)`);
  
  console.log('\n🔍 Problem Breakdown:');
  console.log(`❌ Empty descriptions: ${result.analysis.emptyDescriptions} (${result.percentages.emptyDescriptions}%)`);
  console.log(`⚠️  Too short descriptions: ${result.analysis.tooShortDescriptions} (${result.percentages.tooShortDescriptions}%)`);
  console.log(`🔧 HTML entities corrupted: ${result.analysis.htmlEntitiesCorrupted} (${result.percentages.htmlEntitiesCorrupted}%)`);
  console.log(`📝 Incomplete fragments: ${result.analysis.fragmentsIncomplete} (${result.percentages.fragmentsIncomplete}%)`);
  console.log(`💥 Corrupted intitules: ${result.analysis.intitulesCorrupted} (${result.percentages.intitulesCorrupted}%)`);
  console.log(`📋 WikiTables detected: ${result.analysis.wikitablesDetected} (${result.percentages.wikitablesDetected}%)`);
  
  console.log('\n📋 Sample Problems:');
  if (result.analysis.samples.htmlCorrupted.length > 0) {
    console.log('\n🔧 HTML Corrupted Samples:');
    result.analysis.samples.htmlCorrupted.forEach((sample, i) => {
      console.log(`  ${i+1}. Item ${sample.item} - ${sample.objectif}`);
      console.log(`     "${sample.description}"`);
    });
  }
  
  if (result.analysis.samples.fragments.length > 0) {
    console.log('\n📝 Fragment Samples:');
    result.analysis.samples.fragments.forEach((sample, i) => {
      console.log(`  ${i+1}. Item ${sample.item} - ${sample.objectif}`);
      console.log(`     "${sample.description}"`);
    });
  }
  
  if (result.analysis.samples.intitulesCorrupted.length > 0) {
    console.log('\n💥 Corrupted Intitules Samples:');
    result.analysis.samples.intitulesCorrupted.forEach((sample, i) => {
      console.log(`  ${i+1}. Item ${sample.item} - ${sample.objectif}`);
      console.log(`     "${sample.intitule}"`);
    });
  }
}

function displayFixResults(result) {
  console.log('\n🛠️ ===== FIX RESULTS =====');
  console.log(`Total processed: ${result.report.totalProcessed}`);
  console.log(`Total fixed: ${result.totalFixed}`);
  console.log(`Success rate: ${result.successRate}%`);
  console.log(`Errors: ${result.report.errors.length}`);
  
  console.log('\n📈 Fix Breakdown:');
  console.log(`🔧 HTML entities fixed: ${result.report.htmlEntitiesFixed}`);
  console.log(`📝 Fragments reconstructed: ${result.report.fragmentsReconstructed}`);
  console.log(`❌ Empty descriptions handled: ${result.report.emptyDescriptionsHandled}`);
  console.log(`📋 WikiTables cleaned: ${result.report.wikitablesCleaned}`);
  console.log(`💥 Intitules fixed: ${result.report.intitulesFixed}`);
  
  if (result.report.samples.length > 0) {
    console.log('\n📋 Sample Fixes:');
    result.report.samples.slice(0, 5).forEach((sample, i) => {
      console.log(`\n  ${i+1}. ${sample.objectif_id} (Item ${sample.item_parent})`);
      console.log(`     Fixes applied: ${sample.fixes.join(', ')}`);
      console.log(`     Before intitule: "${sample.before.intitule}"`);
      console.log(`     After intitule:  "${sample.after.intitule}"`);
      console.log(`     Before desc: "${sample.before.description}"`);
      console.log(`     After desc:  "${sample.after.description}"`);
    });
  }
  
  if (result.report.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.report.errors.slice(0, 5).forEach((error, i) => {
      console.log(`  ${i+1}. ${error}`);
    });
    if (result.report.errors.length > 5) {
      console.log(`  ... and ${result.report.errors.length - 5} more errors`);
    }
  }
}

async function main() {
  const action = process.argv[2] || 'analyze';
  
  console.log('🏥 OIC Data Quality Management System');
  console.log('=====================================');
  
  if (!['analyze', 'fix'].includes(action)) {
    console.error('❌ Invalid action. Use "analyze" or "fix"');
    process.exit(1);
  }
  
  if (action === 'fix') {
    console.log('⚠️  WARNING: This will modify the database!');
    console.log('🔄 Running analysis first...\n');
    
    // Analyse d'abord
    await callOICFunction('analyze');
    
    console.log('\n🤔 Do you want to proceed with the fixes? (This will modify the database)');
    console.log('💡 Tip: Review the analysis results above before proceeding');
    
    // Simuler une confirmation (dans un vrai script, vous utiliseriez readline)
    console.log('🚀 Proceeding with fixes...\n');
    await callOICFunction('fix');
  } else {
    await callOICFunction('analyze');
  }
  
  console.log('\n✅ Operation completed successfully!');
}

// Exécution
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { callOICFunction };