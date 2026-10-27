/**
 * suno-credits : lecture du vrai solde, aucun solde inventé (supabase/functions/suno-credits/index.ts).
 * Tests déterministes sur le code source : aucun réseau.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  resolve(__dirname, '../../supabase/functions/suno-credits/index.ts'),
  'utf8'
);
const code = source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

describe('suno-credits', () => {
  it('lit le solde par le module partagé (point d’entrée /generate/credit), pas par /get-credits (404)', () => {
    expect(code).toContain("from '../_shared/mm-suno-solde.ts'");
    expect(code).toContain('lireSoldeSuno(');
    expect(code).not.toContain('get-credits');
  });

  it('n’invente aucun solde : plus de repli « demo » ni « fallback », plus de plan, de total ni d’utilisé fictifs', () => {
    expect(code).not.toMatch(/fallback/i);
    expect(code).not.toMatch(/plan\s*:/);
    expect(code).not.toMatch(/\btotal\s*:/);
    expect(code).not.toMatch(/\bused\s*:/);
    expect(code).not.toMatch(/credits:\s*(10|50)\b/);
  });

  it('refuse proprement : 503 sans clé, 502 si le fournisseur est illisible', () => {
    expect(code).toMatch(/reponse\(503,[^)]*CLE_ABSENTE/);
    expect(code).toMatch(/reponse\(502,[^)]*SOLDE_ILLISIBLE/);
  });

  it('reste réservée aux administrateurs et au serveur', () => {
    expect(code).toContain('exigerAdministrateur(req, corsHeaders)');
    expect(code.indexOf('exigerAdministrateur')).toBeLessThan(
      code.indexOf('SUNO_API_KEY')
    );
  });

  it('le dernier solde réellement lu peut être resservi, signalé comme périmé', () => {
    expect(code).toContain('stale: true');
  });
});
