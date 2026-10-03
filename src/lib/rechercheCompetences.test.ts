import { describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));

import { motifRechercheCompetence, regrouperParItem } from './rechercheCompetences';

const correspond = (recherche: string, texte: string) => {
  const motif = motifRechercheCompetence(recherche);
  return motif !== null && new RegExp(motif, 'i').test(texte);
};

describe('motifRechercheCompetence', () => {
  const intitule = "Connaître les modalités du diagnostic de l'otite externe et séro-muqueuse";

  it('trouve un mot présent dans un intitulé', () => {
    expect(correspond('otoscopie', "Connaître les modalités du diagnostic d'OMA (démarche diagnostique, examen clinique dont otoscopie)")).toBe(true);
  });

  it('ignore accents, casse, tiret et apostrophe', () => {
    expect(correspond('seromuqueuse', intitule)).toBe(false); // il faut le séparateur
    expect(correspond('sero-muqueuse', intitule)).toBe(true);
    expect(correspond('Séro muqueuse', intitule)).toBe(true);
    expect(correspond("l'otite", intitule)).toBe(true);
    expect(correspond('l’otite', intitule)).toBe(true);
    expect(correspond('MODALITES', intitule)).toBe(true);
  });

  it('gère la ligature œ', () => {
    expect(correspond('coeur', 'Insuffisance du cœur')).toBe(true);
    expect(correspond('cœur', 'Insuffisance du coeur')).toBe(true);
  });

  it('refuse les recherches trop courtes et neutralise les caractères spéciaux', () => {
    expect(motifRechercheCompetence('ot')).toBeNull();
    expect(motifRechercheCompetence('  ')).toBeNull();
    expect(motifRechercheCompetence('o.*(')).toBeNull();
    const motif = motifRechercheCompetence('a.b*c(d')!;
    expect(motif).not.toMatch(/[.*()]/);
  });
});

describe('regrouperParItem', () => {
  it('regroupe par code d’item en conservant l’ordre', () => {
    const parItem = regrouperParItem([
      { itemCode: 'IC-150', objectifId: 'OIC-150-01-A', intitule: 'a' },
      { itemCode: 'IC-89', objectifId: 'OIC-089-02-A', intitule: 'b' },
      { itemCode: 'IC-150', objectifId: 'OIC-150-04-A', intitule: 'c' },
    ]);
    expect([...parItem.keys()]).toEqual(['IC-150', 'IC-89']);
    expect(parItem.get('IC-150')!.map(c => c.objectifId)).toEqual(['OIC-150-01-A', 'OIC-150-04-A']);
  });
});
