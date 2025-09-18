#!/usr/bin/env ts-node
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

type AuditStatus = 'pass' | 'warn' | 'fail';

interface AuditResult {
  check: string;
  status: AuditStatus;
  details: string;
}

const results: AuditResult[] = [];

function record(check: string, status: AuditStatus, details: string) {
  results.push({ check, status, details });
}

async function readAllSql(): Promise<string> {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const files = await fs.readdir(migrationsDir);
  const sqlFiles = files
    .filter((file) => file.endsWith('.sql'))
    .sort();

  const contents = await Promise.all(
    sqlFiles.map((file) => fs.readFile(path.join(migrationsDir, file), 'utf-8'))
  );

  return contents.join('\n');
}

async function ensureRls(sql: string) {
  const tables = [
    'med_mng_songs',
    'lyrics_segments',
    'lyrics_alignment_logs',
    'lyrics_texts',
    'lyrics_generation_jobs',
    'content_library_items',
    'content_library_collections',
    'content_library_collection_items',
    'study_notes',
    'analytics_events',
    'user_privacy_preferences',
  ];

  for (const table of tables) {
    const rlsRegex = new RegExp(
      `alter\\s+table\\s+(if\\s+exists\\s+)?public\\.${table}\\s+enable\\s+row\\s+level\\s+security`,
      'i'
    );

    if (rlsRegex.test(sql)) {
      record(`rls:${table}`, 'pass', `RLS enabled for ${table}`);
    } else {
      record(`rls:${table}`, 'fail', `Missing "enable row level security" for ${table}`);
    }
  }
}

async function ensurePolicies(sql: string) {
  const tables = [
    'med_mng_songs',
    'lyrics_segments',
    'lyrics_alignment_logs',
    'lyrics_texts',
    'lyrics_generation_jobs',
    'content_library_items',
    'content_library_collections',
    'content_library_collection_items',
    'study_notes',
  ];

  for (const table of tables) {
    const policyRegex = new RegExp(
      `create\\s+policy\\s+if\\s+not\\s+exists\\s+\"[^\"]+\"\\s+on\\s+public\\.${table}`,
      'i'
    );

    if (policyRegex.test(sql)) {
      record(`policy:${table}`, 'pass', `Idempotent policy guard detected for ${table}`);
    } else {
      record(
        `policy:${table}`,
        'warn',
        `Could not confirm IF NOT EXISTS policy guard for ${table}`
      );
    }
  }
}

async function ensureIndexes(sql: string) {
  const indexes: Array<{ name: string; description: string; optional?: boolean }> = [
    {
      name: 'content_library_collections_single_default',
      description: 'one default collection per user',
    },
    {
      name: 'idx_content_library_items_search',
      description: 'GIN search index on library items',
    },
    {
      name: 'idx_content_library_items_favorites',
      description: 'partial favourite index',
    },
    {
      name: 'idx_content_library_collection_items_library',
      description: 'library lookup index',
    },
    {
      name: 'idx_analytics_events_pseudo_time',
      description: 'analytics retention index',
    },
    {
      name: 'idx_lyrics_segments_track_start',
      description: 'lyrics playback index',
    },
  ];

  for (const { name, description, optional } of indexes) {
    const indexRegex = new RegExp(
      `create\\s+(unique\\s+)?index\\s+if\\s+not\\s+exists\\s+${name}\\b`,
      'i'
    );

    if (indexRegex.test(sql)) {
      record(`index:${name}`, 'pass', `Index present (${description})`);
    } else if (optional) {
      record(`index:${name}`, 'warn', `Optional index missing (${description})`);
    } else {
      record(`index:${name}`, 'fail', `Expected index missing (${description})`);
    }
  }
}

async function ensureSeeds() {
  const seedsDir = path.join(process.cwd(), 'supabase', 'seeds');
  const files = await fs.readdir(seedsDir);
  const seedFiles = files.filter((file) => file.endsWith('.sql'));

  const requiredChecks = [
    'database_migrations_applied',
    'rls_policies_enforced',
    'db_constraints_valid',
  ];

  for (const file of seedFiles) {
    const content = await fs.readFile(path.join(seedsDir, file), 'utf-8');

    for (const check of requiredChecks) {
      if (content.includes(`'${check}'`)) {
        record(`seed:${file}:${check}`, 'pass', `${check} present in ${file}`);
      } else {
        record(
          `seed:${file}:${check}`,
          'fail',
          `${check} missing from ${file}`
        );
      }
    }
  }
}

async function run() {
  const sql = await readAllSql();
  await ensureRls(sql);
  await ensurePolicies(sql);
  await ensureIndexes(sql);
  await ensureSeeds();

  console.table(
    results.map((result) => ({
      Check: result.check,
      Status: result.status.toUpperCase(),
      Details: result.details,
    }))
  );

  if (results.some((result) => result.status === 'fail')) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error('Unexpected error while running data integrity audit:', error);
  process.exitCode = 1;
});
