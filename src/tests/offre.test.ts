import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ITEMS_GRATUITS, estItemGratuit, formuleDepuisParametre, normaliserCodeItem } from '@/config/offre';
import { avecSuivant, cheminInterneSur } from '@/lib/cheminSuivant';

describe('offre Med MNG', () => {
  it('liste exactement IC-1 et 9 items cliniques comme items d\'essai (DC5)', () => {
    expect([...ITEMS_GRATUITS]).toEqual([
      'IC-1', 'IC-161', 'IC-154', 'IC-27', 'IC-247',
      'IC-359', 'IC-224', 'IC-340', 'IC-356', 'IC-66',
    ]);
    expect(new Set(ITEMS_GRATUITS).size).toBe(10);
    expect(ITEMS_GRATUITS[9]).toBe('IC-66');
  });

  it('ne garde pas IC-2 à IC-10, ni IC-150 (item verrouillé de référence)', () => {
    for (const code of ['ic-2', 'IC-3', 'ic-7', 'IC-10', 'ic-150']) {
      expect(estItemGratuit(code), code).toBe(false);
    }
  });

  it('la migration SQL liste exactement les mêmes items que le front', () => {
    const sql = readFileSync(resolve(process.cwd(), 'supabase/migrations/20261006020000_mm_items_essai_cliniques.sql'), 'utf8');
    const instruction = sql.split('\n').filter((l) => !l.trim().startsWith('--')).join('\n');
    const codes = [...(/SELECT ARRAY\[([^\]]+)\]/.exec(instruction)?.[1] ?? '').matchAll(/'(IC-\d+)'/g)].map((m) => m[1]);
    expect(codes).toEqual([...ITEMS_GRATUITS]);
    expect(instruction).toMatch(/IMMUTABLE/);
    expect(instruction).toMatch(/SET search_path = public/);
  });

  it('normalise les codes item', () => {
    expect(normaliserCodeItem('ic-003')).toBe('IC-3');
    expect(normaliserCodeItem('IC-10')).toBe('IC-10');
    expect(normaliserCodeItem('ic-0161')).toBe('IC-161');
    expect(estItemGratuit('ic-7')).toBe(false);
    expect(estItemGratuit('ic-161')).toBe(true);
    expect(estItemGratuit('IC-0027')).toBe(true);
    expect(estItemGratuit('IC-11')).toBe(false);
    expect(estItemGratuit('')).toBe(false);
  });

  it('reconnaît les formules, y compris les anciens liens', () => {
    expect(formuleDepuisParametre('annuel')).toBe('annuel');
    expect(formuleDepuisParametre('premium')).toBe('annuel');
    expect(formuleDepuisParametre('mensuel')).toBe('mensuel');
    expect(formuleDepuisParametre('standard')).toBeNull();
  });
});

describe('paramètre next', () => {
  it('n\'accepte que les chemins internes', () => {
    expect(cheminInterneSur('/med-mng/subscribe/annuel')).toBe('/med-mng/subscribe/annuel');
    expect(cheminInterneSur('%2Fmed-mng%2Fpricing')).toBe('/med-mng/pricing');
    expect(cheminInterneSur('https://exemple.com')).toBeNull();
    expect(cheminInterneSur('//exemple.com')).toBeNull();
    expect(cheminInterneSur('/\\exemple.com')).toBeNull();
    expect(cheminInterneSur('/javascript:alert(1)')).toBeNull();
    expect(avecSuivant('/med-mng/login', '/med-mng/subscribe/mensuel')).toBe('/med-mng/login?next=%2Fmed-mng%2Fsubscribe%2Fmensuel');
    expect(avecSuivant('/med-mng/login', 'https://x.y')).toBe('/med-mng/login');
  });
});
