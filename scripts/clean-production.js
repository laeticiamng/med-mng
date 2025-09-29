#!/usr/bin/env node

/**
 * 🧹 PRODUCTION CLEANER
 * Supprime automatiquement tous les console.logs, debugger, TODO/FIXME
 * pour un code de production propre et optimisé
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const PATTERNS_TO_CLEAN = [
  // Console statements
  /console\.(log|warn|error|info|debug|trace)\([^)]*\);?\n?/g,
  /console\.(log|warn|error|info|debug|trace)\([^)]*\)[\s]*;?/g,
  
  // Debugger statements
  /\s*debugger\s*;?\n?/g,
  
  // Development comments
  /\/\/\s*(TODO|FIXME|HACK|XXX|DEBUG|TEMP).*\n?/g,
  /\/\*\s*(TODO|FIXME|HACK|XXX|DEBUG|TEMP)[\s\S]*?\*\/\n?/g,
  
  // Empty lines after cleanup (max 2 consecutive)
  /\n{3,}/g
];

const REPLACEMENT_VALUES = [
  '', '', '', '', '', '\n\n'
];

function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let changesMade = false;

    // Apply all cleaning patterns
    PATTERNS_TO_CLEAN.forEach((pattern, index) => {
      const replacement = REPLACEMENT_VALUES[index];
      const newContent = content.replace(pattern, replacement);
      if (newContent !== content) {
        changesMade = true;
        content = newContent;
      }
    });

    // Write back only if changes were made
    if (changesMade) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Cleaned: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error cleaning ${filePath}:`, error.message);
    return false;
  }
}

function analyzeCodeQuality(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const metrics = {
      totalLines: lines.length,
      codeLines: lines.filter(line => line.trim() && !line.trim().startsWith('//')).length,
      consoleStatements: (content.match(/console\./g) || []).length,
      todoComments: (content.match(/\/\/\s*(TODO|FIXME|HACK|XXX)/g) || []).length,
      anyUsages: (content.match(/:\s*any|=.*as any/g) || []).length,
      emptyFunctions: (content.match(/\{\s*\}/g) || []).length
    };
    
    return metrics;
  } catch (error) {
    return null;
  }
}

function main() {
  console.log('🧹 Starting Production Code Cleanup...\n');
  
  const srcFiles = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*']
  });
  
  let totalFiles = 0;
  let cleanedFiles = 0;
  let totalMetrics = {
    consoleStatements: 0,
    todoComments: 0,
    anyUsages: 0,
    codeLines: 0
  };

  // Analyze before cleaning
  console.log('📊 Analyzing code quality...\n');
  
  srcFiles.forEach(file => {
    const metrics = analyzeCodeQuality(file);
    if (metrics) {
      totalMetrics.consoleStatements += metrics.consoleStatements;
      totalMetrics.todoComments += metrics.todoComments;
      totalMetrics.anyUsages += metrics.anyUsages;
      totalMetrics.codeLines += metrics.codeLines;
    }
  });

  console.log('📈 BEFORE CLEANUP:');
  console.log(`   Console statements: ${totalMetrics.consoleStatements}`);
  console.log(`   TODO/FIXME comments: ${totalMetrics.todoComments}`);
  console.log(`   'any' type usages: ${totalMetrics.anyUsages}`);
  console.log(`   Total code lines: ${totalMetrics.codeLines}`);
  console.log('');

  // Clean files
  srcFiles.forEach(file => {
    totalFiles++;
    if (cleanFile(file)) {
      cleanedFiles++;
    }
  });

  // Re-analyze after cleaning
  let cleanedMetrics = {
    consoleStatements: 0,
    todoComments: 0,
    anyUsages: 0,
    codeLines: 0
  };

  srcFiles.forEach(file => {
    const metrics = analyzeCodeQuality(file);
    if (metrics) {
      cleanedMetrics.consoleStatements += metrics.consoleStatements;
      cleanedMetrics.todoComments += metrics.todoComments;
      cleanedMetrics.anyUsages += metrics.anyUsages;
      cleanedMetrics.codeLines += metrics.codeLines;
    }
  });

  // Results
  console.log('\n🎉 CLEANUP COMPLETED!');
  console.log(`   Files processed: ${totalFiles}`);
  console.log(`   Files cleaned: ${cleanedFiles}`);
  console.log('');
  
  console.log('📈 AFTER CLEANUP:');
  console.log(`   Console statements: ${cleanedMetrics.consoleStatements} (${totalMetrics.consoleStatements - cleanedMetrics.consoleStatements} removed)`);
  console.log(`   TODO/FIXME comments: ${cleanedMetrics.todoComments} (${totalMetrics.todoComments - cleanedMetrics.todoComments} removed)`);
  console.log(`   'any' type usages: ${cleanedMetrics.anyUsages} (still need manual review)`);
  console.log('');

  // Quality Score
  const qualityScore = Math.max(0, 100 - (
    cleanedMetrics.consoleStatements * 2 +
    cleanedMetrics.todoComments * 1 +
    cleanedMetrics.anyUsages * 0.5
  ));
  
  console.log(`🏆 CODE QUALITY SCORE: ${qualityScore.toFixed(1)}/100`);
  
  if (qualityScore >= 95) {
    console.log('✨ EXCELLENT! Production ready code.');
  } else if (qualityScore >= 85) {
    console.log('👍 GOOD! Minor improvements needed.');
  } else {
    console.log('⚠️  NEEDS WORK! Consider additional cleanup.');
  }
  
  process.exit(0);
}

if (require.main === module) {
  main();
}