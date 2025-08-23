#!/usr/bin/env node

/**
 * Supabase Functions Documentation Linter
 * 
 * Checks that each Supabase Edge Function has proper documentation:
 * - README.md file exists
 * - Required sections are present
 * - Environment variables are documented
 * - Input/output schemas are defined
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const FUNCTIONS_DIR = path.join(__dirname, '..', 'supabase', 'functions');
const LEGACY_DIR = path.join(FUNCTIONS_DIR, 'legacy');

// Required sections in function READMEs
const REQUIRED_SECTIONS = [
  'Purpose',
  'Environment Variables',
  'Input',
  'Output',
  'Usage Example'
];

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class FunctionDocsChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checkedFunctions = 0;
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  error(functionName, message) {
    this.errors.push(`${functionName}: ${message}`);
    this.log(`❌ ${functionName}: ${message}`, 'red');
  }

  warning(functionName, message) {
    this.warnings.push(`${functionName}: ${message}`);
    this.log(`⚠️  ${functionName}: ${message}`, 'yellow');
  }

  success(functionName, message) {
    this.log(`✅ ${functionName}: ${message}`, 'green');
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  /**
   * Get all function directories (excluding legacy)
   */
  getFunctionDirectories() {
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
   * Check if function has a README.md file
   */
  hasReadme(functionName) {
    const readmePath = path.join(FUNCTIONS_DIR, functionName, 'README.md');
    return fs.existsSync(readmePath);
  }

  /**
   * Read and parse function README
   */
  readFunctionReadme(functionName) {
    try {
      const readmePath = path.join(FUNCTIONS_DIR, functionName, 'README.md');
      return fs.readFileSync(readmePath, 'utf-8');
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if README contains required sections
   */
  checkRequiredSections(functionName, content) {
    const missingsections = [];
    
    REQUIRED_SECTIONS.forEach(section => {
      // Check for section headers (# or ## or ###)
      const sectionRegex = new RegExp(`^#{1,3}\\s*${section}`, 'im');
      if (!sectionRegex.test(content)) {
        missingsections.push(section);
      }
    });

    if (missingSections.length > 0) {
      this.error(functionName, `Missing required sections: ${missingSections.join(', ')}`);
    }

    return missingSections.length === 0;
  }

  /**
   * Check if environment variables are documented
   */
  checkEnvironmentVariables(functionName, content) {
    const envVarRegex = /Environment Variables?:?\s*\n([\s\S]*?)(?=\n#{1,3}|$)/i;
    const match = content.match(envVarRegex);
    
    if (!match) {
      this.warning(functionName, 'No environment variables section found');
      return false;
    }

    const envSection = match[1];
    
    // Check for common patterns indicating env vars are documented
    const hasEnvVars = /(-\s*`[A-Z_]+`|`[A-Z_]+`\s*-)/i.test(envSection);
    
    if (!hasEnvVars) {
      this.warning(functionName, 'Environment variables section exists but appears empty');
      return false;
    }

    return true;
  }

  /**
   * Check if input/output schemas are present
   */
  checkSchemas(functionName, content) {
    let hasValidSchemas = true;

    // Check for input schema
    const inputRegex = /Input:?\s*\n([\s\S]*?)(?=\n#{1,3}|Output:|$)/i;
    const inputMatch = content.match(inputRegex);
    
    if (!inputMatch || !inputMatch[1].trim()) {
      this.warning(functionName, 'Input schema not found or empty');
      hasValidSchemas = false;
    } else {
      // Check if it looks like a proper schema (has braces or type definitions)
      const inputContent = inputMatch[1];
      const hasSchema = /```|{|\w+:\s*\w+|interface\s+\w+/i.test(inputContent);
      if (!hasSchema) {
        this.warning(functionName, 'Input section exists but doesn\'t contain a schema');
      }
    }

    // Check for output schema
    const outputRegex = /Output:?\s*\n([\s\S]*?)(?=\n#{1,3}|$)/i;
    const outputMatch = content.match(outputRegex);
    
    if (!outputMatch || !outputMatch[1].trim()) {
      this.warning(functionName, 'Output schema not found or empty');
      hasValidSchemas = false;
    } else {
      // Check if it looks like a proper schema
      const outputContent = outputMatch[1];
      const hasSchema = /```|{|\w+:\s*\w+|interface\s+\w+/i.test(outputContent);
      if (!hasSchema) {
        this.warning(functionName, 'Output section exists but doesn\'t contain a schema');
      }
    }

    return hasValidSchemas;
  }

  /**
   * Check if function has usage examples
   */
  checkUsageExamples(functionName, content) {
    const exampleRegex = /(Usage Example|Example|Examples?):?\s*\n([\s\S]*?)(?=\n#{1,3}|$)/i;
    const match = content.match(exampleRegex);
    
    if (!match || !match[2].trim()) {
      this.warning(functionName, 'No usage examples found');
      return false;
    }

    // Check if examples contain code (code blocks or inline code)
    const exampleContent = match[2];
    const hasCode = /```|`[^`]+`/.test(exampleContent);
    
    if (!hasCode) {
      this.warning(functionName, 'Usage examples found but no code examples present');
      return false;
    }

    return true;
  }

  /**
   * Check if function has index.ts file
   */
  hasIndexFile(functionName) {
    const indexPath = path.join(FUNCTIONS_DIR, functionName, 'index.ts');
    return fs.existsSync(indexPath);
  }

  /**
   * Check a single function
   */
  checkFunction(functionName) {
    this.checkedFunctions++;
    
    this.info(`Checking function: ${functionName}`);

    // Check if index.ts exists
    if (!this.hasIndexFile(functionName)) {
      this.error(functionName, 'Missing index.ts file');
      return;
    }

    // Check if README exists
    if (!this.hasReadme(functionName)) {
      this.error(functionName, 'Missing README.md file');
      return;
    }

    // Read README content
    const readmeContent = this.readFunctionReadme(functionName);
    if (!readmeContent) {
      this.error(functionName, 'Cannot read README.md file');
      return;
    }

    // Check required sections
    const hasAllSections = this.checkRequiredSections(functionName, readmeContent);
    
    // Check environment variables documentation
    this.checkEnvironmentVariables(functionName, readmeContent);
    
    // Check schemas
    this.checkSchemas(functionName, readmeContent);
    
    // Check usage examples
    this.checkUsageExamples(functionName, readmeContent);

    if (hasAllSections && this.errors.filter(e => e.startsWith(functionName)).length === 0) {
      this.success(functionName, 'Documentation is complete');
    }
  }

  /**
   * Generate a minimal README template
   */
  generateReadmeTemplate(functionName) {
    return `# ${functionName}

## Purpose

Brief description of what this function does.

## Environment Variables

- \`REQUIRED_VAR\` - Description of required variable
- \`OPTIONAL_VAR\` - Description of optional variable (optional)

## Input

\`\`\`typescript
{
  // Define input schema here
}
\`\`\`

## Output

\`\`\`typescript
{
  // Define output schema here
}
\`\`\`

## Usage Example

\`\`\`typescript
const { data, error } = await supabase.functions.invoke('${functionName}', {
  body: {
    // Example input
  }
});
\`\`\`

## Error Handling

Common error responses:
- \`400\` - Bad Request: Invalid input parameters
- \`401\` - Unauthorized: Missing or invalid authentication
- \`500\` - Internal Server Error: Function execution failed

## Notes

Additional notes about the function implementation or usage.
`;
  }

  /**
   * Create missing README files
   */
  createMissingReadmes() {
    const functions = this.getFunctionDirectories();
    const functionsWithoutReadme = functions.filter(fn => !this.hasReadme(fn));

    if (functionsWithoutReadme.length === 0) {
      this.info('All functions have README files');
      return;
    }

    this.info(`Creating README templates for ${functionsWithoutReadme.length} functions`);

    functionsWithoutReadme.forEach(functionName => {
      const readmePath = path.join(FUNCTIONS_DIR, functionName, 'README.md');
      const template = this.generateReadmeTemplate(functionName);
      
      try {
        fs.writeFileSync(readmePath, template);
        this.success(functionName, 'Created README template');
      } catch (error) {
        this.error(functionName, `Failed to create README: ${error.message}`);
      }
    });
  }

  /**
   * Run the documentation check
   */
  async run() {
    this.log('🔍 Supabase Functions Documentation Checker', 'bold');
    this.log('=' .repeat(50));

    // Get all function directories
    const functions = this.getFunctionDirectories();
    
    if (functions.length === 0) {
      this.log('No functions found in supabase/functions directory', 'yellow');
      return;
    }

    this.info(`Found ${functions.length} functions to check`);
    
    // Check each function
    functions.forEach(functionName => {
      this.checkFunction(functionName);
      console.log(); // Add spacing between functions
    });

    // Print summary
    this.printSummary();
  }

  /**
   * Print summary of check results
   */
  printSummary() {
    this.log('📊 Summary', 'bold');
    this.log('-'.repeat(30));
    
    this.log(`Functions checked: ${this.checkedFunctions}`, 'blue');
    this.log(`Errors: ${this.errors.length}`, this.errors.length > 0 ? 'red' : 'green');
    this.log(`Warnings: ${this.warnings.length}`, this.warnings.length > 0 ? 'yellow' : 'green');

    if (this.errors.length > 0) {
      this.log('\n🚨 Errors found:', 'red');
      this.errors.forEach(error => {
        this.log(`  • ${error}`, 'red');
      });
    }

    if (this.warnings.length > 0) {
      this.log('\n⚠️  Warnings:', 'yellow');
      this.warnings.forEach(warning => {
        this.log(`  • ${warning}`, 'yellow');
      });
    }

    if (this.errors.length === 0 && this.warnings.length === 0) {
      this.log('\n🎉 All functions are properly documented!', 'green');
    }

    // Exit with error code if there are critical errors
    if (this.errors.length > 0) {
      process.exit(1);
    }
  }
}

// CLI Interface
const args = process.argv.slice(2);
const command = args[0];

const checker = new FunctionDocsChecker();

switch (command) {
  case '--create-templates':
    checker.createMissingReadmes();
    break;
  case '--help':
    console.log(`
Usage: node check-function-docs.js [command]

Commands:
  (none)              Run documentation check
  --create-templates  Create README templates for functions missing them
  --help             Show this help message

Examples:
  node scripts/check-function-docs.js
  node scripts/check-function-docs.js --create-templates
`);
    break;
  default:
    checker.run();
}