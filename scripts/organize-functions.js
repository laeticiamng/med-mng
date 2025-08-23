#!/usr/bin/env node

/**
 * Supabase Functions Organizer
 * 
 * Helps organize functions by:
 * - Moving deprecated/experimental functions to legacy folder
 * - Analyzing function usage and dependencies
 * - Generating reports on function status
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FUNCTIONS_DIR = path.join(__dirname, '..', 'supabase', 'functions');
const LEGACY_DIR = path.join(FUNCTIONS_DIR, 'legacy');

// Functions that should be moved to legacy
const DEPRECATED_FUNCTIONS = [
  'deno-oic-extractor',  // Replaced by oic-extraction-proven
  'test-batch-50',       // Testing function no longer needed
];

const EXPERIMENTAL_FUNCTIONS = [
  'enhanced-contextual-chat',  // Still under development
];

class FunctionOrganizer {
  constructor() {
    this.movedFunctions = [];
    this.errors = [];
  }

  log(message, color = 'reset') {
    const colors = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      reset: '\x1b[0m',
      bold: '\x1b[1m'
    };
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  /**
   * Ensure legacy directory exists
   */
  ensureLegacyDirectory() {
    if (!fs.existsSync(LEGACY_DIR)) {
      fs.mkdirSync(LEGACY_DIR, { recursive: true });
      this.log('Created legacy directory', 'green');
    }
  }

  /**
   * Move function to legacy directory
   */
  moveToLegacy(functionName, reason = 'deprecated') {
    const sourcePath = path.join(FUNCTIONS_DIR, functionName);
    const targetPath = path.join(LEGACY_DIR, functionName);

    if (!fs.existsSync(sourcePath)) {
      this.log(`Function ${functionName} not found`, 'yellow');
      return false;
    }

    if (fs.existsSync(targetPath)) {
      this.log(`Function ${functionName} already exists in legacy`, 'yellow');
      return false;
    }

    try {
      // Copy directory recursively
      this.copyDirectory(sourcePath, targetPath);
      
      // Remove original directory
      fs.rmSync(sourcePath, { recursive: true, force: true });
      
      this.movedFunctions.push({ name: functionName, reason });
      this.log(`Moved ${functionName} to legacy (${reason})`, 'green');
      return true;
    } catch (error) {
      this.errors.push(`Failed to move ${functionName}: ${error.message}`);
      this.log(`Failed to move ${functionName}: ${error.message}`, 'red');
      return false;
    }
  }

  /**
   * Copy directory recursively
   */
  copyDirectory(source, target) {
    fs.mkdirSync(target, { recursive: true });
    
    const items = fs.readdirSync(source);
    
    items.forEach(item => {
      const sourcePath = path.join(source, item);
      const targetPath = path.join(target, item);
      
      const stat = fs.statSync(sourcePath);
      
      if (stat.isDirectory()) {
        this.copyDirectory(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    });
  }

  /**
   * Get all current functions
   */
  getCurrentFunctions() {
    try {
      const items = fs.readdirSync(FUNCTIONS_DIR, { withFileTypes: true });
      return items
        .filter(item => item.isDirectory() && item.name !== 'legacy')
        .map(item => item.name);
    } catch (error) {
      this.log(`Error reading functions directory: ${error.message}`, 'red');
      return [];
    }
  }

  /**
   * Analyze function for potential issues
   */
  analyzeFunction(functionName) {
    const functionPath = path.join(FUNCTIONS_DIR, functionName);
    const indexPath = path.join(functionPath, 'index.ts');
    const readmePath = path.join(functionPath, 'README.md');
    
    const analysis = {
      name: functionName,
      hasIndex: fs.existsSync(indexPath),
      hasReadme: fs.existsSync(readmePath),
      size: 0,
      lastModified: null,
      issues: []
    };

    try {
      const stats = fs.statSync(functionPath);
      analysis.lastModified = stats.mtime;
      
      // Calculate directory size
      analysis.size = this.getDirectorySize(functionPath);
      
      // Check for common issues
      if (!analysis.hasIndex) {
        analysis.issues.push('Missing index.ts file');
      }
      
      if (!analysis.hasReadme) {
        analysis.issues.push('Missing README.md file');
      }
      
      if (analysis.size < 1000) {
        analysis.issues.push('Very small function - might be incomplete');
      }
      
      // Check if function name suggests it's a test
      if (functionName.includes('test-')) {
        analysis.issues.push('Test function - consider moving to test suite');
      }
      
      // Check for old functions (not modified in last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      if (analysis.lastModified < sixMonthsAgo) {
        analysis.issues.push('Not modified in 6+ months - might be obsolete');
      }
      
    } catch (error) {
      analysis.issues.push(`Error analyzing: ${error.message}`);
    }
    
    return analysis;
  }

  /**
   * Get directory size recursively
   */
  getDirectorySize(dirPath) {
    let size = 0;
    
    try {
      const items = fs.readdirSync(dirPath);
      
      items.forEach(item => {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          size += this.getDirectorySize(itemPath);
        } else {
          size += stats.size;
        }
      });
    } catch (error) {
      // Ignore errors
    }
    
    return size;
  }

  /**
   * Generate function report
   */
  generateReport() {
    this.log('📊 Function Analysis Report', 'bold');
    this.log('='.repeat(50));
    
    const functions = this.getCurrentFunctions();
    const analyses = functions.map(fn => this.analyzeFunction(fn));
    
    // Sort by issues count and last modified
    analyses.sort((a, b) => {
      if (a.issues.length !== b.issues.length) {
        return b.issues.length - a.issues.length;
      }
      return a.lastModified - b.lastModified;
    });
    
    this.log(`Total functions: ${functions.length}`, 'blue');
    
    const functionsWithIssues = analyses.filter(a => a.issues.length > 0);
    this.log(`Functions with issues: ${functionsWithIssues.length}`, 'yellow');
    
    if (functionsWithIssues.length > 0) {
      this.log('\n🚨 Functions with Issues:', 'red');
      functionsWithIssues.forEach(analysis => {
        this.log(`\n  ${analysis.name}:`, 'yellow');
        analysis.issues.forEach(issue => {
          this.log(`    • ${issue}`, 'red');
        });
        this.log(`    Size: ${(analysis.size / 1024).toFixed(2)} KB`, 'blue');
        this.log(`    Last modified: ${analysis.lastModified?.toLocaleDateString()}`, 'blue');
      });
    }
    
    // Suggest functions for legacy
    this.log('\n💡 Suggestions:', 'blue');
    
    const testFunctions = analyses.filter(a => a.name.startsWith('test-'));
    if (testFunctions.length > 0) {
      this.log(`  Consider moving test functions to legacy: ${testFunctions.map(f => f.name).join(', ')}`, 'yellow');
    }
    
    const oldFunctions = analyses.filter(a => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return a.lastModified < sixMonthsAgo;
    });
    
    if (oldFunctions.length > 0) {
      this.log(`  Consider reviewing old functions: ${oldFunctions.map(f => f.name).join(', ')}`, 'yellow');
    }
  }

  /**
   * Move deprecated and experimental functions to legacy
   */
  organizeToLegacy() {
    this.log('🔄 Organizing functions to legacy', 'bold');
    
    this.ensureLegacyDirectory();
    
    // Move deprecated functions
    DEPRECATED_FUNCTIONS.forEach(functionName => {
      if (this.getCurrentFunctions().includes(functionName)) {
        this.moveToLegacy(functionName, 'deprecated');
      }
    });
    
    // Move experimental functions
    EXPERIMENTAL_FUNCTIONS.forEach(functionName => {
      if (this.getCurrentFunctions().includes(functionName)) {
        this.moveToLegacy(functionName, 'experimental');
      }
    });
    
    // Summary
    if (this.movedFunctions.length > 0) {
      this.log('\n✅ Successfully moved functions:', 'green');
      this.movedFunctions.forEach(fn => {
        this.log(`  • ${fn.name} (${fn.reason})`, 'green');
      });
    } else {
      this.log('No functions needed to be moved', 'blue');
    }
    
    if (this.errors.length > 0) {
      this.log('\n❌ Errors:', 'red');
      this.errors.forEach(error => {
        this.log(`  • ${error}`, 'red');
      });
    }
  }

  /**
   * List functions by category
   */
  listFunctions() {
    this.log('📋 Functions by Category', 'bold');
    this.log('='.repeat(40));
    
    const functions = this.getCurrentFunctions();
    
    // Categorize functions
    const categories = {
      'Authentication & Security': functions.filter(f => 
        f.includes('cas') || f.includes('auth') || f.includes('security')
      ),
      'Content Extraction': functions.filter(f => 
        f.includes('extract') || f.includes('sync')
      ),
      'AI & Generation': functions.filter(f => 
        f.includes('openai') || f.includes('generate') || f.includes('chat')
      ),
      'Medical Content': functions.filter(f => 
        f.includes('med-mng') || f.includes('spotify') || f.includes('pedagogical')
      ),
      'OIC Processing': functions.filter(f => 
        f.includes('oic') || f.includes('fix-')
      ),
      'Testing': functions.filter(f => 
        f.startsWith('test-')
      ),
      'Administration': functions.filter(f => 
        f.includes('admin') || f.includes('analytics') || f.includes('audit')
      ),
      'Audio & Media': functions.filter(f => 
        f.includes('audio') || f.includes('music') || f.includes('playlist')
      ),
      'Other': []
    };
    
    // Find uncategorized functions
    const categorizedFunctions = new Set();
    Object.values(categories).forEach(categoryFunctions => {
      categoryFunctions.forEach(fn => categorizedFunctions.add(fn));
    });
    
    categories['Other'] = functions.filter(f => !categorizedFunctions.has(f));
    
    // Display categories
    Object.entries(categories).forEach(([category, categoryFunctions]) => {
      if (categoryFunctions.length > 0) {
        this.log(`\n${category} (${categoryFunctions.length}):`, 'blue');
        categoryFunctions.forEach(fn => {
          this.log(`  • ${fn}`, 'green');
        });
      }
    });
    
    this.log(`\nTotal: ${functions.length} functions`, 'bold');
  }
}

// CLI Interface
const args = process.argv.slice(2);
const command = args[0];

const organizer = new FunctionOrganizer();

switch (command) {
  case 'organize':
    organizer.organizeToLegacy();
    break;
  case 'report':
    organizer.generateReport();
    break;
  case 'list':
    organizer.listFunctions();
    break;
  case '--help':
  case 'help':
    console.log(`
Supabase Functions Organizer

Usage: node scripts/organize-functions.js [command]

Commands:
  organize    Move deprecated/experimental functions to legacy folder
  report      Generate analysis report of all functions
  list        List functions organized by category
  help        Show this help message

Examples:
  node scripts/organize-functions.js organize
  node scripts/organize-functions.js report
  node scripts/organize-functions.js list
`);
    break;
  default:
    console.log('Use --help for usage information');
    organizer.listFunctions();
}