import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROUTE_PATHS } from '@/config/routes';
import { SEO_CONFIG } from '@/config/seoConfig';

/**
 * Audit du 07.10.2026 : seoConfig gardait des titres et descriptions pour des
 * routes retirées (redirigées ou absentes : /store, /leaderboard, /exam-mode,
 * /chat, /karaoke…). Une entrée SEO ne doit exister que pour une route qui
 * affiche réellement une page dans App.tsx.
 */
const app = readFileSync(resolve(__dirname, '../App.tsx'), 'utf8');
const chemins = ROUTE_PATHS as Record<string, string>;

const routes = new Map<string, 'page' | 'redirection'>();
const motif = /<Route\s+path=\{?(?:ROUTE_PATHS\.(\w+)|["'`]([^"'`]+)["'`])\}?\s+element=\{([\s\S]*?)\}\s*\/>/g;
for (const m of app.matchAll(motif)) {
  const chemin = m[1] ? chemins[m[1]] : m[2];
  routes.set(chemin, /^<Navigate\b/.test(m[3].trim()) ? 'redirection' : 'page');
}

describe('seoConfig ↔ routes servies', () => {
  it('les routes de App.tsx sont bien lues', () => {
    expect(routes.get('/')).toBe('page');
    expect(routes.get(ROUTE_PATHS.leaderboard)).toBe('redirection');
  });

  it('chaque entrée SEO correspond à une page réellement servie', () => {
    const orphelines = Object.keys(SEO_CONFIG).filter((chemin) => routes.get(chemin) !== 'page');
    expect(orphelines).toEqual([]);
  });
});
