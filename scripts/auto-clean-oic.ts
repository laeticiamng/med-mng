#!/usr/bin/env ts-node

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ALERT_EMAIL = process.env.ALERT_EMAIL || 'admin@example.com';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/fix-oic-data-quality`;

async function callFunction(action: 'analyze' | 'fix') {
  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ action }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  return res.json();
}

async function sendAlert(subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skip alert');
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'med-mng@alerts.local',
      to: [ALERT_EMAIL],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    console.error('Failed to send alert email', await res.text());
  }
}

async function main() {
  const analysis = await callFunction('analyze');
  const ratio = analysis.totalProblems / analysis.analysis.totalCompetences;

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  mkdirSync('logs', { recursive: true });
  writeFileSync(
    join('logs', `oic-analysis-${ts}.json`),
    JSON.stringify(analysis, null, 2)
  );

  if (ratio > 0.02) {
    await sendAlert(
      'OIC Data Quality Alert',
      `<p>${(ratio * 100).toFixed(2)}% of OIC data is corrupted after extraction.</p>`
    );
    const fix = await callFunction('fix');
    writeFileSync(
      join('logs', `oic-fix-${ts}.json`),
      JSON.stringify(fix, null, 2)
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

