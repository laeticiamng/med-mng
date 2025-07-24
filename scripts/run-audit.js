#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { spawnSync } from 'child_process';

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match) {
      env[match[1]] = match[2];
    }
  }
  return env;
}

function checkSecrets() {
  const exampleEnv = parseEnv(path.resolve('.env.example'));
  const realEnv = parseEnv(path.resolve('.env'));
  const missing = [];
  for (const key of Object.keys(exampleEnv)) {
    const val = realEnv[key];
    if (!val || val === exampleEnv[key] || val.trim() === '') {
      missing.push(key);
    }
  }
  return { status: missing.length === 0 ? 'ok' : 'fail', missing };
}

async function checkEndpoints() {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const endpoints = [
    { name: 'health', url: `${base}/health` },
    { name: 'api-health', url: `${base}/api/health` },
  ];
  const results = [];
  for (const ep of endpoints) {
    try {
      const res = await axios.get(ep.url, { timeout: 5000 });
      results.push({ name: ep.name, status: res.status });
    } catch (e) {
      results.push({ name: ep.name, status: 'DOWN' });
    }
  }
  const failed = results.filter(r => r.status !== 200);
  return { status: failed.length ? 'fail' : 'ok', results };
}

function checkBatchLogs() {
  const logPath = path.resolve('logs/batch.log');
  if (!fs.existsSync(logPath)) {
    return { status: 'ok', message: 'no log file' };
  }
  const lines = fs.readFileSync(logPath, 'utf8').trim().split(/\r?\n/).slice(-50);
  const hasError = lines.some(l => /error|ko/i.test(l));
  return { status: hasError ? 'fail' : 'ok' };
}

function checkDataIntegrity() {
  const res = spawnSync('pnpm', ['test'], { encoding: 'utf8' });
  return { status: res.status === 0 ? 'ok' : 'fail', output: res.stdout.split(/\r?\n/).slice(-5) };
}

function checkScripts() {
  const scriptDir = path.resolve('scripts');
  const warnings = [];
  if (!fs.existsSync(scriptDir)) return { status: 'ok', warnings };
  for (const file of fs.readdirSync(scriptDir)) {
    if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.sh')) {
      const content = fs.readFileSync(path.join(scriptDir, file), 'utf8');
      const stripped = content.replace(/(['"])(?:\\.|[^\\])*?\1/g, '');
      if (/\b(?:TODO|deprecated)\b/i.test(stripped)) {
        warnings.push(file);
      }
    }
  }
  return { status: warnings.length ? 'fail' : 'ok', warnings };
}

function writeReport(results) {
  let md = `# Audit Report - ${new Date().toISOString()}\n\n`;
  md += `## Secrets\nStatus: ${results.secrets.status}\n`;
  if (results.secrets.missing.length) {
    md += `Missing: ${results.secrets.missing.join(', ')}\n`;
  }
  md += `\n## Endpoints\n`;
  for (const ep of results.endpoints.results) {
    md += `- ${ep.name}: ${ep.status}\n`;
  }
  md += `\n## Batch Logs\nStatus: ${results.batch.status}\n`;
  md += `\n## Data Integrity\nStatus: ${results.data.status}\n`;
  md += `\n## Scripts\nStatus: ${results.scripts.status}\n`;
  if (results.scripts.warnings.length) {
    md += `Warning in: ${results.scripts.warnings.join(', ')}\n`;
  }
  fs.writeFileSync('audit-report.md', md);
}

async function run() {
  const secrets = checkSecrets();
  const endpoints = await checkEndpoints();
  const batch = checkBatchLogs();
  const data = checkDataIntegrity();
  const scripts = checkScripts();

  const results = { secrets, endpoints, batch, data, scripts };
  writeReport(results);

  const anyFail = Object.values(results).some(r => r.status === 'fail');
  console.log(anyFail ? 'Some checks failed. See audit-report.md' : 'Audit passed.');
}

run().catch(e => {
  console.error('Unexpected error', e);
  process.exit(1);
});
