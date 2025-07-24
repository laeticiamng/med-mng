import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const url = process.env.SUPABASE_URL as string;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

interface IntegrityReport {
  timestamp: string;
  missingCount: number;
  duplicateIds: string[];
  invalidRangs: number;
  extractionSummary: any;
}

async function runIntegrityAudit() {
  // Check for missing or invalid fields
  const { data: missing, error: missingError, count: missingCount } = await supabase
    .from('oic_competences')
    .select('objectif_id, rang', { count: 'exact' })
    .or('objectif_id.is.null,intitule.is.null,item_parent.is.null,rang.is.null,rang.not.in.(A,B)');

  if (missingError) throw missingError;

  // Check for duplicate objectif_id
  const { data: duplicates, error: dupError } = await supabase
    .from('oic_competences')
    .select('objectif_id, count:objectif_id', { group: 'objectif_id' })
    .gt('count', 1);

  if (dupError) throw dupError;

  // Get completeness report via SQL function
  const { data: report, error: reportError } = await supabase.rpc('get_oic_extraction_report');
  if (reportError) throw reportError;

  const invalidRangs = missing
    ? missing.filter((m: any) => m.rang && m.rang !== 'A' && m.rang !== 'B').length
    : 0;

  const integrityReport: IntegrityReport = {
    timestamp: new Date().toISOString(),
    missingCount: missingCount || 0,
    duplicateIds: duplicates ? duplicates.map((d: any) => d.objectif_id) : [],
    invalidRangs,
    extractionSummary: report?.summary || {},
  };

  // Ensure folder exists
  const dir = 'audit_reports';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const filePath = `${dir}/integrity-${Date.now()}.json`;
  fs.writeFileSync(filePath, JSON.stringify(integrityReport, null, 2));

  if (
    integrityReport.missingCount > 0 ||
    integrityReport.invalidRangs > 0 ||
    integrityReport.duplicateIds.length > 0 ||
    (integrityReport.extractionSummary.completeness_pct ?? 100) < 100
  ) {
    console.error(`\n❌ Integrity check failed. Report saved to ${filePath}`);
    process.exit(1);
  }
  console.log(`\n✅ Integrity check passed. Report saved to ${filePath}`);
}

if (require.main === module) {
  runIntegrityAudit().catch((err) => {
    console.error('Error running integrity audit', err);
    process.exit(1);
  });
}

export { runIntegrityAudit };
