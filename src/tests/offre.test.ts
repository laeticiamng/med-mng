import { describe, expect, it } from 'vitest';
import { ITEMS_GRATUITS, estItemGratuit, formuleDepuisParametre, normaliserCodeItem } from '@/config/offre';
import { avecSuivant, cheminInterneSur } from '@/lib/cheminSuivant';

describe('offre Med MNG', () => {
  it('liste exactement IC-1 à IC-10 comme items d\'essai', () => {
    expect(ITEMS_GRATUITS).toHaveLength(10);
    expect(ITEMS_GRATUITS[0]).toBe('IC-1');
    expect(ITEMS_GRATUITS[9]).toBe('IC-10');
  });

  it('normalise les codes item', () => {
    expect(normaliserCodeItem('ic-003')).toBe('IC-3');
    expect(normaliserCodeItem('IC-10')).toBe('IC-10');
    expect(estItemGratuit('ic-7')).toBe(true);
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
