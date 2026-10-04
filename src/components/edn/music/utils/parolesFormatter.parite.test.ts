import { describe, expect, it } from 'vitest';
import { parolesSontRedigees } from './parolesFormatter';
import { lignesNonVides, parolesRedigees } from '../../../../../supabase/functions/_shared/mm-paroles';

/**
 * Le front n'appelle `generer-paroles-item` que si les paroles enregistrées ne sont pas
 * rédigées ; le serveur rend désormais telles quelles les paroles rédigées (sans appel au
 * modèle ni réécriture). Les deux règles doivent rester identiques.
 */
const CAS: Array<[string, string[]]> = [
  ['structure [Couplet]', ['[Couplet 1]', 'otite moyenne aiguë', 'tympan bombé']],
  ['structure [Refrain] en minuscules', ['[refrain]', 'otoscopie']],
  ['ponctuation majoritaire', ['L’otite moyenne, chez l’enfant,', 'se voit à l’otoscopie.', 'tympan rouge']],
  ['mots-clés sans ponctuation', ['nbsp nbsp migraine évaluer', 'algie vasculaire face analyser', 'Diagnostic préciser']],
  ['moitié exacte ponctuée (non rédigé)', ['une ligne.', 'deux mots']],
  ['vide', []],
  ['lignes blanches seulement', ['  ', '']],
];

describe('règle « paroles rédigées » : parité front / serveur', () => {
  it.each(CAS)('%s', (_nom, lignes) => {
    expect(parolesRedigees(lignes)).toBe(parolesSontRedigees(lignes));
  });

  it('valeurs attendues', () => {
    expect(parolesRedigees(['[Couplet 1]', 'mot clé'])).toBe(true);
    expect(parolesRedigees(['nbsp migraine évaluer', 'algie vasculaire face'])).toBe(false);
    expect(parolesRedigees([])).toBe(false);
  });

  it('colonne de la base : null, valeurs non textuelles et lignes vides ignorées', () => {
    expect(lignesNonVides(null)).toEqual([]);
    expect(lignesNonVides(['a', '', '  ', 3, null, 'b'])).toEqual(['a', 'b']);
  });
});
