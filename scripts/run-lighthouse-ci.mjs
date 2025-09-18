import { mkdir, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const PORT = process.env.LIGHTHOUSE_PORT ?? 4173;
const HOST = process.env.LIGHTHOUSE_HOST ?? '127.0.0.1';
const BASE_URL = `http://${HOST}:${PORT}`;
const REPORT_DIR = new URL('../lighthouse', import.meta.url);

async function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.on('exit', (code) => {
      if (code === 0) {
        resolve(undefined);
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });
}

async function waitForServer(url, timeoutMs = 30_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { method: 'GET' });
      if (response.ok) {
        return;
      }
    } catch (error) {
      if (Date.now() - startedAt > timeoutMs) {
        throw error;
      }
    }
    await delay(500);
  }
  throw new Error(`Timeout waiting for ${url}`);
}

async function run() {
  await rm(REPORT_DIR, { recursive: true, force: true });
  await mkdir(REPORT_DIR, { recursive: true });

  const server = spawn('pnpm', ['preview', '--host', '0.0.0.0', '--port', String(PORT)], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  });

  try {
    await waitForServer(`${BASE_URL}/`);

    const pages = [
      '/',
      '/med-mng/dashboard',
      '/med-mng/library',
    ];

    for (const page of pages) {
      const safeName = page === '/' ? 'home' : page.replace(/[\/]+/g, '_').replace(/^_/, '');
      const reportPath = new URL(`${safeName}.html`, REPORT_DIR);
      await runCommand('npx', [
        'playwright-lighthouse',
        `${BASE_URL}${page}`,
        `--report=${reportPath.pathname}`,
        '--expectations.performance=0.85',
        '--expectations.accessibility=0.9',
        '--expectations.seo=0.9',
      ]);
    }
  } finally {
    server.kill('SIGTERM');
  }
}

run().catch((error) => {
  console.error('Lighthouse CI failed', error);
  process.exitCode = 1;
});
