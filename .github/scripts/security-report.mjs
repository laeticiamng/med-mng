import { readFileSync, writeFileSync } from 'node:fs';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const key = argv[i];
    if (!key.startsWith('--')) {
      continue;
    }
    const normalizedKey = key.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      args[normalizedKey] = true;
    } else {
      args[normalizedKey] = next;
      i += 1;
    }
  }
  return args;
}

function ensurePath(path) {
  if (!path) {
    throw new Error('Expected path to be provided but received empty string');
  }
  return path;
}

function parseNpmAudit(path) {
  const counts = { low: 0, moderate: 0, high: 0, critical: 0 };
  if (!path) {
    return { counts, metadata: {} };
  }
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  const metaCounts = raw?.metadata?.vulnerabilities ?? {};
  for (const key of Object.keys(counts)) {
    counts[key] = Number(metaCounts[key] ?? 0);
  }
  return { counts, metadata: raw?.metadata ?? {} };
}

function normalizeSeverity(value) {
  if (value === undefined || value === null) {
    return null;
  }
  const text = String(value).trim();
  if (!text) {
    return null;
  }
  const lower = text.toLowerCase();
  if (lower.includes('critical')) {
    return 'critical';
  }
  if (lower.includes('high')) {
    return 'high';
  }
  if (lower.includes('medium') || lower.includes('moderate')) {
    return 'moderate';
  }
  if (lower.includes('low')) {
    return 'low';
  }
  const numeric = Number.parseFloat(lower);
  if (!Number.isNaN(numeric)) {
    if (numeric >= 9) {
      return 'critical';
    }
    if (numeric >= 7) {
      return 'high';
    }
    if (numeric >= 4) {
      return 'moderate';
    }
    if (numeric > 0) {
      return 'low';
    }
  }
  return null;
}

function parseTrivySarif(path) {
  const counts = { low: 0, moderate: 0, high: 0, critical: 0 };
  if (!path) {
    return { counts, runs: [] };
  }
  const sarif = JSON.parse(readFileSync(path, 'utf8'));
  const runs = Array.isArray(sarif?.runs) ? sarif.runs : [];
  for (const run of runs) {
    const results = Array.isArray(run?.results) ? run.results : [];
    for (const result of results) {
      const props = result?.properties ?? {};
      const severity = normalizeSeverity(
        props.severity ??
          props.Severity ??
          props['severity_level'] ??
          props['SecuritySeverity'] ??
          props['security-severity'] ??
          props?.cvss?.severity ??
          props?.cvss?.baseSeverity ??
          props?.cvssV3?.baseSeverity ??
          props?.CVSSv3?.baseSeverity ??
          result.level
      );
      if (severity && severity in counts) {
        counts[severity] += 1;
      }
    }
  }
  return { counts, runs };
}

function buildTotals(...sources) {
  const totals = { low: 0, moderate: 0, high: 0, critical: 0 };
  for (const source of sources) {
    for (const key of Object.keys(totals)) {
      totals[key] += Number(source?.counts?.[key] ?? 0);
    }
  }
  return totals;
}

function createMarkdownTable(rows) {
  const header = ['| Scanner | Critical | High | Moderate | Low |', '| --- | --- | --- | --- | --- |'];
  const body = rows.map(({ name, counts }) =>
    `| ${name} | ${counts.critical} | ${counts.high} | ${counts.moderate} | ${counts.low} |`
  );
  return header.concat(body).join('\n');
}

function mergeSarifFiles(files) {
  const merged = { version: '2.1.0', runs: [] };
  for (const file of files) {
    if (!file) {
      continue;
    }
    const sarif = JSON.parse(readFileSync(file, 'utf8'));
    if (!merged.$schema && sarif.$schema) {
      merged.$schema = sarif.$schema;
    }
    if (Array.isArray(sarif?.runs)) {
      merged.runs.push(...sarif.runs);
    }
  }
  return merged;
}

const args = parseArgs(process.argv);
const npmJsonPath = args['npm-json'] ? ensurePath(args['npm-json']) : null;
const npmSarifPath = args['npm-sarif'] ? ensurePath(args['npm-sarif']) : null;
const trivySarifPath = args['trivy-sarif'] ? ensurePath(args['trivy-sarif']) : null;
const summaryPath = args.summary ? ensurePath(args.summary) : null;
const mergedSarifPath = args.merged ? ensurePath(args.merged) : null;

const npmData = parseNpmAudit(npmJsonPath);
const trivyData = parseTrivySarif(trivySarifPath);
const totals = buildTotals(npmData, trivyData);
const rows = [
  { name: 'npm audit', counts: npmData.counts },
  { name: 'Trivy (image)', counts: trivyData.counts },
  { name: '**Totals**', counts: totals },
];
const markdown = createMarkdownTable(rows);
const summary = {
  npm: npmData,
  trivy: trivyData,
  totals,
  markdown,
  blocking: totals.high + totals.critical > 0,
};

if (summaryPath) {
  writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
}

if (mergedSarifPath) {
  const merged = mergeSarifFiles([npmSarifPath, trivySarifPath]);
  writeFileSync(mergedSarifPath, JSON.stringify(merged, null, 2));
}

console.log(markdown);
if (summary.blocking && args['fail-on-high']) {
  throw new Error('High or critical vulnerabilities detected.');
}
