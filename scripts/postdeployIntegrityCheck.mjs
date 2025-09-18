#!/usr/bin/env node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

/** @typedef {'pass' | 'warn' | 'fail'} CheckStatus */

/**
 * @typedef {Object} CheckResult
 * @property {string} name
 * @property {CheckStatus} status
 * @property {string} message
 */

/** @type {CheckResult[]} */
const results = [];

/**
 * @param {string} name
 * @param {CheckStatus} status
 * @param {string} message
 */
function record(name, status, message) {
  results.push({ name, status, message });
}

async function ensureSeedFiles() {
  const seedDir = path.join(process.cwd(), 'supabase', 'seeds');
  const requiredFiles = ['development.sql', 'staging.sql', 'production.sql'];
  try {
    const stat = await fs.stat(seedDir);
    if (!stat.isDirectory()) {
      record('seed-directory', 'fail', `Expected directory at ${seedDir}`);
      return;
    }
  } catch (error) {
    record('seed-directory', 'fail', `Missing supabase/seeds directory (${error.message})`);
    return;
  }

  record('seed-directory', 'pass', 'supabase/seeds directory detected');

  const missing = [];
  for (const file of requiredFiles) {
    try {
      await fs.access(path.join(seedDir, file));
    } catch {
      missing.push(file);
    }
  }

  if (missing.length > 0) {
    record('seed-files', 'fail', `Missing environment seed files: ${missing.join(', ')}`);
    return;
  }

  const contents = await Promise.all(
    requiredFiles.map((file) => fs.readFile(path.join(seedDir, file), 'utf-8'))
  );

  const missingInsert = contents
    .map((content, index) => (!/insert\s+into\s+public\.deployment_integrity_checks/i.test(content) ? requiredFiles[index] : null))
    .filter(Boolean);

  if (missingInsert.length > 0) {
    record('seed-files', 'warn', `Seed files missing deployment_integrity_checks insert: ${missingInsert.join(', ')}`);
  } else {
    record('seed-files', 'pass', 'Environment seed files contain deployment_integrity_checks inserts');
  }
}

async function ensureMigrationGuards() {
  const migrationFile = path.join(
    process.cwd(),
    'supabase',
    'migrations',
    '20251001100000-deployment-integrity-registry.sql'
  );

  let content;
  try {
    content = await fs.readFile(migrationFile, 'utf-8');
  } catch (error) {
    record('integrity-migration', 'fail', `Missing deployment integrity migration file (${error.message})`);
    return;
  }

  record('integrity-migration', 'pass', 'Deployment integrity migration present');

  const hasRls = /deployment_integrity_checks enable row level security/i.test(content) &&
    /deployment_integrity_snapshots enable row level security/i.test(content);
  const unguardedPolicy = /create\s+policy(?![^;]*if\s+not\s+exists)/gi.test(content);

  if (hasRls) {
    record('integrity-rls', 'pass', 'Integrity tables enable Row Level Security');
  } else {
    record('integrity-rls', 'fail', 'RLS enable statements not detected for integrity tables');
  }

  if (!unguardedPolicy) {
    record('integrity-policies', 'pass', 'Policies declare IF NOT EXISTS for idempotency');
  } else {
    record('integrity-policies', 'warn', 'Found policies without IF NOT EXISTS safeguards');
  }
}

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

async function checkSupabaseConnectivity() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    record('supabase-connection', 'warn', 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY not provided; skipping live integrity sampling');
    return;
  }

  if (!isValidUrl(url)) {
    record('supabase-connection', 'fail', 'SUPABASE_URL is not a valid URL');
    return;
  }

  let createClient;
  try {
    ({ createClient } = await import('@supabase/supabase-js'));
  } catch (error) {
    record('supabase-connection', 'warn', `Supabase client unavailable (${error.message}); skipping live checks`);
    return;
  }

  const client = createClient(url, key, { auth: { persistSession: false } });

  const { data: checks, error: checksError } = await client
    .from('deployment_integrity_checks')
    .select('check_name, severity')
    .limit(10);

  if (checksError) {
    record('supabase-registry', 'fail', `Unable to read deployment_integrity_checks: ${checksError.message}`);
    return;
  }

  if (!checks || checks.length === 0) {
    record('supabase-registry', 'warn', 'No deployment_integrity_checks rows returned');
  } else {
    record('supabase-registry', 'pass', `Retrieved ${checks.length} integrity checks from Supabase`);
  }

  const { data: latest, error: latestError } = await client
    .from('deployment_integrity_latest')
    .select('environment, check_name, status')
    .limit(10);

  if (latestError) {
    record('supabase-latest-view', 'fail', `Unable to read deployment_integrity_latest: ${latestError.message}`);
    return;
  }

  record('supabase-latest-view', 'pass', `Latest integrity snapshot entries fetched: ${latest?.length ?? 0}`);
}

async function main() {
  await ensureSeedFiles();
  await ensureMigrationGuards();
  await checkSupabaseConnectivity();

  console.table(
    results.map((result) => ({
      Check: result.name,
      Status: result.status.toUpperCase(),
      Message: result.message,
    }))
  );

  if (results.some((result) => result.status === 'fail')) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Unexpected error while running integrity check:', error);
  process.exitCode = 1;
});
