/**
 * Extract OIC Data from Supabase and Format for Import
 *
 * This script extracts OIC competencies from the oic_competences table
 * and formats them into a JSON file ready for import into EDN items.
 *
 * Usage:
 *   npm run extract-oic
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

interface OICCompetence {
  rang: 'A' | 'B';
  code: string;
  libelle: string;
  description?: string;
}

interface EdnItemOICData {
  item_code: string;
  oic_rang_a: OICCompetence[];
  oic_rang_b: OICCompetence[];
}

async function extractOICData() {
  console.log('🔍 Extracting OIC Data from Supabase');
  console.log('='.repeat(60));

  // Fetch all OIC competencies
  console.log('\n📖 Fetching OIC competencies...');
  const { data: oicData, error } = await supabase
    .from('oic_competences')
    .select('objectif_id, intitule, item_parent, rang, description')
    .order('item_parent', { ascending: true })
    .order('rang', { ascending: true })
    .order('ordre', { ascending: true });

  if (error) {
    console.error('❌ Error fetching OIC data:', error.message);
    process.exit(1);
  }

  if (!oicData || oicData.length === 0) {
    console.error('❌ No OIC data found in database');
    process.exit(1);
  }

  console.log(`✓ Fetched ${oicData.length} OIC competencies\n`);

  // Group by item_parent
  const itemMap = new Map<string, EdnItemOICData>();

  for (const oic of oicData) {
    // Format item code (e.g., "001" -> "IC-1")
    const itemCode = `IC-${parseInt(oic.item_parent, 10)}`;

    if (!itemMap.has(itemCode)) {
      itemMap.set(itemCode, {
        item_code: itemCode,
        oic_rang_a: [],
        oic_rang_b: []
      });
    }

    const item = itemMap.get(itemCode)!;
    const competence: OICCompetence = {
      rang: oic.rang as 'A' | 'B',
      code: oic.objectif_id,
      libelle: oic.intitule || '',
      description: oic.description || undefined
    };

    if (oic.rang === 'A') {
      item.oic_rang_a.push(competence);
    } else if (oic.rang === 'B') {
      item.oic_rang_b.push(competence);
    }
  }

  const itemsArray = Array.from(itemMap.values());

  // Statistics
  console.log('📊 Extraction Statistics:');
  console.log('='.repeat(60));
  console.log(`Total EDN items with OIC: ${itemsArray.length}`);

  const withRangA = itemsArray.filter(i => i.oic_rang_a.length > 0).length;
  const withRangB = itemsArray.filter(i => i.oic_rang_b.length > 0).length;
  const totalRangA = itemsArray.reduce((sum, i) => sum + i.oic_rang_a.length, 0);
  const totalRangB = itemsArray.reduce((sum, i) => sum + i.oic_rang_b.length, 0);

  console.log(`Items with Rang A: ${withRangA} (${totalRangA} competencies)`);
  console.log(`Items with Rang B: ${withRangB} (${totalRangB} competencies)`);
  console.log(`Total competencies: ${totalRangA + totalRangB}`);
  console.log('='.repeat(60));

  // Save to file
  const outputPath = path.join(process.cwd(), 'data', 'oic-data-extracted.json');

  // Create data directory if it doesn't exist
  const dataDir = path.dirname(outputPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(itemsArray, null, 2), 'utf-8');

  console.log(`\n✅ Data saved to: ${outputPath}`);
  console.log(`\n💡 Next step: Run import with:`);
  console.log(`   npm run import-oic -- data/oic-data-extracted.json --dry-run`);
  console.log(`   npm run import-oic -- data/oic-data-extracted.json`);

  // Show sample
  console.log(`\n📝 Sample data (first 3 items):`);
  console.log(JSON.stringify(itemsArray.slice(0, 3), null, 2));
}

// Run extraction
extractOICData()
  .then(() => {
    console.log('\n✨ Extraction completed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 Extraction failed:', err);
    process.exit(1);
  });
