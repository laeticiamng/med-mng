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

  it('reste réservée aux administrateurs, au serveur et aux tâches planifiées, contrôlés avant la clé', () => {
    const cle = code.indexOf("Deno.env.get('SUNO_API_KEY')");
    expect(cle).toBeGreaterThan(0);
    expect(code.indexOf('await estTachePlanifiee(req)')).toBeGreaterThan(0);
    expect(code.indexOf('await estTachePlanifiee(req)')).toBeLessThan(cle);
    expect(
      code.indexOf('exigerAdministrateur(req, corsHeaders)')
    ).toBeGreaterThan(0);
    expect(code.indexOf('exigerAdministrateur(req, corsHeaders)')).toBeLessThan(
      cle
    );
    expect(code).toMatch(/if \(acces instanceof Response\) return acces;/);
  });

  it('jeton de tâche planifiée : format vérifié avant tout appel, vérification en base, fermé par défaut', () => {
    const garde = readFileSync(
      resolve(__dirname, '../../supabase/functions/_shared/mm-garde.ts'),
      'utf8'
    );
    const fonction = garde.slice(
      garde.indexOf('export async function estTachePlanifiee')
    );
    expect(fonction).toContain("req.headers.get('x-tache-planifiee')");
    expect(fonction.indexOf('FORMAT_JETON_TACHE.test(jeton)')).toBeLessThan(
      fonction.indexOf("rpc('f66_verifier_jeton_tache'")
    );
    expect(fonction).toMatch(/return !error && data === true;/);
    expect(fonction).toMatch(/catch \{\s*return false;/);
    expect(garde).toContain('const FORMAT_JETON_TACHE = /^[0-9a-f]{64}$/;');
  });

  it('le dernier solde réellement lu peut être resservi, signalé comme périmé', () => {
    expect(code).toContain('stale: true');
  });
});
