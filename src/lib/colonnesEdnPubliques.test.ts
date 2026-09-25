import { globSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  COLONNES_PREMIUM,
  COLONNES_PUBLIQUES_COMPLETE,
  COLONNES_PUBLIQUES_IMMERSIVE,
  SELECT_PUBLIC_COMPLETE,
  SELECT_PUBLIC_IMMERSIVE,
  verifierSelectionPublique,
} from './colonnesEdnPubliques';

const racine = resolve(__dirname, '../..');
const lire = (chemin: string) => readFileSync(resolve(racine, chemin), 'utf-8');

/** Colonnes du bloc `GRANT SELECT ( … ) ON public.<table> TO anon, authenticated;` */
const colonnesAccordees = (sql: string, table: string): string[] => {
  const re = new RegExp(`GRANT SELECT \\(([^)]*)\\) ON public\\.${table} TO anon, authenticated;`);
  const m = re.exec(sql);
  if (!m) throw new Error(`GRANT par colonne introuvable pour ${table}`);
  return m[1].split(',').map((c) => c.trim()).filter(Boolean);
};

/** Colonnes du bloc `REVOKE SELECT ( … ) ON public.<table> FROM …` */
const colonnesRevoquees = (sql: string, table: string): string[] => {
  const re = new RegExp(`REVOKE SELECT \\(([^)]*)\\) ON public\\.${table} FROM`);
  const m = re.exec(sql);
  if (!m) throw new Error(`REVOKE par colonne introuvable pour ${table}`);
  return m[1].split(',').map((c) => c.trim()).filter(Boolean);
};

/** Colonnes de la table d'après le type `Row` généré par Supabase. */
const colonnesDuSchema = (types: string, table: string): string[] => {
  const debut = types.indexOf(`      ${table}: {\n        Row: {`);
  if (debut < 0) throw new Error(`Table ${table} introuvable dans types.ts`);
  const fin = types.indexOf('        Insert: {', debut);
  return [...types.slice(debut, fin).matchAll(/^\s{10}(\w+):/gm)].map((m) => m[1]);
};

const trier = (liste: readonly string[]) => [...liste].sort();

describe('colonnes publiques / premium des tables edn_items_*', () => {
  const migration = lire('supabase/migrations/20260925130000_mm_contenu_premium_phase2.sql');
  const types = lire('src/integrations/supabase/types.ts');

  it('les listes SELECT_* sont exactement les tableaux de colonnes', () => {
    expect(SELECT_PUBLIC_COMPLETE).toBe(COLONNES_PUBLIQUES_COMPLETE.join(','));
    expect(SELECT_PUBLIC_IMMERSIVE).toBe(COLONNES_PUBLIQUES_IMMERSIVE.join(','));
  });

  it('aucune colonne premium n’est déclarée publique', () => {
    for (const c of COLONNES_PREMIUM) {
      expect(COLONNES_PUBLIQUES_COMPLETE).not.toContain(c);
      expect(COLONNES_PUBLIQUES_IMMERSIVE).not.toContain(c);
    }
  });

  it('le GRANT par colonne de la migration phase 2 est identique au front', () => {
    expect(trier(colonnesAccordees(migration, 'edn_items_complete'))).toEqual(trier(COLONNES_PUBLIQUES_COMPLETE));
    expect(trier(colonnesAccordees(migration, 'edn_items_immersive'))).toEqual(trier(COLONNES_PUBLIQUES_IMMERSIVE));
  });

  it('publiques + révoquées = toutes les colonnes du schéma, sans recouvrement', () => {
    for (const [table, publiques] of [
      ['edn_items_complete', COLONNES_PUBLIQUES_COMPLETE],
      ['edn_items_immersive', COLONNES_PUBLIQUES_IMMERSIVE],
    ] as const) {
      const schema = colonnesDuSchema(types, table);
      const revoquees = colonnesRevoquees(migration, table);
      expect(schema.length).toBeGreaterThan(20);
      expect(trier([...publiques, ...revoquees])).toEqual(trier(schema));
      expect(publiques.filter((c) => revoquees.includes(c))).toEqual([]);
      // Toute colonne premium présente dans la table est bien révoquée.
      for (const c of COLONNES_PREMIUM) {
        if (schema.includes(c)) expect(revoquees).toContain(c);
      }
    }
  });

  it('verifierSelectionPublique rejette * et les colonnes premium', () => {
    expect(() => verifierSelectionPublique('id,item_code,title')).not.toThrow();
    expect(() => verifierSelectionPublique('*')).toThrow(/mm_contenu_immersif_item/);
    expect(() => verifierSelectionPublique('id, paroles_rang_a')).toThrow(/paroles_rang_a/);
    expect(() => verifierSelectionPublique(SELECT_PUBLIC_COMPLETE)).not.toThrow();
    expect(() => verifierSelectionPublique(SELECT_PUBLIC_IMMERSIVE)).not.toThrow();
  });

  it('aucune requête du front ne demande * ni une colonne premium sur ces tables', () => {
    // Balayage statique des sources : chaque `.from('edn_items_…')` / URL REST
    // est suivi d'une sélection ; on refuse `*` et les colonnes premium.
    const fichiers = globSync('src/**/*.{ts,tsx}', { cwd: racine });
    const premium = new RegExp(`\\b(${COLONNES_PREMIUM.join('|')})\\b`);
    const fautes: string[] = [];
    for (const fichier of fichiers) {
      if (fichier.endsWith('.test.ts') || fichier.endsWith('.test.tsx')) continue;
      const source = lire(fichier);
      const requetes = [
        ...source.matchAll(/\.from\(\s*['"](edn_items_(?:complete|immersive))['"]\s*\)(?:\s*as\s+any\))?\s*\.select\(\s*([^)]*)\)/g),
        ...source.matchAll(/rest\/v1\/(edn_items_(?:complete|immersive))\?[^`'"]*select=([^&`'"]*)/g),
      ];
      for (const m of requetes) {
        const selection = m[2] ?? '';
        if (selection.includes('*') || premium.test(selection)) {
          fautes.push(`${fichier}: ${m[0].slice(0, 120)}`);
        }
      }
    }
    expect(fautes).toEqual([]);
  });
});
