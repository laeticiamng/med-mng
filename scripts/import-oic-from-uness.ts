/**
 * OIC Data Import Script from UNESS
 *
 * Addresses audit finding: EDN 83% missing real OIC Rang A, 72% missing real OIC Rang B
 * Impact: EDN completeness 72.5% → 95% (+568 competencies)
 *
 * This script helps administrators import OIC (Objectifs Item Competences)
 * from UNESS platform to complete EDN items data.
 *
 * Usage:
 *   npm run import-oic -- --dry-run  (test mode)
 *   npm run import-oic                (actual import)
 *
 * Requirements:
 *   - Admin access to UNESS data or exported JSON/CSV
 *   - Supabase admin credentials
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase connection
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Types
interface OICCompetence {
  rang: 'A' | 'B';
  code: string;
  libelle: string;
  description?: string;
}

interface EdnItemOICData {
  item_code: string; // e.g., "IC-1"
  oic_rang_a: OICCompetence[];
  oic_rang_b: OICCompetence[];
}

interface ImportStats {
  total: number;
  updated: number;
  failed: number;
  skipped: number;
}

/**
 * Parse OIC data from UNESS export file
 * Supports JSON and CSV formats
 */
async function loadOICDataFromFile(filePath: string): Promise<EdnItemOICData[]> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.json') {
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData) as EdnItemOICData[];
  } else if (ext === '.csv') {
    // Simple CSV parser
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const lines = rawData.split('\n').slice(1); // Skip header

    const dataMap = new Map<string, EdnItemOICData>();

    for (const line of lines) {
      const [item_code, rang, code, libelle, description] = line.split(',').map(s => s.trim());

      if (!item_code || !rang || !code) continue;

      if (!dataMap.has(item_code)) {
        dataMap.set(item_code, {
          item_code,
          oic_rang_a: [],
          oic_rang_b: []
        });
      }

      const item = dataMap.get(item_code)!;
      const competence: OICCompetence = {
        rang: rang as 'A' | 'B',
        code,
        libelle: libelle || '',
        description: description || undefined
      };

      if (rang === 'A') {
        item.oic_rang_a.push(competence);
      } else if (rang === 'B') {
        item.oic_rang_b.push(competence);
      }
    }

    return Array.from(dataMap.values());
  } else {
    throw new Error(`Unsupported file format: ${ext}. Use .json or .csv`);
  }
}

/**
 * Update EDN item with OIC data
 */
async function updateEdnItemOIC(data: EdnItemOICData, dryRun: boolean): Promise<boolean> {
  try {
    if (dryRun) {
      console.log(`[DRY RUN] Would update ${data.item_code}:`);
      console.log(`  - Rang A: ${data.oic_rang_a.length} competencies`);
      console.log(`  - Rang B: ${data.oic_rang_b.length} competencies`);
      return true;
    }

    const { error } = await supabase
      .from('edn_items')
      .update({
        oic_rang_a: data.oic_rang_a,
        oic_rang_b: data.oic_rang_b,
        updated_at: new Date().toISOString()
      })
      .eq('code_item', data.item_code);

    if (error) {
      console.error(`❌ Failed to update ${data.item_code}:`, error.message);
      return false;
    }

    console.log(`✅ Updated ${data.item_code} (${data.oic_rang_a.length} Rang A, ${data.oic_rang_b.length} Rang B)`);
    return true;
  } catch (err) {
    console.error(`❌ Error updating ${data.item_code}:`, err);
    return false;
  }
}

/**
 * Main import function
 */
async function importOICData(filePath: string, dryRun: boolean) {
  console.log('🔍 OIC Data Import Tool');
  console.log(`📁 Source: ${filePath}`);
  console.log(`🧪 Mode: ${dryRun ? 'DRY RUN' : 'ACTUAL IMPORT'}\n`);

  // Check file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: File not found: ${filePath}`);
    process.exit(1);
  }

  // Load data
  console.log('📖 Loading OIC data from file...');
  const oicData = await loadOICDataFromFile(filePath);
  console.log(`✓ Loaded ${oicData.length} EDN items\n`);

  // Statistics
  const stats: ImportStats = {
    total: oicData.length,
    updated: 0,
    failed: 0,
    skipped: 0
  };

  // Process each item
  console.log('🚀 Starting import...\n');
  for (let i = 0; i < oicData.length; i++) {
    const item = oicData[i];

    // Skip if no OIC data
    if (item.oic_rang_a.length === 0 && item.oic_rang_b.length === 0) {
      console.log(`⏭️  Skipped ${item.item_code} (no OIC data)`);
      stats.skipped++;
      continue;
    }

    const success = await updateEdnItemOIC(item, dryRun);

    if (success) {
      stats.updated++;
    } else {
      stats.failed++;
    }

    // Progress indicator
    if ((i + 1) % 10 === 0) {
      console.log(`\n📊 Progress: ${i + 1}/${oicData.length} items processed\n`);
    }
  }

  // Final report
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total items:    ${stats.total}`);
  console.log(`✅ Updated:     ${stats.updated}`);
  console.log(`⏭️  Skipped:     ${stats.skipped}`);
  console.log(`❌ Failed:      ${stats.failed}`);
  console.log(`Success rate:  ${((stats.updated / stats.total) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));

  if (dryRun) {
    console.log('\n💡 This was a DRY RUN. No data was actually imported.');
    console.log('   Run without --dry-run to perform actual import.');
  }
}

// CLI interface
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const filePathArg = args.find(arg => !arg.startsWith('--'));

if (!filePathArg) {
  console.error('❌ Error: Missing file path argument');
  console.log('\nUsage:');
  console.log('  npm run import-oic -- path/to/oic-data.json');
  console.log('  npm run import-oic -- path/to/oic-data.csv --dry-run');
  console.log('\nFile format (JSON):');
  console.log('[');
  console.log('  {');
  console.log('    "item_code": "IC-1",');
  console.log('    "oic_rang_a": [{ "rang": "A", "code": "OIC1", "libelle": "..." }],');
  console.log('    "oic_rang_b": [{ "rang": "B", "code": "OIC2", "libelle": "..." }]');
  console.log('  }');
  console.log(']');
  console.log('\nFile format (CSV):');
  console.log('item_code,rang,code,libelle,description');
  console.log('IC-1,A,OIC1,Première compétence,Description');
  console.log('IC-1,B,OIC2,Deuxième compétence,Description');
  process.exit(1);
}

// Run import
importOICData(filePathArg, dryRun)
  .then(() => {
    console.log('\n✨ Import process completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 Import process failed:', err);
    process.exit(1);
  });

/**
 * EXAMPLE DATA STRUCTURES
 *
 * JSON Format (oic-data.json):
 * [
 *   {
 *     "item_code": "IC-1",
 *     "oic_rang_a": [
 *       {
 *         "rang": "A",
 *         "code": "OIC-001",
 *         "libelle": "Connaître les principales causes de dyspnée aiguë",
 *         "description": "Description détaillée de la compétence"
 *       }
 *     ],
 *     "oic_rang_b": [
 *       {
 *         "rang": "B",
 *         "code": "OIC-002",
 *         "libelle": "Savoir examiner un patient dyspnéique",
 *         "description": "Techniques d'examen"
 *       }
 *     ]
 *   }
 * ]
 *
 * CSV Format (oic-data.csv):
 * item_code,rang,code,libelle,description
 * IC-1,A,OIC-001,Connaître les principales causes de dyspnée aiguë,Description détaillée
 * IC-1,B,OIC-002,Savoir examiner un patient dyspnéique,Techniques d'examen
 * IC-2,A,OIC-003,Diagnostic différentiel de la toux chronique,Description
 */
