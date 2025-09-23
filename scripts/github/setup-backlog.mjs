#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const DEFAULT_CONFIG_PATH = 'project-management/backlog-config.json';

function readConfig(configPath) {
  const absolute = path.resolve(process.cwd(), configPath ?? DEFAULT_CONFIG_PATH);
  if (!fs.existsSync(absolute)) {
    throw new Error(`Config file not found: ${absolute}`);
  }
  const raw = fs.readFileSync(absolute, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Unable to parse JSON in ${absolute}: ${error.message}`);
  }
}

function ensureGhAvailable() {
  const result = spawnSync('gh', ['--version'], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error('GitHub CLI (gh) is required. Install it and authenticate before running this script.');
  }
}

function execGh(args, { input } = {}) {
  const result = spawnSync('gh', args, {
    encoding: 'utf8',
    stdio: input ? ['pipe', 'pipe', 'pipe'] : ['ignore', 'pipe', 'pipe'],
    input
  });
  if (result.status !== 0) {
    throw new Error(`gh ${args.join(' ')} failed: ${result.stderr.trim()}`);
  }
  return result.stdout.trim();
}

function getRepoSlug() {
  if (process.env.GITHUB_REPOSITORY) {
    return process.env.GITHUB_REPOSITORY;
  }
  return execGh(['repo', 'view', '--json', 'nameWithOwner', '--jq', '.nameWithOwner']);
}

function ensureLabels(repo, labels = []) {
  labels.forEach((label) => {
    console.log(`→ Ensuring label ${label.name}`);
    const args = ['label', 'create', label.name, '--force', '--repo', repo];
    if (label.color) {
      args.push('--color', label.color.replace('#', ''));
    }
    if (label.description) {
      args.push('--description', label.description);
    }
    execGh(args);
  });
}

function fetchExistingMilestones(repo) {
  const response = execGh(['api', `repos/${repo}/milestones?state=all&per_page=100`]);
  const milestones = JSON.parse(response);
  const map = new Map();
  milestones.forEach((milestone) => {
    map.set(milestone.title, milestone);
  });
  return map;
}

function ensureMilestones(repo, milestones = []) {
  const existing = fetchExistingMilestones(repo);
  const result = new Map();

  milestones.forEach((milestone) => {
    if (existing.has(milestone.title)) {
      const found = existing.get(milestone.title);
      console.log(`→ Milestone '${milestone.title}' already exists (#${found.number})`);
      result.set(milestone.title, found.number);
      return;
    }

    const payload = {
      title: milestone.title,
      description: milestone.description ?? '',
      due_on: milestone.due_on ?? undefined
    };
    const createdRaw = execGh([
      'api',
      `repos/${repo}/milestones`,
      '--method',
      'POST',
      '--input',
      '-'
    ], { input: JSON.stringify(payload) });
    const created = JSON.parse(createdRaw);
    console.log(`→ Created milestone '${milestone.title}' (#${created.number})`);
    result.set(milestone.title, created.number);
  });

  return result;
}

function fetchExistingIssues(repo) {
  const response = execGh(['api', `repos/${repo}/issues?state=all&per_page=100`]);
  const issues = JSON.parse(response);
  const titles = new Set();
  issues.forEach((issue) => {
    if (!issue.pull_request) {
      titles.add(issue.title);
    }
  });
  return titles;
}

function replaceEnvPlaceholders(value, missing) {
  if (typeof value !== 'string') {
    return value;
  }
  return value.replace(/\$\{([^}]+)\}/g, (_, varName) => {
    const envValue = process.env[varName];
    if (envValue === undefined || envValue === null || envValue === '') {
      missing.add(varName);
      return '';
    }
    return envValue;
  });
}

function resolveAssignees(assignees = [], missingEnv) {
  const resolved = [];
  assignees.forEach((entry) => {
    if (!entry) {
      return;
    }
    const replaced = replaceEnvPlaceholders(entry, missingEnv).trim();
    if (replaced) {
      replaced.split(',').map((assignee) => assignee.trim()).filter(Boolean).forEach((assignee) => {
        if (!resolved.includes(assignee)) {
          resolved.push(assignee);
        }
      });
    }
  });
  if (resolved.length === 0 && process.env.DEFAULT_ASSIGNEE) {
    resolved.push(process.env.DEFAULT_ASSIGNEE);
  }
  return resolved;
}

function createIssues(repo, issues, milestoneMap, existingIssues) {
  let assignedCount = 0;
  const missingEnv = new Set();

  issues.forEach((issue) => {
    if (existingIssues.has(issue.title)) {
      console.log(`→ Issue '${issue.title}' already exists, skipping.`);
      const placeholders = new Set();
      resolveAssignees(issue.assignees, placeholders);
      if (placeholders.size === 0) {
        assignedCount += 1;
      }
      return;
    }

    const milestoneNumber = milestoneMap.get(issue.milestone);
    if (!milestoneNumber) {
      throw new Error(`Milestone '${issue.milestone}' not found for issue '${issue.title}'.`);
    }

    const finalAssignees = resolveAssignees(issue.assignees, missingEnv);
    if (finalAssignees.length > 0) {
      assignedCount += 1;
    }

    const payload = {
      title: issue.title,
      body: issue.body,
      labels: issue.labels ?? [],
      milestone: milestoneNumber,
      assignees: finalAssignees
    };

    execGh([
      'api',
      `repos/${repo}/issues`,
      '--method',
      'POST',
      '--input',
      '-'
    ], { input: JSON.stringify(payload) });
    console.log(`→ Created issue '${issue.title}'`);
  });

  if (issues.length > 0) {
    const ratio = assignedCount / issues.length;
    console.log(`\nAttribution : ${assignedCount}/${issues.length} issues (${Math.round(ratio * 100)}%) disposent d'au moins un assigné.`);
    if (ratio < 0.8) {
      console.warn('⚠️  Moins de 80% des issues sont assignées. Ajoutez des variables d\'environnement (ex: DEFAULT_ASSIGNEE) pour atteindre l\'objectif.');
    }
  }

  if (missingEnv.size > 0) {
    console.warn('\nMissing environment variables detected for placeholders:');
    missingEnv.forEach((name) => console.warn(` - ${name}`));
  }
}

function main() {
  const configPath = process.argv[2] ?? DEFAULT_CONFIG_PATH;
  const config = readConfig(configPath);

  ensureGhAvailable();
  const repo = getRepoSlug();
  console.log(`Cible GitHub : ${repo}`);

  ensureLabels(repo, config.labels ?? []);
  const milestoneMap = ensureMilestones(repo, config.milestones ?? []);
  const existingIssues = fetchExistingIssues(repo);

  createIssues(repo, config.issues ?? [], milestoneMap, existingIssues);
}

try {
  main();
} catch (error) {
  console.error(`❌ ${error.message}`);
  process.exit(1);
}
